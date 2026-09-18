'use client'

import { useEffect, useRef } from 'react'
import {
  siAndroid,
  siFirebase,
  siFlutter,
  siGooglechrome,
  siGooglecloud,
  siGooglegemini,
  siGooglemaps,
  siTensorflow,
} from 'simple-icons'

const products = [
  { icon: siGooglechrome, key: 'chrome', label: 'Chrome / Web' },
  { icon: siAndroid, key: 'android', label: 'Android' },
  { icon: siFirebase, key: 'firebase', label: 'Firebase' },
  { icon: siGooglemaps, key: 'maps', label: 'Maps Platform' },
  { icon: siGooglecloud, key: 'cloud', label: 'Google Cloud' },
  { icon: siGooglegemini, key: 'gemini', label: 'Gemini' },
  { icon: siFlutter, key: 'flutter', label: 'Flutter' },
  { icon: siTensorflow, key: 'tensorflow', label: 'TensorFlow' },
] as const

export function HeroProducts() {
  const layerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const layer = layerRef.current
    const hero = layer?.closest<HTMLElement>('.hero')
    if (!layer || !hero || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const anchors = Array.from(layer.querySelectorAll<HTMLElement>('.product-anchor'))
    let frame = 0

    const reset = () => anchors.forEach((anchor) => { anchor.style.transform = 'translate3d(0, 0, 0)' })
    const move = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const heroRect = hero.getBoundingClientRect()
        const insideHero = event.clientX >= heroRect.left && event.clientX <= heroRect.right && event.clientY >= heroRect.top && event.clientY <= heroRect.bottom
        if (!insideHero) {
          reset()
          return
        }

        anchors.forEach((anchor) => {
          const centerX = heroRect.left + anchor.offsetLeft + anchor.offsetWidth / 2
          const centerY = heroRect.top + anchor.offsetTop + anchor.offsetHeight / 2
          const deltaX = centerX - event.clientX
          const deltaY = centerY - event.clientY
          const distance = Math.hypot(deltaX, deltaY)
          const radius = 180

          if (distance >= radius) {
            anchor.style.transform = 'translate3d(0, 0, 0)'
            return
          }

          const directionX = distance > 1 ? deltaX / distance : 1
          const directionY = distance > 1 ? deltaY / distance : 0
          const force = Math.pow(1 - distance / radius, 1.35) * 78
          anchor.style.transform = `translate3d(${directionX * force}px, ${directionY * force}px, 0)`
        })
      })
    }

    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('blur', reset)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('blur', reset)
    }
  }, [])

  return (
    <div className="hero-products" ref={layerRef} aria-hidden="true">
      {products.map((product) => (
        <span className={`product-anchor product-anchor-${product.key}`} key={product.key}>
          <span className={`product-chip product-chip-${product.key}`}>
            <svg viewBox="0 0 24 24" style={{ color: `#${product.icon.hex}` }}><path d={product.icon.path} fill="currentColor" /></svg>
            {product.label}
          </span>
        </span>
      ))}
    </div>
  )
}
