import type { EventCard } from '@/lib/community-events'
import { eventDayKey } from '@/lib/event-dates'

const day = 86400000
export type CountdownEvent = {
  id: number
  title: string
  href: string
  startsAt: string
  precision: 'time' | 'date'
}

type EventTiming = Pick<
  EventCard,
  | 'id'
  | 'title'
  | 'href'
  | 'days'
  | 'sourceStartDate'
  | 'scheduleStartOverride'
  | 'scheduleOffsetMinutes'
  | 'liveStatus'
>

export function buildCountdownEvents(
  events: EventTiming[],
  firstSessions: Map<number, string>,
): CountdownEvent[] {
  return events.flatMap((event) => {
    if (event.liveStatus === 'live' || event.liveStatus === 'complete') return []
    const date = event.days?.[0]?.date
    const first = firstSessions.get(event.id)
    const source = event.sourceStartDate
    const override = event.scheduleStartOverride
    const firstTime = first ? Date.parse(first) : NaN
    const overrideTime = override ? Date.parse(override) : NaN
    const offset =
      Number.isFinite(overrideTime) && Number.isFinite(firstTime)
        ? Math.round((overrideTime - firstTime) / 60000)
        : event.scheduleOffsetMinutes || 0
    const timed =
      (Number.isFinite(firstTime) ? new Date(firstTime + offset * 60000).toISOString() : null) ||
      (Number.isFinite(overrideTime) ? override : null) ||
      (source &&
      Number.isFinite(Date.parse(source)) &&
      (!date || eventDayKey(source) === eventDayKey(date))
        ? source
        : null)
    const startsAt =
      timed || (date && eventDayKey(date) ? `${eventDayKey(date)}T00:00:00+03:00` : null)
    if (!startsAt || !Number.isFinite(Date.parse(startsAt))) return []
    return [
      {
        id: event.id,
        title: event.title,
        href: event.href,
        startsAt,
        precision: timed ? ('time' as const) : ('date' as const),
      },
    ]
  })
}

export const calendarDaysUntil = (startsAt: string, now: number) =>
  Math.round(
    (Date.parse(eventDayKey(startsAt)) - Date.parse(eventDayKey(new Date(now).toISOString()))) /
      day,
  )

export const countdownExpiresAt = (event: CountdownEvent) =>
  Date.parse(event.startsAt) + (event.precision === 'date' ? day : 0)

export function getImminentEvent(events: CountdownEvent[], now: number): CountdownEvent | null {
  return (
    events
      .filter((event) => {
        if (event.precision === 'date') {
          const days = calendarDaysUntil(event.startsAt, now)
          return days >= 0 && days <= 7
        }
        const remaining = Date.parse(event.startsAt) - now
        return remaining > 0 && remaining <= 7 * day
      })
      .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt) || a.id - b.id)[0] || null
  )
}
