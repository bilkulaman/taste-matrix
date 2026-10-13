// src/hooks/useLiveReadings.js
// Single unified hook serving as the sole data source for the TasteMatrix Dashboard.
// Fetches history(sample, 30) on mount / sample change, polls latest every 3s,
// appends only new IDs keeping at most 30 items, and queries GET /readings?limit=5 for recent assays.

import { useState, useEffect, useRef, useCallback } from 'react'
import { getLatestReading, getHistory, getRecentReadings } from '../api.js'
import { getStaticMockHistory, getStaticMockRecent } from '../mockData.js'

export function useLiveReadings(sample) {
  const [buffer, setBuffer] = useState([]) // Chronological: oldest -> newest (up to 30 items)
  const [latest, setLatest] = useState(null)
  const [prev, setPrev] = useState(null)
  const [recentAssays, setRecentAssays] = useState([])
  const [status, setStatus] = useState({
    online: false,
    unreachable: false,
    isDemo: false,
    pollCount: 0,
    lastUrl: '',
    lastTimestamp: null,
  })

  const sampleRef = useRef(sample)
  sampleRef.current = sample

  const pollCountRef = useRef(0)
  const hasRespondedRef = useRef(false)

  const poll = useCallback(async (isCancelledFn) => {
    const curSample = sampleRef.current
    try {
      const [newReading, recentList] = await Promise.all([
        getLatestReading(curSample),
        getRecentReadings(5),
      ])

      if (isCancelledFn && isCancelledFn()) return

      hasRespondedRef.current = true

      // Online check: under 10 seconds old
      const now = Date.now()
      const ageSec = newReading?.timestamp ? (now - new Date(newReading.timestamp).getTime()) / 1000 : 999
      const isOnline = Boolean(ageSec >= 0 && ageSec < 10)

      pollCountRef.current += 1

      setLatest(cur => {
        setPrev(cur)
        return newReading
      })

      setRecentAssays(recentList)

      setBuffer(prevBuf => {
        // If empty, demo data, or different sample, seed with newReading
        if (!prevBuf.length || prevBuf[0]?.isDemo || prevBuf[0]?.sampleId !== newReading.sampleId) {
          return [newReading]
        }
        // Avoid duplicate insertion if same ID or exact same timestamp
        const lastItem = prevBuf[prevBuf.length - 1]
        if (lastItem && (lastItem.id === newReading.id || lastItem.timestamp === newReading.timestamp)) {
          return prevBuf
        }
        const next = [...prevBuf, newReading]
        return next.slice(-30)
      })

      setStatus({
        online: isOnline,
        unreachable: false,
        isDemo: false,
        pollCount: pollCountRef.current,
        lastUrl: newReading.url || `/readings/latest?sample=${curSample}`,
        lastTimestamp: newReading.timestamp,
      })
    } catch {
      if (isCancelledFn && isCancelledFn()) return
      // Freeze last real values! Do not touch latest, prev, buffer, or recentAssays!
      setStatus(s => ({
        ...s,
        online: false,
        unreachable: true,
      }))
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    const isCancelled = () => cancelled

    // Reset buffer on sample switch
    setBuffer([])
    setLatest(null)
    setPrev(null)

    // Initial load: Fetch 30-reading chronological history + 5 recent assays
    async function init() {
      try {
        const [historyRes, recentList, firstReading] = await Promise.all([
          getHistory({ sampleId: sample, limit: 30, order: 'desc' }),
          getRecentReadings(5),
          getLatestReading(sample),
        ])

        if (isCancelled()) return

        hasRespondedRef.current = true

        const initialBuffer = historyRes.chronological || []
        setBuffer(initialBuffer)
        setRecentAssays(recentList)

        const activeLatest = firstReading || (initialBuffer.length > 0 ? initialBuffer[initialBuffer.length - 1] : null)
        const activePrev = initialBuffer.length > 1 ? initialBuffer[initialBuffer.length - 2] : null

        if (activeLatest) {
          setLatest(activeLatest)
          setPrev(activePrev)

          const now = Date.now()
          const ageSec = activeLatest.timestamp ? (now - new Date(activeLatest.timestamp).getTime()) / 1000 : 999
          const isOnline = Boolean(ageSec >= 0 && ageSec < 10)

          pollCountRef.current += 1
          setStatus({
            online: isOnline,
            unreachable: false,
            isDemo: false,
            pollCount: pollCountRef.current,
            lastUrl: activeLatest.url || `/readings/latest?sample=${sample}`,
            lastTimestamp: activeLatest.timestamp,
          })
        }
      } catch {
        if (isCancelled()) return
        // If backend has never responded, use static mock data as static "Demo data" fallback
        if (!hasRespondedRef.current) {
          const staticHistory = getStaticMockHistory(sample)
          const staticRecent = getStaticMockRecent(5)
          const staticLatest = staticHistory[staticHistory.length - 1]
          const staticPrev = staticHistory.length > 1 ? staticHistory[staticHistory.length - 2] : null

          setBuffer(staticHistory)
          setRecentAssays(staticRecent)
          setLatest(staticLatest)
          setPrev(staticPrev)

          setStatus({
            online: false,
            unreachable: true,
            isDemo: true,
            pollCount: 0,
            lastUrl: '',
            lastTimestamp: staticLatest?.timestamp || null,
          })
        } else {
          // Keep last real values frozen
          setStatus(s => ({
            ...s,
            online: false,
            unreachable: true,
          }))
        }
      }
    }

    init()

    // 3s interval polling
    const timer = setInterval(() => {
      poll(isCancelled)
    }, 3000)

    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [sample, poll])

  const refetch = useCallback(() => {
    poll(() => false)
  }, [poll])

  return {
    latest,
    prev,
    buffer,
    recentAssays,
    status,
    refetch,
  }
}
