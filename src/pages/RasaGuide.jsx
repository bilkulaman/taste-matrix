// pages/RasaGuide.jsx
// Stage 5: Reference guide to the 6 Ayurvedic rasas with electrochemical sensor fingerprints.
// Panel-in-panel architecture: 32px frosted panels, 22px nested pill cards, 22px headers, 40px round icon buttons.

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Leaf, Droplets, Waves, Activity, BookOpen, Sparkles, Filter, Info } from 'lucide-react'
import RasaBadge from '../components/RasaBadge.jsx'
import { PanelCard, PillCard, RoundIconButton } from '../components/ui/index.js'

const RASAS = [
  {
    name: 'Madhura',
    sanskrit: 'मधुर',
    meaning: 'Sweet',
    elements: 'Prithvi + Jala (Earth + Water)',
    dosha: 'Increases Kapha · Decreases Vata & Pitta',
    action: 'Nourishing, anabolic, calming, increases bulk body tissue.',
    examples: ['Milk', 'Ghee', 'Rice', 'Wheat', 'Dates', 'Licorice root'],
    sensor: { ph: '6.5 – 7.2', tds: '100 – 500 ppm', turbidity: '< 5 NTU' },
    tip: 'Moderate TDS, neutral pH, and minimal light scattering characterize Madhura.',
    color: '#c6f432',
  },
  {
    name: 'Amla',
    sanskrit: 'अम्ल',
    meaning: 'Sour',
    elements: 'Prithvi + Agni (Earth + Fire)',
    dosha: 'Increases Pitta & Kapha · Decreases Vata',
    action: 'Stimulates digestive Agni, increases salivation, enhances nutrient absorption.',
    examples: ['Amalaki', 'Tamarind', 'Lemon', 'Vinegar', 'Yoghurt', 'Haritaki'],
    sensor: { ph: '3.0 – 5.5', tds: '50 – 300 ppm', turbidity: '1 – 15 NTU' },
    tip: 'Markedly acidic pH (< 5.5) serves as the primary sensor classifier for Amla.',
    color: '#fb923c',
  },
  {
    name: 'Lavana',
    sanskrit: 'लवण',
    meaning: 'Salty',
    elements: 'Jala + Agni (Water + Fire)',
    dosha: 'Increases Pitta & Kapha · Decreases Vata',
    action: 'Softening, hydrating, mildly laxative, stimulates digestive juices.',
    examples: ['Rock salt (Saindhava)', 'Sea salt', 'Black salt', 'Saline extracts'],
    sensor: { ph: '6.8 – 7.8', tds: '> 3 000 ppm', turbidity: '< 3 NTU' },
    tip: 'TDS exceeding 3,000 ppm with neutral pH is the definitive Lavana hallmark.',
    color: '#38bdf8',
  },
  {
    name: 'Katu',
    sanskrit: 'कटु',
    meaning: 'Pungent',
    elements: 'Agni + Vayu (Fire + Air)',
    dosha: 'Increases Pitta & Vata · Decreases Kapha',
    action: 'Deeply kindles Agni, stimulates diuresis, disperses metabolic toxins.',
    examples: ['Black pepper', 'Ginger (Shunti)', 'Garlic', 'Mustard', 'Trikatu'],
    sensor: { ph: '5.0 – 6.5', tds: '200 – 800 ppm', turbidity: '5 – 30 NTU' },
    tip: 'Moderate turbidity from essential-oil volatiles with mildly acidic pH.',
    color: '#f43f5e',
  },
  {
    name: 'Tikta',
    sanskrit: 'तिक्त',
    meaning: 'Bitter',
    elements: 'Akasha + Vayu (Ether + Air)',
    dosha: 'Increases Vata · Decreases Pitta & Kapha',
    action: 'Detoxifying, anti-inflammatory, febrifuge, deep blood purification.',
    examples: ['Neem', 'Kutki', 'Guduchi', 'Andrographis (Kalmegh)', 'Haldi'],
    sensor: { ph: '5.0 – 6.5', tds: '80 – 200 ppm', turbidity: '10 – 90 NTU' },
    tip: 'High turbidity from polyphenol & alkaloid particulates (curcumin, nimbin) signals Tikta.',
    color: '#818cf8',
  },
  {
    name: 'Kashaya',
    sanskrit: 'कषाय',
    meaning: 'Astringent',
    elements: 'Vayu + Prithvi (Air + Earth)',
    dosha: 'Increases Vata · Decreases Pitta & Kapha',
    action: 'Drying, wound binding, haemostatic, consolidates cellular structure.',
    examples: ['Arjuna bark', 'Lodhra', 'Ashoka', 'Pomegranate rind', 'Triphala'],
    sensor: { ph: '4.5 – 6.0', tds: '150 – 600 ppm', turbidity: '15 – 50 NTU' },
    tip: 'Tannin-dense astringent extracts generate elevated turbidity with acidic drift.',
    color: '#a78bfa',
  },
]

export default function RasaGuide() {
  const [selectedRasa, setSelectedRasa] = useState(null)

  return (
    <>
      {/* ── Top Header Bar ── */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[var(--tm-subtle-border)]">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--tm-subtle-bg)] border border-[var(--tm-subtle-border)] text-[12px]">
          <Sparkles size={13} color="var(--tm-lime)" />
          <span className="text-[var(--tm-text-muted)]">Ayurvedic Hexa-Taste Framework (षड्रस)</span>
        </div>

        <div className="flex items-center gap-2">
          <RoundIconButton icon={BookOpen} label="Pharmacological Monograph" />
          <RoundIconButton icon={Filter} label="Filter by Mahabhuta" />
        </div>
      </header>

      {/* ── Page Title ── */}
      <section>
        <h1 className="text-[36px] font-light text-[var(--tm-text-primary)] tracking-[-0.03em] leading-tight">
          Rasa Guide
        </h1>
        <p className="text-[13px] text-[var(--tm-text-muted)] mt-0.5">
          Classical Ayurvedic taste pharmacology coupled with modern electrochemical sensor fingerprints
        </p>
      </section>

      {/* ── Main Panel: 6 Rasas in Nested Pill Cards ── */}
      <PanelCard padding={28}>
        <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
          <div>
            <h2 className="text-[22px] font-semibold text-[var(--tm-text-primary)] tracking-tight">
              The Six Rasas & Sensor Fingerprints
            </h2>
            <p className="text-[12px] text-[var(--tm-text-muted)]">
              Select any rasa card to inspect biochemical correlates and clinical thresholds
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {RASAS.map((r) => {
            const isSelected = selectedRasa?.name === r.name
            return (
              <PillCard
                key={r.name}
                onClick={() => setSelectedRasa(isSelected ? null : r)}
                className="p-5 flex flex-col justify-between transition-all hover:scale-[1.01]"
                style={{
                  border: isSelected ? `2px solid ${r.color}` : undefined,
                  boxShadow: isSelected ? `0 0 20px ${r.color}33` : undefined,
                }}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[22px] font-bold text-[var(--tm-text-primary)] tracking-tight">
                        {r.name}
                      </span>
                      <span className="text-[14px] text-[var(--tm-text-muted)] font-serif">
                        ({r.sanskrit})
                      </span>
                    </div>
                    <span className="text-[12px] font-medium" style={{ color: r.color }}>
                      {r.meaning} Rasa
                    </span>
                  </div>

                  <span
                    className="text-[10px] font-mono px-2 py-0.5 rounded-full"
                    style={{ background: `${r.color}20`, color: r.color, border: `1px solid ${r.color}40` }}
                  >
                    {r.elements.split(' ')[0]}
                  </span>
                </div>

                {/* Dosha & Action */}
                <div className="flex flex-col gap-2 my-2 text-[12px] leading-relaxed">
                  <p className="text-[var(--tm-text-muted)]">
                    <strong className="text-[var(--tm-text-primary)]">Dosha Effect:</strong> {r.dosha}
                  </p>
                  <p className="text-[var(--tm-text-muted)]">
                    <strong className="text-[var(--tm-text-primary)]">Action:</strong> {r.action}
                  </p>
                </div>

                {/* Sensor Fingerprint Pill Box */}
                <div className="mt-3 p-3 rounded-2xl bg-[var(--tm-subtle-bg)] border border-[var(--tm-subtle-border)]">
                  <div className="flex items-center justify-between text-[10px] text-[var(--tm-text-muted)] uppercase font-mono mb-2">
                    <span>Sensor Thresholds</span>
                    <span style={{ color: r.color }}>Calibrated</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-1 rounded-lg bg-[var(--tm-card-bg)]">
                      <span className="text-[9px] text-[var(--tm-text-muted)] block font-mono">pH</span>
                      <span className="text-[11px] font-mono font-semibold text-[var(--tm-text-primary)]">
                        {r.sensor.ph}
                      </span>
                    </div>
                    <div className="p-1 rounded-lg bg-[var(--tm-card-bg)]">
                      <span className="text-[9px] text-[var(--tm-text-muted)] block font-mono">TDS</span>
                      <span className="text-[11px] font-mono font-semibold text-[var(--tm-text-primary)]">
                        {r.sensor.tds}
                      </span>
                    </div>
                    <div className="p-1 rounded-lg bg-[var(--tm-card-bg)]">
                      <span className="text-[9px] text-[var(--tm-text-muted)] block font-mono">NTU</span>
                      <span className="text-[11px] font-mono font-semibold text-[var(--tm-text-primary)]">
                        {r.sensor.turbidity}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Herb Examples */}
                <div className="mt-3 pt-2 border-t border-[var(--tm-subtle-border)] flex items-center justify-between text-[11px] text-[var(--tm-text-muted)]">
                  <span className="truncate">Ex: {r.examples.slice(0, 3).join(', ')}…</span>
                  <span className="text-[var(--tm-lime)] font-mono text-[10px] ml-2">Detail →</span>
                </div>
              </PillCard>
            )
          })}
        </div>
      </PanelCard>
    </>
  )
}
