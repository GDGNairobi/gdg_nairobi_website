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
