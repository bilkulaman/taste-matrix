// src/components/ui/StatCard.jsx
import { useEffect, useState } from 'react'

export function StatCard({
  label,
  value,
  unit = '',
  decimals = 0,
  animate = true,
  icon: Icon,
  className = '',
  style = {},
}) {
  const [displayVal, setDisplayVal] = useState(animate ? 0 : value)

  useEffect(() => {
    if (!animate || typeof value !== 'number') {
      setDisplayVal(value)
      return
    }

    const start = performance.now()
    const target = value
    let frameId

    const tick = (now) => {
      const elapsed = Math.min((now - start) / 1200, 1)
      const ease = 1 - Math.pow(1 - elapsed, 3) // easeOutCubic
      const current = ease * target
      setDisplayVal(decimals > 0 ? parseFloat(current.toFixed(decimals)) : Math.round(current))

      if (elapsed < 1) {
        frameId = requestAnimationFrame(tick)
      }
    }

    frameId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameId)
  }, [value, animate, decimals])

  return (
    <div
      className={`rounded-2xl p-5 flex flex-col justify-between ${className}`}
      style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        ...style,
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-medium text-[#8a8a93] uppercase tracking-widest font-mono">
          {label}
        </span>
        {Icon && (
          <div
            className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(124, 58, 237, 0.15)', border: '1px solid rgba(124, 58, 237, 0.3)' }}
          >
            <Icon size={13} className="text-[#c6f432]" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-1.5 mt-auto">
        <span className="text-[32px] font-bold text-white tracking-tight leading-none">
          {displayVal}
        </span>
        {unit && (
          <span className="text-[13px] text-[#8a8a93] font-medium">{unit}</span>
        )}
      </div>
    </div>
  )
}
