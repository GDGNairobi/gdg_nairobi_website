'use client'

import { useCallback, useSyncExternalStore } from 'react'

const currentSecond = () => Math.floor(Date.now() / 1000)

export function useCountdownClock(stopAt: number, enabled = true) {
  const subscribe = useCallback(
    (notify: () => void) => {
      if (!enabled || !Number.isFinite(stopAt) || Date.now() >= stopAt) return () => {}
      const timer = window.setInterval(() => {
        notify()
        if (Date.now() >= stopAt) window.clearInterval(timer)
      }, 1000)
      return () => window.clearInterval(timer)
    },
    [stopAt, enabled],
  )
  // Match the server and hydration snapshot before reading the visitor's clock.
  return useSyncExternalStore(subscribe, currentSecond, () => null)
}
