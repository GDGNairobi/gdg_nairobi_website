// Payload's local upload URLs can include serverURL. Use the same-origin route
// so Next's image optimiser can serve local and bucket-backed Media consistently.
export function mediaURL(value: string): string {
  try {
    const url = new URL(value)
    if (url.pathname.startsWith('/api/media/file/')) return `${url.pathname}${url.search}`
  } catch {
    /* Already a relative upload URL. */
  }
  return value
}
