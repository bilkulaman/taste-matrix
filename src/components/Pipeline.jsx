// components/Pipeline.jsx
// Animated data-flow pipeline: Sample → Sensors → ESP32 → Cloud → Taste Result
// A dot travels along the connecting line between nodes on loop.

import { useRef } from 'react'
import { motion } from 'framer-motion'
import { FlaskConical, Cpu, Cloud, Leaf, Activity } from 'lucide-react'
import { useScrollReveal } from '../hooks/useScrollReveal.js'

const NODES = [
  { label: 'Sample',       sub: 'Dravya extract',  icon: FlaskConical, color: '#8b5cf6' },
  { label: 'Sensors',      sub: 'pH · TDS · NTU',  icon: Activity,     color: '#7c3aed' },
  { label: 'ESP32',        sub: 'Edge processing',  icon: Cpu,          color: '#6d28d9' },
  { label: 'Cloud',        sub: 'ML inference',     icon: Cloud,        color: '#5b21b6' },
  { label: 'Taste Result', sub: 'Rasa + confidence',icon: Leaf,         color: '#c6f432' },
]

function Node({ node, i, inView }) {
  const Icon = node.icon
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center gap-2 z-10"
    >
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center"
        style={{
          background: `radial-gradient(circle, ${node.color}33, ${node.color}11)`,
          border: `1px solid ${node.color}55`,
          boxShadow: `0 0 20px ${node.color}22`,
        }}
      >
        <Icon size={18} color={node.color} />
      </div>
      <span className="text-white text-[12px] font-semibold text-center leading-tight">{node.label}</span>
      <span className="text-[#8a8a93] text-[10px] text-center">{node.sub}</span>
    </motion.div>
  )
}

export default function Pipeline() {
  const { ref, inView } = useScrollReveal(0.2)

  return (
    <div ref={ref} className="relative max-w-4xl mx-auto px-5 md:px-8 py-10">
      <div className="flex items-start justify-between relative">
        {/* Connecting line */}
        <div
          className="absolute top-6 left-6 right-6 h-px"
          style={{ background: 'linear-gradient(to right, rgba(124,58,237,0.2), rgba(198,244,50,0.3), rgba(124,58,237,0.2))' }}
        />

        {/* Travelling dot */}
        {inView && (
          <motion.div
            className="absolute top-[22px] w-2.5 h-2.5 rounded-full z-20"
            style={{
              background: '#c6f432',
              boxShadow: '0 0 10px #c6f432, 0 0 20px #c6f43277',
              left: 24,
            }}
            animate={{ left: ['24px', 'calc(100% - 24px)'] }}
            transition={{ duration: 3.5, repeat: Infinity, repeatDelay: 1, ease: 'easeInOut' }}
          />
        )}

        {NODES.map((node, i) => (
          <Node key={node.label} node={node} i={i} inView={inView} />
        ))}
      </div>
    </div>
  )
}
