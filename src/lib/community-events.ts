import config from '@payload-config'
import { getPayload } from 'payload'

export type CommunityEventCard = {
  date: string
  title: string
  type: string
  href: string
}

export const fallbackCommunityEvents: CommunityEventCard[] = [
  {
    date: '17 OCT 2026',
    title: 'Build with Google AI: Nairobi Pre-DevFest Hands-On Workshop',
    type: 'External registration',
    href: 'https://gdg.community.dev/events/details/google-gdg-nairobi-presents-build-with-google-ai-nairobi-pre-devfest-hands-on-workshop/',
  },
  {
    date: '20 JUN 2026',
    title: 'Google I/O Extended Nairobi 2026',
    type: 'Community day',
    href: 'https://gdg.community.dev/events/details/google-gdg-nairobi-presents-google-io-extended-nairobi-2026/',
  },
  {
    date: '16 MAY 2026',
    title: 'Build with AI Nairobi — Agentathon',
    type: 'Hands-on buildathon',
    href: 'https://gdg.community.dev/events/details/google-gdg-nairobi-presents-build-with-ai-nairobi-agentathon/',
  },
  {
    date: '14 MAR 2026',
    title: 'Build with AI Nairobi 2026',
    type: 'Free registration',
    href: 'https://gdg.community.dev/events/details/google-gdg-nairobi-presents-build-with-ai-nairobi-2026/',
  },
  {
    date: '13 MAR 2026',
    title: 'Building Secure Multi-Agent Systems on Cloud Run using Vertex AI on Gemini 3.0 (Part 2)',
    type: 'Free registration',
    href: 'https://gdg.community.dev/events/details/google-gdg-pwani-presents-building-secure-multi-agent-systems-on-cloud-run-using-vertex-ai-on-gemini-30-part-2/',
  },
]

const formatDate = (value: string) => new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  timeZone: 'Africa/Nairobi',
  year: 'numeric',
}).format(new Date(value)).toUpperCase()

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
      date: formatDate(event.sourceStartDate),
      title: event.sourceTitle,
      type: event.localLabel || event.sourceType || 'GDG Nairobi event',
      href: event.registrationURL || event.upstreamURL,
    }))
  } catch {
    return fallbackCommunityEvents.slice(0, limit)
  }
}
