import Image from 'next/image'
import Link from 'next/link'
import type { ReactNode } from 'react'

import { MotionLayer } from '@/components/MotionLayer'
import { GdgLogo } from '@/components/GdgLogo'
import { SiteHeader } from '@/components/SiteHeader'
import { getCommunityEventCards } from '@/lib/community-events'
import { getHomeContent } from '@/lib/site-content'

import './styles.css'

const isInternal = (url: string) => url.startsWith('/') || url.startsWith('#')

function SmartLink({ children, className, eventName, url }: { children: ReactNode; className?: string; eventName?: string; url: string }) {
  const analytics = eventName ? { 'data-analytics': eventName } : undefined
  if (isInternal(url)) return <Link className={className} href={url} {...analytics}>{children}</Link>
  return <a className={className} href={url} rel={url.startsWith('http') ? 'noreferrer' : undefined} target={url.startsWith('http') ? '_blank' : undefined} {...analytics}>{children}</a>
}

export default async function HomePage() {
  const [communityEvents, home] = await Promise.all([getCommunityEventCards(3), getHomeContent()])
  const community = home.community
  const nextEvent = communityEvents[0]
  const tickerItems = Array.from({ length: 4 }, () => home.ticker.items).flat()

  return (
    <main className="site-shell community-site" id="main-content" tabIndex={-1}>
      <SiteHeader
        cta={{ href: home.chrome.headerCTA.url, label: home.chrome.headerCTA.label }}
        links={home.chrome.navigation.map(({ label, url }) => ({ href: url, label }))}
        siteName={home.chrome.siteName}
      />

      <section className="hero" id="top">
        <MotionLayer />
        <div className="hero-noise" aria-hidden="true" />
        <div className="hero-copy">
          <p className="eyebrow"><span>{community.hero.eyebrow}</span><span className="eyebrow-line" />Karibu</p>
          <h1>{community.hero.headline}<span className="hero-grow">{community.hero.accentLine}</span></h1>
          <p className="hero-lede">{community.hero.description}</p>
          <div className="hero-actions">
            <SmartLink className="button button-primary" eventName="join_community" url={community.hero.primaryCTA.url}>{community.hero.primaryCTA.label} <span aria-hidden="true">↗</span></SmartLink>
            <SmartLink className="button button-ghost" eventName="explore_events" url={community.hero.secondaryCTA.url}>{community.hero.secondaryCTA.label} <span aria-hidden="true">→</span></SmartLink>
          </div>
          <div className="hero-meta" aria-label="Community status"><span className="status-dot" /><span>Year-round community</span><span className="meta-divider" /><span>Nairobi, Kenya</span></div>
        </div>

        <div className="hero-art" aria-hidden="true">
          <div className="dawn-glow" />
          <Image alt={home.hero.artwork.alt} className="city-image" fill priority sizes="(max-width: 760px) 172vw, 99vw" src={home.hero.artwork.src} />
          {home.hero.signals.slice(0, 3).map((label, index) => <span className={`signal-pill signal-pill-${index + 1}`} key={`${label}-${index}`}>{label}</span>)}
        </div>

        <a className="scroll-cue" href="#about" aria-label="Scroll to learn about GDG Nairobi"><span>Meet the community</span><i aria-hidden="true">↓</i></a>
      </section>

      {home.ticker.enabled && <div className="ticker" aria-label="Community values"><div className="ticker-track">{[0, 1].map((copy) => <div aria-hidden={copy === 1} className="ticker-group" key={copy}>{tickerItems.map((item, index) => <span className="ticker-item" key={`${copy}-${item}-${index}`}><span>{item}</span><i>✦</i></span>)}</div>)}</div></div>}

      <section className="community-stats" aria-label="GDG Nairobi at a glance">
        {community.statistics.map((stat) => <div key={`${stat.value}-${stat.label}`}><strong>{stat.value}</strong><span>{stat.label}</span></div>)}
      </section>

      <section className="community-about" id="about">
        <div className="section-heading">
          <div><p className="section-kicker">{community.about.kicker}</p><h2>{community.about.heading}</h2></div>
          <p className="section-intro">{community.about.description}</p>
        </div>
        <div className="community-pillars" id="community">
          {community.pillars.map((pillar) => (
            <article className={`community-pillar track-${pillar.accent}`} key={`${pillar.code}-${pillar.title}`}>
              <span>{pillar.code}</span><h3>{pillar.title}</h3><p>{pillar.description}</p>
            </article>
          ))}
        </div>
      </section>

      {home.eventsSection.enabled && <section className="events-section community-events" id="events">
        <div className="section-heading compact">
          <div><p className="section-kicker">What&apos;s happening</p><h2>Meet, learn and make something.</h2></div>
          <SmartLink eventName="all_events" url="/events">Explore all events →</SmartLink>
        </div>
        <div className="event-list">
          {communityEvents.map((event, index) => (
            <a className="event-card" data-analytics="event_open" href={event.href} key={event.href} target="_blank" rel="noreferrer">
              <span className="event-index">{String(index + 1).padStart(2, '0')}</span>
              <span className="event-date">{event.date}</span>
              <div><h3>{event.title}</h3><p>{event.type}</p></div>
              <span className="event-arrow" aria-hidden="true">↗</span>
            </a>
          ))}
        </div>
        <p className="sync-note"><span /> {home.eventsSection.syncNote}</p>
      </section>}

      <section className="devfest-feature" id="devfest-feature" aria-labelledby="devfest-title">
        <div className="devfest-feature-copy">
          <p className="section-kicker light">Our flagship gathering · {home.year}</p>
          <h2 id="devfest-title">{home.hero.headline}<em>{home.hero.accentLine}</em></h2>
          <p>{home.hero.description}</p>
          <SmartLink className="button button-light" eventName="devfest_feature" url="/devfest">Explore DevFest Nairobi {home.year} <span aria-hidden="true">→</span></SmartLink>
        </div>
        <div className="devfest-poster" aria-hidden="true">
          <div className="devfest-poster-routes"><i /><i /><i /></div>
          <span className="devfest-poster-label">NAIROBI / FLAGSHIP EVENT</span>
          <div className="devfest-poster-title"><span>DEVFEST</span><strong>{home.year}</strong></div>
          <div className="devfest-poster-meta"><span>COMMUNITY-LED</span><span>TALKS · WORKSHOPS · CODELABS</span></div>
          <div className="devfest-color-rail"><i /><i /><i /><i /></div>
        </div>
      </section>

      <section className="ecosystem-section">
        <div><p className="section-kicker">{community.ecosystem.kicker}</p><h2>{community.ecosystem.heading}</h2></div>
        <div className="ecosystem-copy"><p>{community.ecosystem.description}</p><div className="ecosystem-tags">{community.ecosystem.items.map((item) => <span key={item}>{item}</span>)}</div></div>
      </section>

      <section className="closing-section community-closing" aria-labelledby="closing-title">
        <div className="closing-grid" aria-hidden="true" />
        <div className="closing-copy">
          <p className="section-kicker light">{community.closing.kicker}</p>
          <h2 id="closing-title">{community.closing.heading}<em>{community.closing.accentLine}</em></h2>
          <div className="closing-actions">
            <SmartLink className="button button-light" eventName="all_events_closing" url="/events">See upcoming events <span aria-hidden="true">→</span></SmartLink>
            <SmartLink eventName="join_community_closing" url={community.closing.primaryCTA.url}>{community.closing.primaryCTA.label} ↗</SmartLink>
          </div>
        </div>
        {nextEvent ? (
          <a className="closing-event" data-analytics="next_event_closing" href={nextEvent.href} rel="noreferrer" target="_blank">
            <div className="closing-event-top"><span>NEXT EVENT / 01</span><time>{nextEvent.date}</time></div>
            <div><p>{nextEvent.type}</p><h3>{nextEvent.title}</h3></div>
            <div className="closing-event-bottom"><span>View event</span><i aria-hidden="true">↗</i></div>
            <div className="closing-event-rail" aria-hidden="true"><i /><i /><i /><i /></div>
          </a>
        ) : (
          <div className="closing-event closing-event-empty">
            <div className="closing-event-top"><span>NEXT EVENT</span><span>DATES SOON</span></div>
            <div><p>GDG NAIROBI</p><h3>New community events are being prepared.</h3></div>
            <div className="closing-event-bottom"><span>Check back soon</span></div>
          </div>
        )}
      </section>

      <footer className="footer">
        <div className="footer-brand"><GdgLogo /></div>
        {home.chrome.footerGroups.map((group) => (
          <div key={group.heading}><span>{group.heading}</span>{group.links.map((link) => <SmartLink key={`${group.heading}-${link.url}`} url={link.url}>{link.label}</SmartLink>)}</div>
        ))}
        <p className="footer-note">{home.chrome.footerNote}</p>
      </footer>
    </main>
  )
}
