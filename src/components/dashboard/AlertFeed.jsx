// src/components/dashboard/AlertFeed.jsx
// Alert feed nested inside a PillCard with severity tag, time, expand, swipe-dismiss, "Mark all read".
// Supports dark and light themes with token CSS variables.

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, CheckCheck, ChevronDown, ChevronUp, AlertTriangle, Info, AlertCircle, X } from 'lucide-react'
import { getAlerts, dismissAlert, markAllAlertsRead } from '../../api.js'
import { PillCard } from '../ui/index.js'

const SEV = {
  warn:  { icon: AlertTriangle, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  error: { icon: AlertCircle,   color: '#f87171', bg: 'rgba(248,113,113,0.12)' },
  info:  { icon: Info,          color: '#38bdf8', bg: 'rgba(56,189,248,0.12)'  },
}

function timeAgo(iso) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  if (diff < 60) return `${Math.round(diff)}s ago`
  if (diff < 3600) return `${Math.round(diff / 60)}m ago`
  return `${Math.round(diff / 3600)}h ago`
}

function AlertItem({ alert, onDismiss }) {
  const [expanded, setExpanded] = useState(false)
  const { icon: Icon, color, bg } = SEV[alert.severity] ?? SEV.info

  return (
    <motion.div
      layout
      initial={{ opacity: 0, height: 0, y: -6 }}
      animate={{ opacity: 1, height: 'auto', y: 0 }}
      exit={{ opacity: 0, x: 40, height: 0 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className="overflow-hidden"
    >
      <div
        className="rounded-2xl px-3.5 py-2.5 flex flex-col gap-1 transition-colors"
        style={{
          background: alert.read ? 'var(--tm-subtle-bg, rgba(255,255,255,0.02))' : bg,
          border: `1px solid ${alert.read ? 'var(--tm-subtle-border)' : color + '35'}`,
        }}
      >
        <div className="flex items-start gap-2.5">
          <Icon size={14} style={{ color, flexShrink: 0, marginTop: 2 }} />
          <div className="flex-1 min-w-0">
            <p
              className="text-[12px] leading-relaxed"
              style={{ color: alert.read ? 'var(--tm-text-muted)' : 'var(--tm-text-primary)' }}
            >
              {expanded ? alert.message : alert.message.slice(0, 56) + (alert.message.length > 56 ? '…' : '')}
            </p>
            <p className="text-[10px] text-[var(--tm-text-muted)] font-mono mt-0.5">{timeAgo(alert.time)}</p>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {alert.message.length > 56 && (
              <button
                onClick={() => setExpanded((e) => !e)}
                className="p-1 rounded text-[var(--tm-text-muted)] hover:text-[var(--tm-text-primary)]"
                aria-label={expanded ? 'Collapse' : 'Expand'}
              >
                {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>
            )}
            <button
              onClick={() => onDismiss(alert.id)}
              className="p-1 rounded text-[var(--tm-text-muted)] hover:text-[#f87171]"
              aria-label="Dismiss alert"
            >
              <X size={12} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function AlertFeed() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAlerts().then((a) => {
      setAlerts(a)
      setLoading(false)
    })
  }, [])

  async function dismiss(id) {
    setAlerts((prev) => prev.filter((a) => a.id !== id))
    await dismissAlert(id)
  }

  async function markAllRead() {
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })))
    await markAllAlertsRead()
  }

  const unread = alerts.filter((a) => !a.read).length

  return (
    <PillCard className="p-4 flex flex-col gap-2">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Bell size={13} color="var(--tm-text-muted)" />
          <span className="text-[13px] font-semibold text-[var(--tm-text-primary)] tracking-tight">
            Quality Alerts
          </span>
          {unread > 0 && (
            <span
              className="text-[10px] font-bold px-1.5 py-0.2 rounded-full text-black font-mono"
              style={{ background: '#f87171' }}
            >
              {unread}
            </span>
          )}
        </div>
        {unread > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1 text-[11px] text-[var(--tm-text-muted)] hover:text-[var(--tm-text-primary)] transition-colors"
          >
            <CheckCheck size={12} />
            Mark read
          </button>
        )}
      </div>

      {/* List */}
      <div className="flex flex-col gap-1.5">
        {loading &&
          [0, 1].map((i) => (
            <div
              key={i}
              className="h-10 rounded-2xl animate-pulse bg-[var(--tm-subtle-bg)]"
            />
          ))}

        <AnimatePresence mode="popLayout">
          {alerts.map((alert) => (
            <AlertItem key={alert.id} alert={alert} onDismiss={dismiss} />
          ))}
        </AnimatePresence>

        {!loading && alerts.length === 0 && (
          <div className="text-center py-4 flex flex-col items-center gap-1.5">
            <CheckCheck size={18} color="#34d399" />
            <p className="text-[11px] text-[var(--tm-text-muted)]">All sensor bands within specification</p>
          </div>
        )}
      </div>
    </PillCard>
  )
}
export default AlertFeed
