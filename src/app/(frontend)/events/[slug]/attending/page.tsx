import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { AttendeePoster } from '@/components/AttendeePoster'
import { SiteHeader } from '@/components/SiteHeader'
import { getPublicEvents } from '@/lib/community-events'
import { formatEventDate } from '@/lib/event-dates'
import { buildPageMetadata } from '@/lib/metadata'
import { getSiteChromeContent } from '@/lib/site-content'
import styles from '@/components/AttendeePoster.module.css'

export const metadata: Metadata = {
  ...buildPageMetadata({
    title: 'Your DevFest Nairobi 2026 attendee poster',
    description:
      'Add your photo and make a personal I’m attending poster for DevFest Nairobi 2026.',
    path: '/events/devfest-nairobi-2026/attending',
    image: { url: '/social-card/devfest-nairobi-2026', alt: 'DevFest Nairobi 2026' },
  }),
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
}

export default async function AttendingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  if (slug !== 'devfest-nairobi-2026') notFound()
  const [events, chrome] = await Promise.all([getPublicEvents(), getSiteChromeContent()])
  const event = events.find((item) => item.slug === slug)
  if (!event) notFound()
  return (
    <main id="main-content" tabIndex={-1} className={styles.page}>
      <SiteHeader
        siteName={chrome.siteName}
        links={chrome.navigation.map(({ label, url }) => ({ href: url, label }))}
        cta={{ href: chrome.headerCTA.url, label: chrome.headerCTA.label }}
      />
      <header className={styles.heading}>
        <p className={styles.kicker}>DevFest Nairobi · {event.year || 2026}</p>
        <h1>Make your DevFest poster.</h1>
        <p>Add your name and photo, then download your poster.</p>
      </header>
      <AttendeePoster
        details={{
          title: event.title,
          year: event.year || 2026,
          date: formatEventDate(event.startsAt, event.year),
          venue: event.days?.[0]?.venueName || 'Venue details to follow',
        }}
      />
    </main>
  )
}
