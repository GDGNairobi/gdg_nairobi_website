import { describe, expect, it, vi } from 'vitest'
vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('payload', () => ({ getPayload: vi.fn() }))
import { partitionEvents, toEventCard } from '@/lib/community-events'
import type { CommunityEvent } from '@/payload-types'
const event = (changes: Partial<CommunityEvent>) =>
  toEventCard({
    id: 1,
    localTitle: 'Event',
    source: 'manual',
    slug: 'event',
    eventKind: 'community',
    createdAt: '',
    updatedAt: '',
    ...changes,
  })
describe('Unified event listing', () => {
  it('separates upcoming, past, same-day and undated events in Nairobi time', () => {
    const groups = partitionEvents(
      [
        event({ id: 1, days: [{ title: 'Day', date: '2026-11-14T00:00:00Z' }] }),
        event({ id: 2, slug: 'past', days: [{ title: 'Day', date: '2026-06-20T00:00:00Z' }] }),
        event({ id: 3, slug: 'today', days: [{ title: 'Day', date: '2026-10-29T00:00:00Z' }] }),
        event({ id: 4, slug: 'unknown' }),
        event({ id: 5, slug: 'history', editionYear: 2025 }),
      ],
      new Date('2026-10-28T22:00:00Z'),
    )
    expect(groups.upcoming.map((e) => e.id)).toEqual([3, 1])
    expect(groups.past.map((e) => e.id)).toEqual([2, 5])
    expect(groups.undated[0].id).toBe(4)
  })
  it('keeps one DevFest record per edition and favours its configured days', () => {
    const groups = partitionEvents(
      [
        event({ id: 1, slug: 'stub', eventKind: 'devfest', editionYear: 2026 }),
        event({
          id: 2,
          slug: 'devfest-2026',
          eventKind: 'devfest',
          editionYear: 2026,
          days: [{ title: 'Conference', date: '2026-11-14T00:00:00Z' }],
        }),
      ],
      new Date('2026-10-29'),
    )
    expect(groups.upcoming).toHaveLength(1)
    expect(groups.undated).toHaveLength(0)
    expect(groups.upcoming[0].id).toBe(2)
  })
  it('keeps a multi-day event upcoming until its last day ends', () => {
    const groups = partitionEvents(
      [
        event({
          days: [
            { title: 'Day 1', date: '2026-10-28T00:00:00Z' },
            { title: 'Day 2', date: '2026-10-29T00:00:00Z' },
          ],
        }),
      ],
      new Date('2026-10-29T18:00:00Z'),
    )
    expect(groups.upcoming).toHaveLength(1)
  })
})
