import { redirect } from 'next/navigation'
import { getFeaturedEvent } from '@/lib/community-events'

export default async function DevFestRedirect() {
  const event = await getFeaturedEvent('devfest')
  redirect(event?.href || '/events')
}
