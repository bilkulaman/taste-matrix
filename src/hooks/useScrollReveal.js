// hooks/useScrollReveal.js
import { useEffect, useRef, useState } from 'react'

/**
 * Returns a ref and a boolean `inView` – true once the element enters the viewport.
 * Respects prefers-reduced-motion (returns inView=true immediately).
 */
export function useScrollReveal(threshold = 0.15) {
  const ref = useRef(null)
  const prefersReduced = useRef(
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
  const [inView, setInView] = useState(prefersReduced.current)

  useEffect(() => {
    if (prefersReduced.current) return
    const el = ref.current
    if (!el) return

    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect() } },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])

  return { ref, inView }
}
