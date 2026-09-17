import type { Metadata } from 'next'

import { EditorialPage } from '@/components/EditorialPage'
import { getPartners } from '@/lib/cms-content'

export const metadata: Metadata = { title: 'Partners' }

export default async function PartnersPage() {
  const partners = await getPartners()
  return (
    <EditorialPage eyebrow="GROW THE ECOSYSTEM" title="Back the builders." intro="Partners help keep DevFest open, ambitious and useful—from the first codelab to the final conversation." accent="yellow">
      {partners.length ? <div className="partner-grid">
        {partners.map((partner) => <a href={partner.url || '#'} key={partner.id} target={partner.url ? '_blank' : undefined} rel={partner.url ? 'noreferrer' : undefined}><span>{partner.tier}</span><strong>{partner.name}</strong><i>↗</i></a>)}
      </div> : <div className="partner-pitch">
        <div><span>01</span><h2>Meet the community</h2><p>Connect with developers, students, founders, designers and technical leaders building across the region.</p></div>
        <div><span>02</span><h2>Make learning possible</h2><p>Support practical sessions, accessible spaces and the infrastructure a major community event needs.</p></div>
        <div><span>03</span><h2>Grow beyond the day</h2><p>Become part of GDG Nairobi&apos;s wider year-round ecosystem, not just a logo on a screen.</p></div>
      </div>}
      <a className="wide-cta" href="mailto:gdgnairobi@gmail.com?subject=Partner%20with%20DevFest%20Nairobi%202026"><span>LET&apos;S BUILD TOGETHER</span><strong>Start a partnership conversation</strong><i>↗</i></a>
    </EditorialPage>
  )
}
