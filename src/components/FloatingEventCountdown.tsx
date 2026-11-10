'use client'

import Link from 'next/link'
import { useId, useRef, useState, useSyncExternalStore } from 'react'
import { CountdownDigits } from '@/components/CountdownDigits'
import { MatatuMark } from '@/components/MatatuMark'
import {
  calendarDaysUntil,
  countdownExpiresAt,
  getImminentEvent,
  type CountdownEvent,
} from '@/lib/event-countdown'
import { eventDayKey, formatEventDate } from '@/lib/event-dates'
import { useCountdownClock } from '@/lib/use-countdown-clock'
import styles from './FloatingEventCountdown.module.css'

const dismissalKey = 'gdg-nairobi:upcoming-countdown:dismissed'
const subscribe = () => () => {}
const readDismissed = () => {
  try {
    return sessionStorage.getItem(dismissalKey) === 'true'
  } catch {
    return false
  }
}
const timeFormat = new Intl.DateTimeFormat('en-KE', {
  timeZone: 'Africa/Nairobi',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
})

export function FloatingEventCountdown({ events }: { events: CountdownEvent[] }) {
  const [dismissed, setDismissed] = useState(false)
  const [pinned, setPinned] = useState(false)
  const [hovered, setHovered] = useState(false)
  const trigger = useRef<HTMLButtonElement>(null)
  const panelID = useId()
  const savedDismissal = useSyncExternalStore(subscribe, readDismissed, () => false)
  const hidden = dismissed || savedDismissal
  const now = useCountdownClock(Math.max(...events.map(countdownExpiresAt)), !hidden)
  const event = now === null ? null : getImminentEvent(events, now * 1000)
  if (!event || hidden || now === null) return null

  const expanded = pinned || hovered
  const seconds = Math.max(0, Math.ceil(Date.parse(event.startsAt) / 1000 - now))
  const days = calendarDaysUntil(event.startsAt, now * 1000)
  const dayLabel = days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `${days} days to go`
  const compact =
    event.precision === 'date'
      ? dayLabel
      : seconds >= 86400
        ? `${Math.floor(seconds / 86400)}d ${Math.floor(seconds / 3600) % 24}h`
        : seconds >= 3600
          ? `${Math.floor(seconds / 3600)}h ${Math.floor(seconds / 60) % 60}m`
          : `${Math.floor(seconds / 60)}m ${seconds % 60}s`
  function collapse() {
    setPinned(false)
    setHovered(false)
  }
  function dismiss() {
    try {
      sessionStorage.setItem(dismissalKey, 'true')
    } catch {
      /* The close button still works without storage. */
    }
    setDismissed(true)
    document.getElementById('main-content')?.focus({ preventScroll: true })
  }

  return (
    <>
      <aside
        className={styles.notice}
        aria-label="Upcoming event countdown"
        data-expanded={expanded}
        onPointerEnter={(event) => {
          if (event.pointerType === 'mouse') setHovered(true)
        }}
        onPointerLeave={(event) => {
          if (event.pointerType === 'mouse') setHovered(false)
        }}
        onFocusCapture={(event) => {
          if (event.target !== trigger.current) setPinned(true)
        }}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) collapse()
        }}
        onKeyDown={(event) => {
          if (event.key === 'Escape' && expanded) {
            event.preventDefault()
            collapse()
            trigger.current?.focus({ preventScroll: true })
          }
        }}
      >
        <button
          ref={trigger}
          className={styles.trigger}
          type="button"
          aria-label={`Countdown for ${event.title}`}
          aria-expanded={expanded}
          aria-controls={panelID}
          aria-describedby={`${panelID}-remaining`}
          onClick={() => {
            setPinned(!pinned)
            setHovered(false)
          }}
        >
          <MatatuMark />
          <span className={styles.pillTitle}>{event.title}</span>
          <span className={styles.compact} id={`${panelID}-remaining`}>
            {compact}
          </span>
          <svg
            className={styles.chevron}
            aria-hidden="true"
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
          >
            <path d="m4 10 4-4 4 4" />
          </svg>
        </button>
        <div className={styles.panel} id={panelID} hidden={!expanded}>
          <Link className={styles.link} href={event.href} onClick={collapse}>
            <span className={styles.title}>
              {event.title} <span aria-hidden="true">→</span>
            </span>
            <time
              className={styles.date}
              dateTime={event.precision === 'date' ? eventDayKey(event.startsAt) : event.startsAt}
            >
              {formatEventDate(event.startsAt)}
              {event.precision === 'time' &&
                ` · ${timeFormat.format(new Date(event.startsAt))} EAT`}
            </time>
            {event.precision === 'time' ? (
              <CountdownDigits seconds={seconds} label={`Time until ${event.title}`} compact />
            ) : (
              <span className={styles.days}>{dayLabel}</span>
            )}
          </Link>
          <button
            className={styles.dismiss}
            type="button"
            onClick={dismiss}
            aria-label="Dismiss event countdown"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
      </aside>
      <div className={styles.spacer} data-expanded={expanded} aria-hidden="true" />
    </>
  )
}
