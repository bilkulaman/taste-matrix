// src/components/dashboard/KanbanBoard.jsx
// Kanban stages as nested pill cards with SVG curved connector lines between columns
// (Pending -> Analyzing -> Verified solid, Flagged dashed red), with small dots at connection points.

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MoreHorizontal, RefreshCw, Flag, BarChart2, Trash2, Clock, CheckCircle2, AlertOctagon, Hourglass, Zap } from 'lucide-react'
import { getKanbanCards, updateKanbanStatus } from '../../api.js'
import { Drawer, PillCard } from '../ui/index.js'

const COLUMNS = [
  { id: 'Pending',   label: 'Pending Extraction', icon: Hourglass,    accent: '#8a8a93', count: 2 },
  { id: 'Analyzing', label: 'E-Tongue Assay',      icon: Zap,          accent: '#38bdf8', count: 1 },
  { id: 'Verified',  label: 'Rasa Authenticated',  icon: CheckCircle2, accent: '#c6f432', count: 2 },
  { id: 'Flagged',   label: 'Adulteration Flag',   icon: AlertOctagon, accent: '#f87171', count: 1 },
]

const RASA_COLORS = {
  Madhura: '#c6f432', Lavana: '#94a3b8', Amla: '#fb923c',
  Tikta: '#818cf8', Katu: '#f43f5e', Kashaya: '#a78bfa',
  Anabhilashita: '#60a5fa',
}

function timeAgo(iso) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  if (diff < 60) return `${Math.round(diff)}s ago`
  if (diff < 3600) return `${Math.round(diff / 60)}m ago`
  return `${Math.round(diff / 3600)}h ago`
}

// Curved connector line between column stages
function StageConnector({ type = 'solid', fromY = [50, 110], toY = [60, 100] }) {
  const isDashed = type === 'dashed'
  const strokeColor = isDashed ? '#f87171' : 'var(--tm-border-active, rgba(255, 255, 255, 0.22))'
  const dotColor = isDashed ? '#f87171' : 'var(--tm-lime, #c6f432)'

  return (
    <div className="hidden lg:flex items-center justify-center w-6 h-full relative pointer-events-none -mx-3 z-10">
      <svg className="w-full h-full overflow-visible" viewBox="0 0 24 240" preserveAspectRatio="none">
        {fromY.map((fy, i) => {
          const ty = toY[i] || toY[0]
          return (
            <g key={i}>
              {/* Curved bezier */}
              <path
                d={`M 0,${fy} C 12,${fy} 12,${ty} 24,${ty}`}
                fill="none"
                stroke={strokeColor}
                strokeWidth={1.5}
                strokeDasharray={isDashed ? '4 3' : 'none'}
                strokeOpacity={isDashed ? 0.8 : 0.4}
              />
              {/* Connection dots */}
              <circle cx="0" cy={fy} r="2.5" fill={dotColor} />
              <circle cx="24" cy={ty} r="2.5" fill={dotColor} />
            </g>
          )
        })}
      </svg>
    </div>
  )
}

function ContextMenu({ x, y, onAction, onClose }) {
  const ref = useRef()
  useEffect(() => {
    const h = (e) => { if (!ref.current?.contains(e.target)) onClose() }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [onClose])

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      style={{
        position: 'fixed',
        top: y,
        left: x,
        zIndex: 80,
        background: 'var(--tm-panel-bg, rgba(12, 12, 18, 0.98))',
        border: '1px solid var(--tm-border-card, rgba(255,255,255,0.12))',
        backdropFilter: 'blur(20px)',
      }}
      className="rounded-2xl py-2 min-w-[170px] shadow-2xl"
    >
      {[
        { icon: RefreshCw, label: 'Re-assay', action: 'retest' },
        { icon: Flag,      label: 'Flag Sample', action: 'flag' },
        { icon: BarChart2, label: 'Spectral Detail', action: 'analysis' },
        { icon: Trash2,    label: 'Dismiss', action: 'delete', danger: true },
      ].map(({ icon: Icon, label, action, danger }) => (
        <button
          key={action}
          onClick={() => { onAction(action); onClose() }}
          className="w-full flex items-center gap-2.5 px-4 py-2 text-[12px] font-medium transition-colors hover:bg-white/[0.08]"
          style={{ color: danger ? '#f87171' : 'var(--tm-text-primary)' }}
        >
          <Icon size={14} />
          {label}
        </button>
      ))}
    </motion.div>
  )
}

// Single Kanban pill card
function KanbanCard({ card, onMoveToColumn, onOpen }) {
  const [ctxMenu, setCtxMenu] = useState(null)
  const color = RASA_COLORS[card.rasa] ?? '#8a8a93'
  const conf = Math.round(card.confidence * 100)

  // Confidence ring math
  const R = 9, C = 11
  const circ = 2 * Math.PI * R
  const offset = circ - (conf / 100) * circ

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        whileHover={{ y: -2, scale: 1.01 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        className="rounded-2xl p-3.5 cursor-pointer group transition-all"
        style={{
          background: 'var(--tm-card-bg, rgba(255, 255, 255, 0.06))',
          border: '1px solid var(--tm-border-card, rgba(255, 255, 255, 0.10))',
          boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
        }}
        onClick={() => onOpen?.(card)}
        onContextMenu={(e) => {
          e.preventDefault()
          setCtxMenu({ x: e.clientX, y: e.clientY })
        }}
        role="button"
        tabIndex={0}
        aria-label={`${card.sample} - ${card.rasa}`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-[var(--tm-text-primary)] truncate tracking-tight">
              {card.sample}
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              <span
                className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}
              >
                {card.rasa}
              </span>
            </div>
          </div>

          {/* Mini confidence ring */}
          <div className="flex flex-col items-center flex-shrink-0">
            <svg width={C * 2} height={C * 2} style={{ transform: 'rotate(-90deg)' }}>
              <circle cx={C} cy={C} r={R} fill="none" stroke="var(--tm-border-card)" strokeWidth={2.5} />
              <circle
                cx={C} cy={C} r={R}
                fill="none"
                stroke={color}
                strokeWidth={2.5}
                strokeDasharray={circ}
                strokeDashoffset={offset}
                strokeLinecap="round"
              />
            </svg>
            <span className="text-[9px] font-mono text-[var(--tm-text-muted)] mt-0.5">{conf}%</span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-[var(--tm-border-subtle)]">
          <div className="flex items-center gap-1 text-[10px] text-[var(--tm-text-muted)]">
            <Clock size={10} />
            {timeAgo(card.time)}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setCtxMenu({ x: e.clientX, y: e.clientY })
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-[var(--tm-card-hover)]"
            aria-label="Card options"
          >
            <MoreHorizontal size={13} className="text-[var(--tm-text-muted)]" />
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {ctxMenu && (
          <ContextMenu
            x={ctxMenu.x}
            y={ctxMenu.y}
            onAction={(action) => {
              if (action === 'flag') onMoveToColumn?.(card.id, 'Flagged')
              if (action === 'retest') onMoveToColumn?.(card.id, 'Pending')
              if (action === 'delete') onMoveToColumn?.(card.id, null)
            }}
            onClose={() => setCtxMenu(null)}
          />
        )}
      </AnimatePresence>
    </>
  )
}

export function KanbanBoard() {
  const [cards, setCards] = useState([])
  const [drawerCard, setDrawerCard] = useState(null)

  useEffect(() => {
    getKanbanCards().then(setCards)
  }, [])

  function moveCard(id, newStatus) {
    setCards((prev) =>
      newStatus === null
        ? prev.filter((c) => c.id !== id)
        : prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
    )
    if (newStatus) updateKanbanStatus(id, newStatus)
  }

  const byStatus = COLUMNS.reduce(
    (acc, col) => ({
      ...acc,
      [col.id]: cards.filter((c) => c.status === col.id),
    }),
    {}
  )

  return (
    <>
      <div className="relative flex flex-col lg:flex-row items-stretch gap-3 w-full">
        {COLUMNS.map((col, index) => {
          const colCards = byStatus[col.id] || []
          const Icon = col.icon

          return (
            <div key={col.id} className="flex-1 flex items-stretch">
              {/* Column Nested Pill Container */}
              <div
                className="flex-1 flex flex-col rounded-3xl p-4 min-w-[200px]"
                style={{
                  background: 'var(--tm-panel-bg, rgba(255, 255, 255, 0.04))',
                  border: '1px solid var(--tm-border-card, rgba(255, 255, 255, 0.08))',
                  backdropFilter: 'blur(16px)',
                }}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-6 h-6 rounded-full flex items-center justify-center text-black"
                      style={{ background: col.accent }}
                    >
                      <Icon size={12} strokeWidth={2.5} />
                    </span>
                    <span className="text-[12px] font-semibold text-[var(--tm-text-primary)] tracking-tight">
                      {col.label}
                    </span>
                  </div>
                  <span
                    className="text-[11px] font-mono px-2 py-0.5 rounded-full"
                    style={{
                      background: 'var(--tm-card-bg-subtle, rgba(255,255,255,0.06))',
                      color: col.accent,
                    }}
                  >
                    {colCards.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="flex flex-col gap-2.5 flex-1 min-h-[140px]">
                  {colCards.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-[11px] text-[var(--tm-text-muted)] italic py-6">
                      No active assays
                    </div>
                  ) : (
                    colCards.map((card) => (
                      <KanbanCard
                        key={card.id}
                        card={card}
                        onMoveToColumn={moveCard}
                        onOpen={setDrawerCard}
                      />
                    ))
                  )}
                </div>
              </div>

              {/* Curved Connector Lines Between Stages (from CRM ref) */}
              {index < COLUMNS.length - 1 && (
                <StageConnector
                  type={index === 2 ? 'dashed' : 'solid'}
                  fromY={[60, 120, 180]}
                  toY={[70, 130, 170]}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Slide-out Drawer Detail */}
      <Drawer
        isOpen={!!drawerCard}
        onClose={() => setDrawerCard(null)}
        title={drawerCard?.sample ? `${drawerCard.sample} Assay` : 'Sample Detail'}
      >
        {drawerCard && (
          <div className="flex flex-col gap-5 pt-2">
            <div className="p-4 rounded-2xl bg-[var(--tm-card-bg)] border border-[var(--tm-border-card)]">
              <span className="text-[11px] text-[var(--tm-text-muted)] uppercase font-mono">Dravya Identity</span>
              <h4 className="text-[20px] font-semibold text-[var(--tm-text-primary)] mt-1">{drawerCard.sample}</h4>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-2xl bg-[var(--tm-card-bg)] border border-[var(--tm-border-card)] text-center">
                <span className="text-[11px] text-[var(--tm-text-muted)]">Rasa Verdict</span>
                <p className="text-[16px] font-bold mt-1" style={{ color: RASA_COLORS[drawerCard.rasa] ?? 'var(--tm-lime)' }}>
                  {drawerCard.rasa}
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-[var(--tm-card-bg)] border border-[var(--tm-border-card)] text-center">
                <span className="text-[11px] text-[var(--tm-text-muted)]">ML Confidence</span>
                <p className="text-[16px] font-bold text-[var(--tm-text-primary)] font-mono mt-1">
                  {Math.round(drawerCard.confidence * 100)}%
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-[var(--tm-card-bg-subtle)] border border-[var(--tm-border-subtle)] text-[12px] text-[var(--tm-text-muted)]">
              <span>Stage Location:</span>
              <span className="text-[var(--tm-text-primary)] font-medium">{drawerCard.status}</span>
            </div>
          </div>
        )}
      </Drawer>
    </>
  )
}
export default KanbanBoard
