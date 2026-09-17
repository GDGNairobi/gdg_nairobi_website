import { permanentRedirect } from 'next/navigation'

export default function VenueRedirect() {
  permanentRedirect('/devfest#venue')
}
