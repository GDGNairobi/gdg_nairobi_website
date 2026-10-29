import { createHash } from 'node:crypto'
import { Readable } from 'node:stream'
import ExcelJS from 'exceljs'
import { eventDayKey } from '@/lib/event-dates'
import type { CommunityEvent, Session } from '@/payload-types'

export const scheduleColumns = [
  'session_id',
  'title',
  'date',
  'start_time',
  'end_time',
  'room',
  'track',
  'format',
  'level',
  'speakers',
  'description',
  'day_title',
  'venue_name',
  'venue_address',
  'venue_website',
  'map_url',
] as const
export type ScheduleColumn = (typeof scheduleColumns)[number]
export type ColumnMapping = Partial<Record<ScheduleColumn, string>>
export type ImportRow = {
  row: number
  importKey: string
  title: string
  startsAt: string
  endsAt: string
  room: string
  scheduleTrack: string
  format: Session['format']
  level: NonNullable<Session['level']>
  speakerNames: string[]
  description: string
  supplied: ScheduleColumn[]
}
export type SchedulePreview = {
  headers: string[]
  mapping: ColumnMapping
  rows: ImportRow[]
  days: NonNullable<CommunityEvent['days']>
  errors: Array<{ row: number; message: string }>
  warnings: string[]
}
const aliases: Record<ScheduleColumn, string[]> = {
  session_id: ['session_id', 'id', 'agenda_id', 'external_id', 'sessionid'],
  title: ['title', 'session_title', 'name', 'session_name'],
  date: ['date', 'session_date', 'event_date'],
  start_time: ['start_time', 'start', 'starts_at', 'start_date', 'start_datetime'],
  end_time: ['end_time', 'end', 'ends_at', 'end_date', 'end_datetime'],
  room: ['room', 'stage', 'location', 'room_name'],
  track: ['track', 'track_name', 'schedule_track'],
  format: ['format', 'type', 'session_type'],
  level: ['level', 'audience_level'],
  speakers: ['speakers', 'speaker', 'speaker_names', 'presenters'],
  description: ['description', 'summary', 'abstract'],
  day_title: ['day_title', 'day_name'],
  venue_name: ['venue_name', 'venue'],
  venue_address: ['venue_address', 'address'],
  venue_website: ['venue_website'],
  map_url: ['map_url', 'directions_url'],
}
const normalized = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/^\uFEFF/, '')
    .replace(/[\s-]+/g, '_')
function cellValue(value: ExcelJS.CellValue): string {
  if (value instanceof Date) return value.toISOString()
  if (value && typeof value === 'object') {
    if ('formula' in value || 'sharedFormula' in value)
      throw new Error('Replace formula cells with their values before importing.')
    if ('richText' in value)
      return value.richText
        .map((t) => t.text)
        .join('')
        .trim()
    if ('text' in value) return String(value.text).trim()
    throw new Error('Unsupported cell value. Use plain text or dates.')
  }
  return String(value ?? '').trim()
}
function calendarDate(value: string, format: string) {
  let date = value.slice(0, 10)
  if (format !== 'iso' && /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(value)) {
    const [a, b, y] = value.split('/')
    date = `${y}-${(format === 'dmy' ? b : a).padStart(2, '0')}-${(format === 'dmy' ? a : b).padStart(2, '0')}`
  }
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    Number.isNaN(Date.parse(date)) ||
    new Date(date).toISOString().slice(0, 10) !== date
  )
    throw new Error('Use a valid date in the selected date format.')
  return date
}
function timestamp(date: string, value: string) {
  if (
    /^\d{4}-\d{2}-\d{2}T/.test(value) &&
    !value.startsWith('1899-') &&
    !value.startsWith('1900-')
  ) {
    calendarDate(value, 'iso')
    const explicit = /([zZ]|[+-]\d{2}:?\d{2})$/.test(value) ? value : `${value}+03:00`
    if (Number.isNaN(Date.parse(explicit))) throw new Error('Invalid start or end datetime.')
    return new Date(explicit).toISOString()
  }
  const raw = /^(1899|1900)-/.test(value) ? value.slice(11, 16) : value
  let hours: number, minutes: number
  const time = raw.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(am|pm)?$/i)
  if (time) {
    hours = Number(time[1])
    minutes = Number(time[2])
    const period = time[3]?.toLowerCase()
    if (period) {
      if (hours < 1 || hours > 12) throw new Error('Invalid 12-hour time.')
      hours = (hours % 12) + (period === 'pm' ? 12 : 0)
    }
  } else if (raw !== '' && Number.isFinite(Number(raw)) && Number(raw) >= 0 && Number(raw) < 1) {
    const total = Math.round(Number(raw) * 1440)
    hours = Math.floor(total / 60)
    minutes = total % 60
  } else throw new Error('Use HH:mm, an Excel time, or a complete ISO datetime for start/end.')
  if (hours > 23 || minutes > 59) throw new Error('Invalid start or end time.')
  return new Date(
    `${date}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00+03:00`,
  ).toISOString()
}
export async function previewSchedule(
  buffer: Buffer,
  filename: string,
  event: Pick<CommunityEvent, 'days'>,
  requestedMapping: ColumnMapping = {},
  dateFormat = 'iso',
): Promise<SchedulePreview> {
  if (buffer.length > 10 * 1024 * 1024) throw new Error('Files must be 10 MB or smaller.')
  if (!/\.(csv|xlsx)$/i.test(filename)) throw new Error('Choose a CSV or Excel .xlsx file.')
  const workbook = new ExcelJS.Workbook()
  const sheet = /\.csv$/i.test(filename)
    ? await workbook.csv.read(Readable.from([buffer]), { map: (v: string) => v })
    : (await workbook.xlsx.load(buffer as unknown as ExcelJS.Buffer)).worksheets[0]
  if (!sheet || sheet.rowCount < 2) throw new Error('Add a header row and at least one session.')
  if (sheet.rowCount > 2001) throw new Error('Import up to 2,000 sessions at a time.')
  const headers = Array.from({ length: sheet.columnCount }, (_, i) =>
    cellValue(sheet.getRow(1).getCell(i + 1).value),
  )
  const nonempty = headers.filter(Boolean)
  if (new Set(nonempty.map(normalized)).size !== nonempty.length)
    throw new Error('Each column must have a unique header.')
  const mapping: ColumnMapping = {}
  for (const key of scheduleColumns) {
    const selected = requestedMapping[key]
    if (selected !== undefined) {
      if (selected && !headers.includes(selected)) throw new Error(`Column not found: ${selected}`)
      mapping[key] = selected
    } else mapping[key] = headers.find((h) => aliases[key].includes(normalized(h))) || ''
  }
  const errors: SchedulePreview['errors'] = [],
    rows: ImportRow[] = [],
    days = structuredClone(event.days || []),
    warnings: string[] = []
  for (const key of ['title', 'start_time', 'end_time'] as const)
    if (!mapping[key])
      errors.push({ row: 1, message: `Map a column for ${key.replaceAll('_', ' ')}.` })
  if (errors.length) return { headers, mapping, rows, days, errors, warnings }
  const keys = new Set<string>()
  for (let n = 2; n <= sheet.rowCount; n++) {
    const row = sheet.getRow(n)
    if (!row.hasValues) continue
    try {
      const get = (key: ScheduleColumn) =>
        mapping[key] ? cellValue(row.getCell(headers.indexOf(mapping[key]!) + 1).value) : ''
      const title = get('title'),
        start = get('start_time'),
        end = get('end_time')
      if (!title) throw new Error('A session title is required.')
      const date = calendarDate(
        get('date') ||
          (/^\d{4}-\d{2}-\d{2}T/.test(start)
            ? /([zZ]|[+-]\d{2}:?\d{2})$/.test(start)
              ? eventDayKey(start)
              : start.slice(0, 10)
            : days.length === 1
              ? days[0].date
              : ''),
        dateFormat,
      )
      const startsAt = timestamp(date, start),
        endsAt = timestamp(date, end)
      if (new Date(endsAt) <= new Date(startsAt))
        throw new Error(
          'End must be after start. Use a full datetime for a session ending the next day.',
        )
      if (new Date(endsAt).getTime() - new Date(startsAt).getTime() > 24 * 60 * 60 * 1000)
        throw new Error('A session cannot exceed 24 hours.')
      const sessionDate = eventDayKey(startsAt)
      const importKey =
        get('session_id') ||
        createHash('sha256')
          .update(`${sessionDate}|${startsAt}|${title}`)
          .digest('hex')
          .slice(0, 24)
      if (keys.has(importKey)) throw new Error('Duplicate session ID in this file.')
      keys.add(importKey)
      const formats: Record<string, Session['format']> = {
        talk: 'talk',
        session: 'talk',
        workshop: 'workshop',
        keynote: 'keynote',
        panel: 'panel',
        break: 'break',
        networking: 'break',
        presentation: 'talk',
      }
      const rawFormat = get('format').toLowerCase() || 'talk',
        format = formats[rawFormat]
      if (!format) throw new Error('Format must be talk, workshop, keynote, panel or break.')
      const level = get('level').toLowerCase() || 'all'
      if (!['all', 'beginner', 'intermediate', 'advanced'].includes(level))
        throw new Error('Level must be all, beginner, intermediate or advanced.')
      let day = days.find((d) => eventDayKey(d.date) === sessionDate)
      if (!day) {
        day = {
          title: get('day_title') || `Day ${days.length + 1}`,
          date: `${sessionDate}T00:00:00.000Z`,
        }
        days.push(day)
        warnings.push(`New day: ${sessionDate}. Review its venue before publishing.`)
      }
      for (const [column, field] of [
        ['venue_name', 'venueName'],
        ['venue_address', 'venueAddress'],
        ['venue_website', 'venueWebsite'],
        ['map_url', 'mapURL'],
      ] as const) {
        const value = get(column)
        if (value) {
          if (column === 'venue_website' || column === 'map_url') {
            let valid = false
            try {
              valid = ['http:', 'https:'].includes(new URL(value).protocol)
            } catch {
              /* Report the row below. */
            }
            if (!valid) throw new Error('Use a complete http or https URL for venue links.')
          }
          const previous = rows.find((r) => eventDayKey(r.startsAt) === sessionDate)
          if (previous && day[field] && day[field] !== value)
            throw new Error('Rows for the same day have conflicting venues or directions.')
          day[field] = value
        }
      }
      rows.push({
        row: n,
        importKey,
        title,
        startsAt,
        endsAt,
        room: get('room') || get('track') || 'Main stage',
        scheduleTrack: get('track') || get('room') || 'Main stage',
        format,
        level: level as ImportRow['level'],
        speakerNames: get('speakers')
          .split(/[|;]/)
          .map((s) => s.trim())
          .filter(Boolean),
        description: get('description'),
        supplied: scheduleColumns.filter((key) => Boolean(get(key))),
      })
    } catch (error) {
      errors.push({ row: n, message: error instanceof Error ? error.message : 'Invalid session.' })
    }
  }
  for (let i = 0; i < rows.length; i++)
    for (let j = i + 1; j < rows.length; j++) {
      const a = rows[i],
        b = rows[j]
      if (
        a.room.toLowerCase() === b.room.toLowerCase() &&
        a.startsAt < b.endsAt &&
        b.startsAt < a.endsAt
      )
        errors.push({
          row: b.row,
          message: `Overlaps row ${a.row} in ${a.room}. Use separate rooms for parallel sessions.`,
        })
    }
  if (!rows.length && !errors.length) errors.push({ row: 1, message: 'No sessions found.' })
  return {
    headers,
    mapping,
    rows,
    days: days.sort((a, b) => a.date.localeCompare(b.date)),
    errors,
    warnings: [...new Set(warnings)],
  }
}
export async function scheduleTemplate(format: 'csv' | 'xlsx') {
  const workbook = new ExcelJS.Workbook(),
    sheet = workbook.addWorksheet('Schedule')
  sheet.addRow([...scheduleColumns])
  sheet.getRow(1).font = { bold: true }
  sheet.views = [{ state: 'frozen', ySplit: 1 }]
  sheet.columns.forEach((c) => {
    c.width = 24
  })
  return Buffer.from(
    format === 'xlsx' ? await workbook.xlsx.writeBuffer() : await workbook.csv.writeBuffer(),
  )
}
