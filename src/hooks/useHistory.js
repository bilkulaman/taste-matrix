// hooks/useHistory.js
import { useState, useEffect } from 'react'
import { getHistory } from '../api.js'

/**
 * Fetches reading history with optional auto-refresh.
 * @param {{ limit?: number, offset?: number, refreshMs?: number }} opts
 */
export function useHistory({ limit = 30, offset = 0, refreshMs = 0 } = {}) {
  const [data, setData]     = useState([])
  const [total, setTotal]   = useState(0)
  const [loading, setLoading] = useState(true)

  const fetch = async () => {
    const res = await getHistory({ limit, offset })
    setData(res.data)
    setTotal(res.total)
    setLoading(false)
  }

  useEffect(() => {
    fetch()
    if (refreshMs > 0) {
      const t = setInterval(fetch, refreshMs)
      return () => clearInterval(t)
    }
  }, [limit, offset])

  return { data, total, loading, refetch: fetch }
}
