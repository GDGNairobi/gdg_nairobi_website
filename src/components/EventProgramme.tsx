'use client'

import { useCallback, useRef, useState, useSyncExternalStore, type CSSProperties } from 'react'
import Image from 'next/image'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { formatEventDay } from '@/lib/event-dates'
import {
  getProgrammeTracks,
  groupProgrammeSessions,
  isSharedSession,
  parseFavouriteIDs,
  trackKey,
  type ProgrammeSession,
} from '@/lib/programme'
import styles from './EventProgramme.module.css'

const storageEvent = 'gdg-programme-favourites'
const temporaryFavourites = new Map<string, string>()
const tones = ['blue', 'yellow', 'green', 'red', 'blue']
const clock = (value: string) =>
  new Intl.DateTimeFormat('en-KE', {
    timeZone: 'Africa/Nairobi',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(value))

function readFavourites(key: string) {
  if (temporaryFavourites.has(key)) return temporaryFavourites.get(key)!
  try {
    return localStorage.getItem(key) || '[]'
  } catch {
    return '[]'
  }
}

function Star({ filled = false }: { filled?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      aria-hidden="true"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinejoin="round"
    >
      <path d="m12 2.5 2.9 6 6.6.9-4.8 4.7 1.1 6.6-5.8-3.1-5.8 3.1 1.1-6.6L2.5 9.4l6.6-.9Z" />
    </svg>
  )
}

export function EventProgramme({
  eventID,
  sessions,
  singleTrack = false,
}: {
  eventID: number
  sessions: ProgrammeSession[]
  singleTrack?: boolean
}) {
  const key = `gdg-nairobi:favourites:v1:${eventID}`
  const subscribe = useCallback(
    (notify: () => void) => {
      const onStorage = (event: StorageEvent) => {
        if (event.key === key || event.key === null) {
          temporaryFavourites.delete(key)
          notify()
        }
      }
      const onUpdate = (event: Event) => {
        if ((event as CustomEvent<string>).detail === key) notify()
      }
      window.addEventListener('storage', onStorage)
      window.addEventListener(storageEvent, onUpdate)
      return () => {
        window.removeEventListener('storage', onStorage)
        window.removeEventListener(storageEvent, onUpdate)
      }
    },
    [key],
  )
  const snapshot = useCallback(() => readFavourites(key), [key])
  const raw = useSyncExternalStore(subscribe, snapshot, () => '[]')
  const favourites = new Set(parseFavouriteIDs(raw))
  const [selectedTrack, setSelectedTrack] = useState('all')
  const [onlyFavourites, setOnlyFavourites] = useState(false)
  const [storageUnavailable, setStorageUnavailable] = useState(false)
  const favouritesButton = useRef<HTMLButtonElement>(null)
  const tracks = getProgrammeTracks(sessions)
  const activeTrack = tracks.some((track) => trackKey(track) === selectedTrack)
    ? selectedTrack
    : 'all'
  const savedCount = sessions.filter((session) => favourites.has(session.id)).length
  const visible = sessions.filter(
    (session) =>
      (!onlyFavourites || favourites.has(session.id)) &&
      (activeTrack === 'all' ||
        trackKey(session.track) === activeTrack ||
        isSharedSession(session)),
  )
  const columns = tracks.filter(
    (track) =>
      (activeTrack === 'all' || trackKey(track) === activeTrack) &&
      (!onlyFavourites || visible.some((session) => trackKey(session.track) === trackKey(track))),
  )
  const toneFor = (track: string) =>
    tones[
      Math.max(
        0,
        tracks.findIndex((value) => trackKey(value) === trackKey(track)),
      ) % tones.length
    ]

  function toggleFavourite(id: number) {
    const next = new Set(parseFavouriteIDs(readFavourites(key)))
    if (next.has(id)) {
      if (onlyFavourites) favouritesButton.current?.focus()
      next.delete(id)
    } else next.add(id)
    const value = JSON.stringify([...next])
    try {
      localStorage.setItem(key, value)
      temporaryFavourites.delete(key)
      setStorageUnavailable(false)
    } catch {
      temporaryFavourites.set(key, value)
      setStorageUnavailable(true)
    }
    window.dispatchEvent(new CustomEvent(storageEvent, { detail: key }))
  }
  const resetFilters = () => {
    setOnlyFavourites(false)
    setSelectedTrack('all')
  }

  return (
    <div
      className={styles.programme}
      data-programme-layout={singleTrack ? 'single' : 'multi'}
      style={
        { '--programme-columns': singleTrack ? 1 : Math.max(1, columns.length) } as CSSProperties
      }
    >
      <div className={styles.intro}>
        <p>Follow a track, star your must-sees, and leave a little room to meet someone new.</p>
        <span className={styles.sticker} aria-hidden="true">
          <Star filled /> A day worth starring
        </span>
      </div>
      <div className={styles.controls}>
        <div className={styles.filters} role="group" aria-label="Filter programme by track">
          <button
            type="button"
            aria-pressed={activeTrack === 'all'}
            onClick={() => setSelectedTrack('all')}
          >
            All tracks
          </button>
          {tracks.map((track) => (
            <button
              type="button"
              key={track}
              data-tone={toneFor(track)}
              aria-pressed={activeTrack === trackKey(track)}
              onClick={() => setSelectedTrack(trackKey(track))}
            >
              <span className={styles.dot} aria-hidden="true" />
              {track}
            </button>
          ))}
        </div>
        <button
          ref={favouritesButton}
          type="button"
          className={styles.favouritesView}
          aria-pressed={onlyFavourites}
          onClick={() => setOnlyFavourites(!onlyFavourites)}
        >
          <Star filled={onlyFavourites} />
          My favourites <span>{savedCount}</span>
        </button>
      </div>
      <div className={styles.summary}>
        <p role="status" aria-live="polite">
          {visible.length} {visible.length === 1 ? 'session' : 'sessions'}
          {onlyFavourites
            ? ' in your favourites'
            : activeTrack === 'all'
              ? ' to explore'
              : ` for ${tracks.find((track) => trackKey(track) === activeTrack)}`}
        </p>
        <p>
          {storageUnavailable
            ? 'Your browser couldn’t save favourites. They’ll stay for this visit.'
            : 'Favourites stay on this browser.'}{' '}
          <span>All times EAT.</span>
        </p>
      </div>
      {activeTrack !== 'all' && !onlyFavourites && (
        <p className={styles.sharedHint}>Keynotes, breaks and shared sessions stay in your day.</p>
      )}
      {!visible.length && (
        <div className={styles.empty}>
          <Star filled />
          <h3>
            {savedCount ? 'Nothing starred in this track. Yet.' : 'Your day starts with a star.'}
          </h3>
          <p>Tap the star on a session to keep your favourites together here.</p>
          <button type="button" onClick={resetFilters}>
            Browse the programme <span aria-hidden="true">↗</span>
          </button>
        </div>
      )}
      {groupProgrammeSessions(visible).map((day) => (
        <section
          className={styles.day}
          key={day.date}
          aria-label={formatEventDay(`${day.date}T00:00:00Z`)}
        >
          <header className={styles.dayHeader}>
            <h3>{formatEventDay(`${day.date}T00:00:00Z`)}</h3>
            <span>
              Pick your path <span aria-hidden="true">↘</span>
            </span>
          </header>
          <div className={styles.columnHeaders} aria-hidden="true">
            <span>EAT</span>
            <div>
              {singleTrack ? (
                <strong>Programme</strong>
              ) : columns.length ? (
                columns.map((track) => (
                  <strong key={track} data-tone={toneFor(track)}>
                    <span className={styles.dot} />
                    {track}
                  </strong>
                ))
              ) : (
                <strong>All together</strong>
              )}
            </div>
          </div>
          <div className={styles.timeline}>
            {day.slots.map((slot) => (
              <div className={styles.slot} key={slot.startsAt} data-slot-start={slot.startsAt}>
                <div className={styles.timeRail}>
                  <time dateTime={slot.startsAt}>{clock(slot.startsAt)}</time>
                  {slot.sessions.length > 1 && <small>{slot.sessions.length} at this time</small>}
                </div>
                <div className={styles.slotSessions}>
                  {slot.sessions.map((session) => {
                    const shared = isSharedSession(session),
                      saved = favourites.has(session.id)
                    const column =
                      columns.findIndex((track) => trackKey(track) === trackKey(session.track)) + 1
                    const duration = session.endsAt
                      ? Math.round(
                          (Date.parse(session.endsAt) - Date.parse(session.startsAt)) / 60000,
                        )
                      : null
                    return (
                      <article
                        key={session.id}
                        aria-labelledby={`programme-session-${session.id}`}
                        className={`${styles.session} schedule-session-card schedule-session-${session.status || 'scheduled'}`}
                        data-tone={shared ? 'neutral' : toneFor(session.track)}
                        data-shared={shared}
                        data-favourite={saved}
                        style={
                          {
                            '--programme-column':
                              shared || singleTrack ? '1 / -1' : column || 'auto',
                          } as CSSProperties
                        }
                      >
                        <div className={styles.cardTop}>
                          <span className={styles.trackLabel}>
                            {shared ? (
                              session.track
                            ) : (
                              <>
                                <span className={styles.dot} aria-hidden="true" />
                                {session.track}
                              </>
                            )}
                          </span>
                          <button
                            type="button"
                            className={styles.starButton}
                            aria-label={`${saved ? 'Remove' : 'Save'} ${session.title} ${saved ? 'from' : 'to'} favourites`}
                            aria-pressed={saved}
                            onClick={() => toggleFavourite(session.id)}
                          >
                            <Star filled={saved} />
                          </button>
                        </div>
                        <div className="schedule-session-time">
                          <time dateTime={session.startsAt}>{clock(session.startsAt)}</time>
                          {session.endsAt ? (
                            <>
                              <span aria-hidden="true">—</span>
                              <time dateTime={session.endsAt}>{clock(session.endsAt)}</time>
                            </>
                          ) : (
                            <span>onwards</span>
                          )}
                          {duration !== null && (
                            <span className={styles.duration}>{duration} min</span>
                          )}
                        </div>
                        <small className={styles.room}>
                          {session.room}
                          {session.track !== session.room ? ` · ${session.track}` : ''} ·{' '}
                          {session.format}
                        </small>
                        <h4 id={`programme-session-${session.id}`}>{session.title}</h4>
                        {session.status && session.status !== 'scheduled' && (
                          <p className="schedule-session-status">{session.status}</p>
                        )}
                        {session.publicNote && (
                          <p className="schedule-session-note">{session.publicNote}</p>
                        )}
                        {session.description && <RichText data={session.description} />}
                        {Boolean(session.speakers?.length) && (
                          <div className="schedule-speakers">
                            {session.speakers?.map((speaker) => (
                              <div className="schedule-speaker" key={speaker.id}>
                                {speaker.portrait && (
                                  <Image
                                    src={speaker.portrait.url}
                                    alt={speaker.portrait.alt}
                                    width={48}
                                    height={48}
                                    sizes="48px"
                                    className="schedule-speaker-portrait"
                                  />
                                )}
                                <div>
                                  <strong>{speaker.name}</strong>
                                  <span>
                                    {[speaker.jobTitle, speaker.company]
                                      .filter(Boolean)
                                      .join(' · ')}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </article>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
