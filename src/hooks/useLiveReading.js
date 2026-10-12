// hooks/useLiveReading.js
import { useState, useEffect, useRef } from 'react'
import { getLatestReading } from '../api.js'

/**
 * Polls getLatestReading every 3 s and returns the current reading + previous.
 */
export function useLiveReading() {
  const [reading, setReading]   = useState(null)
  const [prev, setPrev]         = useState(null)
  const [loading, setLoading]   = useState(true)
  const timer = useRef(null)

  const fetch = async () => {
    const r = await getLatestReading()
    setReading(cur => { setPrev(cur); return r })
    setLoading(false)
  }

  useEffect(() => {
    fetch()
    timer.current = setInterval(fetch, 3000)
    return () => clearInterval(timer.current)
  }, [])

  return { reading, prev, loading }
}
