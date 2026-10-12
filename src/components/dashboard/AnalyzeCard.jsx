// src/components/dashboard/AnalyzeCard.jsx
// "Analyze Sample" nested pill card: button → progress ring → scanning → rasa reveal
// with confidence ring, interpretation, pause/stop, Save + Re-run. Uses token variables.

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, Square, RotateCcw, Save, Sparkles } from 'lucide-react'
import { predictTaste, saveToHistory } from '../../api.js'
import { PillCard } from '../ui/index.js'

const RASA_COLORS = {
  Madhura: '#c6f432', Lavana: '#94a3b8', Amla: '#fb923c',
  Tikta: '#818cf8', Katu: '#f43f5e', Kashaya: '#a78bfa',
  Anabhilashita: '#60a5fa',
}
const RASA_INFO = {
  Madhura: 'Sweet — Prithvi + Jala. Calming, anabolic, tissue building.',
  Lavana: 'Salty — Prithvi + Agni. Digesting, hydrating, softens doshas.',
  Amla: 'Sour — Prithvi + Agni. Stimulates digestive fire & metabolism.',
  Tikta: 'Bitter — Akasha + Vayu. Detoxifying, deep blood purifier.',
  Katu: 'Pungent — Agni + Vayu. Stimulating, enhances circulation.',
  Kashaya: 'Astringent — Vayu + Prithvi. Drying, wound healing.',
  Anabhilashita: 'Neutral — pure baseline aqueous extract.',
}

function Ring({ progress = 0, color = 'var(--tm-lime, #c6f432)', size = 84, strokeWidth = 5 }) {
  const r = (size - strokeWidth * 2) / 2
  const circumference = 2 * Math.PI * r
  const offset = circumference - progress * circumference
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--tm-track-stroke, rgba(255,255,255,0.08))" strokeWidth={strokeWidth} />
      <motion.circle
        cx={size/2} cy={size/2} r={r}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      />
    </svg>
  )
}

function ScanWave() {
  return (
    <div className="w-full h-2 relative overflow-hidden rounded-full bg-[var(--tm-subtle-bg)]">
      <motion.div
        className="absolute top-0 bottom-0 w-16 rounded-full"
        style={{
          background: 'linear-gradient(90deg, transparent, var(--tm-lime), transparent)',
        }}
        animate={{ x: ['-100%', '400%'] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}

export function AnalyzeCard({ reading, onSaved }) {
  const [phase, setPhase] = useState('idle')
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState(null)
  const [paused, setPaused] = useState(false)
  const [toast, setToast] = useState(null)
  const intervalRef = useRef()
  const pausedRef = useRef(false)

  pausedRef.current = paused

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  async function startAnalysis() {
    setPhase('scanning')
    setProgress(0)
    setPaused(false)
    setResult(null)

    await new Promise((resolve) => {
      let p = 0
      intervalRef.current = setInterval(() => {
        if (pausedRef.current) return
        p += 0.03 + Math.random() * 0.02
        setProgress(Math.min(p, 0.95))
        if (p >= 0.95) {
          clearInterval(intervalRef.current)
          resolve()
        }
      }, 70)
    })

    if (!reading) { setPhase('idle'); return }
    const res = await predictTaste(reading)
    setProgress(1)
    await new Promise((r) => setTimeout(r, 200))
    setResult(res)
    setPhase('result')
  }

  function stopAnalysis() {
    clearInterval(intervalRef.current)
    setPhase('idle')
    setProgress(0)
    setPaused(false)
  }

  async function handleSave() {
    if (!reading || !result) return
    await saveToHistory({ ...reading, predictedTaste: result.predictedTaste, confidence: result.confidence })
    setPhase('saved')
    showToast('Saved to quality log ✓')
    onSaved?.()
  }

  function rerun() {
    setPhase('idle')
    setResult(null)
    setProgress(0)
  }

  const rasaColor = result ? (RASA_COLORS[result.predictedTaste] ?? 'var(--tm-text-muted)') : 'var(--tm-lime)'
  const confPct = result ? Math.round(result.confidence * 100) : 0

  return (
    <PillCard
      className="p-5 flex flex-col justify-between relative overflow-hidden"
      style={{
        minHeight: 250,
      }}
    >
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="absolute top-3 right-3 z-30 text-[11px] font-semibold px-3 py-1 rounded-full shadow-lg"
            style={{ background: 'var(--tm-lime)', color: 'var(--tm-lime-text)' }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Sparkles size={13} color="var(--tm-lime)" />
          <span className="text-[13px] font-semibold text-[var(--tm-text-primary)] tracking-tight">
            Rasa Prediction
          </span>
        </div>
        <span className="text-[10px] text-[var(--tm-text-muted)] font-mono px-2 py-0.5 rounded-full bg-[var(--tm-subtle-bg)]">
          ML v2.4
        </span>
      </div>

      <AnimatePresence mode="wait">
        {/* IDLE */}
        {phase === 'idle' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center gap-4 py-2 text-center"
          >
            <p className="text-[12px] text-[var(--tm-text-muted)] max-w-[200px] leading-relaxed">
              Synthesize 3-channel sensor values into dominant Ayurvedic Rasa.
            </p>
            <button
              onClick={startAnalysis}
              disabled={!reading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-[13px] font-bold transition-all hover:scale-105"
              style={{
                background: 'var(--tm-lime)',
                color: 'var(--tm-lime-text)',
                boxShadow: '0 0 20px var(--tm-lime-glow)',
              }}
            >
              <Play size={13} fill="currentColor" />
              <span>Assay Taste</span>
            </button>
          </motion.div>
        )}

        {/* SCANNING */}
        {phase === 'scanning' && (
          <motion.div
            key="scanning"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center gap-3 py-1 text-center"
          >
            <div className="relative">
              <Ring progress={progress} size={84} strokeWidth={6} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[16px] font-bold text-[var(--tm-text-primary)] font-mono">
                  {Math.round(progress * 100)}%
                </span>
              </div>
            </div>
            <div className="w-3/4">
              <ScanWave />
            </div>
            <div className="flex gap-2 mt-1">
              <button
                onClick={() => setPaused((p) => !p)}
                className="flex items-center gap-1 px-3 py-1 rounded-full text-[11px] text-[var(--tm-text-primary)] bg-[var(--tm-subtle-bg)]"
              >
                {paused ? <Play size={10} /> : <Pause size={10} />}
                {paused ? 'Resume' : 'Pause'}
              </button>
              <button
                onClick={stopAnalysis}
                className="flex items-center gap-1 px-3 py-1 rounded-full text-[11px] text-[var(--tm-text-muted)] bg-[var(--tm-subtle-bg)]"
              >
                <Square size={10} />
                Stop
              </button>
            </div>
          </motion.div>
        )}

        {/* RESULT */}
        {(phase === 'result' || phase === 'saved') && result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-between py-1 gap-2 text-center"
          >
            <div className="flex items-center gap-3 w-full justify-center">
              <div className="relative flex-shrink-0">
                <Ring progress={result.confidence} color={rasaColor} size={70} strokeWidth={5} />
                <div className="absolute inset-0 flex items-center justify-center font-mono font-bold text-[14px]" style={{ color: rasaColor }}>
                  {confPct}%
                </div>
              </div>
              <div className="text-left">
                <span className="text-[10px] text-[var(--tm-text-muted)] uppercase tracking-wider font-mono">Dominant Rasa</span>
                <h3 className="text-[22px] font-bold text-[var(--tm-text-primary)] leading-tight">
                  {result.predictedTaste}
                </h3>
              </div>
            </div>

            <p className="text-[11px] text-[var(--tm-text-muted)] line-clamp-2 px-1 leading-snug">
              {RASA_INFO[result.predictedTaste] || result.rasa}
            </p>

            <div className="flex gap-2 w-full mt-1">
              {phase !== 'saved' ? (
                <button
                  onClick={handleSave}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full text-[11px] font-bold"
                  style={{
                    background: 'var(--tm-lime)',
                    color: 'var(--tm-lime-text)',
                    boxShadow: '0 0 14px var(--tm-lime-glow)',
                  }}
                >
                  <Save size={12} />
                  Save Log
                </button>
              ) : (
                <div className="flex-1 flex items-center justify-center py-2 rounded-full text-[11px] font-medium text-[var(--tm-lime)] bg-[var(--tm-lime-dim)] border border-[var(--tm-lime-border)]">
                  Archived ✓
                </div>
              )}
              <button
                onClick={rerun}
                className="flex items-center justify-center px-3 py-2 rounded-full text-[11px] text-[var(--tm-text-primary)] bg-[var(--tm-subtle-bg)] hover:opacity-80"
                title="Re-run assay"
              >
                <RotateCcw size={12} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </PillCard>
  )
}
export default AnalyzeCard
