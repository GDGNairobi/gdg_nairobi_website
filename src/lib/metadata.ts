import type { Metadata } from 'next'

const DEVELOPMENT_URL = 'http://localhost:3000'
const PRODUCTION_URL = 'https://beta.gdgnairobi.com'

export function getSiteURL(): URL {
  const fallback = process.env.NODE_ENV === 'production' ? PRODUCTION_URL : DEVELOPMENT_URL

  try {
    return new URL(process.env.NEXT_PUBLIC_SITE_URL?.trim() || fallback)
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
}

export function buildPageMetadata({ title, description, path, keywords = [] }: PageMetadataOptions): Metadata {
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
      images: [{ url: '/social-card', width: 1200, height: 630, alt: 'GDG Nairobi developer community' }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/social-card'],
    },
  }
}
