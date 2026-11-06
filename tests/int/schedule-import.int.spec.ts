import { describe, expect, it } from 'vitest'
import ExcelJS from 'exceljs'
import { previewSchedule } from '@/lib/schedule-import'

const csv = (text: string) => Buffer.from(text)
const event = {
  days: [{ title: 'Conference', date: '2026-11-14T00:00:00Z', venueName: 'Sarit Expo Centre' }],
}
const agendaHeaders = [
  'Time',
  'Activity',
  'Details',
  'Speakers',
  'Duration',
  'Content Track/Theme',
  'Where?',
]
async function agenda(rows: string[][], xlsx = false) {
  const workbook = new ExcelJS.Workbook(),
    sheet = workbook.addWorksheet('Agenda')
  sheet.addRow(agendaHeaders)
  rows.forEach((row) => sheet.addRow(row))
  return Buffer.from(xlsx ? await workbook.xlsx.writeBuffer() : await workbook.csv.writeBuffer())
}

describe('Schedule spreadsheet import', () => {
  it('reads quoted CSV fields, uses EAT and preserves external session IDs', async () => {
    const p = await previewSchedule(
      csv(
        'session_id,title,date,start_time,end_time,room,speakers\nbevy-42,"Learn, connect and build",2026-11-14,09:00,10:00,Stage A,Alice|Bob',
      ),
      'schedule.csv',
      event,
    )
    expect(p.errors).toEqual([])
    expect(p.rows[0]).toMatchObject({
      importKey: 'bevy-42',
      title: 'Learn, connect and build',
      startsAt: '2026-11-14T06:00:00.000Z',
      speakerNames: ['Alice', 'Bob'],
    })
  })
  it('reads native Excel date/time cells', async () => {
    const w = new ExcelJS.Workbook(),
      s = w.addWorksheet('Schedule')
    s.addRow(['Session ID', 'Title', 'Date', 'Start Time', 'End Time'])
    s.addRow(['excel-1', 'Keynote', new Date('2026-11-14T00:00:00Z'), 0.375, 10 / 24])
    s.getCell('C2').numFmt = 'yyyy-mm-dd'
    s.getCell('D2').numFmt = 'hh:mm'
    s.getCell('E2').numFmt = 'hh:mm'
    const p = await previewSchedule(Buffer.from(await w.xlsx.writeBuffer()), 'schedule.xlsx', event)
    expect(p.errors).toEqual([])
    expect(p.rows[0].startsAt).toBe('2026-11-14T06:00:00.000Z')
  })
  it('supports explicit column mapping and offset datetimes from an existing export', async () => {
    const p = await previewSchedule(
      csv(
        'External key,Agenda name,Begins,Finishes,Stage\n42,Opening,2026-11-14T06:00:00Z,2026-11-14T07:00:00Z,Main',
      ),
      'export.csv',
      event,
      {
        session_id: 'External key',
        title: 'Agenda name',
        start_time: 'Begins',
        end_time: 'Finishes',
        room: 'Stage',
      },
    )
    expect(p.errors).toEqual([])
    expect(p.rows[0].startsAt).toBe('2026-11-14T06:00:00.000Z')
  })
  it('rejects bad dates, backwards times, overlapping rooms and repeated IDs', async () => {
    const input =
      'session_id,title,date,start_time,end_time,room\n1,One,2026-11-14,09:00,10:00,A\n2,Two,2026-11-14,09:30,10:30,A\n1,Duplicate,2026-11-14,11:00,12:00,B\n3,Bad date,2026-02-30,09:00,10:00,B\n4,Backwards,2026-11-14,11:00,10:00,B'
    const p = await previewSchedule(csv(input), 'bad.csv', event)
    expect(p.errors.map((e) => e.message).join(' ')).toMatch(/Overlaps/)
    expect(p.errors).toHaveLength(4)
    const invalidISO = await previewSchedule(
      csv('title,start_time,end_time\nA,2026-02-30T09:00:00+03:00,2026-02-30T10:00:00+03:00'),
      's.csv',
      event,
    )
    expect(invalidISO.errors).toHaveLength(1)
  })
  it('allows parallel rooms and gives stable IDs when none are supplied', async () => {
    const input = csv('title,start_time,end_time,room\nA,09:00,10:00,A\nB,09:00,10:00,B')
    const a = await previewSchedule(input, 's.csv', event),
      b = await previewSchedule(input, 's.csv', event)
    expect(a.errors).toEqual([])
    expect(a.rows.map((r) => r.importKey)).toEqual(b.rows.map((r) => r.importKey))
  })
  it('creates event days from the file and rejects conflicting venue rows', async () => {
    const p = await previewSchedule(
      csv(
        'title,date,start_time,end_time,venue_name\nA,2026-11-15,09:00,10:00,Venue A\nB,2026-11-15,11:00,12:00,Venue B',
      ),
      'days.csv',
      event,
    )
    expect(p.days).toHaveLength(2)
    expect(p.errors[0].message).toMatch(/conflicting venues/)
  })
  it('rejects duplicate headers and unsupported file formats', async () => {
    await expect(previewSchedule(csv('title,title\nA,B'), 's.csv', event)).rejects.toThrow(
      /unique header/,
    )
    await expect(previewSchedule(csv('x'), 's.xls', event)).rejects.toThrow(/\.xlsx/)
  })
  it('reads the agenda layout, fills parallel blocks, separates speakers and keeps rooms', async () => {
    const input = await agenda([
      [
        '9:00 - 9:10 am',
        "Host's Welcome",
        'Welcome',
        'Host: Alice Example\nCo-Host: Bob Example',
        '10 mins',
        'General',
        'Main Stage',
      ],
      [
        '11:15 - 12:00 pm',
        'Hands-On Codelab',
        'Build a web app',
        'Carol Example',
        '45 mins',
        'Web',
        'Room A',
      ],
      ['', '', 'Build an agent', 'Dan Example & Eve Example', '', 'AI', 'Room B'],
      [
        '5:35 PM onwards',
        'Networking',
        'Community networking',
        '-',
        'Open',
        'Networking',
        'Room A',
      ],
    ])
    const p = await previewSchedule(input, 'agenda.csv', event)
    expect(p.errors).toEqual([])
    expect(p.layout).toBe('agenda')
    expect(p.rows).toHaveLength(4)
    expect(p.rows[0].speakerNames).toEqual(['Alice Example', 'Bob Example'])
    expect(p.rows[1]).toMatchObject({
      title: 'Build a web app',
      startsAt: '2026-11-14T08:15:00.000Z',
      endsAt: '2026-11-14T09:00:00.000Z',
      room: 'Room A',
      format: 'workshop',
    })
    expect(p.rows[2]).toMatchObject({
      title: 'Build an agent',
      startsAt: p.rows[1].startsAt,
      endsAt: p.rows[1].endsAt,
      room: 'Room B',
      speakerNames: ['Dan Example', 'Eve Example'],
    })
    expect(p.rows[3]).toMatchObject({
      startsAt: '2026-11-14T14:35:00.000Z',
      endsAt: null,
      speakerNames: [],
    })
  })
  it('rejects ambiguous agenda times without silently correcting the source, and warns about durations', async () => {
    const input = await agenda([
      ['11:05 - 1:20 am', 'Hands-On Codelab', 'Ambiguous time', 'Alice', '45 mins', 'Web', 'A'],
      ['', '', 'Also ambiguous', 'Bob', '', 'AI', 'B'],
      [
        '9:50 - 10:30 am',
        'Technical Keynote',
        'Useful keynote',
        'Carol',
        '30 mins',
        'Keynote',
        'Main',
      ],
    ])
    const p = await previewSchedule(input, 'agenda.csv', event)
    expect(p.errors.map((error) => error.row)).toEqual([2, 3])
    expect(p.warnings.join(' ')).toContain('40 minutes; Duration says 30 mins')
    expect(p.rows[0].title).toBe('Useful keynote')
  })
  it('handles merged Excel blocks and keeps IDs stable when codelab times change', async () => {
    const workbook = new ExcelJS.Workbook(),
      sheet = workbook.addWorksheet('Agenda')
    sheet.addRow(agendaHeaders)
    sheet.addRow(['14:20 - 15:05', 'Hands-On Codelab', 'Web lab', 'Alice', '45 mins', 'Web', 'A'])
    sheet.addRow(['', '', 'AI lab', 'Bob', '', 'AI', 'B'])
    sheet.mergeCells('A2:A3')
    sheet.mergeCells('B2:B3')
    const first = await previewSchedule(
      Buffer.from(await workbook.xlsx.writeBuffer()),
      'agenda.xlsx',
      event,
    )
    expect(first.errors).toEqual([])
    expect(first.rows.map((row) => row.row)).toEqual([2, 3])
    sheet.getCell('A2').value = '14:25 - 15:10'
    const next = await previewSchedule(
      Buffer.from(await workbook.xlsx.writeBuffer()),
      'agenda.xlsx',
      event,
    )
    expect(next.errors).toEqual([])
    expect(next.rows.map((row) => row.importKey)).toEqual(first.rows.map((row) => row.importKey))
  })
  it('requires a date for multi-day agendas and never inherits a block through a blank separator', async () => {
    const input = await agenda(
      [
        ['11:15 - 12:00 pm', 'Hands-On Codelab', 'Web lab', 'Alice', '45 mins', 'Web', 'A'],
        [],
        ['', '', 'Needs a time', 'Bob', '', 'AI', 'B'],
      ],
      true,
    )
    const p = await previewSchedule(input, 'agenda.xlsx', event)
    expect(p.errors).toEqual([expect.objectContaining({ row: 4 })])
    const multi = await previewSchedule(input, 'agenda.xlsx', {
      days: [...event.days, { title: 'Day 2', date: '2026-11-15T00:00:00Z' }],
    })
    expect(multi.errors).toContainEqual({ row: 1, message: expect.stringContaining('no dates') })
  })
  it('supports explicit agenda IDs across title changes and rejects overlaps with open activities', async () => {
    const workbook = new ExcelJS.Workbook(),
      sheet = workbook.addWorksheet('Agenda')
    sheet.addRow([...agendaHeaders, 'session_id'])
    sheet.addRow([
      '17:35 onwards',
      'Networking',
      'Connect',
      '-',
      'Open',
      'Networking',
      'A',
      'networking',
    ])
    sheet.addRow([
      '18:00 - 18:30',
      'Activity',
      'Another activity',
      '-',
      '30 mins',
      'Activity',
      'A',
      'later',
    ])
    const p = await previewSchedule(
      Buffer.from(await workbook.xlsx.writeBuffer()),
      'agenda.xlsx',
      event,
    )
    expect(p.rows[0].importKey).toBe('networking')
    expect(p.errors).toEqual([
      expect.objectContaining({ row: 3, message: expect.stringContaining('Overlaps') }),
    ])
  })
})
