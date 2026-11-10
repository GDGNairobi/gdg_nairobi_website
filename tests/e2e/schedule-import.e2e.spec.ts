import { test, expect } from '@playwright/test'
import { getPayload } from 'payload'
import config from '../../src/payload.config'
import { randomUUID } from 'node:crypto'
import path from 'node:path'
import ExcelJS from 'exceljs'

const origin = 'http://localhost:3000'

test('imports a Google Sheets agenda with parallel rooms, speaker portraits and networking onwards', async ({
  page,
}) => {
  test.setTimeout(120_000)
  const payload = await getPayload({ config }),
    key = randomUUID(),
    slug = `agenda-test-${key}`
  const names = [`Web Speaker ${key}`, `AI Speaker ${key}`]
  const user = await payload.create({
    collection: 'users',
    data: {
      email: `agenda-${key}@example.test`,
      password: 'test-password',
      role: 'editor',
      name: 'Agenda test editor',
    },
  })
  let eventID: number | undefined, mediaID: number | undefined
  try {
    await page.context().setExtraHTTPHeaders({ Origin: origin })
    expect(
      (
        await page.request.post(`${origin}/api/users/login`, {
          data: { email: user.email, password: 'test-password' },
        })
      ).ok(),
    ).toBe(true)
    const event = await payload.create({
      collection: 'community-events',
      data: {
        localTitle: 'Agenda test',
        slug,
        source: 'manual',
        eventKind: 'community',
        days: [{ title: 'Conference', date: '2027-02-01T00:00:00Z' }],
        _status: 'published',
      },
    })
    eventID = event.id
    const workbook = new ExcelJS.Workbook(),
      sheet = workbook.addWorksheet('Agenda')
    sheet.addRow([
      'Time',
      'Activity',
      'Details',
      'Speakers',
      'Duration',
      'Content Track/Theme',
      'Where?',
      'session_id',
    ])
    sheet.addRow([
      '11:15 - 12:00 pm',
      'Hands-On Codelab',
      'Web codelab',
      names[0],
      '45 mins',
      'Web',
      'Room A',
      'web',
    ])
    sheet.addRow(['', '', 'AI codelab', names[1], '', 'AI', 'Room B', 'ai'])
    sheet.addRow([
      '5:35 PM onwards',
      'Networking',
      'Connect afterwards',
      '-',
      'Open',
      'Networking',
      'Room A',
      'networking',
    ])
    const endpoint = `${origin}/api/community-events/${eventID}/schedule-import`
    const upload = async (confirm: boolean) =>
      page.request.post(endpoint, {
        multipart: {
          file: {
            name: 'agenda.csv',
            mimeType: 'text/csv',
            buffer: Buffer.from(await workbook.csv.writeBuffer()),
          },
          confirm: String(confirm),
          publish: 'true',
        },
      })
    const preview = await upload(false)
    expect(preview.ok(), await preview.text()).toBe(true)
    expect(await preview.json()).toMatchObject({
      layout: 'agenda',
      errors: [],
      rows: expect.any(Array),
    })
    expect(
      (await payload.find({ collection: 'sessions', where: { event: { equals: eventID } } }))
        .totalDocs,
    ).toBe(0)
    const imported = await upload(true)
    expect(imported.ok(), await imported.text()).toBe(true)
    expect(await imported.json()).toMatchObject({ created: 3, updated: 0 })
    sheet.getCell('A2').value = '11:20 am - 12:05 pm'
    sheet.getCell('C2').value = 'Updated web codelab'
    const updated = await upload(true)
    expect(updated.ok(), await updated.text()).toBe(true)
    expect(await updated.json()).toMatchObject({ created: 0, updated: 3 })
    const speaker = (
      await payload.find({
        collection: 'speakers',
        where: { name: { equals: names[0] } },
        limit: 1,
      })
    ).docs[0]
    const media = await payload.create({
      collection: 'media',
      data: { alt: 'Example speaker portrait' },
      filePath: path.resolve('public/images/community-speaker.jpg'),
    })
    mediaID = media.id
    await payload.update({
      collection: 'speakers',
      id: speaker.id,
      data: { portrait: media.id, _status: 'published' },
    })
    await page.goto(`${origin}/events/${slug}`)
    await expect(page.getByRole('heading', { name: 'Updated web codelab' })).toBeVisible()
    await expect(
      page.getByRole('link', { name: 'Register for Agenda test' }),
    ).toBeVisible()
    await expect(page.locator('[data-programme-layout="single"]')).toHaveCount(1)
    await expect(page.getByText('Room A · Web · workshop', { exact: true })).toBeVisible()
    await expect(page.getByText('Room B · AI · workshop', { exact: true })).toBeVisible()
    const portrait = page.getByRole('img', { name: 'Example speaker portrait' })
    await expect(portrait).toBeVisible()
    await expect
      .poll(() => portrait.evaluate((img: HTMLImageElement) => img.naturalWidth))
      .toBeGreaterThan(0)
    const networking = page
      .locator('article')
      .filter({ has: page.getByRole('heading', { name: 'Networking', exact: true }) })
    await expect(networking.getByText('onwards', { exact: true })).toBeVisible()
    await expect(networking.locator('time')).toHaveCount(1)
    for (const width of [320, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 1000 })
      await expect
        .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
        .toBe(true)
    }
    await page.screenshot({ path: '/private/tmp/gdg-agenda-portraits.png', fullPage: true })
  } finally {
    if (eventID) {
      await payload.delete({ collection: 'sessions', where: { event: { equals: eventID } } })
      await payload.delete({ collection: 'community-events', id: eventID })
    }
    await payload.delete({ collection: 'speakers', where: { name: { in: names } } })
    if (mediaID) await payload.delete({ collection: 'media', id: mediaID })
    await payload.delete({ collection: 'users', id: user.id })
  }
})

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
  const speakerAlias = `Alternate Speaker ${key}`
  const conflictingName = `Conflicting Speaker ${key}`
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
    const profile = (await payload.find({
      collection: 'speakers', where: { name: { equals: speakerName } }, limit: 1,
    })).docs[0]
    await payload.update({
      collection: 'speakers', id: profile.id, data: { importAliases: [speakerAlias] },
    })
    const retired = await payload.create({
      collection: 'speakers', draft: true,
      data: { name: speakerAlias.toLowerCase(), slug: `retired-speaker-${key}`, _status: 'draft' },
    })
    const updatedCSV = csv.replace(',Opening,', ',Updated opening,')
      .replace(speakerName, `${speakerAlias.toLowerCase()}|${speakerName}`)
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
    expect((sessions.docs[0].speakers![0] as { id: number }).id).toBe(profile.id)
    expect((await payload.count({
      collection: 'speakers', where: { name: { equals: speakerAlias.toLowerCase() } },
    })).totalDocs).toBe(1)
    expect((await payload.findByID({ collection: 'speakers', id: retired.id, draft: true }))._status).toBe('draft')
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
    await payload.create({
      collection: 'speakers',
      data: { name: conflictingName, slug: `conflicting-speaker-${key}`, importAliases: [speakerAlias], _status: 'published' },
    })
    const ambiguous = await page.request.post(endpoint, {
      multipart: {
        file: { name: 'schedule.csv', mimeType: 'text/csv', buffer: Buffer.from(updatedCSV) },
        confirm: 'true', publish: 'true',
      },
    })
    expect(ambiguous.status()).toBe(400)
    expect((await ambiguous.json()).error).toContain('Multiple speaker profiles')
    await page.reload()
    await expect(page.getByRole('heading', { name: 'Updated opening' })).toBeVisible()
  } finally {
    if (eventID) {
      await payload.delete({ collection: 'sessions', where: { event: { equals: eventID } } })
      await payload.delete({ collection: 'community-events', id: eventID })
    }
    await payload.delete({ collection: 'speakers', where: { or: [
      { name: { equals: speakerName } }, { name: { equals: speakerAlias.toLowerCase() } },
      { name: { equals: conflictingName } },
    ] } })
    await payload.delete({ collection: 'users', id: user.id })
  }
})

test('seeded event pages show confirmed details and the archive groups past editions', async ({
  page,
}) => {
  await page.goto(`${origin}/devfest`)
  await expect(page).toHaveURL(`${origin}/events/devfest-nairobi-2026`)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('DevFest Nairobi 2026')
  await expect(page.getByRole('link', { name: 'Register for DevFest Nairobi 2026' })).toHaveCount(0)
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
