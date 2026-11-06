import type { Session } from '@/payload-types'
import { eventDayKey } from '@/lib/event-dates'
import { mediaURL } from '@/lib/media-url'

export type ProgrammeSession = {
  id: number
  title: string
  startsAt: string
  endsAt: string | null
  room: string
  track: string
  format: Session['format']
  status: Session['sessionStatus']
  description?: Session['description']
  publicNote?: string | null
  speakers?: Array<{
    id: number
    name: string
    jobTitle: string
    company: string
    portrait: { url: string; alt: string } | null
  }>
}

const sharedTracks = new Set([
  'registration',
  'general',
  'activity',
  'keynote',
  'transition',
  'interactive demo',
  'break',
  'panel',
  'networking',
  'closing',
  'main stage',
  'all rooms',
])
const preferredOrder = ['Web', 'AI', 'Cloud', 'Android', 'Gemini']
export const trackKey = (track: string) => track.trim().toLowerCase()
export const isSharedSession = (session: ProgrammeSession) =>
  sharedTracks.has(trackKey(session.track))

export function toProgrammeSession(session: Session, offsetMinutes = 0): ProgrammeSession {
  const shifted = (value: string) =>
    new Date(Date.parse(value) + offsetMinutes * 60000).toISOString()
  return {
    id: session.id,
    title: session.title,
    startsAt: shifted(session.startsAt),
    endsAt: session.endsAt ? shifted(session.endsAt) : null,
    room: session.room,
    track: session.scheduleTrack?.trim() || session.room,
    format: session.format,
    status: session.sessionStatus,
    description: session.description,
    publicNote: session.publicNote,
    speakers: (session.speakers || []).flatMap((speaker) => {
      if (typeof speaker !== 'object' || !speaker) return []
      const portrait = typeof speaker.portrait === 'object' ? speaker.portrait : null
      return [
        {
          id: speaker.id,
          name: speaker.name,
          jobTitle: speaker.jobTitle || '',
          company: speaker.company || '',
          portrait: portrait?.url
            ? { url: mediaURL(portrait.url), alt: portrait.alt || speaker.name }
            : null,
        },
      ]
    }),
  }
}

export function getProgrammeTracks(sessions: ProgrammeSession[]) {
  const unique = new Map<string, string>()
  for (const session of sessions)
    if (!isSharedSession(session)) unique.set(trackKey(session.track), session.track)
  const order = (track: string) => {
    const index = preferredOrder.findIndex((value) => trackKey(value) === trackKey(track))
    return index < 0 ? preferredOrder.length : index
  }
  return [...unique.values()].sort((a, b) => order(a) - order(b) || a.localeCompare(b))
}

export function groupProgrammeSessions(sessions: ProgrammeSession[]) {
  const tracks = getProgrammeTracks(sessions).map(trackKey)
  const sorted = [...sessions].sort(
    (a, b) =>
      a.startsAt.localeCompare(b.startsAt) ||
      tracks.indexOf(trackKey(a.track)) - tracks.indexOf(trackKey(b.track)) ||
      a.room.localeCompare(b.room) ||
      a.id - b.id,
  )
  const days = new Map<string, Map<string, ProgrammeSession[]>>()
  for (const session of sorted) {
    const date = eventDayKey(session.startsAt)
    if (!days.has(date)) days.set(date, new Map())
    const slots = days.get(date)!
    if (!slots.has(session.startsAt)) slots.set(session.startsAt, [])
    slots.get(session.startsAt)!.push(session)
  }
  return [...days].map(([date, slots]) => ({
    date,
    slots: [...slots].map(([startsAt, rows]) => ({ startsAt, sessions: rows })),
  }))
}

export function parseFavouriteIDs(raw: string): number[] {
  try {
    const value: unknown = JSON.parse(raw)
    return Array.isArray(value)
      ? [...new Set(value.filter((id): id is number => Number.isSafeInteger(id) && id > 0))]
      : []
  } catch {
    return []
  }
}
