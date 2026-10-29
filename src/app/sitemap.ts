import type { MetadataRoute } from 'next'

import { absoluteSiteURL } from '@/lib/metadata'
import { getPublicEvents } from '@/lib/community-events'

export const dynamic = 'force-dynamic'

const routes = [
  { path: '', changeFrequency: 'weekly', priority: 1 },
  { path: '/events', changeFrequency: 'daily', priority: 0.9 },
  { path: '/about', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/code-of-conduct', changeFrequency: 'yearly', priority: 0.4 },
] as const

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const events = await getPublicEvents()
  return [
    ...routes.map(({ path, changeFrequency, priority }) => ({
      url: absoluteSiteURL(path || '/'),
      changeFrequency,
      priority,
    })),
    ...events.map((event) => ({
      url: absoluteSiteURL(event.href),
      lastModified: event.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ]
}
