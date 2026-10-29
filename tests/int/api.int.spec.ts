import { randomUUID } from 'node:crypto'
import { getPayload, Payload } from 'payload'
import config from '@/payload.config'
import { seedCommunity } from '@/seed/community'

import { describe, it, beforeAll, expect } from 'vitest'

let payload: Payload

describe.skipIf(process.env.RUN_DATABASE_TESTS !== 'true')('Payload API', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  it('fetches users', async () => {
    const users = await payload.find({
      collection: 'users',
    })
    expect(users).toBeDefined()
  })
})

// The seed must be safe to rerun after organisers start editing.
describe.skipIf(process.env.RUN_DATABASE_TESTS !== 'true')('Community seed', () => {
  it('reuses events and Media and preserves published organiser edits', async () => {
    const client = await getPayload({ config })
    const events = await client.count({ collection: 'community-events' })
    const media = await client.count({ collection: 'media' })
    const event = (
      await client.find({
        collection: 'community-events',
        where: { slug: { equals: 'devfest-nairobi-2026' } },
        limit: 1,
      })
    ).docs[0]
    expect(event).toBeDefined()
    const original = event.tagline
    try {
      await client.update({
        collection: 'community-events',
        id: event.id,
        data: { tagline: 'Organiser edited tagline', _status: 'published' },
      })
      await seedCommunity(client)
      await seedCommunity(client)
      expect((await client.count({ collection: 'community-events' })).totalDocs).toBe(
        events.totalDocs,
      )
      expect((await client.count({ collection: 'media' })).totalDocs).toBe(media.totalDocs)
      expect(
        (await client.findByID({ collection: 'community-events', id: event.id })).tagline,
      ).toBe('Organiser edited tagline')
    } finally {
      await client.update({
        collection: 'community-events',
        id: event.id,
        data: { tagline: original, _status: 'published' },
      })
    }
  })
})

describe.skipIf(process.env.RUN_DATABASE_TESTS !== 'true')('Legacy event consolidation', () => {
  it('prefers the canonical slug over a newer imported duplicate and transfers sessions', async () => {
    const client = await getPayload({ config })
    const canonical = (
      await client.find({
        collection: 'community-events',
        where: { slug: { equals: 'devfest-nairobi-2026' } },
        limit: 1,
      })
    ).docs[0]
    const key = randomUUID()
    const duplicate = await client.create({
      collection: 'community-events',
      data: {
        source: 'bevy',
        localTitle: 'DevFest Nairobi 2026',
        sourceTitle: 'DevFest Nairobi 2026',
        eventKind: 'community',
        slug: `legacy-import-${key}`,
        showOnSite: true,
        _status: 'published',
      },
    })
    let sessionID: number | undefined
    try {
      // Simulate the unversioned null-slug rows created by the old sync schema.
      await client.db.updateOne({
        collection: 'community-events',
        id: duplicate.id,
        data: { slug: null },
      })
      const session = await client.create({
        collection: 'sessions',
        data: {
          title: 'Legacy session',
          slug: `legacy-session-${key}`,
          event: duplicate.id,
          startsAt: '2026-11-14T06:00:00Z',
          endsAt: '2026-11-14T07:00:00Z',
          room: 'Main',
          track: 'open',
          format: 'talk',
          _status: 'published',
        },
      })
      sessionID = session.id
      await seedCommunity(client)
      const retained = await client.findByID({ collection: 'community-events', id: duplicate.id })
      expect(retained.showOnSite).toBe(false)
      expect(retained.slug).toBeTruthy()
      expect(retained.slug).not.toBe(canonical.slug)
      expect(retained.eventKind).toBe('devfest')
      expect(
        (await client.findByID({ collection: 'community-events', id: canonical.id })).showOnSite,
      ).toBe(true)
      expect(
        (await client.findByID({ collection: 'sessions', id: session.id, depth: 0 })).event,
      ).toBe(canonical.id)
      expect(
        (
          await client.find({
            collection: 'community-events',
            where: { slug: { equals: canonical.slug } },
            limit: 1,
          })
        ).docs[0].id,
      ).toBe(canonical.id)
    } finally {
      if (sessionID) await client.delete({ collection: 'sessions', id: sessionID })
      await client.delete({ collection: 'community-events', id: duplicate.id })
    }
  })
})
