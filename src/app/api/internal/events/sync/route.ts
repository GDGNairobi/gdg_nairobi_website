import config from '@payload-config'
import { headers } from 'next/headers'
import { getPayload } from 'payload'

import { syncChapterEvents } from '@/lib/gdg-events'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

async function authorized() {
  const requestHeaders = await headers()
  const authorization = requestHeaders.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authorization === `Bearer ${cronSecret}`) return true

  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: requestHeaders })
  return (user as { role?: string } | null)?.role === 'admin'
}

async function runSync() {
  if (!(await authorized())) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  const payload = await getPayload({ config })
  const result = await syncChapterEvents(payload)
  return Response.json(result, { status: result.status === 'ok' ? 200 : 502 })
}

export const GET = runSync
export const POST = runSync
