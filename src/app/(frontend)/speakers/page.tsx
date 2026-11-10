import { redirect } from 'next/navigation'
import { getFeaturedEvent, getScheduledEvent } from '@/lib/community-events'
import { getProgrammeSpeakers, toProgrammeSession } from '@/lib/programme'

export default async function EventSectionRedirect() {
  const event = await getFeaturedEvent('devfest')
  if (!event?.slug) redirect('/events')
  const detail = await getScheduledEvent(event.slug)
  const speakers = getProgrammeSpeakers(
    (detail?.sessions || []).map((session) => toProgrammeSession(session)),
  )
  redirect(`${event.href}#${speakers.length ? 'speakers' : 'programme'}`)
}
