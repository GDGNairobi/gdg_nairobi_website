import Image from 'next/image'
import type { Partner } from '@/payload-types'
import { mediaURL } from '@/lib/media-url'
import styles from './EventPartners.module.css'

export function EventPartners({ partners }: { partners: Partner[] }) {
  if (!partners.length) return null
  return (
    <section id="partners" className={styles.section} aria-labelledby="event-partners-heading">
      <p className="section-kicker">Sponsors & partners</p>
      <h2 id="event-partners-heading">With support from.</h2>
      <PartnerGrid partners={partners} />
    </section>
  )
}

export function PartnerGrid({
  partners,
  headingLevel = 'h3',
}: {
  partners: Partner[]
  headingLevel?: 'h3' | 'h4'
}) {
  const Heading = headingLevel
  return (
    <div className={styles.grid}>
      {partners.map((partner) => {
        const logo = typeof partner.logo === 'object' ? partner.logo : null
        const logoURL = logo?.url
          ? mediaURL(logo.url)
          : /^https?:\/\//.test(partner.sourceLogoURL || '')
            ? partner.sourceLogoURL!
            : undefined
        const url = /^https?:\/\//.test(partner.url || '') ? partner.url! : undefined
        const content = (
          <>
            <div className={styles.logo}>
              {logoURL ? (
                <Image
                  src={logoURL}
                  alt={`${partner.name} logo`}
                  width={240}
                  height={120}
                  sizes="(max-width: 700px) 40vw, (max-width: 1100px) 25vw, 16vw"
                />
              ) : (
                <span className={styles.wordmark}>{partner.name}</span>
              )}
            </div>
            <Heading>
              {partner.name}
              {url && <span aria-hidden="true"> ↗</span>}
            </Heading>
          </>
        )
        return url ? (
          <a key={partner.id} className={styles.card} href={url} target="_blank" rel="noreferrer">
            {content}
          </a>
        ) : (
          <article key={partner.id} className={styles.card}>
            {content}
          </article>
        )
      })}
    </div>
  )
}
