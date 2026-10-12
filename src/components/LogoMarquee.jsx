// components/LogoMarquee.jsx
// Infinite horizontal marquee of institution-style names. Pauses on hover.
// Edge fade masks applied via CSS gradient.

import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { FlaskConical, Leaf, Microscope, Activity, Waves, Cpu } from 'lucide-react'

const LOGOS = [
  { name: 'AyurGenomics Lab',       icon: Leaf },
  { name: 'CSIR-NBRI',              icon: Microscope },
  { name: 'AIIMS Integrative Med',  icon: Activity },
  { name: 'Siddha Research Centre', icon: FlaskConical },
  { name: 'IIT Kharagpur BioSens',  icon: Cpu },
  { name: 'Kerala Ayurveda Inst.',  icon: Leaf },
  { name: 'CCRAS Delhi',            icon: Waves },
  { name: 'Patanjali Research Fdn', icon: Microscope },
]

// Duplicate for seamless loop
const DOUBLED = [...LOGOS, ...LOGOS]

export default function LogoMarquee({ id, className = '' }) {
  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const [paused, setPaused] = useState(false)

  return (
    <div
      id={id}
      className={`relative overflow-hidden py-6 select-none ${className}`}
      style={{ borderTop: '1px solid rgba(255,255,255,0.07)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label="Trusted by institutions"
      role="region"
    >
      {/* Edge fade */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 z-10"
        style={{ background: 'linear-gradient(to right, #000, transparent)' }} />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 z-10"
        style={{ background: 'linear-gradient(to left, #000, transparent)' }} />

      <motion.div
        className="flex gap-10 whitespace-nowrap"
        animate={prefersReduced ? {} : { x: ['0%', '-50%'] }}
        transition={prefersReduced ? {} : {
          duration: 30,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={paused || prefersReduced ? { animationPlayState: 'paused' } : {}}
      >
        {DOUBLED.map(({ name, icon: Icon }, i) => (
          <div
            key={i}
            className="flex items-center gap-2 text-[13px] font-medium shrink-0"
            style={{ color: 'rgba(255,255,255,0.28)' }}
          >
            <Icon size={14} style={{ opacity: 0.45 }} />
            {name}
          </div>
        ))}
      </motion.div>
    </div>
  )
}
