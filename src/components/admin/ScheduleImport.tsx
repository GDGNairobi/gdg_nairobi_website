'use client'

import { useState, useSyncExternalStore } from 'react'
import { Button, useDocumentInfo, useFormModified } from '@payloadcms/ui'
import styles from './ScheduleImport.module.css'
import type { ColumnMapping, ScheduleColumn, SchedulePreview } from '@/lib/schedule-import'

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
  const [file, setFile] = useState<File | null>(null),
    [preview, setPreview] = useState<SchedulePreview | null>(null),
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
  async function submit(confirm = false) {
    if (!file || !id) return
    setBusy(true)
    setError('')
    sessionStorage.removeItem(`schedule-import-${id}`)
    try {
      const form = new FormData()
      form.set('file', file)
      form.set('mapping', JSON.stringify(mapping))
      form.set('dateFormat', dateFormat)
      form.set('confirm', String(confirm))
      form.set('publish', String(publish))
      const response = await fetch(`/api/community-events/${id}/schedule-import`, {
        method: 'POST',
        body: form,
        credentials: 'same-origin',
      })
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
      <p>
        Upload CSV or Excel (.xlsx, first sheet). Preview the rows and match columns before saving.
        Times without an offset use East Africa Time.
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
      <label>
        Schedule file{' '}
        <input
          type="file"
          accept=".csv,.xlsx"
          disabled={!ready}
          onChange={(e) => {
            setFile(e.target.files?.[0] || null)
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
      <Button type="button" disabled={!file || !ready} onClick={() => submit()}>
        {busy ? 'Working…' : 'Preview sessions'}
      </Button>
      {preview && (
        <>
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
              {columns.map((key) => (
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
                  <th>Date / start (EAT)</th>
                  <th>Room</th>
                  <th>Speakers</th>
                </tr>
              </thead>
              <tbody>
                {preview.rows.slice(0, 20).map((row) => (
                  <tr key={row.row}>
                    <td>{row.row}</td>
                    <td>{row.title}</td>
                    <td>
                      {new Date(row.startsAt).toLocaleString('en-KE', {
                        timeZone: 'Africa/Nairobi',
                      })}
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
              Publish event, sessions and linked speaker profiles now
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
