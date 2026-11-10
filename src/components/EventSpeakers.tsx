import Image from 'next/image'
import type { ProgrammeSpeaker } from '@/lib/programme'
import styles from './EventSpeakers.module.css'

const initials = (name: string) => {
  const parts = name.trim().split(/\s+/)
  return parts.length > 1
    ? `${parts[0][0]}${parts.at(-1)![0]}`.toUpperCase()
    : name.slice(0, 2).toUpperCase()
}

function SpeakerCard({ speaker }: { speaker: ProgrammeSpeaker }) {
  return (
    <article className={styles.card} aria-labelledby={`speaker-${speaker.id}`}>
      <div className={styles.portrait}>
        {speaker.portrait ? (
          <Image
            src={speaker.portrait.url}
            alt={speaker.portrait.alt || speaker.name}
            width={160}
            height={160}
            sizes="160px"
          />
        ) : (
          <span aria-hidden="true">{initials(speaker.name)}</span>
        )}
      </div>
      <div className={styles.profile}>
        <h3 id={`speaker-${speaker.id}`}>{speaker.name}</h3>
        {(speaker.jobTitle || speaker.company) && (
          <p className={styles.role}>
            {[speaker.jobTitle, speaker.company].filter(Boolean).join(' · ')}
          </p>
        )}
        <ul className={styles.tracks} aria-label={`${speaker.name} tracks`}>
          {speaker.tracks.map((track) => <li key={track}>{track}</li>)}
        </ul>
        <div className={styles.sessions}>
          <p>In the programme</p>
          <ul>
            {speaker.sessions.map((session) => <li key={session.id}>{session.title}</li>)}
          </ul>
        </div>
      </div>
    </article>
  )
}

export function EventSpeakers({ speakers }: { speakers: ProgrammeSpeaker[] }) {
  if (!speakers.length) return null
  const preview = speakers.slice(0, 8), remaining = speakers.slice(8)
  return (
    <section id="speakers" className={styles.section} aria-labelledby="event-speakers-heading">
      <header className={styles.header}>
        <div>
          <p className="section-kicker">Speakers</p>
          <h2 id="event-speakers-heading">Meet the speakers.</h2>
          <p>Speakers, hosts and partner teams from the programme.</p>
        </div>
        <a href="#programme">View programme <span aria-hidden="true">↓</span></a>
      </header>
      <div className={styles.grid}>
        {preview.map((speaker) => <SpeakerCard key={speaker.id} speaker={speaker} />)}
      </div>
      {remaining.length > 0 && (
        <details className={styles.more}>
          <summary>
            <span className={styles.whenClosed}>Show all {speakers.length} speakers & contributors</span>
            <span className={styles.whenOpen}>Show fewer speakers</span>
            <span className={styles.plus} aria-hidden="true">＋</span>
          </summary>
          <div className={styles.grid}>
            {remaining.map((speaker) => <SpeakerCard key={speaker.id} speaker={speaker} />)}
          </div>
        </details>
      )}
    </section>
  )
}
