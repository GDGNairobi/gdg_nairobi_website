import type { MetadataRoute } from 'next'

const routes = ['', '/events', '/speakers', '/schedule', '/venue', '/partners', '/team', '/code-of-conduct']

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  return routes.map((route) => ({
    url: `${base}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'weekly' : 'monthly',
    priority: route === '' ? 1 : 0.7,
  }))
}
