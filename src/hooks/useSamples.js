// hooks/useSamples.js
import { useState, useEffect } from 'react'
import { getSamples } from '../api.js'

export function useSamples() {
  const [samples, setSamples] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSamples().then(s => { setSamples(s); setLoading(false) })
  }, [])

  return { samples, loading }
}
