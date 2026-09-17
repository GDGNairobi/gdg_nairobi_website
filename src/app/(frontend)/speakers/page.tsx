import { permanentRedirect } from 'next/navigation'

export default function SpeakersRedirect() {
  permanentRedirect('/devfest#speakers')
}
