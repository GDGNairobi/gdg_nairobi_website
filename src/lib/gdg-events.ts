import type { Payload } from 'payload'

export const GDG_NAIROBI_CHAPTER_URL = 'https://gdg.community.dev/gdg-nairobi/'

export type CommunityEventSource = {
  upstreamURL: string
  sourceTitle: string
  sourceStartDate: string
  sourceType?: string
  registrationURL?: string
  imageURL?: string
  excerpt?: string
  upstreamStatus: 'live' | 'completed'
}

export type SyncResult = {
  status: 'ok' | 'error'
  timestamp: string
  imported: number
  updated: number
  stale: number
  error?: string
}

type RawEvent = {
  cohost_registration_url?: unknown
  cropped_banner_url?: unknown
  cropped_picture_url?: unknown
  description_short?: unknown
  event_type_title?: unknown
  start_date?: unknown
  title?: unknown
  url?: unknown
}

const asString = (value: unknown) => typeof value === 'string' ? value.trim() : ''

const decodeEntities = (value: string) => value
  .replaceAll('&amp;', '&')
  .replaceAll('&lt;', '<')
  .replaceAll('&gt;', '>')
  .replaceAll('&quot;', '"')
  .replaceAll('&#39;', "'")
  .replace(/<[^>]*>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim()

function normalizeEvent(raw: RawEvent, status: 'live' | 'completed'): CommunityEventSource | null {
  const upstreamURL = asString(raw.url)
  const sourceTitle = asString(raw.title)
  const sourceStartDate = asString(raw.start_date)

  if (!upstreamURL.startsWith('https://gdg.community.dev/events/') || !sourceTitle || Number.isNaN(Date.parse(sourceStartDate))) {
    return null
  }

  const registrationURL = asString(raw.cohost_registration_url) || upstreamURL
  const imageURL = asString(raw.cropped_picture_url) || asString(raw.cropped_banner_url)

  return {
    upstreamURL,
    sourceTitle,
    sourceStartDate,
    sourceType: asString(raw.event_type_title) || undefined,
    registrationURL: registrationURL.startsWith('https://gdg.community.dev/') ? registrationURL : upstreamURL,
    imageURL: imageURL.startsWith('https://res.cloudinary.com/') ? imageURL : undefined,
    excerpt: decodeEntities(asString(raw.description_short)) || undefined,
    upstreamStatus: status,
  }
}

export function parseChapterEvents(html: string): CommunityEventSource[] {
  const match = html.match(/<script[^>]+id=["']__NEXT_DATA__["'][^>]*>([\s\S]*?)<\/script>/i)
  if (!match?.[1]) throw new Error('The GDG chapter page did not contain embedded event data.')

  let data: unknown
  try {
    data = JSON.parse(match[1])
  } catch {
    throw new Error('The GDG chapter event payload was not valid JSON.')
  }

  const prerenderData = (data as {
    props?: { pageProps?: { prerenderData?: {
      upcomingEvents?: { results?: RawEvent[] }
      pastEvents?: { results?: RawEvent[] }
    } } }
  }).props?.pageProps?.prerenderData

  if (!prerenderData) throw new Error('The GDG chapter event payload changed shape.')

  const upcoming = Array.isArray(prerenderData.upcomingEvents?.results)
    ? prerenderData.upcomingEvents.results
    : []
  const completed = Array.isArray(prerenderData.pastEvents?.results)
    ? prerenderData.pastEvents.results
    : []

  return [
    ...upcoming.map((event) => normalizeEvent(event, 'live')),
    ...completed.map((event) => normalizeEvent(event, 'completed')),
  ].filter((event): event is CommunityEventSource => Boolean(event))
}

export async function fetchChapterEvents(): Promise<CommunityEventSource[]> {
  const response = await fetch(GDG_NAIROBI_CHAPTER_URL, {
    cache: 'no-store',
    headers: {
      Accept: 'text/html,application/xhtml+xml',
      'User-Agent': 'DevFest-Nairobi-Website/1.0 (+https://gdg.community.dev/gdg-nairobi/)',
    },
    signal: AbortSignal.timeout(15_000),
  })

  if (!response.ok) throw new Error(`The GDG chapter page returned ${response.status}.`)
  return parseChapterEvents(await response.text())
}

export async function syncChapterEvents(payload: Payload): Promise<SyncResult> {
  const timestamp = new Date().toISOString()

  try {
    const incoming = await fetchChapterEvents()
    const seen = new Set(incoming.map((event) => event.upstreamURL))
    let imported = 0
    let updated = 0
    let stale = 0

    for (const event of incoming) {
      const existing = await payload.find({
        collection: 'community-events',
        limit: 1,
        overrideAccess: true,
        where: { upstreamURL: { equals: event.upstreamURL } },
      })
      const data = { ...event, lastSyncedAt: timestamp, source: 'bevy' as const }

      if (existing.docs[0]) {
        await payload.update({ collection: 'community-events', id: existing.docs[0].id, data, overrideAccess: true })
        updated += 1
      } else {
        await payload.create({
          collection: 'community-events',
          data: { ...data, showOnSite: true, featured: false, displayOrder: 0 },
          overrideAccess: true,
        })
        imported += 1
      }
    }

    const stored = await payload.find({
      collection: 'community-events',
      limit: 500,
      overrideAccess: true,
      where: { source: { equals: 'bevy' } },
    })

    for (const event of stored.docs) {
      if (!seen.has(event.upstreamURL) && event.upstreamStatus !== 'stale') {
        await payload.update({
          collection: 'community-events',
          id: event.id,
          data: { upstreamStatus: 'stale', lastSyncedAt: timestamp },
          overrideAccess: true,
        })
        stale += 1
      }
    }

    return { status: 'ok', timestamp, imported, updated, stale }
  } catch (error) {
    payload.logger.error({ err: error }, 'GDG Nairobi event sync failed; retained last good data.')
    return {
      status: 'error',
      timestamp,
      imported: 0,
      updated: 0,
      stale: 0,
      error: error instanceof Error ? error.message : 'Unknown synchronization error.',
    }
  }
}
