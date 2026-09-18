'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'

type Command = {
  href: string
  label: string
  detail: string
  external?: boolean
}

const commands: Command[] = [
  { href: '/', label: 'Go home', detail: 'Back to the GDG Nairobi homepage' },
  { href: '/events', label: 'Explore events', detail: 'See upcoming and past community events' },
  { href: '/schedule', label: 'Open the schedule', detail: 'Find sessions, tracks, and start times' },
  { href: '/speakers', label: 'Meet the speakers', detail: 'Discover the people sharing what they know' },
  { href: '/about#organizers', label: 'Meet the organizers', detail: 'The volunteers behind the community' },
  { href: '/devfest', label: 'Enter DevFest', detail: 'Everything DevFest Nairobi 2026' },
  {
    href: 'https://gdg.community.dev/gdg-nairobi/',
    label: 'Join GDG Nairobi',
    detail: 'Open our official community page',
    external: true,
  },
]

const isTypingTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
}

export function SiteEasterEggs() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const typedKeys = useRef('')

  const filteredCommands = useMemo(() => {
    const search = query.trim().toLowerCase()
    if (!search) return commands
    return commands.filter(({ detail, label }) => `${label} ${detail}`.toLowerCase().includes(search))
  }, [query])

  useEffect(() => {
    // An invitation for the curious people who look beneath the interface.
    console.info(
      '%cNairobi is building. 🇰🇪%c\nYou found the workshop behind the website. Karibu to GDG Nairobi — bring your curiosity, share what you know, and help us jenga together.\n\n%c→ gdg.community.dev/gdg-nairobi/',
      'font: 700 20px/1.5 system-ui; color: #4285f4;',
      'font: 14px/1.6 system-ui; color: inherit;',
      'font: 600 13px/1.5 system-ui; color: #34a853;',
    )
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        if (open) {
          setOpen(false)
        } else {
          setQuery('')
          setActiveIndex(0)
          setOpen(true)
        }
        return
      }

      if (open || event.metaKey || event.ctrlKey || event.altKey || isTypingTarget(event.target)) return
      if (event.key.length !== 1) {
        typedKeys.current = ''
        return
      }

      typedKeys.current = `${typedKeys.current}${event.key.toLowerCase()}`.slice(-5)
      if (typedKeys.current === 'jenga') {
        typedKeys.current = ''
        setQuery('')
        setActiveIndex(0)
        setOpen(true)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open])

  const close = () => setOpen(false)

  const onDialogKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      close()
    } else if (event.key === 'ArrowDown' && filteredCommands.length) {
      event.preventDefault()
      setActiveIndex((index) => (index + 1) % filteredCommands.length)
    } else if (event.key === 'ArrowUp' && filteredCommands.length) {
      event.preventDefault()
      setActiveIndex((index) => (index - 1 + filteredCommands.length) % filteredCommands.length)
    } else if (event.key === 'Enter' && filteredCommands[activeIndex]) {
      event.preventDefault()
      document.getElementById(`jenga-command-${activeIndex}`)?.click()
    }
  }

  if (!open) return null

  return (
    <div className="jenga-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.currentTarget === event.target) close()
    }}>
      <div
        aria-describedby="jenga-description"
        aria-labelledby="jenga-title"
        aria-modal="true"
        className="jenga-palette"
        onKeyDown={onDialogKeyDown}
        role="dialog"
      >
        <header className="jenga-header">
          <div>
            <span className="jenga-kicker">Easter egg unlocked</span>
            <h2 id="jenga-title">Jenga</h2>
            <p id="jenga-description">Build your way around GDG Nairobi.</p>
          </div>
          <button aria-label="Close command palette" className="jenga-close" onClick={close} type="button">Esc</button>
        </header>
        <label className="jenga-search">
          <span aria-hidden="true">⌕</span>
          <span className="sr-only">Search site commands</span>
          <input
            aria-label="Search site commands"
            autoFocus
            autoComplete="off"
            onChange={(event) => {
              setQuery(event.target.value)
              setActiveIndex(0)
            }}
            placeholder="Where would you like to go?"
            type="search"
            value={query}
          />
        </label>
        <div aria-label="Site commands" className="jenga-results" role="listbox">
          {filteredCommands.map((command, index) => {
            const content = (
              <>
                <span><strong>{command.label}</strong><small>{command.detail}</small></span>
                <i aria-hidden="true">{command.external ? '↗' : '→'}</i>
              </>
            )
            const props = {
              'aria-selected': index === activeIndex,
              className: index === activeIndex ? 'is-active' : undefined,
              id: `jenga-command-${index}`,
              onClick: close,
              onMouseEnter: () => setActiveIndex(index),
              role: 'option',
            } as const

            return command.external ? (
              <a {...props} href={command.href} key={command.href} rel="noreferrer" target="_blank">{content}</a>
            ) : (
              <Link {...props} href={command.href} key={command.href}>{content}</Link>
            )
          })}
          {!filteredCommands.length && <p className="jenga-empty">No blocks fit that search yet.</p>}
        </div>
        <footer className="jenga-footer"><span>↑↓ Navigate</span><span>↵ Open</span><span>Esc Close</span></footer>
      </div>
    </div>
  )
}
