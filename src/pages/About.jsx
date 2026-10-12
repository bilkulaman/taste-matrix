// pages/About.jsx
// Stage 8: Project context, hardware architecture, methodology & validation.
// Panel-in-panel architecture: 32px frosted panels, 22px nested pill cards, 22px headers, 40px round icon buttons.

import { motion } from 'framer-motion'
import { Zap, Cpu, Code2, Mail, ExternalLink, ShieldCheck, Microscope, Layers } from 'lucide-react'
import { PanelCard, PillCard, RoundIconButton } from '../components/ui/index.js'

const STACK = [
  { label: 'Microcontroller Node',  v: 'ESP32 (Xtensa Dual-Core 240MHz)', icon: Cpu },
  { label: 'pH Sensor Array',       v: 'Analog Glass Probe + ADS1115 I2C ADC', icon: Microscope },
  { label: 'TDS Salinity Sensor',   v: 'Gravity Analog Electrical Conductivity Meter v1.0', icon: Layers },
  { label: 'Optical Turbidity',     v: 'SEN0189 Infrared Transmittance & Photodiode', icon: ShieldCheck },
  { label: 'Telemetry Link',        v: 'Wi-Fi 802.11 b/g/n · WebSockets / MQTT / REST', icon: Zap },
  { label: 'Frontend Interface',    v: 'React 19 + Vite + Tailwind CSS v4 + Framer Motion', icon: Code2 },
]

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

      {/* ── Panel 1: Mission & Clinical Rationale ── */}
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

      {/* ── Panel 2: Hardware & Software Stack ── */}
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
    </>
  )
}
