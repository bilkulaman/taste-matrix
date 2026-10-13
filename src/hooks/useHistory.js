// hooks/useHistory.js
import { useState, useEffect, useCallback, useRef } from 'react'
import { getHistory, toSampleName } from '../api.js'
import { getStaticMockHistory } from '../mockData.js'

/**
 * Fetches reading history with search, sample filtering, date range, and pagination.
 * If backend fails: keeps last real data, never generates fake values, marks unreachable/isDemo.
 */
export function useHistory({
  sample,
  sampleId,
  from,
  to,
  limit = 80,
  offset = 0,
  order = 'desc',
} = {}) {
  const [data, setData]       = useState([])
  const [total, setTotal]     = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [isDemo, setIsDemo]   = useState(false)

  const hasRespondedRef = useRef(false)

  const fetchHistory = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getHistory({
        sample,
        sampleId,
        from,
        to,
        limit,
        offset,
        order,
      })

      hasRespondedRef.current = true
      setData(res.data)
      setTotal(res.total)
      setIsDemo(false)
      setError(null)
    } catch (err) {
      setError('Backend unreachable')
      // If backend has never responded, use static mock data as static "Demo data" fallback
      if (!hasRespondedRef.current) {
        const targetSample = sample || (sampleId ? toSampleName(sampleId) : 'haldi-water')
        const mock = getStaticMockHistory(targetSample)
        setData(mock)
        setTotal(mock.length)
        setIsDemo(true)
      }
      // If backend previously responded, keep last real data intact! Never overwrite with mock!
    } finally {
      setLoading(false)
    }
  }, [sample, sampleId, from, to, limit, offset, order])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  return {
    data,
    total,
    loading,
    error,
    isDemo,
    refetch: fetchHistory,
  }
}
