// src/components/dashboard/RecentTestsList.jsx
// Last 5 tests list with click-to-load, hover preview popover, nested inside a PillCard.
// Fully supports light & dark theme CSS variables.

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, ChevronRight } from 'lucide-react'
import { PillCard } from '../ui/index.js'

const RASA_COLORS = {
  Madhura: '#c6f432', Lavana: '#38bdf8', Amla: '#fb923c',
  Tikta: '#818cf8', Katu: '#f43f5e', Kashaya: '#a78bfa',
  Anabhilashita: '#60a5fa',
}

function timeAgo(iso) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  if (diff < 60) return `${Math.round(diff)}s ago`
  if (diff < 3600) return `${Math.round(diff / 60)}m ago`
  return `${Math.round(diff / 3600)}h ago`
}

function Popover({ reading }) {
  if (!reading) return null
  return (
    <motion.div
      initial={{ opacity: 0, x: 8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 6 }}
      transition={{ duration: 0.15 }}
      className="absolute right-full top-0 mr-2 z-40 rounded-2xl px-3.5 py-2.5 min-w-[170px] shadow-2xl"
      style={{
        background: 'var(--tm-tooltip-bg, rgba(12, 12, 18, 0.98))',
        border: '1px solid var(--tm-border-card, rgba(255, 255, 255, 0.12))',
        backdropFilter: 'blur(16px)',
      }}
    >
      <p className="text-[12px] font-semibold text-[var(--tm-text-primary)] mb-2">{reading.sample}</p>
      {[
        ['pH Level', reading.ph?.toFixed(2)],
        ['TDS Salinity', `${reading.tds} ppm`],
        ['Turbidity', `${reading.turbidity?.toFixed(1)} NTU`],
      ].map(([label, val]) => (
        <div key={label} className="flex justify-between text-[11px] leading-5">
          <span className="text-[var(--tm-text-muted)]">{label}</span>
          <span className="text-[var(--tm-text-primary)] font-mono font-medium tabular-nums">{val}</span>
        </div>
      ))}
    </motion.div>
  )
}

export function RecentTestsList({ history = [], onSelect, selectedId }) {
  const [hoveredId, setHoveredId] = useState(null)
  const recent = history.slice(0, 5)

  return (
    <PillCard className="p-4 flex flex-col gap-1.5">
      <div className="flex items-center justify-between mb-1 px-1">
        <div className="flex items-center gap-2">
          <Clock size={13} color="var(--tm-text-muted)" />
          <span className="text-[13px] font-semibold text-[var(--tm-text-primary)] tracking-tight">
            Recent Assays
          </span>
        </div>
        <span className="text-[10px] text-[var(--tm-text-muted)] font-mono">5 newest</span>
      </div>

      {recent.length === 0 ? (
        <div className="text-center text-[12px] text-[var(--tm-text-muted)] py-4 italic">
          No assay history found
        </div>
      ) : (
        recent.map((r, i) => {
          const color = RASA_COLORS[r.predictedTaste] ?? '#8a8a93'
          const isSelected = r.id === selectedId
          return (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="relative"
              onMouseEnter={() => setHoveredId(r.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <button
                onClick={() => onSelect?.(r)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all hover:bg-[var(--tm-subtle-bg)]"
                style={{
                  background: isSelected ? 'var(--tm-lime-dim, rgba(198,244,50,0.1))' : 'transparent',
                  border: `1px solid ${isSelected ? 'var(--tm-lime)' : 'transparent'}`,
                }}
                aria-label={`Inspect ${r.sample}`}
                aria-pressed={isSelected}
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: color }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-[var(--tm-text-primary)] truncate">
                    {r.sample}
                  </p>
                  <p className="text-[10px] text-[var(--tm-text-muted)] font-mono">
                    {timeAgo(r.timestamp)}
                  </p>
                </div>
                <span
                  className="text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{
                    background: `${color}20`,
                    color,
                    border: `1px solid ${color}40`,
                  }}
                >
                  {r.predictedTaste}
                </span>
                <ChevronRight size={13} color="var(--tm-text-muted)" className="flex-shrink-0" />
              </button>

              <AnimatePresence>
                {hoveredId === r.id && <Popover reading={r} />}
              </AnimatePresence>
            </motion.div>
          )
        })
      )}
    </PillCard>
  )
}
export default RecentTestsList
