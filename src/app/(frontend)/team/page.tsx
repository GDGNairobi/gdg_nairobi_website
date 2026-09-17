import { permanentRedirect } from 'next/navigation'

export default function TeamRedirect() {
  permanentRedirect('/about#organizers')
}
