import { redirect } from 'next/navigation'
import { getFeaturedEvent } from '@/lib/community-events'

export default async function EventSectionRedirect() {
  const event = await getFeaturedEvent('devfest')
  redirect(event ? `${event.href}#venue` : '/events')
}
