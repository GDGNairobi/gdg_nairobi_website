import type { CommunityHomeContent } from '@/lib/site-content'

export function CommunityIntroduction({
  about,
  skipFirst = false,
}: {
  about: CommunityHomeContent['about']
  skipFirst?: boolean
}) {
  return (
    <div className="community-introduction">
      {about.description
        .split(/\n\s*\n/)
        .slice(skipFirst ? 1 : 0)
        .map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      <div className="community-welcome">
        <span>Karibu</span>
        <p>{about.welcomeLead}</p>
        <strong>{about.welcomeLine}</strong>
      </div>
    </div>
  )
}
export function CommunityProgrammes({
  programmes,
}: {
  programmes: CommunityHomeContent['programmes']
}) {
  return (
    <section className="about-programmes">
      <p className="section-kicker">Learn · Connect · Build</p>
      <h2 className="programmes-title">What we do</h2>
      <p>{programmes.intro}</p>
      <div>
        {programmes.items.map((item, index) => (
          <article className="programme-card" key={item.title}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </article>
        ))}
      </div>
      <p>{programmes.closing}</p>
      <p className="community-access-note">{programmes.accessNote}</p>
    </section>
  )
}
