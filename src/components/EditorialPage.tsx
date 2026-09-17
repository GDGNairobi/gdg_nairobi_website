import Link from 'next/link'
import type { ReactNode } from 'react'

import { getSiteChromeContent } from '@/lib/site-content'

import { SiteHeader } from './SiteHeader'

type Props = {
  eyebrow: string
  title: string
  intro: string
  accent?: 'blue' | 'green' | 'red' | 'yellow'
  children: ReactNode
}

export async function EditorialPage({ eyebrow, title, intro, accent = 'green', children }: Props) {
  const chrome = await getSiteChromeContent()

  return (
    <main className={`inner-page inner-${accent}`}>
      <SiteHeader
        brandLabel={chrome.brandLabel}
        cta={{ href: chrome.headerCTA.url, label: chrome.headerCTA.label }}
        editionLabel={chrome.editionLabel}
        links={chrome.navigation.map(({ label, url }) => ({ href: url, label }))}
        siteName={chrome.siteName}
      />
      <header className="inner-hero">
        <div className="inner-orbit" aria-hidden="true"><i /><i /><i /></div>
        <p className="section-kicker">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{intro}</p>
      </header>
      <div className="inner-content">{children}</div>
      <footer className="inner-footer">
        <Link href="/">← Back to GDG Nairobi</Link>
        <span>{chrome.siteName}</span>
      </footer>
    </main>
  )
}
