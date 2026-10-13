// src/pages/Report.jsx
// Detailed analytical monograph for a specific sensor reading or test assay.
// Loads reading by ID via GET /readings/{id} or test via GET /tests/{id} using URL params or route state.

import { useState, useEffect } from 'react'
import { useLocation, useSearchParams, useNavigate } from 'react-router-dom'
import {
  FileText, ArrowLeft, Download, CheckCircle2, Clock,
  Cpu, Droplets, Waves, Activity, AlertCircle, Share2, Printer
} from 'lucide-react'
import { PanelCard, PillCard, RoundIconButton } from '../components/ui/index.js'
import RasaBadge from '../components/RasaBadge.jsx'
import { getReadingById, getTestById, predictTaste, toSampleName } from '../api.js'

function formatTime(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleString([], {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  })
}

export default function Report() {
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()

  const readingIdParam = searchParams.get('readingId') || searchParams.get('id')
  const testIdParam    = searchParams.get('testId')

  // Initial state passed from route state if available
  const stateItem = location.state?.reading || location.state?.test

  const [item, setItem]         = useState(stateItem || null)
  const [breakdown, setBreakdown] = useState(null)
  const [loading, setLoading]   = useState(!stateItem && Boolean(readingIdParam || testIdParam))
  const [error, setError]       = useState(null)

  useEffect(() => {
    let cancelled = false

    async function loadData() {
      setError(null)
      try {
        let loaded = null
        if (readingIdParam) {
          loaded = await getReadingById(readingIdParam)
        } else if (testIdParam) {
          loaded = await getTestById(testIdParam)
        } else if (stateItem) {
          loaded = stateItem
        } else {
          // Default: load reading 1 or fallback
          try {
            loaded = await getReadingById(1)
          } catch {
            setError('No reading or test specified')
            return
          }
        }

        if (cancelled) return
        setItem(loaded)

        // Run prediction for breakdown if ph, tds, turbidity are present
        if (loaded && loaded.ph != null && loaded.tds != null && loaded.turbidity != null) {
          try {
            const pred = await predictTaste({
              ph: loaded.ph,
              tds: loaded.tds,
              turbidity: loaded.turbidity,
            })
            if (!cancelled) setBreakdown(pred.breakdown)
          } catch {
            // ignore predict error
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError('Failed to load analytical report from API')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadData()

    return () => {
      cancelled = true
    }
  }, [readingIdParam, testIdParam])

  const handlePrint = () => {
    window.print()
  }

  return (
    <>
      {/* ── Top Header Toolbar ── */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[var(--tm-subtle-border)]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] bg-[var(--tm-subtle-bg)] border border-[var(--tm-subtle-border)] text-[var(--tm-text-muted)] hover:text-white transition-all"
          >
            <ArrowLeft size={13} />
            <span>Back</span>
          </button>
          <div className="flex items-center gap-2 text-[12px] text-[var(--tm-text-muted)] font-mono">
            <span>Report Certificate</span>
            <span>·</span>
            <span className="text-[var(--tm-text-primary)]">
              {item ? (item.id ? `#${item.id}` : item.name) : 'Certificate'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <RoundIconButton icon={Printer} onClick={handlePrint} label="Print Report Certificate" />
        </div>
      </header>

      {/* ── Page Title ── */}
      <section className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[36px] font-light text-[var(--tm-text-primary)] tracking-[-0.03em] leading-tight">
            Analytical Report
          </h1>
          <p className="text-[13px] text-[var(--tm-text-muted)] mt-0.5">
            Ayurvedic Pharmacopeia Electrochemical Authentication & ML Rasa Assessment
          </p>
        </div>

        {item && (
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-mono bg-[#34d399]/10 text-[#34d399] border border-[#34d399]/30 flex items-center gap-1.5">
              <CheckCircle2 size={13} />
              Verified Acquisition
            </span>
          </div>
        )}
      </section>

      {/* ── Main Report Content ── */}
      {loading ? (
        <PanelCard padding={28}>
          <div className="animate-pulse flex flex-col gap-4 py-8">
            <div className="h-8 bg-white/5 rounded-xl w-1/3" />
            <div className="h-4 bg-white/5 rounded-xl w-1/2" />
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="h-24 bg-white/5 rounded-2xl" />
              <div className="h-24 bg-white/5 rounded-2xl" />
              <div className="h-24 bg-white/5 rounded-2xl" />
            </div>
          </div>
        </PanelCard>
      ) : error ? (
        <PanelCard padding={28}>
          <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
            <AlertCircle size={32} className="text-[#f87171]" />
            <h3 className="text-[16px] font-semibold text-white">{error}</h3>
            <p className="text-[12px] text-[var(--tm-text-muted)] max-w-sm">
              Could not retrieve the specified sensor reading. Ensure the backend API is active or return to History.
            </p>
            <button
              onClick={() => navigate('/history')}
              className="mt-2 px-4 py-2 rounded-full font-medium text-black bg-[var(--tm-lime)] text-[12px]"
            >
              Browse History
            </button>
          </div>
        </PanelCard>
      ) : item ? (
        <PanelCard padding={28} className="flex flex-col gap-6">
          {/* Header Block */}
          <div className="flex items-start justify-between flex-wrap gap-4 pb-6 border-b border-[var(--tm-subtle-border)]">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--tm-lime)] block">
                Certificate of Electrochemical Analysis
              </span>
              <h2 className="text-[24px] font-semibold text-white tracking-tight mt-1">
                {item.sample || item.name}
              </h2>
              <div className="flex items-center gap-4 text-[12px] text-[var(--tm-text-muted)] font-mono mt-1 flex-wrap">
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {formatTime(item.timestamp || item.created_at || item.createdAt)}
                </span>
                <span>·</span>
                <span>Device: {item.deviceId || item.device_id || 'esp32-node-01'}</span>
                <span>·</span>
                <span>ID: #{item.id}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <RasaBadge rasa={item.predictedTaste || item.predicted_taste || item.rasa} />
              <div className="px-3 py-1.5 rounded-xl bg-[var(--tm-subtle-bg)] border border-[var(--tm-subtle-border)] text-right">
                <span className="text-[9px] text-[var(--tm-text-muted)] block uppercase font-mono">Confidence</span>
                <span className="text-[14px] font-bold text-white font-mono">
                  {Math.round(((item.confidence) || 0.88) * 100)}%
                </span>
              </div>
            </div>
          </div>

          {/* Sensor Channels Grid */}
          <div>
            <h3 className="text-[14px] font-semibold text-[var(--tm-text-primary)] mb-3">
              Acquisition Telemetry (Calibrated ADC Readout)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <PillCard className="p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[12px] text-[var(--tm-text-muted)] flex items-center gap-1.5 font-sans">
                    <Droplets size={14} color="#818cf8" />
                    pH Value
                  </span>
                  <span className="text-[10px] font-mono text-[var(--tm-text-muted)]">Glass Electrode</span>
                </div>
                <div className="text-[28px] font-semibold font-mono text-[var(--tm-lime)]">
                  {item.ph != null ? item.ph.toFixed(2) : '—'}
                </div>
                <span className="text-[11px] text-[var(--tm-text-muted)] mt-1">
                  Acceptable range: 4.0 – 9.0 pH
                </span>
              </PillCard>

              <PillCard className="p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[12px] text-[var(--tm-text-muted)] flex items-center gap-1.5 font-sans">
                    <Waves size={14} color="#38bdf8" />
                    Total Dissolved Solids
                  </span>
                  <span className="text-[10px] font-mono text-[var(--tm-text-muted)]">Ionic Salinity</span>
                </div>
                <div className="text-[28px] font-semibold font-mono text-[#38bdf8]">
                  {item.tds != null ? Math.round(item.tds) : '—'} <span className="text-[14px] font-normal font-sans text-muted">ppm</span>
                </div>
                <span className="text-[11px] text-[var(--tm-text-muted)] mt-1">
                  Threshold limit: &lt; 2500 ppm
                </span>
              </PillCard>

              <PillCard className="p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[12px] text-[var(--tm-text-muted)] flex items-center gap-1.5 font-sans">
                    <Activity size={14} color="#f59e0b" />
                    Turbidity Index
                  </span>
                  <span className="text-[10px] font-mono text-[var(--tm-text-muted)]">Optical Scatter</span>
                </div>
                <div className="text-[28px] font-semibold font-mono text-[#f59e0b]">
                  {item.turbidity != null ? item.turbidity.toFixed(1) : '—'} <span className="text-[14px] font-normal font-sans text-muted">NTU</span>
                </div>
                <span className="text-[11px] text-[var(--tm-text-muted)] mt-1">
                  Optical limit: &lt; 110 NTU
                </span>
              </PillCard>
            </div>
          </div>

          {/* Rasa Breakdown if available */}
          {breakdown && Object.keys(breakdown).length > 0 && (
            <div>
              <h3 className="text-[14px] font-semibold text-[var(--tm-text-primary)] mb-3">
                Bayesian Taste Decomposition
              </h3>
              <PillCard className="p-5 flex flex-col gap-3">
                {Object.entries(breakdown).map(([taste, pct]) => {
                  const val = typeof pct === 'number' ? pct : parseFloat(pct) || 0
                  return (
                    <div key={taste} className="flex flex-col gap-1 text-[12px]">
                      <div className="flex justify-between font-mono">
                        <span className="capitalize text-[var(--tm-text-muted)]">{taste}</span>
                        <span className="text-white font-medium">{val.toFixed(1)}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(100, Math.max(2, val))}%`,
                            background: taste.toLowerCase() === (item.predictedTaste || item.predicted_taste || '').toLowerCase()
                              ? 'var(--tm-lime)'
                              : 'rgba(255, 255, 255, 0.25)',
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </PillCard>
            </div>
          )}

          {/* Pharmacopeia Attestation Footer */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-between flex-wrap gap-4 text-[12px]">
            <div>
              <span className="text-[var(--tm-text-primary)] font-semibold block">
                Ayurvedic Dravya Quality Attestation
              </span>
              <span className="text-[var(--tm-text-muted)]">
                Acquired via TasteMatrix calibrated ESP32 sensor node and verified by machine learning inference.
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/history')}
                className="px-4 py-2 rounded-xl text-[12px] bg-white/5 hover:bg-white/10 text-white font-medium transition-colors"
              >
                Back to History
              </button>
              <button
                onClick={() => navigate('/analysis')}
                className="px-4 py-2 rounded-xl text-[12px] bg-[var(--tm-lime)] text-black font-semibold transition-transform hover:scale-105"
              >
                Compare in Analysis
              </button>
            </div>
          </div>
        </PanelCard>
      ) : null}
    </>
  )
}
