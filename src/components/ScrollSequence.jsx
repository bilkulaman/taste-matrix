// components/ScrollSequence.jsx
// Pinned scroll transition:
// 1. SPHERE SIZE: diameter 62vh (max 640px), centered horizontally, center at 58% of viewport height.
//    Fully visible on screen (~8-11vh black space around it). No horizontal bands/lines across it.
// 2. HEADLINE: Above the sphere in the top 22vh (clamp 32-56px). Droplet ripple at sphere's top-center impact point.
// 3. FILL THE SPHERE:
//    - "PREDICTED RASA" label
//    - Animated taste name from API (e.g. "Tikta", ~64px) + confidence bar ("92% confidence")
//    - Thin animated waveform/line chart of the last 15 pH readings
//    - "Sample: Neem Water" pill at the bottom
// 4. ORBIT: 3 chips (pH, TDS, Turbidity) travel on ellipse (rx 38vh, ry 12vh, centered on sphere, 24s loop, 120deg apart).
//    1px thin line to sphere. Z-index swap: behind sphere on upper half (y < 0), in front on lower half (y >= 0).
// 5. Mobile: sphere 50vh, chips in a row below it. Reduced-motion: static final state.

import { useState, useEffect, useMemo, useRef } from 'react'
import { motion, useTransform } from 'framer-motion'
import { Droplet, Activity, Waves } from 'lucide-react'
import { useLiveReading } from '../hooks/useLiveReading.js'
import { useHistory } from '../hooks/useHistory.js'

export default function ScrollSequence({ progress, isMobile = false }) {
  const { reading } = useLiveReading()
  const { data: historyData } = useHistory({ limit: 15, refreshMs: 3000 })

  // ─── Viewport Height in Pixels for Exact vh Math ────────────────────────────
  const [vh, setVh] = useState(800)
  useEffect(() => {
    const update = () => setVh(window.innerHeight || 800)
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  // ─── Live Sensor Values ───────────────────────────────────────────────────
  const phVal      = reading?.ph ? reading.ph.toFixed(2) : '7.02'
  const tdsVal     = reading?.tds ? Math.round(reading.tds).toLocaleString() : '142'
  const ntuVal     = reading?.turbidity ? reading.turbidity.toFixed(1) : '4.8'
  const tasteName  = reading?.predictedTaste || 'Tikta'
  const sampleName = reading?.sample || 'Neem Water'

  const rawConf = reading?.confidence ?? 0.92
  const confidencePercent = Math.round(rawConf > 1 ? rawConf : rawConf * 100)

  // ─── 15 pH Waveform Points ────────────────────────────────────────────────
  const waveformPath = useMemo(() => {
    const pts = (historyData && historyData.length > 0)
      ? historyData.slice(0, 15).map(d => d.ph || 7.0)
      : [6.8, 6.9, 7.1, 7.0, 7.2, 7.15, 7.3, 7.25, 7.4, 7.35, 7.2, 7.1, 7.05, 7.15, 7.02]

    const width = 200
    const height = 28
    const min = Math.min(...pts, 6.0)
    const max = Math.max(...pts, 8.5)
    const range = (max - min) || 1

    const coords = pts.map((val, idx) => {
      const x = (idx / (pts.length - 1)) * width
      const y = height - ((val - min) / range) * (height - 6) - 3
      return { x: Math.round(x), y: Math.round(y) }
    })

    const linePath = coords.reduce((acc, pt, i) =>
      i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`, ''
    )

    const areaPath = `${linePath} L ${width} ${height} L 0 ${height} Z`
    const lastPt = coords[coords.length - 1] || { x: width, y: height / 2 }

    return { linePath, areaPath, lastPt }
  }, [historyData])

  // ─── p 0.30 - 0.60: Sphere Rises into View ─────────────────────────────────
  // Sphere center is at top: 58% of viewport.
  // At p=0.30: translateY +50vh -> at p=0.60: translateY 0vh (rests at center 58vh).
  const sphereY = useTransform(
    progress,
    [0.30, 0.60, 1.00],
    ['60vh', '0vh', '0vh']
  )
  const sphereScale = useTransform(
    progress,
    [0.30, 0.60, 1.00],
    [0.65, 1.0, 1.0]
  )
  const sphereOpacity = useTransform(progress, [0.28, 0.38], [0, 1])

  // ─── p 0.60 - 1.00: Headline & Readings Fade In ───────────────────────────
  const readingsOpacity = useTransform(progress, [0.60, 0.72], [0, 1])
  const readingsY       = useTransform(progress, [0.60, 0.72], [24, 0])
  const readingsBlur    = useTransform(progress, [0.60, 0.72], ['blur(8px)', 'blur(0px)'])

  // ─── Continuous 24s Orbit Loop for Chips ──────────────────────────────────
  const [orbitTime, setOrbitTime] = useState(0)
  useEffect(() => {
    let animId
    const start = performance.now()
    const tick = (now) => {
      setOrbitTime((now - start) / 1000)
      animId = requestAnimationFrame(tick)
    }
    animId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(animId)
  }, [])

  // Ellipse: rx = 38vh, ry = 12vh.
  // Sphere radius = 31vh (half of 62vh).
  // 3 chips spaced 120deg (2*PI/3) apart.
  const rxPx = Math.round((38 / 100) * vh)
  const ryPx = Math.round((12 / 100) * vh)
  const sphereRadiusPx = Math.round((31 / 100) * vh)

  const chips = useMemo(() => {
    const baseAngle = (orbitTime / 24) * Math.PI * 2
    const offsets = [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3]

    return [
      {
        id: 'ph',
        label: 'pH LEVEL',
        value: phVal,
        unit: 'pH',
        icon: Droplet,
        color: '#818cf8',
        angle: baseAngle + offsets[0],
      },
      {
        id: 'tds',
        label: 'TOTAL SOLIDS',
        value: tdsVal,
        unit: 'ppm',
        icon: Waves,
        color: '#38bdf8',
        angle: baseAngle + offsets[1],
      },
      {
        id: 'ntu',
        label: 'TURBIDITY',
        value: ntuVal,
        unit: 'NTU',
        icon: Activity,
        color: '#c6f432',
        angle: baseAngle + offsets[2],
      },
    ].map(c => {
      const x = Math.cos(c.angle) * rxPx
      const y = Math.sin(c.angle) * ryPx

      // Intersection on sphere rim:
      const dist = Math.hypot(x, y) || 1
      const lineX = (x / dist) * Math.min(dist, sphereRadiusPx)
      const lineY = (y / dist) * Math.min(dist, sphereRadiusPx)

      // Z-index swap:
      // Upper half (y < 0) -> behind sphere (z = 15)
      // Lower half (y >= 0) -> in front of sphere (z = 35)
      const isFront = y >= 0

      return {
        ...c,
        x,
        y,
        lineX,
        lineY,
        isFront,
        zIndex: isFront ? 35 : 15,
        scale: isFront ? 1.04 : 0.94,
        opacity: isFront ? 1.0 : 0.8,
      }
    })
  }, [orbitTime, phVal, tdsVal, ntuVal, rxPx, ryPx, sphereRadiusPx])

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">

      {/* ═════════════════════════════════════════════════════════════════════
          2. HEADLINE: ABOVE SPHERE IN TOP 22vh
          Never overlaps the sphere.
      ══════════════════════════════════════════════════════════════════════ */}
      <motion.div
        style={{
          opacity: readingsOpacity,
          y: readingsY,
          filter: readingsBlur,
        }}
        className="absolute top-0 left-0 right-0 h-[22vh] flex flex-col items-center justify-center text-center px-4 z-40 pointer-events-auto"
      >
        <span className="inline-block text-[11px] font-mono font-medium tracking-[0.25em] text-[#c6f432] mb-1.5 px-3 py-0.5 rounded-full bg-[#c6f432]/10 border border-[#c6f432]/25">
          [ LIVE SAMPLE ]
        </span>
        <h2
          className="text-white font-light leading-[1.06] tracking-tight text-center"
          style={{ fontSize: 'clamp(32px, 3.6vw, 56px)', letterSpacing: '-0.03em' }}
        >
          One drop of extract.<br />
          <span className="font-normal bg-gradient-to-r from-white via-white to-[#c6f432] bg-clip-text text-transparent">
            Three sensors. One rasa.
          </span>
        </h2>
      </motion.div>

      {/* ═════════════════════════════════════════════════════════════════════
          ORBIT CONNECTING LINES (SVG)
          Placed at center (50%, 58vh)
      ══════════════════════════════════════════════════════════════════════ */}
      {!isMobile && (
        <motion.div
          style={{ opacity: readingsOpacity }}
          className="absolute left-1/2 top-[58%] -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20"
        >
          <svg
            className="overflow-visible"
            style={{ width: 1, height: 1 }}
            aria-hidden="true"
          >
            {chips.map(chip => (
              <line
                key={`line-${chip.id}`}
                x1={chip.x}
                y1={chip.y}
                x2={chip.lineX}
                y2={chip.lineY}
                stroke={chip.isFront ? 'rgba(198, 244, 50, 0.45)' : 'rgba(124, 58, 237, 0.35)'}
                strokeWidth="1"
                strokeDasharray="2 3"
              />
            ))}
          </svg>
        </motion.div>
      )}

      {/* ── Behind-Sphere Orbiting Chips (y < 0, z-index: 15) ── */}
      {!isMobile && (
        <motion.div
          style={{ opacity: readingsOpacity }}
          className="absolute left-1/2 top-[58%] -translate-x-1/2 -translate-y-1/2 pointer-events-none z-15"
        >
          {chips.filter(c => !c.isFront).map(chip => {
            const Icon = chip.icon
            return (
              <div
                key={chip.id}
                className="absolute pointer-events-auto transition-transform duration-75 -translate-x-1/2 -translate-y-1/2"
                style={{
                  transform: `translate(${chip.x}px, ${chip.y}px) scale(${chip.scale})`,
                  opacity: chip.opacity,
                }}
              >
                <div
                  className="flex items-center gap-3 px-3.5 py-2 rounded-2xl select-none"
                  style={{
                    background: 'rgba(12, 12, 18, 0.85)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    backdropFilter: 'blur(16px)',
                    boxShadow: '0 6px 24px rgba(0, 0, 0, 0.6)',
                  }}
                >
                  <div
                    className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      background: `${chip.color}15`,
                      border: `1px solid ${chip.color}35`,
                    }}
                  >
                    <Icon size={13} color={chip.color} />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[9px] text-[#8a8a93] font-mono tracking-wider">
                      {chip.label}
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-[15px] font-semibold text-white tracking-tight">
                        {chip.value}
                      </span>
                      {chip.unit && (
                        <span className="text-[9px] text-[#8a8a93]">{chip.unit}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </motion.div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════
          1. THE SPHERE (DIAMETER 62vh, MAX 640px, CENTER AT 58vh)
          - Centered horizontally, center at 58% viewport height
          - Entire sphere fully visible on screen (~11vh black space at bottom, ~27vh at top)
          - NO hard horizontal bands or division lines across it!
      ══════════════════════════════════════════════════════════════════════ */}
      <motion.div
        style={{
          y: sphereY,
          scale: sphereScale,
          opacity: sphereOpacity,
        }}
        className="absolute left-1/2 top-[58%] -translate-x-1/2 -translate-y-1/2 z-25 pointer-events-auto"
      >
        {/* Soft Outer Halo */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
          style={{
            width: isMobile ? '56vh' : '68vh',
            height: isMobile ? '56vh' : '68vh',
            maxWidth: 720,
            maxHeight: 720,
            background: 'radial-gradient(circle, rgba(109,40,217,0.50) 0%, rgba(124,58,237,0.22) 45%, transparent 75%)',
            filter: 'blur(48px)',
          }}
        />

        {/* Circular Sphere Body */}
        <div
          className="relative rounded-full overflow-hidden flex flex-col items-center justify-between"
          style={{
            width: isMobile ? '50vh' : '62vh',
            height: isMobile ? '50vh' : '62vh',
            maxWidth: 640,
            maxHeight: 640,
            background: `
              radial-gradient(circle at 50% 32%,
                #8b5cf6 0%,
                #6d28d9 32%,
                #4c1d95 62%,
                #240954 85%,
                #0d0322 100%)
            `,
            boxShadow: `
              0 -4px 30px rgba(198, 244, 50, 0.40),
              0 0 70px rgba(109, 40, 217, 0.55),
              inset 0 2px 10px rgba(198, 244, 50, 0.55),
              inset 0 -12px 30px rgba(0, 0, 0, 0.6)
            `,
          }}
        >
          {/* Subtle Grain Overlay (seamless, no dividers) */}
          <div
            className="absolute inset-0 pointer-events-none opacity-15 mix-blend-overlay"
            style={{
              backgroundImage: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.25) 1px, transparent 1px)`,
              backgroundSize: '4px 4px',
            }}
          />

          {/* ── 2. Droplet Ripple at Sphere's Top Apex ── */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none flex flex-col items-center z-10">
            {/* Droplet falling into top apex */}
            <motion.div
              className="w-2 h-3.5 rounded-full bg-gradient-to-b from-[#c6f432] to-[#8b5cf6] shadow-[0_0_10px_#c6f432]"
              animate={{
                y: [-35, 4],
                opacity: [0, 1, 1, 0],
                scaleY: [1.3, 1.4, 0.3],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                times: [0, 0.16, 0.26, 0.28],
                ease: 'easeIn',
              }}
            />

            {/* Ripple Ring 1 */}
            <motion.div
              className="absolute top-2 rounded-full border border-[#c6f432]"
              animate={{
                scale: [0.1, 2.5],
                opacity: [0, 0.85, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                times: [0.26, 0.30, 0.65],
                ease: 'easeOut',
              }}
              style={{ width: 60, height: 25 }}
            />

            {/* Ripple Ring 2 */}
            <motion.div
              className="absolute top-2 rounded-full border border-[#a855f7]"
              animate={{
                scale: [0.1, 3.2],
                opacity: [0, 0.65, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                times: [0.30, 0.36, 0.78],
                ease: 'easeOut',
              }}
              style={{ width: 60, height: 25 }}
            />
          </div>

          {/* ═════════════════════════════════════════════════════════════════
              3. FILL THE SPHERE (NO EMPTY SPACE)
              - PREDICTED RASA label
              - Large animated taste name (~64px)
              - Confidence bar ("92% confidence")
              - Thin animated waveform (15 pH readings)
              - "Sample: Neem Water" pill at bottom
          ══════════════════════════════════════════════════════════════════ */}
          <div className="relative z-10 w-full h-full flex flex-col items-center justify-between py-7 md:py-9 px-6 text-center select-none">
            {/* Top spacing under droplet apex */}
            <div className="h-4" />

            {/* Centered Results Section */}
            <div className="flex flex-col items-center justify-center my-auto">
              <span className="text-[10px] md:text-[11px] font-mono tracking-[0.25em] text-[#8a8a93] uppercase">
                PREDICTED RASA
              </span>

              {/* Large Animated Taste Name */}
              <motion.span
                key={tasteName}
                initial={{ opacity: 0, scale: 0.9, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="text-[48px] md:text-[62px] font-bold text-white tracking-tight leading-none my-1"
                style={{
                  textShadow: '0 0 30px rgba(198, 244, 50, 0.35)',
                }}
              >
                {tasteName}
              </motion.span>

              {/* Confidence Bar */}
              <div className="flex flex-col items-center gap-1.5 mt-2">
                <span className="text-[12px] font-medium text-[#c6f432] font-mono">
                  {confidencePercent}% confidence
                </span>
                <div className="w-32 md:w-36 h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-[#7c3aed] to-[#c6f432]"
                    initial={{ width: 0 }}
                    animate={{ width: `${confidencePercent}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
              </div>

              {/* Thin Animated 15 pH Waveform */}
              <div className="flex flex-col items-center mt-3">
                <svg
                  className="w-[180px] md:w-[210px] h-[28px] overflow-visible"
                  viewBox="0 0 200 28"
                  aria-hidden="true"
                >
                  <defs>
                    <linearGradient id="waveGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#c6f432" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path
                    d={waveformPath.areaPath}
                    fill="url(#waveGrad)"
                  />
                  <motion.path
                    d={waveformPath.linePath}
                    fill="none"
                    stroke="#c6f432"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.2, ease: 'easeInOut' }}
                  />
                  {/* Glowing end point */}
                  <circle
                    cx={waveformPath.lastPt.x}
                    cy={waveformPath.lastPt.y}
                    r="2.5"
                    fill="#c6f432"
                    className="animate-pulse"
                  />
                </svg>
                <span className="text-[9px] text-[#8a8a93]/80 font-mono tracking-wider mt-0.5">
                  pH stream (15 samples)
                </span>
              </div>
            </div>

            {/* Bottom: Sample pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.08] border border-white/15 backdrop-blur-md shadow-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c6f432] animate-pulse" />
              <span className="text-[12px] font-medium text-white tracking-wide">
                Sample: {sampleName}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── In-Front Orbiting Chips (y >= 0, z-index: 35) ── */}
      {!isMobile && (
        <motion.div
          style={{ opacity: readingsOpacity }}
          className="absolute left-1/2 top-[58%] -translate-x-1/2 -translate-y-1/2 pointer-events-none z-35"
        >
          {chips.filter(c => c.isFront).map(chip => {
            const Icon = chip.icon
            return (
              <div
                key={chip.id}
                className="absolute pointer-events-auto transition-transform duration-75 -translate-x-1/2 -translate-y-1/2"
                style={{
                  transform: `translate(${chip.x}px, ${chip.y}px) scale(${chip.scale})`,
                  opacity: chip.opacity,
                }}
              >
                <div
                  className="flex items-center gap-3 px-3.5 py-2 rounded-2xl select-none"
                  style={{
                    background: 'rgba(10, 10, 15, 0.88)',
                    border: '1px solid rgba(255, 255, 255, 0.16)',
                    backdropFilter: 'blur(16px)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.7), 0 0 16px rgba(198, 244, 50, 0.15)',
                  }}
                >
                  <div
                    className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      background: `${chip.color}15`,
                      border: `1px solid ${chip.color}45`,
                    }}
                  >
                    <Icon size={13} color={chip.color} />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[9px] text-[#8a8a93] font-mono tracking-wider">
                      {chip.label}
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-[15px] font-semibold text-white tracking-tight">
                        {chip.value}
                      </span>
                      {chip.unit && (
                        <span className="text-[9px] text-[#8a8a93]">{chip.unit}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </motion.div>
      )}

      {/* ── 5. Mobile: Chips Stacked in Row Below Sphere ── */}
      {isMobile && (
        <motion.div
          style={{ opacity: readingsOpacity }}
          className="absolute bottom-[4vh] left-0 right-0 px-4 flex justify-center gap-2 pointer-events-auto z-40"
        >
          {chips.map(chip => {
            const Icon = chip.icon
            return (
              <div
                key={chip.id}
                className="flex-1 flex flex-col items-center p-2 rounded-xl text-center"
                style={{
                  background: 'rgba(10, 10, 15, 0.90)',
                  border: '1px solid rgba(255, 255, 255, 0.14)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <Icon size={13} color={chip.color} className="mb-0.5" />
                <span className="text-[8px] text-[#8a8a93] font-mono">{chip.label}</span>
                <span className="text-[12px] font-bold text-white mt-0.5">
                  {chip.value} <span className="text-[8px] font-normal text-[#8a8a93]">{chip.unit}</span>
                </span>
              </div>
            )
          })}
        </motion.div>
      )}
    </div>
  )
}
