import { randomUUID } from 'node:crypto'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { createLocalReq, getPayload, type Payload } from 'payload'
import config from '@/payload.config'
import { sheetScheduleEndpoint } from '@/lib/schedule-sheet-endpoint'
import { readGoogleSheet } from '@/lib/google-sheet-source'
import type { User } from '@/payload-types'

vi.mock('@/lib/google-sheet-source', () => ({ readGoogleSheet: vi.fn() }))

describe.skipIf(process.env.RUN_DATABASE_TESTS !== 'true')('Manual Google Sheet sync', () => {
  let payload: Payload, eventID: number, userID: number, sessionID: number
  const key = randomUUID(),
    alias = `Alias Person ${key}`
  const speakerIDs: number[] = []
  let csv = ''
  let user: User
  const sourceURL = 'https://docs.google.com/spreadsheets/d/12345678901234567890/edit?gid=0'
  const request = async (body: object, authenticated = true, origin = 'http://localhost:47173') => {
    const req = await createLocalReq({ user: authenticated ? user : undefined }, payload)
    Object.assign(req, {
      url: `http://localhost:47173/api/community-events/${eventID}/schedule-sheet`,
      routeParams: { id: String(eventID) },
      headers: new Headers({ origin }),
      json: async () => body,
    })
    return sheetScheduleEndpoint.handler(req)
  }
  const readEvent = () =>
    payload.findByID({ collection: 'community-events', id: eventID, depth: 0, draft: false })
  beforeAll(async () => {
    payload = await getPayload({ config })
    user = await payload.create({
      collection: 'users',
      data: {
        email: `sheet-${key}@example.test`,
        password: 'test-password',
        role: 'editor',
        name: 'Sheet test editor',
      },
    })
    userID = Number(user.id)
    const event = await payload.create({
      collection: 'community-events',
      data: {
        localTitle: `Sheet event ${key}`,
        slug: `sheet-event-${key}`,
        source: 'manual',
        eventKind: 'community',
        showOnSite: true,
        days: [
          {
            title: 'Confirmed conference',
            date: '2027-02-01T00:00:00Z',
            venueName: 'Confirmed venue',
          },
        ],
        scheduleSheetURL: sourceURL,
        scheduleNotice: 'Keep this notice',
        registrationStatus: 'closed',
        scheduleMode: 'multi',
        _status: 'published',
      },
    })
    eventID = event.id
    const speaker = await payload.create({
      collection: 'speakers',
      data: {
        name: `Canonical Person ${key}`,
        slug: `sheet-person-${key}`,
        importAliases: [alias],
        company: 'Existing organisation',
        _status: 'published',
      },
    })
    speakerIDs.push(speaker.id)
    const session = await payload.create({
      collection: 'sessions',
      data: {
        event: event.id,
        title: 'Original session',
        slug: `sheet-session-${key}`,
        importKey: 'stable-existing',
        startsAt: '2027-02-01T06:00:00Z',
        endsAt: '2027-02-01T07:00:00Z',
        room: 'Original room',
        track: 'open',
        format: 'talk',
        speakers: [speaker.id],
        publicNote: 'Keep this attendee note',
        _status: 'published',
      },
    })
    sessionID = session.id
    await payload.create({
      collection: 'sessions',
      data: {
        event: eventID,
        title: 'Manual lunch',
        slug: `manual-lunch-${key}`,
        startsAt: '2027-02-01T09:00:00Z',
        endsAt: '2027-02-01T09:30:00Z',
        room: 'Dining Hall',
        track: 'open',
        format: 'break',
        _status: 'published',
      },
    })
    csv = `session_id,title,date,start_time,end_time,room,speakers,venue_name\nstable-existing,Updated session,2027-02-01,10:00,11:00,New room,${alias},Do not replace the venue\nmanual-lunch,Manual lunch,2027-02-01,12:00,12:30,Dining Hall,,`
    vi.mocked(readGoogleSheet).mockImplementation(async () => ({
      csv: Buffer.from(csv),
      title: 'Private agenda',
      tab: 'Agenda',
    }))
  })
  afterAll(async () => {
    if (eventID) {
      await payload.delete({ collection: 'sessions', where: { event: { equals: eventID } } })
      await payload.delete({ collection: 'community-events', id: eventID })
    }
    if (speakerIDs.length)
      await payload.delete({ collection: 'speakers', where: { id: { in: speakerIDs } } })
    if (userID) await payload.delete({ collection: 'users', id: userID })
  })
  it('previews without writing, rejects stale previews, and publishes only sessions without changing the event', async () => {
    expect((await request({}, false)).status).toBe(403)
    expect((await request({}, true, 'https://unrelated.example')).status).toBe(403)
    const publicEvent = await payload.findByID({
      collection: 'community-events',
      id: eventID,
      overrideAccess: false,
      depth: 0,
    })
    expect(publicEvent.scheduleSheetURL).toBeUndefined()
    const before = await readEvent()
    const versionsBefore = (
      await payload.findVersions({
        collection: 'community-events',
        where: { parent: { equals: eventID } },
        pagination: false,
      })
    ).totalDocs
    const previewResponse = await request({})
    expect(previewResponse.status).toBe(200)
    const preview = await previewResponse.json()
    expect(preview.rows[0]).toMatchObject({
      importKey: 'stable-existing',
      title: 'Updated session',
    })
    expect(preview.days[0].venueName).toBe('Confirmed venue')
    expect((await payload.findByID({ collection: 'sessions', id: sessionID })).title).toBe(
      'Original session',
    )
    csv += '\n'
    expect(
      (await request({ confirm: true, publish: true, previewHash: preview.previewHash })).status,
    ).toBe(409)
    const fresh = await (await request({})).json()
    const saved = await request({ confirm: true, publish: true, previewHash: fresh.previewHash })
    expect(saved.status).toBe(200)
    expect(await saved.json()).toMatchObject({ created: 0, updated: 2 })
    const session = await payload.findByID({ collection: 'sessions', id: sessionID, depth: 0 })
    expect(session).toMatchObject({
      title: 'Updated session',
      room: 'New room',
      importKey: 'stable-existing',
      speakers: speakerIDs,
      publicNote: 'Keep this attendee note',
    })
    expect(await readEvent()).toEqual(before)
    expect(
      (
        await payload.findVersions({
          collection: 'community-events',
          where: { parent: { equals: eventID } },
          pagination: false,
        })
      ).totalDocs,
    ).toBe(versionsBefore)
    const repeat = await (await request({})).json()
    expect(repeat.changes).toMatchObject({ created: 0, updated: 2, missing: [] })
    csv = csv.replace('2027-02-01', '2027-02-02')
    const invalid = await request({})
    expect(invalid.status).toBe(422)
    expect(
      (await invalid.json()).errors.some((error: { message: string }) =>
        error.message.includes('outside the saved event days'),
      ),
    ).toBe(true)
    expect(await readEvent()).toEqual(before)
    csv = csv.replace('2027-02-02', '2027-02-01')
    const draftImport = await request({
      confirm: true,
      publish: false,
      previewHash: repeat.previewHash,
    })
    expect(draftImport.status).toBe(200)
    expect(await readEvent()).toEqual(before)
    const pending = await request({})
    expect(pending.status).toBe(422)
    expect(
      (await pending.json()).errors.some((error: { message: string }) =>
        error.message.includes('pending drafts'),
      ),
    ).toBe(true)
    expect(
      (await payload.count({ collection: 'sessions', where: { event: { equals: eventID } } }))
        .totalDocs,
    ).toBe(2)
    expect(await readEvent()).toEqual(before)
  })
})
