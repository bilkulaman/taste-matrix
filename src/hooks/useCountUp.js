// hooks/useCountUp.js
import { useEffect, useRef, useState } from 'react'

/**
 * Counts from 0 to `target` over `duration` ms once `trigger` is true.
 * @param {number} target
 * @param {number} duration  ms
 * @param {boolean} trigger  start counting when true
 * @param {number} decimals  decimal places
 */
export function useCountUp(target, duration = 1200, trigger = true, decimals = 0) {
  const [value, setValue] = useState(0)
  const frame = useRef(null)

  useEffect(() => {
    if (!trigger) return
    const start = performance.now()
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1)
      const ease = 1 - Math.pow(1 - p, 3) // easeOutCubic
      setValue(parseFloat((ease * target).toFixed(decimals)))
      if (p < 1) frame.current = requestAnimationFrame(step)
    }
    frame.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame.current)
  }, [target, duration, trigger, decimals])

  return value
}
