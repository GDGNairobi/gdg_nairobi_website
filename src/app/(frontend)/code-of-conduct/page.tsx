import type { Metadata } from 'next'

import { EditorialPage } from '@/components/EditorialPage'
import { buildPageMetadata } from '@/lib/metadata'

export const metadata: Metadata = buildPageMetadata({
  title: 'Community code of conduct',
  description: 'The standards that help keep GDG Nairobi events and online spaces welcoming, inclusive and respectful.',
  path: '/code-of-conduct',
  keywords: ['GDG Nairobi code of conduct', 'community guidelines'],
})

export default function CodeOfConductPage() {
  return (
    <EditorialPage eyebrow="THERE IS A SEAT FOR YOU HERE" title="Build with respect." intro="GDG Nairobi is committed to a welcoming, inclusive and harassment-free community for everyone—online and in person." accent="blue">
      <div className="conduct-grid">
        <article><span>01</span><h2>Be generous</h2><p>Share knowledge without gatekeeping. Make space for people with different backgrounds and levels of experience.</p></article>
        <article><span>02</span><h2>Be respectful</h2><p>Harassment, intimidation, discrimination and harmful conduct have no place in this community.</p></article>
        <article><span>03</span><h2>Speak up safely</h2><p>Contact an organizer if you experience or witness a concern. Reports will be handled with care.</p></article>
      </div>
      <a className="wide-cta" href="https://github.com/GDGNairobi/.github/blob/main/CODE_OF_CONDUCT.md"><span>OFFICIAL POLICY</span><strong>Read the complete GDG Nairobi Code of Conduct</strong><i>↗</i></a>
    </EditorialPage>
  )
}
