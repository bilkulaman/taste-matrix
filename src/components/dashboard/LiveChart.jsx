// src/components/dashboard/LiveChart.jsx
// Live Sensor Waveform Chart.
// Features:
// 1. Realistic smooth drifting time series (+/-2% noise, zero spikes).
// 2. Stacked mini-chart mode (3 synchronized sub-charts: pH, TDS, Turbidity) with full Y-axis visibility & margins.
// 3. Normalized combined mode (0 - 100% scaled with real units in custom tooltip).
// 4. Series toggle chips, drag zoom & reset, round action buttons.

import { useState, useId } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, ReferenceArea,
} from 'recharts'
import { motion, AnimatePresence } from 'framer-motion'
import { RotateCcw, Layers, AlignJustify } from 'lucide-react'
import { PillCard, RoundIconButton } from '../ui/index.js'

const SERIES_CONFIG = [
  {
    key: 'ph',
    label: 'pH Level',
    unit: 'pH',
    color: '#818cf8',
    gradId: 'grad-ph',
    min: 0,
    max: 14,
    formatter: (v) => Number(v).toFixed(2),
  },
  {
    key: 'tds',
    label: 'TDS Salinity',
    unit: 'ppm',
    color: '#38bdf8',
    gradId: 'grad-tds',
    min: 0,
    max: 6000,
    formatter: (v) => Math.round(Number(v)).toLocaleString(),
  },
  {
    key: 'turbidity',
    label: 'Turbidity Index',
    unit: 'NTU',
    color: '#f59e0b',
    gradId: 'grad-turb',
    min: 0,
    max: 100,
    formatter: (v) => Number(v).toFixed(1),
  },
]

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null
  return (
    <div
      className="rounded-2xl px-3.5 py-2.5 text-[12px] shadow-2xl"
      style={{
        background: 'var(--tm-tooltip-bg, rgba(12, 12, 18, 0.96))',
        border: '1px solid var(--tm-border-card, rgba(255, 255, 255, 0.14))',
        backdropFilter: 'blur(16px)',
        color: 'var(--tm-text-primary)',
      }}
    >
      <p className="text-[var(--tm-text-muted)] mb-1.5 text-[10px] font-mono tracking-wider">
        {label}
      </p>
      {payload.map((p) => {
        const conf = SERIES_CONFIG.find((c) => c.key === p.dataKey || c.label === p.name)
        const unit = conf?.unit || ''
        const formatted = conf?.formatter ? conf.formatter(p.value) : p.value

        return (
          <div key={p.dataKey} className="flex items-center gap-2.5 leading-5 py-0.5">
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: p.color }}
            />
            <span className="text-[var(--tm-text-muted)]">{p.name}:</span>
            <span
              className="text-[var(--tm-text-primary)] font-semibold font-mono ml-auto pl-2 tabular-nums"
            >
              {formatted} <span className="text-[10px] text-[var(--tm-text-muted)] font-normal">{unit}</span>
            </span>
          </div>
        )
      })}
    </div>
  )
}

const TooltipContent = ChartTooltip

export function LiveChart({ data = [] }) {
  const [mode, setMode] = useState('stacked') // 'stacked' | 'combined'
  const [hidden, setHidden] = useState(new Set())
  const [refAreaLeft, setRefAreaLeft] = useState(null)
  const [refAreaRight, setRefAreaRight] = useState(null)
  const [zoomed, setZoomed] = useState(null)
  const [isDragging, setIsDragging] = useState(false)

  const toggleSeries = (key) => {
    setHidden((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        if (next.size < 2) next.delete(key) // keep at least one visible
      } else {
        next.add(key)
      }
      return next
    })
  }

  // Pre-process data for normalized view (0 - 100%)
  const processedData = data.map((d, i) => {
    const normPh = ((d.ph - 0) / 14) * 100
    // Dynamic TDS scaling based on current max
    const maxTds = Math.max(...data.map(item => item.tds), 100)
    const normTds = (d.tds / maxTds) * 100
    const normTurb = (d.turbidity / 100) * 100

    return {
      ...d,
      index: i,
      norm_ph: parseFloat(normPh.toFixed(1)),
      norm_tds: parseFloat(normTds.toFixed(1)),
      norm_turbidity: parseFloat(normTurb.toFixed(1)),
    }
  })

  const displayData = zoomed
    ? processedData.filter((d) => d.index >= zoomed.left && d.index <= zoomed.right)
    : processedData

  function handleMouseDown(e) {
    if (e?.activeLabel) {
      setRefAreaLeft(e.activeLabel)
      setIsDragging(true)
    }
  }

  function handleMouseMove(e) {
    if (isDragging && e?.activeLabel) {
      setRefAreaRight(e.activeLabel)
    }
  }

  function handleMouseUp() {
    if (refAreaLeft && refAreaRight && refAreaLeft !== refAreaRight) {
      const l = Math.min(refAreaLeft, refAreaRight)
      const r = Math.max(refAreaLeft, refAreaRight)
      setZoomed({ left: l, right: r })
    }
    setRefAreaLeft(null)
    setRefAreaRight(null)
    setIsDragging(false)
  }

  return (
    <PillCard
      className="p-5 flex flex-col justify-between"
      style={{
        background: 'rgba(255, 255, 255, 0.07)',
        border: '1px solid rgba(255, 255, 255, 0.10)',
        minHeight: 280,
      }}
    >
      {/* Top Header Controls */}
      <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[15px] font-semibold text-white tracking-tight">
            Telemetry Stream
          </span>
          <span className="text-[11px] text-[#8a8a93] font-mono px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.06]">
            30-point drift
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Series Toggle Chips */}
          <div className="flex items-center gap-1.5 p-1 rounded-full bg-white/[0.04] border border-white/[0.06]">
            {SERIES_CONFIG.map((s) => {
              const isOff = hidden.has(s.key)
              return (
                <button
                  key={s.key}
                  onClick={() => toggleSeries(s.key)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all"
                  style={{
                    background: isOff ? 'transparent' : `${s.color}20`,
                    border: `1px solid ${isOff ? 'transparent' : s.color + '55'}`,
                    color: isOff ? '#8a8a93' : '#ffffff',
                  }}
                  aria-pressed={!isOff}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: isOff ? '#8a8a93' : s.color }}
                  />
                  <span>{s.label.split(' ')[0]}</span>
                </button>
              )
            })}
          </div>

          {/* Mode Switch: Stacked vs Combined */}
          <button
            onClick={() => setMode((m) => (m === 'stacked' ? 'combined' : 'stacked'))}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-medium transition-colors bg-white/[0.05] hover:bg-white/10 text-white border border-white/[0.08]"
            title={`Switch to ${mode === 'stacked' ? 'Combined Normalized' : 'Stacked View'}`}
          >
            {mode === 'stacked' ? <Layers size={12} /> : <AlignJustify size={12} />}
            <span className="hidden sm:inline">
              {mode === 'stacked' ? 'Stacked' : 'Normalized'}
            </span>
          </button>

          {/* Reset Zoom */}
          {zoomed && (
            <RoundIconButton
              icon={RotateCcw}
              onClick={() => setZoomed(null)}
              label="Reset Zoom"
              size={30}
              variant="lime"
            />
          )}
        </div>
      </div>

      {/* ── STACKED VIEW: 3 Synchronized Clean Sub-charts with Fully Visible Y-Axes ── */}
      {mode === 'stacked' ? (
        <div className="flex flex-col gap-2 w-full flex-1 justify-between">
          {SERIES_CONFIG.map((s) => {
            if (hidden.has(s.key)) return null

            return (
              <div
                key={s.key}
                className="w-full flex items-center rounded-xl p-1 bg-white/[0.02] border border-white/[0.04]"
                style={{ height: 68 }}
              >
                <div className="w-14 pl-2 flex flex-col justify-center text-left flex-shrink-0">
                  <span className="text-[11px] font-semibold text-white tracking-tight">
                    {s.label.split(' ')[0]}
                  </span>
                  <span className="text-[9px] text-[#8a8a93] font-mono">
                    {s.unit}
                  </span>
                </div>

                <div className="flex-1 h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={displayData}
                      margin={{ top: 4, right: 10, left: 10, bottom: 0 }}
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                    >
                      <defs>
                        <linearGradient id={s.gradId} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={s.color} stopOpacity={0.35} />
                          <stop offset="95%" stopColor={s.color} stopOpacity={0.02} />
                        </linearGradient>
                      </defs>

                      <CartesianGrid
                        strokeDasharray="2 4"
                        stroke="var(--tm-grid-color, rgba(255,255,255,0.04))"
                        vertical={false}
                      />

                      <YAxis
                        domain={['auto', 'auto']}
                        tick={{
                          fill: 'var(--tm-text-muted, #8a8a93)',
                          fontSize: 9,
                          fontFamily: 'JetBrains Mono, monospace',
                        }}
                        width={42}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={s.formatter}
                      />

                      <Tooltip
                        content={<ChartTooltip />}
                        cursor={{ stroke: 'rgba(255,255,255,0.2)', strokeWidth: 1 }}
                      />

                      <Area
                        type="monotone"
                        dataKey={s.key}
                        name={s.label}
                        stroke={s.color}
                        strokeWidth={2}
                        fill={`url(#${s.gradId})`}
                        dot={false}
                        isAnimationActive={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* ── COMBINED VIEW: Normalized 0-100% with wide left margin for Y-Axis ── */
        <div className="w-full flex-1" style={{ minHeight: 180 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={displayData}
              margin={{ top: 8, right: 12, left: 14, bottom: 4 }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
            >
              <defs>
                {SERIES_CONFIG.map((s) => (
                  <linearGradient key={s.gradId} id={s.gradId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={s.color} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={s.color} stopOpacity={0.01} />
                  </linearGradient>
                ))}
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--tm-grid-color, rgba(255,255,255,0.05))"
                vertical={false}
              />

              <XAxis
                dataKey="label"
                tick={{ fill: 'var(--tm-text-muted, #8a8a93)', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}
                axisLine={false}
                tickLine={false}
                interval={Math.floor(displayData.length / 5) || 0}
              />

              {/* Generous left margin and width=45 ensures Y-Axis labels never get clipped */}
              <YAxis
                domain={[0, 100]}
                tick={{ fill: 'var(--tm-text-muted, #8a8a93)', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}
                axisLine={false}
                tickLine={false}
                width={45}
                unit="%"
              />

              <Tooltip
                content={<ChartTooltip />}
                cursor={{ stroke: 'rgba(255,255,255,0.2)', strokeWidth: 1 }}
              />

              {SERIES_CONFIG.map((s) => (
                !hidden.has(s.key) && (
                  <Area
                    key={s.key}
                    type="monotone"
                    dataKey={s.key}
                    name={s.label}
                    stroke={s.color}
                    strokeWidth={2}
                    fill={`url(#${s.gradId})`}
                    dot={false}
                    activeDot={{ r: 4, fill: s.color, stroke: '#000', strokeWidth: 2 }}
                    isAnimationActive={false}
                  />
                )
              ))}

              {refAreaLeft && refAreaRight && (
                <ReferenceArea
                  x1={refAreaLeft}
                  x2={refAreaRight}
                  strokeOpacity={0.3}
                  fill="rgba(198,244,50,0.12)"
                  stroke="#c6f432"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Chart Footer Indicator */}
      <div className="flex items-center justify-between text-[10px] text-[#8a8a93] mt-2 pt-2 border-t border-white/[0.05]">
        <span>Continuous E-Tongue Flow</span>
        <span className="font-mono">Sync: 3000ms</span>
      </div>
    </PillCard>
  )
}
export default LiveChart
