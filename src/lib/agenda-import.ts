import ExcelJS from 'exceljs'

const headerKey = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[\s_-]+/g, ' ')

export function agendaTimeRange(value: string): [string, string] {
  const ongoing = value.match(/^(\d{1,2}:\d{2})\s*(am|pm)?\s+onwards$/i)
  if (ongoing) return [`${ongoing[1]}${ongoing[2]?.toLowerCase() || ''}`, 'onwards']
  const match = value.match(/^(\d{1,2}:\d{2})\s*(am|pm)?\s*[-–—]\s*(\d{1,2}:\d{2})\s*(am|pm)?$/i)
  if (!match) throw new Error('Use a time range such as 11:15 am–12:00 pm, or 5:35 pm onwards.')
  let startPeriod = match[2]?.toLowerCase()
  const endPeriod = match[4]?.toLowerCase()
  if (!startPeriod && endPeriod) {
    startPeriod = endPeriod
    // A range such as 11:15–12:00 pm crosses noon.
    if (endPeriod === 'pm' && Number(match[1].split(':')[0]) > Number(match[3].split(':')[0]))
      startPeriod = 'am'
    if (endPeriod === 'pm' && match[3].startsWith('12:') && !match[1].startsWith('12:'))
      startPeriod = 'am'
  }
  if (startPeriod && !endPeriod)
    throw new Error('Include am or pm on the end time, or use 24-hour times.')
  return [`${match[1]}${startPeriod || ''}`, `${match[3]}${endPeriod || ''}`]
}

export function prepareAgenda(
  source: ExcelJS.Worksheet,
  headers: string[],
  text: (value: ExcelJS.CellValue) => string,
) {
  const find = (...names: string[]) => headers.findIndex((h) => names.includes(headerKey(h))) + 1
  const timeColumn = find('time'),
    activityColumn = find('activity'),
    detailsColumn = find('details'),
    roomColumn = find('where?', 'where', 'room')
  if (!timeColumn || !activityColumn || !detailsColumn || !roomColumn) return null

  const columns = {
    session_id: find('session id', 'id', 'sessionid'),
    date: find('date', 'event date', 'session date'),
    speakers: find('speakers', 'speaker'),
    track: find('content track/theme', 'content track', 'track', 'theme'),
    duration: find('duration'),
  }
  const workbook = new ExcelJS.Workbook(),
    sheet = workbook.addWorksheet('Programme')
  const canonicalHeaders = [
    'session_id',
    'title',
    'date',
    'start_time',
    'end_time',
    'room',
    'track',
    'format',
    'speakers',
    'description',
  ]
  sheet.addRow(canonicalHeaders)
  const errors: Array<{ row: number; message: string }> = [],
    warnings: string[] = []
  let block: { time: string; activity: string; duration: string; date: string } | undefined
  for (let n = 2; n <= source.rowCount; n++) {
    const row = source.getRow(n)
    const get = (column: number) => {
      if (!column) return ''
      const cell = row.getCell(column)
      // Excel repeats a merged cell's master value on every covered row.
      return cell.isMerged && Number(cell.master.row) !== n ? '' : text(cell.value)
    }
    try {
      if (!row.hasValues) {
        block = undefined
        continue
      }
      const time = get(timeColumn),
        activity = get(activityColumn),
        details = get(detailsColumn),
        room = get(roomColumn),
        track = get(columns.track),
        duration = get(columns.duration)
      if (time) block = { time, activity, duration, date: get(columns.date) }
      else if (!block || !/codelab/i.test(block.activity) || activity || !details || !room)
        throw new Error(
          'Only parallel codelab rows can inherit the previous time and activity. Supply a time for this row.',
        )
      const current = block!
      const [start, end] = agendaTimeRange(current.time)
      const kind = `${current.activity} ${track}`.toLowerCase()
      const format = /codelab|workshop/.test(kind)
        ? 'workshop'
        : /panel/.test(`${kind} ${details}`.toLowerCase())
          ? 'panel'
          : /keynote/.test(kind)
            ? 'keynote'
            : /break|registration|transition|networking|activity/.test(kind)
              ? 'break'
              : 'talk'
      const title =
        /partner session/i.test(current.activity) && details
          ? `${current.activity.trim()}: ${details}`
          : ['workshop', 'keynote', 'panel'].includes(format) &&
              details &&
              !/^panel\s*$/i.test(details) &&
              !/welcome/i.test(current.activity)
            ? details
            : current.activity
      const speakers = get(columns.speakers)
        .split(/\r?\n|[|;]|\s+&\s+|\s+and\s+/i)
        .map((name) =>
          name
            .replace(/^(?:co-)?host:\s*/i, '')
            .replace(/\s*\([^)]*\)\s*$/, '')
            .replace(/,+$/, '')
            .trim(),
        )
        .filter((name) => name && name !== '-')
      sheet.getRow(n).values = [
        get(columns.session_id),
        title,
        get(columns.date) || current.date,
        start,
        end,
        room && room !== '-' ? room : 'All rooms',
        track,
        format,
        speakers.join('|'),
        details !== title && !/registration/i.test(kind) ? details : '',
      ]
      // Keep duration as a check, never use it to silently repair conflicting times.
      const stated = duration || current.duration
      if (end !== 'onwards' && /^\d+\s*mins?$/i.test(stated)) {
        const minutes = (clock: string) => {
          const m = clock.match(/^(\d+):(\d+)(am|pm)?$/i)!
          return (
            (m[3] ? (Number(m[1]) % 12) + (m[3] === 'pm' ? 12 : 0) : Number(m[1])) * 60 +
            Number(m[2])
          )
        }
        const actual = minutes(end) - minutes(start)
        if (actual > 0 && actual !== parseInt(stated, 10))
          warnings.push(
            `Row ${n}: time range is ${actual} minutes; Duration says ${stated}. The time range is used.`,
          )
      }
    } catch (error) {
      errors.push({
        row: n,
        message: error instanceof Error ? error.message : 'Invalid agenda row.',
      })
    }
  }
  warnings.unshift(
    'Agenda layout recognised. Blank codelab rows share their block’s time and activity. Review speaker names before publishing.',
  )
  return {
    sheet,
    headers: canonicalHeaders,
    hasDateColumn: Boolean(columns.date),
    errors,
    warnings,
  }
}
