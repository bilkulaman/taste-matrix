// src/components/ui/OverlapBadges.jsx
// Overlapping circular sample badges row (as seen under the title in the reference CRM UI).
// 5 samples with colored droplet icon and count badge for tests today. Clicking selects that sample.

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Droplet } from 'lucide-react'

const DEFAULT_SAMPLES = [
  { id: 'distilled-water', name: 'Distilled Water', color: '#60a5fa', count: 14, rasa: 'Anabhilashita' },
  { id: 'haldi-water',     name: 'Haldi Water',     color: '#f59e0b', count: 31, rasa: 'Tikta' },
  { id: 'basic-water',     name: 'Basic Water',     color: '#38bdf8', count: 22, rasa: 'Lavana' },
  { id: 'chalk-water',     name: 'Chalk Water',     color: '#a78bfa', count: 18, rasa: 'Kashaya' },
]

export function OverlapBadges({
  samples = DEFAULT_SAMPLES,
  activeSampleId,
  onSelectSample,
  className = '',
}) {
  const [hoveredId, setHoveredId] = useState(null)

  return (
    <div className={`relative flex items-center ${className}`}>
      <div
        className="flex items-center -space-x-2.5 p-1.5 rounded-full"
        style={{
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        }}
      >
        {samples.map((s) => {
          const isSelected = activeSampleId === s.id
          const isHovered = hoveredId === s.id

          return (
            <div key={s.id} className="relative">
              <motion.button
                whileHover={{ scale: 1.14, zIndex: 30 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSelectSample?.(s.id)}
                onMouseEnter={() => setHoveredId(s.id)}
                onMouseLeave={() => setHoveredId(null)}
                aria-label={`${s.name} - ${s.count} tests today`}
                className="relative rounded-full flex items-center justify-center transition-all focus:outline-none"
                style={{
                  width: 38,
                  height: 38,
                  background: isSelected
                    ? `${s.color}25`
                    : 'rgba(20, 20, 25, 0.85)',
                  border: isSelected
                    ? `2px solid ${s.color}`
                    : '2px solid rgba(255, 255, 255, 0.12)',
                  boxShadow: isSelected
                    ? `0 0 14px ${s.color}66`
                    : '0 2px 6px rgba(0,0,0,0.4)',
                  zIndex: isSelected ? 20 : isHovered ? 25 : 10,
                }}
              >
                {/* Droplet icon */}
                <Droplet
                  size={16}
                  fill={s.color}
                  stroke={s.color}
                  strokeWidth={1.5}
                />

                {/* Test count badge (bottom right) */}
                <span
                  className="absolute -bottom-1 -right-1 text-[9px] font-bold rounded-full flex items-center justify-center px-1 tabular-nums"
                  style={{
                    minWidth: 16,
                    height: 16,
                    background: isSelected ? '#ffffff' : s.color,
                    color: isSelected ? '#000000' : '#000000',
                    border: '1.5px solid #000000',
                    fontFamily: 'JetBrains Mono, monospace',
                  }}
                >
                  {s.count}
                </span>
              </motion.button>

              {/* Tooltip on hover */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.92 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.92 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-50 px-2.5 py-1.5 rounded-xl whitespace-nowrap pointer-events-none text-left"
                    style={{
                      background: 'rgba(10, 10, 15, 0.96)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
                      backdropFilter: 'blur(12px)',
                    }}
                  >
                    <div className="text-[12px] font-medium text-white flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                      {s.name}
                    </div>
                    <div className="text-[10px] text-[#8a8a93] mt-0.5">
                      {s.rasa} · <span className="text-white font-semibold">{s.count}</span> tests today
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
      <span className="text-[11px] text-[#8a8a93] ml-3 hidden sm:inline-block font-mono">
        Active Dravya
      </span>
    </div>
  )
}
export default OverlapBadges
