// pages/History.jsx
// Stage 4: Historical sensor reading audit log.
// Transformed into nested pill card rows with status pills, mini visuals, search & filter toolbar, and pagination.
// Connected directly to backend GET /readings with search, date range, sort order, and CSV export via /export/readings.csv.

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Download, ChevronLeft, ChevronRight, Filter, Clock,
  ArrowUpDown, Calendar, AlertCircle, FileText, CheckCircle2, ChevronDown
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import RasaBadge       from '../components/RasaBadge.jsx'
import { useHistory }  from '../hooks/useHistory.js'
import { useSamples }  from '../hooks/useSamples.js'
import { PanelCard, PillCard, RoundIconButton, Drawer } from '../components/ui/index.js'
import { getExportReadingsCsvUrl } from '../api.js'

const PAGE_SIZE = 10

const SAMPLE_COLORS = {
  'Distilled Water': '#60a5fa',
  'Haldi Water':     '#f59e0b',
  'Basic Water':     '#38bdf8',
  'Chalk Water':     '#a78bfa',
}

function formatTime(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleString([], {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
}

export default function History() {
  const navigate = useNavigate()
  const { samples } = useSamples()

  // Filters sent to API / evaluated
  const [filter, setFilter]       = useState('All')
  const [search, setSearch]       = useState('')
  const [sortOrder, setSortOrder] = useState('desc') // 'desc' | 'asc'
  const [fromDate, setFromDate]   = useState('')
  const [toDate, setToDate]       = useState('')
  const [showFilterBar, setShowFilterBar] = useState(false)
  const [page, setPage]           = useState(0)

  // Drawer state for clicked reading
  const [selectedReading, setSelectedReading] = useState(null)

  // Fetch readings from backend via useHistory
  const { data: allRows, loading, error, isDemo, refetch } = useHistory({
    sample: filter !== 'All' ? filter : undefined,
    from: fromDate ? new Date(fromDate).toISOString() : undefined,
    to: toDate ? new Date(toDate).toISOString() : undefined,
    order: sortOrder,
    limit: 100,
  })

  // Client-side text search on sample name or predicted taste
  const filtered = useMemo(() => {
    let rows = allRows || []
    if (search.trim()) {
      const q = search.toLowerCase()
      rows = rows.filter(r =>
        (r.sample && r.sample.toLowerCase().includes(q)) ||
        (r.predictedTaste && r.predictedTaste.toLowerCase().includes(q)) ||
        (r.deviceId && r.deviceId.toLowerCase().includes(q)) ||
        String(r.id).includes(q)
      )
    }
    return rows
  }, [allRows, search])

  const pageCount = Math.ceil(filtered.length / PAGE_SIZE) || 1
  const pageRows  = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE)

  const setFilterPage = (v) => { setFilter(v); setPage(0) }
  const setSearchPage = (v) => { setSearch(v); setPage(0) }

  const handleExport = () => {
    const url = getExportReadingsCsvUrl({
      sample: filter !== 'All' ? filter : undefined,
      from: fromDate ? new Date(fromDate).toISOString() : undefined,
      to: toDate ? new Date(toDate).toISOString() : undefined,
      limit: 1000,
    })
    const a = document.createElement('a')
    a.href = url
    a.download = `tastematrix-readings-${filter.toLowerCase().replace(/\s+/g, '-')}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const toggleSort = () => {
    setSortOrder(s => (s === 'desc' ? 'asc' : 'desc'))
    setPage(0)
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
              placeholder="Search by sample, taste, or ID..."
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
          {/* Sort order toggle */}
          <button
            onClick={toggleSort}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-mono border transition-colors"
            style={{
              background: 'var(--tm-subtle-bg)',
              borderColor: 'var(--tm-subtle-border)',
              color: 'var(--tm-text-primary)',
            }}
            title={`Sort order: ${sortOrder === 'desc' ? 'Newest first' : 'Oldest first'}`}
          >
            <ArrowUpDown size={12} />
            <span>{sortOrder === 'desc' ? 'Newest' : 'Oldest'}</span>
          </button>

          <RoundIconButton
            icon={Filter}
            onClick={() => setShowFilterBar(s => !s)}
            label="Date Range Filter"
            variant={showFilterBar ? 'lime' : 'ghost'}
          />
          <RoundIconButton icon={Download} onClick={handleExport} label="Export CSV Log (/export/readings.csv)" />
        </div>
      </header>

      {/* Date Range Sub-Bar (Expandable) */}
      <AnimatePresence>
        {showFilterBar && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div
              className="p-3 rounded-2xl flex items-center gap-4 flex-wrap text-[12px]"
              style={{
                background: 'var(--tm-subtle-bg)',
                border: '1px solid var(--tm-subtle-border)',
              }}
            >
              <div className="flex items-center gap-2">
                <Calendar size={13} className="text-[var(--tm-text-muted)]" />
                <span className="text-[var(--tm-text-muted)]">From:</span>
                <input
                  type="datetime-local"
                  value={fromDate}
                  onChange={e => { setFromDate(e.target.value); setPage(0) }}
                  className="bg-black/30 px-2 py-1 rounded-lg border border-white/10 text-[var(--tm-text-primary)] font-mono text-[11px] outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[var(--tm-text-muted)]">To:</span>
                <input
                  type="datetime-local"
                  value={toDate}
                  onChange={e => { setToDate(e.target.value); setPage(0) }}
                  className="bg-black/30 px-2 py-1 rounded-lg border border-white/10 text-[var(--tm-text-primary)] font-mono text-[11px] outline-none"
                />
              </div>

              {(fromDate || toDate) && (
                <button
                  onClick={() => { setFromDate(''); setToDate(''); setPage(0) }}
                  className="text-[11px] text-[var(--tm-lime)] hover:underline ml-auto font-medium"
                >
                  Clear dates
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Page Title & Status Banners ── */}
      <section className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[36px] font-light text-[var(--tm-text-primary)] tracking-[-0.03em] leading-tight">
            History
          </h1>
          <p className="text-[13px] text-[var(--tm-text-muted)] mt-0.5">
            Archived electrochemical sensor acquisitions & ML classification history
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isDemo && (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-[rgba(245,158,11,0.15)] text-[#f59e0b] border border-[rgba(245,158,11,0.3)]">
              Demo data (Static fallback)
            </span>
          )}
          {error && (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-[rgba(239,68,68,0.15)] text-[#f87171] border border-[rgba(239,68,68,0.3)] flex items-center gap-1.5">
              <AlertCircle size={12} />
              {error}
            </span>
          )}
        </div>
      </section>

      {/* ── Main Panel: Nested Pill Rows ── */}
      <PanelCard padding={24}>
        <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
          <div>
            <h2 className="text-[22px] font-semibold text-[var(--tm-text-primary)] tracking-tight">
              Sensor Reading Audit Log
            </h2>
            <p className="text-[12px] text-[var(--tm-text-muted)]">
              Showing {filtered.length} total entries · Page {page + 1} of {pageCount} · Click any row to inspect
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
          {loading && allRows.length === 0 ? (
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
                  onClick={() => setSelectedReading(r)}
                  className="px-4 py-3 flex items-center justify-between gap-4 flex-wrap hover:scale-[1.008] transition-all cursor-pointer select-none"
                  role="button"
                  tabIndex={0}
                  aria-label={`Inspect reading #${r.id} for ${r.sample}`}
                >
                  {/* Left: Sample identity & ID */}
                  <div className="flex items-center gap-3 min-w-[200px]">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-[13px] font-semibold text-[var(--tm-text-primary)] tracking-tight">
                          {r.sample}
                        </p>
                        <span className="text-[10px] font-mono text-[var(--tm-text-muted)] px-1.5 py-0.2 rounded bg-white/5 border border-white/10">
                          #{r.id}
                        </span>
                      </div>
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
                        {r.ph != null ? r.ph.toFixed(2) : '—'}
                      </span>
                    </div>

                    <div className="px-3 py-1 rounded-xl bg-[var(--tm-subtle-bg)] border border-[var(--tm-subtle-border)] flex items-center gap-1.5">
                      <span className="text-[10px] text-[var(--tm-text-muted)] uppercase font-mono">TDS</span>
                      <span className="text-[12px] font-mono font-semibold text-[var(--tm-text-primary)]">
                        {r.tds != null ? Math.round(r.tds) : '—'} <span className="text-[9px] text-[var(--tm-text-muted)] font-sans">ppm</span>
                      </span>
                    </div>

                    <div className="px-3 py-1 rounded-xl bg-[var(--tm-subtle-bg)] border border-[var(--tm-subtle-border)] flex items-center gap-1.5">
                      <span className="text-[10px] text-[var(--tm-text-muted)] uppercase font-mono">Turb</span>
                      <span className="text-[12px] font-mono font-semibold text-[var(--tm-text-primary)]">
                        {r.turbidity != null ? r.turbidity.toFixed(1) : '—'} <span className="text-[9px] text-[var(--tm-text-muted)] font-sans">NTU</span>
                      </span>
                    </div>
                  </div>

                  {/* Right: Rasa Verdict & ML Confidence Pill */}
                  <div className="flex items-center gap-2.5 ml-auto">
                    <RasaBadge rasa={r.predictedTaste} small />
                    <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-[var(--tm-subtle-bg)] text-[var(--tm-text-primary)] border border-[var(--tm-subtle-border)]">
                      {Math.round((r.confidence || 0) * 100)}%
                    </span>
                  </div>
                </PillCard>
              )
            })
          )}
        </div>
      </PanelCard>

      {/* ── Slide-out Inspection Drawer ── */}
      <Drawer
        open={Boolean(selectedReading)}
        onClose={() => setSelectedReading(null)}
        title={selectedReading ? `Reading #${selectedReading.id} · ${selectedReading.sample}` : 'Reading Detail'}
      >
        {selectedReading && (
          <div className="flex flex-col gap-5 text-[13px]">
            {/* Header Identity */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-[var(--tm-text-muted)] block font-mono">
                  Sample Dravya
                </span>
                <span className="text-[16px] font-semibold text-white">
                  {selectedReading.sample}
                </span>
              </div>
              <RasaBadge rasa={selectedReading.predictedTaste} />
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 font-mono">
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10">
                <span className="text-[10px] text-[var(--tm-text-muted)] uppercase block font-sans">pH Level</span>
                <span className="text-[18px] font-bold text-[var(--tm-lime)]">
                  {selectedReading.ph != null ? selectedReading.ph.toFixed(2) : '—'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10">
                <span className="text-[10px] text-[var(--tm-text-muted)] uppercase block font-sans">TDS Salinity</span>
                <span className="text-[18px] font-bold text-[#38bdf8]">
                  {selectedReading.tds != null ? Math.round(selectedReading.tds) : '—'} <span className="text-[11px] font-normal text-muted">ppm</span>
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10">
                <span className="text-[10px] text-[var(--tm-text-muted)] uppercase block font-sans">Turbidity</span>
                <span className="text-[18px] font-bold text-[#f59e0b]">
                  {selectedReading.turbidity != null ? selectedReading.turbidity.toFixed(1) : '—'} <span className="text-[11px] font-normal text-muted">NTU</span>
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10">
                <span className="text-[10px] text-[var(--tm-text-muted)] uppercase block font-sans">Confidence</span>
                <span className="text-[18px] font-bold text-white">
                  {Math.round((selectedReading.confidence || 0) * 100)}%
                </span>
              </div>
            </div>

            {/* Meta Attributes */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col gap-2.5 font-mono text-[11px]">
              <div className="flex justify-between">
                <span className="text-[var(--tm-text-muted)] font-sans">Reading ID:</span>
                <span className="text-white">#{selectedReading.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--tm-text-muted)] font-sans">Device Node:</span>
                <span className="text-white">{selectedReading.deviceId || 'esp32-node-01'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--tm-text-muted)] font-sans">Acquisition Time:</span>
                <span className="text-white">{formatTime(selectedReading.timestamp)}</span>
              </div>
              {selectedReading.temperature != null && (
                <div className="flex justify-between">
                  <span className="text-[var(--tm-text-muted)] font-sans">Temperature:</span>
                  <span className="text-white">{selectedReading.temperature}°C</span>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={() => {
                  setSelectedReading(null)
                  navigate(`/report?readingId=${selectedReading.id}`)
                }}
                className="flex-1 py-2.5 rounded-xl font-medium text-black bg-[var(--tm-lime)] transition-transform hover:scale-[1.02] text-center flex items-center justify-center gap-2"
              >
                <FileText size={14} />
                <span>Open Full Report</span>
              </button>
            </div>
          </div>
        )}
      </Drawer>
    </>
  )
}
