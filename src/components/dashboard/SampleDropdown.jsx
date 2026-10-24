// src/components/dashboard/SampleDropdown.jsx
// Rich sample selector: colored dot + sample name + last tested time

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Check } from 'lucide-react'
import { getSamples, setActiveSample, getActiveSampleId } from '../../api.js'

const SAMPLE_COLORS = {
  'distilled-water': '#60a5fa',
  'haldi-water':      '#f59e0b',
  'basic-water':      '#38bdf8',
  'chalk-water':      '#a78bfa',
}

function dot(id) {
  return SAMPLE_COLORS[id] ?? '#8a8a93'
}

export function SampleDropdown({ onChange }) {
  const [samples, setSamples] = useState([])
  const [activeId, setActiveId] = useState(getActiveSampleId())
  const [open, setOpen] = useState(false)
  const ref = useRef()

  useEffect(() => {
    getSamples().then(setSamples)
  }, [])

  // Close on outside click
  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function select(id) {
    setActiveId(id)
    setActiveSample(id)
    setOpen(false)
    onChange?.(id)
  }

  const active = samples.find(s => s.id === activeId) ?? samples[0]

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[13px] font-medium text-white transition-colors"
        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {active && (
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: dot(active.id) }} />
        )}
        <span>{active?.name ?? 'Select sample…'}</span>
        <ChevronDown size={12} className="text-[#8a8a93]" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0,  scale: 1 }}
            exit={{ opacity: 0, y: -4,   scale: 0.97 }}
            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
            role="listbox"
            className="absolute top-full mt-1.5 right-0 z-50 rounded-2xl overflow-hidden py-1.5 min-w-[220px]"
            style={{ background: 'rgba(10,10,15,0.95)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)' }}
          >
            {samples.map(s => (
              <li key={s.id}>
                <button
                  role="option"
                  aria-selected={s.id === activeId}
                  onClick={() => select(s.id)}
                  className="w-full flex items-center gap-3 px-3.5 py-2 text-left hover:bg-[rgba(255,255,255,0.05)] transition-colors"
                >
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: dot(s.id) }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium text-white">{s.name}</div>
                    <div className="text-[11px] text-[#8a8a93] truncate">{s.rasa}</div>
                  </div>
                  {s.id === activeId && <Check size={13} color="#c6f432" />}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}
