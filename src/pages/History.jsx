// pages/History.jsx
// Stage 4: Historical sensor reading audit log.
// Transformed into nested pill card rows with status pills, mini visuals, search & filter toolbar, and pagination.

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Download, ChevronLeft, ChevronRight, Filter, Clock, Sparkles } from 'lucide-react'
import RasaBadge       from '../components/RasaBadge.jsx'
import { useHistory }  from '../hooks/useHistory.js'
import { useSamples }  from '../hooks/useSamples.js'
import { PanelCard, PillCard, RoundIconButton } from '../components/ui/index.js'

const PAGE_SIZE = 10

const SAMPLE_COLORS = {
  'Distilled Water': '#60a5fa',
  'Salt Water':      '#38bdf8',
  'Sugar Water':     '#c6f432',
  'Haldi Water':     '#f59e0b',
  'Neem Water':      '#34d399',
}

function formatTime(iso) {
  const d = new Date(iso)
  return d.toLocaleString([], {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
}

export default function History() {
  const { data: allRows, loading } = useHistory({ limit: 80 })
  const { samples }                = useSamples()

  const [search, setSearch]     = useState('')
  const [filter, setFilter]     = useState('All')
  const [page, setPage]         = useState(0)

  const filtered = useMemo(() => {
    let rows = allRows
    if (filter !== 'All') rows = rows.filter(r => r.sample === filter)
    if (search.trim()) {
      const q = search.toLowerCase()
      rows = rows.filter(r =>
        r.sample.toLowerCase().includes(q) ||
        r.predictedTaste.toLowerCase().includes(q)
      )
    }
    return rows
  }, [allRows, filter, search])

  const pageCount = Math.ceil(filtered.length / PAGE_SIZE) || 1
  const pageRows  = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE)

  const setFilterPage = (v) => { setFilter(v); setPage(0) }
  const setSearchPage = (v) => { setSearch(v); setPage(0) }

  const handleExport = () => {
    const headers = ['id', 'sample', 'ph', 'tds', 'turbidity', 'predictedTaste', 'confidence', 'timestamp']
    const rows = [headers, ...filtered.map(r => headers.map(h => r[h] ?? ''))].map(r => r.join(',')).join('\n')
    const blob = new Blob([rows], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = Object.assign(document.createElement('a'), { href: url, download: 'tastematrix-history.csv' })
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      {/* ── Top Header Toolbar ── */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[var(--tm-subtle-border)]">
        {/* Search & Sample Filter */}
        <div className="flex items-center gap-3 flex-wrap flex-1 max-w-2xl">
          {/* Pill Search */}
          <div
            className="flex items-center gap-2.5 px-4 h-10 rounded-full flex-1 min-w-[220px]"
            style={{
              background: 'var(--tm-subtle-bg)',
              border: '1px solid var(--tm-subtle-border)',
            }}
          >
            <Search size={14} color="var(--tm-text-muted)" />
            <input
              type="search"
              placeholder="Filter by sample name or taste..."
              value={search}
              onChange={e => setSearchPage(e.target.value)}
              className="bg-transparent text-[13px] text-[var(--tm-text-primary)] placeholder-[var(--tm-text-muted)] outline-none w-full"
              aria-label="Search readings"
            />
          </div>

          {/* Sample Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            {['All', ...samples.map(s => s.name)].map(name => {
              const isActive = filter === name
              return (
                <button
                  key={name}
                  onClick={() => setFilterPage(name)}
                  className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-[var(--tm-lime)] text-[var(--tm-lime-text)] font-semibold shadow-sm'
                      : 'text-[var(--tm-text-muted)] hover:text-[var(--tm-text-primary)] bg-[var(--tm-subtle-bg)]'
                  }`}
                >
                  {name}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <RoundIconButton icon={Download} onClick={handleExport} label="Export CSV Log" />
          <RoundIconButton icon={Filter} label="Advanced Column Filter" />
        </div>
      </header>

      {/* ── Page Title ── */}
      <section>
        <h1 className="text-[36px] font-light text-[var(--tm-text-primary)] tracking-[-0.03em] leading-tight">
          History
        </h1>
        <p className="text-[13px] text-[var(--tm-text-muted)] mt-0.5">
          Archived electrochemical sensor acquisitions & ML classification history
        </p>
      </section>

      {/* ── Main Panel: Nested Pill Rows ── */}
      <PanelCard padding={24}>
        <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
          <div>
            <h2 className="text-[22px] font-semibold text-[var(--tm-text-primary)] tracking-tight">
              Sensor Reading Audit Log
            </h2>
            <p className="text-[12px] text-[var(--tm-text-muted)]">
              Showing {filtered.length} total entries · Page {page + 1} of {pageCount}
            </p>
          </div>

          {/* Pagination Controls */}
          {pageCount > 1 && (
            <div className="flex items-center gap-1.5 p-1 rounded-full bg-[var(--tm-subtle-bg)] border border-[var(--tm-subtle-border)]">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="w-7 h-7 flex items-center justify-center rounded-full text-[var(--tm-text-muted)] hover:text-[var(--tm-text-primary)] disabled:opacity-30"
                aria-label="Previous page"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="text-[11px] font-mono px-2 text-[var(--tm-text-primary)]">
                {page + 1} / {pageCount}
              </span>
              <button
                onClick={() => setPage(p => Math.min(pageCount - 1, p + 1))}
                disabled={page >= pageCount - 1}
                className="w-7 h-7 flex items-center justify-center rounded-full text-[var(--tm-text-muted)] hover:text-[var(--tm-text-primary)] disabled:opacity-30"
                aria-label="Next page"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>

        {/* Table replacement: Rows of nested PillCards */}
        <div className="flex flex-col gap-2.5">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 rounded-2xl animate-pulse bg-[var(--tm-subtle-bg)]" />
            ))
          ) : pageRows.length === 0 ? (
            <div className="text-center py-12 text-[var(--tm-text-muted)] text-[13px] italic">
              No readings match the current filter.
            </div>
          ) : (
            pageRows.map((r) => {
              const color = SAMPLE_COLORS[r.sample] ?? '#8a8a93'
              return (
                <PillCard
                  key={r.id}
                  className="px-4 py-3 flex items-center justify-between gap-4 flex-wrap hover:scale-[1.008] transition-all"
                >
                  {/* Left: Sample identity */}
                  <div className="flex items-center gap-3 min-w-[180px]">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
                    <div>
                      <p className="text-[13px] font-semibold text-[var(--tm-text-primary)] tracking-tight">
                        {r.sample}
                      </p>
                      <p className="text-[10px] text-[var(--tm-text-muted)] font-mono flex items-center gap-1 mt-0.5">
                        <Clock size={10} />
                        {formatTime(r.timestamp)}
                      </p>
                    </div>
                  </div>

                  {/* Middle: 3 Sensor Parameters */}
                  <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                    <div className="px-3 py-1 rounded-xl bg-[var(--tm-subtle-bg)] border border-[var(--tm-subtle-border)] flex items-center gap-1.5">
                      <span className="text-[10px] text-[var(--tm-text-muted)] uppercase font-mono">pH</span>
                      <span className="text-[12px] font-mono font-semibold text-[var(--tm-text-primary)]">
                        {r.ph.toFixed(2)}
                      </span>
                    </div>

                    <div className="px-3 py-1 rounded-xl bg-[var(--tm-subtle-bg)] border border-[var(--tm-subtle-border)] flex items-center gap-1.5">
                      <span className="text-[10px] text-[var(--tm-text-muted)] uppercase font-mono">TDS</span>
                      <span className="text-[12px] font-mono font-semibold text-[var(--tm-text-primary)]">
                        {Math.round(r.tds)} <span className="text-[9px] text-[var(--tm-text-muted)] font-sans">ppm</span>
                      </span>
                    </div>

                    <div className="px-3 py-1 rounded-xl bg-[var(--tm-subtle-bg)] border border-[var(--tm-subtle-border)] flex items-center gap-1.5">
                      <span className="text-[10px] text-[var(--tm-text-muted)] uppercase font-mono">Turb</span>
                      <span className="text-[12px] font-mono font-semibold text-[var(--tm-text-primary)]">
                        {r.turbidity.toFixed(1)} <span className="text-[9px] text-[var(--tm-text-muted)] font-sans">NTU</span>
                      </span>
                    </div>
                  </div>

                  {/* Right: Rasa Verdict & ML Confidence Pill */}
                  <div className="flex items-center gap-2.5 ml-auto">
                    <RasaBadge rasa={r.predictedTaste} small />
                    <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-[var(--tm-subtle-bg)] text-[var(--tm-text-primary)] border border-[var(--tm-subtle-border)]">
                      {Math.round(r.confidence * 100)}%
                    </span>
                  </div>
                </PillCard>
              )
            })
          )}
        </div>
      </PanelCard>
    </>
  )
}
