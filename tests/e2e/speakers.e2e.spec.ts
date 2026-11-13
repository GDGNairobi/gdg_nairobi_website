import { expect, test } from '@playwright/test'
import { randomUUID } from 'node:crypto'
import path from 'node:path'
import { getPayload, type Payload } from 'payload'
import config from '../../src/payload.config'

const origin = 'http://localhost:3000'
test.use({ timezoneId: 'America/Los_Angeles' })
let payload: Payload, eventID: number, url: string, mediaID: number
const speakerIDs: number[] = []
const partnerIDs: number[] = []
const key = randomUUID()

test.beforeAll(async () => {
  payload = await getPayload({ config })
  const event = await payload.create({
    collection: 'community-events',
    data: {
      localTitle: 'DevFest speaker test',
      slug: `speakers-test-${key}`,
      source: 'manual',
      eventKind: 'devfest',
      days: [{ title: 'Conference', date: '2027-02-01T00:00:00Z' }],
      _status: 'published',
    },
  })
  eventID = event.id
  url = `${origin}/events/${event.slug}`
  const media = await payload.create({
    collection: 'media',
    data: { alt: 'Published speaker portrait' },
    filePath: path.resolve('public/images/community-speaker.jpg'),
  })
  mediaID = media.id
  for (const [name, published] of [
    ['Published event partner', true], ['Draft event partner', false], ['Unrelated event partner', true],
  ] as const) {
    const partner = await payload.create({
      collection: 'partners',
      draft: !published,
      data: { name, logo: mediaID, scope: 'devfest', tier: 'community', order: 0, _status: published ? 'published' : 'draft' },
    })
    partnerIDs.push(partner.id)
  }
  await payload.update({ collection: 'community-events', id: eventID, data: { partners: partnerIDs.slice(0, 2) } })
  const chapterSponsor = await payload.create({
    collection: 'partners',
    data: {
      name: 'Published chapter sponsor',
      scope: 'chapter',
      tier: 'host',
      logo: mediaID,
      sourceLogoURL: 'https://res.cloudinary.com/example/unused-fallback.png',
      order: 0,
      _status: 'published',
    },
  })
  partnerIDs.push(chapterSponsor.id)
  for (let i = 0; i < 12; i++) {
    const speaker = await payload.create({
      collection: 'speakers',
      draft: i === 9,
      data: {
        name: i === 9 ? 'Unpublished speaker' : i === 10 ? 'Unrelated speaker' : i === 11 ? 'Partner organization' : `Speaker ${i + 1}`,
        isOrganization: i === 11,
        slug: `speaker-test-${key}-${i}`,
        ...(i === 0 ? { portrait: mediaID, jobTitle: 'Engineer', company: 'Community team' } : {}),
        _status: i === 9 ? 'draft' : 'published',
      },
    })
    speakerIDs.push(speaker.id)
  }
  for (const [track, title, speakers] of [
    ['Web', 'A codelab from the agenda', [...speakerIDs.slice(0, 10), speakerIDs[11]]],
    ['AI', 'A second session from the agenda', [speakerIDs[0]]],
  ] as const) {
    await payload.create({
      collection: 'sessions',
      data: {
        event: eventID,
        title,
        slug: `speaker-test-${key}-${track.toLowerCase()}`,
        startsAt: '2027-02-01T08:15:00Z',
        endsAt: '2027-02-01T09:00:00Z',
        room: track,
        scheduleTrack: track,
        track: 'open',
        format: 'workshop',
        speakers: [...speakers],
        _status: 'published',
      },
    })
  }
})

test.afterAll(async () => {
  if (eventID) {
    await payload.delete({ collection: 'sessions', where: { event: { equals: eventID } } })
    await payload.delete({ collection: 'community-events', id: eventID })
  }
  if (speakerIDs.length)
    await payload.delete({ collection: 'speakers', where: { id: { in: speakerIDs } } })
  if (partnerIDs.length)
    await payload.delete({ collection: 'partners', where: { id: { in: partnerIDs } } })
  if (mediaID) await payload.delete({ collection: 'media', id: mediaID })
})

test('counts down to the adjusted programme in EAT and transitions at zero without hydration errors', async ({ page }) => {
  // An editorial delay must move the countdown along with the published timetable.
  await payload.update({ collection: 'community-events', id: eventID, data: { scheduleOffsetMinutes: 10 } })
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  await page.clock.install({ time: new Date('2027-02-01T08:24:00Z') })
  try {
    await page.goto(url)
    const section = page.getByRole('region', { name: 'DevFest countdown' })
    const timer = section.getByRole('timer')
    await expect(section.locator('time')).toHaveAttribute('datetime', '2027-02-01T08:25:00.000Z')
    await expect(section.locator('time')).toContainText('11:25 am EAT')
    await expect(timer).toHaveAttribute('aria-live', 'off')
    // Let the streamed page hydrate before pausing its browser timers.
    await expect(timer.locator('strong').last()).toHaveText(/\d{2}/)
    await page.clock.pauseAt(new Date('2027-02-01T08:24:55Z'))
    await expect(timer).toHaveText('00Days00Hours00Minutes05Seconds')
    await page.clock.runFor(2000)
    await expect(timer).toHaveText('00Days00Hours00Minutes03Seconds')
    await page.clock.runFor(3000)
    await expect(timer).toHaveCount(0)
    await expect(section.getByRole('status')).toHaveText('DevFest is here.')
    await page.clock.runFor(2000)
    await expect(timer).toHaveCount(0)
    await section.getByRole('link', { name: 'Explore the programme' }).click()
    await expect(page).toHaveURL(`${url}#programme`)
    expect(errors).toEqual([])
  } finally {
    await payload.update({ collection: 'community-events', id: eventID, data: { scheduleOffsetMinutes: 0 } })
  }
})

test('shows a compact people directory and event partners while protecting unrelated and draft records', async ({
  page,
}) => {
  await page.goto(url)
  await page.getByRole('link', { name: 'Meet the speakers' }).click()
  await expect(page).toHaveURL(`${url}#speakers`)
  const section = page.getByRole('region', { name: 'Meet the speakers.' })
  await expect(section).toBeVisible()
  await expect(section.locator('article')).toHaveCount(9)
  await expect(section.getByText('Unpublished speaker', { exact: true })).toHaveCount(0)
  await expect(section.getByText('Unrelated speaker', { exact: true })).toHaveCount(0)
  await expect(section.getByText('Partner organization', { exact: true })).toHaveCount(0)
  const partners = page.getByRole('region', { name: 'With support from.' })
  await expect(partners.getByRole('heading', { name: 'Published event partner' })).toBeVisible()
  await expect(partners.getByText('Draft event partner', { exact: true })).toHaveCount(0)
  await expect(partners.getByText('Unrelated event partner', { exact: true })).toHaveCount(0)
  await expect(partners.getByRole('img', { name: 'Published event partner logo' })).toBeVisible()
  await partners.locator('img').evaluate((img: HTMLImageElement) => { img.loading = 'eager' })
  await expect.poll(() => partners.locator('img').evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0)
  expect(await page.locator('#programme').evaluate((programme) =>
    !!(programme.compareDocumentPosition(document.getElementById('speakers')!) & Node.DOCUMENT_POSITION_FOLLOWING),
  )).toBe(true)
  const first = section.getByRole('article').filter({
    has: page.getByRole('heading', { name: 'Speaker 1', exact: true }),
  })
  await expect(first).toHaveCount(1)
  await expect(first.getByText('Engineer · Community team', { exact: true })).toBeVisible()
  for (const text of ['Web', 'AI'])
    await expect(first.getByText(text, { exact: true })).toBeVisible()
  for (const title of ['A codelab from the agenda', 'A second session from the agenda'])
    await expect(section.getByText(title, { exact: true })).toHaveCount(0)
  const portrait = first.getByRole('img', { name: 'Published speaker portrait' })
  await expect.poll(() => portrait.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0)
  const last = section.getByRole('heading', { name: 'Speaker 9', exact: true })
  await expect(last).toBeVisible()
  await expect(section.locator('details,summary')).toHaveCount(0)
  const directory = section.getByRole('group', { name: 'All speakers' })
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    const countdown = page.getByRole('region', { name: 'DevFest countdown' })
    expect(await countdown.getByRole('timer').evaluate((element) => {
      const tiles = [...element.children].map((tile) => tile.getBoundingClientRect())
      return tiles.every((tile) => tile.left >= 0 && tile.right <= innerWidth && Math.abs(tile.top - tiles[0].top) < 1)
    }), `Countdown tiles at ${width}px`).toBe(true)
    const geometry = await directory.evaluate((element) => ({
      overflow: document.documentElement.scrollWidth > innerWidth + 1,
      clipped: (innerWidth <= 900 ? [element] : [...element.querySelectorAll('article,h3,li')]).some((node) => {
        const bounds = node.getBoundingClientRect()
        return bounds.width > 0 && (bounds.left < -1 || bounds.right > innerWidth + 1)
      }),
    }))
    expect(geometry, `Speaker directory at ${width}px`).toEqual({ overflow: false, clipped: false })
    expect((await first.boundingBox())!.height).toBeLessThan(220)
    if (width <= 900) {
      await directory.evaluate((element) => element.scrollIntoView({ block: 'center', behavior: 'instant' }))
      await directory.evaluate((element) => { element.scrollLeft = 0 })
      await expect(first).toBeInViewport({ ratio: 1 })
      const cards = section.getByRole('article')
      const [left, right] = await Promise.all([cards.nth(0).boundingBox(), cards.nth(1).boundingBox()])
      expect(Math.abs(left!.y - right!.y)).toBeLessThan(2)
      expect(right!.x).toBeGreaterThanOrEqual(left!.x + left!.width)
      expect(right!.x + right!.width).toBeLessThanOrEqual(width)
      await directory.focus()
      const keyboardScrollEnd = directory.evaluate((element) => new Promise<void>((resolve) => {
        element.addEventListener('scrollend', () => resolve(), { once: true })
      }))
      await page.keyboard.press('ArrowRight')
      await keyboardScrollEnd
      expect(await directory.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0)
      await directory.hover()
      const wheelScrollEnd = directory.evaluate((element) => new Promise<void>((resolve) => {
        element.addEventListener('scrollend', () => resolve(), { once: true })
      }))
      await page.mouse.wheel(10000, 0)
      await wheelScrollEnd
      await expect(last, `Last speaker at ${width}px`).toBeInViewport({ ratio: 1 })
    } else {
      expect(await directory.evaluate((element) => element.scrollWidth <= element.clientWidth + 1)).toBe(true)
    }
    const partnerBox = await partners.locator('article').boundingBox()
    expect(partnerBox!.x).toBeGreaterThanOrEqual(0)
    expect(partnerBox!.x + partnerBox!.width).toBeLessThanOrEqual(width)
    expect(await partners.locator('article').evaluate((article) =>
      article.querySelector('img')!.getBoundingClientRect().bottom <= article.querySelector('h3')!.getBoundingClientRect().top,
    )).toBe(true)
  }
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.setViewportSize({ width: 390, height: 900 })
  expect(await directory.evaluate((element) => getComputedStyle(element).scrollSnapType)).toBe('none')
  await directory.evaluate((element) => element.scrollIntoView({ block: 'center', behavior: 'instant' }))
  await directory.hover()
  const pageY = await page.evaluate(() => scrollY)
  // Scroll up because this short fixture can already be at the page bottom.
  await page.mouse.wheel(0, -200)
  await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(pageY)
  await section.getByRole('link', { name: 'View programme' }).click()
  await expect(page).toHaveURL(`${url}#programme`)
  await expect(page.getByRole('heading', { name: 'Plan your day.' })).toBeInViewport()
})

test('About lists published Payload partners across scopes and prefers uploaded logos', async ({
  page,
}) => {
  await page.goto(`${origin}/about`)
  const partners = page.locator('#partners')
  for (const name of [
    'Published event partner',
    'Unrelated event partner',
    'Published chapter sponsor',
  ]) {
    await expect(partners.getByRole('heading', { name, exact: true })).toBeVisible()
  }
  await expect(partners.getByText('Draft event partner', { exact: true })).toHaveCount(0)
  await expect(partners.locator('a[href="#"]')).toHaveCount(0)
  const sponsor = partners.getByRole('article').filter({
    has: page.getByRole('heading', { name: 'Published chapter sponsor', exact: true }),
  })
  const logo = sponsor.getByRole('img', { name: 'Published chapter sponsor logo' })
  await logo.scrollIntoViewIfNeeded()
  await expect
    .poll(() => logo.evaluate((img: HTMLImageElement) => img.naturalWidth))
    .toBeGreaterThan(0)
  expect(await logo.getAttribute('src')).not.toContain('unused-fallback')
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    expect(
      await partners.evaluate((section) => ({
        overflow: document.documentElement.scrollWidth > innerWidth + 1,
        clipped: [...section.querySelectorAll('article')].some((card) => {
          const bounds = card.getBoundingClientRect()
          const image = card.querySelector('img')?.getBoundingClientRect()
          const heading = card.querySelector('h4')?.getBoundingClientRect()
          return (
            bounds.left < 0 ||
            bounds.right > innerWidth ||
            !!(image && heading && image.bottom > heading.top)
          )
        }),
      })),
      `About partners at ${width}px`,
    ).toEqual({ overflow: false, clipped: false })
  }
})
