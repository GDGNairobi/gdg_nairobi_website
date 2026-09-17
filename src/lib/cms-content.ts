import config from '@payload-config'
import { getPayload } from 'payload'

import type { Partner, Session, Speaker, TeamMember } from '@/payload-types'

const enabled = () => process.env.ENABLE_CMS === 'true' || process.env.VERCEL === '1'

async function payloadClient() {
  if (!enabled()) return null
  try {
    return await getPayload({ config })
  } catch {
    return null
  }
}

export async function getSpeakers(): Promise<Speaker[]> {
  const payload = await payloadClient()
  if (!payload) return []
  try {
    return (await payload.find({ collection: 'speakers', depth: 1, limit: 100, overrideAccess: false, sort: ['-featured', 'name'] })).docs
  } catch { return [] }
}

export async function getSessions(): Promise<Session[]> {
  const payload = await payloadClient()
  if (!payload) return []
  try {
    return (await payload.find({ collection: 'sessions', depth: 2, limit: 200, overrideAccess: false, sort: 'startsAt' })).docs
  } catch { return [] }
}

export async function getPartners(): Promise<Partner[]> {
  const payload = await payloadClient()
  if (!payload) return []
  try {
    return (await payload.find({ collection: 'partners', depth: 1, limit: 100, overrideAccess: false, sort: ['tier', 'order'] })).docs
  } catch { return [] }
}

export async function getTeamMembers(): Promise<TeamMember[]> {
  const payload = await payloadClient()
  if (!payload) return []
  try {
    return (await payload.find({ collection: 'team-members', depth: 1, limit: 100, overrideAccess: false, sort: 'order' })).docs
  } catch { return [] }
}
