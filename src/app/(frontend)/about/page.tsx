import type { Metadata } from 'next'
import Image from 'next/image'

import { EditorialPage } from '@/components/EditorialPage'
import { getPartners, getTeamMembers } from '@/lib/cms-content'
import { getHomeContent } from '@/lib/site-content'

export const metadata: Metadata = { title: 'About GDG Nairobi' }

export default async function AboutPage() {
  const [{ community }, team, chapterPartners] = await Promise.all([getHomeContent(), getTeamMembers(), getPartners('chapter')])
  const localSponsors = chapterPartners.filter((partner) => partner.tier === 'host')
  const communityPartners = chapterPartners.filter((partner) => partner.tier !== 'host')

  return (
    <EditorialPage eyebrow={community.about.kicker} title="About GDG Nairobi." intro={community.about.description} accent="green">
      <section className="about-manifesto">
        <div>
          <p className="section-kicker light">Who we are</p>
          <h2>A volunteer-led chapter in the global GDG network.</h2>
        </div>
        <div>
          <p>Members include developers, designers, founders, students, speakers and newcomers. Participation is open to every experience level.</p>
          <p>Programmes may cover Android, web, cloud, Firebase, AI and other areas of software development. Topics depend on the event and the people contributing to it.</p>
        </div>
      </section>

      <section className="about-programmes">
        <p className="section-kicker">What we do</p>
        <div>
          <article><span>01</span><h2>Community events</h2><p>Meetups, workshops, study jams and codelabs throughout the year.</p></article>
          <article><span>02</span><h2>Build together</h2><p>Hackathons and focused sessions that help ideas become working products.</p></article>
          <article><span>03</span><h2>Flagship moments</h2><p>DevFest, Google I/O Extended and Build with AI bring the wider ecosystem together.</p></article>
        </div>
      </section>

      <section className="about-values">
        {community.pillars.map((pillar) => <article className={`track-${pillar.accent}`} key={pillar.title}><span>{pillar.code}</span><h2>{pillar.title}</h2><p>{pillar.description}</p></article>)}
      </section>

      <section className="about-organizers" id="organizers">
        <header><p className="section-kicker">Organizers</p><h2>The volunteers behind GDG Nairobi.</h2><p>Roles reflect the public organizer information supplied by the GDG Nairobi team.</p></header>
        <div className="people-grid team-grid">
          {team.map((member, index) => <article key={member.id}><span>{String(index + 1).padStart(2, '0')}</span><div className="person-signal" aria-hidden="true">{member.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}</div><h2>{member.name}</h2><p>{member.role}</p></article>)}
        </div>
      </section>

      {chapterPartners.length > 0 && <section className="about-partners" id="partners">
        <header><p className="section-kicker">Sponsors & partners</p><h2>Organisations listed by the chapter.</h2><p>This directory reflects the official GDG Nairobi chapter page and does not imply support for every current event.</p></header>
        <div className="chapter-sponsor-grid">
          {localSponsors.map((partner) => <a href={partner.url || '#'} key={partner.id} rel={partner.url ? 'noreferrer' : undefined} target={partner.url ? '_blank' : undefined}>{partner.sourceLogoURL && <Image alt="" height={72} src={partner.sourceLogoURL} unoptimized width={150} />}<strong>{partner.name}</strong><span>Local sponsor</span></a>)}
        </div>
        {communityPartners.length > 0 && <details className="partner-directory"><summary>View {communityPartners.length} chapter partners <span>＋</span></summary><div>{communityPartners.map((partner) => <a href={partner.url || '#'} key={partner.id} rel={partner.url ? 'noreferrer' : undefined} target={partner.url ? '_blank' : undefined}>{partner.sourceLogoURL && <Image alt="" height={56} src={partner.sourceLogoURL} unoptimized width={120} />}<strong>{partner.name}</strong></a>)}</div></details>}
      </section>}

      <a className="wide-cta" data-analytics="join_about" href={community.hero.primaryCTA.url} rel="noreferrer" target="_blank"><span>COME AS YOU ARE</span><strong>Join GDG Nairobi</strong><i>↗</i></a>
    </EditorialPage>
  )
}
