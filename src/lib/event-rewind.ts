import { mediaURL } from '@/lib/media-url'
import type { CommunityEvent } from '@/payload-types'

export type RewindPhoto = {
  src: string
  alt: string
  caption: string
  day: string
  position?: string
  width?: number
  height?: number
}

export type EventRewindContent = {
  year: number
  heading: string
  description: string
  photos: RewindPhoto[]
  albums: Array<{ label: string; url: string }>
}

const archive: EventRewindContent = {
  year: 2025,
  heading: 'You had to be there.',
  description:
    'The sessions. The shared ideas. The people. A few frames from DevFest Nairobi 2025.',
  photos: [
    {
      src: '/images/devfest-2025/audience-005b6ff4.webp',
      alt: 'Attendees listening from the front rows of the DevFest Nairobi 2025 conference hall.',
      caption: 'A room ready to learn',
      day: 'Day 2',
      position: 'center 65%',
      width: 2400,
      height: 1600,
    },
    {
      src: '/images/devfest-2025/panel-f032d07b.webp',
      alt: 'Five panellists sharing the main stage at DevFest Nairobi 2025.',
      caption: 'Ideas on the main stage',
      day: 'Day 2',
      width: 2400,
      height: 1600,
    },
    {
      src: '/images/devfest-2025/session-46ae36b1.webp',
      alt: 'A speaker presenting from a lectern to a breakout session at DevFest Nairobi 2025.',
      caption: 'Up close with the speakers',
      day: 'Day 2',
      width: 2400,
      height: 1600,
    },
    {
      src: '/images/devfest-2025/listeners-340db5c5.webp',
      alt: 'Rows of attendees watching a session together on the first day of DevFest Nairobi 2025.',
      caption: 'Listening and learning',
      day: 'Day 1',
      position: 'center 60%',
      width: 2400,
      height: 1800,
    },
    {
      src: '/images/devfest-2025/session-audience-64eb1d72.webp',
      alt: 'A speaker at the lectern addressing the seated main-hall audience at DevFest Nairobi 2025.',
      caption: 'Sharing with the whole room',
      day: 'Day 2',
      width: 2400,
      height: 1600,
    },
    {
      src: '/images/devfest-2025/workshop-cf3b36e0.webp',
      alt: 'Attendees following a presentation in a full DevFest Nairobi 2025 workshop room.',
      caption: 'Learning together',
      day: 'Day 2',
      width: 2400,
      height: 1600,
    },
  ],
  albums: [
    {
      label: 'Day 1 album',
      url: 'https://photos.google.com/share/AF1QipMHEKLzbFWUeGw6asV67qHJxQ3PSvEeVfeUQx8xUXgw2CiUdVEGtVxdEgqP1PYQpw?key=LVZkZ0ZqVTdvYk9GYjVxU2lUWGhhanNvbHBUMGFn',
    },
    {
      label: 'Day 2 album',
      url: 'https://photos.google.com/share/AF1QipN_0IE7A6XhBM9d2o-AK7mFDy_EpPcd4YV53Q3N-cl7qPW_YJqWRO7IzLJ2yL7hcQ?key=SWhmTF83dEpRMDJ3dlFoTXlITFZWR2tWZFZRS1lR',
    },
  ],
}

export function getEventRewind(event: CommunityEvent): EventRewindContent | null {
  if (event.eventKind !== 'devfest' || event.photoRewind?.hidden) return null
  const fallback = event.slug === 'devfest-nairobi-2026' ? archive : null
  const settings = event.photoRewind
  const photos = (settings?.photos || []).flatMap(({ image, caption, day }) =>
    typeof image === 'object' && image?.url
      ? [
          {
            src: mediaURL(image.url),
            alt: image.alt,
            caption,
            day: day || '',
            width: image.width || undefined,
            height: image.height || undefined,
          },
        ]
      : [],
  )
  const year = settings?.year || fallback?.year
  // A custom selection needs its own year; never relabel the curated 2025 archive.
  if (!photos.length)
    return fallback && (!year || year === fallback.year)
      ? {
          ...fallback,
          heading: settings?.heading?.trim() || fallback.heading,
          description: settings?.description?.trim() || fallback.description,
          albums: fallback.albums.map((album, index) => ({
            ...album,
            url: (index === 0 ? settings?.dayOneAlbumURL : settings?.dayTwoAlbumURL) || album.url,
          })),
        }
      : null
  if (!year) return null
  return {
    year,
    heading: settings?.heading?.trim() || 'A look back.',
    description:
      settings?.description?.trim() || `Sessions and shared ideas from DevFest Nairobi ${year}.`,
    photos,
    albums: [
      { label: 'Day 1 album', url: settings?.dayOneAlbumURL },
      { label: 'Day 2 album', url: settings?.dayTwoAlbumURL },
    ].flatMap(({ label, url }) => (url ? [{ label, url }] : [])),
  }
}
