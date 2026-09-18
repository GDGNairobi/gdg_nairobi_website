import type { Metadata, Viewport } from 'next'
import React from 'react'

import { JsonLd } from '@/components/JsonLd'
import { getSiteURL } from '@/lib/metadata'
import { getSiteChromeContent } from '@/lib/site-content'

import './styles.css'

// Payload is the source of truth in production, so published edits should not
// wait for another deployment before they appear on the public site.
export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const chrome = await getSiteChromeContent()
  const title = chrome.seo.title
  const description = chrome.seo.description

  return {
    metadataBase: getSiteURL(),
    applicationName: 'GDG Nairobi',
    description,
    title: {
      default: title,
      template: '%s | GDG Nairobi',
    },
    keywords: ['GDG Nairobi', 'Google Developer Groups Nairobi', 'Nairobi developer community', 'developer events Nairobi', 'DevFest Nairobi'],
    authors: [{ name: 'GDG Nairobi', url: '/' }],
    creator: 'GDG Nairobi',
    publisher: 'GDG Nairobi',
    category: 'technology',
    referrer: 'origin-when-cross-origin',
    alternates: { canonical: '/' },
    formatDetection: { address: false, email: false, telephone: false },
    manifest: '/manifest.webmanifest',
    openGraph: {
      title,
      description,
      url: '/',
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
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
    },
  }
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f8f9fa' },
    { media: '(prefers-color-scheme: dark)', color: '#202124' },
  ],
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const chrome = await getSiteChromeContent()
  const origin = getSiteURL().toString().replace(/\/$/, '')
  const sameAs = chrome.socialLinks.map(({ url }) => url).filter((url) => url.startsWith('https://'))

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${origin}/#organization`,
        name: 'GDG Nairobi',
        alternateName: 'Google Developer Groups Nairobi',
        description: chrome.seo.description,
        url: origin,
        logo: `${origin}/icon.svg`,
        sameAs,
        areaServed: { '@type': 'City', name: 'Nairobi' },
      },
      {
        '@type': 'WebSite',
        '@id': `${origin}/#website`,
        name: 'GDG Nairobi',
        description: chrome.seo.description,
        url: origin,
        inLanguage: 'en-KE',
        publisher: { '@id': `${origin}/#organization` },
      },
    ],
  }

  return (
    <html lang="en-KE">
      <body>
        <a className="skip-link" href="#main-content">Skip to main content</a>
        <JsonLd data={structuredData} />
        {children}
      </body>
    </html>
  )
}
