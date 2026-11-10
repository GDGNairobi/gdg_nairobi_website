'use client'

import { useCountdownClock } from '@/lib/use-countdown-clock'
import { CountdownDigits } from '@/components/CountdownDigits'
import styles from './EventCountdown.module.css'

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
  const now = useCountdownClock(deadline, !live)
  if (!Number.isFinite(deadline)) return null

  const seconds = live ? 0 : now === null ? null : Math.max(0, Math.ceil(deadline / 1000 - now))
  const countingDown = seconds === null || seconds > 0

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
        <div className={styles.timer}>
          <CountdownDigits seconds={seconds} label="Time until DevFest doors open" />
        </div>
      ) : (
        <a className={styles.programme} href="#programme">
          Explore the programme →
        </a>
      )}
    </section>
  )
}
