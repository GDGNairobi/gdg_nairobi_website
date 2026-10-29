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
                loading={index === 0 ? 'eager' : 'lazy'}
                fetchPriority={index === 0 ? 'high' : undefined}
                // Match the CSS grid, frame padding and tablet width cap.
                sizes={
                  photos.length === 1
                    ? '(max-width: 380px) calc(100vw - 46px), (max-width: 700px) calc(100vw - 54px), (max-width: 892px) calc(100vw - 114px), (max-width: 1024px) 778px, (max-width: 1800px) calc(49.45vw - 38px), calc(51.75vw - 79.4px)'
                    : '(max-width: 380px) calc(50vw - 34px), (max-width: 700px) calc(50vw - 38px), (max-width: 892px) calc(50vw - 78px), (max-width: 1024px) 368px, (max-width: 1800px) calc(24.725vw - 39px), calc(25.875vw - 59.7px)'
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
