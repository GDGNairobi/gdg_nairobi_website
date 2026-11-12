'use client'

import { useEffect, useRef, useState, type PointerEvent } from 'react'
import {
  drawAttendeePoster,
  initialFraming,
  posterSize,
  posterPhotoFrame,
  readPosterPhoto,
  type PhotoFraming,
  type PosterDetails,
} from '@/lib/attendee-poster'
import styles from './AttendeePoster.module.css'

export function AttendeePoster({ details }: { details: PosterDetails }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const controlsRef = useRef<HTMLElement>(null)
  const nameRef = useRef<HTMLInputElement>(null)
  const framingSummaryRef = useRef<HTMLElement>(null)
  const previewHeadingRef = useRef<HTMLHeadingElement>(null)
  const cameraPanelRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{ id: number; x: number; y: number; framing: PhotoFraming } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const cameraButtonRef = useRef<HTMLButtonElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const cameraRequest = useRef(0)
  const photoRequest = useRef(0)
  const [photo, setPhoto] = useState<ImageBitmap | null>(null)
  const [name, setName] = useState('')
  const [framing, setFraming] = useState<PhotoFraming>(initialFraming)
  const [fontsReady, setFontsReady] = useState(false)
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState('')
  const [camera, setCamera] = useState<'closed' | 'starting' | 'ready'>('closed')
  const [videoReady, setVideoReady] = useState(false)
  const [adjusting, setAdjusting] = useState(false)

  useEffect(() => {
    let current = true
    const ready = () => {
      if (current) setFontsReady(true)
    }
    void Promise.all([
      document.fonts.load('800 48px "Manrope Variable"'),
      document.fonts.load('600 32px "Manrope Variable"'),
    ]).then(ready, ready)
    return () => {
      current = false
    }
  }, [])

  useEffect(() => () => photo?.close(), [photo])
  useEffect(
    () => () => {
      cameraRequest.current++
      photoRequest.current++
      streamRef.current?.getTracks().forEach((track) => track.stop())
    },
    [],
  )

  useEffect(() => {
    if (fontsReady && canvasRef.current)
      drawAttendeePoster(canvasRef.current, details, name, photo, framing)
  }, [details, fontsReady, name, photo, framing])

  useEffect(() => {
    if (camera === 'ready' && videoRef.current && streamRef.current) {
      const request = cameraRequest.current
      const stream = streamRef.current
      videoRef.current.srcObject = stream
      void videoRef.current.play().catch(() => {
        if (request !== cameraRequest.current) return
        stream.getTracks().forEach((track) => track.stop())
        streamRef.current = null
        setCamera('closed')
        setError('The camera could not start. Try uploading a photo instead.')
      })
    }
  }, [camera])

  const showPreview = () => {
    previewHeadingRef.current?.focus({ preventScroll: true })
    previewHeadingRef.current?.scrollIntoView({
      block: 'start',
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'instant'
        : 'smooth',
    })
  }

  useEffect(() => {
    if (!photo || !window.matchMedia('(max-width: 700px)').matches) return
    const frame = requestAnimationFrame(showPreview)
    return () => cancelAnimationFrame(frame)
  }, [photo])

  useEffect(() => {
    if (!window.matchMedia('(max-width: 700px)').matches) return
    if (camera === 'starting')
      cameraPanelRef.current?.scrollIntoView({ block: 'start', behavior: 'instant' })
    else if (error) controlsRef.current?.scrollIntoView({ block: 'start', behavior: 'instant' })
  }, [camera, error])

  const closeCamera = (restoreFocus = true) => {
    cameraRequest.current++
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
    setCamera('closed')
    setVideoReady(false)
    if (restoreFocus)
      requestAnimationFrame(() => cameraButtonRef.current?.focus({ preventScroll: true }))
  }

  const loadPhoto = async (file: Blob) => {
    const request = ++photoRequest.current
    setLoading(true)
    setError('')
    try {
      const bitmap = await readPosterPhoto(file)
      if (request !== photoRequest.current) {
        bitmap.close()
        return
      }
      setPhoto(bitmap)
      setFraming(initialFraming)
      setAdjusting(false)
      dragRef.current = null
    } catch (cause) {
      if (request === photoRequest.current)
        setError(cause instanceof Error ? cause.message : 'This photo could not be opened.')
    } finally {
      if (request === photoRequest.current) setLoading(false)
    }
  }

  const openCamera = async () => {
    const request = ++cameraRequest.current
    setError('')
    setVideoReady(false)
    setCamera('starting')
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('unavailable')
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: 'user', width: { ideal: 1200 }, height: { ideal: 1600 } },
      })
      if (request !== cameraRequest.current) {
        stream.getTracks().forEach((track) => track.stop())
        return
      }
      streamRef.current = stream
      setCamera('ready')
    } catch (cause) {
      if (request !== cameraRequest.current) return
      setCamera('closed')
      setError(
        cause instanceof DOMException && cause.name === 'NotAllowedError'
          ? 'Camera access was not allowed. You can upload a photo instead.'
          : 'A camera is not available. You can upload a photo instead.',
      )
    }
  }

  const takePhoto = async () => {
    const video = videoRef.current
    if (!video?.videoWidth || !video.videoHeight) return
    const request = cameraRequest.current
    const shot = document.createElement('canvas')
    shot.width = video.videoWidth
    shot.height = video.videoHeight
    const context = shot.getContext('2d')
    if (!context) return
    context.translate(shot.width, 0)
    context.scale(-1, 1)
    context.drawImage(video, 0, 0)
    const blob = await new Promise<Blob | null>((resolve) =>
      shot.toBlob(resolve, 'image/jpeg', 0.95),
    )
    if (request !== cameraRequest.current) return
    closeCamera(false)
    if (blob) await loadPhoto(blob)
    else setError('The photo could not be taken. Try uploading one instead.')
  }

  const download = async () => {
    const canvas = canvasRef.current
    if (!canvas || !photo || !fontsReady) return
    setExporting(true)
    setError('')
    try {
      drawAttendeePoster(canvas, details, name, photo, framing)
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
      if (!blob) throw new Error('The poster could not be saved. Please try again.')
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'devfest-nairobi-2026-attending.png'
      document.body.appendChild(link)
      link.click()
      link.remove()
      setTimeout(() => URL.revokeObjectURL(url), 10000)
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : 'The poster could not be saved. Please try again.',
      )
    } finally {
      setExporting(false)
    }
  }

  const clamp = (value: number) => Math.max(-1, Math.min(1, value))
  const movePhoto = (event: PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current
    const canvas = canvasRef.current
    if (!drag || drag.id !== event.pointerId || !canvas || !photo) return
    const ratio = posterSize.width / canvas.getBoundingClientRect().width
    const scale =
      Math.max(posterPhotoFrame.width / photo.width, posterPhotoFrame.height / photo.height) *
      drag.framing.zoom
    const extraWidth = photo.width * scale - posterPhotoFrame.width
    const extraHeight = photo.height * scale - posterPhotoFrame.height
    setFraming({
      ...drag.framing,
      x:
        extraWidth > 0
          ? clamp(drag.framing.x + ((event.clientX - drag.x) * ratio * 2) / extraWidth)
          : 0,
      y:
        extraHeight > 0
          ? clamp(drag.framing.y + ((event.clientY - drag.y) * ratio * 2) / extraHeight)
          : 0,
    })
  }

  return (
    <div className={styles.editor} data-ready={!!photo} data-camera-open={camera !== 'closed'}>
      <section
        ref={controlsRef}
        className={styles.controls}
        aria-labelledby="poster-controls-heading"
      >
        <h2 id="poster-controls-heading" className="sr-only">
          Your details
        </h2>
        <label className={styles.label} htmlFor="poster-name">
          1. Your name <span>(optional)</span>
        </label>
        <input
          ref={nameRef}
          className={styles.nameInput}
          id="poster-name"
          type="text"
          maxLength={40}
          value={name}
          autoComplete="name"
          enterKeyHint="done"
          placeholder="Your name"
          onChange={(event) => setName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') event.currentTarget.blur()
          }}
        />
        <label className={styles.label} htmlFor="poster-photo">
          2. Add your photo
        </label>
        <input
          ref={fileRef}
          id="poster-photo"
          tabIndex={-1}
          className={styles.fileInput}
          type="file"
          accept="image/*"
          disabled={loading || camera !== 'closed'}
          aria-label="Upload your photo"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) void loadPhoto(file)
            event.target.value = ''
          }}
        />
        <div className={styles.photoButtons}>
          <button
            type="button"
            className={styles.upload}
            disabled={loading || camera !== 'closed'}
            onClick={() => fileRef.current?.click()}
          >
            <svg
              aria-hidden="true"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
            >
              <path d="M12 16V3m-5 5 5-5 5 5M4 16v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4" />
            </svg>
            {photo ? 'Change photo' : 'Choose photo'}
          </button>
          <button
            type="button"
            ref={cameraButtonRef}
            className={styles.cameraButton}
            disabled={loading || camera !== 'closed'}
            onClick={() => void openCamera()}
          >
            <svg
              aria-hidden="true"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
            >
              <path d="M8 5 9.5 3h5L16 5h4a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" />
              <circle cx="12" cy="12" r="4" />
            </svg>
            Take a selfie
          </button>
        </div>
        {camera !== 'closed' && (
          <div ref={cameraPanelRef} className={styles.camera}>
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              aria-label="Live selfie camera"
              onLoadedData={() => setVideoReady(true)}
            />
            <p role="status">
              {camera === 'starting' ? 'Opening your camera…' : 'Ready when you are.'}
            </p>
            <div className={styles.cameraActions}>
              <button
                type="button"
                disabled={!videoReady || camera !== 'ready'}
                onClick={() => void takePhoto()}
              >
                Use this photo
              </button>
              <button type="button" onClick={() => closeCamera()}>
                Cancel camera
              </button>
            </div>
          </div>
        )}
        <p className={styles.status} role="status">
          {loading
            ? 'Preparing your photo…'
            : photo
              ? 'Photo ready. Looking good?'
              : 'Choose a photo from your phone, or take one now.'}
        </p>
        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
        {photo && camera === 'closed' && (
          <button className={styles.previewLink} type="button" onClick={showPreview}>
            Preview poster <span aria-hidden="true">↓</span>
          </button>
        )}
      </section>
      <section className={styles.preview} aria-labelledby="poster-preview-heading">
        <div className={styles.previewHeading}>
          <div>
            <h2 id="poster-preview-heading" ref={previewHeadingRef} tabIndex={-1}>
              Your preview
            </h2>
            <span>PNG · 1080 × 1350</span>
          </div>
          {photo && (
            <button
              className={styles.editDetails}
              type="button"
              onClick={() => {
                nameRef.current?.focus()
                nameRef.current?.scrollIntoView({ block: 'center', behavior: 'instant' })
              }}
            >
              Edit details <span aria-hidden="true">↑</span>
            </button>
          )}
        </div>
        <div className={styles.poster}>
          <canvas
            ref={canvasRef}
            width={posterSize.width}
            height={posterSize.height}
            role="img"
            aria-label={`${name.trim() || 'Your'} attendee poster for ${details.title}. ${details.date}, ${details.venue}.`}
          />
          {photo && adjusting && (
            <button
              type="button"
              className={styles.photoDrag}
              aria-label="Move your photo"
              aria-describedby="poster-framing-help"
              style={{
                left: `${(posterPhotoFrame.x / posterSize.width) * 100}%`,
                top: `${(posterPhotoFrame.y / posterSize.height) * 100}%`,
                width: `${(posterPhotoFrame.width / posterSize.width) * 100}%`,
                height: `${(posterPhotoFrame.height / posterSize.height) * 100}%`,
              }}
              onPointerDown={(event) => {
                if (event.button !== 0) return
                dragRef.current = {
                  id: event.pointerId,
                  x: event.clientX,
                  y: event.clientY,
                  framing,
                }
                event.currentTarget.setPointerCapture(event.pointerId)
              }}
              onPointerMove={movePhoto}
              onLostPointerCapture={() => {
                dragRef.current = null
              }}
              onKeyDown={(event) => {
                const directions: Record<string, [number, number]> = {
                  ArrowLeft: [-1, 0],
                  ArrowRight: [1, 0],
                  ArrowUp: [0, -1],
                  ArrowDown: [0, 1],
                }
                const direction = directions[event.key]
                if (!direction) return
                event.preventDefault()
                setFraming((previous) => ({
                  ...previous,
                  x: clamp(previous.x + direction[0] * 0.06),
                  y: clamp(previous.y + direction[1] * 0.06),
                }))
              }}
            />
          )}
        </div>
        {photo && (
          <details
            className={styles.framing}
            open={adjusting}
            onToggle={(event) => setAdjusting(event.currentTarget.open)}
          >
            <summary ref={framingSummaryRef}>Adjust your photo</summary>
            <p id="poster-framing-help">
              Drag the photo to move it.
              <span className="sr-only"> You can also focus the photo and use the arrow keys.</span>
            </p>
            <label className={styles.zoomLabel}>
              Zoom
              <input
                aria-label="Photo zoom"
                type="range"
                min="1"
                max="2.5"
                step="0.05"
                value={framing.zoom}
                onChange={(event) =>
                  setFraming((previous) => ({ ...previous, zoom: Number(event.target.value) }))
                }
              />
            </label>
            <div className={styles.framingActions}>
              <button type="button" onClick={() => setFraming(initialFraming)}>
                Reset
              </button>
              <button
                type="button"
                onClick={() => {
                  setAdjusting(false)
                  framingSummaryRef.current?.focus()
                }}
              >
                Done adjusting
              </button>
            </div>
          </details>
        )}
      </section>
      <div className={styles.downloadBar}>
        <button
          type="button"
          className={styles.download}
          disabled={!photo || !fontsReady || loading || exporting || camera !== 'closed'}
          onClick={() => void download()}
        >
          {exporting ? 'Saving…' : 'Download your poster'} <span aria-hidden="true">↓</span>
        </button>
        <p className={styles.privacy}>Your photo stays on your device.</p>
      </div>
    </div>
  )
}
