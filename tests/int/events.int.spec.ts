import { describe, expect, it, vi } from 'vitest'
vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('payload', () => ({ getPayload: vi.fn() }))
import { partitionEvents, toEventCard } from '@/lib/community-events'
import {
  buildCountdownEvents,
  calendarDaysUntil,
  getImminentEvent,
  type CountdownEvent,
} from '@/lib/event-countdown'
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

describe('Upcoming event countdown', () => {
  it('uses editorial and programme times before imported times, and preserves date-only precision', () => {
    const base = event({
      days: [{ title: 'Conference', date: '2026-11-14T00:00:00Z' }],
      sourceStartDate: '2026-11-14T09:00:00Z',
      scheduleOffsetMinutes: 15,
    })
    const first = new Map([[base.id, '2026-11-14T05:00:00Z']])
    expect(buildCountdownEvents([base], first)[0]).toMatchObject({
      startsAt: '2026-11-14T05:15:00.000Z',
      precision: 'time',
    })
    expect(
      buildCountdownEvents([{ ...base, scheduleStartOverride: '2026-11-14T06:00:20Z' }], first)[0]
        .startsAt,
    ).toBe('2026-11-14T06:00:00.000Z')
    expect(buildCountdownEvents([base], new Map())[0].startsAt).toBe('2026-11-14T09:00:00Z')
    expect(
      buildCountdownEvents(
        [{ ...base, days: [{ title: 'Moved day', date: '2026-11-15T00:00:00Z' }] }],
        new Map(),
      )[0],
    ).toMatchObject({ startsAt: '2026-11-15T00:00:00+03:00', precision: 'date' })
    expect(
      buildCountdownEvents(
        [event({ id: 99 }), { ...base, liveStatus: 'live' }, { ...base, liveStatus: 'complete' }],
        first,
      ),
    ).toEqual([])
  })

  it('opens at exactly seven days, chooses the nearest event, and moves on after its start', () => {
    const first: CountdownEvent = {
      id: 1,
      title: 'First event',
      href: '/events/first',
      startsAt: '2026-11-14T05:00:00Z',
      precision: 'time',
    }
    const second: CountdownEvent = { ...first, id: 2, startsAt: '2026-11-15T05:00:00Z' }
    expect(getImminentEvent([second, first], Date.parse('2026-11-07T04:59:59Z'))).toBeNull()
    expect(getImminentEvent([second, first], Date.parse('2026-11-07T05:00:00Z'))?.id).toBe(1)
    expect(getImminentEvent([second, first], Date.parse('2026-11-14T05:00:00Z'))?.id).toBe(2)
    expect(getImminentEvent([second, first], Date.parse('2026-11-15T05:00:00Z'))).toBeNull()
  })

  it('uses Nairobi calendar days for date-only events, including today and the end of the event day', () => {
    const dates = buildCountdownEvents(
      [event({ days: [{ title: 'Day', date: '2026-11-14T00:00:00Z' }] })],
      new Map(),
    )
    expect(getImminentEvent(dates, Date.parse('2026-11-06T20:59:59Z'))).toBeNull()
    expect(getImminentEvent(dates, Date.parse('2026-11-06T21:00:00Z'))?.precision).toBe('date')
    expect(calendarDaysUntil(dates[0].startsAt, Date.parse('2026-11-13T21:30:00Z'))).toBe(0)
    expect(getImminentEvent(dates, Date.parse('2026-11-14T20:59:59Z'))?.id).toBe(1)
    expect(getImminentEvent(dates, Date.parse('2026-11-14T21:00:00Z'))).toBeNull()
  })
})
