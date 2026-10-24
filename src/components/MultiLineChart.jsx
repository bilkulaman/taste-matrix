// components/MultiLineChart.jsx
// SVG multi-line chart: one series per sample, with hover tooltip, using token CSS variables.

import { useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'

const SAMPLE_COLORS = {
  'Distilled Water': '#60a5fa',
  'Haldi Water':     '#f59e0b',
  'Basic Water':     '#38bdf8',
  'Chalk Water':     '#a78bfa',
}

export { SAMPLE_COLORS }

export default function MultiLineChart({ series, metric, height = 200 }) {
  const W = 600, H = height
  const PAD = { top: 12, right: 20, bottom: 28, left: 44 }

  const svgRef = useRef(null)
  const [tooltip, setTooltip] = useState(null)

  const { paths, yTicks, xTicks } = useMemo(() => {
    if (!series.length) return { paths: [], yTicks: [], xTicks: [] }

    const allVals = series.flatMap(s => s.values)
    const yMin = Math.min(...allVals)
    const yMax = Math.max(...allVals)
    const yRange = yMax - yMin || 1

    const innerW = W - PAD.left - PAD.right
    const innerH = H - PAD.top  - PAD.bottom

    const toX = (i, len) => PAD.left + (i / (len - 1 || 1)) * innerW
    const toY = (v) => PAD.top + innerH - ((v - yMin) / yRange) * innerH

    const paths = series.map(s => {
      const pts = s.values.map((v, i) => ({ x: toX(i, s.values.length), y: toY(v), v, i }))
      const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
      const areaBot = PAD.top + innerH
      const area = `${d} L ${pts[pts.length - 1].x.toFixed(1)} ${areaBot} L ${PAD.left} ${areaBot} Z`
      return { sample: s.sample, d, area, pts, color: SAMPLE_COLORS[s.sample] ?? '#8a8a93' }
    })

    const step = (yMax - yMin) / 4
    const yTicks = Array.from({ length: 5 }, (_, i) => ({
      v: yMin + step * i,
      y: toY(yMin + step * i),
    }))

    const len = series[0]?.values.length ?? 0
    const xTicks = Array.from({ length: Math.min(5, len) }, (_, i) => ({
      i: Math.round((i / 4) * (len - 1)),
      x: toX(Math.round((i / 4) * (len - 1)), len),
    }))

    return { paths, yTicks, xTicks }
  }, [series, H])

  const handleMouseMove = (e) => {
    if (!svgRef.current || !paths.length) return
    const rect = svgRef.current.getBoundingClientRect()
    const mx = ((e.clientX - rect.left) / rect.width) * W
    const len = series[0]?.values.length ?? 0
    const innerW = W - PAD.left - PAD.right
    const idx = Math.round(((mx - PAD.left) / innerW) * (len - 1))
    if (idx < 0 || idx >= len) { setTooltip(null); return }
    setTooltip({
      x: mx,
      idx,
      items: paths.map(p => ({ sample: p.sample, v: series.find(s => s.sample === p.sample)?.values[idx], color: p.color })),
    })
  }

  return (
    <div className="w-full relative" style={{ paddingBottom: '32%' }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="absolute inset-0 w-full h-full overflow-visible"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setTooltip(null)}
        aria-label={`${metric} multi-line chart`}
        role="img"
      >
        {/* Grid lines */}
        {yTicks.map((t, i) => (
          <g key={i}>
            <line
              x1={PAD.left} x2={W - PAD.right}
              y1={t.y} y2={t.y}
              stroke="var(--tm-grid-color, rgba(255,255,255,0.06))" strokeWidth="1"
            />
            <text x={PAD.left - 6} y={t.y + 4} textAnchor="end"
              fill="var(--tm-text-muted, #8a8a93)" fontSize={9} fontFamily="JetBrains Mono, monospace">
              {metric === 'ph' ? t.v.toFixed(1) : Math.round(t.v)}
            </text>
          </g>
        ))}

        {/* X ticks */}
        {xTicks.map((t, i) => (
          <text key={i} x={t.x} y={H - 6} textAnchor="middle" fill="var(--tm-text-muted, #8a8a93)" fontSize={9} fontFamily="JetBrains Mono, monospace">
            #{t.i + 1}
          </text>
        ))}

        {/* Defs for gradients */}
        <defs>
          {paths.map(p => (
            <linearGradient key={p.sample} id={`mlg-${p.sample.replace(/\s/g, '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={p.color} stopOpacity="0.22" />
              <stop offset="100%" stopColor={p.color} stopOpacity="0.01" />
            </linearGradient>
          ))}
        </defs>

        {/* Area fills */}
        {paths.map(p => (
          <path key={`area-${p.sample}`} d={p.area}
            fill={`url(#mlg-${p.sample.replace(/\s/g, '')})`} />
        ))}

        {/* Lines */}
        {paths.map(p => (
          <motion.path
            key={`line-${p.sample}`}
            d={p.d}
            fill="none"
            stroke={p.color}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
          />
        ))}

        {/* Tooltip vertical line */}
        {tooltip && (
          <line
            x1={tooltip.x} x2={tooltip.x}
            y1={PAD.top} y2={H - PAD.bottom}
            stroke="var(--tm-text-primary, #ffffff)" strokeWidth="1" strokeDasharray="3 3" opacity={0.3}
          />
        )}
      </svg>

      {/* Tooltip box */}
      {tooltip && (
        <div
          className="absolute z-20 pointer-events-none rounded-2xl text-[12px] py-2.5 px-3.5 flex flex-col gap-1 shadow-2xl"
          style={{
            background: 'var(--tm-tooltip-bg, rgba(12,12,18,0.96))',
            border: '1px solid var(--tm-border-card)',
            left: `${(tooltip.x / W) * 100}%`,
            top: 10,
            transform: tooltip.x > W * 0.65 ? 'translateX(-110%)' : 'translateX(8px)',
            minWidth: 150,
            backdropFilter: 'blur(16px)',
          }}
        >
          <span className="text-[var(--tm-text-muted)] text-[10px] font-mono mb-1">Index #{tooltip.idx + 1}</span>
          {tooltip.items.map(item => (
            <div key={item.sample} className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: item.color }} />
              <span className="text-[var(--tm-text-muted)] text-[11px]">{item.sample}</span>
              <span className="ml-auto text-[var(--tm-text-primary)] font-mono font-semibold">
                {item.v !== undefined
                  ? metric === 'ph'        ? item.v.toFixed(2)
                  : metric === 'turbidity' ? item.v.toFixed(1)
                  : Math.round(item.v)
                  : '—'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
