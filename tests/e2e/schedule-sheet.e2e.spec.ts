import { test, expect } from '@playwright/test'
import { randomUUID } from 'node:crypto'
import { getPayload } from 'payload'
import config from '../../src/payload.config'
import { previewSchedule } from '../../src/lib/schedule-import'

const origin = 'http://localhost:3000'

test('organisers can set up a private sheet, preview, and explicitly publish session-only updates', async ({
  page,
}) => {
  const payload = await getPayload({ config }),
    key = randomUUID()
  const user = await payload.create({
    collection: 'users',
    data: {
      email: `sheet-ui-${key}@example.test`,
      name: 'Sheet organiser',
      role: 'editor',
      password: 'test-password',
    },
  })
  const event = await payload.create({
    collection: 'community-events',
    data: {
      localTitle: 'Manual sheet sync',
      slug: `sheet-ui-${key}`,
      source: 'manual',
      eventKind: 'community',
      days: [{ title: 'Conference', date: '2027-02-01T00:00:00Z' }],
      _status: 'published',
    },
  })
  try {
    await page.context().setExtraHTTPHeaders({ Origin: origin })
    expect(
      (
        await page.request.post(`${origin}/api/users/login`, {
          data: { email: user.email, password: 'test-password' },
        })
      ).ok(),
    ).toBe(true)
    const disconnected = await page.request.post(
      `${origin}/api/community-events/${event.id}/schedule-sheet`,
      { data: {} },
    )
    expect(disconnected.status()).toBe(400)
    expect((await disconnected.json()).error).toContain('Save a Google Sheets agenda URL')
    await payload.update({
      collection: 'community-events',
      id: event.id,
      data: {
        scheduleSheetURL: 'https://docs.google.com/spreadsheets/d/12345678901234567890/edit?gid=0',
      },
    })
    await page.goto(`${origin}/admin/collections/community-events/${event.id}`)
    await page.getByRole('button', { name: 'Programme', exact: true }).click()
    const importer = page.getByRole('region', { name: 'Import programme' })
    await importer.getByText('Private sheet setup (one time)', { exact: true }).click()
    await expect(
      importer.getByText('GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON', { exact: true }),
    ).toBeVisible()
    await expect(
      importer.getByText(
        /Event dates, venues, sponsors, registration and publishing status stay unchanged/,
      ),
    ).toBeVisible()
    const preview = await previewSchedule(
      Buffer.from(
        'session_id,title,date,start_time,end_time,room\nstable,An updated session,2027-02-01,09:00,10:00,A',
      ),
      'sheet.csv',
      event,
    )
    let published = false
    // The endpoint's Google authentication, mutations and stale-preview checks are
    // exercised with real Payload data in schedule-sheet.int.spec.ts.
    await page.route(`**/api/community-events/${event.id}/schedule-sheet`, async (route) => {
      const body = route.request().postDataJSON()
      if (body.confirm) {
        expect(body.publish).toBe(true)
        expect(body.previewHash).toBe('reviewed-snapshot')
        published = true
        await route.fulfill({
          json: { message: 'Session updates published.', created: 0, updated: 1, published: true },
        })
      } else
        await route.fulfill({
          json: {
            ...preview,
            source: { title: 'Private agenda', tab: 'Agenda' },
            previewHash: 'reviewed-snapshot',
            sessionIDColumn: 'Session ID\nstable',
            changes: { created: 0, updated: 1, missing: [] },
          },
        })
    })
    await importer.getByRole('button', { name: 'Preview from Google Sheets', exact: true }).click()
    await expect(importer.getByText('An updated session', { exact: true })).toBeVisible()
    await expect(importer.getByRole('status')).toContainText('1 existing sessions matched')
    await importer.getByText('Keep session IDs stable in Google Sheets', { exact: true }).click()
    await expect(importer.getByLabel('Session ID column')).toHaveValue('Session ID\nstable')
    for (const width of [320, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 1000 })
      const bounds = await importer
        .getByRole('button', { name: 'Preview from Google Sheets', exact: true })
        .boundingBox()
      expect(bounds!.x).toBeGreaterThanOrEqual(0)
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width)
    }
    await page.setViewportSize({ width: 1440, height: 1000 })
    await importer.getByLabel('Publish session and linked speaker updates now').check()
    await importer.getByRole('button', { name: 'Import and publish', exact: true }).click()
    await expect.poll(() => published).toBe(true)
    await expect(importer.getByRole('status')).toContainText('Session updates published.')
    expect((await payload.findByID({ collection: 'community-events', id: event.id }))._status).toBe(
      'published',
    )
  } finally {
    await payload.delete({ collection: 'community-events', id: event.id })
    await payload.delete({ collection: 'users', id: user.id })
  }
})
