import styles from './CountdownDigits.module.css'
import { MatatuMark } from '@/components/MatatuMark'

export function CountdownDigits({
  seconds,
  label,
  compact = false,
}: {
  seconds: number | null
  label: string
  compact?: boolean
}) {
  const remaining = seconds ?? 0
  const units = [
    { label: 'Days', value: Math.floor(remaining / 86400) },
    { label: 'Hours', value: Math.floor(remaining / 3600) % 24 },
    { label: 'Minutes', value: Math.floor(remaining / 60) % 60 },
    { label: 'Seconds', value: remaining % 60 },
  ]
  return (
    <div className={`${styles.board} ${compact ? styles.compact : ''}`}>
      <div className={styles.destination} aria-hidden="true">
        <span>
          <MatatuMark /> Next stop
        </span>
        <span className={styles.sticker}>Tuko rada</span>
      </div>
      <div className={styles.clock} role="timer" aria-label={label} aria-live="off">
        {units.map(({ label, value }) => (
          <span className={styles.unit} key={label}>
            <span className={styles.tile}>
              <strong key={value}>{seconds === null ? '–' : String(value).padStart(2, '0')}</strong>
            </span>
            <span className={styles.label}>{label}</span>
          </span>
        ))}
      </div>
    </div>
  )
}
