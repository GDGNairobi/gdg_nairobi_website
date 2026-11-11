import { describe, expect, it } from 'vitest'
import { getEventRewind } from '@/lib/event-rewind'
import type { CommunityEvent } from '@/payload-types'

const event = (overrides: Partial<CommunityEvent> = {}): CommunityEvent => ({
  id: 1,
  localTitle: 'DevFest Nairobi 2026',
  slug: 'devfest-nairobi-2026',
  eventKind: 'devfest',
  source: 'manual',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  ...overrides,
})

describe('Event photo rewind editorial boundaries', () => {
  it('keeps the 2025 archive scoped to the approved edition and honours hiding it', () => {
    expect(getEventRewind(event())?.year).toBe(2025)
    expect(getEventRewind(event({ slug: 'devfest-nairobi-2027' }))).toBeNull()
    expect(getEventRewind(event({ eventKind: 'community' }))).toBeNull()
    expect(getEventRewind(event({ photoRewind: { hidden: true } }))).toBeNull()
    expect(getEventRewind(event({ photoRewind: { year: 2024 } }))).toBeNull()
  })

  it('uses CMS copy, links and uploaded photos without mixing in the fallback selection', () => {
    const result = getEventRewind(
      event({
        slug: 'devfest-nairobi-2027',
        photoRewind: {
          year: 2026,
          heading: 'Our last gathering.',
          dayOneAlbumURL: 'https://example.com/photos',
          photos: [
            {
              image: {
                id: 2,
                alt: 'Audience following a talk',
                url: '/api/media/file/audience.webp',
                width: 1400,
                height: 900,
                createdAt: '',
                updatedAt: '',
              },
              caption: 'Learning together',
              day: 'Day 1',
            },
          ],
        },
      }),
    )
    expect(result).toMatchObject({
      year: 2026,
      heading: 'Our last gathering.',
      albums: [{ label: 'Day 1 album', url: 'https://example.com/photos' }],
    })
    expect(result?.photos).toEqual([
      {
        src: '/api/media/file/audience.webp',
        alt: 'Audience following a talk',
        caption: 'Learning together',
        day: 'Day 1',
        width: 1400,
        height: 900,
      },
    ])
  })

  it('does not invent an archive year or render unresolved uploads on another edition', () => {
    expect(
      getEventRewind(
        event({
          slug: 'devfest-nairobi-2027',
          photoRewind: { photos: [{ image: 3, caption: 'A session' }] },
        }),
      ),
    ).toBeNull()
  })
})
