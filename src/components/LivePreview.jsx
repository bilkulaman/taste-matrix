// components/LivePreview.jsx
// Small live-data preview block that shows the latest reading from the API.

import { motion, AnimatePresence } from 'framer-motion'
import { useLiveReading } from '../hooks/useLiveReading.js'
import { Activity, Droplets, Waves, Leaf } from 'lucide-react'

function Metric({ label, value, unit, icon: Icon }) {
  return (
    <div
      className="flex items-center justify-between px-4 py-3 rounded-xl"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div className="flex items-center gap-2">
        <Icon size={13} color="#8a8a93" />
        <span className="text-[#8a8a93] text-[12px]">{label}</span>
      </div>
      <AnimatePresence mode="wait">
        <motion.span
          key={value}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          className="text-white text-[13px] font-semibold"
        >
          {value} <span className="text-[#8a8a93] font-normal text-[11px]">{unit}</span>
        </motion.span>
      </AnimatePresence>
    </div>
  )
}

export default function LivePreview() {
  const { reading, loading } = useLiveReading()

  if (loading || !reading) {
    return (
      <div className="rounded-2xl overflow-hidden animate-pulse" style={{ height: 200, background: 'rgba(255,255,255,0.04)' }} />
    )
  }

  return (
    <div
      className="rounded-2xl overflow-hidden p-5 flex flex-col gap-3"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] text-[#8a8a93] uppercase tracking-widest">Live Sample</span>
        <span
          className="flex items-center gap-1.5 text-[11px] font-medium"
          style={{ color: '#c6f432' }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#c6f432] animate-pulse" />
          {reading.sample}
        </span>
      </div>
      <Metric label="pH"        value={reading.ph.toFixed(2)}        unit=""    icon={Droplets} />
      <Metric label="TDS"       value={reading.tds}                   unit="ppm" icon={Waves} />
      <Metric label="Turbidity" value={reading.turbidity.toFixed(1)} unit="NTU" icon={Activity} />
      <div
        className="flex items-center justify-between mt-1 px-4 py-3 rounded-xl"
        style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.25)' }}
      >
        <div className="flex items-center gap-2">
          <Leaf size={13} color="#c6f432" />
          <span className="text-[12px] text-[#8a8a93]">Predicted Rasa</span>
        </div>
        <span className="text-white text-[13px] font-bold">{reading.predictedTaste}</span>
      </div>
    </div>
  )
}
