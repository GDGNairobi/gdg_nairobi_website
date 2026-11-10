import { expect, test } from '@playwright/test'
import { randomUUID } from 'node:crypto'
import { getPayload, type Payload } from 'payload'
import config from '../../src/payload.config'

test.use({ timezoneId: 'America/Los_Angeles', hasTouch: true })
const origin = 'http://localhost:3000'
const title = `Community countdown ${randomUUID()}`
const eventIDs: number[] = []
let payload: Payload, href: string

test.beforeAll(async () => {
  payload = await getPayload({ config })
  for (const [name, published, visible, date] of [
    [title, true, true, '2030-06-10'],
    ['Draft countdown event', false, true, '2030-06-09'],
    ['Hidden countdown event', true, false, '2030-06-09'],
  ] as const) {
    const event = await payload.create({
      collection: 'community-events',
      draft: !published,
      data: {
        localTitle: name,
        slug: `countdown-${randomUUID()}`,
        source: 'manual',
        eventKind: 'workshop',
        showOnSite: visible,
        days: [{ title: 'Workshop', date: `${date}T00:00:00Z` }],
        _status: published ? 'published' : 'draft',
      },
    })
    eventIDs.push(event.id)
    if (name === title) href = `/events/${event.slug}`
    await payload.create({
      collection: 'sessions',
      data: {
        event: event.id,
        title: 'Doors open',
        slug: `countdown-${randomUUID()}`,
        startsAt: `${date}T05:00:00Z`,
        endsAt: `${date}T06:00:00Z`,
        room: 'Workshop room',
        track: 'open',
        format: 'workshop',
        _status: 'published',
      },
    })
  }
})

test.afterAll(async () => {
  if (!eventIDs.length) return
  await payload.delete({ collection: 'sessions', where: { event: { in: eventIDs } } })
  await payload.delete({ collection: 'community-events', where: { id: { in: eventIDs } } })
})

test('shows a public event across routes in its final week, persists dismissal, and disappears at its start', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.clock.install({ time: new Date('2030-06-03T04:59:00Z') })
  await page.goto(`${origin}/about`)
  await page.waitForLoadState('networkidle')
  await page.clock.pauseAt(new Date('2030-06-03T04:59:59Z'))
  const notice = page.getByRole('complementary', { name: 'Upcoming event countdown' })
  await expect(notice).toHaveCount(0)
  await page.clock.runFor(1000)
  await expect(notice).toBeVisible()
  const trigger = notice.getByRole('button', { name: `Countdown for ${title}`, exact: true })
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  await expect(notice.getByRole('link')).toHaveCount(0)
  await trigger.hover()
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  await page.mouse.move(0, 0)
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  await trigger.focus()
  await page.keyboard.press('Enter')
  await page.keyboard.press('Tab')
  await expect(notice.getByRole('link')).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(trigger).toBeFocused()
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  await trigger.tap()
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  await expect(notice.getByRole('link')).toHaveAttribute('href', href)
  await expect(notice).toContainText(title)
  await expect(notice.locator('time')).toContainText('8:00 am EAT')
  await expect(notice.getByRole('timer').locator('strong')).toHaveText(['07', '00', '00', '00'])
  await page.clock.runFor(1000)
  await expect(notice.getByRole('timer').locator('strong')).toHaveText(['06', '23', '59', '59'])
  await page.clock.resume()
  await notice.getByRole('link').click()
  await expect(page).toHaveURL(`${origin}${href}`)
  await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible()
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  await trigger.tap()
  await notice.getByRole('button', { name: 'Dismiss event countdown' }).click()
  await expect(notice).toHaveCount(0)
  await expect(page.locator('main')).toBeFocused()
  await page
    .getByRole('navigation', { name: 'Primary navigation' })
    .getByRole('link', { name: 'About', exact: true })
    .click()
  await expect(page).toHaveURL(`${origin}/about`)
  await page.reload()
  await expect(notice).toHaveCount(0)
  await page.evaluate(() => sessionStorage.removeItem('gdg-nairobi:upcoming-countdown:dismissed'))
  await page.reload()
  await expect(notice).toBeVisible()
  await trigger.tap()
  await page.clock.pauseAt(new Date('2030-06-10T04:59:59Z'))
  await expect(notice.getByRole('timer').locator('strong').last()).toHaveText('01')
  await page.clock.runFor(1000)
  await expect(notice).toHaveCount(0)
  expect(errors).toEqual([])
})
