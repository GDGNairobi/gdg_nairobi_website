import Image from 'next/image'

import styles from './CommunityHeroPhotos.module.css'

type Props = {
  caption: string
  photos: Array<{ src: string; alt: string }>
}

export function CommunityHeroPhotos({ caption, photos }: Props) {
  return (
    <figure className={styles.composition}>
      <div className={styles.accents} aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
      <div className={styles.photos} data-count={photos.length}>
        {photos.map((photo, index) => (
          <div className={styles.postcard} key={`${photo.src}-${index}`}>
            <div className={styles.image}>
              <Image
                alt={photo.alt}
                fill
                preload={index === 0}
                loading={index === 0 ? 'eager' : 'lazy'}
                sizes={
                  photos.length === 1
                    ? '(max-width: 1024px) 90vw, 52vw'
                    : '(max-width: 700px) 44vw, (max-width: 1024px) 43vw, 26vw'
                }
                src={photo.src}
              />
            </div>
          </div>
        ))}
      </div>
      <figcaption className={styles.caption}>
        <span>{caption}</span>
      </figcaption>
    </figure>
  )
}
