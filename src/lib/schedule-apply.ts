import { createHash } from 'node:crypto'
import type { PayloadRequest } from 'payload'
import type { SchedulePreview } from './schedule-import'

export class ScheduleImportError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message)
  }
}

export async function applySchedule(
  req: PayloadRequest,
  id: number,
  preview: SchedulePreview,
  publish: boolean,
  options: { updateEvent?: boolean } = {},
) {
  let transaction: Awaited<ReturnType<typeof req.payload.db.beginTransaction>> = null
  const previousTransaction = req.transactionID
  try {
    transaction = await req.payload.db.beginTransaction()
    if (!transaction)
      throw new ScheduleImportError('Could not start the import. Nothing was changed.', 503)
    req.transactionID = transaction
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
      const existing = row.existingSessionID
        ? await req.payload.findByID({
            collection: 'sessions',
            id: row.existingSessionID,
            depth: 0,
            draft: true,
            overrideAccess: false,
            req,
          })
        : found.docs[0]
      if (
        existing &&
        (existing.event !== id || (existing.importKey && existing.importKey !== row.importKey))
      )
        throw new ScheduleImportError(
          'The matched session changed. Preview again before importing.',
          409,
        )
      const speakers: number[] = []
      for (const name of row.speakerNames) {
        const matches = await req.payload.find({
          collection: 'speakers',
          where: {
            or: [{ name: { like: name } }, { importAliases: { contains: name } }],
          },
          pagination: false,
          depth: 0,
          draft: true,
          overrideAccess: false,
          req,
        })
        const aliasMatches = matches.docs.filter((s) =>
          s.importAliases?.some(
            (alias) => alias.trim().toLowerCase() === name.trim().toLowerCase(),
          ),
        )
        const exactMatches = matches.docs.filter(
          (s) =>
            String(s.name || '')
              .trim()
              .toLowerCase() === name.trim().toLowerCase(),
        )
        // An explicit alias keeps a retired duplicate from being revived by a later import.
        const candidates = aliasMatches.length ? aliasMatches : exactMatches
        if (candidates.length > 1)
          throw new Error(
            `Multiple speaker profiles match “${name}”. Resolve their import names before importing.`,
          )
        let speaker = candidates[0]
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
        if (!speakers.includes(speaker.id)) speakers.push(speaker.id)
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
    if (options.updateEvent !== false)
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
    return {
      created,
      updated,
      published: publish,
      message: `${created} added, ${updated} updated. ${
        options.updateEvent === false
          ? publish
            ? 'Session updates published.'
            : 'Saved as drafts. Review and publish the sessions when ready.'
          : publish
            ? 'Programme published.'
            : 'Saved as drafts. Publish the event and sessions when ready.'
      }`,
    }
  } catch (error) {
    if (transaction) await req.payload.db.rollbackTransaction(transaction)
    throw error
  } finally {
    req.transactionID = previousTransaction
  }
}
