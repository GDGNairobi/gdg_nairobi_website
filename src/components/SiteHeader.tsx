'use client'

import Link from 'next/link'
import { useState } from 'react'

type HeaderLink = { href: string; label: string }

const defaultLinks: HeaderLink[] = [
  { href: '/about', label: 'About' },
  { href: '/#community', label: 'Community' },
  { href: '/events', label: 'Events' },
  { href: '/devfest', label: 'DevFest' },
  { href: '/about#organizers', label: 'Organizers' },
]

type Props = {
  brandLabel?: string
  editionLabel?: string
  siteName?: string
  links?: HeaderLink[]
  cta?: HeaderLink
}

const isInternal = (url: string) => url.startsWith('/') || url.startsWith('#')

export function SiteHeader({
  brandLabel = 'GDG',
  editionLabel = 'Nairobi',
  siteName = 'GDG Nairobi',
  links = defaultLinks,
  cta = { href: 'https://gdg.community.dev/gdg-nairobi/', label: 'Join GDG Nairobi' },
}: Props = {}) {
  const [open, setOpen] = useState(false)

  return (
    <header className={`site-header ${open ? 'menu-open' : ''}`}>
      <Link className="site-brand" href="/" aria-label={`${siteName} home`}>
        <span className="brand-mark" aria-hidden="true"><i /><i /><i /><i /></span>
        <span><strong>{brandLabel}</strong><small>{editionLabel}</small></span>
      </Link>
      <button className="menu-toggle" type="button" aria-expanded={open} aria-controls="site-navigation" onClick={() => setOpen(!open)}>
        <span /><span /><span className="sr-only">Toggle menu</span>
      </button>
      <nav id="site-navigation" aria-label="Primary navigation">
        {links.map((link) => isInternal(link.href) ? (
          <Link href={link.href} key={link.href} onClick={() => setOpen(false)}>{link.label}</Link>
        ) : (
          <a href={link.href} key={link.href} onClick={() => setOpen(false)} rel="noreferrer" target="_blank">{link.label}</a>
        ))}
        {isInternal(cta.href) ? (
          <Link className="nav-cta" href={cta.href} onClick={() => setOpen(false)}>{cta.label} <span>↗</span></Link>
        ) : (
          <a className="nav-cta" href={cta.href} onClick={() => setOpen(false)} rel="noreferrer" target="_blank">{cta.label} <span>↗</span></a>
        )}
      </nav>
    </header>
  )
}
