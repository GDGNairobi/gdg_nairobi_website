import { test, expect } from '@playwright/test'
import { randomUUID } from 'node:crypto'
import { getPayload, type Payload } from 'payload'
import config from '../../src/payload.config'

const origin = 'http://localhost:3000'
let payload: Payload, eventID: number, url: string, webID: number

test.beforeAll(async () => {
  payload = await getPayload({ config })
  const slug = `programme-test-${randomUUID()}`
  const event = await payload.create({
    collection: 'community-events',
    data: {
      localTitle: 'Programme test',
      slug,
      source: 'manual',
      eventKind: 'community',
      scheduleMode: 'multi',
      days: [{ title: 'Conference', date: '2027-02-01T00:00:00Z' }],
      _status: 'published',
    },
  })
  eventID = event.id
  url = `${origin}/events/${slug}`
  for (const [title, track, start, end, format] of [
    ['Welcome together', 'General', '05:00', '06:00', 'talk'],
    ['Web workshop', 'Web', '06:00', '06:45', 'workshop'],
    ['AI workshop', 'AI', '06:00', '06:45', 'workshop'],
    ['Networking afterwards', 'Networking', '14:35', '', 'break'],
  ] as const) {
    const session = await payload.create({
      collection: 'sessions',
      data: {
        event: eventID,
        title,
        slug: `${slug}-${track.toLowerCase()}`,
        startsAt: `2027-02-01T${start}:00Z`,
        endsAt: end ? `2027-02-01T${end}:00Z` : null,
        room: format === 'workshop' ? `Room ${track}` : 'Main Stage',
        scheduleTrack: track,
        track: 'open',
        format,
        _status: 'published',
      },
    })
    if (track === 'Web') webID = session.id
  }
})
test.afterAll(async () => {
  if (eventID) {
    await payload.delete({ collection: 'sessions', where: { event: { equals: eventID } } })
    await payload.delete({ collection: 'community-events', id: eventID })
  }
})

test('orders time slots, aligns parallel sessions and keeps shared sessions when filtering', async ({
  page,
}) => {
  await page.goto(url)
  const slots = page.locator('[data-slot-start]')
  await expect(slots).toHaveCount(3)
  expect(
    await slots.evaluateAll((rows) => rows.map((row) => row.getAttribute('data-slot-start'))),
  ).toEqual(['2027-02-01T05:00:00.000Z', '2027-02-01T06:00:00.000Z', '2027-02-01T14:35:00.000Z'])
  await expect(slots.nth(1).locator('article')).toHaveCount(2)
  const parallelCards = slots.nth(1).locator('article')
  await expect(parallelCards.nth(0)).toBeVisible()
  await expect(parallelCards.nth(1)).toBeVisible()
  const firstBox = await parallelCards.nth(0).boundingBox(),
    secondBox = await parallelCards.nth(1).boundingBox()
  expect(firstBox && secondBox && Math.abs(firstBox.y - secondBox.y) < 2).toBe(true)
  const filter = page.getByRole('group', { name: 'Filter programme by track' })
  await filter.getByRole('button', { name: 'Web', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'AI workshop' })).toHaveCount(0)
  for (const name of ['Web workshop', 'Welcome together', 'Networking afterwards'])
    await expect(page.getByRole('heading', { name })).toBeVisible()
  await expect(page.getByRole('status')).toHaveText('3 sessions for Web')
  await filter.getByRole('button', { name: 'All tracks', exact: true }).click()
  await expect(page.locator('.schedule-session-card')).toHaveCount(4)
})

test('saves favourites in this event, restores them after reload, and supports keyboard removal', async ({
  page,
}) => {
  await page.goto(url)
  const save = page.getByRole('button', { name: 'Save Web workshop to favourites', exact: true })
  await save.focus()
  await page.keyboard.press('Space')
  const key = `gdg-nairobi:favourites:v1:${eventID}`
  await expect
    .poll(() => page.evaluate((key) => JSON.parse(localStorage.getItem(key) || '[]'), key))
    .toEqual([webID])
  await page.reload()
  await expect(
    page.getByRole('button', { name: 'Remove Web workshop from favourites' }),
  ).toHaveAttribute('aria-pressed', 'true')
  const view = page.getByRole('button', { name: 'My favourites 1', exact: true })
  await view.click()
  await expect(page.locator('.schedule-session-card')).toHaveCount(1)
  const filter = page.getByRole('group', { name: 'Filter programme by track' })
  await filter.getByRole('button', { name: 'AI', exact: true }).click()
  await expect(
    page.getByRole('heading', { name: 'Nothing starred in this track. Yet.' }),
  ).toBeVisible()
  await filter.getByRole('button', { name: 'All tracks', exact: true }).click()
  await page.getByRole('button', { name: 'Remove Web workshop from favourites' }).click()
  await expect(page.getByRole('button', { name: 'My favourites 0', exact: true })).toBeFocused()
  await expect(page.getByRole('heading', { name: 'Your day starts with a star.' })).toBeVisible()
  await page.getByRole('button', { name: 'Browse the programme' }).click()
  await expect(page.locator('.schedule-session-card')).toHaveCount(4)
})

test('keeps favourites in sync between tabs and recovers from malformed storage', async ({
  page,
  context,
}) => {
  await page.goto(url)
  const sibling = await context.newPage()
  await sibling.goto(url)
  await sibling.getByRole('button', { name: 'Save AI workshop to favourites' }).click()
  await expect(
    page.getByRole('button', { name: 'Remove AI workshop from favourites' }),
  ).toHaveAttribute('aria-pressed', 'true')
  await sibling.close()
  await page.evaluate(
    (key) => localStorage.setItem(key, 'broken'),
    `gdg-nairobi:favourites:v1:${eventID}`,
  )
  await page.reload()
  await expect(page.getByRole('button', { name: 'My favourites 0', exact: true })).toBeVisible()
})

test('keeps stars usable for the visit when browser storage is blocked', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException('Storage blocked', 'SecurityError')
    }
  })
  await page.goto(url)
  await page.getByRole('button', { name: 'Save Web workshop to favourites' }).click()
  await expect(
    page.getByText('Your browser couldn’t save favourites.', { exact: false }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'My favourites 1', exact: true }).click()
  await expect(page.locator('.schedule-session-card')).toHaveCount(1)
  await page.reload()
  await expect(page.getByRole('button', { name: 'My favourites 0', exact: true })).toBeVisible()
})

test('includes the complete programme in the server response before client JavaScript', async ({
  request,
}) => {
  const response = await request.get(url)
  expect(response.ok()).toBe(true)
  const html = await response.text()
  const headings = [...html.matchAll(/<h4 id="programme-session-\d+"[^>]*>(.*?)<\/h4>/g)].map(
    (match) => match[1],
  )
  expect(headings).toEqual([
    'Welcome together',
    'Web workshop',
    'AI workshop',
    'Networking afterwards',
  ])
})

test.describe('Mobile programme', () => {
  test.use({ isMobile: true, hasTouch: true })
  for (const width of [320, 390, 768]) {
    test(`readable cards, reachable filters and favourites at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: width === 320 ? 568 : 844 })
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await page.goto(url)
      const filter = page.getByRole('combobox', { name: 'Filter programme by track' })
      await expect(filter).toBeVisible()
      expect(
        await filter.evaluate((element) => parseFloat(getComputedStyle(element).fontSize)),
      ).toBeGreaterThanOrEqual(16)
      await filter.selectOption('web')
      await expect(page.locator('.schedule-session-card')).toHaveCount(3)
      await expect(page.getByRole('heading', { name: 'AI workshop' })).toHaveCount(0)
      const star = page.getByRole('button', {
        name: 'Save Web workshop to favourites',
        exact: true,
      })
      await star.tap()
      await page.locator('.schedule-session-card').last().scrollIntoViewIfNeeded()
      const controls = page.locator('[data-programme-controls]')
      const box = await controls.boundingBox()
      expect(box!.height).toBeLessThanOrEqual(80)
      expect(box!.y).toBeGreaterThanOrEqual(78)
      expect(box!.y).toBeLessThanOrEqual(82)
      for (const control of [
        filter,
        page.getByRole('button', { name: 'My favourites 1', exact: true }),
      ]) {
        await expect(control).toBeInViewport({ ratio: 1 })
        const bounds = await control.boundingBox()
        expect(bounds!.height).toBeGreaterThanOrEqual(44)
        expect(bounds!.x).toBeGreaterThanOrEqual(0)
        expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width)
      }
      const fonts = await page
        .locator(
          '.schedule-session-card small,.schedule-session-card time,.schedule-speakers strong',
        )
        .evaluateAll((elements) =>
          elements.map((element) => parseFloat(getComputedStyle(element).fontSize)),
        )
      expect(Math.min(...fonts)).toBeGreaterThanOrEqual(12)
      await page.getByRole('button', { name: 'My favourites 1', exact: true }).tap()
      await expect(page.locator('.schedule-session-card')).toHaveCount(1)
      await page.reload()
      await expect(
        page.getByRole('button', { name: 'Remove Web workshop from favourites' }),
      ).toHaveAttribute('aria-pressed', 'true')
    })
  }
})
