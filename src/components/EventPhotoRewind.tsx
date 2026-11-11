'use client'

import Image from 'next/image'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'

import type { EventRewindContent } from '@/lib/event-rewind'
import styles from './EventPhotoRewind.module.css'

const motionQuery = '(prefers-reduced-motion: reduce)'
const subscribeToMotion = (notify: () => void) => {
  const query = window.matchMedia(motionQuery)
  query.addEventListener('change', notify)
  return () => query.removeEventListener('change', notify)
}
const reducedMotionSnapshot = () => window.matchMedia(motionQuery).matches

export function EventPhotoRewind({
  year,
  heading,
  description,
  photos,
  albums,
}: EventRewindContent) {
  const sectionRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const photoRefs = useRef<Array<HTMLButtonElement | null>>([])
  const returnFocusRef = useRef<HTMLButtonElement | null>(null)
  const motion = useRef({
    hovered: false,
    touching: false,
    keyboard: false,
    paused: false,
    popup: false,
    until: 0,
  })
  const [paused, setPaused] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const reducedMotion = useSyncExternalStore(subscribeToMotion, reducedMotionSnapshot, () => true)
  const popupOpen = selectedIndex !== null
  const selectedPhoto = photos[selectedIndex ?? 0]

  useEffect(() => {
    const track = trackRef.current
    const section = sectionRef.current
    if (!track || !section || photos.length < 2) return
    const controller = new AbortController()
    const { signal } = controller
    let visible = false
    let position = track.scrollLeft
    let previousTime = 0
    let animation = 0
    let cycle = 0
    const measure = () => {
      const first = track.firstElementChild as HTMLElement | null
      const repeat = track.querySelector<HTMLElement>('[data-repeat]')
      cycle = first && repeat ? repeat.offsetLeft - first.offsetLeft : 0
    }
    const resize = new ResizeObserver(measure)
    resize.observe(track)
    measure()
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
    })
    intersection.observe(track)
    window.addEventListener(
      'keydown',
      (event) => {
        if (event.key === 'Tab') motion.current.keyboard = true
      },
      { signal },
    )
    window.addEventListener(
      'pointerdown',
      () => {
        motion.current.keyboard = false
      },
      { signal, capture: true },
    )
    const release = () => {
      if (motion.current.touching) {
        motion.current.touching = false
        motion.current.until = performance.now() + 1800
      }
    }
    window.addEventListener('pointerup', release, { signal })
    window.addEventListener('pointercancel', release, { signal })
    track.addEventListener(
      'wheel',
      () => {
        motion.current.until = performance.now() + 1800
      },
      { signal, passive: true },
    )
    const tick = (now: number) => {
      const elapsed = Math.min(now - (previousTime || now), 64)
      previousTime = now
      const state = motion.current
      const keyboardFocus = state.keyboard && section.contains(document.activeElement)
      if (
        state.paused ||
        state.hovered ||
        state.touching ||
        state.popup ||
        keyboardFocus ||
        !visible ||
        document.hidden ||
        now < state.until
      ) {
        position = track.scrollLeft
      } else if (cycle > 0) {
        // Preserve fractional pixels for a slow drift on high-refresh displays.
        position = (position + elapsed * 0.018) % cycle
        track.scrollLeft = position
      }
      animation = requestAnimationFrame(tick)
    }
    if (!reducedMotion) animation = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(animation)
      resize.disconnect()
      intersection.disconnect()
      controller.abort()
    }
  }, [photos.length, reducedMotion])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!popupOpen || !dialog) return
    dialog.showModal()
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = overflow
      dialog.close()
    }
  }, [popupOpen])

  const openPhoto = (index: number) => {
    motion.current.popup = true
    returnFocusRef.current = photoRefs.current[index]
    setSelectedIndex(index)
  }
  const closePhoto = (closedAt: number) => {
    motion.current.popup = false
    motion.current.until = closedAt + 1800
    setSelectedIndex(null)
    const trigger = returnFocusRef.current
    trigger?.focus({ preventScroll: true })
    trigger?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'instant' })
  }
  const changePhoto = (step: number) => {
    setSelectedIndex((index) => ((index ?? 0) + step + photos.length) % photos.length)
  }
  const stepFilm = (step: number) => {
    const track = trackRef.current
    if (!track) return
    motion.current.until = performance.now() + 1800
    const first = track.firstElementChild as HTMLElement
    const repeat = track.querySelector<HTMLElement>('[data-repeat]')
    const cycle = repeat ? repeat.offsetLeft - first.offsetLeft : 0
    const distance = first.getBoundingClientRect().width + 12
    if (cycle > 0) {
      const normalized = track.scrollLeft % cycle
      track.scrollLeft = step < 0 && normalized < distance ? normalized + cycle : normalized
    }
    track.scrollBy({ left: step * distance, behavior: reducedMotion ? 'instant' : 'smooth' })
  }

  return (
    <section
      className={styles.section}
      ref={sectionRef}
      aria-labelledby="event-rewind-heading"
      data-photo-rewind
    >
      <header className={styles.heading}>
        <div>
          <p className={`section-kicker ${styles.kicker}`}>DevFest Nairobi · {year} rewind</p>
          <h2 id="event-rewind-heading">{heading}</h2>
        </div>
        <p className={styles.description}>{description}</p>
      </header>
      <div className={styles.viewport}>
        <div
          className={styles.track}
          ref={trackRef}
          role="group"
          aria-label={`DevFest Nairobi ${year} photos`}
          onPointerEnter={(event) => {
            if (event.pointerType === 'mouse') motion.current.hovered = true
          }}
          onPointerLeave={(event) => {
            if (event.pointerType === 'mouse') motion.current.hovered = false
          }}
          onPointerDown={() => {
            motion.current.touching = true
          }}
          data-film-track
        >
          {(photos.length > 1 ? [false, true] : [false]).map((repeat) =>
            photos.map((photo, index) => (
              <figure
                className={styles.frame}
                key={`${repeat}-${photo.src}-${index}`}
                aria-hidden={repeat || undefined}
                data-repeat={repeat || undefined}
              >
                <div className={styles.edge} aria-hidden="true">
                  <span>DevFest Nairobi</span>
                  <span>
                    {year} ▷ {String(index + 1).padStart(2, '0')}
                  </span>
                </div>
                <button
                  type="button"
                  className={styles.photo}
                  ref={
                    repeat
                      ? undefined
                      : (element) => {
                          photoRefs.current[index] = element
                        }
                  }
                  tabIndex={repeat ? -1 : undefined}
                  aria-label={`Enlarge photo: ${photo.caption}`}
                  onClick={() => openPhoto(index)}
                >
                  <Image
                    src={photo.src}
                    alt={repeat ? '' : photo.alt}
                    fill
                    sizes="(max-width: 700px) 78vw, (max-width: 928px) 260px, (max-width: 1357px) 28vw, 380px"
                    style={{ objectPosition: photo.position || 'center' }}
                  />
                </button>
                <figcaption className={styles.caption}>
                  <span>{photo.caption}</span>
                  <span>{photo.day}</span>
                </figcaption>
              </figure>
            )),
          )}
        </div>
      </div>
      <footer className={styles.footer}>
        <div className={styles.albums}>
          {albums.length > 0 && <span className={styles.albumLabel}>{year} albums</span>}
          {albums.map((album) => (
            <a key={album.url} href={album.url} target="_blank" rel="noreferrer">
              {album.label} ↗
            </a>
          ))}
        </div>
        {photos.length > 1 && (
          <div className={styles.controls} aria-label="Photo strip controls">
            {!reducedMotion && photos.length > 1 && (
              <button
                type="button"
                aria-label={
                  paused ? 'Resume automatic photo scrolling' : 'Pause automatic photo scrolling'
                }
                aria-pressed={paused}
                onClick={() => {
                  motion.current.paused = !paused
                  setPaused(!paused)
                }}
              >
                <span aria-hidden="true">{paused ? '▷' : 'Ⅱ'}</span>
              </button>
            )}
            <button type="button" aria-label="Previous photo in strip" onClick={() => stepFilm(-1)}>
              <span aria-hidden="true">←</span>
            </button>
            <button type="button" aria-label="Next photo in strip" onClick={() => stepFilm(1)}>
              <span aria-hidden="true">→</span>
            </button>
          </div>
        )}
      </footer>
      <dialog
        className={styles.dialog}
        ref={dialogRef}
        aria-labelledby="event-rewind-dialog-heading"
        onClose={(event) => closePhoto(event.timeStamp)}
        onClick={(event) => {
          const bounds = event.currentTarget.getBoundingClientRect()
          if (
            event.target === event.currentTarget &&
            (event.clientX < bounds.left ||
              event.clientX > bounds.right ||
              event.clientY < bounds.top ||
              event.clientY > bounds.bottom)
          )
            event.currentTarget.close()
        }}
        onKeyDown={(event) => {
          if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            event.preventDefault()
            changePhoto(event.key === 'ArrowLeft' ? -1 : 1)
          }
        }}
      >
        {popupOpen && selectedPhoto && (
          <>
            <div className={styles.dialogHeader}>
              <h3 id="event-rewind-dialog-heading">DevFest Nairobi · {year}</h3>
              <button
                type="button"
                className={styles.close}
                aria-label="Close photo preview"
                onClick={() => dialogRef.current?.close()}
              >
                Close ×
              </button>
            </div>
            <Image
              src={selectedPhoto.src}
              alt={selectedPhoto.alt}
              width={selectedPhoto.width || 1800}
              height={selectedPhoto.height || 1200}
              sizes="(max-width: 992px) calc(100vw - 64px), 928px"
              className={styles.enlarged}
            />
            <div className={styles.dialogFooter}>
              <p aria-live="polite">
                {selectedPhoto.caption}
                {selectedPhoto.day && ` · ${selectedPhoto.day}`}
              </p>
              <div className={styles.dialogControls}>
                <button
                  type="button"
                  aria-label="Previous enlarged photo"
                  onClick={() => changePhoto(-1)}
                >
                  ←
                </button>
                <span>
                  {String((selectedIndex ?? 0) + 1).padStart(2, '0')} /{' '}
                  {String(photos.length).padStart(2, '0')}
                </span>
                <button
                  type="button"
                  aria-label="Next enlarged photo"
                  onClick={() => changePhoto(1)}
                >
                  →
                </button>
              </div>
            </div>
          </>
        )}
      </dialog>
    </section>
  )
}
