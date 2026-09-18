import type { Metadata } from 'next'

import { EditorialPage } from '@/components/EditorialPage'
import { JsonLd } from '@/components/JsonLd'
import { getCommunityEventCards } from '@/lib/community-events'
import { buildPageMetadata } from '@/lib/metadata'

export const metadata: Metadata = buildPageMetadata({
  title: 'Developer events in Nairobi',
  description: 'Browse upcoming GDG Nairobi meetups, workshops, codelabs and community events, with registration on the official chapter page.',
  path: '/events',
  keywords: ['developer events Nairobi', 'tech meetups Nairobi', 'GDG Nairobi events', 'coding workshops Nairobi'],
})

export default async function EventsPage() {
  const events = await getCommunityEventCards(8)
  return (
    <EditorialPage eyebrow="THE ROOT SYSTEM" title="Nairobi keeps building." intro="DevFest is one moment in a year-round rhythm of workshops, codelabs, meetups and conversations led by the GDG Nairobi community." accent="green">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'GDG Nairobi community events',
        itemListElement: events.map((event, index) => ({ '@type': 'ListItem', position: index + 1, name: event.title, url: event.href })),
      }} />
      <div className="editorial-list">
        {events.map((event, index) => (
          <a href={event.href} target="_blank" rel="noreferrer" key={event.href}>
            <span>0{index + 1}</span><time>{event.date}</time><div><h2>{event.title}</h2><p>{event.type}</p></div><i>↗</i>
          </a>
        ))}
      </div>
      <div className="info-callout"><span>LIVE SOURCE</span><p>Event details are refreshed from the official chapter page and registration always stays with GDG Nairobi.</p><a href="https://gdg.community.dev/gdg-nairobi/">Visit the official chapter ↗</a></div>
    </EditorialPage>
  )
}
