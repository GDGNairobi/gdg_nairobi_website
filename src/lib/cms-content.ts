import config from '@payload-config'
import { getPayload } from 'payload'

import type { Partner, Session, Speaker, TeamMember } from '@/payload-types'

const enabled = () => process.env.ENABLE_CMS === 'true' || process.env.VERCEL === '1'

export const defaultTeamMembers: TeamMember[] = [
  { id: -1, name: 'Brayan Kai Mwanyumba', role: 'GDG Co-Lead & Crew', order: 1, updatedAt: '', createdAt: '', _status: 'published' },
  { id: -2, name: 'Tabitha Kavyu', role: 'Community Coordinator', order: 2, updatedAt: '', createdAt: '', _status: 'published' },
  { id: -3, name: 'Brian Ouma', role: 'Software Engineer · GDG Organizer & Logistics', order: 3, updatedAt: '', createdAt: '', _status: 'published' },
  { id: -4, name: 'Wayne Gakuo', role: 'Unstacked Labs · GDG Co-organizer & Crew', order: 4, updatedAt: '', createdAt: '', _status: 'published' },
  { id: -5, name: 'Rachael Kimberly Msabeni', role: 'WTM Ambassador · Software Developer, UX Designer', order: 5, updatedAt: '', createdAt: '', _status: 'published' },
  { id: -6, name: 'Sabina Benerdette', role: 'QA Engineer · PULA', order: 6, updatedAt: '', createdAt: '', _status: 'published' },
  { id: -7, name: 'Ngesa Marvin', role: 'Safaricom PLC · Strategic Partnerships, Content & ML', order: 7, updatedAt: '', createdAt: '', _status: 'published' },
  { id: -8, name: 'Mambo Bryan', role: 'BiziLabs · Strategy and Partnerships', order: 8, updatedAt: '', createdAt: '', _status: 'published' },
  { id: -9, name: 'Maina Wycliffe', role: 'Typescript Aficionado and Google Developer Expert · Unstacked Labs', order: 9, updatedAt: '', createdAt: '', _status: 'published' },
]

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

export async function getPartners(scope: 'chapter' | 'devfest' = 'devfest'): Promise<Partner[]> {
  const payload = await payloadClient()
  if (!payload) return []
  try {
    return (await payload.find({
      collection: 'partners',
      depth: 1,
      limit: 100,
      overrideAccess: false,
      sort: ['tier', 'order'],
      where: { scope: { equals: scope } },
    })).docs
  } catch { return [] }
}

export async function getTeamMembers(): Promise<TeamMember[]> {
  const payload = await payloadClient()
  if (!payload) return defaultTeamMembers
  try {
    const team = (await payload.find({ collection: 'team-members', depth: 1, limit: 100, overrideAccess: false, sort: 'order' })).docs
    return team.length ? team : defaultTeamMembers
  } catch { return defaultTeamMembers }
}
