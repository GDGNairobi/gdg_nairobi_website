'use client'

import { useCallback, useSyncExternalStore } from 'react'
import styles from './EventCountdown.module.css'

const currentSecond = () => Math.floor(Date.now() / 1000)
const dateFormat = new Intl.DateTimeFormat('en-KE', {
  timeZone: 'Africa/Nairobi',
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})
const timeFormat = new Intl.DateTimeFormat('en-KE', {
  timeZone: 'Africa/Nairobi',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
})

export function EventCountdown({ startsAt, live = false }: { startsAt: string; live?: boolean }) {
  const deadline = Date.parse(startsAt)
  const subscribe = useCallback(
    (notify: () => void) => {
      if (live || !Number.isFinite(deadline) || Date.now() >= deadline) return () => {}
      const timer = window.setInterval(() => {
        notify()
        if (Date.now() >= deadline) window.clearInterval(timer)
      }, 1000)
      return () => window.clearInterval(timer)
    },
    [deadline, live],
  )
  // A stable server placeholder avoids hydrating a stale or different server clock.
  const now = useSyncExternalStore(subscribe, currentSecond, () => null)
  if (!Number.isFinite(deadline)) return null

  const seconds = live ? 0 : now === null ? null : Math.max(0, Math.ceil(deadline / 1000 - now))
  const countingDown = seconds === null || seconds > 0
  const remaining = seconds ?? 0
  const units = [
    { label: 'Days', value: Math.floor(remaining / 86400) },
    { label: 'Hours', value: Math.floor(remaining / 3600) % 24 },
    { label: 'Minutes', value: Math.floor(remaining / 60) % 60 },
    { label: 'Seconds', value: remaining % 60 },
  ]

  return (
    <section className={styles.countdown} aria-label="DevFest countdown">
      <div className={styles.heading}>
        <div role={!countingDown ? 'status' : undefined}>
          <h2>{countingDown ? 'Doors open in' : 'DevFest is here.'}</h2>
        </div>
        <p>
          <time dateTime={startsAt}>
            {dateFormat.format(deadline)} · {timeFormat.format(deadline)} EAT
          </time>
        </p>
      </div>
      {countingDown ? (
        <div
          className={styles.timer}
          role="timer"
          aria-label="Time until DevFest doors open"
          aria-live="off"
        >
          {units.map(({ label, value }) => (
            <span className={styles.unit} key={label}>
              <strong>{seconds === null ? '–' : String(value).padStart(2, '0')}</strong>
              <span>{label}</span>
            </span>
          ))}
        </div>
      ) : (
        <a className={styles.programme} href="#programme">
          Explore the programme →
        </a>
      )}
    </section>
  )
}
