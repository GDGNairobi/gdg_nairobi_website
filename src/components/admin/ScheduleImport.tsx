'use client'

import { useState, useSyncExternalStore } from 'react'
import { Button, useDocumentInfo, useField, useFormModified } from '@payloadcms/ui'
import styles from './ScheduleImport.module.css'
import type { ColumnMapping, ScheduleColumn, SchedulePreview } from '@/lib/schedule-import'
import type { SheetSchedulePreview } from '@/lib/schedule-sheet-endpoint'

type ImportPreview = SchedulePreview &
  Partial<Pick<SheetSchedulePreview, 'source' | 'previewHash' | 'sessionIDColumn' | 'changes'>>

const columns: ScheduleColumn[] = [
  'session_id',
  'title',
  'date',
  'start_time',
  'end_time',
  'room',
  'track',
  'format',
  'level',
  'speakers',
  'description',
  'day_title',
  'venue_name',
  'venue_address',
  'venue_website',
  'map_url',
]
export function ScheduleImport() {
  const { id, documentIsLocked } = useDocumentInfo(),
    modified = useFormModified()
  const { value: sheetURL } = useField<string>({ path: 'scheduleSheetURL' })
  const [sourceMode, setSourceMode] = useState<'file' | 'sheet'>('file')
  const [file, setFile] = useState<File | null>(null),
    [preview, setPreview] = useState<ImportPreview | null>(null),
    [mapping, setMapping] = useState<ColumnMapping>({})
  const [dateFormat, setDateFormat] = useState('iso'),
    [publish, setPublish] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('')
  const message = useSyncExternalStore(
    () => () => {},
    () => sessionStorage.getItem(`schedule-import-${id}`) || '',
    () => '',
  )
  const ready = Boolean(id) && !modified && !documentIsLocked && !busy
  async function submit(confirm = false, mode: 'file' | 'sheet' = sourceMode) {
    if (!id || (mode === 'file' ? !file : !sheetURL)) return
    const activeMapping = mode === sourceMode ? mapping : {}
    if (mode !== sourceMode) {
      setPreview(null)
      setMapping({})
    }
    setSourceMode(mode)
    setBusy(true)
    setError('')
    sessionStorage.removeItem(`schedule-import-${id}`)
    try {
      const form = new FormData()
      if (file) form.set('file', file)
      form.set('mapping', JSON.stringify(activeMapping))
      form.set('dateFormat', dateFormat)
      form.set('confirm', String(confirm))
      form.set('publish', String(publish))
      const response = await fetch(
        `/api/community-events/${id}/${mode === 'sheet' ? 'schedule-sheet' : 'schedule-import'}`,
        {
          method: 'POST',
          ...(mode === 'sheet' ? { headers: { 'Content-Type': 'application/json' } } : {}),
          body:
            mode === 'sheet'
              ? JSON.stringify({
                  confirm,
                  publish,
                  previewHash: preview?.previewHash,
                  mapping: activeMapping,
                  dateFormat,
                })
              : form,
          credentials: 'same-origin',
        },
      )
      const body = await response.json()
      if (body.error) throw new Error(body.error)
      if (body.rows) {
        setPreview(body)
        setMapping(body.mapping)
      } else if (response.ok) {
        sessionStorage.setItem(`schedule-import-${id}`, body.message)
        window.location.reload()
      } else throw new Error('Could not import this file. Review its contents and try again.')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Import failed. Try again.')
    } finally {
      setBusy(false)
    }
  }
  return (
    <section className={styles.importer} aria-label="Import programme">
      <h3>Import your programme</h3>
      <div className={styles.sheetConnection}>
        <h4>Google Sheets connection</h4>
        <p>
          Save the agenda URL above once, then preview from the sheet whenever it changes. Nothing
          updates automatically; you choose when to import or publish. Sync updates sessions and
          speaker links only. Event dates, venues, sponsors, registration and publishing status stay
          unchanged.
        </p>
        <Button type="button" disabled={!sheetURL || !ready} onClick={() => submit(false, 'sheet')}>
          {busy && sourceMode === 'sheet' ? 'Reading sheet…' : 'Preview from Google Sheets'}
        </Button>
        <details>
          <summary>Private sheet setup (one time)</summary>
          <ol>
            <li>
              Enable the Google Sheets API in your Google Cloud project and create a service
              account.
            </li>
            <li>
              Create its JSON key and set the complete JSON as{' '}
              <code>GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON</code> on Railway’s web service. Keep the key
              out of the sheet and this form.
            </li>
            <li>
              Share the agenda with the key’s <code>client_email</code> as a Viewer. The connection
              requests read-only access; the sheet can stay private.
            </li>
            <li>
              Paste the agenda tab’s URL into Google Sheets agenda URL above, save the event, then
              preview.
            </li>
          </ol>
          <a
            href="https://developers.google.com/identity/protocols/oauth2/service-account"
            target="_blank"
            rel="noreferrer"
          >
            Google’s service account setup guide ↗
          </a>
        </details>
      </div>
      <p>
        Upload CSV or Excel (.xlsx, first sheet). Preview the rows and match columns before saving.
        You can also upload the DevFest agenda layout directly: Time, Activity, Details, Speakers,
        Duration, Content Track/Theme and Where?. Times without an offset use East Africa Time.
      </p>
      {!id && <p>Save this event first to enable imports.</p>}
      {modified && <p role="status">Save your event changes before importing.</p>}
      {id && (
        <p>
          <a href={`/api/community-events/${id}/schedule-template?format=csv`}>
            Download CSV template
          </a>
          {' · '}
          <a href={`/api/community-events/${id}/schedule-template?format=xlsx`}>
            Download Excel template
          </a>
        </p>
      )}
      <p>
        Keep session IDs stable when updating a programme. Imports add or update sessions; removing
        a row does not delete an existing session. Separate multiple speakers with a pipe (|).
      </p>
      <p>
        From Google Sheets, use File → Download → Comma-separated values (.csv) on the agenda tab,
        then upload it here. Parallel codelab rows can leave Time and Activity blank. Use “onwards”
        for activities without a fixed finish time. Preview again whenever the sheet changes.
      </p>
      <label>
        Schedule file{' '}
        <input
          type="file"
          accept=".csv,.xlsx"
          disabled={!ready}
          onChange={(e) => {
            setFile(e.target.files?.[0] || null)
            setSourceMode('file')
            setPreview(null)
            setMapping({})
            sessionStorage.removeItem(`schedule-import-${id}`)
          }}
        />
      </label>
      <p>
        <label>
          Date format{' '}
          <select
            value={dateFormat}
            disabled={busy}
            onChange={(e) => {
              setDateFormat(e.target.value)
              setPreview(null)
            }}
          >
            <option value="iso">YYYY-MM-DD / ISO datetime</option>
            <option value="dmy">DD/MM/YYYY</option>
            <option value="mdy">MM/DD/YYYY</option>
          </select>
        </label>
      </p>
      <Button type="button" disabled={!file || !ready} onClick={() => submit(false, 'file')}>
        {busy ? 'Working…' : 'Preview sessions'}
      </Button>
      {preview && (
        <>
          {preview.source && (
            <p role="status">
              Read {preview.source.title} → {preview.source.tab}. {preview.changes?.updated}{' '}
              existing sessions matched; {preview.changes?.created} new sessions.
            </p>
          )}
          {preview.sessionIDColumn && !preview.errors.length && (
            <details>
              <summary>Keep session IDs stable in Google Sheets</summary>
              <p>
                Paste this column into a new, empty column at row 1 of the agenda tab. Keep each ID
                with its session when editing or moving rows. Preview again after pasting. IDs
                preserve favourites when titles, times or rooms change.
              </p>
              <label>
                Session ID column
                <textarea readOnly value={preview.sessionIDColumn} rows={6} />
              </label>
              <Button
                type="button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(preview.sessionIDColumn!)
                    setError('')
                  } catch {
                    setError(
                      'Copy was blocked. Select the Session ID column text and copy it manually.',
                    )
                  }
                }}
              >
                Copy session IDs
              </Button>
            </details>
          )}
          {preview.layout !== 'agenda' && (
            <details open={preview.errors.some((error) => error.row === 1)}>
              <summary>Match your columns</summary>
              <p>
                Recognised headers are selected automatically. Map different export headers below,
                then refresh the preview.
              </p>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))',
                  gap: 12,
                }}
              >
                {columns
                  .filter(
                    (key) =>
                      sourceMode === 'file' ||
                      ![
                        'day_title',
                        'venue_name',
                        'venue_address',
                        'venue_website',
                        'map_url',
                      ].includes(key),
                  )
                  .map((key) => (
                    <label key={key}>
                      {key.replaceAll('_', ' ')}
                      <select
                        style={{ display: 'block', width: '100%' }}
                        value={mapping[key] || ''}
                        disabled={busy}
                        onChange={(e) => {
                          setMapping({ ...mapping, [key]: e.target.value })
                          setPreview({
                            ...preview,
                            errors: [
                              {
                                row: 1,
                                message: 'Refresh the preview after changing column mappings.',
                              },
                            ],
                          })
                        }}
                      >
                        <option value="">Ignore / not supplied</option>
                        {preview.headers.filter(Boolean).map((h) => (
                          <option key={h} value={h}>
                            {h}
                          </option>
                        ))}
                      </select>
                    </label>
                  ))}
              </div>
            </details>
          )}
          <p>
            {preview.rows.length} sessions · {preview.days.length} event days ·{' '}
            {preview.errors.length} errors
          </p>
          {preview.errors.length > 0 && (
            <ul role="alert">
              {preview.errors.slice(0, 30).map((e, i) => (
                <li key={i}>
                  Row {e.row}: {e.message}
                </li>
              ))}
            </ul>
          )}
          {preview.warnings.map((w) => (
            <p key={w}>{w}</p>
          ))}
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Row</th>
                  <th>Title</th>
                  <th>Date / time (EAT)</th>
                  <th>Room</th>
                  <th>Speakers</th>
                </tr>
              </thead>
              <tbody>
                {preview.rows.map((row) => (
                  <tr key={row.row}>
                    <td>{row.row}</td>
                    <td>{row.title}</td>
                    <td>
                      {new Date(row.startsAt).toLocaleString('en-KE', {
                        timeZone: 'Africa/Nairobi',
                      })}
                      {row.endsAt
                        ? ` – ${new Date(row.endsAt).toLocaleTimeString('en-KE', { timeZone: 'Africa/Nairobi', hour: '2-digit', minute: '2-digit' })}`
                        : ' onwards'}
                    </td>
                    <td>{row.room}</td>
                    <td>{row.speakerNames.join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            <label>
              <input
                type="checkbox"
                checked={publish}
                disabled={busy}
                onChange={(e) => setPublish(e.target.checked)}
              />{' '}
              {sourceMode === 'sheet'
                ? 'Publish session and linked speaker updates now'
                : 'Publish event, sessions and linked speaker profiles now'}
            </label>
          </p>
          <Button
            type="button"
            disabled={!ready || !preview.rows.length || preview.errors.length > 0}
            onClick={() => submit(true)}
          >
            {busy ? 'Importing…' : publish ? 'Import and publish' : 'Import as drafts'}
          </Button>
        </>
      )}
      {message && (
        <p role="status">
          {message}{' '}
          <a href={`/admin/collections/sessions?where[event][equals]=${id}`}>Review sessions</a>
        </p>
      )}
      {error && <p role="alert">{error}</p>}
    </section>
  )
}
