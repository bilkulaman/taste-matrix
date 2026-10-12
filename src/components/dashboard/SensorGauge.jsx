// src/components/dashboard/SensorGauge.jsx
// Arc gauge filling ~70% of card height.
// Number and unit are mathematically centered at (CX, CY) of the arc circle
// with translate(-50%, -50%), tabular numerals, unit directly below, identical spacing across all gauges.
// Flawless TDS arc calculation supporting 0 to 6000+ ppm.
// Supports light & dark theme tokens.

import { useState, useId } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus, Maximize2 } from 'lucide-react'
import { PillCard } from '../ui/index.js'

const CONFIG = {
  ph: {
    label: 'pH Level',
    unit: 'pH',
    decimals: 2,
    min: 0,
    max: 14,
    safeMin: 6.0,
    safeMax: 8.5,
    gradientFrom: '#818cf8',
    gradientTo: '#c6f432',
    description: 'Hydrogen-ion concentration & acid-alkali balance',
  },
  tds: {
    label: 'Total Dissolved Solids',
    unit: 'ppm',
    decimals: 0,
    min: 0,
    max: 6000,
    safeMin: 0,
    safeMax: 600,
    gradientFrom: '#38bdf8',
    gradientTo: '#c6f432',
    description: 'Ionic salt & mineral concentration index',
  },
  turbidity: {
    label: 'Turbidity Index',
    unit: 'NTU',
    decimals: 1,
    min: 0,
    max: 100,
    safeMin: 0,
    safeMax: 20,
    gradientFrom: '#f59e0b',
    gradientTo: '#c6f432',
    description: 'Curcumin suspension & particulate light scattering',
  },
}

function clamp(v, min, max) {
  return Math.min(Math.max(v, min), max)
}

function polarToCartesian(cx, cy, r, angleInDegrees) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0
  return {
    x: cx + r * Math.cos(angleInRadians),
    y: cy + r * Math.sin(angleInRadians),
  }
}

function describeArc(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, endAngle)
  const end = polarToCartesian(cx, cy, r, startAngle)
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1'
  return [
    'M', start.x, start.y,
    'A', r, r, 0, largeArcFlag, 0, end.x, end.y,
  ].join(' ')
}

export function SensorGauge({ metric, value, prevValue, history = [] }) {
  const cfg = CONFIG[metric] || CONFIG.ph
  const gradId = useId()
  const [showModal, setShowModal] = useState(false)

  // Geometric coordinates of the arc circle
  const SIZE_W = 200
  const SIZE_H = 150
  const CX = 100
  const CY = 85
  const R = 68
  const START_DEG = -140
  const END_DEG = 140
  const TOTAL_DEG = 280

  const totalArcLength = (TOTAL_DEG / 360) * (2 * Math.PI * R)

  const rawVal = Number(value ?? 0)
  const safeVal = isNaN(rawVal) ? 0 : rawVal
  const normalizedPct = clamp((safeVal - cfg.min) / (cfg.max - cfg.min), 0, 1)
  const strokeOffset = totalArcLength * (1 - normalizedPct)

  const trend =
    prevValue != null
      ? safeVal > prevValue + 0.01
        ? 'up'
        : safeVal < prevValue - 0.01
        ? 'down'
        : 'flat'
      : 'flat'
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus
  const inSafe = safeVal >= cfg.safeMin && safeVal <= cfg.safeMax

  const validHistory = history.filter((h) => typeof h === 'number' && !isNaN(h))
  const stats =
    validHistory.length > 0
      ? {
          min: Math.min(...validHistory, safeVal),
          max: Math.max(...validHistory, safeVal),
          avg: validHistory.reduce((a, b) => a + b, 0) / validHistory.length,
        }
      : { min: safeVal, max: safeVal, avg: safeVal }

  const formatNumber = (num) => {
    if (cfg.decimals === 0) return Math.round(num).toLocaleString()
    return num.toFixed(cfg.decimals)
  }

  const trackPath = describeArc(CX, CY, R, START_DEG, END_DEG)

  return (
    <>
      <PillCard
        onClick={() => setShowModal(true)}
        className="relative p-5 flex flex-col items-center justify-between select-none group transition-all"
        style={{
          minHeight: 250,
        }}
        role="button"
        tabIndex={0}
        aria-label={`${cfg.label}: ${formatNumber(safeVal)} ${cfg.unit}`}
      >
        {/* Top Header Row inside Card */}
        <div className="w-full flex items-center justify-between mb-1 z-10">
          <div className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: inSafe ? 'var(--tm-lime)' : '#f87171' }}
            />
            <span className="text-[13px] font-semibold text-[var(--tm-text-primary)] tracking-tight">
              {cfg.label}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span
              className="text-[10px] px-2 py-0.5 rounded-full font-medium"
              style={{
                background: inSafe ? 'var(--tm-lime-dim)' : 'rgba(248,113,113,0.12)',
                color: inSafe ? 'var(--tm-lime)' : '#f87171',
                border: `1px solid ${inSafe ? 'var(--tm-lime-border)' : 'rgba(248,113,113,0.25)'}`,
              }}
            >
              {inSafe ? 'Nominal' : 'Alert'}
            </span>
            <Maximize2 size={12} className="text-[var(--tm-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* Big Arc Gauge Filling ~70% of Card Height */}
        <div className="relative w-full flex items-center justify-center my-auto">
          <svg
            width={SIZE_W}
            height={SIZE_H}
            viewBox={`0 0 ${SIZE_W} ${SIZE_H}`}
            className="overflow-visible"
          >
            <defs>
              <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={cfg.gradientFrom} />
                <stop offset="100%" stopColor={cfg.gradientTo} />
              </linearGradient>
            </defs>

            {/* Background Track */}
            <path
              d={trackPath}
              fill="none"
              stroke="var(--tm-track-stroke, rgba(255, 255, 255, 0.08))"
              strokeWidth={11}
              strokeLinecap="round"
            />

            {/* Active Filled Arc (Dasharray renders all values smoothly) */}
            <motion.path
              d={trackPath}
              fill="none"
              stroke={`url(#${gradId})`}
              strokeWidth={11}
              strokeLinecap="round"
              strokeDasharray={totalArcLength}
              animate={{ strokeDashoffset: strokeOffset }}
              transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
            />
          </svg>

          {/* Centered Readout: Mathematically Centered at (CX, CY) of the Arc Circle */}
          <div
            className="absolute flex flex-col items-center justify-center pointer-events-none"
            style={{
              left: `${(CX / SIZE_W) * 100}%`,
              top: `${(CY / SIZE_H) * 100}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <motion.span
              key={safeVal}
              initial={{ scale: 0.96, opacity: 0.85 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="text-[44px] font-semibold text-[var(--tm-text-primary)] leading-none tracking-tight tabular-nums font-mono text-center"
              style={{
                textShadow: '0 2px 10px rgba(0,0,0,0.3)',
              }}
            >
              {formatNumber(safeVal)}
            </motion.span>
            <span className="text-[11px] text-[var(--tm-text-muted)] font-medium tracking-widest uppercase leading-none mt-1.5 text-center">
              {cfg.unit || 'Index'}
            </span>
          </div>
        </div>

        {/* Footer Row: Min / Avg / Max as mini nested pills */}
        <div className="w-full flex items-center justify-between gap-2 mt-2 pt-2 border-t border-[var(--tm-subtle-border)]">
          <div className="flex-1 flex items-center justify-center gap-1 py-1 px-1.5 rounded-xl bg-[var(--tm-subtle-bg)] border border-[var(--tm-subtle-border)] text-[10px] text-[var(--tm-text-muted)]">
            <span>Min</span>
            <span className="text-[var(--tm-text-primary)] font-mono font-medium">
              {formatNumber(stats.min)}
            </span>
          </div>

          <div className="flex-1 flex items-center justify-center gap-1 py-1 px-1.5 rounded-xl bg-[var(--tm-subtle-bg)] border border-[var(--tm-subtle-border)] text-[10px] text-[var(--tm-text-muted)]">
            <span>Avg</span>
            <span className="text-[var(--tm-text-primary)] font-mono font-medium">
              {formatNumber(stats.avg)}
            </span>
          </div>

          <div className="flex-1 flex items-center justify-center gap-1 py-1 px-1.5 rounded-xl bg-[var(--tm-subtle-bg)] border border-[var(--tm-subtle-border)] text-[10px] text-[var(--tm-text-muted)]">
            <span>Max</span>
            <span className="text-[var(--tm-text-primary)] font-mono font-medium">
              {formatNumber(stats.max)}
            </span>
          </div>
        </div>
      </PillCard>

      {/* ── Detail Modal ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(16px)' }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.94, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              transition={{ type: 'spring', damping: 28, stiffness: 360 }}
              className="relative rounded-3xl p-7 max-w-md w-full shadow-2xl"
              style={{
                background: 'var(--tm-panel-bg, rgba(15,15,22,0.98))',
                border: '1px solid var(--tm-panel-border)',
                backdropFilter: 'blur(24px)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[20px] font-semibold text-[var(--tm-text-primary)] tracking-tight">
                  {cfg.label} Diagnostics
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full text-[var(--tm-text-muted)] hover:text-[var(--tm-text-primary)] hover:bg-[var(--tm-subtle-bg)] transition-colors"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              <p className="text-[13px] text-[var(--tm-text-muted)] mb-6 leading-relaxed">
                {cfg.description}
              </p>

              <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-[var(--tm-subtle-bg)] border border-[var(--tm-subtle-border)] mb-5">
                <div className="text-[52px] font-semibold text-[var(--tm-text-primary)] font-mono leading-none">
                  {formatNumber(safeVal)}
                  <span className="text-[18px] text-[var(--tm-text-muted)] font-sans ml-2">{cfg.unit}</span>
                </div>
                <div className="flex items-center gap-2 mt-3 text-[12px]">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: inSafe ? 'var(--tm-lime)' : '#f87171' }} />
                  <span className="text-[var(--tm-text-muted)]">
                    Ayurvedic baseline: {cfg.safeMin} – {cfg.safeMax} {cfg.unit}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  ['Minimum', formatNumber(stats.min)],
                  ['Mean Avg', formatNumber(stats.avg)],
                  ['Maximum', formatNumber(stats.max)],
                ].map(([lbl, val]) => (
                  <div key={lbl} className="text-center rounded-2xl p-3 bg-[var(--tm-subtle-bg)] border border-[var(--tm-subtle-border)]">
                    <div className="text-[11px] text-[var(--tm-text-muted)] mb-1">{lbl}</div>
                    <div className="text-[16px] font-bold text-[var(--tm-text-primary)] font-mono">{val}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
export default SensorGauge
