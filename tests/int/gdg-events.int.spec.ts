import { describe, expect, it } from 'vitest'

import { parseChapterEvents } from '@/lib/gdg-events'

const event = {
  cohost_registration_url: 'https://gdg.community.dev/events/details/devfest-nairobi/',
  cropped_picture_url: 'https://res.cloudinary.com/startup-grind/image/upload/sample.png',
  description_short: '<p>Build &amp; learn together.</p>',
  event_type_title: 'Free registration',
  start_date: '2026-11-06T05:00:00Z',
  title: 'DevFest Nairobi 2026',
  url: 'https://gdg.community.dev/events/details/devfest-nairobi/',
}

const page = (payload: unknown) => `<html><body><script id="__NEXT_DATA__" type="application/json">${JSON.stringify(payload)}</script></body></html>`

describe('GDG Nairobi chapter parser', () => {
  it('normalizes live and completed events from the embedded page payload', () => {
    const events = parseChapterEvents(page({
      props: {
        pageProps: {
          prerenderData: {
            pastEvents: { results: [{ ...event, title: 'DevFest Nairobi 2025' }] },
            upcomingEvents: { results: [event] },
          },
        },
      },
    }))

    expect(events).toHaveLength(2)
    expect(events[0]).toMatchObject({
      excerpt: 'Build & learn together.',
      sourceTitle: 'DevFest Nairobi 2026',
      upstreamStatus: 'live',
    })
    expect(events[1].upstreamStatus).toBe('completed')
  })

  it('rejects malformed or missing embedded data', () => {
    expect(() => parseChapterEvents('<html />')).toThrow(/embedded event data/i)
    expect(() => parseChapterEvents(page({ props: {} }))).toThrow(/changed shape/i)
  })

  it('drops untrusted event and image URLs', () => {
    const events = parseChapterEvents(page({
      props: {
        pageProps: {
          prerenderData: {
            upcomingEvents: { results: [{ ...event, url: 'https://example.com/fake' }] },
            pastEvents: { results: [] },
          },
        },
      },
    }))
    expect(events).toEqual([])
  })
})
