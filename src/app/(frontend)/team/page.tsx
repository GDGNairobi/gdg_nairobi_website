import type { Metadata } from 'next'

import { EditorialPage } from '@/components/EditorialPage'
import { getTeamMembers } from '@/lib/cms-content'

export const metadata: Metadata = { title: 'Team' }

export default async function TeamPage() {
  const team = await getTeamMembers()
  return (
    <EditorialPage eyebrow="COMMUNITY, NOT COMPANY" title="Built by people who show up." intro="DevFest Nairobi is created by volunteers from the local developer community, in collaboration with Women Techmakers and friends across the ecosystem." accent="green">
      {team.length ? <div className="people-grid team-grid">
        {team.map((member, index) => <article key={member.id}><span>0{index + 1}</span><div className="person-signal" aria-hidden="true">{member.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}</div><h2>{member.name}</h2><p>{member.role}</p></article>)}
      </div> : <div className="manifesto-grid">
        <blockquote>“Make Kenya&apos;s tech scene one of the strongest in the world—and have a good time building it together.”</blockquote>
        <div><p>The organizer roster will be published here with consent once the current DevFest crew is confirmed.</p><a className="button button-dark" href="https://gdg.community.dev/gdg-nairobi/organizers/">Meet the GDG Nairobi organizers <span>↗</span></a></div>
      </div>}
    </EditorialPage>
  )
}
