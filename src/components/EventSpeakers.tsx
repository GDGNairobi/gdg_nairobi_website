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
            width={80}
            height={80}
            sizes="(max-width: 600px) 56px, 80px"
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
      </div>
    </article>
  )
}

export function EventSpeakers({ speakers }: { speakers: ProgrammeSpeaker[] }) {
  if (!speakers.length) return null
  return (
    <section id="speakers" className={styles.section} aria-labelledby="event-speakers-heading">
      <header className={styles.header}>
        <div>
          <p className="section-kicker">Speakers</p>
          <h2 id="event-speakers-heading">Meet the speakers.</h2>
          <p>The speakers and hosts sharing what they know.</p>
        </div>
        <a href="#programme">View programme <span aria-hidden="true">↑</span></a>
      </header>
      <div className={styles.grid} role="group" aria-label="All speakers" tabIndex={0}>
        {speakers.map((speaker) => <SpeakerCard key={speaker.id} speaker={speaker} />)}
      </div>
    </section>
  )
}
