import { gdgMarkPaths } from '@/lib/gdg-mark'

type Props = {
  className?: string
  compact?: boolean
}

export function GdgMark({ width, height }: { width?: number; height?: number }) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      width={width}
      height={height}
      viewBox="0 0 32 17"
      xmlns="http://www.w3.org/2000/svg"
    >
      {gdgMarkPaths.map(({ d, fill }) => (
        <path key={fill} d={d} fill={fill} />
      ))}
    </svg>
  )
}

export function GdgLogo({ className = '', compact = false }: Props) {
  return (
    <span className={`gdg-logo ${compact ? 'gdg-logo-compact' : ''} ${className}`.trim()}>
      <GdgMark />
      {!compact && <span>GDG Nairobi</span>}
    </span>
  )
}
