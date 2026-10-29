import Image from 'next/image'
import { mediaURL } from '@/lib/media-url'
import Link from 'next/link'
import type { ReactNode } from 'react'

import { MotionLayer } from '@/components/MotionLayer'
import { GdgLogo } from '@/components/GdgLogo'
import { CommunityHeroPhotos } from '@/components/CommunityHeroPhotos'
import { SiteHeader } from '@/components/SiteHeader'
import { getEventIndex, getFeaturedEvent, getPublicEvents } from '@/lib/community-events'
import { EventMedia } from '@/components/EventMedia'
import { CommunityIntroduction } from '@/components/CommunityIntroduction'
import { getHomeContent } from '@/lib/site-content'

import './styles.css'

const isInternal = (url: string) => url.startsWith('/') || url.startsWith('#')

function SmartLink({
  children,
  className,
  eventName,
  url,
}: {
  children: ReactNode
  className?: string
  eventName?: string
  url: string
}) {
  const analytics = eventName ? { 'data-analytics': eventName } : undefined
  if (isInternal(url))
    return (
      <Link className={className} href={url} {...analytics}>
        {children}
      </Link>
    )
  return (
    <a
      className={className}
      href={url}
      rel={url.startsWith('http') ? 'noreferrer' : undefined}
      target={url.startsWith('http') ? '_blank' : undefined}
      {...analytics}
    >
      {children}
    </a>
  )
}

export default async function HomePage() {
  const [eventIndex, featured, allEvents, home] = await Promise.all([
    getEventIndex(),
    getFeaturedEvent(),
    getPublicEvents(),
    getHomeContent(),
  ])
  const communityEvents = eventIndex.upcoming.slice(0, 3)
  const community = home.community
  const nextEvent = communityEvents[0]
  const tickerItems = Array.from({ length: 4 }, () => home.ticker.items).flat()
  const featuredVideos = [...allEvents]
    .sort((a, b) => (b.year || 0) - (a.year || 0))
    .flatMap((event) =>
      (event.videos || [])
        .filter((video) => video.featured !== false)
        .map((video) => ({ title: video.title, url: video.url })),
    )
  const albums = allEvents.flatMap((event) =>
    (event.albums || [])
      .filter((album) => album.url)
      .map((album) => ({ title: album.title, url: album.url! })),
  )

  return (
    <main className="site-shell community-site" id="main-content" tabIndex={-1}>
      <SiteHeader
        cta={{ href: home.chrome.headerCTA.url, label: home.chrome.headerCTA.label }}
        links={home.chrome.navigation.map(({ label, url }) => ({ href: url, label }))}
        siteName={home.chrome.siteName}
      />

      <section className="hero community-photo-hero" id="top">
        <MotionLayer />
        <div className="hero-noise" aria-hidden="true" />
        <div className="hero-copy">
          <p className="eyebrow">
            <span>{community.hero.eyebrow}</span>
            <span className="eyebrow-line" />
            Karibu
          </p>
          <h1>
            {community.hero.headline}
            <span className="hero-grow">{community.hero.accentLine}</span>
          </h1>
          <p className="hero-lede">{community.hero.description}</p>
          <div className="hero-actions">
            <SmartLink
              className="button button-primary"
              eventName="join_community"
              url={community.hero.primaryCTA.url}
            >
              {community.hero.primaryCTA.label} <span aria-hidden="true">↗</span>
            </SmartLink>
            <SmartLink
              className="button button-ghost"
              eventName="explore_events"
              url={community.hero.secondaryCTA.url}
            >
              {community.hero.secondaryCTA.label} <span aria-hidden="true">→</span>
            </SmartLink>
          </div>
        </div>

        <CommunityHeroPhotos caption={community.hero.photoCaption} photos={community.hero.photos} />
      </section>

      {home.ticker.enabled && (
        <div className="ticker" aria-label="Community values">
          <div className="ticker-track">
            {[0, 1].map((copy) => (
              <div aria-hidden={copy === 1} className="ticker-group" key={copy}>
                {tickerItems.map((item, index) => (
                  <span className="ticker-item" key={`${copy}-${item}-${index}`}>
                    <span>{item}</span>
                    <i>✦</i>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      <section className="community-stats" aria-label="GDG Nairobi at a glance">
        {community.statistics.map((stat) => (
          <div key={`${stat.value}-${stat.label}`}>
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </div>
        ))}
      </section>

      <section className="community-about" id="about">
        <div className="section-heading">
          <div>
            <p className="section-kicker">{community.about.kicker}</p>
            <h2>{community.about.heading}</h2>
          </div>
          <CommunityIntroduction about={community.about} />
        </div>
        <div className="community-pillars" id="community">
          {community.pillars.map((pillar) => (
            <article
              className={`community-pillar track-${pillar.accent}`}
              key={`${pillar.code}-${pillar.title}`}
            >
              <span>{pillar.code}</span>
              <h3>{pillar.title}</h3>
              <p>{pillar.description}</p>
            </article>
          ))}
        </div>
      </section>

      {home.eventsSection.enabled && (
        <section className="events-section community-events" id="events">
          <div className="section-heading compact">
            <div>
              <p className="section-kicker">What&apos;s happening</p>
              <h2>Meet, learn and make something.</h2>
            </div>
            <SmartLink eventName="all_events" url="/events">
              Explore all events →
            </SmartLink>
          </div>
          {communityEvents.length === 0 && (
            <p>We’re preparing our next events. Join the community for updates.</p>
          )}
          <div className="event-list">
            {communityEvents.map((event, index) => (
              <SmartLink
                className="event-card"
                eventName="event_open"
                url={event.href}
                key={event.href}
              >
                <span className="event-index">{String(index + 1).padStart(2, '0')}</span>
                <span className="event-date">{event.date}</span>
                <div>
                  <h3>{event.title}</h3>
                  <p>{event.type}</p>
                </div>
                <span className="event-arrow" aria-hidden="true">
                  {event.external ? '↗' : '→'}
                </span>
              </SmartLink>
            ))}
          </div>
          <p className="sync-note">
            <span />{' '}
            <Link href="/events#past-events">Explore past events, photos and highlights →</Link>
          </p>
        </section>
      )}

      {community.connection.image && (
        <section className="community-connect">
          <div className="community-connect-image">
            <Image
              alt={community.connection.image.alt}
              src={community.connection.image.src}
              fill
              sizes="(max-width: 700px) calc(100vw - 47px), (max-width: 1024px) calc(48.4vw - 20.6px), calc(48.4vw - 36px)"
            />
          </div>
          <div>
            <p className="section-kicker">Connect</p>
            <h2>{community.connection.heading}</h2>
            <p>{community.connection.description}</p>
            <SmartLink className="button button-primary" url="/events">
              Find your next event →
            </SmartLink>
          </div>
        </section>
      )}

      {home.highlights.enabled && (featuredVideos.length > 0 || albums.length > 0) && (
        <section className="community-highlights" id="highlights">
          <div className="section-heading">
            <div>
              <p className="section-kicker">{home.highlights.kicker}</p>
              <h2>{home.highlights.heading}</h2>
            </div>
            <p className="section-intro">{home.highlights.intro}</p>
          </div>
          <EventMedia videos={featuredVideos} albums={albums} />
        </section>
      )}

      {featured && (
        <section className="devfest-feature" aria-labelledby="featured-event-title">
          <div className="devfest-feature-copy">
            <p className="section-kicker light">Featured event · {featured.date}</p>
            <h2 id="featured-event-title">{featured.title}</h2>
            <p>{featured.localDescription || featured.excerpt}</p>
            <SmartLink
              className="button button-light"
              eventName="featured_event"
              url={featured.href}
            >
              Explore {featured.title} →
            </SmartLink>
          </div>
          <div className="featured-event-photo">
            {typeof featured.coverImage === 'object' && featured.coverImage?.url ? (
              <Image
                src={mediaURL(featured.coverImage.url)}
                alt={featured.coverImage.alt}
                fill
                sizes="(max-width: 900px) calc(100vw - 47px), (max-width: 1714px) calc(47.79vw - 3px), calc(51.92vw - 73.8px)"
              />
            ) : (
              <strong>{featured.tagline || featured.title}</strong>
            )}
          </div>
        </section>
      )}

      <section className="ecosystem-section">
        <div>
          <p className="section-kicker">{community.ecosystem.kicker}</p>
          <h2>{community.ecosystem.heading}</h2>
        </div>
        <div className="ecosystem-copy">
          <p>{community.ecosystem.description}</p>
          <div className="ecosystem-tags">
            {community.ecosystem.items.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="closing-section community-closing" aria-labelledby="closing-title">
        <div className="closing-grid" aria-hidden="true" />
        <div className="closing-copy">
          <p className="section-kicker light">{community.closing.kicker}</p>
          <h2 id="closing-title">
            {community.closing.heading}
            <em>{community.closing.accentLine}</em>
          </h2>
          <div className="closing-actions">
            <SmartLink className="button button-light" eventName="all_events_closing" url="/events">
              See upcoming events <span aria-hidden="true">→</span>
            </SmartLink>
            <SmartLink eventName="join_community_closing" url={community.closing.primaryCTA.url}>
              {community.closing.primaryCTA.label} ↗
            </SmartLink>
          </div>
        </div>
        {nextEvent ? (
          <SmartLink className="closing-event" eventName="next_event_closing" url={nextEvent.href}>
            <div className="closing-event-top">
              <span>NEXT EVENT / 01</span>
              <time>{nextEvent.date}</time>
            </div>
            <div>
              <p>{nextEvent.type}</p>
              <h3>{nextEvent.title}</h3>
            </div>
            <div className="closing-event-bottom">
              <span>View event</span>
              <i aria-hidden="true">↗</i>
            </div>
            <div className="closing-event-rail" aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
            </div>
          </SmartLink>
        ) : (
          <div className="closing-event closing-event-empty">
            <div className="closing-event-top">
              <span>NEXT EVENT</span>
              <span>DATES SOON</span>
            </div>
            <div>
              <p>GDG NAIROBI</p>
              <h3>New community events are being prepared.</h3>
            </div>
            <div className="closing-event-bottom">
              <span>Check back soon</span>
            </div>
          </div>
        )}
      </section>

      <footer className="footer">
        <div className="footer-brand">
          <GdgLogo />
        </div>
        {home.chrome.footerGroups.map((group) => (
          <div key={group.heading}>
            <span>{group.heading}</span>
            {group.links.map((link) => (
              <SmartLink key={`${group.heading}-${link.url}`} url={link.url}>
                {link.label}
              </SmartLink>
            ))}
          </div>
        ))}
        <p className="footer-note">{home.chrome.footerNote}</p>
      </footer>
    </main>
  )
}
