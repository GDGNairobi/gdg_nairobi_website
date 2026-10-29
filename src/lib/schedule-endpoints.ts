import { createHash } from 'node:crypto'
import type { Endpoint, PayloadRequest } from 'payload'
import { previewSchedule, scheduleTemplate, type ColumnMapping } from '@/lib/schedule-import'

const allowed = (req: PayloadRequest) => req.user && ['admin', 'editor'].includes(req.user.role)
const idFor = (req: PayloadRequest) => Number(req.routeParams?.id)
export const scheduleEndpoints: Endpoint[] = [
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
      let transaction: Awaited<ReturnType<typeof req.payload.db.beginTransaction>> = null
      const previousTransaction = req.transactionID
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
        transaction = await req.payload.db.beginTransaction()
        if (!transaction)
          return Response.json(
            { error: 'Could not start the import. Nothing was changed.' },
            { status: 503 },
          )
        req.transactionID = transaction
        const publish = form.get('publish') === 'true'
        let created = 0,
          updated = 0
        for (const row of preview.rows) {
          const found = await req.payload.find({
            collection: 'sessions',
            where: { and: [{ event: { equals: id } }, { importKey: { equals: row.importKey } }] },
            draft: true,
            limit: 1,
            depth: 0,
            overrideAccess: false,
            req,
          })
          const existing = found.docs[0]
          const speakers: number[] = []
          for (const name of row.speakerNames) {
            const matches = await req.payload.find({
              collection: 'speakers',
              where: { name: { like: name } },
              limit: 100,
              draft: true,
              overrideAccess: false,
              req,
            })
            let speaker = matches.docs.find(
              (s) => s.name.trim().toLowerCase() === name.trim().toLowerCase(),
            )
            if (!speaker)
              speaker = await req.payload.create({
                collection: 'speakers',
                data: {
                  name,
                  slug: `speaker-${createHash('sha256').update(name.toLowerCase()).digest('hex').slice(0, 16)}`,
                  _status: publish ? 'published' : 'draft',
                },
                draft: !publish,
                overrideAccess: false,
                req,
              })
            if (publish && speaker._status !== 'published')
              speaker = await req.payload.update({
                collection: 'speakers',
                id: speaker.id,
                data: { _status: 'published' },
                overrideAccess: false,
                req,
              })
            speakers.push(speaker.id)
          }
          const data = {
            event: id,
            importKey: row.importKey,
            slug:
              existing?.slug ||
              `event-${id}-${createHash('sha256').update(row.importKey).digest('hex').slice(0, 20)}`,
            title: row.title,
            startsAt: row.startsAt,
            endsAt: row.endsAt,
            room: row.supplied.includes('room') ? row.room : existing?.room || row.room,
            scheduleTrack: row.supplied.includes('track')
              ? row.scheduleTrack
              : existing?.scheduleTrack || row.scheduleTrack,
            format: row.supplied.includes('format') ? row.format : existing?.format || row.format,
            level: row.supplied.includes('level') ? row.level : existing?.level || row.level,
            track: existing?.track || ('open' as const),
            ...(speakers.length ? { speakers } : {}),
            ...(row.description
              ? {
                  description: {
                    root: {
                      type: 'root',
                      format: '' as const,
                      indent: 0,
                      version: 1,
                      direction: null,
                      children: [
                        {
                          type: 'paragraph',
                          format: '',
                          indent: 0,
                          version: 1,
                          direction: null,
                          children: [
                            {
                              type: 'text',
                              text: row.description,
                              format: 0,
                              detail: 0,
                              mode: 'normal',
                              style: '',
                              version: 1,
                            },
                          ],
                        },
                      ],
                    },
                  },
                }
              : {}),
            _status: publish ? ('published' as const) : ('draft' as const),
          }
          if (existing) {
            await req.payload.update({
              collection: 'sessions',
              id: existing.id,
              data,
              draft: !publish,
              overrideAccess: false,
              req,
            })
            updated++
          } else {
            await req.payload.create({
              collection: 'sessions',
              data,
              draft: !publish,
              overrideAccess: false,
              req,
            })
            created++
          }
        }
        await req.payload.update({
          collection: 'community-events',
          id,
          data: { days: preview.days, _status: publish ? 'published' : 'draft' },
          draft: !publish,
          overrideAccess: false,
          req,
        })
        await req.payload.db.commitTransaction(transaction)
        transaction = null
        return Response.json({
          created,
          updated,
          published: publish,
          message: `${created} added, ${updated} updated. ${publish ? 'Programme published.' : 'Saved as drafts. Publish the event and sessions when ready.'}`,
        })
      } catch (error) {
        if (transaction) await req.payload.db.rollbackTransaction(transaction)
        req.payload.logger.error({ err: error }, 'Schedule import failed; transaction rolled back.')
        return Response.json(
          { error: error instanceof Error ? error.message : 'Import failed. Nothing was changed.' },
          { status: 400 },
        )
      } finally {
        req.transactionID = previousTransaction
      }
    },
  },
]
