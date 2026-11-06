import { describe, expect, it } from 'vitest'
import {
  getProgrammeTracks,
  groupProgrammeSessions,
  isSharedSession,
  parseFavouriteIDs,
  toProgrammeSession,
  type ProgrammeSession,
} from '@/lib/programme'
import type { Session } from '@/payload-types'

const session = (id: number, track: string, startsAt: string): ProgrammeSession => ({
  id,
  title: `Session ${id}`,
  track,
  startsAt,
  endsAt: null,
  room: track,
  format: 'workshop',
  status: 'scheduled',
})

describe('Attendee programme', () => {
  it('groups parallel sessions chronologically and keeps separate Nairobi event days', () => {
    const input = [
      session(3, 'AI', '2026-11-14T08:15:00.000Z'),
      session(4, 'Cloud', '2026-11-15T06:00:00.000Z'),
      session(1, 'General', '2026-11-14T06:00:00.000Z'),
      session(2, 'Web', '2026-11-14T08:15:00.000Z'),
    ]
    const days = groupProgrammeSessions(input)
    expect(days.map((day) => day.date)).toEqual(['2026-11-14', '2026-11-15'])
    expect(days[0].slots.map((slot) => slot.sessions.map((row) => row.id))).toEqual([[1], [2, 3]])
    expect(input.map((row) => row.id)).toEqual([3, 4, 1, 2])
  })
  it('applies the live time adjustment before grouping days and preserves open-ended activities', () => {
    const row = toProgrammeSession(
      {
        id: 1,
        title: 'Networking',
        startsAt: '2026-11-14T20:45:00Z',
        endsAt: null,
        room: 'Main Stage',
        scheduleTrack: 'Networking',
        format: 'break',
      } as Session,
      30,
    )
    expect(row.startsAt).toBe('2026-11-14T21:15:00.000Z')
    expect(row.endsAt).toBeNull()
    expect(groupProgrammeSessions([row])[0].date).toBe('2026-11-15')
  })
  it('offers content tracks while recognising shared keynotes and breaks', () => {
    const input = [
      'Cloud',
      'General',
      'AI',
      'Web',
      'Android',
      'Gemini',
      'Transition',
      'Networking',
      'Keynote',
      'Web',
    ].map((track, i) => session(i + 1, track, '2026-11-14T08:15:00Z'))
    expect(getProgrammeTracks(input)).toEqual(['Web', 'AI', 'Cloud', 'Android', 'Gemini'])
    expect(isSharedSession(input[1])).toBe(true)
    expect(isSharedSession(input[0])).toBe(false)
  })
  it('treats corrupted favourites as empty and accepts only unique positive session IDs', () => {
    expect(parseFavouriteIDs('broken')).toEqual([])
    expect(parseFavouriteIDs('{"ids":[1]}')).toEqual([])
    expect(parseFavouriteIDs('[1,2,2,"3",null,-1,0,1.5,9007199254740992]')).toEqual([1, 2])
  })
})
