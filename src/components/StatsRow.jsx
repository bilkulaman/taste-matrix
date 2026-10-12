// components/StatsRow.jsx
// Three impact statistics with count-up on scroll.

import { Leaf, Microscope, Activity } from 'lucide-react'
import { motion } from 'framer-motion'
import { useScrollReveal } from '../hooks/useScrollReveal.js'
import { useCountUp } from '../hooks/useCountUp.js'

const STATS = [
  {
    icon: Leaf,
    value: 60,
    suffix: '-70%',
    label: 'Saffron adulterated',
    desc: 'More than 60–70% of commercial saffron (Kumkuma) samples carry colour adulterants undetectable by sight or smell alone.',
  },
  {
    icon: Microscope,
    value: 80,
    suffix: '%',
    label: 'Saraca asoca misidentified',
    desc: 'Field surveys show 80% of "Ashoka" bark sold in Indian markets is substituted with morphologically similar species.',
  },
  {
    icon: Activity,
    value: 48,
    suffix: '%',
    label: 'Ginseng products diluted',
    desc: '48% of ginseng-labelled products assessed in quality studies contained less than 50% of the claimed active ginsenoside load.',
  },
]

function StatItem({ stat, delay }) {
  const { ref, inView } = useScrollReveal(0.3)
  const count = useCountUp(stat.value, 1400, inView, 0)
  const Icon = stat.icon

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col gap-3"
    >
      <div className="flex items-center gap-2">
        <span
          className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
          style={{ background: 'rgba(198,244,50,0.12)', border: '1px solid rgba(198,244,50,0.25)' }}
        >
          <Icon size={13} color="#c6f432" />
        </span>
        <span className="text-white font-bold" style={{ fontSize: 28, lineHeight: 1 }}>
          {count}{stat.suffix}
        </span>
      </div>
      <div>
        <p className="text-white text-[13px] font-semibold mb-1">{stat.label}</p>
        <p className="text-[#8a8a93] text-[13px] leading-relaxed">{stat.desc}</p>
      </div>
    </motion.div>
  )
}

export default function StatsRow() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-7xl mx-auto px-5 md:px-8 py-20">
      {STATS.map((stat, i) => (
        <StatItem key={stat.label} stat={stat} delay={i * 0.12} />
      ))}
    </div>
  )
}
