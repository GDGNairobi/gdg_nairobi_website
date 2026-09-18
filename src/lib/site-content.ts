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

export type CommunityHomeContent = {
  hero: {
    eyebrow: string
    headline: string
    accentLine: string
    description: string
    primaryCTA: SiteLink
    secondaryCTA: SiteLink
  }
  statistics: Array<{ value: string; label: string }>
  about: { kicker: string; heading: string; description: string }
  pillars: Array<{ code: string; title: string; description: string; accent: string }>
  ecosystem: { kicker: string; heading: string; description: string; items: string[] }
  closing: { kicker: string; heading: string; accentLine: string; primaryCTA: SiteLink; secondaryCTA: SiteLink }
}

export type HomeContent = {
  chrome: SiteChromeContent
  community: CommunityHomeContent
  year: string
  eventID?: number
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
  highlights: SectionState & {
    intro: string
    photos: Array<{ src: string; alt: string; caption: string }>
    videos: Array<{ title: string; url: string; label: string }>
  }
  closing: SectionState & { accentLine: string; primaryCTA: SiteLink; secondaryCTA: SiteLink }
  memberStat: { value: string; label: string }
}

export const defaultSiteChromeContent: SiteChromeContent = {
  siteName: 'GDG Nairobi',
  brandLabel: 'GDG',
  editionLabel: 'Nairobi',
  navigation: [
    { label: 'About', url: '/about' },
    { label: 'Community', url: '/#community' },
    { label: 'Events', url: '/events' },
    { label: 'DevFest 2026', url: '/devfest' },
    { label: 'Organizers', url: '/about#organizers' },
    { label: 'Shop', url: 'https://shop.gdgnairobi.com/' },
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
        { label: 'About GDG Nairobi', url: '/about' },
        { label: 'Events', url: '/events' },
        { label: 'DevFest Nairobi 2026', url: '/devfest' },
      ],
    },
    {
      heading: 'Connect',
      links: [
        { label: 'GDG Nairobi', url: 'https://gdg.community.dev/gdg-nairobi/' },
        { label: 'Instagram', url: 'https://www.instagram.com/gdg_nairobi' },
        { label: 'X / Twitter', url: 'https://www.twitter.com/GDG_Nairobi' },
        { label: 'GitHub', url: 'https://github.com/GDGNairobi/gdg_nairobi_website' },
      ],
    },
    {
      heading: 'Information',
      links: [
        { label: 'Organizers', url: '/about#organizers' },
        { label: 'DevFest partners', url: '/devfest#partners' },
        { label: 'Code of conduct', url: '/code-of-conduct' },
      ],
    },
  ],
  footerNote: 'GDG Nairobi is an independent group. Our activities and the opinions expressed here should not be linked to Google, the corporation.',
  seo: {
    title: 'GDG Nairobi — Learn, connect and build',
    description: 'A volunteer-led Google Developer Group for Nairobi: events, workshops, community and DevFest.',
  },
}

export const defaultCommunityHomeContent: CommunityHomeContent = {
  hero: {
    eyebrow: 'GDG Nairobi · Volunteer-led',
    headline: 'A developer community',
    accentLine: 'for Nairobi.',
    description: 'Meet peers, learn through practical events and share experience around Google technologies and modern software development.',
    primaryCTA: { label: 'Join the community', url: 'https://gdg.community.dev/gdg-nairobi/' },
    secondaryCTA: { label: 'Explore events', url: '/events' },
  },
  statistics: [
    { value: '9,000+', label: 'community members' },
    { value: 'Year-round', label: 'meetups and workshops' },
    { value: 'All levels', label: 'welcome to participate' },
  ],
  about: {
    kicker: 'Community, all year round',
    heading: 'Year-round events for Nairobi’s developer community.',
    description: 'GDG Nairobi is a local chapter of the global Google Developer Groups network. Volunteers organise talks, workshops, study sessions and larger events for people at different stages of their careers.',
  },
  pillars: [
    { code: '01', title: 'Learn', description: 'Technical talks, study jams and workshops led by community contributors.', accent: 'blue' },
    { code: '02', title: 'Build', description: 'Codelabs and hackathons for applying ideas in working projects.', accent: 'red' },
    { code: '03', title: 'Connect', description: 'Meet peers, mentors and collaborators from different parts of the industry.', accent: 'yellow' },
    { code: '04', title: 'Share', description: 'Present a practical lesson, document an approach or support another learner.', accent: 'green' },
  ],
  ecosystem: {
    kicker: 'More than code',
    heading: 'Connected to the wider developer community.',
    description: 'Our programmes often involve Women Techmakers, Google Developer Experts, other GDG chapters and independent technology communities. Those relationships vary by event and are credited where relevant.',
    items: ['Women Techmakers', 'Google Developer Experts', 'GDG chapters across Africa', 'Nairobi tech communities'],
  },
  closing: {
    kicker: 'Open to every experience level',
    heading: 'Join GDG Nairobi.',
    accentLine: 'Start with the next event.',
    primaryCTA: { label: 'Join GDG Nairobi', url: 'https://gdg.community.dev/gdg-nairobi/' },
    secondaryCTA: { label: 'Meet the organizers', url: '/about#organizers' },
  },
}

export const defaultHomeContent: HomeContent = {
  chrome: defaultSiteChromeContent,
  community: defaultCommunityHomeContent,
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
  highlights: {
    enabled: true,
    kicker: 'Previously, in Nairobi',
    heading: 'Made by the community.',
    intro: 'A few moments, talks and builds from previous GDG Nairobi events.',
    photos: [],
    videos: [],
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

const shopLink: SiteLink = { label: 'Shop', url: 'https://shop.gdgnairobi.com/' }
const repositoryLink: SiteLink = { label: 'GitHub', url: 'https://github.com/GDGNairobi/gdg_nairobi_website' }

function appendUniqueLink(links: SiteLink[], link: SiteLink) {
  return links.some(({ url }) => url === link.url) ? links : [...links, link]
}

function includeRepositoryLink(groups: SiteChromeContent['footerGroups']) {
  if (groups.some((group) => group.links.some(({ url }) => url === repositoryLink.url))) return groups

  const hasConnectGroup = groups.some(({ heading }) => heading.trim().toLowerCase() === 'connect')
  if (!hasConnectGroup) return [...groups, { heading: 'Connect', links: [repositoryLink] }]

  return groups.map((group) => group.heading.trim().toLowerCase() === 'connect'
    ? { ...group, links: [...group.links, repositoryLink] }
    : group)
}

function labelDevFestEdition(chrome: SiteChromeContent, year: string): SiteChromeContent {
  return {
    ...chrome,
    navigation: chrome.navigation.map((link) => link.url === '/devfest' ? { ...link, label: `DevFest ${year}` } : link),
    footerGroups: chrome.footerGroups.map((group) => ({
      ...group,
      links: group.links.map((link) => link.url === '/devfest' ? { ...link, label: `DevFest Nairobi ${year}` } : link),
    })),
  }
}

function mapSiteChrome(settings: SiteSetting): SiteChromeContent {
  const isLegacyDevFestChrome = settings.siteName === 'DevFest Nairobi' && settings.brandLabel === 'DevFest'
  if (isLegacyDevFestChrome) {
    return defaultSiteChromeContent
  }

  const navigation = settings.navigation
    ?.filter((item) => item.enabled !== false)
    .map(({ label, url }) => ({ label, url }))
  const socialLinks = settings.socialLinks?.map(({ label, url }) => ({ label, url }))
  const footerGroups = settings.footer?.groups?.map((group) => ({
    heading: group.heading,
    links: group.links?.map(({ label, url }) => ({ label, url })) || [],
  }))
  const resolvedNavigation = navigation?.length ? navigation : defaultSiteChromeContent.navigation
  const resolvedFooterGroups = footerGroups?.length ? footerGroups : defaultSiteChromeContent.footerGroups

  return {
    siteName: withFallback(settings.siteName, defaultSiteChromeContent.siteName),
    brandLabel: withFallback(settings.brandLabel, defaultSiteChromeContent.brandLabel),
    editionLabel: withFallback(settings.editionLabel, defaultSiteChromeContent.editionLabel),
    navigation: appendUniqueLink(resolvedNavigation, shopLink),
    headerCTA: {
      label: withFallback(settings.headerCTA?.label, defaultSiteChromeContent.headerCTA.label),
      url: withFallback(settings.headerCTA?.url, defaultSiteChromeContent.headerCTA.url),
    },
    socialLinks: socialLinks?.length ? socialLinks : defaultSiteChromeContent.socialLinks,
    footerGroups: includeRepositoryLink(resolvedFooterGroups),
    footerNote: withFallback(settings.footer?.note, defaultSiteChromeContent.footerNote),
    seo: {
      title: withFallback(settings.seo?.title, defaultSiteChromeContent.seo.title),
      description: withFallback(settings.seo?.description, defaultSiteChromeContent.seo.description),
    },
  }
}

function mapCommunityHomepage(settings: SiteSetting): CommunityHomeContent {
  const community = settings.communityHomepage
  const statistics = community?.statistics?.map(({ value, label }) => ({ value, label }))
  const pillars = community?.pillars?.map((pillar, index) => ({
    code: String(index + 1).padStart(2, '0'),
    title: pillar.title,
    description: pillar.description,
    accent: pillar.accent,
  }))
  const ecosystemItems = community?.ecosystem?.items?.map(({ label }) => label)

  return {
    hero: {
      eyebrow: withFallback(community?.hero?.eyebrow, defaultCommunityHomeContent.hero.eyebrow),
      headline: withFallback(community?.hero?.headline, defaultCommunityHomeContent.hero.headline),
      accentLine: withFallback(community?.hero?.accentLine, defaultCommunityHomeContent.hero.accentLine),
      description: withFallback(community?.hero?.description, defaultCommunityHomeContent.hero.description),
      primaryCTA: {
        label: withFallback(community?.hero?.primaryLabel, defaultCommunityHomeContent.hero.primaryCTA.label),
        url: withFallback(community?.hero?.primaryURL, defaultCommunityHomeContent.hero.primaryCTA.url),
      },
      secondaryCTA: {
        label: withFallback(community?.hero?.secondaryLabel, defaultCommunityHomeContent.hero.secondaryCTA.label),
        url: withFallback(community?.hero?.secondaryURL, defaultCommunityHomeContent.hero.secondaryCTA.url),
      },
    },
    statistics: statistics?.length ? statistics : defaultCommunityHomeContent.statistics,
    about: {
      kicker: withFallback(community?.about?.kicker, defaultCommunityHomeContent.about.kicker),
      heading: withFallback(community?.about?.heading, defaultCommunityHomeContent.about.heading),
      description: withFallback(community?.about?.description, defaultCommunityHomeContent.about.description),
    },
    pillars: pillars?.length ? pillars : defaultCommunityHomeContent.pillars,
    ecosystem: {
      kicker: withFallback(community?.ecosystem?.kicker, defaultCommunityHomeContent.ecosystem.kicker),
      heading: withFallback(community?.ecosystem?.heading, defaultCommunityHomeContent.ecosystem.heading),
      description: withFallback(community?.ecosystem?.description, defaultCommunityHomeContent.ecosystem.description),
      items: ecosystemItems?.length ? ecosystemItems : defaultCommunityHomeContent.ecosystem.items,
    },
    closing: {
      kicker: withFallback(community?.closing?.kicker, defaultCommunityHomeContent.closing.kicker),
      heading: withFallback(community?.closing?.heading, defaultCommunityHomeContent.closing.heading),
      accentLine: withFallback(community?.closing?.accentLine, defaultCommunityHomeContent.closing.accentLine),
      primaryCTA: {
        label: withFallback(community?.closing?.primaryLabel, defaultCommunityHomeContent.closing.primaryCTA.label),
        url: withFallback(community?.closing?.primaryURL, defaultCommunityHomeContent.closing.primaryCTA.url),
      },
      secondaryCTA: {
        label: withFallback(community?.closing?.secondaryLabel, defaultCommunityHomeContent.closing.secondaryCTA.label),
        url: withFallback(community?.closing?.secondaryURL, defaultCommunityHomeContent.closing.secondaryCTA.url),
      },
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

function mapMedia(media: number | Media | null | undefined) {
  if (typeof media !== 'object' || !media?.url) return null
  return { src: media.url, alt: media.alt || '' }
}

function mapEdition(edition: DevfestEdition, chrome: SiteChromeContent): HomeContent {
  const year = String(edition.year)
  const event = typeof edition.event === 'object' ? edition.event : null
  const editionChrome = labelDevFestEdition(chrome, year)
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
    chrome: editionChrome,
    year,
    eventID: event?.id,
    status: statusLabels[edition.status] || defaultHomeContent.status,
    locationLabel: withFallback(edition.eventDetails?.locationLabel, defaultHomeContent.locationLabel),
    eventDetails: {
      startsAt: event?.localStartDate || event?.sourceStartDate || edition.eventDetails?.startsAt || undefined,
      endsAt: edition.eventDetails?.endsAt || undefined,
      venueName: event?.venueName || edition.eventDetails?.venueName || undefined,
      address: event?.venueAddress || edition.eventDetails?.address || undefined,
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
    highlights: {
      enabled: edition.highlightsSection?.enabled ?? defaultHomeContent.highlights.enabled,
      kicker: withFallback(edition.highlightsSection?.kicker, defaultHomeContent.highlights.kicker),
      heading: withFallback(edition.highlightsSection?.heading, defaultHomeContent.highlights.heading),
      intro: withFallback(edition.highlightsSection?.intro, defaultHomeContent.highlights.intro),
      photos: edition.highlightsSection?.photos?.flatMap((photo) => {
        const image = mapMedia(photo.image)
        return image ? [{ ...image, caption: photo.caption || '' }] : []
      }) || [],
      videos: edition.highlightsSection?.videos?.map((video) => ({
        title: video.title,
        url: video.url,
        label: video.label || 'Watch on YouTube',
      })) || [],
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
    const community = mapCommunityHomepage(settings)
    const edition = typeof settings.currentEdition === 'object' ? settings.currentEdition : null
    return edition ? { ...mapEdition(edition, chrome), community } : { ...defaultHomeContent, chrome, community }
  } catch {
    return defaultHomeContent
  }
}
