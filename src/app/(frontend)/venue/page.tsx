import type { Metadata } from 'next'

import { EditorialPage } from '@/components/EditorialPage'
import { getHomeContent } from '@/lib/site-content'

export const metadata: Metadata = { title: 'Nairobi' }

export default async function VenuePage() {
  const home = await getHomeContent()
  const venue = home.eventDetails
  const confirmed = Boolean(venue.venueName)

  return (
    <EditorialPage eyebrow="THE CITY IS PART OF THE PROGRAM" title="Meet us in Nairobi." intro={confirmed ? `DevFest Nairobi will take place at ${venue.venueName}.` : 'The final venue is being prepared. When it is confirmed, this page will hold everything you need to arrive without guesswork.'} accent="yellow">
      <div className="location-board">
        <div className="location-pin" aria-hidden="true"><span>{home.locationLabel}</span><i /></div>
        <div>
          <span>VENUE STATUS</span>
          <h2>{venue.venueName || 'Location announcement coming soon.'}</h2>
          <p>{venue.address || 'Expect clear public transport, parking, accessibility, arrival and nearby accommodation guidance here—not just a map pin.'}</p>
          {venue.mapURL && <a className="button button-dark" href={venue.mapURL} rel="noreferrer" target="_blank">Open map <span>↗</span></a>}
        </div>
      </div>
    </EditorialPage>
  )
}
