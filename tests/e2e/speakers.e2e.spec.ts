import { expect, test } from '@playwright/test'
import { randomUUID } from 'node:crypto'
import path from 'node:path'
import { getPayload, type Payload } from 'payload'
import config from '../../src/payload.config'

const origin = 'http://localhost:3000'
let payload: Payload, eventID: number, url: string, mediaID: number
const speakerIDs: number[] = []
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
  for (let i = 0; i < 11; i++) {
    const speaker = await payload.create({
      collection: 'speakers',
      draft: i === 9,
      data: {
        name: i === 9 ? 'Unpublished speaker' : i === 10 ? 'Unrelated speaker' : `Speaker ${i + 1}`,
        slug: `speaker-test-${key}-${i}`,
        ...(i === 0 ? { portrait: mediaID, jobTitle: 'Engineer', company: 'Community team' } : {}),
        _status: i === 9 ? 'draft' : 'published',
      },
    })
    speakerIDs.push(speaker.id)
  }
  for (const [track, title, speakers] of [
    ['Web', 'A codelab from the agenda', speakerIDs.slice(0, 10)],
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
  if (mediaID) await payload.delete({ collection: 'media', id: mediaID })
})

test('shows event-linked speakers once, protects drafts and expands a responsive directory', async ({
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
  const first = section.getByRole('article').filter({
    has: page.getByRole('heading', { name: 'Speaker 1', exact: true }),
  })
  await expect(first).toHaveCount(1)
  await expect(first.getByText('Engineer · Community team', { exact: true })).toBeVisible()
  for (const text of ['Web', 'AI', 'A codelab from the agenda', 'A second session from the agenda'])
    await expect(first.getByText(text, { exact: true })).toBeVisible()
  const portrait = first.getByRole('img', { name: 'Published speaker portrait' })
  await expect.poll(() => portrait.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0)
  const last = section.getByRole('heading', { name: 'Speaker 9', exact: true })
  await expect(last).toBeHidden()
  const summary = section.locator('summary')
  await summary.focus()
  await page.keyboard.press('Space')
  await expect(last).toBeVisible()
  await expect(summary).toHaveText(/Show fewer speakers/)
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    const geometry = await section.evaluate((element) => ({
      overflow: document.documentElement.scrollWidth > innerWidth + 1,
      clipped: [...element.querySelectorAll('article,h3,li,summary')].some((node) => {
        const bounds = node.getBoundingClientRect()
        return bounds.width > 0 && (bounds.left < -1 || bounds.right > innerWidth + 1)
      }),
    }))
    expect(geometry, `Speaker directory at ${width}px`).toEqual({ overflow: false, clipped: false })
    expect((await summary.boundingBox())!.height).toBeGreaterThanOrEqual(44)
  }
  await summary.click()
  await expect(last).toBeHidden()
  await section.getByRole('link', { name: 'View programme' }).click()
  await expect(page).toHaveURL(`${url}#programme`)
  await expect(page.getByRole('heading', { name: 'Plan your day.' })).toBeInViewport()
})
