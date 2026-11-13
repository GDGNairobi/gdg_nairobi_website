import type { Endpoint, PayloadRequest } from 'payload'
import { previewSchedule, scheduleTemplate, type ColumnMapping } from '@/lib/schedule-import'
import { applySchedule, ScheduleImportError } from './schedule-apply'
import { sheetScheduleEndpoint } from './schedule-sheet-endpoint'

const allowed = (req: PayloadRequest) => req.user && ['admin', 'editor'].includes(req.user.role)
const idFor = (req: PayloadRequest) => Number(req.routeParams?.id)
export const scheduleEndpoints: Endpoint[] = [
  sheetScheduleEndpoint,
  {
    path: '/:id/schedule-template',
    method: 'get',
    handler: async (req) => {
      if (!allowed(req))
        return Response.json(
          { error: 'Sign in as an organiser to download a template.' },
          { status: 403 },
        )
      const format = new URL(req.url!).searchParams.get('format') === 'xlsx' ? 'xlsx' : 'csv'
      const buffer = await scheduleTemplate(format)
      return new Response(new Uint8Array(buffer), {
        headers: {
          'Content-Type':
            format === 'xlsx'
              ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
              : 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="schedule-template.${format}"`,
        },
      })
    },
  },
  {
    path: '/:id/schedule-import',
    method: 'post',
    handler: async (req) => {
      if (!allowed(req))
        return Response.json(
          { error: 'Sign in as an organiser to import a programme.' },
          { status: 403 },
        )
      const origin = req.headers.get('origin')
      if (origin && origin !== new URL(req.url!).origin && origin !== req.payload.config.serverURL)
        return Response.json(
          { error: 'Import from this website’s organiser dashboard.' },
          { status: 403 },
        )
      const id = idFor(req)
      if (!Number.isInteger(id) || id <= 0)
        return Response.json({ error: 'Save the event before importing.' }, { status: 400 })
      try {
        const form = await req.formData!(),
          file = form.get('file')
        if (!(file instanceof File))
          return Response.json({ error: 'Choose a CSV or Excel .xlsx file.' }, { status: 400 })
        if (file.size > 10 * 1024 * 1024)
          return Response.json({ error: 'Files must be 10 MB or smaller.' }, { status: 400 })
        const mapping = JSON.parse(String(form.get('mapping') || '{}')) as ColumnMapping
        const event = await req.payload.findByID({
          collection: 'community-events',
          id,
          draft: true,
          depth: 0,
          overrideAccess: false,
          req,
        })
        const preview = await previewSchedule(
          Buffer.from(await file.arrayBuffer()),
          file.name,
          event,
          mapping,
          String(form.get('dateFormat') || 'iso'),
        )
        if (form.get('confirm') !== 'true' || preview.errors.length)
          return Response.json(preview, { status: preview.errors.length ? 422 : 200 })
        return Response.json(await applySchedule(req, id, preview, form.get('publish') === 'true'))
      } catch (error) {
        req.payload.logger.error({ err: error }, 'Schedule import failed; transaction rolled back.')
        return Response.json(
          { error: error instanceof Error ? error.message : 'Import failed. Nothing was changed.' },
          { status: error instanceof ScheduleImportError ? error.status : 400 },
        )
      }
    },
  },
]
