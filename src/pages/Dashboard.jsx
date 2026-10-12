// src/pages/Dashboard.jsx
// TasteMatrix E-Tongue Dashboard.
// Renders inside AppLayout with shared Sidebar, Panel-in-panel architecture,
// 22px headers with 40px round icon buttons, centered gauges, Recharts waveform, and overlapping sample badges.

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Download, Calendar, SlidersHorizontal, RefreshCw,
  Wifi, CheckCheck, Filter
} from 'lucide-react'

import { useLiveReading }  from '../hooks/useLiveReading.js'
import { useHistory }      from '../hooks/useHistory.js'
import { setActiveSample, getActiveSampleId } from '../api.js'

// UI Primitives
import { PanelCard, PillCard, RoundIconButton, OverlapBadges } from '../components/ui/index.js'

// Dashboard Components
import { SensorGauge }      from '../components/dashboard/SensorGauge.jsx'
import { LiveChart }        from '../components/dashboard/LiveChart.jsx'
import { AnalyzeCard }      from '../components/dashboard/AnalyzeCard.jsx'
import { KanbanBoard }      from '../components/dashboard/KanbanBoard.jsx'
import { NewTestModal }     from '../components/dashboard/NewTestModal.jsx'
import { AlertFeed }        from '../components/dashboard/AlertFeed.jsx'
import { RecentTestsList }  from '../components/dashboard/RecentTestsList.jsx'
import { CommandPalette }   from '../components/dashboard/CommandPalette.jsx'

const TABS = [
  { id: 'Live',    label: 'Live Telemetry' },
  { id: 'Samples', label: 'Sample Pipeline' },
  { id: 'Alerts',  label: 'Quality Alerts' },
]

export default function Dashboard() {
  const { reading, prev, loading } = useLiveReading()
  const [activeSample, setActiveSampleState] = useState(getActiveSampleId() || 'haldi-water')
  const { data: history }          = useHistory({ limit: 35, refreshMs: 3000, sampleId: activeSample })

  const [activeTab, setActiveTab]     = useState('Live')
  const [newTestOpen, setNewTestOpen] = useState(false)
  const [pinnedReading, setPinnedReading] = useState(null)
  const [refreshKey, setRefreshKey]   = useState(0)

  // Chart data — last 30 readings
  const chartData = useMemo(() => {
    const safeHistory = Array.isArray(history) ? history : []
    return [...safeHistory].reverse().slice(-30).map((r, i) => ({
      index: i,
      label: r?.timestamp
        ? new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        : `${i}s`,
      ph: r?.ph ?? 7.0,
      tds: r?.tds ?? 0,
      turbidity: r?.turbidity ?? 0,
    }))
  }, [history])

  // Sparkline series per gauge
  const series = useMemo(() => {
    const safeHistory = Array.isArray(history) ? history : []
    const rows = [...safeHistory].reverse().slice(-20)
    return {
      ph:        rows.map(r => r?.ph ?? 7.0),
      tds:       rows.map(r => r?.tds ?? 0),
      turbidity: rows.map(r => r?.turbidity ?? 0),
    }
  }, [history])

  const activeReading = pinnedReading ?? reading

  function handleSelectSample(sampleId) {
    setActiveSampleState(sampleId)
    setActiveSample(sampleId)
    setPinnedReading(null)
  }

  function handlePaletteAction(actionId) {
    if (actionId === 'analyze')  { setActiveTab('Live') }
    if (actionId === 'new-test') { setNewTestOpen(true) }
    if (actionId === 'sample-changed') {
      setActiveSampleState(getActiveSampleId())
    }
  }

  return (
    <>
      {/* ── TOP NAV & ACTION ROW ── */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[var(--tm-subtle-border)]">
        {/* Pill Nav */}
        <div className="flex items-center gap-3 flex-wrap">
          <div
            className="flex items-center gap-1.5 p-1.5 rounded-full"
            style={{
              background: 'var(--tm-subtle-bg)',
              border: '1px solid var(--tm-subtle-border)',
              backdropFilter: 'blur(16px)',
            }}
          >
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-4 py-1.5 rounded-full text-[13px] font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-lime)] ${
                    isActive ? 'text-[var(--tm-lime-text)] font-semibold' : 'text-[var(--tm-text-muted)] hover:text-[var(--tm-text-primary)]'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="top-tab-active"
                      className="absolute inset-0 rounded-full bg-[var(--tm-lime)] shadow-[0_0_16px_var(--tm-lime-glow)]"
                      transition={{ type: 'spring', damping: 28, stiffness: 380 }}
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Right Action Cluster */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* ESP32 Status Pill */}
          <div
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[12px]"
            style={{
              background: 'var(--tm-subtle-bg)',
              border: '1px solid var(--tm-subtle-border)',
            }}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#34d399] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#34d399]" />
            </span>
            <Wifi size={13} color="#34d399" />
            <span className="text-[var(--tm-text-muted)]">ESP32 Node:</span>
            <span className="text-[var(--tm-text-primary)] font-mono font-medium">Online</span>
          </div>

          <CommandPalette onAction={handlePaletteAction} />

          <RoundIconButton
            icon={Plus}
            onClick={() => setNewTestOpen(true)}
            label="New Test Assay"
            variant="lime"
            size={40}
          />
        </div>
      </header>

      {/* ── TITLE & OVERLAPPING SAMPLE BADGES ── */}
      <section className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1
            className="text-[36px] font-light text-[var(--tm-text-primary)] tracking-[-0.03em] leading-tight"
            style={{ letterSpacing: '-0.03em' }}
          >
            Dashboard
          </h1>
          <p className="text-[13px] text-[var(--tm-text-muted)] mt-0.5">
            Ayurvedic Dravya E-Tongue Analytics · Real-time Rasa Identification
          </p>
        </div>

        <OverlapBadges
          activeSampleId={activeSample}
          onSelectSample={handleSelectSample}
        />
      </section>

      {/* ── TAB CONTENT: PANEL-IN-PANEL ARCHITECTURE ── */}
      <AnimatePresence mode="wait">
        {/* ════════════════════════════════════════════════════════════════════ */}
        {/* TAB 1: LIVE TELEMETRY                                                */}
        {/* ════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'Live' && (
          <motion.div
            key="tab-live"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-5"
          >
            {/* Panel 1: Live Sensor Telemetry (Top Row) */}
            <PanelCard padding={24}>
              <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
                <div>
                  <h2 className="text-[22px] font-semibold text-[var(--tm-text-primary)] tracking-tight">
                    Live Sensor Telemetry
                  </h2>
                  <p className="text-[12px] text-[var(--tm-text-muted)] mt-0.5">
                    Calibrated 3-channel acquisition for{' '}
                    <span className="text-[var(--tm-lime)] font-medium capitalize">
                      {activeSample.replace('-', ' ')}
                    </span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <RoundIconButton
                    icon={Plus}
                    onClick={() => setNewTestOpen(true)}
                    label="New Calibration Run"
                  />
                  <RoundIconButton
                    icon={Download}
                    onClick={() => alert('Exporting sensor telemetry log (CSV)...')}
                    label="Export Telemetry Log"
                  />
                  <RoundIconButton
                    icon={RefreshCw}
                    onClick={() => setRefreshKey(k => k + 1)}
                    label="Refresh Stream"
                  />
                </div>
              </div>

              {/* Nested Pill Cards: 3 Centered Gauges + 1 Analyze Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <SensorGauge
                  metric="ph"
                  value={activeReading?.ph ?? 7.0}
                  prevValue={prev?.ph}
                  history={series.ph}
                />
                <SensorGauge
                  metric="tds"
                  value={activeReading?.tds ?? 0}
                  prevValue={prev?.tds}
                  history={series.tds}
                />
                <SensorGauge
                  metric="turbidity"
                  value={activeReading?.turbidity ?? 0}
                  prevValue={prev?.turbidity}
                  history={series.turbidity}
                />
                <AnalyzeCard
                  key={refreshKey}
                  reading={activeReading}
                  onSaved={() => {}}
                />
              </div>
            </PanelCard>

            {/* Panels 2 & 3: Dynamic Waveform & Quality Audit (Bottom Row) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left Panel: Waveform Chart (7 cols) */}
              <div className="lg:col-span-7 flex flex-col">
                <PanelCard padding={24} className="flex-1 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-[22px] font-semibold text-[var(--tm-text-primary)] tracking-tight">
                        Sensor Waveform
                      </h2>
                      <p className="text-[12px] text-[var(--tm-text-muted)]">
                        Multi-frequency bio-impedance & optical scattering
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <RoundIconButton
                        icon={SlidersHorizontal}
                        label="Filter Series"
                      />
                      <RoundIconButton
                        icon={Calendar}
                        label="Time Window"
                      />
                    </div>
                  </div>

                  <div className="flex-1">
                    <LiveChart data={chartData} />
                  </div>
                </PanelCard>
              </div>

              {/* Right Panel: Quality Feed & Audit (5 cols) */}
              <div className="lg:col-span-5 flex flex-col">
                <PanelCard padding={24} className="flex-1 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-[22px] font-semibold text-[var(--tm-text-primary)] tracking-tight">
                        Quality Feed & Audit
                      </h2>
                      <p className="text-[12px] text-[var(--tm-text-muted)]">
                        Active monitoring & recent test inspections
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <RoundIconButton
                        icon={CheckCheck}
                        label="Acknowledge All"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 flex-1">
                    <RecentTestsList
                      history={history}
                      selectedId={pinnedReading?.id}
                      onSelect={(r) => setPinnedReading((p) => (p?.id === r.id ? null : r))}
                    />
                    <AlertFeed />
                  </div>
                </PanelCard>
              </div>
            </div>
          </motion.div>
        )}

        {/* ════════════════════════════════════════════════════════════════════ */}
        {/* TAB 2: SAMPLES KANBAN PIPELINE                                       */}
        {/* ════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'Samples' && (
          <motion.div
            key="tab-samples"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <PanelCard padding={28}>
              <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <div>
                  <h2 className="text-[22px] font-semibold text-[var(--tm-text-primary)] tracking-tight">
                    Ayurvedic Assay Pipeline
                  </h2>
                  <p className="text-[12px] text-[var(--tm-text-muted)] mt-0.5">
                    Batch tracking through extraction, E-Tongue analysis, verification, and adulteration flag.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <RoundIconButton
                    icon={Plus}
                    onClick={() => setNewTestOpen(true)}
                    label="Add Sample to Queue"
                    variant="lime"
                  />
                  <RoundIconButton
                    icon={Download}
                    onClick={() => alert('Exporting batch pipeline manifest...')}
                    label="Export Pipeline Manifest"
                  />
                  <RoundIconButton
                    icon={Filter}
                    label="Filter Batches"
                  />
                </div>
              </div>

              <KanbanBoard />
            </PanelCard>
          </motion.div>
        )}

        {/* ════════════════════════════════════════════════════════════════════ */}
        {/* TAB 3: QUALITY ALERTS & SYSTEM DIAGNOSTICS                           */}
        {/* ════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'Alerts' && (
          <motion.div
            key="tab-alerts"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-4xl mx-auto w-full"
          >
            <PanelCard padding={28}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-[22px] font-semibold text-[var(--tm-text-primary)] tracking-tight">
                    System Diagnostics & Quality Alerts
                  </h2>
                  <p className="text-[12px] text-[var(--tm-text-muted)] mt-0.5">
                    Out-of-specification readings, sensor drift alerts, and quality anomalies.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <RoundIconButton
                    icon={CheckCheck}
                    label="Mark All Read"
                  />
                  <RoundIconButton
                    icon={SlidersHorizontal}
                    label="Severity Thresholds"
                  />
                </div>
              </div>

              <AlertFeed />
            </PanelCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Test Modal */}
      <NewTestModal
        open={newTestOpen}
        onClose={() => setNewTestOpen(false)}
        onTestStarted={() => {
          setActiveTab('Samples')
        }}
      />
    </>
  )
}
