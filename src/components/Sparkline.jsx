// components/Sparkline.jsx
// Tiny SVG line chart for a single metric history.

import { useMemo } from 'react'
import { motion } from 'framer-motion'

export default function Sparkline({ values = [], color = '#c6f432', height = 40, width = 120 }) {
  const path = useMemo(() => {
    if (values.length < 2) return ''
    const min = Math.min(...values)
    const max = Math.max(...values)
    const range = max - min || 1
    const step = width / (values.length - 1)
    return values.map((v, i) => {
      const x = i * step
      const y = height - ((v - min) / range) * (height - 6) - 3
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`
    }).join(' ')
  }, [values, width, height])

  const areaPath = path ? `${path} L ${width} ${height} L 0 ${height} Z` : ''

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      style={{ width: '100%', height, display: 'block', overflow: 'visible' }}
      aria-hidden="true"
    >
      {/* Area fill */}
      {areaPath && (
        <defs>
          <linearGradient id={`sg-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.18" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
      )}
      {areaPath && (
        <path
          d={areaPath}
          fill={`url(#sg-${color.replace('#', '')})`}
        />
      )}
      {/* Line */}
      {path && (
        <motion.path
          d={path}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        />
      )}
    </svg>
  )
}
