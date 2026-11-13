export function googleSheetLocation(value: string) {
  if (value.length > 2048) throw new Error('The Google Sheets URL is too long.')
  const url = new URL(value)
  const match = url.pathname.match(
    /^\/spreadsheets\/(?:u\/\d+\/)?d\/([\w-]{20,})(?:\/(?:edit|view))?\/?$/,
  )
  const gid =
    url.searchParams.get('gid') || new URLSearchParams(url.hash.slice(1)).get('gid') || '0'
  if (
    url.protocol !== 'https:' ||
    url.hostname !== 'docs.google.com' ||
    url.port ||
    url.username ||
    url.password ||
    !match ||
    !/^\d+$/.test(gid)
  )
    throw new Error('Use a Google Sheets URL including the agenda tab’s gid.')
  return { id: match[1], gid: Number(gid) }
}
