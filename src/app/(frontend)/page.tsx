import Image from 'next/image'
import Link from 'next/link'
import type { ReactNode } from 'react'

import { MotionLayer } from '@/components/MotionLayer'
import { GdgLogo } from '@/components/GdgLogo'
import { HeroProducts } from '@/components/HeroProducts'
import { SiteHeader } from '@/components/SiteHeader'
import { getCommunityEventCards } from '@/lib/community-events'
import { getHomeContent } from '@/lib/site-content'

import './styles.css'

const isInternal = (url: string) => url.startsWith('/') || url.startsWith('#')

function youtubeEmbedURL(value: string) {
  try {
    const url = new URL(value)
    const host = url.hostname.replace(/^www\./, '')
    let videoID = ''
    if (host === 'youtu.be') videoID = url.pathname.split('/').filter(Boolean)[0] || ''
    if (host === 'youtube.com' || host === 'm.youtube.com') {
      videoID = url.pathname === '/watch'
        ? url.searchParams.get('v') || ''
        : url.pathname.match(/^\/(?:shorts|embed)\/([^/]+)/)?.[1] || ''
    }
    return /^[A-Za-z0-9_-]{11}$/.test(videoID) ? `https://www.youtube-nocookie.com/embed/${videoID}` : null
  } catch {
    return null
  }
}

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
  const featuredVideos = home.highlights.videos.flatMap((video) => {
    const embedURL = youtubeEmbedURL(video.url)
    return embedURL ? [{ ...video, embedURL }] : []
  })

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
        </div>

        <div className="hero-art" aria-hidden="true">
          <div className="dawn-glow" />
          <Image alt={home.hero.artwork.alt} className="city-image" fill priority sizes="(max-width: 760px) 172vw, 99vw" src={home.hero.artwork.src} />
        </div>
        <HeroProducts />
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
            <SmartLink className="event-card" eventName="event_open" url={event.href} key={event.href}>
              <span className="event-index">{String(index + 1).padStart(2, '0')}</span>
              <span className="event-date">{event.date}</span>
              <div><h3>{event.title}</h3><p>{event.type}</p></div>
              <span className="event-arrow" aria-hidden="true">{event.external ? '↗' : '→'}</span>
            </SmartLink>
          ))}
        </div>
        <p className="sync-note"><span /> {home.eventsSection.syncNote}</p>
      </section>}

      {home.highlights.enabled && (home.highlights.photos.length > 0 || featuredVideos.length > 0) && <section className="community-highlights" id="highlights">
        <div className="section-heading">
          <div><p className="section-kicker">{home.highlights.kicker}</p><h2>{home.highlights.heading}</h2></div>
          <p className="section-intro">{home.highlights.intro}</p>
        </div>
        {home.highlights.photos.length > 0 && <div className="memory-grid">
          {home.highlights.photos.map((photo, index) => <figure key={`${photo.src}-${index}`}>
            <Image alt={photo.alt} fill sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw" src={photo.src} />
            {photo.caption && <figcaption>{photo.caption}</figcaption>}
          </figure>)}
        </div>}
        {featuredVideos.length > 0 && <div className={`featured-videos featured-videos-${featuredVideos.length}`}>
          {featuredVideos.map((video, index) => <article key={`${video.url}-${index}`}>
            <div className="video-embed">
              <iframe allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen loading="lazy" src={video.embedURL} title={video.title} />
            </div>
            <small>{String(index + 1).padStart(2, '0')} / FEATURED VIDEO</small>
            <h3>{video.title}</h3>
            <a href={video.url} rel="noreferrer" target="_blank">{video.label} ↗</a>
          </article>)}
        </div>}
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
          <SmartLink className="closing-event" eventName="next_event_closing" url={nextEvent.href}>
            <div className="closing-event-top"><span>NEXT EVENT / 01</span><time>{nextEvent.date}</time></div>
            <div><p>{nextEvent.type}</p><h3>{nextEvent.title}</h3></div>
            <div className="closing-event-bottom"><span>View event</span><i aria-hidden="true">↗</i></div>
            <div className="closing-event-rail" aria-hidden="true"><i /><i /><i /><i /></div>
          </SmartLink>
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
