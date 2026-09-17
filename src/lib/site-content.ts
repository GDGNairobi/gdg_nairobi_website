import config from '@payload-config'
import { getPayload } from 'payload'

import type { DevfestEdition, Media, SiteSetting } from '@/payload-types'

export type SiteLink = { label: string; url: string }

export type SiteChromeContent = {
  siteName: string
  brandLabel: string
  editionLabel: string
  navigation: SiteLink[]
  headerCTA: SiteLink
  socialLinks: SiteLink[]
  footerGroups: Array<{ heading: string; links: SiteLink[] }>
  footerNote: string
  seo: { title: string; description: string }
}

type SectionState = { enabled: boolean; kicker: string; heading: string }

export type HomeContent = {
  chrome: SiteChromeContent
  year: string
  status: string
  locationLabel: string
  eventDetails: {
    startsAt?: string
    endsAt?: string
    venueName?: string
    address?: string
    mapURL?: string
  }
  hero: {
    eyebrow: string
    headline: string
    accentLine: string
    description: string
    artwork: { src: string; alt: string }
    signals: string[]
    scrollLabel: string
  }
  callsToAction: Array<{ label: string; url: string; style: string }>
  ticker: { enabled: boolean; items: string[] }
  story: SectionState & { paragraphs: string[]; quote: string }
  tracksSection: SectionState & { intro: string }
  tracks: Array<{
    code: string
    title: string
    copy: string
    color: string
    tags: string[]
  }>
  experience: SectionState & {
    marker: string
    markerLabel: string
    items: Array<{ eyebrow: string; title: string; description: string }>
  }
  cfp: SectionState & {
    badge: string
    description: string
    cta: SiteLink
    artLabelTop: string
    artLabelBottom: string
  }
  eventsSection: SectionState & { allEvents: SiteLink; syncNote: string }
  closing: SectionState & { accentLine: string; primaryCTA: SiteLink; secondaryCTA: SiteLink }
  memberStat: { value: string; label: string }
}

export const defaultSiteChromeContent: SiteChromeContent = {
  siteName: 'DevFest Nairobi',
  brandLabel: 'DevFest',
  editionLabel: 'Nairobi 2026',
  navigation: [
    { label: 'Events', url: '/events' },
    { label: 'Speakers', url: '/speakers' },
    { label: 'Schedule', url: '/schedule' },
    { label: 'Nairobi', url: '/venue' },
  ],
  headerCTA: { label: 'Join GDG Nairobi', url: 'https://gdg.community.dev/gdg-nairobi/' },
  socialLinks: [
    { label: 'GDG Nairobi', url: 'https://gdg.community.dev/gdg-nairobi/' },
    { label: 'Instagram', url: 'https://www.instagram.com/gdg_nairobi' },
    { label: 'X / Twitter', url: 'https://www.twitter.com/GDG_Nairobi' },
  ],
  footerGroups: [
    {
      heading: 'Explore',
      links: [
        { label: 'Events', url: '/events' },
        { label: 'Speakers', url: '/speakers' },
        { label: 'Schedule', url: '/schedule' },
      ],
    },
    {
      heading: 'Connect',
      links: [
        { label: 'GDG Nairobi', url: 'https://gdg.community.dev/gdg-nairobi/' },
        { label: 'Instagram', url: 'https://www.instagram.com/gdg_nairobi' },
        { label: 'X / Twitter', url: 'https://www.twitter.com/GDG_Nairobi' },
      ],
    },
    {
      heading: 'Information',
      links: [
        { label: 'Venue', url: '/venue' },
        { label: 'Team', url: '/team' },
        { label: 'Code of conduct', url: '/code-of-conduct' },
      ],
    },
  ],
  footerNote: 'Made by the community, for the community. GDG Nairobi is an independent group.',
  seo: {
    title: 'DevFest Nairobi 2026 — The Future Grows Here',
    description: 'A community-led conference where developers connect, learn, and build with Google technologies.',
  },
}

export const defaultHomeContent: HomeContent = {
  chrome: defaultSiteChromeContent,
  year: '2026',
  status: 'Announcement season',
  locationLabel: 'Nairobi, Kenya',
  eventDetails: {},
  hero: {
    eyebrow: 'Karibu Nairobi',
    headline: 'The future',
    accentLine: 'grows here.',
    description: 'A community-led conference where developers connect, learn, and build with Google technologies.',
    artwork: { src: '/images/nairobi-national-park-big-five-v2.png', alt: '' },
    signals: ['NAIROBI / 01', 'COMMUNITY / 02', 'BUILD / 03'],
    scrollLabel: 'Scroll to grow',
  },
  callsToAction: [
    { label: 'Join GDG Nairobi', url: 'https://gdg.community.dev/gdg-nairobi/', style: 'primary' },
    { label: 'See upcoming events', url: '/events', style: 'secondary' },
  ],
  ticker: { enabled: true, items: ['Jenga', 'Learn', 'Share', 'Ship', 'Together'] },
  story: {
    enabled: true,
    kicker: 'Community-led, Nairobi-built',
    heading: 'A local home for people who build.',
    paragraphs: [
      'GDG Nairobi is a volunteer-led developer community where people connect, learn, and grow around Google technologies.',
      'DevFest brings that community together for practical talks, hands-on workshops, and time to meet other builders. All experience levels are welcome.',
    ],
    quote: 'There is a seat for you here.',
  },
  tracksSection: {
    enabled: true,
    kicker: 'What grows here',
    heading: 'Four paths.\nOne ecosystem.',
    intro: 'Explore mobile, web, cloud, open source, product craft, and the tools that help ideas become useful products.',
  },
  tracks: [
    { code: '01', title: 'Build with purpose', copy: 'Turn useful ideas into responsible products that solve real problems for real people.', color: 'blue', tags: ['Product', 'AI', 'Accessibility'] },
    { code: '02', title: 'Build for everyone', copy: 'Craft fast, inclusive experiences across the web, Android, Flutter and every screen between.', color: 'red', tags: ['Web', 'Mobile', 'UX'] },
    { code: '03', title: 'Scale with confidence', copy: 'Take ideas from a Nairobi whiteboard to dependable products used around the world.', color: 'yellow', tags: ['Cloud', 'Firebase', 'DevOps'] },
    { code: '04', title: 'Ship in the open', copy: 'Share tools, lessons and hard-won experience with the community that helped you grow.', color: 'green', tags: ['Open source', 'Community'] },
  ],
  experience: {
    enabled: true,
    kicker: 'The experience',
    heading: 'Make it.\nThen meet around it.',
    marker: '2',
    markerLabel: 'Ways to\ngo deep',
    items: [
      { eyebrow: 'Day 01', title: 'Workshops & codelabs', description: 'Hands-on sessions for learning new tools and building alongside the community.' },
      { eyebrow: 'Day 02', title: 'Conference & community', description: 'Practical talks, shared lessons, and time to connect with other developers.' },
    ],
  },
  cfp: {
    enabled: true,
    badge: 'CFP / 2026',
    kicker: 'Bring your voice',
    heading: "Your lesson could unlock someone else's next idea.",
    description: 'Share a practical lesson, a useful idea, or something the community can build on. First-time and experienced speakers are welcome.',
    cta: { label: 'Register your interest', url: 'mailto:gdgnairobi@gmail.com?subject=DevFest%20Nairobi%202026%20CFP' },
    artLabelTop: 'Your story',
    artLabelBottom: 'Our stage',
  },
  eventsSection: {
    enabled: true,
    kicker: 'The root system',
    heading: 'The community never stops.',
    allEvents: { label: 'All GDG Nairobi events', url: 'https://gdg.community.dev/gdg-nairobi/' },
    syncNote: 'Events are refreshed from the official GDG Nairobi chapter page.',
  },
  closing: {
    enabled: true,
    kicker: 'Nairobi / 2026',
    heading: 'Come curious.',
    accentLine: 'Leave connected.',
    primaryCTA: { label: 'Stay in the loop', url: 'mailto:gdgnairobi@gmail.com?subject=DevFest%20Nairobi%202026' },
    secondaryCTA: { label: 'Partner with DevFest', url: '/partners' },
  },
  memberStat: { value: '9,951', label: 'GDG Nairobi members' },
}

const statusLabels: Record<string, string> = {
  announcement: 'Announcement season',
  'cfp-open': 'Call for papers open',
  'registration-open': 'Registration open',
  live: 'Happening now',
  ended: 'See you next time',
}

const cmsEnabled = () => process.env.ENABLE_CMS === 'true' || process.env.VERCEL === '1'

const withFallback = (value: string | null | undefined, fallback: string) => value?.trim() || fallback

function mapSiteChrome(settings: SiteSetting): SiteChromeContent {
  const navigation = settings.navigation
    ?.filter((item) => item.enabled !== false)
    .map(({ label, url }) => ({ label, url }))
  const socialLinks = settings.socialLinks?.map(({ label, url }) => ({ label, url }))
  const footerGroups = settings.footer?.groups?.map((group) => ({
    heading: group.heading,
    links: group.links?.map(({ label, url }) => ({ label, url })) || [],
  }))

  return {
    siteName: withFallback(settings.siteName, defaultSiteChromeContent.siteName),
    brandLabel: withFallback(settings.brandLabel, defaultSiteChromeContent.brandLabel),
    editionLabel: withFallback(settings.editionLabel, defaultSiteChromeContent.editionLabel),
    navigation: navigation?.length ? navigation : defaultSiteChromeContent.navigation,
    headerCTA: {
      label: withFallback(settings.headerCTA?.label, defaultSiteChromeContent.headerCTA.label),
      url: withFallback(settings.headerCTA?.url, defaultSiteChromeContent.headerCTA.url),
    },
    socialLinks: socialLinks?.length ? socialLinks : defaultSiteChromeContent.socialLinks,
    footerGroups: footerGroups?.length ? footerGroups : defaultSiteChromeContent.footerGroups,
    footerNote: withFallback(settings.footer?.note, defaultSiteChromeContent.footerNote),
    seo: {
      title: withFallback(settings.seo?.title, defaultSiteChromeContent.seo.title),
      description: withFallback(settings.seo?.description, defaultSiteChromeContent.seo.description),
    },
  }
}

export async function getSiteChromeContent(): Promise<SiteChromeContent> {
  if (!cmsEnabled()) return defaultSiteChromeContent

  try {
    const payload = await getPayload({ config })
    const settings = await payload.findGlobal({ slug: 'site-settings', depth: 1, draft: false })
    return mapSiteChrome(settings)
  } catch {
    return defaultSiteChromeContent
  }
}

function mapArtwork(artwork: number | Media | null | undefined) {
  if (typeof artwork === 'object' && artwork?.url) {
    return { src: artwork.url, alt: artwork.alt || '' }
  }
  return defaultHomeContent.hero.artwork
}

function mapEdition(edition: DevfestEdition, chrome: SiteChromeContent): HomeContent {
  const cmsTracks = edition.tracks?.map((track, index) => ({
    code: String(index + 1).padStart(2, '0'),
    title: track.title,
    copy: track.description,
    color: track.accent,
    tags: track.topics || [],
  }))
  const callsToAction = edition.callsToAction?.map((cta) => ({
    label: cta.label,
    url: cta.url,
    style: cta.style || 'primary',
  }))
  const stat = edition.statistics?.[0]

  return {
    ...defaultHomeContent,
    chrome,
    year: String(edition.year),
    status: statusLabels[edition.status] || defaultHomeContent.status,
    locationLabel: withFallback(edition.eventDetails?.locationLabel, defaultHomeContent.locationLabel),
    eventDetails: {
      startsAt: edition.eventDetails?.startsAt || undefined,
      endsAt: edition.eventDetails?.endsAt || undefined,
      venueName: edition.eventDetails?.venueName || undefined,
      address: edition.eventDetails?.address || undefined,
      mapURL: edition.eventDetails?.mapURL || undefined,
    },
    hero: {
      eyebrow: withFallback(edition.hero.eyebrow, defaultHomeContent.hero.eyebrow),
      headline: edition.hero.headline,
      accentLine: edition.hero.accentLine,
      description: edition.hero.description,
      artwork: mapArtwork(edition.hero.artwork),
      signals: edition.hero.signals?.length ? edition.hero.signals.map(({ label }) => label) : defaultHomeContent.hero.signals,
      scrollLabel: withFallback(edition.hero.scrollLabel, defaultHomeContent.hero.scrollLabel),
    },
    callsToAction: callsToAction?.length ? callsToAction : defaultHomeContent.callsToAction,
    ticker: {
      enabled: edition.ticker?.enabled ?? defaultHomeContent.ticker.enabled,
      items: edition.ticker?.items?.length ? edition.ticker.items.map(({ label }) => label) : defaultHomeContent.ticker.items,
    },
    story: {
      enabled: edition.storySection?.enabled ?? defaultHomeContent.story.enabled,
      kicker: withFallback(edition.storySection?.kicker, defaultHomeContent.story.kicker),
      heading: withFallback(edition.storySection?.heading, defaultHomeContent.story.heading),
      paragraphs: edition.storySection?.paragraphs?.length
        ? edition.storySection.paragraphs.map(({ text }) => text)
        : defaultHomeContent.story.paragraphs,
      quote: withFallback(edition.storySection?.quote, defaultHomeContent.story.quote),
    },
    tracksSection: {
      enabled: edition.tracksSection?.enabled ?? defaultHomeContent.tracksSection.enabled,
      kicker: withFallback(edition.tracksSection?.kicker, defaultHomeContent.tracksSection.kicker),
      heading: withFallback(edition.tracksSection?.heading, defaultHomeContent.tracksSection.heading),
      intro: withFallback(edition.tracksSection?.intro, defaultHomeContent.tracksSection.intro),
    },
    tracks: cmsTracks?.length ? cmsTracks : defaultHomeContent.tracks,
    experience: {
      enabled: edition.experienceSection?.enabled ?? defaultHomeContent.experience.enabled,
      kicker: withFallback(edition.experienceSection?.kicker, defaultHomeContent.experience.kicker),
      heading: withFallback(edition.experienceSection?.heading, defaultHomeContent.experience.heading),
      marker: withFallback(edition.experienceSection?.marker, defaultHomeContent.experience.marker),
      markerLabel: withFallback(edition.experienceSection?.markerLabel, defaultHomeContent.experience.markerLabel),
      items: edition.experienceSection?.items?.length ? edition.experienceSection.items : defaultHomeContent.experience.items,
    },
    cfp: {
      enabled: edition.cfpSection?.enabled ?? defaultHomeContent.cfp.enabled,
      badge: withFallback(edition.cfpSection?.badge, defaultHomeContent.cfp.badge),
      kicker: withFallback(edition.cfpSection?.kicker, defaultHomeContent.cfp.kicker),
      heading: withFallback(edition.cfpSection?.heading, defaultHomeContent.cfp.heading),
      description: withFallback(edition.cfpSection?.description, defaultHomeContent.cfp.description),
      cta: {
        label: withFallback(edition.cfpSection?.ctaLabel, defaultHomeContent.cfp.cta.label),
        url: withFallback(edition.cfpSection?.ctaURL, defaultHomeContent.cfp.cta.url),
      },
      artLabelTop: withFallback(edition.cfpSection?.artLabelTop, defaultHomeContent.cfp.artLabelTop),
      artLabelBottom: withFallback(edition.cfpSection?.artLabelBottom, defaultHomeContent.cfp.artLabelBottom),
    },
    eventsSection: {
      enabled: edition.eventsSection?.enabled ?? defaultHomeContent.eventsSection.enabled,
      kicker: withFallback(edition.eventsSection?.kicker, defaultHomeContent.eventsSection.kicker),
      heading: withFallback(edition.eventsSection?.heading, defaultHomeContent.eventsSection.heading),
      allEvents: {
        label: withFallback(edition.eventsSection?.allEventsLabel, defaultHomeContent.eventsSection.allEvents.label),
        url: withFallback(edition.eventsSection?.allEventsURL, defaultHomeContent.eventsSection.allEvents.url),
      },
      syncNote: withFallback(edition.eventsSection?.syncNote, defaultHomeContent.eventsSection.syncNote),
    },
    closing: {
      enabled: edition.closingSection?.enabled ?? defaultHomeContent.closing.enabled,
      kicker: withFallback(edition.closingSection?.kicker, defaultHomeContent.closing.kicker),
      heading: withFallback(edition.closingSection?.heading, defaultHomeContent.closing.heading),
      accentLine: withFallback(edition.closingSection?.accentLine, defaultHomeContent.closing.accentLine),
      primaryCTA: {
        label: withFallback(edition.closingSection?.primaryLabel, defaultHomeContent.closing.primaryCTA.label),
        url: withFallback(edition.closingSection?.primaryURL, defaultHomeContent.closing.primaryCTA.url),
      },
      secondaryCTA: {
        label: withFallback(edition.closingSection?.secondaryLabel, defaultHomeContent.closing.secondaryCTA.label),
        url: withFallback(edition.closingSection?.secondaryURL, defaultHomeContent.closing.secondaryCTA.url),
      },
    },
    memberStat: stat ? { value: stat.value, label: stat.label } : defaultHomeContent.memberStat,
  }
}

export async function getHomeContent(): Promise<HomeContent> {
  if (!cmsEnabled()) return defaultHomeContent

  try {
    const payload = await getPayload({ config })
    const settings = await payload.findGlobal({ slug: 'site-settings', depth: 2, draft: false })
    const chrome = mapSiteChrome(settings)
    const edition = typeof settings.currentEdition === 'object' ? settings.currentEdition : null
    return edition ? mapEdition(edition, chrome) : { ...defaultHomeContent, chrome }
  } catch {
    return defaultHomeContent
  }
}
