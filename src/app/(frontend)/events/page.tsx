import type { Metadata } from 'next'
import Link from 'next/link'
import { EditorialPage } from '@/components/EditorialPage'
import { JsonLd } from '@/components/JsonLd'
import { getEventIndex, type EventCard } from '@/lib/community-events'
import { buildPageMetadata } from '@/lib/metadata'
import { absoluteSiteURL } from '@/lib/metadata'

export const metadata: Metadata = buildPageMetadata({
  title: 'Developer events in Nairobi',
  description:
    'Find your next GDG Nairobi event and explore past meetups, workshops and DevFest editions.',
  path: '/events',
})
function EventList({ events }: { events: EventCard[] }) {
  return (
    <div className="editorial-list">
      {events.map((event, index) => (
        <Link href={event.href} key={event.id}>
          <span>{String(index + 1).padStart(2, '0')}</span>
          <time dateTime={event.startsAt}>{event.date}</time>
          <div>
            <h3>{event.title}</h3>
            <p>
              {event.type}
              {event.days && event.days.length > 1 ? ` · ${event.days.length} days` : ''}
            </p>
          </div>
          <i aria-hidden="true">→</i>
        </Link>
      ))}
    </div>
  )
}
export default async function EventsPage() {
  const { upcoming, past, undated } = await getEventIndex()
  const years = [...new Set(past.map((e) => e.year))].sort((a, b) => (b || 0) - (a || 0))
  return (
    <EditorialPage
      eyebrow="LEARN · CONNECT · BUILD"
      title="Find your next community."
      intro="Join a workshop, share an idea or spend a day with people who love building. There is a seat for you here."
      accent="green"
    >
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: 'GDG Nairobi events',
          itemListElement: [...upcoming, ...past, ...undated].map((e, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: e.title,
            url: absoluteSiteURL(e.href),
          })),
        }}
      />
      <section className="event-index-section" aria-labelledby="upcoming-title">
        <p className="section-kicker">What’s next</p>
        <h2 id="upcoming-title">Upcoming events</h2>
        {upcoming.length ? (
          <EventList events={upcoming} />
        ) : (
          <p>We’re preparing our next events. Join the chapter for updates.</p>
        )}
      </section>
      {undated.length > 0 && (
        <section className="event-index-section">
          <h2>Dates coming soon</h2>
          <EventList events={undated} />
        </section>
      )}
      <section className="event-index-section" id="past-events" aria-labelledby="past-title">
        <p className="section-kicker">The archive</p>
        <h2 id="past-title">Past events</h2>
        {years.map((year) => (
          <section className="event-archive-year" key={year || 'undated'}>
            <h3>{year || 'Earlier events'}</h3>
            <EventList events={past.filter((e) => e.year === year)} />
          </section>
        ))}
        {past.length === 0 && <p>Past events will appear here with their photos and highlights.</p>}
      </section>
      <a
        className="wide-cta"
        href="https://gdg.community.dev/gdg-nairobi/"
        target="_blank"
        rel="noreferrer"
      >
        <span>COME AS YOU ARE</span>
        <strong>Join GDG Nairobi</strong>
        <i aria-hidden="true">↗</i>
      </a>
    </EditorialPage>
  )
}
