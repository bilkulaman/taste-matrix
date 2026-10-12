// pages/Analysis.jsx
// Stage 3: Cross-sample sensor comparison & multivariate phase-space analysis.
// Panel-in-panel architecture: 32px frosted panels, 22px nested pill cards, 22px headers, 40px round icon buttons.

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Activity, Droplets, Waves, Download, SlidersHorizontal,
  RefreshCw, Sparkles, Filter, ChevronRight
} from 'lucide-react'
import MultiLineChart, { SAMPLE_COLORS } from '../components/MultiLineChart.jsx'
import RasaBadge       from '../components/RasaBadge.jsx'
import { useHistory }  from '../hooks/useHistory.js'
import { useSamples }  from '../hooks/useSamples.js'
import { PanelCard, PillCard, RoundIconButton } from '../components/ui/index.js'

const METRICS = [
  { key: 'ph',        label: 'pH Level',   unit: 'pH',  icon: Droplets, color: '#818cf8' },
  { key: 'tds',       label: 'TDS Salinity', unit: 'ppm', icon: Waves,    color: '#38bdf8' },
  { key: 'turbidity', label: 'Turbidity',   unit: 'NTU', icon: Activity, color: '#c6f432' },
]

// ── Scatter Chart: pH vs TDS Phase Space ─────────────────────────────────────
function ScatterChart({ rows }) {
  const W = 520, H = 220
  const PAD = { top: 16, right: 24, bottom: 32, left: 48 }

  const { points, xTicks, yTicks } = useMemo(() => {
    if (!rows.length) return { points: [], xTicks: [], yTicks: [] }
    const phs  = rows.map(r => r.ph)
    const tdss = rows.map(r => r.tds)
    const xMin = Math.min(...phs),  xMax = Math.max(...phs)  || 14
    const yMin = Math.min(...tdss), yMax = Math.max(...tdss) || 1

    const innerW = W - PAD.left - PAD.right
    const innerH = H - PAD.top  - PAD.bottom

    const toX = v => PAD.left + ((v - xMin) / (xMax - xMin || 1)) * innerW
    const toY = v => PAD.top + innerH - ((v - yMin) / (yMax - yMin || 1)) * innerH

    const points = rows.map(r => ({
      x: toX(r.ph), y: toY(r.tds),
      color: SAMPLE_COLORS[r.sample] ?? '#8a8a93',
      sample: r.sample, rasa: r.predictedTaste,
      ph: r.ph, tds: r.tds,
    }))

    const xStep = (xMax - xMin) / 4 || 1
    const xTicks = Array.from({ length: 5 }, (_, i) => ({
      v: xMin + xStep * i, x: toX(xMin + xStep * i),
    }))
    const yStep = (yMax - yMin) / 4 || 1
    const yTicks = Array.from({ length: 5 }, (_, i) => ({
      v: yMin + yStep * i, y: toY(yMin + yStep * i),
    }))

    return { points, xTicks, yTicks }
  }, [rows])

  const [hoveredPoint, setHoveredPoint] = useState(null)

  return (
    <div className="relative w-full" style={{ paddingBottom: '36%' }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="absolute inset-0 w-full h-full overflow-visible"
        aria-label="pH vs TDS phase space scatter plot"
        role="img"
      >
        {/* Grid lines */}
        {yTicks.map((t, i) => (
          <g key={i}>
            <line
              x1={PAD.left} x2={W - PAD.right} y1={t.y} y2={t.y}
              stroke="var(--tm-grid-color, rgba(255,255,255,0.06))" strokeWidth="1"
            />
            <text x={PAD.left - 6} y={t.y + 4} textAnchor="end" fill="var(--tm-text-muted)" fontSize={9} fontFamily="JetBrains Mono, monospace">
              {Math.round(t.v)}
            </text>
          </g>
        ))}
        {xTicks.map((t, i) => (
          <text key={i} x={t.x} y={H - 8} textAnchor="middle" fill="var(--tm-text-muted)" fontSize={9} fontFamily="JetBrains Mono, monospace">
            {t.v.toFixed(1)}
          </text>
        ))}

        {/* Scatter Points */}
        {points.map((p, i) => (
          <motion.circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={hoveredPoint === p ? 6 : 4}
            fill={p.color}
            stroke="var(--tm-bg, #000000)"
            strokeWidth={1.5}
            whileHover={{ scale: 1.5 }}
            onMouseEnter={() => setHoveredPoint(p)}
            onMouseLeave={() => setHoveredPoint(null)}
            className="cursor-pointer transition-transform"
          />
        ))}
      </svg>

      {/* Popover */}
      {hoveredPoint && (
        <div
          className="absolute z-30 pointer-events-none rounded-2xl py-2 px-3 text-[11px] shadow-2xl"
          style={{
            background: 'var(--tm-tooltip-bg, rgba(12,12,18,0.98))',
            border: '1px solid var(--tm-border-card)',
            left: `${(hoveredPoint.x / W) * 100}%`,
            top: `${(hoveredPoint.y / H) * 100}%`,
            transform: 'translate(-50%, -125%)',
            backdropFilter: 'blur(16px)',
          }}
        >
          <div className="font-semibold text-[var(--tm-text-primary)] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: hoveredPoint.color }} />
            {hoveredPoint.sample}
          </div>
          <div className="text-[var(--tm-text-muted)] mt-0.5">
            pH {hoveredPoint.ph.toFixed(2)} · TDS {hoveredPoint.tds} ppm
          </div>
        </div>
      )}
    </div>
  )
}

// ── Sample Average Card (Nested Pill Card) ───────────────────────────────────
function SampleSummaryCard({ sample, rows }) {
  const sampleRows = rows.filter(r => r.sample === sample.name)
  const avgPh   = sampleRows.length ? sampleRows.reduce((a, b) => a + b.ph, 0) / sampleRows.length : 0
  const avgTds  = sampleRows.length ? sampleRows.reduce((a, b) => a + b.tds, 0) / sampleRows.length : 0
  const avgTurb = sampleRows.length ? sampleRows.reduce((a, b) => a + b.turbidity, 0) / sampleRows.length : 0
  const color = SAMPLE_COLORS[sample.name] ?? '#8a8a93'

  return (
    <PillCard className="p-4 flex flex-col justify-between hover:scale-[1.02] transition-transform">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
            <h3 className="text-[14px] font-semibold text-[var(--tm-text-primary)] tracking-tight">
              {sample.name}
            </h3>
          </div>
          <p className="text-[11px] text-[var(--tm-text-muted)] mt-0.5">
            {sample.rasa}
          </p>
        </div>
        <RasaBadge rasa={sample.rasa.split(' ')[0]} small />
      </div>

      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[var(--tm-subtle-border)]">
        <div className="text-center rounded-xl py-1.5 px-1 bg-[var(--tm-subtle-bg)]">
          <span className="text-[9px] text-[var(--tm-text-muted)] uppercase block font-mono">pH</span>
          <span className="text-[12px] font-mono font-semibold text-[var(--tm-text-primary)]">
            {avgPh ? avgPh.toFixed(2) : '—'}
          </span>
        </div>
        <div className="text-center rounded-xl py-1.5 px-1 bg-[var(--tm-subtle-bg)]">
          <span className="text-[9px] text-[var(--tm-text-muted)] uppercase block font-mono">TDS</span>
          <span className="text-[12px] font-mono font-semibold text-[var(--tm-text-primary)]">
            {avgTds ? Math.round(avgTds) : '—'}
          </span>
        </div>
        <div className="text-center rounded-xl py-1.5 px-1 bg-[var(--tm-subtle-bg)]">
          <span className="text-[9px] text-[var(--tm-text-muted)] uppercase block font-mono">Turb</span>
          <span className="text-[12px] font-mono font-semibold text-[var(--tm-text-primary)]">
            {avgTurb ? avgTurb.toFixed(1) : '—'}
          </span>
        </div>
      </div>
    </PillCard>
  )
}

export default function Analysis() {
  const [activeMetric, setActiveMetric] = useState('ph')
  const { data: history, loading }      = useHistory({ limit: 75 })
  const { samples }                     = useSamples()

  const series = useMemo(() => {
    if (!history.length || !samples.length) return []
    return samples.map(s => {
      const rows = [...history].filter(r => r.sample === s.name).reverse()
      return { sample: s.name, values: rows.map(r => r[activeMetric]) }
    }).filter(s => s.values.length > 0)
  }, [history, samples, activeMetric])

  const metric = METRICS.find(m => m.key === activeMetric)

  return (
    <>
      {/* ── Top Header & Pill Nav ── */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[var(--tm-subtle-border)]">
        <div className="flex items-center gap-2 p-1.5 rounded-full bg-[var(--tm-subtle-bg)] border border-[var(--tm-subtle-border)]">
          {METRICS.map(m => {
            const Icon = m.icon
            const isActive = m.key === activeMetric
            return (
              <button
                key={m.key}
                onClick={() => setActiveMetric(m.key)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[12px] font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-[var(--tm-lime)] text-[var(--tm-lime-text)] shadow-[0_0_12px_var(--tm-lime-glow)] font-semibold'
                    : 'text-[var(--tm-text-muted)] hover:text-[var(--tm-text-primary)]'
                }`}
              >
                <Icon size={13} />
                <span>{m.label}</span>
                <span className="text-[10px] opacity-75 font-mono">({m.unit || 'unit'})</span>
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-2">
          <RoundIconButton icon={Download} label="Export Spectral Data" />
          <RoundIconButton icon={SlidersHorizontal} label="Sensor Calibration" />
        </div>
      </header>

      {/* ── Page Title ── */}
      <section>
        <h1 className="text-[36px] font-light text-[var(--tm-text-primary)] tracking-[-0.03em] leading-tight">
          Analysis
        </h1>
        <p className="text-[13px] text-[var(--tm-text-muted)] mt-0.5">
          Comparative multi-sample sensor trajectories & orthogonal phase space correlation
        </p>
      </section>

      {/* ── PANEL 1: Comparative Multi-line Chart ── */}
      <PanelCard padding={24}>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <h2 className="text-[22px] font-semibold text-[var(--tm-text-primary)] tracking-tight">
              {metric?.label} Trajectory — All Dravya Samples
            </h2>
            <p className="text-[12px] text-[var(--tm-text-muted)]">
              Parallel response curves across sequential electrochemical acquisitions
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Legend */}
            <div className="hidden sm:flex items-center gap-3 text-[11px] font-medium text-[var(--tm-text-muted)]">
              {samples.map(s => (
                <div key={s.id} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ background: SAMPLE_COLORS[s.name] ?? '#8a8a93' }} />
                  <span>{s.name}</span>
                </div>
              ))}
            </div>
            <RoundIconButton icon={RefreshCw} label="Refresh Comparison" />
          </div>
        </div>

        <PillCard className="p-4" style={{ minHeight: 240 }}>
          {loading ? (
            <div className="animate-pulse rounded-2xl h-56 bg-[var(--tm-subtle-bg)]" />
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeMetric}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <MultiLineChart series={series} metric={activeMetric} height={230} />
              </motion.div>
            </AnimatePresence>
          )}
        </PillCard>
      </PanelCard>

      {/* ── PANELS 2 & 3: Phase Space Scatter & Sample Averages ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Phase Space Scatter (7 cols) */}
        <div className="lg:col-span-7 flex flex-col">
          <PanelCard padding={24} className="flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-[22px] font-semibold text-[var(--tm-text-primary)] tracking-tight">
                  pH vs TDS Phase Space
                </h2>
                <p className="text-[12px] text-[var(--tm-text-muted)]">
                  Clustering verification of acidic vs ionic taste signatures
                </p>
              </div>
              <RoundIconButton icon={Filter} label="Cluster Boundaries" />
            </div>

            <PillCard className="p-4 flex-1 flex items-center justify-center">
              {loading ? (
                <div className="animate-pulse rounded-2xl w-full h-52 bg-[var(--tm-subtle-bg)]" />
              ) : (
                <ScatterChart rows={history} />
              )}
            </PillCard>
          </PanelCard>
        </div>

        {/* Sample Averages (5 cols) */}
        <div className="lg:col-span-5 flex flex-col">
          <PanelCard padding={24} className="flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-[22px] font-semibold text-[var(--tm-text-primary)] tracking-tight">
                  Sample Profiles
                </h2>
                <p className="text-[12px] text-[var(--tm-text-muted)]">
                  Normalized empirical baseline averages
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 flex-1">
              {samples.slice(0, 4).map(s => (
                <SampleSummaryCard key={s.id} sample={s} rows={history} />
              ))}
            </div>
          </PanelCard>
        </div>
      </div>
    </>
  )
}
