// src/components/dashboard/CommandPalette.jsx
// Ctrl+K overlay — jump pages, run Analyze, open New Test, switch sample.

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, LayoutDashboard, FlaskConical, History, BookOpen, MessageCircle, Settings, Info, Play, Plus, Leaf } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getSamples, setActiveSample } from '../../api.js'

const NAV_ACTIONS = [
  { type: 'nav', label: 'Dashboard',  to: '/dashboard',  icon: LayoutDashboard, desc: 'Go to Dashboard'     },
  { type: 'nav', label: 'Analysis',   to: '/analysis',   icon: FlaskConical,    desc: 'Go to Analysis'      },
  { type: 'nav', label: 'History',    to: '/history',    icon: History,          desc: 'Go to History'       },
  { type: 'nav', label: 'Rasa Guide', to: '/rasa-guide', icon: BookOpen,         desc: 'Go to Rasa Guide'    },
  { type: 'nav', label: 'Assistant',  to: '/assistant',  icon: MessageCircle,    desc: 'Go to Assistant'     },
  { type: 'nav', label: 'Settings',   to: '/settings',   icon: Settings,         desc: 'Go to Settings'      },
  { type: 'nav', label: 'About',      to: '/about',      icon: Info,             desc: 'Go to About'         },
]

const STATIC_ACTIONS = [
  { type: 'action', label: 'Run Analysis', icon: Play,  id: 'analyze',  desc: 'Start taste analysis on current reading' },
  { type: 'action', label: 'New Test',     icon: Plus,  id: 'new-test', desc: 'Open New Test form'                       },
]

export function CommandPalette({ onAction }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [samples, setSamples] = useState([])
  const navigate = useNavigate()
  const inputRef = useRef()

  // Build sample actions once
  useEffect(() => {
    getSamples().then(ss => setSamples(ss))
  }, [])

  const sampleActions = samples.map(s => ({
    type: 'sample', label: `Switch to ${s.name}`, icon: Leaf, id: s.id, desc: s.rasa,
  }))

  const allActions = [...NAV_ACTIONS, ...STATIC_ACTIONS, ...sampleActions]
  const filtered = query.trim()
    ? allActions.filter(a =>
        a.label.toLowerCase().includes(query.toLowerCase()) ||
        a.desc.toLowerCase().includes(query.toLowerCase())
      )
    : allActions

  // Ctrl+K open
  useEffect(() => {
    const h = e => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(o => !o)
        setQuery('')
        setSelectedIdx(0)
      }
    }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [])

  // Focus input when opened
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50)
  }, [open])

  function close() { setOpen(false); setQuery('') }

  function execute(action) {
    close()
    if (action.type === 'nav') { navigate(action.to) }
    else if (action.type === 'action') { onAction?.(action.id) }
    else if (action.type === 'sample') { setActiveSample(action.id); onAction?.('sample-changed') }
  }

  function handleKey(e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIdx(i => Math.min(i + 1, filtered.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIdx(i => Math.max(i - 1, 0)) }
    else if (e.key === 'Enter') { if (filtered[selectedIdx]) execute(filtered[selectedIdx]) }
    else if (e.key === 'Escape') close()
  }

  // Reset selection on query change
  useEffect(() => setSelectedIdx(0), [query])

  return (
    <>
      {/* Keyboard hint - always visible in toolbar */}
      <button
        onClick={() => { setOpen(true); setQuery(''); setSelectedIdx(0) }}
        className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px] text-[#8a8a93] hover:text-white transition-colors"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        aria-label="Open command palette (Ctrl+K)"
      >
        <Search size={12} />
        <span>Search…</span>
        <kbd className="ml-1 text-[10px] px-1 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.08)', fontFamily: 'monospace' }}>⌘K</kbd>
      </button>

      {/* Overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-start justify-center pt-[15vh] px-4"
            style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(10px)' }}
            onClick={close}
          >
            <motion.div
              initial={{ scale: 0.95, y: -12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: -8 }}
              transition={{ type: 'spring', damping: 28, stiffness: 360 }}
              className="w-full max-w-lg rounded-2xl overflow-hidden"
              style={{ background: 'rgba(10,10,15,0.98)', border: '1px solid rgba(255,255,255,0.12)' }}
              onClick={e => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label="Command palette"
            >
              {/* Search input */}
              <div className="flex items-center gap-3 px-4 py-3.5 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                <Search size={16} color="#8a8a93" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Search pages, actions, samples…"
                  className="flex-1 bg-transparent text-[14px] text-white placeholder-[#8a8a93] outline-none"
                  aria-label="Command search"
                  role="combobox"
                  aria-expanded={filtered.length > 0}
                />
                <kbd className="text-[10px] px-1.5 py-0.5 rounded text-[#8a8a93]"
                  style={{ background: 'rgba(255,255,255,0.06)', fontFamily: 'monospace' }}>Esc</kbd>
              </div>

              {/* Results */}
              <div className="max-h-80 overflow-y-auto py-2" role="listbox">
                {filtered.length === 0 && (
                  <p className="text-[12px] text-[#8a8a93] text-center py-6">No results for "{query}"</p>
                )}
                {filtered.map((action, i) => {
                  const Icon = action.icon
                  return (
                    <button
                      key={`${action.type}-${action.label}`}
                      role="option"
                      aria-selected={i === selectedIdx}
                      onMouseEnter={() => setSelectedIdx(i)}
                      onClick={() => execute(action)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors"
                      style={{ background: i === selectedIdx ? 'rgba(255,255,255,0.06)' : 'transparent' }}
                    >
                      <span className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <Icon size={14} color={i === selectedIdx ? '#c6f432' : '#8a8a93'} />
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] text-white">{action.label}</p>
                        <p className="text-[11px] text-[#8a8a93] truncate">{action.desc}</p>
                      </div>
                      {i === selectedIdx && (
                        <kbd className="text-[10px] px-1.5 py-0.5 rounded text-[#8a8a93] flex-shrink-0"
                          style={{ background: 'rgba(255,255,255,0.06)', fontFamily: 'monospace' }}>↵</kbd>
                      )}
                    </button>
                  )
                })}
              </div>

              <div className="px-4 py-2 border-t text-[10px] text-[#8a8a93] flex gap-4" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                <span><kbd style={{ fontFamily: 'monospace' }}>↑↓</kbd> navigate</span>
                <span><kbd style={{ fontFamily: 'monospace' }}>↵</kbd> select</span>
                <span><kbd style={{ fontFamily: 'monospace' }}>Esc</kbd> close</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
