import type { Metadata } from 'next'

import { EditorialPage } from '@/components/EditorialPage'
import { getSpeakers } from '@/lib/cms-content'

export const metadata: Metadata = { title: 'Speakers' }

export default async function SpeakersPage() {
  const speakers = await getSpeakers()
  return (
    <EditorialPage eyebrow="VOICES IN THE CANOPY" title="The lineup is growing." intro="We are making room for practical lessons, bold questions and honest stories from the people building across Africa and beyond." accent="red">
      {speakers.length ? <div className="people-grid">
        {speakers.map((speaker, index) => <article key={speaker.id}>
          <span>0{index + 1}</span><div className="person-signal" aria-hidden="true">{speaker.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}</div>
          <h2>{speaker.name}</h2><p>{[speaker.jobTitle, speaker.company].filter(Boolean).join(' · ')}</p>
          <div>{speaker.topics?.slice(0, 3).map((topic) => <small key={topic}>{topic}</small>)}</div>
        </article>)}
      </div> : <div className="empty-stage">
        <div className="stage-rings" aria-hidden="true"><span /><span /><span /></div>
        <p>Speaker announcements are coming soon.</p>
        <h2>Your story could be part of it.</h2>
        <a className="button button-dark" href="mailto:gdgnairobi@gmail.com?subject=DevFest%20Nairobi%202026%20CFP">Register your interest <span>↗</span></a>
      </div>}
    </EditorialPage>
  )
}
