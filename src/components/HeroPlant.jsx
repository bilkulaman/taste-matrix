// components/HeroPlant.jsx
// Static image + CSS/Framer Motion animated hero plant (NO 3D, NO three.js, NO canvas).
//
// Asset: src/assets/plant-alpha.png (real RGBA transparency).
// Supports scroll sequence controls (scale, y, rotate, opacity, filter, glowScale, glowOpacity).

import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import plantImg from '../assets/plant-alpha.png'

// ─── Floating particles (14 dots: 7 back, 7 front) ───────────────────────────
const PARTICLES = [
  { id: 1,  x: '18%', yStart: 40, size: 3.5, color: '#c6f432', dur: 6.2, delay: 0.2, drift: 12, layer: 'back'  },
  { id: 2,  x: '34%', yStart: 55, size: 2.5, color: '#d8b4fe', dur: 7.5, delay: 1.1, drift: -14, layer: 'back' },
  { id: 3,  x: '50%', yStart: 30, size: 4.0, color: '#c6f432', dur: 5.8, delay: 0.6, drift: 8,   layer: 'back'  },
  { id: 4,  x: '66%', yStart: 60, size: 3.0, color: '#d8b4fe', dur: 8.0, delay: 2.0, drift: -10, layer: 'back' },
  { id: 5,  x: '82%', yStart: 45, size: 3.5, color: '#c6f432', dur: 6.5, delay: 1.5, drift: 15,  layer: 'back'  },
  { id: 6,  x: '28%', yStart: 70, size: 2.0, color: '#d8b4fe', dur: 7.0, delay: 3.0, drift: -8,   layer: 'back'  },
  { id: 7,  x: '74%', yStart: 65, size: 3.0, color: '#c6f432', dur: 6.8, delay: 2.5, drift: 10,  layer: 'back'  },
  { id: 8,  x: '24%', yStart: 50, size: 3.0, color: '#d8b4fe', dur: 6.0, delay: 0.4, drift: -12, layer: 'front' },
  { id: 9,  x: '42%', yStart: 35, size: 4.5, color: '#c6f432', dur: 5.5, delay: 1.8, drift: 16,  layer: 'front' },
  { id: 10, x: '58%', yStart: 55, size: 3.5, color: '#d8b4fe', dur: 7.2, delay: 0.9, drift: -15, layer: 'front' },
  { id: 11, x: '76%', yStart: 40, size: 4.0, color: '#c6f432', dur: 6.4, delay: 2.2, drift: 14,  layer: 'front' },
  { id: 12, x: '32%', yStart: 65, size: 2.5, color: '#c6f432', dur: 7.8, delay: 3.2, drift: -9,  layer: 'front' },
  { id: 13, x: '68%', yStart: 45, size: 3.5, color: '#d8b4fe', dur: 6.6, delay: 1.4, drift: 11,  layer: 'front' },
  { id: 14, x: '48%', yStart: 70, size: 2.8, color: '#c6f432', dur: 8.2, delay: 2.8, drift: -13, layer: 'front' },
]

function ParticleDot({ p, prefersReduced }) {
  if (prefersReduced) return null

  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        left: p.x,
        bottom: `${p.yStart}px`,
        width: p.size,
        height: p.size,
        background: p.color,
        boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
      }}
      animate={{
        y: [0, -220],
        x: [0, p.drift, 0],
        opacity: [0, 0.85, 0],
        scale: [0.6, 1.2, 0.5],
      }}
      transition={{
        duration: p.dur,
        repeat: Infinity,
        delay: p.delay,
        ease: 'easeInOut',
      }}
    />
  )
}

export default function HeroPlant({
  scrollProgress,
  className = '',
  // Sequence controls
  plantScale: extScale,
  plantY: extY,
  plantRotate: extRot,
  plantOpacity: extOpacity,
  plantFilter: extFilter,
  glowScale: extGlowScale,
  glowOpacity: extGlowOpacity,
}) {
  const containerRef = useRef(null)

  const [isTouch, setIsTouch] = useState(false)
  const [prefersReduced, setPrefersReduced] = useState(false)

  // Detect touch and reduced-motion preferences
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const touch = window.matchMedia('(pointer: coarse)').matches || !window.matchMedia('(hover: hover)').matches
    setPrefersReduced(reduced)
    setIsTouch(touch)
  }, [])

  // ─── Mouse Parallax MotionValues ──────────────────────────────────────────
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  // Spring physics config for smooth damping
  const springCfg = { damping: 28, stiffness: 140, mass: 0.8 }

  // Plant translates ±14px
  const plantRawX = useTransform(mouseX, [-1, 1], [-14, 14])
  const plantRawY = useTransform(mouseY, [-1, 1], [-14, 14])

  const plantX = useSpring(plantRawX, springCfg)
  const plantY = useSpring(plantRawY, springCfg)

  // Glow moves opposite at ±24px
  const glowRawX = useTransform(mouseX, [-1, 1], [24, -24])
  const glowRawY = useTransform(mouseY, [-1, 1], [24, -24])

  const glowX = useSpring(glowRawX, springCfg)
  const glowY = useSpring(glowRawY, springCfg)

  // ─── Default scroll transforms fallback ───────────────────────────────────
  const dummyProgress = useMotionValue(0)
  const activeProgress = scrollProgress || dummyProgress

  const defScrollScale = useTransform(activeProgress, [0, 1], [1, 0.88])
  const defScrollYMove = useTransform(activeProgress, [0, 1], [0, -60])
  const defScrollFade  = useTransform(activeProgress, [0, 0.8, 1], [1, 0.92, 0.78])

  // Mouse event handlers
  const handleMouseMove = (e) => {
    if (isTouch || prefersReduced || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2)
    const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2)
    mouseX.set(Math.max(-1, Math.min(1, x)))
    mouseY.set(Math.max(-1, Math.min(1, y)))
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
  }

  const backParticles  = useMemo(() => PARTICLES.filter(p => p.layer === 'back'), [])
  const frontParticles = useMemo(() => PARTICLES.filter(p => p.layer === 'front'), [])

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative w-full h-full flex items-center justify-center select-none ${className}`}
      aria-label="Ayurvedic Dravya Plant Hero Visualisation"
    >
      {/* ═════════════════════════════════════════════════════════════════════
          SIBLING 1: PURPLE GLOW (ABSOLUTELY-POSITIONED SIBLING OF THE PLANT)
          - Sized at least 140vw x 100vh
          - Centered on the plant
          - Breathes & expands on scroll
      ══════════════════════════════════════════════════════════════════════ */}
      <motion.div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: 'max(140vw, 1400px)',
          height: 'max(100vh, 800px)',
          x: isTouch || prefersReduced ? 0 : glowX,
          y: isTouch || prefersReduced ? 0 : glowY,
          scale: extGlowScale || 1,
          opacity: extGlowOpacity || 1,
        }}
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div
          className="w-full h-full"
          style={{
            background: `
              radial-gradient(ellipse 50% 45% at 50% 50%,
                rgba(147, 51, 234, 0.75) 0%,
                rgba(124, 58, 237, 0.48) 30%,
                rgba(88, 28, 135, 0.22) 55%,
                transparent 74%)
            `,
            filter: 'blur(36px)',
          }}
          animate={prefersReduced ? {} : {
            scale: [1, 1.08, 1],
            opacity: [0.7, 1.0, 0.7],
          }}
          transition={prefersReduced ? {} : {
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </motion.div>

      {/* ═════════════════════════════════════════════════════════════════════
          SIBLING 2: FLOATING PARTICLES (BEHIND PLANT)
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="absolute inset-0 pointer-events-none">
        {backParticles.map(p => (
          <ParticleDot key={p.id} p={p} prefersReduced={prefersReduced} />
        ))}
      </div>

      {/* ═════════════════════════════════════════════════════════════════════
          SIBLING 3: PLANT ELEMENT (REAL TRANSPARENT PNG)
          - Animated parent divs (intro, scroll sequence, mouse parallax, float)
          - Height: 68vh (desktop), 58vh (mobile)
      ══════════════════════════════════════════════════════════════════════ */}
      <motion.div
        className="relative flex items-center justify-center pointer-events-none"
        initial={{ opacity: 0, scale: 0.92, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{
          duration: 1.4,
          ease: [0.22, 1, 0.36, 1],
        }}
        style={{
          scale: extScale || (prefersReduced ? 1 : defScrollScale),
          y: extY || (prefersReduced ? 0 : defScrollYMove),
          rotate: extRot || 0,
          opacity: extOpacity || (prefersReduced ? 1 : defScrollFade),
          filter: extFilter || 'none',
        }}
      >
        {/* Parent Div 1: Mouse Parallax Translation */}
        <motion.div
          style={{
            x: isTouch || prefersReduced ? 0 : plantX,
            y: isTouch || prefersReduced ? 0 : plantY,
          }}
        >
          {/* Parent Div 2: Idle Float (y ±10px, 6s sine loop) */}
          <motion.div
            animate={prefersReduced ? {} : {
              y: [-10, 10, -10],
            }}
            transition={prefersReduced ? {} : {
              duration: 6,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <img
              src={plantImg}
              alt="Ayurvedic Dravya Plant"
              className="h-[58vh] md:h-[68vh] max-h-[68vh] w-auto max-w-full object-contain select-none pointer-events-none block"
              draggable={false}
            />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* ═════════════════════════════════════════════════════════════════════
          SIBLING 4: FLOATING PARTICLES (IN FRONT OF PLANT)
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="absolute inset-0 pointer-events-none">
        {frontParticles.map(p => (
          <ParticleDot key={p.id} p={p} prefersReduced={prefersReduced} />
        ))}
      </div>
    </div>
  )
}
