import { permanentRedirect } from 'next/navigation'

export default function ScheduleRedirect() {
  permanentRedirect('/devfest#programme')
}
