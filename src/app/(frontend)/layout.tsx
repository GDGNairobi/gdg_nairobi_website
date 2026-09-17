import type { Metadata } from 'next'
import React from 'react'

import { getSiteChromeContent } from '@/lib/site-content'

import './styles.css'

// Payload is the source of truth in production, so published edits should not
// wait for another deployment before they appear on the public site.
export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const chrome = await getSiteChromeContent()
  return {
    description: chrome.seo.description,
    title: {
      default: chrome.seo.title,
      template: `%s — ${chrome.editionLabel}`,
    },
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
