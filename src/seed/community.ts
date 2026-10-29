import path from 'node:path'
import type { Payload, PayloadRequest, RequiredDataFromCollectionSlug } from 'payload'
import {
  defaultCommunityHomeContent,
  defaultHomeContent,
  defaultSiteChromeContent,
} from '@/lib/site-content'

const revision = 'community-events-2026-10'
const chapter = 'https://gdg.community.dev/gdg-nairobi/'
const mapURL =
  'https://www.google.com/maps/dir//The+Sarit+Expo+Centre,+Pio+Gama+Pinto,+Sarit+Centre,+Karuna+Rd,+Nairobi/@-1.2106075,36.7711766,15z/data=!4m8!4m7!1m0!1m5!1m1!1s0x182f176b6e9bd5e5:0xcd8fcd4811d8fc0f!2m2!1d36.8012153!2d-1.2612988!5m1!1e4?entry=ttu&g_ep=EgoyMDI2MTAyMC4wIKXMDSoASAFQAw%3D%3D'
const video = (title: string, id: string) => ({
  title,
  url: `https://www.youtube.com/watch?v=${id}`,
  featured: true,
})
type SeedEvent = Omit<RequiredDataFromCollectionSlug<'community-events'>, 'source'> & {
  source?: 'manual' | 'bevy'
}
export async function seedCommunity(payload: Payload, req?: PayloadRequest) {
  const mediaIDs: number[] = []
  for (const photo of defaultCommunityHomeContent.hero.photos) {
    const filename = photo.src.split('/').at(-1)!
    const found = await payload.find({
      collection: 'media',
      where: { or: [{ filename: { equals: filename } }, { alt: { equals: photo.alt } }] },
      limit: 1,
      req,
    })
    const media =
      found.docs[0] ||
      (await payload.create({
        collection: 'media',
        data: { alt: photo.alt, caption: 'GDG Nairobi community photography.' },
        filePath: path.resolve(process.cwd(), 'public', photo.src.replace(/^\//, '')),
        req,
      }))
    mediaIDs.push(media.id)
  }
  const seeds: SeedEvent[] = [
    {
      localTitle: 'DevFest Nairobi 2026',
      slug: 'devfest-nairobi-2026',
      eventKind: 'devfest',
      editionYear: 2026,
      featured: true,
      displayOrder: -100,
      registrationStatus: 'open',
      registrationLabel: 'Register for DevFest Nairobi 2026',
      localRegistrationURL: chapter,
      source: 'manual',
      tagline: 'Build. Secure. Scale.',
      localDescription:
        'Join developers, founders and tech communities for a day of learning, practical sessions and conversations at DevFest Nairobi 2026. Come as you are, share what you know and meet people to build with.',
      coverImage: mediaIDs[0],
      days: [
        {
          title: 'Conference day',
          date: '2026-11-14T00:00:00.000Z',
          description:
            'Talks, workshops, codelabs and time to connect. Session times and speakers will be published as they are ready.',
          venueName: 'Sarit Expo Centre',
          venueAddress: 'Sarit Expo Centre, Westlands, Nairobi',
          venueWebsite: 'https://saritexpo.com/',
          mapURL,
        },
      ],
    },
    {
      localTitle: 'Build with Google AI: Nairobi Pre-DevFest Hands-On Workshop',
      slug: 'build-with-google-ai-nairobi-pre-devfest-hands-on-workshop',
      eventKind: 'workshop',
      editionYear: 2026,
      liveStatus: 'complete',
      days: [{ title: 'Workshop', date: '2026-10-17T00:00:00.000Z' }],
    },
    {
      localTitle: 'Google I/O Extended Nairobi 2026',
      slug: 'google-io-extended-nairobi-2026',
      eventKind: 'io-extended',
      editionYear: 2026,
      liveStatus: 'complete',
      days: [{ title: 'Community day', date: '2026-06-20T00:00:00.000Z' }],
      videos: [
        video('We Brought Google I/O to Nairobi — I/O Extended Nairobi 2026', '66EIVK_LJQc'),
      ],
      albums: [
        {
          title: 'Google I/O Extended Nairobi 2026 photos',
          url: 'https://photos.app.goo.gl/VoL9e8EwkSXHy632A',
        },
      ],
    },
    {
      localTitle: 'Build with AI Nairobi — Agentathon 2026',
      slug: 'build-with-ai-nairobi-agentathon',
      eventKind: 'build-with-ai',
      editionYear: 2026,
      liveStatus: 'complete',
      days: [{ title: 'Agentathon', date: '2026-05-16T00:00:00.000Z' }],
      albums: [
        {
          title: 'Build with AI Agentathon 2026 photos',
          url: 'https://photos.app.goo.gl/fkiCFSTnR2ixUTjz5',
        },
      ],
    },
    {
      localTitle: 'Build with AI Nairobi 2026',
      slug: 'build-with-ai-nairobi-2026',
      eventKind: 'build-with-ai',
      editionYear: 2026,
      liveStatus: 'complete',
      days: [{ title: 'Community event', date: '2026-03-14T00:00:00.000Z' }],
    },
    {
      localTitle: 'DevFest Nairobi 2025',
      slug: 'devfest-nairobi-2025',
      eventKind: 'devfest',
      editionYear: 2025,
      liveStatus: 'complete',
      localDescription: 'Revisit the people, conversations and ideas from DevFest Nairobi 2025.',
      videos: [video('DevFest Nairobi 2025 Recap and Highlights', 'XfJIhvKd_yU')],
      albums: [
        {
          title: 'DevFest Nairobi 2025 · Day 2 photos',
          url: 'https://photos.app.goo.gl/wLsY1hPeDB6z9Qse9',
        },
      ],
    },
    {
      localTitle: 'Build with AI Nairobi — Google I/O Highlights 2025',
      slug: 'build-with-ai-google-io-highlights-2025',
      eventKind: 'build-with-ai',
      editionYear: 2025,
      liveStatus: 'complete',
      videos: [video('Build with AI Nairobi: Google I/O Highlights 2025', 'QBfh1XJ4JX0')],
    },
    {
      localTitle: 'Build with AI Nairobi — May 2025',
      slug: 'build-with-ai-nairobi-may-2025',
      eventKind: 'build-with-ai',
      editionYear: 2025,
      liveStatus: 'complete',
      videos: [video('Build with AI Nairobi — May 2025', 'XgVfG-Sgbww')],
    },
    {
      localTitle: 'DevFest Nairobi 2023',
      slug: 'devfest-nairobi-2023',
      eventKind: 'devfest',
      editionYear: 2023,
      liveStatus: 'complete',
      videos: [video('DevFest Nairobi 2023 — Highlights', 'T6WEyR1RsZU')],
    },
    {
      localTitle: 'Google I/O Extended Nairobi 2022',
      slug: 'google-io-extended-nairobi-2022',
      eventKind: 'io-extended',
      editionYear: 2022,
      liveStatus: 'complete',
      videos: [video('Google I/O Extended Nairobi 2022 — Highlights', 'WAJ75tkPY8A')],
    },
    {
      localTitle: 'DevFest Nairobi 2022',
      slug: 'devfest-nairobi-2022',
      eventKind: 'devfest',
      editionYear: 2022,
      liveStatus: 'complete',
      videos: [video('DevFest Nairobi 2022 — Full Highlights', 'CCV1bNLzBEQ')],
    },
    {
      localTitle: 'DevFest Nairobi 2019',
      slug: 'devfest-nairobi-2019',
      eventKind: 'devfest',
      editionYear: 2019,
      liveStatus: 'complete',
      videos: [video('GDG DevFest Nairobi 2019 — Highlights', '1xNMMdMDnW4')],
    },
  ]
  for (const seed of seeds) {
    const found = await payload.find({
      collection: 'community-events',
      where: {
        or: [
          { slug: { equals: seed.slug } },
          { sourceTitle: { equals: seed.localTitle } },
          { upstreamURL: { like: seed.slug || '__no_slug__' } },
        ],
      },
      limit: 0,
      pagination: false,
      draft: false,
      req,
    })
    const existing = found.docs.find((event) => event.slug === seed.slug) || found.docs[0]
    if (existing?.seedRevision === revision) continue
    const data = {
      ...seed,
      source: existing?.source || seed.source || ('manual' as const),
      showOnSite: true,
      seedRevision: revision,
      _status: 'published' as const,
    }
    if (existing)
      await payload.update({ collection: 'community-events', id: existing.id, data, req })
    else await payload.create({ collection: 'community-events', data, req })
  }
  // Older chapter syncs can contain repeated titles and null slugs. Give every
  // remaining row a unique URL before consolidating duplicates below.
  const stored = await payload.find({
    collection: 'community-events',
    limit: 0,
    pagination: false,
    depth: 0,
    draft: false,
    req,
  })
  const usedSlugs = new Set(stored.docs.flatMap((event) => (event.slug ? [event.slug] : [])))
  for (const event of stored.docs.filter((event) => !event.slug)) {
    const title = event.localTitle || event.sourceTitle || `Community event ${event.id}`
    const base =
      title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') || `community-event-${event.id}`
    let slug = base,
      suffix = 0
    while (usedSlugs.has(slug)) {
      suffix++
      slug = `${base}-${event.id}${suffix > 1 ? `-${suffix}` : ''}`
    }
    usedSlugs.add(slug)
    await payload.update({
      collection: 'community-events',
      id: event.id,
      data: { localTitle: title, slug, _status: event._status || 'draft' },
      req,
    })
  }
  // Consolidate legacy duplicate DevFest records without deleting their sessions.
  const devfests = await payload.find({
    collection: 'community-events',
    limit: 0,
    pagination: false,
    depth: 0,
    draft: false,
    req,
  })
  for (const canonical of devfests.docs.filter(
    (e) => e.eventKind === 'devfest' && e.seedRevision === revision,
  )) {
    const year = canonical.editionYear
    for (const duplicate of devfests.docs.filter(
      (e) =>
        e.id !== canonical.id &&
        (e.eventKind === 'devfest' ||
          /^(?:gdg\s+)?devfest\b/i.test(e.localTitle || e.sourceTitle || '')) &&
        (e.editionYear ||
          Number(`${e.localTitle || ''} ${e.sourceTitle || ''}`.match(/20\d{2}/)?.[0])) === year,
    )) {
      await payload.update({
        collection: 'sessions',
        where: { event: { equals: duplicate.id } },
        data: { event: canonical.id },
        req,
      })
      if (
        duplicate.showOnSite ||
        duplicate.featured ||
        duplicate.eventKind !== 'devfest' ||
        duplicate.editionYear !== year
      ) {
        await payload.update({
          collection: 'community-events',
          id: duplicate.id,
          data: { showOnSite: false, featured: false, eventKind: 'devfest', editionYear: year },
          req,
        })
      }
    }
  }
  const settings = await payload.findGlobal({ slug: 'site-settings', draft: false, req })
  if (settings.seedRevision !== revision) {
    const c = defaultCommunityHomeContent,
      chrome = defaultSiteChromeContent
    await payload.updateGlobal({
      slug: 'site-settings',
      req,
      data: {
        seedRevision: revision,
        _status: 'published',
        siteName: chrome.siteName,
        brandLabel: chrome.brandLabel,
        editionLabel: chrome.editionLabel,
        navigation: chrome.navigation.map((l) => ({ ...l, enabled: true })),
        headerCTA: chrome.headerCTA,
        socialLinks: chrome.socialLinks,
        footer: { groups: chrome.footerGroups, note: chrome.footerNote },
        seo: chrome.seo,
        communityHomepage: {
          hero: {
            eyebrow: c.hero.eyebrow,
            headline: c.hero.headline,
            accentLine: c.hero.accentLine,
            description: c.hero.description,
            primaryLabel: c.hero.primaryCTA.label,
            primaryURL: c.hero.primaryCTA.url,
            secondaryLabel: c.hero.secondaryCTA.label,
            secondaryURL: c.hero.secondaryCTA.url,
            photos: mediaIDs.map((image) => ({ image })),
            photoCaption: c.hero.photoCaption,
          },
          statistics: c.statistics,
          about: c.about,
          programmes: c.programmes,
          connection: {
            heading: c.connection.heading,
            description: c.connection.description,
            image: mediaIDs[2],
          },
          pillars: c.pillars.map((p) => ({
            title: p.title,
            description: p.description,
            accent: p.accent as 'blue' | 'red' | 'yellow' | 'green',
          })),
          ecosystem: { ...c.ecosystem, items: c.ecosystem.items.map((label) => ({ label })) },
          closing: {
            kicker: c.closing.kicker,
            heading: c.closing.heading,
            accentLine: c.closing.accentLine,
            primaryLabel: c.closing.primaryCTA.label,
            primaryURL: c.closing.primaryCTA.url,
            secondaryLabel: c.closing.secondaryCTA.label,
            secondaryURL: c.closing.secondaryCTA.url,
          },
          ticker: {
            enabled: true,
            items: defaultHomeContent.ticker.items.map((label) => ({ label })),
          },
          eventsEnabled: true,
          highlights: defaultHomeContent.highlights,
        },
      },
    })
  }
  payload.logger.info(
    'Community content and unified event records seeded. Existing seeded edits are preserved on subsequent runs.',
  )
}
