// pages/Landing.jsx
// Full landing page with pinned hero scroll transition (300vh, inner sticky 100svh):
// p 0.00-0.30: Hero headline, paragraph, stat and pills exit (opacity 1 -> 0, blur 0 -> 12px, y 0 -> -40px, staggered).
//              Plant scale 1 -> 1.15, y 0 -> -4vh, slowly rotate 0 -> 4deg, purple glow expands.
// p 0.30-0.60: Plant sinks into giant rising planet sphere (ScrollSequence).
// p 0.60-1.00: "[ LIVE SAMPLE ]", 2-line headline, 3 orbiting glass chips, falling droplet with ripple.
// Exit: after p=1 sticky releases and stats section scrolls in normally.
// Fixed: "Start Tracking" button and scroll indicator positioned without overlap.

import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion'
import { ArrowRight, Zap } from 'lucide-react'

import Navbar               from '../components/Navbar.jsx'
import TypedHeadline        from '../components/TypedHeadline.jsx'
import LiveDataCard         from '../components/LiveDataCard.jsx'
import TagPills             from '../components/TagPills.jsx'
import LogoMarquee          from '../components/LogoMarquee.jsx'
import StatsRow             from '../components/StatsRow.jsx'
import FeatureCards         from '../components/FeatureCards.jsx'
import Pipeline             from '../components/Pipeline.jsx'
import LivePreview          from '../components/LivePreview.jsx'
import ScrollProgressBar    from '../components/ScrollProgressBar.jsx'
import ScrollRevealSection  from '../components/ScrollRevealSection.jsx'
import HeroPlant            from '../components/HeroPlant.jsx'
import ScrollSequence       from '../components/ScrollSequence.jsx'
import { useSmoothScroll }  from '../hooks/useSmoothScroll.js'

// ─── Stat counter for "4.8" ──────────────────────────────────────────────────
function StatCounter({ triggered }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!triggered) return
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) { setVal(4.8); return }
    const start = performance.now()
    const tick = (now) => {
      const p = Math.min((now - start) / 1400, 1)
      const ease = 1 - Math.pow(1 - p, 3)
      setVal(parseFloat((ease * 4.8).toFixed(1)))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [triggered])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={triggered ? { opacity: 1 } : {}}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="flex flex-col"
    >
      <span
        className="font-bold text-white leading-none"
        style={{ fontSize: 'clamp(32px, 3.2vw, 42px)', letterSpacing: '-0.03em' }}
      >
        {val.toFixed(1)}
        <span style={{ color: '#c6f432', fontSize: 24 }}>*</span>
      </span>
      <span className="text-[#8a8a93] text-[11px] md:text-[12px] mt-1 leading-snug">
        Trusted by research<br />institutions across India
      </span>
    </motion.div>
  )
}

// ─── Background ambient hero glow (breathing, violet-to-purple with parallax) ──
function HeroGlow({ introProgress, scrollY = 0 }) {
  const parallaxY = Math.min(scrollY * 0.22, 160)

  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 will-change-transform"
      style={{
        transform: `translateY(${parallaxY}px)`,
        background: `
          radial-gradient(ellipse 80% 55% at 50% 110%,
            rgba(109,40,217,${0.65 * introProgress}) 0%,
            rgba(124,58,237,${0.35 * introProgress}) 35%,
            transparent 70%)
        `,
        animation: 'glowBreathe 8s ease-in-out infinite',
      }}
    />
  )
}

// ─── Faint guide lines with scroll parallax ─────────────────────────────────
function GuideLines({ scrollY = 0 }) {
  const lineShift = Math.min(scrollY * 0.12, 80)

  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden will-change-transform"
      style={{ transform: `translateY(${lineShift}px)` }}
      aria-hidden="true"
    >
      {/* Vertical thirds */}
      <div className="absolute top-0 bottom-0 w-px opacity-20"
        style={{ left: '33.333%', background: 'rgba(255,255,255,0.08)' }} />
      <div className="absolute top-0 bottom-0 w-px opacity-20"
        style={{ left: '66.666%', background: 'rgba(255,255,255,0.08)' }} />
      {/* Horizontal middle */}
      <div className="absolute left-0 right-0 h-px opacity-20"
        style={{ top: '50%', background: 'rgba(255,255,255,0.08)' }} />
    </div>
  )
}

// ─── Landing page ────────────────────────────────────────────────────────────
export default function Landing() {
  // Activate buttery smooth momentum scrolling
  useSmoothScroll(true)

  // ─── Preferences & Viewport ───────────────────────────────────────────────
  const [prefersReduced, setPrefersReduced] = useState(false)
  const [isMobile, setIsMobile]             = useState(false)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    setPrefersReduced(reduced)

    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // ─── Pinned Hero 300vh Scroll Tracking ────────────────────────────────────
  const pinnedHeroRef = useRef(null)
  const { scrollYProgress: rawProgress } = useScroll({
    target: pinnedHeroRef,
    offset: ['start start', 'end end'],
  })

  // Smooth spring on progress: stiffness 120, damping 30
  const springProgress = useSpring(rawProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.0001,
  })

  // ─── p 0.00 - 0.30: Hero Elements Exit (Staggered) ────────────────────────
  // 1. Headline exits 0.00 -> 0.20
  const heroHeadlineOpacity = useTransform(springProgress, [0.00, 0.20], [1, 0])
  const heroHeadlineBlur    = useTransform(springProgress, [0.00, 0.20], ['blur(0px)', 'blur(12px)'])
  const heroHeadlineY       = useTransform(springProgress, [0.00, 0.20], [0, -40])

  // 2. Paragraph exits 0.05 -> 0.25
  const heroParagraphOpacity = useTransform(springProgress, [0.05, 0.25], [1, 0])
  const heroParagraphBlur    = useTransform(springProgress, [0.05, 0.25], ['blur(0px)', 'blur(12px)'])
  const heroParagraphY       = useTransform(springProgress, [0.05, 0.25], [0, -40])

  // 3. Stat & Pills & CTA exit 0.10 -> 0.30
  const heroStatOpacity = useTransform(springProgress, [0.10, 0.30], [1, 0])
  const heroStatBlur    = useTransform(springProgress, [0.10, 0.30], ['blur(0px)', 'blur(12px)'])
  const heroStatY       = useTransform(springProgress, [0.10, 0.30], [0, -40])

  const heroPillsOpacity = useTransform(springProgress, [0.08, 0.28], [1, 0])
  const heroPillsBlur    = useTransform(springProgress, [0.08, 0.28], ['blur(0px)', 'blur(12px)'])
  const heroPillsY       = useTransform(springProgress, [0.08, 0.28], [0, -40])

  // ─── Plant Sequence Transitions: ──────────────────────────────────────────
  // p 0.00-0.30: scale 1 -> 1.15, y 0 -> -4vh, slowly rotate 0 -> 4deg
  // p 0.30-0.60: plant fades to opacity 0 and blur 10px as it sinks into sphere (scale 1.15 -> 0.8)
  const plantScale = useTransform(springProgress, [0.00, 0.30, 0.58], [1, 1.15, 0.8])
  const plantY     = useTransform(springProgress, [0.00, 0.30, 0.58], ['0vh', '-4vh', '-4vh'])
  const plantRot   = useTransform(springProgress, [0.00, 0.30], ['0deg', '4deg'])
  const plantOpacity = useTransform(springProgress, [0.00, 0.30, 0.52], [1, 1, 0])
  const plantBlur    = useTransform(springProgress, [0.00, 0.30, 0.52], ['blur(0px)', 'blur(0px)', 'blur(10px)'])

  // Purple glow starts expanding in p 0.00-0.30
  const glowScale   = useTransform(springProgress, [0.00, 0.30, 0.55], [1, 1.6, 2.2])
  const glowOpacity = useTransform(springProgress, [0.00, 0.30, 0.52], [1, 1, 0])

  // Intro sequence state
  const [phase, setPhase]         = useState('intro') // 'intro' | 'hero'
  const [glowReady, setGlowReady] = useState(false)
  const [statReady, setStatReady] = useState(false)
  const [ctaReady, setCtaReady]   = useState(false)
  const [introProgress, setIntroProgress] = useState(0)

  // Global scroll tracking for sticky navbar & scroll indicator
  const [scrollY, setScrollY]   = useState(0)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      setScrollY(window.scrollY)
      setScrolled(window.scrollY > 24)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Intro ramp: plant & glow fade in over 1.4s
  useEffect(() => {
    const start = performance.now()
    const tick = (now) => {
      const p = Math.min((now - start) / 1400, 1)
      const ease = 1 - Math.pow(1 - p, 3)
      setIntroProgress(ease)
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)

    // After 1.4s glow ramps
    const t1 = setTimeout(() => setGlowReady(true), 1400)
    // After 2.5s switch to hero phase
    const t2 = setTimeout(() => setPhase('hero'), 2500)
    // Stat counter after
    const t3 = setTimeout(() => setStatReady(true), 2800)
    // CTA pill
    const t4 = setTimeout(() => setCtaReady(true), 3200)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4) }
  }, [])

  // Smooth scroll down past the hero
  const handleScrollDown = () => {
    const target = document.getElementById('marquee-section')
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="min-h-screen bg-black font-sans relative overflow-x-clip">
      {/* ── Top Scroll Progress Bar ── */}
      <ScrollProgressBar />

      {/* ── Global CSS animations ── */}
      <style>{`
        @keyframes glowBreathe {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.72; }
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
      `}</style>

      <Navbar scrolled={scrolled} />

      {/* ═══════════════════════════════════════════════════════════════════
          PINNED SECTION
          - Height: 300vh (prefers-reduced-motion: auto)
          - Inner sticky container: 100svh
      ══════════════════════════════════════════════════════════════════════ */}
      <section
        ref={pinnedHeroRef}
        className="relative overflow-visible w-full"
        style={{ height: prefersReduced ? 'auto' : '300vh' }}
      >
        <div
          className={
            prefersReduced
              ? 'relative min-h-[100svh] w-full overflow-visible'
              : 'sticky top-0 h-[100svh] w-full overflow-hidden'
          }
        >
          <HeroGlow introProgress={glowReady ? 1 : introProgress * 0.3} scrollY={scrollY} />
          <GuideLines scrollY={scrollY} />

          {/* ── Intro overlay: logo + wordmark centred ── */}
          <AnimatePresence>
            {phase === 'intro' && (
              <motion.div
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 z-30 flex flex-col items-center justify-start pt-10 pointer-events-none"
              >
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="flex items-center gap-2"
                >
                  <Zap size={16} fill="#c6f432" color="#c6f432" />
                  <span className="text-white text-[15px] font-semibold tracking-tight">TasteMatrix</span>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Main Hero Grid Layout (100svh fit) ── */}
          <div
            className="relative z-10 max-w-7xl mx-auto px-5 md:px-8 h-full grid grid-cols-1 md:grid-cols-[46%_50%] md:gap-[4%] pt-16 md:pt-20 pb-6 md:pb-8 overflow-visible"
          >
            {/* ── Column 1 (Left): Text Column (max 46% width) ── */}
            <div className="flex flex-col justify-between h-full z-10 max-w-full overflow-visible">
              {/* Top/Middle: Headline + Paragraph (staggered exit) */}
              <div className="flex flex-col gap-3 md:gap-4 mt-auto md:my-auto">
                <AnimatePresence>
                  {phase === 'hero' && (
                    <div className="flex flex-col gap-3 md:gap-4">
                      {/* Headline with staggered blur/y/opacity exit */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6 }}
                        style={
                          prefersReduced
                            ? {}
                            : {
                                opacity: heroHeadlineOpacity,
                                filter: heroHeadlineBlur,
                                y: heroHeadlineY,
                              }
                        }
                      >
                        <TypedHeadline />
                      </motion.div>

                      {/* Paragraph with staggered blur/y/opacity exit */}
                      <motion.p
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                        style={
                          prefersReduced
                            ? {}
                            : {
                                opacity: heroParagraphOpacity,
                                filter: heroParagraphBlur,
                                y: heroParagraphY,
                              }
                        }
                        className="text-[#8a8a93] leading-relaxed max-w-sm text-[13px] md:text-[14px]"
                      >
                        An electronic tongue built on ESP32 reads pH, TDS and turbidity of aqueous dravya extracts and classifies their Ayurvedic rasa — no titration, no waiting for a lab.
                      </motion.p>
                    </div>
                  )}
                </AnimatePresence>
              </div>

              {/* Bottom-Left: Stat counter ("4.8 Trusted by research") */}
              <motion.div
                className="mt-auto pt-4 md:pt-6"
                style={
                  prefersReduced
                    ? {}
                    : {
                        opacity: heroStatOpacity,
                        filter: heroStatBlur,
                        y: heroStatY,
                      }
                }
              >
                <StatCounter triggered={statReady} />
              </motion.div>
            </div>

            {/* ── Column 2 (Right): Plant Column (starts at 50%) ── */}
            <div className="relative flex items-center justify-center h-full overflow-visible">
              <HeroPlant
                className="w-full h-full"
                plantScale={prefersReduced ? undefined : plantScale}
                plantY={prefersReduced ? undefined : plantY}
                plantRotate={prefersReduced ? undefined : plantRot}
                plantOpacity={prefersReduced ? undefined : plantOpacity}
                plantFilter={prefersReduced ? undefined : plantBlur}
                glowScale={prefersReduced ? undefined : glowScale}
                glowOpacity={prefersReduced ? undefined : glowOpacity}
              />
            </div>

            {/* ── Bottom-Center: "Start Tracking" Pill ── */}
            <AnimatePresence>
              {ctaReady && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  style={
                    prefersReduced
                      ? {}
                      : {
                          opacity: heroPillsOpacity,
                          filter: heroPillsBlur,
                          y: heroPillsY,
                        }
                  }
                  className="absolute bottom-8 md:bottom-10 left-1/2 -translate-x-1/2 z-30 pointer-events-auto"
                >
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-2 h-10 px-6 rounded-full text-black text-[13px] font-semibold transition-transform duration-150 active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c6f432]"
                    style={{
                      background: '#c6f432',
                      boxShadow: '0 0 24px rgba(198,244,50,0.35)',
                    }}
                  >
                    <ArrowRight size={14} />
                    Start Tracking
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Top-Right Floating Live Data Card ── */}
            <AnimatePresence>
              {phase === 'hero' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  style={
                    prefersReduced
                      ? {}
                      : {
                          opacity: heroPillsOpacity,
                          filter: heroPillsBlur,
                          y: heroPillsY,
                        }
                  }
                  className="hidden xl:block absolute top-20 right-8 z-20 pointer-events-auto"
                >
                  <LiveDataCard />
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Bottom-Right Floating Tag Pills ── */}
            <AnimatePresence>
              {ctaReady && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  style={
                    prefersReduced
                      ? {}
                      : {
                          opacity: heroPillsOpacity,
                          filter: heroPillsBlur,
                          y: heroPillsY,
                        }
                  }
                  className="hidden xl:block absolute bottom-8 right-8 z-20 pointer-events-auto"
                >
                  <TagPills />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ═════════════════════════════════════════════════════════════════
              PINNED SCROLL SEQUENCE (SPHERE, READINGS, ORBITING CHIPS, DROPLET)
              Active for p 0.30 - 1.00
          ══════════════════════════════════════════════════════════════════ */}
          {!prefersReduced && (
            <ScrollSequence progress={springProgress} isMobile={isMobile} />
          )}
        </div>
      </section>

      {/* ── Reduced motion static section fallback ── */}
      {prefersReduced && (
        <section className="relative w-full py-20 px-5 border-t border-white/10">
          <ScrollSequence progress={1.0} isMobile={isMobile} />
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          LOGO MARQUEE (with Scroll Reveal)
      ══════════════════════════════════════════════════════════════════════ */}
      <ScrollRevealSection delay={0.05} threshold={0.1}>
        <LogoMarquee id="marquee-section" />
      </ScrollRevealSection>

      {/* ═══════════════════════════════════════════════════════════════════
          STATS ROW (items animate on scroll)
      ══════════════════════════════════════════════════════════════════════ */}
      <StatsRow />

      {/* ═══════════════════════════════════════════════════════════════════
          FEATURE CARDS (grid & spotlight on hover)
      ══════════════════════════════════════════════════════════════════════ */}
      <FeatureCards />

      {/* ═══════════════════════════════════════════════════════════════════
          PIPELINE + LIVE DEMO + CTA
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-5 md:px-8 pb-32">
        {/* Section label */}
        <ScrollRevealSection delay={0.02} threshold={0.15}>
          <div className="flex justify-center mb-10">
            <div
              className="inline-flex items-center px-3 h-6 rounded-full text-[11px] font-medium tracking-widest uppercase"
              style={{ border: '1px solid rgba(255,255,255,0.12)', color: '#8a8a93' }}
            >
              [ Data flow ]
            </div>
          </div>
        </ScrollRevealSection>

        {/* Animated pipeline nodes */}
        <Pipeline />

        {/* Live demo preview + CTA */}
        <div className="mt-14 grid md:grid-cols-2 gap-8 items-center max-w-3xl mx-auto">
          <ScrollRevealSection delay={0.06} threshold={0.15}>
            <LivePreview />
          </ScrollRevealSection>

          <ScrollRevealSection delay={0.14} threshold={0.15}>
            <div className="flex flex-col gap-5">
              <h3
                className="text-white font-bold leading-tight tracking-tight"
                style={{ fontSize: 'clamp(22px, 3vw, 32px)' }}
              >
                See every dravya<br />reading as it happens.
              </h3>
              <p className="text-[#8a8a93] text-[13px] leading-relaxed">
                The dashboard streams ESP32 sensor data in real time, classifies rasa using on-device ML, and flags deviations from authenticated reference fingerprints.
              </p>
              <Link
                to="/dashboard"
                className="self-start flex items-center gap-2 h-10 px-5 rounded-full text-black text-[13px] font-semibold transition-transform duration-150 active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c6f432]"
                style={{ background: 'white' }}
              >
                <ArrowRight size={14} />
                Open Dashboard
              </Link>
            </div>
          </ScrollRevealSection>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════════════════════════════ */}
      <ScrollRevealSection delay={0.04} threshold={0.1}>
        <footer
          className="border-t px-5 md:px-8 py-8"
          style={{ borderColor: 'rgba(255,255,255,0.08)' }}
        >
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Zap size={14} fill="#c6f432" color="#c6f432" />
              <span className="text-white text-[13px] font-semibold">TasteMatrix</span>
              <span className="text-[#8a8a93] text-[12px] ml-2">E-Tongue for Ayurvedic Dravya Identification</span>
            </div>
            <span className="text-[#8a8a93] text-[12px]">
              ESP32 · pH · TDS · Turbidity · Rasa Classification
            </span>
          </div>
        </footer>
      </ScrollRevealSection>
    </div>
  )
}
