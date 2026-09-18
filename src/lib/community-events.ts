import config from '@payload-config'
import { getPayload } from 'payload'

import type { CommunityEvent, Session, Speaker } from '@/payload-types'
import { GDG_NAIROBI_CHAPTER_URL } from '@/lib/gdg-events'

export type CommunityEventCard = {
  date: string
  external: boolean
  title: string
  type: string
  href: string
}

export type ScheduledEvent = {
  address?: string | null
  communityURL: string
  date: string
  description?: string | null
  liveStatus: 'scheduled' | 'delayed' | 'live' | 'complete'
  notice?: string | null
  offsetMinutes: number
  registrationURL: string
  scheduleMode: 'single' | 'multi'
  sessions: Session[]
  title: string
  venue?: string | null
}

export const fallbackCommunityEvents: CommunityEventCard[] = [
  {
    date: '17 OCT 2026',
    external: true,
    title: 'Build with Google AI: Nairobi Pre-DevFest Hands-On Workshop',
    type: 'External registration',
    href: 'https://gdg.community.dev/events/details/google-gdg-nairobi-presents-build-with-google-ai-nairobi-pre-devfest-hands-on-workshop/',
  },
  {
    date: '20 JUN 2026',
    external: true,
    title: 'Google I/O Extended Nairobi 2026',
    type: 'Community day',
    href: 'https://gdg.community.dev/events/details/google-gdg-nairobi-presents-google-io-extended-nairobi-2026/',
  },
  {
    date: '16 MAY 2026',
    external: true,
    title: 'Build with AI Nairobi — Agentathon',
    type: 'Hands-on buildathon',
    href: 'https://gdg.community.dev/events/details/google-gdg-nairobi-presents-build-with-ai-nairobi-agentathon/',
  },
  {
    date: '14 MAR 2026',
    external: true,
    title: 'Build with AI Nairobi 2026',
    type: 'Free registration',
    href: 'https://gdg.community.dev/events/details/google-gdg-nairobi-presents-build-with-ai-nairobi-2026/',
  },
  {
    date: '13 MAR 2026',
    external: true,
    title: 'Building Secure Multi-Agent Systems on Cloud Run using Vertex AI on Gemini 3.0 (Part 2)',
    type: 'Free registration',
    href: 'https://gdg.community.dev/events/details/google-gdg-pwani-presents-building-secure-multi-agent-systems-on-cloud-run-using-vertex-ai-on-gemini-30-part-2/',
  },
]

const formatDate = (value?: string | null) => value ? new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  timeZone: 'Africa/Nairobi',
  year: 'numeric',
}).format(new Date(value)).toUpperCase() : 'DATE TBA'

export async function getCommunityEventCards(limit = 3): Promise<CommunityEventCard[]> {
  const cmsEnabled = process.env.ENABLE_CMS === 'true' || process.env.VERCEL === '1'
  if (!cmsEnabled) return fallbackCommunityEvents.slice(0, limit)

  try {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'community-events',
      limit,
      overrideAccess: false,
      sort: ['displayOrder', '-sourceStartDate'],
      where: { showOnSite: { equals: true } },
    })

    if (!result.docs.length) return fallbackCommunityEvents.slice(0, limit)
    return result.docs.map((event) => ({
      date: formatDate(event.localStartDate || event.sourceStartDate),
      external: event.eventDestination !== 'schedule' || !event.slug,
      title: event.localTitle || event.sourceTitle || 'Untitled event',
      type: event.localLabel || (event.eventDestination === 'schedule' ? `${event.scheduleMode === 'multi' ? 'Multi' : 'Single'}-track schedule` : event.sourceType) || 'GDG Nairobi event',
      href: event.eventDestination === 'schedule' && event.slug ? `/events/${event.slug}` : event.localRegistrationURL || event.registrationURL || event.upstreamURL || GDG_NAIROBI_CHAPTER_URL,
    }))
  } catch {
    return fallbackCommunityEvents.slice(0, limit)
  }
}

const isSpeaker = (speaker: number | Speaker): speaker is Speaker => typeof speaker !== 'number'

export const getSessionSpeakers = (session: Session) => (session.speakers || []).filter(isSpeaker)

export async function getScheduledEvent(slug: string): Promise<ScheduledEvent | null> {
  const cmsEnabled = process.env.ENABLE_CMS === 'true' || process.env.VERCEL === '1'
  if (!cmsEnabled) return null

  try {
    const payload = await getPayload({ config })
    const eventResult = await payload.find({
      collection: 'community-events',
      depth: 0,
      limit: 1,
      overrideAccess: false,
      where: {
        and: [
          { slug: { equals: slug } },
          { eventDestination: { equals: 'schedule' } },
          { showOnSite: { equals: true } },
        ],
      },
    })
    const event = eventResult.docs[0] as CommunityEvent | undefined
    if (!event) return null

    const sessionResult = await payload.find({
      collection: 'sessions',
      depth: 2,
      limit: 300,
      overrideAccess: false,
      sort: ['startsAt', 'track', 'room'],
      where: { event: { equals: event.id } },
    })
    const firstSession = sessionResult.docs[0]
    const offsetMinutes = event.scheduleStartOverride && firstSession
      ? Math.round((new Date(event.scheduleStartOverride).getTime() - new Date(firstSession.startsAt).getTime()) / 60_000)
      : event.scheduleOffsetMinutes || 0

    return {
      address: event.venueAddress,
      communityURL: event.upstreamURL || GDG_NAIROBI_CHAPTER_URL,
      date: formatDate(event.localStartDate || event.sourceStartDate),
      description: event.localDescription || event.excerpt,
      liveStatus: event.liveStatus || 'scheduled',
      notice: event.scheduleNotice,
      offsetMinutes,
      registrationURL: event.localRegistrationURL || event.registrationURL || event.upstreamURL || GDG_NAIROBI_CHAPTER_URL,
      scheduleMode: event.scheduleMode || 'single',
      sessions: sessionResult.docs,
      title: event.localTitle || event.sourceTitle || 'Untitled event',
      venue: event.venueName,
    }
  } catch {
    return null
  }
}
