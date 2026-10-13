// src/components/dashboard/NewTestModal.jsx
// Centered modal (backdrop blur+dim):
// Sample dropdown, ESP32 device status, editable test name,
// readings slider, notes, Cancel / Start Test → adds card + toast.

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Wifi, AlertCircle, CheckCircle, ChevronDown, Check } from 'lucide-react'
import { getSamples, addKanbanCard } from '../../api.js'
import { useDeviceStatus } from '../../hooks/useDeviceStatus.js'

const SAMPLE_COLORS = {
  'distilled-water': '#60a5fa', 'salt-water': '#94a3b8',
  'sugar-water': '#c6f432', 'haldi-water': '#f59e0b', 'neem-water': '#34d399',
}

// Inline editable text
function InlineEdit({ value, onChange, placeholder }) {
  const [editing, setEditing] = useState(false)
  const inputRef = useRef()
  useEffect(() => { if (editing) inputRef.current?.select() }, [editing])

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={value}
        onChange={e => onChange(e.target.value)}
        onBlur={() => setEditing(false)}
        onKeyDown={e => e.key === 'Enter' && setEditing(false)}
        className="bg-transparent text-white text-[14px] font-medium outline-none border-b border-[rgba(198,244,50,0.5)] pb-0.5 w-full"
        placeholder={placeholder}
        aria-label="Edit test name"
      />
    )
  }
  return (
    <button onClick={() => setEditing(true)}
      className="text-[14px] font-medium text-white hover:text-[#c6f432] transition-colors text-left"
      aria-label="Click to edit test name">
      {value || <span className="text-[#8a8a93]">{placeholder}</span>}
      <span className="text-[#8a8a93] text-[11px] ml-2">(click to edit)</span>
    </button>
  )
}

// Sample picker
function SamplePicker({ value, onChange, samples }) {
  const [open, setOpen] = useState(false)
  const ref = useRef()
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])
  const active = samples.find(s => s.id === value)
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] text-left transition-colors"
        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
        {active && <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: SAMPLE_COLORS[active.id] ?? '#8a8a93' }} />}
        <span className="flex-1 text-white">{active?.name ?? 'Select sample…'}</span>
        <ChevronDown size={13} className="text-[#8a8a93]" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            className="absolute top-full mt-1.5 left-0 right-0 z-10 rounded-xl py-1 overflow-hidden"
            style={{ background: 'rgba(10,10,15,0.97)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(16px)' }}>
            {samples.map(s => (
              <li key={s.id}>
                <button onClick={() => { onChange(s.id); setOpen(false) }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-[rgba(255,255,255,0.05)] transition-colors">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: SAMPLE_COLORS[s.id] ?? '#8a8a93' }} />
                  <span className="text-[13px] text-white">{s.name}</span>
                  {s.id === value && <Check size={12} color="#c6f432" className="ml-auto" />}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}

// ESP32 device status
function DeviceStatus() {
  const { online } = useDeviceStatus({ refreshMs: 3000 })
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
      {online
        ? <><Wifi size={13} color="#c6f432" /><span className="text-[12px] text-white">ESP32 connected</span>
            <span className="ml-auto flex items-center gap-1 text-[10px] text-[#34d399]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#34d399] animate-pulse" />Online
            </span></>
        : <><AlertCircle size={13} color="#f87171" /><span className="text-[12px] text-[#f87171]">Device offline</span></>
      }
    </div>
  )
}

export function NewTestModal({ open, onClose, onTestStarted }) {
  const [samples, setSamples] = useState([])
  const [sampleId, setSampleId] = useState('')
  const [testName, setTestName] = useState('')
  const [duration, setDuration] = useState(30)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getSamples().then(s => { setSamples(s); setSampleId(s[0]?.id ?? '') })
  }, [])

  // ESC to close
  useEffect(() => {
    if (!open) return
    const h = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [open, onClose])

  async function handleStart() {
    if (!sampleId) return
    setLoading(true)
    const sample = samples.find(s => s.id === sampleId)
    await addKanbanCard({
      sample: sample?.name ?? sampleId,
      rasa: 'Tikta',
      confidence: 0.5,
      status: 'Analyzing',
    })
    setLoading(false)
    onTestStarted?.({ sampleId, testName, duration, notes })
    onClose()
    // Reset
    setTestName('')
    setNotes('')
    setDuration(30)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(14px)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.93, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.94, y: 16 }}
            transition={{ type: 'spring', damping: 28, stiffness: 340 }}
            className="relative rounded-[32px] p-7 w-full max-w-md flex flex-col gap-4 shadow-2xl"
            style={{
              background: 'rgba(15, 15, 22, 0.98)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              boxShadow: '0 24px 64px rgba(0, 0, 0, 0.75), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            }}
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="New Test"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-[18px] font-semibold text-white tracking-tight">New Test Assay</h2>
              <button
                onClick={onClose}
                aria-label="Close"
                className="w-8 h-8 flex items-center justify-center rounded-full text-[#8a8a93] hover:text-white hover:bg-white/10 transition-colors"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              >
                <X size={15} />
              </button>
            </div>

            {/* Sample */}
            <div>
              <label className="block text-[11px] text-[#8a8a93] uppercase tracking-widest mb-1.5">Sample</label>
              <SamplePicker value={sampleId} onChange={setSampleId} samples={samples} />
            </div>

            {/* Device status */}
            <DeviceStatus />

            {/* Test name */}
            <div>
              <label className="block text-[11px] text-[#8a8a93] uppercase tracking-widest mb-1.5">Test Name</label>
              <div className="px-3 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <InlineEdit value={testName} onChange={setTestName} placeholder="e.g. Batch A run 3" />
              </div>
            </div>

            {/* Duration slider */}
            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-[11px] text-[#8a8a93] uppercase tracking-widest">Reading duration</label>
                <span className="text-[12px] text-white tabular-nums" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{duration}s</span>
              </div>
              <input type="range" min={10} max={120} step={5} value={duration}
                onChange={e => setDuration(Number(e.target.value))}
                className="w-full h-1 rounded-full appearance-none cursor-pointer"
                style={{ accentColor: '#c6f432', background: `linear-gradient(to right, #c6f432 ${((duration-10)/110)*100}%, rgba(255,255,255,0.1) 0%)` }}
                aria-label="Duration in seconds"
              />
              <div className="flex justify-between text-[10px] text-[#8a8a93] mt-1">
                <span>10s</span><span>120s</span>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-[11px] text-[#8a8a93] uppercase tracking-widest mb-1.5">Notes</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={2}
                placeholder="Optional observations…"
                className="w-full rounded-xl px-3 py-2 text-[13px] text-white placeholder-[#8a8a93] outline-none resize-none transition-colors"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                aria-label="Notes"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-1">
              <button onClick={onClose}
                className="flex-1 py-2.5 rounded-full text-[13px] font-medium text-[#8a8a93] hover:text-white transition-colors"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                Cancel
              </button>
              <button onClick={handleStart} disabled={!sampleId || loading}
                className="flex-1 py-2.5 rounded-full text-[13px] font-semibold text-black transition-all"
                style={{
                  background: sampleId ? '#c6f432' : 'rgba(255,255,255,0.1)',
                  color: sampleId ? '#000' : '#8a8a93',
                  boxShadow: sampleId ? '0 0 20px rgba(198,244,50,0.3)' : 'none',
                  opacity: loading ? 0.7 : 1,
                }}>
                {loading ? 'Starting…' : 'Start Test'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
