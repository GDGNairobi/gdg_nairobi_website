import type { MetadataRoute } from 'next'

import { absoluteSiteURL, getSiteURL } from '@/lib/metadata'

// Resolve the deployed origin at request time, rather than freezing a build environment.
export const dynamic = 'force-dynamic'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin/', '/api/'] }],
    sitemap: absoluteSiteURL('/sitemap.xml'),
    host: getSiteURL().origin,
  }
}
