import config from '@payload-config'
import { getPayload } from 'payload'

import { mediaURL } from '@/lib/media-url'

import type { Media, SiteSetting } from '@/payload-types'

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
export type CommunityHomeContent = {
  hero: {
    eyebrow: string
    headline: string
    accentLine: string
    description: string
    primaryCTA: SiteLink
    secondaryCTA: SiteLink
    photos: Array<{ src: string; alt: string }>
    photoCaption: string
  }
  statistics: Array<{ value: string; label: string }>
  about: {
    kicker: string
    heading: string
    description: string
    welcomeLead: string
    welcomeLine: string
  }
  programmes: {
    intro: string
    items: Array<{ title: string; description: string }>
    closing: string
    accessNote: string
  }
  connection: { heading: string; description: string; image: { src: string; alt: string } | null }
  pillars: Array<{ code: string; title: string; description: string; accent: string }>
  ecosystem: { kicker: string; heading: string; description: string; items: string[] }
  closing: {
    kicker: string
    heading: string
    accentLine: string
    primaryCTA: SiteLink
    secondaryCTA: SiteLink
  }
}
export type HomeContent = {
  chrome: SiteChromeContent
  community: CommunityHomeContent
  ticker: { enabled: boolean; items: string[] }
  eventsSection: { enabled: boolean }
  highlights: { enabled: boolean; kicker: string; heading: string; intro: string }
}

export const defaultSiteChromeContent: SiteChromeContent = {
  siteName: 'GDG Nairobi',
  brandLabel: 'GDG',
  editionLabel: 'Nairobi',
  navigation: [
    { label: 'About', url: '/about' },
    { label: 'Community', url: '/#community' },
    { label: 'Events', url: '/events' },
    { label: 'DevFest Nairobi', url: '/devfest' },
    { label: 'Organisers', url: '/about#organizers' },
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
        { label: 'DevFest Nairobi', url: '/devfest' },
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
        { label: 'Organisers', url: '/about#organizers' },
        { label: 'Community partners', url: '/about#partners' },
        { label: 'Code of conduct', url: '/code-of-conduct' },
      ],
    },
  ],
  footerNote:
    'GDG Nairobi is an independent group. Our activities and the opinions expressed here should not be linked to Google, the corporation.',
  seo: {
    title: 'GDG Nairobi — Learn, connect and build',
    description:
      'A volunteer-led Google Developer Group for Nairobi: events, workshops, community and DevFest.',
  },
}

export const defaultCommunityHomeContent: CommunityHomeContent = {
  hero: {
    eyebrow: 'GDG Nairobi · Volunteer-led',
    headline: 'A developer community',
    accentLine: 'for Nairobi.',
    description:
      'Learn something new, share what you know and meet people who enjoy building. Come as you are.',
    primaryCTA: { label: 'Join the community', url: 'https://gdg.community.dev/gdg-nairobi/' },
    secondaryCTA: { label: 'Explore events', url: '/events' },
    photos: [
      {
        src: '/images/community-audience-wide.jpg',
        alt: 'A wide view of the DevFest Nairobi community gathered in the conference hall.',
      },
      {
        src: '/images/community-speaker.jpg',
        alt: 'A speaker presents at a podium while DevFest Nairobi attendees follow along on laptops.',
      },
      {
        src: '/images/community-panel.jpg',
        alt: 'DevFest Nairobi attendees take part in a discussion with panelists seated on stage.',
      },
      {
        src: '/images/community-audience.jpg',
        alt: 'Rows of developers listening to a session at DevFest Nairobi.',
      },
    ],
    photoCaption: 'There is a seat for you here.',
  },
  statistics: [
    { value: '11k+', label: 'community members' },
    { value: 'Year-round', label: 'meetups and workshops' },
    { value: 'All levels', label: 'welcome to participate' },
  ],
  about: {
    kicker: 'Community, all year round',
    heading: 'Year-round events for Nairobi’s developer community.',
    description:
      'Google Developer Groups are local communities where developers connect and learn together. As part of a global community that values inclusion, GDGs welcome everyone interested in technology, from beginners taking their first steps to experienced developers building and shipping products.\n\nAt GDG Nairobi, you can learn something new, share what you know, meet people who share your interests, and grow alongside a community of builders.',
    welcomeLead: "Whether you're just getting started or have years of experience,",
    welcomeLine: "you're welcome here.",
  },
  programmes: {
    intro:
      "We run events throughout the year, including Nairobi editions of Google's global developer programmes:",
    items: [
      {
        title: 'DevFest',
        description:
          'The community tech conference hosted by GDGs around the world toward the end of each year.',
      },
      {
        title: 'Google I/O Extended',
        description:
          'We bring the announcements, ideas, and energy from Google I/O home to Nairobi.',
      },
      {
        title: 'Build with AI',
        description:
          "Hands-on sessions exploring Google's latest AI tools, technologies, and models.",
      },
    ],
    closing:
      'Alongside these, GDG Nairobi hosts hackathons, workshops, study jams, community meetups, and other learning experiences throughout the year.',
    accessNote:
      'Most of our events are free, because the only barrier to learning should be your curiosity, not your budget.',
  },
  connection: {
    heading: 'Find your people.',
    description:
      'Meet a mentor, talk through an idea or find someone to build with. There is time for conversations, questions and new connections at our events.',
    image: null,
  },
  pillars: [
    {
      code: '01',
      title: 'Learn',
      description: 'Technical talks, study jams and workshops led by community contributors.',
      accent: 'blue',
    },
    {
      code: '02',
      title: 'Connect',
      description:
        'Find a mentor, swap ideas after a talk or meet your next collaborator. Start with a conversation.',
      accent: 'red',
    },
    {
      code: '03',
      title: 'Build',
      description:
        'Try a codelab, join a hackathon and put new ideas to work alongside other developers.',
      accent: 'yellow',
    },
    {
      code: '04',
      title: 'Share',
      description: 'Present a practical lesson, document an approach or support another learner.',
      accent: 'green',
    },
  ],
  ecosystem: {
    kicker: 'More than code',
    heading: 'Connected to the wider developer community.',
    description:
      'We build alongside Women Techmakers, Google Developer Experts, GDG chapters across Africa and Nairobi’s tech communities. Meet people, share opportunities and help each other grow.',
    items: [
      'Women Techmakers',
      'Google Developer Experts',
      'GDG chapters across Africa',
      'Nairobi tech communities',
    ],
  },
  closing: {
    kicker: 'Open to every experience level',
    heading: 'Join GDG Nairobi.',
    accentLine: 'Start with the next event.',
    primaryCTA: { label: 'Join GDG Nairobi', url: 'https://gdg.community.dev/gdg-nairobi/' },
    secondaryCTA: { label: 'Meet the organisers', url: '/about#organizers' },
  },
}

export const defaultHomeContent: HomeContent = {
  chrome: defaultSiteChromeContent,
  community: defaultCommunityHomeContent,
  ticker: { enabled: true, items: ['Learn', 'Connect', 'Build', 'Share', 'Together'] },
  eventsSection: { enabled: true },
  highlights: {
    enabled: true,
    kicker: 'Previously, in Nairobi',
    heading: 'See the community in action.',
    intro: 'Watch the talks, meet the people and get a feel for our events.',
  },
}
const enabled = () => process.env.ENABLE_CMS === 'true' || process.env.VERCEL === '1'
const text = (value: string | null | undefined, fallback: string) => value?.trim() || fallback
const media = (value: number | Media | null | undefined) =>
  typeof value === 'object' && value?.url && value.alt.trim()
    ? { src: mediaURL(value.url), alt: value.alt }
    : null

function mapChrome(settings: SiteSetting): SiteChromeContent {
  const d = defaultSiteChromeContent
  const navigation = settings.navigation
    ?.filter((item) => item.enabled !== false)
    .map(({ label, url }) => ({ label, url }))
  const groups = settings.footer?.groups?.map((group) => ({
    heading: group.heading,
    links: group.links || [],
  }))
  return {
    siteName: text(settings.siteName, d.siteName),
    brandLabel: text(settings.brandLabel, d.brandLabel),
    editionLabel: text(settings.editionLabel, d.editionLabel),
    navigation: navigation?.length ? navigation : d.navigation,
    headerCTA: {
      label: text(settings.headerCTA?.label, d.headerCTA.label),
      url: text(settings.headerCTA?.url, d.headerCTA.url),
    },
    socialLinks: settings.socialLinks?.length ? settings.socialLinks : d.socialLinks,
    footerGroups: groups?.length ? groups : d.footerGroups,
    footerNote: text(settings.footer?.note, d.footerNote),
    seo: {
      title: text(settings.seo?.title, d.seo.title),
      description: text(settings.seo?.description, d.seo.description),
    },
  }
}
function mapCommunity(settings: SiteSetting): CommunityHomeContent {
  const c = settings.communityHomepage,
    d = defaultCommunityHomeContent
  const photos = c?.hero?.photos?.slice(0, 4).flatMap(({ image }) => {
    const photo = media(image)
    return photo ? [photo] : []
  })
  return {
    hero: {
      eyebrow: text(c?.hero?.eyebrow, d.hero.eyebrow),
      headline: text(c?.hero?.headline, d.hero.headline),
      accentLine: text(c?.hero?.accentLine, d.hero.accentLine),
      description: text(c?.hero?.description, d.hero.description),
      primaryCTA: {
        label: text(c?.hero?.primaryLabel, d.hero.primaryCTA.label),
        url: text(c?.hero?.primaryURL, d.hero.primaryCTA.url),
      },
      secondaryCTA: {
        label: text(c?.hero?.secondaryLabel, d.hero.secondaryCTA.label),
        url: text(c?.hero?.secondaryURL, d.hero.secondaryCTA.url),
      },
      photos: photos?.length ? photos : d.hero.photos,
      photoCaption: text(c?.hero?.photoCaption, d.hero.photoCaption),
    },
    statistics: c?.statistics?.length ? c.statistics : d.statistics,
    about: {
      kicker: text(c?.about?.kicker, d.about.kicker),
      heading: text(c?.about?.heading, d.about.heading),
      description: text(c?.about?.description, d.about.description),
      welcomeLead: text(c?.about?.welcomeLead, d.about.welcomeLead),
      welcomeLine: text(c?.about?.welcomeLine, d.about.welcomeLine),
    },
    programmes: {
      intro: text(c?.programmes?.intro, d.programmes.intro),
      items: c?.programmes?.items?.length ? c.programmes.items : d.programmes.items,
      closing: text(c?.programmes?.closing, d.programmes.closing),
      accessNote: text(c?.programmes?.accessNote, d.programmes.accessNote),
    },
    connection: {
      heading: text(c?.connection?.heading, d.connection.heading),
      description: text(c?.connection?.description, d.connection.description),
      image: media(c?.connection?.image),
    },
    pillars: c?.pillars?.length
      ? c.pillars.map((p, i) => ({
          code: String(i + 1).padStart(2, '0'),
          title: p.title,
          description: p.description,
          accent: p.accent,
        }))
      : d.pillars,
    ecosystem: {
      kicker: text(c?.ecosystem?.kicker, d.ecosystem.kicker),
      heading: text(c?.ecosystem?.heading, d.ecosystem.heading),
      description: text(c?.ecosystem?.description, d.ecosystem.description),
      items: c?.ecosystem?.items?.length
        ? c.ecosystem.items.map((i) => i.label)
        : d.ecosystem.items,
    },
    closing: {
      kicker: text(c?.closing?.kicker, d.closing.kicker),
      heading: text(c?.closing?.heading, d.closing.heading),
      accentLine: text(c?.closing?.accentLine, d.closing.accentLine),
      primaryCTA: {
        label: text(c?.closing?.primaryLabel, d.closing.primaryCTA.label),
        url: text(c?.closing?.primaryURL, d.closing.primaryCTA.url),
      },
      secondaryCTA: {
        label: text(c?.closing?.secondaryLabel, d.closing.secondaryCTA.label),
        url: text(c?.closing?.secondaryURL, d.closing.secondaryCTA.url),
      },
    },
  }
}
export async function getHomeContent(): Promise<HomeContent> {
  if (!enabled()) return defaultHomeContent
  try {
    const payload = await getPayload({ config })
    const settings = await payload.findGlobal({ slug: 'site-settings', depth: 2, draft: false })
    return {
      chrome: mapChrome(settings),
      community: mapCommunity(settings),
      ticker: {
        enabled: settings.communityHomepage?.ticker?.enabled ?? true,
        items: settings.communityHomepage?.ticker?.items?.length
          ? settings.communityHomepage.ticker.items.map((i) => i.label)
          : defaultHomeContent.ticker.items,
      },
      eventsSection: { enabled: settings.communityHomepage?.eventsEnabled ?? true },
      highlights: {
        enabled: settings.communityHomepage?.highlights?.enabled ?? true,
        kicker: text(
          settings.communityHomepage?.highlights?.kicker,
          defaultHomeContent.highlights.kicker,
        ),
        heading: text(
          settings.communityHomepage?.highlights?.heading,
          defaultHomeContent.highlights.heading,
        ),
        intro: text(
          settings.communityHomepage?.highlights?.intro,
          defaultHomeContent.highlights.intro,
        ),
      },
    }
  } catch {
    return defaultHomeContent
  }
}
export async function getSiteChromeContent() {
  return (await getHomeContent()).chrome
}
