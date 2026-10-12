// components/LiveDataCard.jsx
// Floating top-right sensor card that shows a live reading value from the API.

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Droplets } from 'lucide-react'
import { useLiveReading } from '../hooks/useLiveReading.js'

const METRICS = [
  { key: 'ph',        label: 'pH Level',     unit: '',     icon: Droplets, decimals: 2 },
  { key: 'tds',       label: 'TDS',          unit: 'ppm',  icon: Droplets, decimals: 0 },
  { key: 'turbidity', label: 'Turbidity',    unit: 'NTU',  icon: Droplets, decimals: 1 },
]

export default function LiveDataCard() {
  const { reading, loading } = useLiveReading()
  const [metricIdx, setMetricIdx] = useState(0)

  // Cycle through metrics every 4s
  useEffect(() => {
    const t = setInterval(() => setMetricIdx(i => (i + 1) % METRICS.length), 4000)
    return () => clearInterval(t)
  }, [])

  const metric = METRICS[metricIdx]
  const value  = reading ? reading[metric.key] : null
  const Icon   = metric.icon

  return (
    <motion.div
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      className="relative rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.07)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        border: '1px solid rgba(255,255,255,0.1)',
        width: 156,
        padding: '14px 16px 16px',
      }}
    >
      {/* Top row */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-medium text-[#8a8a93] uppercase tracking-widest">
          {metric.label}
        </span>
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(124,58,237,0.25)' }}
        >
          <Icon size={12} color="#c6f432" />
        </div>
      </div>

      {/* Value */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${metricIdx}-${value}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.35 }}
        >
          {loading || value === null ? (
            <div className="h-8 w-20 rounded animate-pulse bg-white/10" />
          ) : (
            <span className="block text-white font-bold" style={{ fontSize: 28, lineHeight: 1.1 }}>
              {typeof value === 'number'
                ? value.toFixed(metric.decimals)
                : value}
              <span className="text-[#8a8a93] text-[13px] font-normal ml-1">
                {metric.unit}
              </span>
            </span>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Live dot */}
      <div className="flex items-center gap-1.5 mt-3">
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: '#c6f432', boxShadow: '0 0 6px #c6f432' }}
        />
        <span className="text-[10px] text-[#8a8a93]">
          {reading?.sample ?? 'Loading…'}
        </span>
      </div>

      {/* Faint diagonal slash – decorative */}
      <div
        className="absolute top-3 right-3 w-3 h-[1px] rotate-45"
        style={{ background: 'rgba(255,255,255,0.25)' }}
      />
    </motion.div>
  )
}
