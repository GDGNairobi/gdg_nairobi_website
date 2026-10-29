'use client'

import { useRowLabel } from '@payloadcms/ui'

export function EventDayLabel() {
  const { data, rowNumber } = useRowLabel<{ title?: string; date?: string; venueName?: string }>()
  return (
    <span>
      {data.title || `Day ${(rowNumber ?? 0) + 1}`}
      {data.date && ` · ${data.date.slice(0, 10)}`}
      {data.venueName && ` · ${data.venueName}`}
    </span>
  )
}
