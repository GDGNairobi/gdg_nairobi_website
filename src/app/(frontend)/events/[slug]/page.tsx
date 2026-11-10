import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { mediaURL } from '@/lib/media-url'
import { EditorialPage } from '@/components/EditorialPage'
import { EventMedia } from '@/components/EventMedia'
import { EventProgramme } from '@/components/EventProgramme'
import { EventSpeakers } from '@/components/EventSpeakers'
import { EventPartners } from '@/components/EventPartners'
import { getProgrammeSpeakers, toProgrammeSession } from '@/lib/programme'
import { JsonLd } from '@/components/JsonLd'
import { getEventPartners, getScheduledEvent } from '@/lib/community-events'
import { eventDayKey, formatEventDay } from '@/lib/event-dates'
import { absoluteSiteURL, buildPageMetadata } from '@/lib/metadata'

export async function generateMetadata({ params }: PageProps<'/events/[slug]'>): Promise<Metadata> {
  const { slug } = await params,
    detail = await getScheduledEvent(slug)
  return buildPageMetadata({
    title: detail?.event.title || 'Community event',
    description:
      detail?.event.localDescription || detail?.event.excerpt || 'Join the GDG Nairobi community.',
    path: `/events/${slug}`,
  })
}
export default async function EventPage({ params }: PageProps<'/events/[slug]'>) {
  const { slug } = await params,
    detail = await getScheduledEvent(slug)
  if (!detail) notFound()
  const { event, sessions, offsetMinutes } = detail
  const partners = await getEventPartners(event)
  const programme = sessions.map((session) => toProgrammeSession(session, offsetMinutes))
  const speakers = event.eventKind === 'devfest' ? getProgrammeSpeakers(programme) : []
  const past =
    event.liveStatus === 'complete' ||
    (event.days?.at(-1)?.date
      ? eventDayKey(event.days.at(-1)!.date) < eventDayKey(new Date().toISOString())
      : Boolean(event.year && event.year < new Date().getFullYear()))
  const cover = typeof event.coverImage === 'object' ? event.coverImage : null
  const videos = (event.videos || []).map((v) => ({ title: v.title, url: v.url })),
    albums = (event.albums || []).filter((a) => a.url).map((a) => ({ title: a.title, url: a.url! }))
  const status = past
    ? 'Past event'
    : event.liveStatus === 'live'
      ? 'Happening now'
      : event.liveStatus === 'delayed'
        ? 'Programme updated'
        : sessions.length
          ? 'Programme published'
          : 'Programme in preparation'
  return (
    <EditorialPage
      eyebrow={`${event.date} · ${event.type}`}
      title={event.title}
      intro={
        event.localDescription || event.excerpt || 'Learn, connect and build with the community.'
      }
      accent="blue"
    >
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Event',
          name: event.title,
          startDate: event.days?.[0]?.date ? eventDayKey(event.days[0].date) : event.startsAt,
          endDate: event.days?.at(-1)?.date ? eventDayKey(event.days.at(-1)!.date) : undefined,
          eventStatus: 'https://schema.org/EventScheduled',
          url: absoluteSiteURL(event.href),
          organizer: { '@id': `${absoluteSiteURL('/')}#organization` },
          location: event.days?.flatMap((day) =>
            day.venueName
              ? [{ '@type': 'Place', name: day.venueName, address: day.venueAddress }]
              : [],
          ),
        }}
      />
      <div className="event-detail-actions">
        {event.eventKind !== 'devfest' && !past && event.registrationStatus !== 'closed' && (
          <a
            className="button button-primary"
            href={event.registrationLink}
            target="_blank"
            rel="noreferrer"
          >
            {event.registrationButton} ↗
          </a>
        )}
        <a className="button button-ghost" href="#programme">
          View programme ↓
        </a>
        {speakers.length > 0 && (
          <a className="button button-ghost" href="#speakers">
            Meet the speakers ↓
          </a>
        )}
      </div>
      {event.tagline && <p className="event-tagline">{event.tagline}</p>}
      {cover?.url && (
        <div className="event-cover">
          <Image
            src={mediaURL(cover.url)}
            alt={cover.alt}
            fill
            sizes="(max-width: 380px) calc(100vw - 36px), (max-width: 900px) calc(100vw - 44px), 86vw"
          />
        </div>
      )}
      {event.eventKind !== 'devfest' && (
        <section className="schedule-live-bar" aria-label="Event status">
          <strong>{status}</strong>
          <p>
            {event.scheduleNotice ||
              (offsetMinutes
                ? `Programme times adjusted by ${offsetMinutes} minutes.`
                : 'Times shown in East Africa Time.')}
          </p>
        </section>
      )}
      <section id="venue" className="event-days" aria-labelledby="event-days-heading">
        <p className="section-kicker">Your event, day by day</p>
        <h2 id="event-days-heading">Days & venues</h2>
        {event.days?.map((day) => (
          <article className="event-day-card" key={day.id || day.date}>
            <div>
              <small>{day.title}</small>
              <h3>{formatEventDay(day.date)}</h3>
              {day.description && <p>{day.description}</p>}
            </div>
            <div>
              <h4>{day.venueName || 'Venue details to follow'}</h4>
              {day.venueAddress && <p>{day.venueAddress}</p>}
              <div className="event-venue-links">
                {day.mapURL && (
                  <a href={day.mapURL} target="_blank" rel="noreferrer">
                    Get directions ↗
                  </a>
                )}
                {day.venueWebsite && (
                  <a href={day.venueWebsite} target="_blank" rel="noreferrer">
                    Visit venue website ↗
                  </a>
                )}
              </div>
            </div>
          </article>
        ))}
        {!event.days?.length && (
          <p>
            {past
              ? 'Photos and highlights from this edition are below.'
              : 'Dates and venue details will be added here.'}
          </p>
        )}
      </section>
      <section id="programme" className="event-programme" aria-labelledby="programme-heading">
        <p className="section-kicker">Programme</p>
        <h2 id="programme-heading">
          {sessions.length
            ? 'Plan your day.'
            : past
              ? 'A look back.'
              : 'Session details are on their way.'}
        </h2>
        {!sessions.length && (
          <p>
            {past
              ? 'Explore the community’s moments from this event.'
              : 'The date and venue are confirmed where listed above. We’ll publish session times and speakers as they are ready.'}
          </p>
        )}
        {sessions.length > 0 && (
          <EventProgramme
            eventID={event.id}
            singleTrack={event.scheduleMode === 'single'}
            sessions={programme}
          />
        )}
      </section>
      <EventSpeakers speakers={speakers} />
      <EventPartners partners={partners} />
      {(videos.length > 0 || albums.length > 0) && (
        <section id="highlights" className="event-programme">
          <p className="section-kicker">From the community</p>
          <h2>Event highlights</h2>
          <EventMedia videos={videos} albums={albums} />
        </section>
      )}
    </EditorialPage>
  )
}
