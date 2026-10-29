import { test, expect } from '@playwright/test'
import { getPayload } from 'payload'
import config from '../../src/payload.config'
import { randomUUID } from 'node:crypto'

const origin = 'http://localhost:3000'

test('organiser uploads, previews, publishes and updates a schedule without duplicates', async ({
  page,
  request,
}) => {
  test.setTimeout(120_000)
  await page.context().setExtraHTTPHeaders({ Origin: origin })
  const payload = await getPayload({ config })
  const key = randomUUID()
  const slug = `import-test-${key}`
  const speakerName = `Import Speaker ${key}`
  const user = await payload.create({
    collection: 'users',
    data: {
      email: `schedule-import-${key}@example.test`,
      password: 'test-password',
      role: 'editor',
      name: 'Import test',
    },
  })
  let eventID: number | undefined
  try {
    const login = await page.request.post(`${origin}/api/users/login`, {
      data: { email: user.email, password: 'test-password' },
    })
    expect(login.ok()).toBe(true)
    const created = await page.request.post(`${origin}/api/community-events`, {
      data: {
        localTitle: 'Import test event',
        slug,
        source: 'manual',
        eventKind: 'community',
        days: [{ title: 'Conference', date: '2027-02-01T00:00:00Z', venueName: 'Test venue' }],
        _status: 'published',
      },
    })
    expect(created.ok(), await created.text()).toBe(true)
    eventID = (await created.json()).doc.id
    const endpoint = `${origin}/api/community-events/${eventID}/schedule-import`
    expect((await request.post(endpoint)).status()).toBe(403)
    const template = await page.request.get(
      `${origin}/api/community-events/${eventID}/schedule-template?format=xlsx`,
    )
    expect(template.ok()).toBe(true)
    expect(template.headers()['content-type']).toContain('spreadsheetml')
    const csv = `session_id,title,date,start_time,end_time,room,speakers\nopening,Opening,2027-02-01,09:00,10:00,Main stage,${speakerName}\n`
    await page.goto(`${origin}/admin/collections/community-events/${eventID}`)
    await page.getByRole('button', { name: 'Programme', exact: true }).click()
    const importer = page.getByRole('region', { name: 'Import programme' })
    const file = importer.getByLabel('Schedule file')
    await expect(file).toBeEnabled()
    await file.setInputFiles({
      name: 'schedule.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(csv),
    })
    await importer.getByRole('button', { name: 'Preview sessions' }).click()
    await expect(importer.getByText('1 sessions · 1 event days · 0 errors')).toBeVisible()
    await page.screenshot({ path: '/private/tmp/gdg-programme-import.png', fullPage: true })
    expect(
      (await payload.find({ collection: 'sessions', where: { event: { equals: eventID } } }))
        .totalDocs,
    ).toBe(0)
    await importer.getByLabel('Publish event, sessions and linked speaker profiles now').check()
    await importer.getByRole('button', { name: 'Import and publish', exact: true }).click()
    await expect(importer.getByRole('status')).toContainText('1 added, 0 updated', {
      timeout: 30_000,
    })
    const updatedCSV = csv.replace(',Opening,', ',Updated opening,')
    const update = await page.request.post(endpoint, {
      multipart: {
        file: { name: 'schedule.csv', mimeType: 'text/csv', buffer: Buffer.from(updatedCSV) },
        confirm: 'true',
        publish: 'true',
      },
    })
    expect(update.ok(), await update.text()).toBe(true)
    expect(await update.json()).toMatchObject({ created: 0, updated: 1 })
    const sessions = await payload.find({
      collection: 'sessions',
      where: { event: { equals: eventID } },
      depth: 1,
    })
    expect(sessions.totalDocs).toBe(1)
    expect(sessions.docs[0].title).toBe('Updated opening')
    expect(sessions.docs[0].startsAt).toBe('2027-02-01T06:00:00.000Z')
    expect(sessions.docs[0].speakers).toHaveLength(1)
    const invalid = await page.request.post(endpoint, {
      multipart: {
        file: {
          name: 'bad.csv',
          mimeType: 'text/csv',
          buffer: Buffer.from(updatedCSV.replace('10:00', '08:00')),
        },
        confirm: 'true',
        publish: 'true',
      },
    })
    expect(invalid.status()).toBe(422)
    expect(
      (await payload.find({ collection: 'sessions', where: { event: { equals: eventID } } }))
        .totalDocs,
    ).toBe(1)
    await page.goto(`${origin}/events/${slug}`)
    await expect(page.getByRole('heading', { name: 'Updated opening' })).toBeVisible()
    await expect(page.getByText('Test venue', { exact: true })).toBeVisible()
    // Draft imports retain the currently published programme until organisers publish.
    const draft = await page.request.post(endpoint, {
      multipart: {
        file: {
          name: 'schedule.csv',
          mimeType: 'text/csv',
          buffer: Buffer.from(csv.replace(',Opening,', ',Draft opening,')),
        },
        confirm: 'true',
        publish: 'false',
      },
    })
    expect(draft.ok(), await draft.text()).toBe(true)
    await page.reload()
    await expect(page.getByRole('heading', { name: 'Updated opening' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Draft opening' })).toHaveCount(0)
  } finally {
    if (eventID) {
      await payload.delete({ collection: 'sessions', where: { event: { equals: eventID } } })
      await payload.delete({ collection: 'community-events', id: eventID })
    }
    await payload.delete({ collection: 'speakers', where: { name: { equals: speakerName } } })
    await payload.delete({ collection: 'users', id: user.id })
  }
})

test('seeded event pages show confirmed details and the archive groups past editions', async ({
  page,
}) => {
  await page.goto(`${origin}/devfest`)
  await expect(page).toHaveURL(`${origin}/events/devfest-nairobi-2026`)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('DevFest Nairobi 2026')
  await expect(
    page.getByRole('link', { name: 'Register for DevFest Nairobi 2026' }),
  ).toHaveAttribute('href', 'https://gdg.community.dev/gdg-nairobi/')
  await expect(
    page.getByText('Sarit Expo Centre, Westlands, Nairobi', { exact: true }),
  ).toBeVisible()
  await expect(page.getByRole('link', { name: /Visit venue website/ })).toHaveAttribute(
    'href',
    'https://saritexpo.com/',
  )
  await page.goto(`${origin}/events`)
  await expect(
    page.getByRole('heading', { name: 'DevFest Nairobi 2026', exact: true }),
  ).toHaveCount(1)
  await expect(page.getByRole('heading', { name: '2025', exact: true })).toBeVisible()
  const sitemap = await page.request.get(`${origin}/sitemap.xml`)
  expect(await sitemap.text()).toContain('/events/devfest-nairobi-2026')
})
