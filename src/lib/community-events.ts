import config from '@payload-config'
import { getPayload } from 'payload'
import { cache } from 'react'

import { eventDayKey, formatEventDate } from '@/lib/event-dates'
import { GDG_NAIROBI_CHAPTER_URL } from '@/lib/gdg-events'
import type { CommunityEvent, Session, Speaker } from '@/payload-types'

export type EventCard = CommunityEvent & {
  title: string
  href: string
  date: string
  year?: number
  startsAt?: string
  external: false
  type: string
  registrationLink: string
  registrationButton: string
}
export type CommunityEventCard = EventCard

export function toEventCard(event: CommunityEvent): EventCard {
  const days = [...(event.days || [])].sort((a, b) => a.date.localeCompare(b.date))
  const startsAt = days[0]?.date || event.sourceStartDate || undefined
  const year = startsAt ? Number(eventDayKey(startsAt).slice(0, 4)) : event.editionYear || undefined
  const title = event.localTitle || event.sourceTitle || 'Community event'
  return {
    ...event,
    days,
    title,
    href: `/events/${event.slug}`,
    startsAt,
    year,
    external: false,
    date: formatEventDate(startsAt, year),
    type: event.localLabel || (event.eventKind === 'devfest' ? 'DevFest' : 'Community event'),
    registrationLink:
      event.localRegistrationURL ||
      event.registrationURL ||
      event.upstreamURL ||
      GDG_NAIROBI_CHAPTER_URL,
    registrationButton: event.registrationLabel || `Register for ${title}`,
  }
}

export function partitionEvents(events: EventCard[], now = new Date()) {
  const today = eventDayKey(now.toISOString())
  const unique = new Map<string, EventCard>()
  for (const event of events) {
    const key =
      event.eventKind === 'devfest' && event.year
        ? `devfest-${event.year}`
        : event.slug || String(event.id)
    const previous = unique.get(key)
    if (!previous || (event.days?.length || 0) > (previous.days?.length || 0))
      unique.set(key, event)
  }
  const upcoming: EventCard[] = [],
    past: EventCard[] = [],
    undated: EventCard[] = []
  for (const event of unique.values()) {
    const lastDate = event.days?.at(-1)?.date || event.startsAt
    if (
      event.liveStatus === 'complete' ||
      (lastDate && eventDayKey(lastDate) < today) ||
      (!lastDate && event.year && event.year < Number(today.slice(0, 4)))
    )
      past.push(event)
    else if (lastDate) upcoming.push(event)
    else undated.push(event)
  }
  upcoming.sort((a, b) => (a.startsAt || '').localeCompare(b.startsAt || ''))
  past.sort((a, b) =>
    (b.startsAt || `${b.year || 0}`).localeCompare(a.startsAt || `${a.year || 0}`),
  )
  return { upcoming, past, undated }
}

export const getPublicEvents = cache(async (): Promise<EventCard[]> => {
  if (process.env.ENABLE_CMS !== 'true' && process.env.VERCEL !== '1') return []
  try {
    const payload = await getPayload({ config })
    const events: CommunityEvent[] = []
    let page = 1
    while (true) {
      const result = await payload.find({
        collection: 'community-events',
        depth: 1,
        limit: 100,
        page,
        overrideAccess: false,
        draft: false,
        where: { showOnSite: { equals: true } },
        sort: ['displayOrder', '-sourceStartDate'],
      })
      events.push(...result.docs)
      if (!result.hasNextPage) break
      page++
    }
    return events.filter((e) => Boolean(e.slug)).map(toEventCard)
  } catch {
    return []
  }
})
export async function getEventIndex() {
  return partitionEvents(await getPublicEvents())
}
export async function getCommunityEventCards(limit = 3) {
  return (await getEventIndex()).upcoming.slice(0, limit)
}
export async function getFeaturedEvent(kind?: CommunityEvent['eventKind']) {
  const { upcoming, past, undated } = await getEventIndex()
  const eligible = [...upcoming, ...undated, ...past].filter((e) => !kind || e.eventKind === kind)
  return (
    eligible
      .filter((e) => e.featured)
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))[0] ||
    (kind ? eligible[0] : undefined)
  )
}
export const getSessionSpeakers = (session: Session) =>
  (session.speakers || []).filter((s): s is Speaker => typeof s !== 'number')

export async function getScheduledEvent(slug: string) {
  const event = (await getPublicEvents()).find((e) => e.slug === slug)
  if (!event) return null
  try {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'sessions',
      depth: 2,
      limit: 0,
      pagination: false,
      overrideAccess: false,
      draft: false,
      sort: ['startsAt', 'scheduleTrack', 'room'],
      where: { event: { equals: event.id } },
    })
    const first = result.docs[0]
    const offsetMinutes =
      event.scheduleStartOverride && first
        ? Math.round(
            (new Date(event.scheduleStartOverride).getTime() - new Date(first.startsAt).getTime()) /
              60000,
          )
        : event.scheduleOffsetMinutes || 0
    return { event, sessions: result.docs, offsetMinutes }
  } catch {
    return { event, sessions: [] as Session[], offsetMinutes: 0 }
  }
}
