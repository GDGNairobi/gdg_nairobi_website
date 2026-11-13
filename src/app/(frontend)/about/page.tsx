import type { Metadata } from 'next'

import { CommunityIntroduction, CommunityProgrammes } from '@/components/CommunityIntroduction'
import { EditorialPage } from '@/components/EditorialPage'
import { PartnerGrid } from '@/components/EventPartners'
import { getPartners, getTeamMembers } from '@/lib/cms-content'
import { buildPageMetadata } from '@/lib/metadata'
import { getHomeContent } from '@/lib/site-content'
import styles from './AboutPartners.module.css'

export const metadata: Metadata = buildPageMetadata({
  title: 'About GDG Nairobi',
  description:
    'Meet the volunteer-led GDG Nairobi community, its organisers, programmes, sponsors and chapter partners.',
  path: '/about',
  keywords: [
    'GDG Nairobi organisers',
    'Nairobi developer community',
    'Google Developer Groups Nairobi',
  ],
})

export default async function AboutPage() {
  const [{ community }, team, partners] = await Promise.all([
    getHomeContent(),
    getTeamMembers(),
    getPartners('all'),
  ])
  const eventPartners = partners.filter((partner) => partner.scope === 'devfest')
  const chapterPartners = partners.filter((partner) => partner.scope === 'chapter')
  const localSponsors = chapterPartners.filter((partner) => partner.tier === 'host')
  const communityPartners = chapterPartners.filter((partner) => partner.tier !== 'host')

  return (
    <EditorialPage
      eyebrow={community.about.kicker}
      title="About GDG Nairobi."
      intro={community.about.description.split(/\n\s*\n/)[0]}
      accent="green"
    >
      <CommunityIntroduction about={community.about} skipFirst />
      <CommunityProgrammes programmes={community.programmes} />

      <section className="about-values">
        {community.pillars.map((pillar) => (
          <article className={`track-${pillar.accent}`} key={pillar.title}>
            <span>{pillar.code}</span>
            <h2>{pillar.title}</h2>
            <p>{pillar.description}</p>
          </article>
        ))}
      </section>

      <section className="about-organizers" id="organizers">
        <header>
          <p className="section-kicker">Organisers</p>
          <h2>The volunteers behind GDG Nairobi.</h2>
          <p>Roles reflect the public organiser information supplied by the GDG Nairobi team.</p>
        </header>
        <div className="people-grid team-grid">
          {team.map((member, index) => (
            <article key={member.id}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <div className="person-signal" aria-hidden="true">
                {member.name
                  .split(' ')
                  .map((part) => part[0])
                  .join('')
                  .slice(0, 2)}
              </div>
              <h2>{member.name}</h2>
              <p>{member.role}</p>
            </article>
          ))}
        </div>
      </section>

      {partners.length > 0 && (
        <section className="about-partners" id="partners">
          <header>
            <p className="section-kicker">Sponsors & partners</p>
            <h2>The people and organisations we build with.</h2>
            <p>
              Meet our chapter supporters and event partners. Visit each event page for its
              confirmed sponsors.
            </p>
          </header>
          {eventPartners.length > 0 && (
            <div className={styles.group}>
              <h3>DevFest partners</h3>
              <PartnerGrid partners={eventPartners} headingLevel="h4" />
            </div>
          )}
          {localSponsors.length > 0 && (
            <div className={styles.group}>
              <h3>Chapter sponsors</h3>
              <PartnerGrid partners={localSponsors} headingLevel="h4" />
            </div>
          )}
          {communityPartners.length > 0 && (
            <details className={styles.directory}>
              <summary>
                View {communityPartners.length} chapter partners <span aria-hidden="true">＋</span>
              </summary>
              <PartnerGrid partners={communityPartners} />
            </details>
          )}
        </section>
      )}

      <a
        className="wide-cta"
        data-analytics="join_about"
        href={community.hero.primaryCTA.url}
        rel="noreferrer"
        target="_blank"
      >
        <span>COME AS YOU ARE</span>
        <strong>Join GDG Nairobi</strong>
        <i>↗</i>
      </a>
    </EditorialPage>
  )
}
