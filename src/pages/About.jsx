// pages/About.jsx
// Project context, pipeline, roadmap, guide acknowledgement, team.
// Panel-in-panel architecture: 32px frosted panels, 22px nested pill cards.

import { useEffect, useRef, useState } from 'react'
import { motion, animate, useInView } from 'framer-motion'
import {
  Zap, Cpu, Code2, Mail, ExternalLink, ShieldCheck, Microscope, Layers,
  Droplet, Cloud, Sparkles, ArrowUpRight,
} from 'lucide-react'
import { PanelCard, PillCard, RoundIconButton } from '../components/ui/index.js'

import guidePhoto from '../assets/team/guide.jpg'
import anushreePhoto from '../assets/team/anushree.jpg'
import amanPhoto from '../assets/team/aman.jpg'
import khushiPhoto from '../assets/team/khushi.jpg'
import tinkuPhoto from '../assets/team/tinku.jpg'

const STACK = [
  { label: 'Microcontroller Node',  v: 'ESP32 (Xtensa Dual-Core 240MHz)', icon: Cpu },
  { label: 'pH Sensor Array',       v: 'Analog Glass Probe + ADS1115 I2C ADC', icon: Microscope },
  { label: 'TDS Salinity Sensor',   v: 'Gravity Analog Electrical Conductivity Meter v1.0', icon: Layers },
  { label: 'Optical Turbidity',     v: 'SEN0189 Infrared Transmittance & Photodiode', icon: ShieldCheck },
  { label: 'Telemetry Link',        v: 'Wi-Fi 802.11 b/g/n · WebSockets / MQTT / REST', icon: Zap },
  { label: 'Frontend Interface',    v: 'React 19 + Vite + Tailwind CSS v4 + Framer Motion', icon: Code2 },
]

const STATS = [
  { value: 70, prefix: '60-', suffix: '%', label: 'Saffron', note: 'reported adulterated in the market' },
  { value: 80, suffix: '%', label: 'Saraca asoca', note: 'reported adulterated in the market' },
  { value: 48, suffix: '%', label: 'Ginseng', note: 'reported adulterated in the market' },
]

const PIPELINE = [
  { icon: Droplet, title: 'Sample', text: 'Aqueous extract of the dravya' },
  { icon: Microscope, title: 'Sensors', text: 'pH, TDS and turbidity probes' },
  { icon: Cpu, title: 'ESP32', text: 'Reads and sends over Wi-Fi' },
  { icon: Cloud, title: 'Cloud', text: 'Stores readings, runs prediction' },
  { icon: Sparkles, title: 'Taste Result', text: 'Dominant rasa and confidence' },
]

const ROADMAP = [
  { status: 'Live', tone: 'live', text: 'Real-time readings and rule-based rasa prediction' },
  { status: 'Coming soon', tone: 'soon', text: 'Machine learning model trained on our measured data' },
  { status: 'Coming soon', tone: 'soon', text: 'Blockchain-backed test records' },
]

const TEAM = [
  { name: 'Anushree Sharma', role: 'Team Leader', work: 'Led the project and kept every part moving together', photo: anushreePhoto },
  { name: 'Aman Yadav', role: 'Website Development', work: 'Built the dashboard, backend and live data pipeline', photo: amanPhoto, github: 'https://github.com/bilkulaman' },
  { name: 'Khushi', role: 'Hardware Development', work: 'Built and calibrated the ESP32 sensor setup', photo: khushiPhoto },
  { name: 'Tinku Ranjan Nath', role: 'Hardware Development', work: 'Built and calibrated the ESP32 sensor setup', photo: tinkuPhoto },
]

const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
}

function CountUp({ to, prefix = '', suffix = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  const [n, setN] = useState(0)
  useEffect(() => {
    if (!inView) return
    const c = animate(0, to, { duration: 1.4, ease: 'easeOut', onUpdate: (v) => setN(Math.round(v)) })
    return () => c.stop()
  }, [inView, to])
  return <span ref={ref}>{prefix}{n}{suffix}</span>
}

function Photo({ src, alt, className = '' }) {
  const [loaded, setLoaded] = useState(false)
  return (
    <div className={`relative overflow-hidden bg-[var(--tm-subtle-bg)] ${className}`}>
      {!loaded && <div className="absolute inset-0 animate-pulse bg-[var(--tm-subtle-bg)]" />}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className={`w-full h-full object-cover object-top transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  )
}

function SectionLabel({ children }) {
  return (
    <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--tm-lime)]">
      {children}
    </span>
  )
}

export default function About() {
  return (
    <>
      {/* ── Top Header Bar ── */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[var(--tm-subtle-border)]">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--tm-subtle-bg)] border border-[var(--tm-subtle-border)] text-[12px]">
          <Zap size={13} color="var(--tm-lime)" fill="var(--tm-lime)" />
          <span className="text-[var(--tm-text-muted)]">TasteMatrix Research Monograph</span>
        </div>

        <div className="flex items-center gap-2">
          <RoundIconButton icon={ExternalLink} label="Documentation Monograph" />
          <RoundIconButton icon={Mail} label="Contact Research Team" />
        </div>
      </header>

      {/* ── Page Title ── */}
      <section>
        <h1 className="text-[36px] font-light text-[var(--tm-text-primary)] tracking-[-0.03em] leading-tight">
          About TasteMatrix
        </h1>
        <p className="text-[13px] text-[var(--tm-text-muted)] mt-0.5">
          Electrochemical sensor fusion for objective Ayurvedic dravya quality control & authentication
        </p>
      </section>

      {/* ── Panel: The Problem ── */}
      <motion.div {...reveal}>
        <PanelCard padding={28}>
          <SectionLabel>[ THE PROBLEM ]</SectionLabel>
          <h2 className="text-[22px] font-semibold text-[var(--tm-text-primary)] tracking-tight mt-1 mb-2">
            Ayurvedic raw drugs are judged by taste, and taste can't be audited.
          </h2>
          <p className="text-[12px] text-[var(--tm-text-muted)] leading-relaxed max-w-3xl mb-5">
            Identifying a dravya's rasa today depends on human tasting or slow lab work, and adulteration
            is widespread. A fast, objective check at the point of sale is missing.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
              >
                <PillCard className="p-5">
                  <div className="text-[34px] font-light tracking-[-0.03em] text-[var(--tm-text-primary)] leading-none">
                    <CountUp to={s.value} prefix={s.prefix} suffix={s.suffix} />
                  </div>
                  <div className="text-[13px] font-semibold text-[var(--tm-text-primary)] mt-2">{s.label}</div>
                  <div className="text-[11px] text-[var(--tm-text-muted)]">{s.note}</div>
                </PillCard>
              </motion.div>
            ))}
          </div>
        </PanelCard>
      </motion.div>

      {/* ── Panel 1: Mission & Clinical Rationale ── */}
      <motion.div {...reveal}>
        <PanelCard padding={28}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[22px] font-semibold text-[var(--tm-text-primary)] tracking-tight">
              Scientific Objective & Methodology
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <PillCard className="p-5 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--tm-lime)]">
                  The Clinical Challenge
                </span>
                <h3 className="text-[16px] font-semibold text-[var(--tm-text-primary)] mt-1 mb-2">
                  Standardizing Classical Dravya Identification
                </h3>
                <p className="text-[12px] text-[var(--tm-text-muted)] leading-relaxed">
                  In classical Ayurveda, raw botanical dravya is graded through organoleptic inspection:
                  Rasa (taste), Guna (quality), Virya (potency), and Vipaka (post-digestive effect).
                  However, human taste assessment suffers from sensory fatigue, subjective variance,
                  and inability to detect subtle adulteration with industrial extenders.
                </p>
              </div>
            </PillCard>

            <PillCard className="p-5 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--tm-lime)]">
                  The Sensor-Fusion Solution
                </span>
                <h3 className="text-[16px] font-semibold text-[var(--tm-text-primary)] mt-1 mb-2">
                  Objective Electrochemical Fingerprinting
                </h3>
                <p className="text-[12px] text-[var(--tm-text-muted)] leading-relaxed">
                  TasteMatrix translates classical Ayurvedic rasas into measurable electrochemical
                  coordinates. By simultaneously interrogating hydrogen-ion activity (pH), ionic conductivity
                  (TDS), and optical turbidity (NTU), the system forms a resilient 3D phase-space signature
                  capable of authenticating raw extracts in under 10 seconds.
                </p>
              </div>
            </PillCard>
          </div>
        </PanelCard>
      </motion.div>

      {/* ── Panel: How it works ── */}
      <motion.div {...reveal}>
        <PanelCard padding={28}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[22px] font-semibold text-[var(--tm-text-primary)] tracking-tight">
              How it works
            </h2>
            <span className="text-[12px] text-[var(--tm-text-muted)] font-mono">Sample to rasa</span>
          </div>

          <div className="relative">
            {/* connecting line with a travelling dot (desktop only) */}
            <div className="hidden md:block absolute left-[10%] right-[10%] top-[34px] h-px bg-[var(--tm-subtle-border)]">
              <motion.span
                className="absolute -top-[3px] w-[7px] h-[7px] rounded-full bg-[var(--tm-lime)]"
                style={{ boxShadow: '0 0 12px var(--tm-lime)' }}
                animate={{ left: ['0%', '100%'] }}
                transition={{ duration: 4, ease: 'linear', repeat: Infinity }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
              {PIPELINE.map(({ icon: Icon, title, text }, i) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.6 }}
                >
                  <PillCard className="p-4 flex md:flex-col items-center md:text-center gap-3.5">
                    <span className="w-10 h-10 rounded-2xl flex items-center justify-center bg-[var(--tm-subtle-bg)] text-[var(--tm-lime)] flex-shrink-0">
                      <Icon size={18} strokeWidth={2} />
                    </span>
                    <div>
                      <div className="text-[13px] font-semibold text-[var(--tm-text-primary)]">{title}</div>
                      <div className="text-[11px] text-[var(--tm-text-muted)] leading-snug">{text}</div>
                    </div>
                  </PillCard>
                </motion.div>
              ))}
            </div>
          </div>
        </PanelCard>
      </motion.div>

      {/* ── Panel 2: Hardware & Software Stack ── */}
      <motion.div {...reveal}>
        <PanelCard padding={28}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[22px] font-semibold text-[var(--tm-text-primary)] tracking-tight">
              Hardware & Computational Stack
            </h2>
            <span className="text-[12px] text-[var(--tm-text-muted)] font-mono">Architecture v2.4</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {STACK.map(({ label, v, icon: Icon }) => (
              <PillCard key={label} className="p-4 flex items-center gap-3.5 hover:scale-[1.01] transition-transform">
                <span className="w-10 h-10 rounded-2xl flex items-center justify-center bg-[var(--tm-subtle-bg)] text-[var(--tm-lime)] flex-shrink-0">
                  <Icon size={18} strokeWidth={2} />
                </span>
                <div className="min-w-0">
                  <span className="text-[10px] font-mono text-[var(--tm-text-muted)] uppercase block truncate">
                    {label}
                  </span>
                  <span className="text-[13px] font-semibold text-[var(--tm-text-primary)] tracking-tight block truncate">
                    {v}
                  </span>
                </div>
              </PillCard>
            ))}
          </div>
        </PanelCard>
      </motion.div>

      {/* ── Panel: Roadmap ── */}
      <motion.div {...reveal}>
        <PanelCard padding={28}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[22px] font-semibold text-[var(--tm-text-primary)] tracking-tight">Roadmap</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ROADMAP.map((r) => (
              <PillCard key={r.text} className="p-5 flex flex-col gap-3">
                <span
                  className={`self-start text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                    r.tone === 'live'
                      ? 'text-[var(--tm-lime)] border-[var(--tm-lime)]'
                      : 'text-[var(--tm-text-muted)] border-[var(--tm-subtle-border)]'
                  }`}
                >
                  {r.status}
                </span>
                <p className="text-[13px] text-[var(--tm-text-primary)] leading-snug">{r.text}</p>
              </PillCard>
            ))}
          </div>
        </PanelCard>
      </motion.div>

      {/* ── Panel: Project Guide ── */}
      <motion.div {...reveal}>
        <PanelCard padding={28}>
          <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8 items-center">
            <motion.div
              className="relative mx-auto w-full max-w-[300px]"
              whileHover={{ rotate: -1.5, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 200, damping: 18 }}
            >
              <div className="absolute -inset-6 rounded-[40px] bg-[#7c3aed]/30 blur-3xl" aria-hidden="true" />
              <Photo
                src={guidePhoto}
                alt="Dr. Abhishek Sharma, Program Head, ECE-VLSI"
                className="relative rounded-[28px] aspect-[4/5] border border-[var(--tm-subtle-border)]"
              />
            </motion.div>

            <div>
              <SectionLabel>[ PROJECT GUIDE ]</SectionLabel>
              <h2 className="text-[36px] md:text-[44px] font-light text-[var(--tm-text-primary)] tracking-[-0.03em] leading-[1.05] mt-2">
                Dr. Abhishek Sharma
              </h2>
              <p className="text-[13px] text-[var(--tm-text-muted)] mt-1">
                Program Head, ECE-VLSI · KIET Deemed to be University
              </p>
              <p className="text-[13px] text-[var(--tm-text-muted)] leading-relaxed mt-5 max-w-2xl">
                TasteMatrix began with a problem Dr. Sharma put in front of us, and it reached the bench
                because of his direction. He framed the question, backed our approach, and guided the
                hardware that turns a drop of extract into a reading. Every sensor on this page exists
                because he asked us to look closer. We are grateful for his mentorship and for the
                standard he set for this project.
              </p>
              <div className="flex flex-wrap gap-2 mt-5">
                {['Problem statement', 'Hardware guidance', 'Mentorship'].map((t) => (
                  <span
                    key={t}
                    className="text-[11px] px-3 py-1.5 rounded-full bg-[var(--tm-subtle-bg)] border border-[var(--tm-subtle-border)] text-[var(--tm-text-primary)]"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <p className="text-[12px] font-mono text-[var(--tm-lime)] mt-6">Guided by Dr. Abhishek Sharma</p>
            </div>
          </div>
        </PanelCard>
      </motion.div>

      {/* ── Panel: Team ── */}
      <motion.div {...reveal}>
        <PanelCard padding={28}>
          <SectionLabel>[ THE TEAM ]</SectionLabel>
          <h2 className="text-[22px] font-semibold text-[var(--tm-text-primary)] tracking-tight mt-1 mb-5">
            The people behind the build
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TEAM.map((m, i) => (
              <motion.div
                key={m.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.6 }}
                whileHover={{ y: -4 }}
              >
                <PillCard className="p-4 flex flex-col gap-3 h-full">
                  <Photo
                    src={m.photo}
                    alt={m.name}
                    className="rounded-2xl aspect-[4/5] w-[120px]"
                  />
                  <div>
                    <div className="text-[14px] font-semibold text-[var(--tm-text-primary)]">{m.name}</div>
                    <div className="text-[11px] font-mono uppercase tracking-wide text-[var(--tm-lime)] mt-0.5">{m.role}</div>
                    <p className="text-[12px] text-[var(--tm-text-muted)] leading-snug mt-2">{m.work}</p>
                  </div>
                  {m.github && (
                    <a
                      href={m.github}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`${m.name} on GitHub`}
                      className="mt-auto self-start inline-flex items-center gap-1.5 text-[11px] text-[var(--tm-text-muted)] hover:text-[var(--tm-text-primary)] transition-colors"
                    >
                      GitHub <ArrowUpRight size={12} />
                    </a>
                  )}
                </PillCard>
              </motion.div>
            ))}
          </div>

          <p className="text-[12px] text-[var(--tm-text-muted)] mt-6">
            Built at KIET Deemed to be University for the Ministry of Ayush / AIIA problem statement.
          </p>
        </PanelCard>
      </motion.div>
    </>
  )
}
