import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'

import { GdgMark } from '@/components/GdgLogo'
import { getPublicEvents } from '@/lib/community-events'
import { formatEventDate } from '@/lib/event-dates'

export const dynamic = 'force-dynamic'

const [manropeSemiBold, manropeExtraBold] = await Promise.all([
  readFile(join(process.cwd(), 'src/assets/fonts/manrope/Manrope-600.ttf')),
  readFile(join(process.cwd(), 'src/assets/fonts/manrope/Manrope-800.ttf')),
])

export async function GET() {
  const event = (await getPublicEvents()).find((item) => item.slug === 'devfest-nairobi-2026')
  if (!event) return new Response('Event not found', { status: 404 })

  const editionTitle = event.title.replace(/^DevFest\s+/i, '')
  const date = formatEventDate(event.startsAt, event.year)
  const venue = event.days?.[0]?.venueName || 'Venue details to follow'

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '44px 52px',
        color: '#202124',
        background: '#f8f9fa',
        fontFamily: 'Manrope',
        fontWeight: 600,
      }}
    >
      <svg
        width="1200"
        height="630"
        viewBox="0 0 1200 630"
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <defs>
          <linearGradient id="wash" x1="0" y1="0" x2="1" y2="0.7">
            <stop offset="0" stopColor="#dfe9fb" />
            <stop offset="0.8" stopColor="#f8f9fa" />
          </linearGradient>
          <linearGradient id="grid-fade">
            <stop offset="0" stopColor="white" />
            <stop offset="0.85" stopColor="black" />
          </linearGradient>
          <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#202124" strokeOpacity="0.14" />
          </pattern>
          <mask id="fade">
            <rect width="1200" height="630" fill="url(#grid-fade)" />
          </mask>
        </defs>
        <rect width="1200" height="630" fill="url(#wash)" />
        <rect width="1200" height="630" fill="url(#grid)" mask="url(#fade)" />
        <circle cx="1040" cy="279" r="250" fill="none" stroke="#4285f4" />
        <circle
          cx="1040"
          cy="279"
          r="175"
          fill="none"
          stroke="#202124"
          strokeOpacity="0.3"
          strokeDasharray="4 4"
        />
        <circle cx="1040" cy="279" r="97" fill="#d2e3fc" stroke="#202124" strokeOpacity="0.25" />
        <circle cx="845" cy="122" r="7" fill="#4285f4" stroke="#f8f9fa" strokeWidth="4" />
        <circle cx="949" cy="512" r="7" fill="#4285f4" stroke="#f8f9fa" strokeWidth="4" />
      </svg>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '13px 20px',
            border: '1.5px solid #202124',
            borderRadius: 50,
            background: '#ffffff',
            fontSize: 23,
          }}
        >
          <GdgMark width={43} height={24} />
          <span>GDG Nairobi</span>
        </div>
        <span style={{ color: '#5f6368', fontSize: 18 }}>gdgnairobi.com</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 850 }}>
        <span style={{ color: '#174ea6', fontSize: 16, letterSpacing: 3, marginBottom: 18 }}>
          DEVELOPER CONFERENCE · NAIROBI
        </span>
        {editionTitle !== event.title && (
          <span style={{ fontSize: 85, fontWeight: 800, letterSpacing: -5, lineHeight: 1 }}>
            DevFest
          </span>
        )}
        <span
          style={{
            fontSize: editionTitle.length > 20 ? 68 : 88,
            fontWeight: 800,
            letterSpacing: -5,
            lineHeight: 1.08,
          }}
        >
          {editionTitle}
        </span>
        {event.tagline && (
          <span
            style={{
              color: '#174ea6',
              fontSize: 30,
              fontWeight: 800,
              marginTop: 22,
              letterSpacing: -1,
            }}
          >
            {event.tagline}
          </span>
        )}
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          padding: '20px 26px',
          gap: 30,
          border: '1.5px solid #202124',
          borderRadius: 24,
          background: '#ffffff',
          boxShadow: '4px 4px 0 #d2e3fc',
        }}
      >
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', width: 410 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 52,
              height: 52,
              border: '1.5px solid #202124',
              borderRadius: 14,
              background: '#d2e3fc',
            }}
          >
            <svg
              width="27"
              height="27"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#174ea6"
              strokeWidth="1.8"
            >
              <rect x="3" y="5" width="18" height="16" rx="3" />
              <path d="M7 3v5m10-5v5M3 11h18" />
            </svg>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 13, letterSpacing: 2, color: '#5f6368' }}>SAVE THE DATE</span>
            <span style={{ fontSize: 29, fontWeight: 800, letterSpacing: -1 }}>{date}</span>
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            paddingLeft: 30,
            borderLeft: '1px solid #dadce0',
            flex: 1,
          }}
        >
          <span style={{ fontSize: 13, letterSpacing: 2, color: '#5f6368' }}>VENUE</span>
          <span
            style={{ fontSize: venue.length > 30 ? 23 : 29, fontWeight: 800, letterSpacing: -1 }}
          >
            {venue}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 5, alignSelf: 'stretch', alignItems: 'center' }}>
          {['#4285f4', '#ea4335', '#fbbc04', '#34a853'].map((color) => (
            <div
              key={color}
              style={{ width: 10, height: 40, borderRadius: 5, background: color }}
            />
          ))}
        </div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'Manrope', data: manropeSemiBold, weight: 600, style: 'normal' },
        { name: 'Manrope', data: manropeExtraBold, weight: 800, style: 'normal' },
      ],
    },
  )
}
