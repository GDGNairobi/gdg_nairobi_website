import { permanentRedirect } from 'next/navigation'

export default function PartnersRedirect() {
  permanentRedirect('/about#partners')
}
