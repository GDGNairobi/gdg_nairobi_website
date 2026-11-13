import { createHash, createSign } from 'node:crypto'
import ExcelJS from 'exceljs'
import { googleSheetLocation } from './google-sheet-url'

const maxBytes = 10 * 1024 * 1024
let cached: { key: string; value: string; expires: number } | undefined

async function json(response: Response) {
  if (!response.ok) throw new Error(`Google request failed (${response.status}).`)
  const reader = response.body?.getReader()
  if (!reader) throw new Error('Google returned an empty response.')
  const chunks: Uint8Array[] = []
  let size = 0
  try {
    while (true) {
      const part = await reader.read()
      if (part.done) break
      size += part.value.length
      if (size > maxBytes) throw new Error('The spreadsheet exceeds the 10 MB import limit.')
      chunks.push(part.value)
    }
  } finally {
    await reader.cancel()
    reader.releaseLock()
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'))
}

export async function readGoogleSheet(
  url: string,
  options: { fetcher?: typeof fetch; credentials?: string } = {},
) {
  const location = googleSheetLocation(url)
  const fetcher = options.fetcher || fetch
  const credentials = options.credentials ?? process.env.GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON
  if (!credentials)
    throw new Error(
      'Google Sheets access is not configured. Follow the one-time private sheet setup below.',
    )
  let account: { client_email: string; private_key: string }
  try {
    account = JSON.parse(credentials)
    if (typeof account.client_email !== 'string' || typeof account.private_key !== 'string')
      throw new Error()
  } catch {
    throw new Error(
      'The Google service account configuration is invalid. Check GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON.',
    )
  }
  const key = createHash('sha256').update(credentials).digest('hex')
  if (!cached || cached.key !== key || cached.expires < Date.now() + 60_000) {
    const now = Math.floor(Date.now() / 1000)
    const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url')
    const unsigned = `${encode({ alg: 'RS256', typ: 'JWT' })}.${encode({
      iss: account.client_email,
      scope: 'https://www.googleapis.com/auth/spreadsheets.readonly',
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
    })}`
    let signature: string
    try {
      signature = createSign('RSA-SHA256')
        .update(unsigned)
        .sign(account.private_key.replaceAll('\\n', '\n'), 'base64url')
    } catch {
      throw new Error('The Google service account private key is invalid.')
    }
    const token = await json(
      await fetcher('https://oauth2.googleapis.com/token', {
        method: 'POST',
        redirect: 'error',
        signal: AbortSignal.timeout(15_000),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
          assertion: `${unsigned}.${signature}`,
        }),
      }),
    )
    if (typeof token.access_token !== 'string' || !Number.isFinite(token.expires_in))
      throw new Error('Google returned an invalid access token response.')
    cached = { key, value: token.access_token, expires: Date.now() + token.expires_in * 1000 }
  }
  const get = async (path: string) => {
    const response = await fetcher(
      `https://sheets.googleapis.com/v4/spreadsheets/${location.id}${path}`,
      {
        headers: { Authorization: `Bearer ${cached!.value}` },
        redirect: 'error',
        cache: 'no-store',
        signal: AbortSignal.timeout(15_000),
      },
    )
    if ([401, 403, 404].includes(response.status)) {
      if (response.status === 401) cached = undefined
      throw new Error(
        `Cannot read this sheet. Share it as Viewer with ${account.client_email}, enable the Google Sheets API, and check the sheet URL.`,
      )
    }
    return json(response)
  }
  const metadata = await get(
    '?fields=properties(title),sheets(properties(sheetId,title,sheetType,gridProperties(rowCount,columnCount)))',
  )
  const tab = metadata.sheets?.find(
    (sheet: { properties?: { sheetId?: number } }) => sheet.properties?.sheetId === location.gid,
  )?.properties
  if (!tab || tab.sheetType !== 'GRID' || typeof tab.title !== 'string')
    throw new Error('The selected agenda tab was not found. Check the gid in the sheet URL.')
  if (tab.gridProperties?.columnCount > 52)
    throw new Error('Use an agenda tab with at most 52 columns.')
  const columns = tab.gridProperties?.columnCount,
    rows = tab.gridProperties?.rowCount
  if (!Number.isInteger(columns) || !Number.isInteger(rows) || columns < 1 || rows < 1)
    throw new Error('Google returned invalid tab bounds.')
  const endColumn =
    columns <= 26 ? String.fromCharCode(64 + columns) : `A${String.fromCharCode(64 + columns - 26)}`
  const range = `'${tab.title.replaceAll("'", "''")}'!A1:${endColumn}${Math.min(rows, 2002)}`
  const data = await get(`/values/${encodeURIComponent(range)}?valueRenderOption=FORMATTED_VALUE`)
  if (!Array.isArray(data.values) || data.values.length < 2)
    throw new Error('The agenda tab is empty.')
  if (
    data.values.length > 2001 ||
    data.values.some(
      (row: unknown) =>
        !Array.isArray(row) ||
        row.length > 52 ||
        row.some(
          (cell: unknown) =>
            !['string', 'number', 'boolean'].includes(typeof cell) && cell !== null,
        ),
    )
  )
    throw new Error('Use up to 2,000 agenda rows with plain cell values.')
  const workbook = new ExcelJS.Workbook(),
    sheet = workbook.addWorksheet('Agenda')
  data.values.forEach((row: (string | number | boolean | null)[]) => sheet.addRow(row))
  const csv = Buffer.from(await workbook.csv.writeBuffer())
  if (csv.length > maxBytes) throw new Error('The spreadsheet exceeds the 10 MB import limit.')
  return {
    csv,
    title: String(metadata.properties?.title || 'Google Sheet'),
    tab: tab.title as string,
  }
}
