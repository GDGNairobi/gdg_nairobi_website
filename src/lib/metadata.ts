import type { Metadata } from 'next'

const DEVELOPMENT_URL = 'http://localhost:3000'
const PRODUCTION_URL = 'https://gdgnairobi.com'

export function getSiteURL(): URL {
  const fallback = process.env.NODE_ENV === 'production' ? PRODUCTION_URL : DEVELOPMENT_URL

  // Reflect prevents Next's public-env replacement from freezing the deployment origin at build time.
  const configuredURL: string | undefined = Reflect.get(process.env, 'NEXT_PUBLIC_SITE_URL')
  try {
    return new URL(configuredURL?.trim() || fallback)
  } catch {
    return new URL(fallback)
  }
}

export function absoluteSiteURL(path = '/'): string {
  return new URL(path, getSiteURL()).toString()
}

type PageMetadataOptions = {
  title: string
  description: string
  path: string
  keywords?: string[]
  image?: { url: string; alt: string }
}

export function buildPageMetadata({
  title,
  description,
  path,
  keywords = [],
  image,
}: PageMetadataOptions): Metadata {
  const socialImage = image || { url: '/social-card', alt: 'GDG Nairobi developer community' }
  return {
    title,
    description,
    keywords,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      siteName: 'GDG Nairobi',
      locale: 'en_KE',
      type: 'website',
      images: [{ ...socialImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [socialImage],
    },
  }
}
