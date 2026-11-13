import { createVerify, generateKeyPairSync } from 'node:crypto'
import { expect, it, vi } from 'vitest'
import { googleSheetLocation } from '@/lib/google-sheet-url'
import { readGoogleSheet } from '@/lib/google-sheet-source'
import { previewSchedule } from '@/lib/schedule-import'
import { reconcileSheetSchedule } from '@/lib/schedule-sheet-endpoint'
import type { Session } from '@/payload-types'

const url = 'https://docs.google.com/spreadsheets/d/12345678901234567890/edit#gid=42'
const event = { days: [{ date: '2026-11-14T00:00:00Z', title: 'Conference' }] }

it('rejects non-Google URLs, embedded credentials and invalid tabs before requesting anything', async () => {
  const fetcher = vi.fn()
  for (const value of [
    'http://localhost/test',
    'https://docs.google.com.evil.test/spreadsheets/d/12345678901234567890/edit',
    url.replace('docs.google.com', 'user@docs.google.com'),
    url.replace('gid=42', 'gid=bad'),
  ]) {
    expect(() => googleSheetLocation(value)).toThrow()
    await expect(readGoogleSheet(value, { fetcher })).rejects.toThrow()
  }
  expect(fetcher).not.toHaveBeenCalled()
  expect(googleSheetLocation(url)).toEqual({ id: '12345678901234567890', gid: 42 })
  expect(googleSheetLocation(url.replace('/d/', '/u/0/d/'))).toEqual({
    id: '12345678901234567890',
    gid: 42,
  })
})

it('signs a read-only service account request and reads only the selected tab within its bounds', async () => {
  const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 })
  const credentials = JSON.stringify({
    client_email: 'agenda@example.iam.gserviceaccount.com',
    private_key: privateKey.export({ type: 'pkcs8', format: 'pem' }),
  })
  const fetcher = vi.fn<typeof fetch>().mockImplementation(async (target, init) => {
    const endpoint = String(target)
    if (endpoint === 'https://oauth2.googleapis.com/token') {
      const assertion = new URLSearchParams(String(init?.body)).get('assertion')!
      const [header, payload, signature] = assertion.split('.')
      expect(
        createVerify('RSA-SHA256')
          .update(`${header}.${payload}`)
          .verify(publicKey, signature, 'base64url'),
      ).toBe(true)
      expect(JSON.parse(Buffer.from(payload, 'base64url').toString())).toMatchObject({
        scope: 'https://www.googleapis.com/auth/spreadsheets.readonly',
        iss: 'agenda@example.iam.gserviceaccount.com',
      })
      return Response.json({ access_token: 'test-token', expires_in: 3600 })
    }
    expect(init?.headers).toEqual({ Authorization: 'Bearer test-token' })
    expect(init?.redirect).toBe('error')
    if (endpoint.includes('/values/')) {
      expect(decodeURIComponent(endpoint)).toContain("'Agenda''s tab'!A1:H70")
      return Response.json({
        values: [
          ['title', 'date', 'start_time', 'end_time'],
          ['Example', '2026-11-14', '09:00', '10:00'],
        ],
      })
    }
    return Response.json({
      properties: { title: 'Event source' },
      sheets: [
        { properties: { sheetId: 0, title: 'Other', sheetType: 'GRID' } },
        {
          properties: {
            sheetId: 42,
            title: "Agenda's tab",
            sheetType: 'GRID',
            gridProperties: { rowCount: 70, columnCount: 8 },
          },
        },
      ],
    })
  })
  const result = await readGoogleSheet(url, { credentials, fetcher })
  expect(result.tab).toBe("Agenda's tab")
  expect((await previewSchedule(result.csv, 'sheet.csv', event)).rows[0].title).toBe('Example')
  await readGoogleSheet(url, { credentials, fetcher })
  expect(
    fetcher.mock.calls.filter(([target]) => target === 'https://oauth2.googleapis.com/token'),
  ).toHaveLength(1)
})

it('parses current agenda credits and lunch batches, then retains existing IDs across time and room edits', async () => {
  const csv = Buffer.from(
    'Time,Activity,Details,Speakers,Duration,Content Track/Theme,Where?\n12:55 - 1:40 pm,Hands-On Codelab,Agents,"Alice Example, Bob Example",45 mins,Cloud,New room\n4:15 - 4:25 pm,Session,Launch,Partner - Carol Example,10 mins,Web,Main\n10:45 - 11:25 am,Technical Keynote,AI,"Dana Example, RPh, PhD & Erin Example",40 mins,Keynote,Main\n\nLunch Batches\nBlue,12:30 - 12:50 PM\nYellow,12:50 - 1:15 PM\nRed,1:15 - 1:40 PM\nGreen,1:40 - 2:00 PM',
  )
  const preview = await previewSchedule(csv, 'sheet.csv', event)
  expect(preview.errors).toEqual([])
  expect(preview.rows[0].speakerNames).toEqual(['Alice Example', 'Bob Example'])
  expect(preview.rows[1].speakerNames).toEqual(['Carol Example'])
  expect(preview.rows[2].speakerNames).toEqual(['Dana Example, RPh, PhD', 'Erin Example'])
  expect(preview.rows[3]).toMatchObject({
    title: 'Lunch · staggered batches',
    startsAt: '2026-11-14T09:30:00.000Z',
    endsAt: '2026-11-14T11:00:00.000Z',
  })
  const existing = [
    { id: 10, title: 'Agents', room: 'Old room', importKey: 'stable-agents', _status: 'published' },
    {
      id: 22,
      title: 'Lunch · staggered batches',
      room: 'Dining Hall',
      importKey: 'stable-lunch',
      _status: 'published',
    },
  ] as Session[]
  reconcileSheetSchedule(preview, existing)
  expect(preview.rows[0]).toMatchObject({ importKey: 'stable-agents', room: 'New room' })
  expect(preview.rows[3]).toMatchObject({ importKey: 'stable-lunch', room: 'Dining Hall' })
})

it('blocks ambiguous renames without stable IDs instead of duplicating existing sessions', async () => {
  const preview = await previewSchedule(
    Buffer.from('title,date,start_time,end_time,room\nRenamed,2026-11-14,09:00,10:00,A'),
    'sheet.csv',
    event,
  )
  reconcileSheetSchedule(preview, [
    { id: 1, title: 'Original', importKey: 'keep', _status: 'published' } as Session,
  ])
  expect(preview.errors.some((e) => e.message.includes('stable Session IDs'))).toBe(true)
})

it('rechecks overlaps after retaining an existing lunch location', async () => {
  const preview = await previewSchedule(
    Buffer.from(
      'session_id,title,date,start_time,end_time,track,room\nlunch,Lunch,2026-11-14,12:30,14:00,Break,\nlab,Lab,2026-11-14,13:00,13:30,Web,Dining Hall',
    ),
    'sheet.csv',
    event,
  )
  expect(preview.errors).toEqual([])
  reconcileSheetSchedule(preview, [
    {
      id: 22,
      title: 'Lunch',
      importKey: 'lunch',
      room: 'Dining Hall',
      _status: 'published',
    } as Session,
  ])
  expect(preview.errors.some((e) => e.message.includes('Overlaps'))).toBe(true)
})

it('matches transition slots before derived IDs that belonged to old timetable times', async () => {
  const preview = await previewSchedule(
    Buffer.from(
      'title,date,start_time,end_time,room\nTransition,2026-11-14,12:50,12:55,All rooms\nTransition,2026-11-14,14:30,14:35,All rooms',
    ),
    'sheet.csv',
    event,
  )
  const earlierKey = preview.rows[0].importKey
  reconcileSheetSchedule(preview, [
    {
      id: 7,
      title: 'Transition',
      startsAt: preview.rows[0].startsAt,
      room: 'All rooms',
      importKey: 'first-transition',
      _status: 'published',
    },
    {
      id: 19,
      title: 'Transition',
      startsAt: preview.rows[1].startsAt,
      room: 'All rooms',
      importKey: earlierKey,
      _status: 'published',
    },
  ] as Session[])
  expect(preview.errors).toEqual([])
  expect(preview.rows.map((row) => row.importKey)).toEqual(['first-transition', earlierKey])
})
