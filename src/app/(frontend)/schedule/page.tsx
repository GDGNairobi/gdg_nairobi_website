import type { Metadata } from 'next'

import { EditorialPage } from '@/components/EditorialPage'
import { getSessions } from '@/lib/cms-content'

export const metadata: Metadata = { title: 'Schedule' }

const time = (date: string) => new Intl.DateTimeFormat('en-KE', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Nairobi' }).format(new Date(date))

export default async function SchedulePage() {
  const sessions = await getSessions()
  return (
    <EditorialPage eyebrow="TWO WAYS TO GO DEEP" title="Make it. Meet around it." intro="The detailed program will grow here as speakers and sessions are confirmed. The two-day rhythm is already taking shape." accent="blue">
      {sessions.length ? <div className="session-list">
        {sessions.map((session) => <article key={session.id}>
          <time>{time(session.startsAt)}</time><span>{session.room}</span><div><small>{session.track.replace('-', ' / ')}</small><h2>{session.title}</h2><p>{session.format} · {session.level || 'all levels'}</p></div>
        </article>)}
      </div> : <div className="day-grid">
        <article><span>DAY 01</span><small>HANDS ON</small><h2>Workshops & codelabs</h2><p>Bring your laptop. Leave with something that works—and a better understanding of why.</p><div className="day-line" /></article>
        <article><span>DAY 02</span><small>IDEAS IN MOTION</small><h2>Conference & community</h2><p>Technical sessions, keynotes, panels and the conversations between them.</p><div className="day-line" /></article>
      </div>}
      <p className="availability-note"><span /> Full times, rooms and filters will appear when the program is published.</p>
    </EditorialPage>
  )
}
