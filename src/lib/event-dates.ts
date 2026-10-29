export const eventDayKey = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Nairobi',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

export const formatEventDate = (value?: string | null, year?: number | null) => {
  if (!value || !eventDayKey(value)) return year ? String(year) : 'Date to be announced'
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Nairobi',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

export const formatEventDay = (value: string) =>
  new Intl.DateTimeFormat('en-KE', {
    timeZone: 'Africa/Nairobi',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value))

export function youtubeVideoID(value: string): string | null {
  try {
    const url = new URL(value)
    const host = url.hostname.replace(/^www\./, '')
    const id =
      host === 'youtu.be'
        ? url.pathname.slice(1)
        : ['youtube.com', 'm.youtube.com'].includes(host)
          ? url.searchParams.get('v') || url.pathname.match(/^\/(?:embed|shorts)\/([^/]+)/)?.[1]
          : ''
    return id && /^[\w-]{11}$/.test(id) ? id : null
  } catch {
    return null
  }
}
