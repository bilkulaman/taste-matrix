// hooks/useLiveReading.js
import { useState, useEffect, useRef } from 'react'
import { getLatestReading } from '../api.js'

/**
 * Returns latest reading and allows on-demand fetch without duplicate background intervals.
 */
export function useLiveReading(sampleId) {
  const [reading, setReading]   = useState(null)
  const [prev, setPrev]         = useState(null)
  const [loading, setLoading]   = useState(true)

  const fetchReading = async (sampleOverride) => {
    const r = await getLatestReading(sampleOverride || sampleId)
    setReading(cur => { setPrev(cur); return r })
    setLoading(false)
    return r
  }

  useEffect(() => {
    fetchReading(sampleId)
  }, [sampleId])

  return { reading, prev, loading, fetchReading }
}
