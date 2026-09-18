import type { Metadata } from 'next'
import Link from 'next/link'
import type { ReactNode } from 'react'

import { MotionLayer } from '@/components/MotionLayer'
import { GdgLogo } from '@/components/GdgLogo'
import { JsonLd } from '@/components/JsonLd'
import { SiteHeader } from '@/components/SiteHeader'
import { getPartners, getSessions, getSpeakers } from '@/lib/cms-content'
import { absoluteSiteURL, buildPageMetadata } from '@/lib/metadata'
import { getHomeContent } from '@/lib/site-content'

export async function generateMetadata(): Promise<Metadata> {
  const home = await getHomeContent()
  return buildPageMetadata({
    title: `DevFest Nairobi ${home.year}`,
    description: `${home.hero.description} Find confirmed programme, speaker, venue and partner information for DevFest Nairobi ${home.year}.`,
    path: '/devfest',
    keywords: ['DevFest Nairobi', `DevFest Nairobi ${home.year}`, 'Google developer conference Nairobi'],
  })
}

const time = (date: string) => new Intl.DateTimeFormat('en-KE', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Nairobi' }).format(new Date(date))
const isInternal = (url: string) => url.startsWith('/') || url.startsWith('#')

function SmartLink({ children, className, url }: { children: ReactNode; className?: string; url: string }) {
  if (isInternal(url)) return <Link className={className} href={url}>{children}</Link>
  return <a className={className} href={url} rel={url.startsWith('http') ? 'noreferrer' : undefined} target={url.startsWith('http') ? '_blank' : undefined}>{children}</a>
}

export default async function DevFestPage() {
  const [home, speakers, sessions, partners] = await Promise.all([getHomeContent(), getSpeakers(), getSessions(), getPartners()])
  const venue = home.eventDetails
  const eventStructuredData = venue.startsAt ? {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: `DevFest Nairobi ${home.year}`,
    description: home.hero.description,
    startDate: venue.startsAt,
    endDate: venue.endsAt,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    url: absoluteSiteURL('/devfest'),
    organizer: { '@id': `${absoluteSiteURL('/')}#organization` },
    location: venue.venueName ? {
      '@type': 'Place',
      name: venue.venueName,
      address: venue.address ? { '@type': 'PostalAddress', streetAddress: venue.address, addressLocality: 'Nairobi', addressCountry: 'KE' } : undefined,
    } : undefined,
  } : null

  return (
    <main className="site-shell devfest-page" id="main-content" tabIndex={-1}>
      {eventStructuredData && <JsonLd data={eventStructuredData} />}
      <SiteHeader cta={{ href: home.chrome.headerCTA.url, label: home.chrome.headerCTA.label }} links={home.chrome.navigation.map(({ label, url }) => ({ href: url, label }))} siteName={home.chrome.siteName} />

      <header className="devfest-editorial-hero">
        <MotionLayer />
        <div className="devfest-editorial-copy">
          <p className="section-kicker">DevFest · {home.year}</p>
          <h1>DevFest<br />Nairobi.</h1>
          <p className="devfest-editorial-lede"><strong>{home.hero.headline} {home.hero.accentLine}</strong> {home.hero.description}</p>
          <div className="hero-actions">
            <a className="button button-primary" data-analytics="devfest_updates" href={`mailto:gdgnairobi@gmail.com?subject=DevFest%20Nairobi%20${home.year}%20updates`}>Get event updates <span aria-hidden="true">↗</span></a>
            <a className="button button-ghost" href="#programme">View programme <span aria-hidden="true">↓</span></a>
          </div>
          <div className="hero-meta"><span className="status-dot" /><span>{home.status}</span><span className="meta-divider" /><span>{home.locationLabel}</span></div>
        </div>
        <div className="devfest-editorial-orbit" aria-hidden="true">
          <i /><i /><i />
          <span>{home.year}</span>
        </div>
      </header>

      <nav className="devfest-anchor-bar" aria-label="DevFest page sections">
        <a href="#speakers"><small>01</small><strong>Speakers</strong></a>
        <a href="#programme"><small>02</small><strong>Programme</strong></a>
        <a href="#venue"><small>03</small><strong>Venue</strong></a>
        <a href="#partners"><small>04</small><strong>Partners</strong></a>
      </nav>

      <div className="devfest-content">
        <section className="devfest-overview" id="about-devfest">
          <p className="section-kicker">About DevFest</p>
          <h2>One large event in a year-round programme.</h2>
          <p>DevFest brings the chapter together for technical sessions, hands-on learning and time to meet other participants. Confirmed information is published below as it becomes available.</p>
        </section>

        <section className="devfest-detail-section" id="speakers">
          <header><p className="section-kicker">Speakers</p><h2>{speakers.length ? 'Confirmed contributors.' : 'Announcements will appear here.'}</h2></header>
          {speakers.length ? <div className="people-grid">{speakers.map((speaker, index) => <article key={speaker.id}><span>{String(index + 1).padStart(2, '0')}</span><div className="person-signal" aria-hidden="true">{speaker.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}</div><h2>{speaker.name}</h2><p>{[speaker.jobTitle, speaker.company].filter(Boolean).join(' · ')}</p><div>{speaker.topics?.slice(0, 3).map((topic) => <small key={topic}>{topic}</small>)}</div></article>)}</div> : <div className="devfest-pending-card pending-speakers"><div><span>STATUS / PENDING</span><h3>No speaker announcements yet.</h3><p>The CMS will publish confirmed speakers here.</p></div><a className="button button-dark" href={`mailto:gdgnairobi@gmail.com?subject=DevFest%20Nairobi%20${home.year}%20Speaker`}>Contact the team <span>↗</span></a></div>}
        </section>

        <section className="devfest-detail-section" id="programme">
          <header><p className="section-kicker">Programme</p><h2>{sessions.length ? 'Published sessions.' : 'The detailed programme is not published yet.'}</h2></header>
          {sessions.length ? <div className="session-list">{sessions.map((session) => <article key={session.id}><time>{time(session.startsAt)}</time><span>{session.room}</span><div><small>{session.track.replace('-', ' / ')}</small><h2>{session.title}</h2><p>{session.format} · {session.level || 'all levels'}</p></div></article>)}</div> : <div className="day-grid"><article><span>FORMAT 01</span><small>HANDS ON</small><h2>Workshops & codelabs</h2><p>Practical sessions will be added when the programme is confirmed.</p><div className="day-line" /></article><article><span>FORMAT 02</span><small>TALKS</small><h2>Conference sessions</h2><p>Technical talks, panels and community sessions will be listed with times and rooms.</p><div className="day-line" /></article></div>}
        </section>

        <section className="devfest-detail-section" id="venue">
          <header><p className="section-kicker">Venue</p><h2>{venue.venueName ? 'Where to find us.' : 'Venue details are not confirmed.'}</h2></header>
          <div className="location-board"><div className="location-pin" aria-hidden="true"><span>{home.locationLabel}</span><i /></div><div><span>VENUE STATUS</span><h2>{venue.venueName || 'Announcement pending'}</h2><p>{venue.address || 'Transport, parking, accessibility and arrival guidance will be added when the venue is confirmed.'}</p>{venue.mapURL && <a className="button button-dark" href={venue.mapURL} rel="noreferrer" target="_blank">Open map <span>↗</span></a>}</div></div>
        </section>

        <section className="devfest-detail-section" id="partners">
          <header><p className="section-kicker">Partners</p><h2>{partners.length ? 'Organisations supporting the event.' : 'Partnership details will appear here.'}</h2></header>
          {partners.length ? <div className="partner-grid">{partners.map((partner) => <a href={partner.url || '#'} key={partner.id} target={partner.url ? '_blank' : undefined} rel={partner.url ? 'noreferrer' : undefined}><span>{partner.tier}</span><strong>{partner.name}</strong><i>↗</i></a>)}</div> : <div className="partner-pitch"><div><span>01</span><h2>Community access</h2><p>Support attendance, accessible spaces and practical learning.</p></div><div><span>02</span><h2>Programme support</h2><p>Help the volunteer team deliver sessions and event infrastructure.</p></div><div><span>03</span><h2>Clear recognition</h2><p>Partner contributions are credited according to the agreed package.</p></div></div>}
          <a className="wide-cta" data-analytics="devfest_partner" href="mailto:gdgnairobi@gmail.com?subject=Partner%20with%20DevFest%20Nairobi"><span>PARTNERSHIPS</span><strong>Contact the organising team</strong><i>↗</i></a>
        </section>
      </div>

      <footer className="footer">
        <div className="footer-brand"><GdgLogo /></div>
        {home.chrome.footerGroups.map((group) => <div key={group.heading}><span>{group.heading}</span>{group.links.map((link) => <SmartLink key={`${group.heading}-${link.url}`} url={link.url}>{link.label}</SmartLink>)}</div>)}
        <p className="footer-note">{home.chrome.footerNote}</p>
      </footer>
    </main>
  )
}
