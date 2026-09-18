import type { MetadataRoute } from 'next'

import { absoluteSiteURL, getSiteURL } from '@/lib/metadata'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/admin/', '/api/'] },
    ],
    sitemap: absoluteSiteURL('/sitemap.xml'),
    host: getSiteURL().origin,
  }
}
