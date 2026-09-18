import type { MetadataRoute } from 'next'

import { absoluteSiteURL } from '@/lib/metadata'

const routes = [
  { path: '', changeFrequency: 'weekly', priority: 1 },
  { path: '/events', changeFrequency: 'daily', priority: .9 },
  { path: '/devfest', changeFrequency: 'weekly', priority: .9 },
  { path: '/about', changeFrequency: 'monthly', priority: .7 },
  { path: '/code-of-conduct', changeFrequency: 'yearly', priority: .4 },
] as const

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map(({ path, changeFrequency, priority }) => ({
    url: absoluteSiteURL(path || '/'),
    changeFrequency,
    priority,
  }))
}
