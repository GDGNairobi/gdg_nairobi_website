import Image from 'next/image'
import Link from 'next/link'
import type { ReactNode } from 'react'

import { MotionLayer } from '@/components/MotionLayer'
import { SiteHeader } from '@/components/SiteHeader'
import { getCommunityEventCards } from '@/lib/community-events'
import { getHomeContent } from '@/lib/site-content'

import './styles.css'

const isInternal = (url: string) => url.startsWith('/') || url.startsWith('#')

function SmartLink({ children, className, url }: { children: ReactNode; className?: string; url: string }) {
  if (isInternal(url)) return <Link className={className} href={url}>{children}</Link>
  return <a className={className} href={url} rel={url.startsWith('http') ? 'noreferrer' : undefined} target={url.startsWith('http') ? '_blank' : undefined}>{children}</a>
}

export default async function HomePage() {
  const [communityEvents, home] = await Promise.all([getCommunityEventCards(3), getHomeContent()])
  return (
    <main className="site-shell">
      <SiteHeader
        brandLabel={home.chrome.brandLabel}
        cta={{ href: home.chrome.headerCTA.url, label: home.chrome.headerCTA.label }}
        editionLabel={home.chrome.editionLabel}
        links={home.chrome.navigation.map(({ label, url }) => ({ href: url, label }))}
        siteName={home.chrome.siteName}
      />

      <section className="hero" id="top">
        <MotionLayer />
        <div className="hero-noise" aria-hidden="true" />
        <div className="hero-copy">
          <p className="eyebrow"><span>{home.hero.eyebrow}</span><span className="eyebrow-line" />{home.year}</p>
          <h1>
            {home.hero.headline}
            <span className="hero-grow">{home.hero.accentLine}</span>
          </h1>
          <p className="hero-lede">{home.hero.description}</p>
          <div className="hero-actions">
            {home.callsToAction.slice(0, 2).map((cta, index) => (
              <SmartLink
                className={`button ${cta.style === 'primary' ? 'button-primary' : 'button-ghost'}`}
                url={cta.url}
                key={`${cta.label}-${cta.url}`}
              >
                  {cta.label} <span aria-hidden="true">{index === 0 ? '↗' : '→'}</span>
              </SmartLink>
            ))}
          </div>
          <div className="hero-meta" aria-label="Event status">
            <span className="status-dot" />
            <span>{home.status}</span>
            <span className="meta-divider" />
            <span>{home.locationLabel}</span>
          </div>
        </div>

        <div className="hero-art" aria-hidden="true">
          <div className="dawn-glow" />
          <Image
            alt={home.hero.artwork.alt}
            className="city-image"
            fill
            priority
            sizes="(max-width: 760px) 172vw, 99vw"
            src={home.hero.artwork.src}
          />
          {home.hero.signals.slice(0, 3).map((label, index) => (
            <span className={`signal-pill signal-pill-${index + 1}`} key={`${label}-${index}`}>{label}</span>
          ))}
        </div>

        <a className="scroll-cue" href="#story" aria-label="Scroll to the DevFest story">
          <span>{home.hero.scrollLabel}</span><i aria-hidden="true">↓</i>
        </a>
      </section>

      {home.ticker.enabled && <div className="ticker" aria-label="DevFest values">
        <div className="ticker-track">
          {[...home.ticker.items, ...home.ticker.items].map((item, index) => (
            <span className="ticker-item" key={`${item}-${index}`}><span>{item}</span><i>✦</i></span>
          ))}
        </div>
      </div>}

      {home.story.enabled && <section className="story-section" id="story">
        <div className="section-kicker light">{home.story.kicker}</div>
        <div className="story-grid">
          <h2>{home.story.heading}</h2>
          <div className="story-copy">
            {home.story.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
        </div>
        <div className="community-proof">
          <div className="proof-number"><strong>{home.memberStat.value}</strong><span>{home.memberStat.label}</span></div>
          <div className="proof-line" />
          <blockquote>“{home.story.quote}”</blockquote>
        </div>
      </section>}

      {home.tracksSection.enabled && <section className="tracks-section" id="tracks">
        <div className="section-heading">
          <div>
            <p className="section-kicker">{home.tracksSection.kicker}</p>
            <h2 className="cms-lines">{home.tracksSection.heading}</h2>
          </div>
          <p className="section-intro">{home.tracksSection.intro}</p>
        </div>
        <div className="track-grid">
          {home.tracks.map((track) => (
            <article className={`track-card track-${track.color}`} key={track.code}>
              <div className="track-top"><span>{track.code}</span><i aria-hidden="true">↗</i></div>
              <div>
                <h3>{track.title}</h3>
                <p>{track.copy}</p>
                <div className="tag-row">
                  {track.tags.map((tag) => <span key={tag}>{tag}</span>)}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>}

      {home.experience.enabled && <section className="format-section" id="experience">
        <div className="format-orbit" aria-hidden="true">
          <span className="orbit orbit-one" /><span className="orbit orbit-two" />
          <span className="orbit-dot orbit-dot-one" /><span className="orbit-dot orbit-dot-two" />
          <div className="format-core"><span>{home.experience.marker}</span><small className="cms-lines">{home.experience.markerLabel}</small></div>
        </div>
        <div className="format-copy">
          <p className="section-kicker light">{home.experience.kicker}</p>
          <h2 className="cms-lines">{home.experience.heading}</h2>
          <div className="format-list">
            {home.experience.items.map((item) => (
              <article key={`${item.eyebrow}-${item.title}`}><span>{item.eyebrow}</span><div><h3>{item.title}</h3><p>{item.description}</p></div></article>
            ))}
          </div>
        </div>
      </section>}

      {home.cfp.enabled && <section className="cfp-section" id="call-for-papers">
        <div className="cfp-card">
          <div className="cfp-badge">{home.cfp.badge}</div>
          <p className="section-kicker">{home.cfp.kicker}</p>
          <h2>{home.cfp.heading}</h2>
          <p className="cfp-copy">{home.cfp.description}</p>
          <SmartLink className="button button-dark" url={home.cfp.cta.url}>{home.cfp.cta.label} <span aria-hidden="true">↗</span></SmartLink>
        </div>
        <div className="cfp-side" aria-hidden="true">
          <div className="sound-line sound-one" /><div className="sound-line sound-two" />
          <div className="mic-circle">{`{ talk }`}</div>
          <span>{home.cfp.artLabelTop}</span><span>{home.cfp.artLabelBottom}</span>
        </div>
      </section>}

      {home.eventsSection.enabled && <section className="events-section" id="community">
        <div className="section-heading compact">
          <div><p className="section-kicker">{home.eventsSection.kicker}</p><h2>{home.eventsSection.heading}</h2></div>
          <SmartLink url={home.eventsSection.allEvents.url}>{home.eventsSection.allEvents.label} ↗</SmartLink>
        </div>
        <div className="event-list">
          {communityEvents.map((event, index) => (
            <a className="event-card" href={event.href} key={event.href} target="_blank" rel="noreferrer">
              <span className="event-index">0{index + 1}</span>
              <span className="event-date">{event.date}</span>
              <div><h3>{event.title}</h3><p>{event.type}</p></div>
              <span className="event-arrow" aria-hidden="true">↗</span>
            </a>
          ))}
        </div>
        <p className="sync-note"><span /> {home.eventsSection.syncNote}</p>
      </section>}

      {home.closing.enabled && <section className="closing-section">
        <div className="closing-grid" aria-hidden="true" />
        <p className="section-kicker light">{home.closing.kicker}</p>
        <h2>{home.closing.heading}<br /><em>{home.closing.accentLine}</em></h2>
        <div className="closing-actions">
          <SmartLink className="button button-light" url={home.closing.primaryCTA.url}>{home.closing.primaryCTA.label} <span>→</span></SmartLink>
          <SmartLink url={home.closing.secondaryCTA.url}>{home.closing.secondaryCTA.label} ↗</SmartLink>
        </div>
      </section>}

      <footer className="footer">
        <div className="footer-brand"><span className="brand-mark" aria-hidden="true"><i /><i /><i /><i /></span><strong>{home.chrome.brandLabel}<br />{home.chrome.editionLabel}</strong></div>
        {home.chrome.footerGroups.map((group) => (
          <div key={group.heading}><span>{group.heading}</span>{group.links.map((link) => <SmartLink key={`${group.heading}-${link.url}`} url={link.url}>{link.label}</SmartLink>)}</div>
        ))}
        <p className="footer-note">{home.chrome.footerNote}</p>
      </footer>
    </main>
  )
}
