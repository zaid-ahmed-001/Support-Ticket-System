'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

export function usePolling(intervalMs: number, callback?: () => void) {
  const router = useRouter()
  const savedCallback = useRef(callback)

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    const tick = () => {
      if (savedCallback.current) {
        // If a custom fetch function is provided, run it (Client State update)
        savedCallback.current()
      } else {
        // Otherwise, do a standard Server Component refresh
        router.refresh()
      }
    }

    if (intervalMs !== null) {
      const id = setInterval(tick, intervalMs)
      return () => clearInterval(id)
    }
  }, [intervalMs, router])
}