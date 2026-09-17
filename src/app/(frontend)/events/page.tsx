import type { Metadata } from 'next'

import { EditorialPage } from '@/components/EditorialPage'
import { getCommunityEventCards } from '@/lib/community-events'

export const metadata: Metadata = { title: 'Community events' }

export default async function EventsPage() {
  const events = await getCommunityEventCards(8)
  return (
    <EditorialPage eyebrow="THE ROOT SYSTEM" title="Nairobi keeps building." intro="DevFest is one moment in a year-round rhythm of workshops, codelabs, meetups and conversations led by the GDG Nairobi community." accent="green">
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
