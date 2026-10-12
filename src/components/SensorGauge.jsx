// components/SensorGauge.jsx
// Arc-style gauge for pH / TDS / turbidity with animated fill and live delta.

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const CONFIGS = {
  ph:        { min: 0,    max: 14,    unit: '',    label: 'pH',        warn: v => v < 4 || v > 10 },
  tds:       { min: 0,    max: 6000,  unit: 'ppm', label: 'TDS',       warn: v => v > 5000 },
  turbidity: { min: 0,    max: 100,   unit: 'NTU', label: 'Turbidity', warn: v => v > 50 },
}

function ArcPath({ pct, warn }) {
  const R = 52
  const cx = 64, cy = 72
  // arc spans 220° (–110° to +110° from bottom-center)
  const startAngle = -200 * Math.PI / 180
  const sweep      = 220 * Math.PI / 180
  const endAngle   = startAngle + sweep

  function polarToXY(angle) {
    return {
      x: cx + R * Math.cos(angle),
      y: cy + R * Math.sin(angle),
    }
  }

  const s = polarToXY(startAngle)
  const e = polarToXY(endAngle)
  const trackPath = `M ${s.x} ${s.y} A ${R} ${R} 0 1 1 ${e.x} ${e.y}`

  const fillAngle = startAngle + sweep * Math.min(pct, 1)
  const f = polarToXY(fillAngle)
  const largeArc = (sweep * pct) > Math.PI ? 1 : 0
  const fillPath = `M ${s.x} ${s.y} A ${R} ${R} 0 ${largeArc} 1 ${f.x} ${f.y}`

  return (
    <svg viewBox="0 0 128 90" className="w-full" aria-hidden="true">
      {/* Track */}
      <path d={trackPath} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="7" strokeLinecap="round" />
      {/* Fill */}
      <motion.path
        d={fillPath}
        fill="none"
        stroke={warn ? '#f43f5e' : '#c6f432'}
        strokeWidth="7"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
    </svg>
  )
}

export default function SensorGauge({ metric, value, prevValue, accentOverride }) {
  const cfg = CONFIGS[metric]
  if (!cfg) return null

  const pct   = (value - cfg.min) / (cfg.max - cfg.min)
  const delta = prevValue !== undefined ? value - prevValue : 0
  const warn  = cfg.warn(value)
  const accent = warn ? '#f43f5e' : (accentOverride ?? '#c6f432')

  return (
    <div
      className="relative flex flex-col items-center rounded-2xl p-4 pt-5"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      {/* Label */}
      <span className="text-[11px] font-medium text-[#8a8a93] uppercase tracking-widest mb-1">
        {cfg.label}
      </span>

      {/* Arc */}
      <div className="relative w-full" style={{ maxWidth: 128 }}>
        <ArcPath pct={pct} warn={warn} />

        {/* Centre value */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-2 pointer-events-none">
          <AnimatePresence mode="wait">
            <motion.span
              key={Math.round(value * 100)}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.3 }}
              className="font-bold leading-none"
              style={{ fontSize: 22, color: accent }}
            >
              {metric === 'ph' ? value.toFixed(2)
               : metric === 'turbidity' ? value.toFixed(1)
               : Math.round(value)}
            </motion.span>
          </AnimatePresence>
          <span className="text-[10px] text-[#8a8a93] mt-0.5">{cfg.unit || 'pH'}</span>
        </div>
      </div>

      {/* Delta */}
      <div className="mt-1 flex items-center gap-1">
        <span
          className="text-[11px] font-medium"
          style={{ color: Math.abs(delta) < 0.001 ? '#8a8a93' : delta > 0 ? '#4ade80' : '#f87171' }}
        >
          {delta > 0.001 ? `+${delta.toFixed(metric === 'tds' ? 0 : 2)}`
           : delta < -0.001 ? delta.toFixed(metric === 'tds' ? 0 : 2)
           : '—'}
        </span>
        <span className="text-[10px] text-[#8a8a93]">vs prev</span>
      </div>
    </div>
  )
}
