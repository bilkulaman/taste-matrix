import { useState, useEffect } from 'react'
import { getDeviceStatus } from '../api.js'

export function useDeviceStatus({ refreshMs = 3000 } = {}) {
  const [status, setStatus] = useState({ online: false, last_seen: null, device_id: null, rssi: null })
  const [loading, setLoading] = useState(true)

  const check = async () => {
    try {
      const res = await getDeviceStatus()
      setStatus(res)
    } catch {
      setStatus({ online: false, last_seen: null, device_id: null, rssi: null })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    check()
    if (refreshMs > 0) {
      const t = setInterval(check, refreshMs)
      return () => clearInterval(t)
    }
  }, [refreshMs])

  return { ...status, loading, refresh: check }
}
