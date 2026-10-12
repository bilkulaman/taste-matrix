// components/FeatureCards.jsx
// 3-column feature grid with spotlight hover effect, animated bar chart and glowing orb icons.

import { useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useScrollReveal } from '../hooks/useScrollReveal.js'
import { Activity, BrainCircuit, Zap, BarChart2, Sparkles } from 'lucide-react'

const FEATURES = [
  {
    title: 'Real-Time Rasa Profiling',
    desc: 'Continuous pH, TDS and turbidity streams from the ESP32 are classified against a six-rasa Ayurvedic model every 3 seconds, with confidence scores.',
    icon: Activity,
    barHeights: [40, 65, 35, 80, 55, 70, 45],
    accentColor: '#7c3aed',
  },
  {
    title: 'ML-Driven Identification',
    desc: 'A trained classifier distinguishes Distilled Water from Haldi, Neem, Salt and Sugar extracts with > 87% confidence, even under sensor drift conditions.',
    icon: BrainCircuit,
    barHeights: [55, 30, 75, 50, 85, 40, 60],
    accentColor: '#c6f432',
  },
  {
    title: 'Adulteration Detection',
    desc: 'Statistical deviation from reference sensor fingerprints flags potential adulteration within seconds — no laboratory prep required.',
    icon: Zap,
    barHeights: [70, 45, 60, 35, 80, 55, 30],
    accentColor: '#7c3aed',
  },
]

// Mini animated bar chart at card bottom
function MiniBarChart({ heights, accentColor, inView }) {
  return (
    <div className="flex items-end gap-[3px] h-10">
      {heights.map((h, i) => (
        <motion.div
          key={i}
          className="flex-1 rounded-sm"
          style={{ background: accentColor, opacity: 0.5 }}
          initial={{ height: 0 }}
          animate={inView ? { height: `${h}%` } : { height: 0 }}
          transition={{ duration: 0.6, delay: 0.3 + i * 0.04, ease: 'easeOut' }}
        />
      ))}
    </div>
  )
}

function FeatureCard({ feature, delay }) {
  const { ref: cardRef, inView } = useScrollReveal(0.15)
  const containerRef = useRef(null)
  const [spotlight, setSpotlight] = useState({ x: 0, y: 0, visible: false })
  const Icon = feature.icon

  const handleMouseMove = useCallback((e) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    setSpotlight({ x: e.clientX - rect.left, y: e.clientY - rect.top, visible: true })
  }, [])

  const handleMouseLeave = useCallback(() => {
    setSpotlight(s => ({ ...s, visible: false }))
  }, [])

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.25 }}
        className="relative rounded-2xl overflow-hidden h-full flex flex-col p-6 gap-4 cursor-default"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {/* Cursor spotlight */}
        {spotlight.visible && (
          <div
            className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-200"
            style={{
              background: `radial-gradient(180px circle at ${spotlight.x}px ${spotlight.y}px, rgba(124,58,237,0.13), transparent)`,
            }}
          />
        )}

        <div className="relative z-10">
          {/* Icon orb */}
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center mb-4"
            style={{
              background: `radial-gradient(circle, ${feature.accentColor}33 0%, ${feature.accentColor}11 100%)`,
              border: `1px solid ${feature.accentColor}44`,
              boxShadow: `0 0 20px ${feature.accentColor}22`,
            }}
          >
            <Icon size={18} color={feature.accentColor} />
          </div>

          <h3 className="text-white font-semibold text-[15px] mb-2">{feature.title}</h3>
          <p className="text-[#8a8a93] text-[13px] leading-relaxed flex-1">{feature.desc}</p>
        </div>

        {/* Bottom illustration */}
        <div className="relative z-10 mt-auto pt-4">
          <MiniBarChart heights={feature.barHeights} accentColor={feature.accentColor} inView={inView} />
          <div className="flex items-center gap-1.5 mt-3">
            <Sparkles size={10} color={feature.accentColor} />
            <span className="text-[11px] font-medium" style={{ color: feature.accentColor }}>
              Live sensor data
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function FeatureCards() {
  const { ref: headRef, inView: headInView } = useScrollReveal(0.2)

  return (
    <section className="relative max-w-7xl mx-auto px-5 md:px-8 pb-24">
      {/* Purple edge streaks */}
      <div
        className="pointer-events-none absolute left-0 top-0 bottom-0 w-px"
        style={{
          background: 'linear-gradient(to bottom, transparent, rgba(124,58,237,0.5) 40%, rgba(124,58,237,0.2) 70%, transparent)',
          animation: 'glowPulse 4s ease-in-out infinite',
        }}
      />
      <div
        className="pointer-events-none absolute right-0 top-0 bottom-0 w-px"
        style={{
          background: 'linear-gradient(to bottom, transparent, rgba(124,58,237,0.5) 40%, rgba(124,58,237,0.2) 70%, transparent)',
          animation: 'glowPulse 4s ease-in-out infinite 2s',
        }}
      />

      {/* Section header */}
      <motion.div
        ref={headRef}
        initial={{ opacity: 0, y: 24 }}
        animate={headInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="text-center mb-14 pt-4"
      >
        <div
          className="inline-flex items-center px-3 h-6 rounded-full text-[11px] font-medium mb-6 tracking-widest uppercase"
          style={{ border: '1px solid rgba(255,255,255,0.12)', color: '#8a8a93' }}
        >
          [ Capabilities ]
        </div>
        <h2
          className="text-white font-bold leading-[1.06] tracking-[-0.025em] mb-3"
          style={{ fontSize: 'clamp(32px, 4vw, 56px)' }}
        >
          Sensor Intelligence<br />for Ayurvedic Quality
        </h2>
        <p className="text-[#8a8a93] text-[14px] max-w-lg mx-auto leading-relaxed">
          Three electrochemical signals. Six rasas. Zero ambiguity.
        </p>
      </motion.div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {FEATURES.map((f, i) => (
          <FeatureCard key={f.title} feature={f} delay={i * 0.08} />
        ))}
      </div>
    </section>
  )
}
