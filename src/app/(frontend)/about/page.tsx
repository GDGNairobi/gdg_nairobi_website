import type { Metadata } from 'next'
import Image from 'next/image'

import { CommunityIntroduction, CommunityProgrammes } from '@/components/CommunityIntroduction'
import { EditorialPage } from '@/components/EditorialPage'
import { getPartners, getTeamMembers } from '@/lib/cms-content'
import { buildPageMetadata } from '@/lib/metadata'
import { getHomeContent } from '@/lib/site-content'

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
  const [{ community }, team, chapterPartners] = await Promise.all([
    getHomeContent(),
    getTeamMembers(),
    getPartners('chapter'),
  ])
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

      {chapterPartners.length > 0 && (
        <section className="about-partners" id="partners">
          <header>
            <p className="section-kicker">Sponsors & partners</p>
            <h2>The people and organisations we build with.</h2>
            <p>
              This directory reflects the official GDG Nairobi chapter page and does not imply
              support for every current event.
            </p>
          </header>
          <div className="chapter-sponsor-grid">
            {localSponsors.map((partner) => (
              <a
                href={partner.url || '#'}
                key={partner.id}
                rel={partner.url ? 'noreferrer' : undefined}
                target={partner.url ? '_blank' : undefined}
              >
                {partner.sourceLogoURL && (
                  <Image alt="" height={72} src={partner.sourceLogoURL} width={150} />
                )}
                <strong>{partner.name}</strong>
                <span>Local sponsor</span>
              </a>
            ))}
          </div>
          {communityPartners.length > 0 && (
            <details className="partner-directory">
              <summary>
                View {communityPartners.length} chapter partners <span>＋</span>
              </summary>
              <div>
                {communityPartners.map((partner) => (
                  <a
                    href={partner.url || '#'}
                    key={partner.id}
                    rel={partner.url ? 'noreferrer' : undefined}
                    target={partner.url ? '_blank' : undefined}
                  >
                    {partner.sourceLogoURL && (
                      <Image alt="" height={56} src={partner.sourceLogoURL} width={120} />
                    )}
                    <strong>{partner.name}</strong>
                  </a>
                ))}
              </div>
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
