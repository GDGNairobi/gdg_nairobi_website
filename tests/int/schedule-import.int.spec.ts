import { describe, expect, it } from 'vitest'
import ExcelJS from 'exceljs'
import { previewSchedule } from '@/lib/schedule-import'

const csv = (text: string) => Buffer.from(text)
const event = {
  days: [{ title: 'Conference', date: '2026-11-14T00:00:00Z', venueName: 'Sarit Expo Centre' }],
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
})
