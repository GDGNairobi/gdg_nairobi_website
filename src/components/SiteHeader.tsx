'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

import { GdgLogo } from './GdgLogo'

type HeaderLink = { href: string; label: string }

const defaultLinks: HeaderLink[] = [
  { href: '/about', label: 'About' },
  { href: '/#community', label: 'Community' },
  { href: '/events', label: 'Events' },
  { href: '/devfest', label: 'DevFest' },
  { href: '/about#organizers', label: 'Organizers' },
]

type Props = {
  siteName?: string
  links?: HeaderLink[]
  cta?: HeaderLink
}

const isInternal = (url: string) => url.startsWith('/') || url.startsWith('#')

export function SiteHeader({
  siteName = 'GDG Nairobi',
  links = defaultLinks,
  cta = { href: 'https://gdg.community.dev/gdg-nairobi/', label: 'Join GDG Nairobi' },
}: Props = {}) {
  const [open, setOpen] = useState(false)
  const toggleRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setOpen(false)
      toggleRef.current?.focus()
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [open])

  return (
    <header className={`site-header ${open ? 'menu-open' : ''}`}>
      <Link className="site-brand" href="/" aria-label={`${siteName} home`}>
        <GdgLogo />
      </Link>
      <button ref={toggleRef} className="menu-toggle" type="button" aria-expanded={open} aria-controls="site-navigation" aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen(!open)}>
        <span /><span />
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
