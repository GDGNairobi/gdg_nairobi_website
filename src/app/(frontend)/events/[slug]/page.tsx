import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { EditorialPage } from '@/components/EditorialPage'
import { JsonLd } from '@/components/JsonLd'
import { getScheduledEvent, getSessionSpeakers } from '@/lib/community-events'
import { absoluteSiteURL, buildPageMetadata } from '@/lib/metadata'
import type { Session } from '@/payload-types'

const trackNames: Record<Session['track'], string> = {
  ai: 'AI',
  'web-mobile': 'Web & Mobile',
  cloud: 'Cloud & Firebase',
  open: 'Open source & Community',
}
const scheduleTrack = (session: Session) => session.scheduleTrack || trackNames[session.track]

const shiftedDate = (value: string, offsetMinutes: number) => new Date(new Date(value).getTime() + offsetMinutes * 60_000)
const formatTime = (value: string, offsetMinutes: number) => new Intl.DateTimeFormat('en-KE', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Africa/Nairobi',
}).format(shiftedDate(value, offsetMinutes))
const formatDay = (value: string, offsetMinutes: number) => new Intl.DateTimeFormat('en-KE', {
  day: 'numeric',
  month: 'long',
  timeZone: 'Africa/Nairobi',
  weekday: 'long',
  year: 'numeric',
}).format(shiftedDate(value, offsetMinutes))

const statusLabel = {
  complete: 'Event complete',
  delayed: 'Schedule updated',
  live: 'Happening now',
  scheduled: 'Schedule confirmed',
}

function groupBy<T>(items: T[], keyFor: (item: T) => string) {
  const groups = new Map<string, T[]>()
  for (const item of items) {
    const key = keyFor(item)
    groups.set(key, [...(groups.get(key) || []), item])
  }
  return groups
}

export async function generateMetadata({ params }: PageProps<'/events/[slug]'>): Promise<Metadata> {
  const { slug } = await params
  const event = await getScheduledEvent(slug)
  if (!event) return buildPageMetadata({ title: 'Event schedule', description: 'GDG Nairobi event schedule.', path: `/events/${slug}` })
  return buildPageMetadata({
    title: `${event.title} schedule`,
    description: event.description || `View the ${event.scheduleMode === 'multi' ? 'multi-track' : 'single-track'} schedule for ${event.title}.`,
    path: `/events/${slug}`,
    keywords: ['GDG Nairobi schedule', event.title, 'developer event Nairobi'],
  })
}

function SessionCard({ offsetMinutes, session }: { offsetMinutes: number; session: Session }) {
  const speakers = getSessionSpeakers(session)
  return (
    <article className={`schedule-session-card schedule-session-${session.sessionStatus || 'scheduled'}`}>
      <div className="schedule-session-time">
        <time dateTime={shiftedDate(session.startsAt, offsetMinutes).toISOString()}>{formatTime(session.startsAt, offsetMinutes)}</time>
        <span>—</span>
        <time dateTime={shiftedDate(session.endsAt, offsetMinutes).toISOString()}>{formatTime(session.endsAt, offsetMinutes)}</time>
      </div>
      <small>{session.room} · {session.format}</small>
      {session.sessionStatus && session.sessionStatus !== 'scheduled' && <span className="schedule-session-status">{session.sessionStatus === 'live' ? 'Happening now' : session.sessionStatus}</span>}
      <h3>{session.title}</h3>
      {session.publicNote && <p className="schedule-session-note">{session.publicNote}</p>}
      {speakers.length > 0 && <div className="schedule-speakers">{speakers.map((speaker) => (
        <div key={speaker.id}>
          <strong>{speaker.name}</strong>
          {(speaker.jobTitle || speaker.company) && <span>{[speaker.jobTitle, speaker.company].filter(Boolean).join(' · ')}</span>}
        </div>
      ))}</div>}
    </article>
  )
}

export default async function EventSchedulePage({ params }: PageProps<'/events/[slug]'>) {
  const { slug } = await params
  const event = await getScheduledEvent(slug)
  if (!event) notFound()

  const tracks = Array.from(new Set(event.sessions.map(scheduleTrack)))
  const sessionsByDay = groupBy(event.sessions, (session) => formatDay(session.startsAt, event.offsetMinutes))

  return (
    <EditorialPage eyebrow={`${event.date} · ${event.scheduleMode === 'multi' ? 'MULTI-TRACK' : 'SINGLE-TRACK'}`} title={event.title} intro={event.description || 'The live event programme, session times and speakers are published here.'} accent="blue">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'Event',
        name: event.title,
        startDate: event.sessions[0] ? shiftedDate(event.sessions[0].startsAt, event.offsetMinutes).toISOString() : undefined,
        endDate: event.sessions.at(-1) ? shiftedDate(event.sessions.at(-1)!.endsAt, event.offsetMinutes).toISOString() : undefined,
        eventStatus: event.liveStatus === 'complete' ? 'https://schema.org/EventCompleted' : 'https://schema.org/EventScheduled',
        location: event.venue ? { '@type': 'Place', name: event.venue, address: event.address } : undefined,
        organizer: { '@id': `${absoluteSiteURL('/')}#organization` },
        url: absoluteSiteURL(`/events/${slug}`),
      }} />

      <section className={`schedule-live-bar schedule-live-${event.liveStatus}`} aria-label="Live event status">
        <div><span className="status-dot" /><strong>{statusLabel[event.liveStatus]}</strong></div>
        <p>{event.notice || (event.offsetMinutes ? `All programme times are adjusted by ${event.offsetMinutes > 0 ? '+' : ''}${event.offsetMinutes} minutes.` : 'Times shown in East Africa Time.')}</p>
      </section>

      <section className="schedule-event-details" aria-label="Event details">
        <div><span>DATE</span><strong>{event.date}</strong></div>
        <div><span>VENUE</span><strong>{event.venue || 'To be announced'}</strong>{event.address && <small>{event.address}</small>}</div>
        <div><span>REGISTRATION</span><a href={event.registrationURL} rel="noreferrer" target="_blank">Open Community page ↗</a></div>
      </section>

      <section className="event-schedule" aria-labelledby="schedule-heading">
        <header>
          <p className="section-kicker">Programme</p>
          <h2 id="schedule-heading">{event.sessions.length ? 'Plan your day.' : 'The programme is coming soon.'}</h2>
        </header>

        {event.sessions.length > 0 && Array.from(sessionsByDay).map(([day, sessions]) => (
          <div className="schedule-day" key={day}>
            <h3>{day}</h3>
            {event.scheduleMode === 'multi' ? (
              <div className="schedule-multi">
                <div className="schedule-track-labels" style={{ '--track-count': tracks.length } as React.CSSProperties}>
                  <span>TIME</span>{tracks.map((track) => <strong key={track}>{track}</strong>)}
                </div>
                {Array.from(groupBy(sessions, (session) => shiftedDate(session.startsAt, event.offsetMinutes).toISOString())).map(([start, simultaneous]) => (
                  <div className="schedule-row" key={start} style={{ '--track-count': tracks.length } as React.CSSProperties}>
                    <time>{formatTime(simultaneous[0].startsAt, event.offsetMinutes)}</time>
                    {tracks.map((track) => {
                      const session = simultaneous.find((candidate) => scheduleTrack(candidate) === track)
                      return session ? <SessionCard key={session.id} offsetMinutes={event.offsetMinutes} session={session} /> : <div className="schedule-gap" aria-hidden="true" key={track} />
                    })}
                  </div>
                ))}
              </div>
            ) : (
              <div className="schedule-single">{sessions.map((session) => <SessionCard key={session.id} offsetMinutes={event.offsetMinutes} session={session} />)}</div>
            )}
          </div>
        ))}
      </section>

      <div className="schedule-source-note"><span>CANONICAL EVENT</span><p>This schedule enriches the synchronized GDG Nairobi event record, so there is no duplicate event to maintain.</p><a href={event.communityURL} rel="noreferrer" target="_blank">View original listing ↗</a></div>
    </EditorialPage>
  )
}
