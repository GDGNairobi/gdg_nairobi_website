import { createHash } from 'node:crypto'
import type { Endpoint } from 'payload'
import type { Session } from '@/payload-types'
import { readGoogleSheet } from './google-sheet-source'
import { applySchedule, ScheduleImportError } from './schedule-apply'
import { previewSchedule, scheduleOverlapErrors, type SchedulePreview } from './schedule-import'
import { eventDayKey } from './event-dates'

export type SheetSchedulePreview = SchedulePreview & {
  source: { title: string; tab: string }
  previewHash: string
  sessionIDColumn: string
  changes: { created: number; updated: number; missing: string[] }
}

export function reconcileSheetSchedule(preview: SchedulePreview, sessions: Session[]) {
  const used = new Set<number>()
  for (const row of preview.rows) {
    const explicitID = row.supplied.includes('session_id')
    const keyed = sessions.find((s) => s.importKey === row.importKey)
    let match = explicitID ? keyed : undefined
    if (!match) {
      const candidates = sessions.filter(
        (s) =>
          s._status === 'published' &&
          (!explicitID || !s.importKey) &&
          s.title?.trim() === row.title.trim(),
      )
      const exact = candidates.filter((s) => s.startsAt === row.startsAt && s.room === row.room)
      match = candidates.length === 1 ? candidates[0] : exact.length === 1 ? exact[0] : undefined
      if (exact.length > 1)
        preview.errors.push({
          row: row.row,
          message: 'Multiple existing sessions match this row. Add a Session ID before syncing.',
        })
      if (!explicitID && !match && keyed)
        preview.errors.push({
          row: row.row,
          message:
            'A generated ID conflicts with an existing session. Copy stable Session IDs into the sheet before syncing.',
        })
    }
    if (match) {
      if (used.has(match.id)) {
        preview.errors.push({
          row: row.row,
          message:
            'More than one source row matches this session. Add unique Session IDs to the sheet.',
        })
        continue
      }
      if (match._status === 'draft')
        preview.errors.push({
          row: row.row,
          message: `“${row.title}” has a pending draft. Review it before syncing.`,
        })
      used.add(match.id)
      row.existingSessionID = match.id
      row.importKey = match.importKey || row.importKey
      if (!row.supplied.includes('room')) row.room = match.room
    }
  }
  const missing = sessions
    .filter((s) => s._status === 'published' && !used.has(s.id))
    .map((s) => s.title)
  const created = preview.rows.filter(
    (r) => !r.existingSessionID && !sessions.some((s) => s.importKey === r.importKey),
  ).length
  if (missing.length && preview.rows.some((r) => !r.supplied.includes('session_id')) && created)
    preview.errors.push({
      row: 1,
      message:
        'Some rows could be new sessions or renamed existing sessions. Add stable Session IDs before syncing to preserve favourites.',
    })
  if (missing.length)
    preview.warnings.push(
      `Existing sessions missing from this sheet will remain: ${missing.join('; ')}. Archive obsolete sessions in Payload after reviewing them.`,
    )
  const keys = new Set<string>()
  for (const row of preview.rows) {
    if (keys.has(row.importKey))
      preview.errors.push({ row: row.row, message: 'Duplicate matched session ID.' })
    keys.add(row.importKey)
  }
  for (const error of scheduleOverlapErrors(preview.rows))
    if (!preview.errors.some((e) => e.row === error.row && e.message === error.message))
      preview.errors.push(error)
  return { created, updated: preview.rows.length - created, missing }
}

export const sheetScheduleEndpoint: Endpoint = {
  path: '/:id/schedule-sheet',
  method: 'post',
  handler: async (req) => {
    if (!req.user || !['admin', 'editor'].includes(req.user.role))
      return Response.json({ error: 'Sign in as an organiser to sync a sheet.' }, { status: 403 })
    const origin = req.headers.get('origin')
    if (origin && origin !== new URL(req.url!).origin && origin !== req.payload.config.serverURL)
      return Response.json(
        { error: 'Sync from this website’s organiser dashboard.' },
        { status: 403 },
      )
    const id = Number(req.routeParams?.id)
    if (!Number.isInteger(id) || id <= 0)
      return Response.json({ error: 'Save the event first.' }, { status: 400 })
    try {
      const body = await req.json!()
      const settings = await req.payload.findByID({
        collection: 'community-events',
        id,
        depth: 0,
        draft: true,
        overrideAccess: false,
        req,
      })
      const event = await req.payload.findByID({
        collection: 'community-events',
        id,
        depth: 0,
        draft: false,
        overrideAccess: false,
        req,
      })
      const sourceURL = settings.scheduleSheetURL
      if (!sourceURL) throw new Error('Save a Google Sheets agenda URL on this event first.')
      const source = await readGoogleSheet(sourceURL)
      const preview = await previewSchedule(
        source.csv,
        'google-agenda.csv',
        event,
        {
          ...body.mapping,
          day_title: '',
          venue_name: '',
          venue_address: '',
          venue_website: '',
          map_url: '',
        },
        String(body.dateFormat || 'iso'),
      )
      const dates = new Set((event.days || []).map((day) => eventDayKey(day.date)))
      if (preview.rows.some((row) => !dates.has(eventDayKey(row.startsAt))))
        preview.errors.push({
          row: 1,
          message:
            'The sheet has sessions outside the saved event days. Update event dates separately in Payload before syncing.',
        })
      preview.days = event.days || []
      const sessions = (
        await req.payload.find({
          collection: 'sessions',
          where: { event: { equals: id } },
          draft: false,
          depth: 0,
          pagination: false,
          overrideAccess: false,
          req,
        })
      ).docs
      const changes = reconcileSheetSchedule(preview, sessions)
      const latest = (
        await req.payload.find({
          collection: 'sessions',
          where: { event: { equals: id } },
          draft: true,
          depth: 0,
          pagination: false,
          overrideAccess: false,
          req,
        })
      ).docs
      const byID = new Map(sessions.map((session) => [session.id, session]))
      const matchedKeys = new Set(preview.rows.map((row) => row.importKey))
      const pending = latest.filter(
        (draft) =>
          draft._status === 'draft' &&
          byID.get(draft.id)?._status === 'published' &&
          matchedKeys.has(byID.get(draft.id)?.importKey || ''),
      )
      if (pending.length)
        preview.errors.push({
          row: 1,
          message:
            'Matched sessions have pending drafts. Review and publish or discard those drafts in Payload before syncing again.',
        })
      const hash = createHash('sha256')
        .update(source.csv)
        .update(
          JSON.stringify({
            url: sourceURL,
            settingsUpdatedAt: settings.updatedAt,
            updatedAt: event.updatedAt,
            rows: preview.rows,
            days: preview.days,
            sessions: sessions
              .map((s) => [s.id, s.updatedAt])
              .sort((a, b) => Number(a[0]) - Number(b[0])),
            drafts: latest
              .map((session) => [session.id, session.updatedAt])
              .sort((a, b) => Number(a[0]) - Number(b[0])),
          }),
        )
        .digest('hex')
      const idRows = Array.from(
        { length: Math.max(1, ...preview.rows.map((r) => r.row)) },
        () => '',
      )
      idRows[0] = 'Session ID'
      preview.rows.forEach((row) => {
        idRows[row.row - 1] = row.importKey
      })
      if (body.confirm !== true || preview.errors.length)
        return Response.json(
          {
            ...preview,
            source: { title: source.title, tab: source.tab },
            previewHash: hash,
            sessionIDColumn: idRows.join('\n'),
            changes,
          } satisfies SheetSchedulePreview,
          { status: preview.errors.length ? 422 : 200 },
        )
      if (body.previewHash !== hash)
        return Response.json(
          { error: 'The sheet or event changed since preview. Preview again before publishing.' },
          { status: 409 },
        )
      return Response.json(
        await applySchedule(req, id, preview, body.publish === true, {
          updateEvent: false,
        }),
      )
    } catch (error) {
      req.payload.logger.error({ err: error }, 'Google Sheets programme sync failed.')
      return Response.json(
        {
          error: error instanceof Error ? error.message : 'Sheet sync failed. Nothing was changed.',
        },
        { status: error instanceof ScheduleImportError ? error.status : 400 },
      )
    }
  },
}
