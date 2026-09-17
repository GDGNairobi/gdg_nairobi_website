'use client'

import { useEffect, useRef } from 'react'

export function MotionLayer() {
  const layerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const layer = layerRef.current
    if (!layer || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let frame = 0
    const move = (event: PointerEvent) => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const x = (event.clientX / window.innerWidth - 0.5) * 12
        const y = (event.clientY / window.innerHeight - 0.5) * 8
        layer.style.setProperty('--pointer-x', `${x}px`)
        layer.style.setProperty('--pointer-y', `${y}px`)
      })
    }

    window.addEventListener('pointermove', move, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', move)
    }
  }, [])

  return (
    <div className="motion-layer" ref={layerRef} aria-hidden="true">
      <svg className="signal-map" viewBox="0 0 1440 900" preserveAspectRatio="none">
        <path className="signal-path signal-blue" d="M-40 710 C 180 610, 270 790, 470 635 S 780 380, 1010 470 S 1260 630, 1510 345" />
        <path className="signal-path signal-green" d="M50 230 C 310 360, 360 170, 590 275 S 870 520, 1110 330 S 1300 190, 1480 240" />
        <path className="signal-path signal-yellow" d="M-50 460 C 150 500, 270 400, 430 470 S 720 690, 930 620 S 1190 450, 1490 560" />
        <path className="signal-path signal-red" d="M120 850 C 330 690, 510 830, 675 720 S 1010 540, 1460 690" />
      </svg>
    </div>
  )
}
