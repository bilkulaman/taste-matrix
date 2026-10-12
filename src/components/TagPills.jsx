// components/TagPills.jsx
// Bottom-right cluster of frosted tag pills; one lime-highlighted pill cycles every 2s.

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Activity, Leaf, FlaskConical, Microscope, Waves } from 'lucide-react'

const TAGS = [
  { label: 'Rasa Detection',    icon: Leaf },
  { label: 'Adulterant Screen', icon: Microscope },
  { label: 'pH Analysis',       icon: Activity },
  { label: 'TDS Profiling',     icon: Waves },
  { label: 'Turbidity Scan',    icon: FlaskConical },
]

export default function TagPills() {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setActive(i => (i + 1) % TAGS.length), 2000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="flex flex-wrap gap-2 justify-end max-w-[260px]" role="list">
      {TAGS.map(({ label, icon: Icon }, i) => {
        const isActive = i === active
        return (
          <motion.div
            key={label}
            layout
            role="listitem"
            className="flex items-center gap-1.5 px-3 h-7 rounded-full text-[12px] font-medium transition-colors duration-300 cursor-default"
            style={{
              background: isActive ? 'rgba(198,244,50,0.15)' : 'rgba(255,255,255,0.06)',
              border: isActive
                ? '1px solid rgba(198,244,50,0.4)'
                : '1px solid rgba(255,255,255,0.08)',
              color: isActive ? '#c6f432' : '#8a8a93',
            }}
            animate={{ scale: isActive ? 1.04 : 1 }}
            transition={{ duration: 0.25 }}
          >
            <Icon size={11} />
            {label}
          </motion.div>
        )
      })}
    </div>
  )
}
