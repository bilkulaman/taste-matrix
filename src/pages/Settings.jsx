// pages/Settings.jsx
// Stage 7: Hardware node & display configuration.
// Integrated with ThemeContext (useTheme) for dynamic theme switching.
// Panel-in-panel architecture: 32px frosted panels, 22px nested pill cards, 22px headers, 40px round icon buttons.

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Cpu, RefreshCw, Palette, Bell, Save, RotateCcw, Moon, Sun, Check, Sliders } from 'lucide-react'
import { useTheme } from '../context/ThemeContext.jsx'
import { PanelCard, PillCard, RoundIconButton } from '../components/ui/index.js'

function SettingRow({ label, desc, children }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 border-b border-[var(--tm-subtle-border)] last:border-none">
      <div>
        <p className="text-[13px] text-[var(--tm-text-primary)] font-medium">{label}</p>
        {desc && <p className="text-[11px] text-[var(--tm-text-muted)] mt-0.5">{desc}</p>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  )
}

function Toggle({ value, onChange }) {
  return (
    <button
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      className="relative rounded-full transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-[var(--tm-lime)]"
      style={{
        background: value ? 'var(--tm-lime)' : 'var(--tm-subtle-bg)',
        height: 24,
        width: 44,
        border: '1px solid var(--tm-subtle-border)',
      }}
    >
      <motion.span
        className="absolute top-0.5 w-5 h-5 rounded-full bg-black shadow-sm"
        animate={{ left: value ? 21 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        style={{ width: 18, height: 18 }}
      />
    </button>
  )
}

const DEFAULTS = {
  deviceIp:        '192.168.1.42',
  pollInterval:    3,
  phAlertMin:      4.0,
  phAlertMax:      10.0,
  tdsAlertMax:     5500,
  turbidityAlert:  80,
  notifications:   true,
  autoPredict:     true,
  confidenceCutoff: 0.75,
}

const STORAGE_KEY = 'tm-settings-v2'

function loadSettings() {
  try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') } }
  catch { return { ...DEFAULTS } }
}

export default function Settings() {
  const { theme, setTheme } = useTheme()
  const [cfg, setCfg] = useState(loadSettings)
  const [saved, setSaved] = useState(false)

  const set = (key) => (value) => setCfg((c) => ({ ...c, [key]: value }))

  const save = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const reset = () => {
    setCfg({ ...DEFAULTS })
    localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <>
      {/* ── Top Header Bar ── */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[var(--tm-subtle-border)]">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--tm-subtle-bg)] border border-[var(--tm-subtle-border)] text-[12px]">
          <Sliders size={13} color="var(--tm-lime)" />
          <span className="text-[var(--tm-text-muted)]">Preferences & Node Calibration</span>
        </div>

        <div className="flex items-center gap-2">
          <RoundIconButton icon={RotateCcw} onClick={reset} label="Reset to Defaults" />
          <RoundIconButton
            icon={Save}
            onClick={save}
            label="Save Preferences"
            variant="lime"
          />
        </div>
      </header>

      {/* ── Page Title ── */}
      <section>
        <h1 className="text-[36px] font-light text-[var(--tm-text-primary)] tracking-[-0.03em] leading-tight">
          Settings
        </h1>
        <p className="text-[13px] text-[var(--tm-text-muted)] mt-0.5">
          Sensor node connectivity, anomaly trigger thresholds & interface theme preferences
        </p>
      </section>

      {/* ── Settings Panels Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Panel 1: Hardware Node & Connectivity */}
        <PanelCard padding={24}>
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[var(--tm-subtle-border)]">
            <Cpu size={16} color="var(--tm-lime)" />
            <h2 className="text-[18px] font-semibold text-[var(--tm-text-primary)] tracking-tight">
              ESP32 Node & Connectivity
            </h2>
          </div>

          <div className="flex flex-col gap-2">
            <SettingRow label="Node IP Address" desc="Local IPv4 endpoint of ESP32 sensor acquisition board">
              <input
                type="text"
                value={cfg.deviceIp}
                onChange={(e) => set('deviceIp')(e.target.value)}
                className="w-36 h-9 px-3 rounded-xl text-[12px] text-[var(--tm-text-primary)] bg-[var(--tm-subtle-bg)] border border-[var(--tm-subtle-border)] outline-none font-mono"
              />
            </SettingRow>

            <SettingRow label="Polling Frequency" desc="Interval between analog-to-digital conversions">
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={cfg.pollInterval}
                  onChange={(e) => set('pollInterval')(Number(e.target.value))}
                  className="w-16 h-9 rounded-xl text-center text-[12px] text-[var(--tm-text-primary)] bg-[var(--tm-subtle-bg)] border border-[var(--tm-subtle-border)] font-mono outline-none"
                />
                <span className="text-[11px] text-[var(--tm-text-muted)] font-mono">sec</span>
              </div>
            </SettingRow>

            <SettingRow label="Auto-Predict Rasa" desc="Trigger ML inference engine on every fresh sample reading">
              <Toggle value={cfg.autoPredict} onChange={set('autoPredict')} />
            </SettingRow>
          </div>
        </PanelCard>

        {/* Panel 2: Theme & Visual Interface */}
        <PanelCard padding={24}>
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[var(--tm-subtle-border)]">
            <Palette size={16} color="var(--tm-lime)" />
            <h2 className="text-[18px] font-semibold text-[var(--tm-text-primary)] tracking-tight">
              Interface Theme & Aesthetics
            </h2>
          </div>

          <div className="flex flex-col gap-3">
            <SettingRow label="Active Theme" desc="Choose between deep cosmic dark and frosted light">
              <div className="flex items-center gap-2 p-1 rounded-full bg-[var(--tm-subtle-bg)] border border-[var(--tm-subtle-border)]">
                <button
                  onClick={() => setTheme('dark')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium transition-all ${
                    theme === 'dark'
                      ? 'bg-[var(--tm-card-bg)] text-white shadow-sm font-semibold'
                      : 'text-[var(--tm-text-muted)] hover:text-[var(--tm-text-primary)]'
                  }`}
                >
                  <Moon size={12} />
                  <span>Dark</span>
                </button>
                <button
                  onClick={() => setTheme('light')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium transition-all ${
                    theme === 'light'
                      ? 'bg-[var(--tm-lime)] text-[var(--tm-lime-text)] shadow-sm font-semibold'
                      : 'text-[var(--tm-text-muted)] hover:text-[var(--tm-text-primary)]'
                  }`}
                >
                  <Sun size={12} />
                  <span>Light</span>
                </button>
              </div>
            </SettingRow>

            <SettingRow label="System Audio & Alerts" desc="Broadcast browser alerts on out-of-specification readings">
              <Toggle value={cfg.notifications} onChange={set('notifications')} />
            </SettingRow>

            <SettingRow label="Confidence Cutoff" desc="Minimum classification probability to mark 'Verified'">
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="0.5"
                  max="0.99"
                  step="0.05"
                  value={cfg.confidenceCutoff}
                  onChange={(e) => set('confidenceCutoff')(Number(e.target.value))}
                  className="w-20 h-9 rounded-xl text-center text-[12px] text-[var(--tm-text-primary)] bg-[var(--tm-subtle-bg)] border border-[var(--tm-subtle-border)] font-mono outline-none"
                />
              </div>
            </SettingRow>
          </div>
        </PanelCard>

        {/* Panel 3: Quality Control Sensor Thresholds */}
        <PanelCard padding={24} className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[var(--tm-subtle-border)]">
            <Bell size={16} color="var(--tm-lime)" />
            <h2 className="text-[18px] font-semibold text-[var(--tm-text-primary)] tracking-tight">
              Quality Assurance Alert Thresholds
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <PillCard className="p-4 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-mono uppercase text-[var(--tm-text-muted)]">pH Tolerance Band</span>
                <p className="text-[13px] text-[var(--tm-text-primary)] font-semibold mt-1">
                  Trigger alert outside range
                </p>
              </div>
              <div className="flex items-center gap-2 mt-3 pt-2 border-t border-[var(--tm-subtle-border)]">
                <input
                  type="number"
                  step="0.1"
                  value={cfg.phAlertMin}
                  onChange={(e) => set('phAlertMin')(Number(e.target.value))}
                  className="w-16 h-8 rounded-lg text-center text-[12px] text-[var(--tm-text-primary)] bg-[var(--tm-subtle-bg)] border border-[var(--tm-subtle-border)] font-mono outline-none"
                />
                <span className="text-[11px] text-[var(--tm-text-muted)]">to</span>
                <input
                  type="number"
                  step="0.1"
                  value={cfg.phAlertMax}
                  onChange={(e) => set('phAlertMax')(Number(e.target.value))}
                  className="w-16 h-8 rounded-lg text-center text-[12px] text-[var(--tm-text-primary)] bg-[var(--tm-subtle-bg)] border border-[var(--tm-subtle-border)] font-mono outline-none"
                />
              </div>
            </PillCard>

            <PillCard className="p-4 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-mono uppercase text-[var(--tm-text-muted)]">TDS Upper Ceiling</span>
                <p className="text-[13px] text-[var(--tm-text-primary)] font-semibold mt-1">
                  Flag abnormal ionic drift
                </p>
              </div>
              <div className="flex items-center gap-2 mt-3 pt-2 border-t border-[var(--tm-subtle-border)]">
                <input
                  type="number"
                  step="100"
                  value={cfg.tdsAlertMax}
                  onChange={(e) => set('tdsAlertMax')(Number(e.target.value))}
                  className="w-24 h-8 rounded-lg text-center text-[12px] text-[var(--tm-text-primary)] bg-[var(--tm-subtle-bg)] border border-[var(--tm-subtle-border)] font-mono outline-none"
                />
                <span className="text-[11px] text-[var(--tm-text-muted)] font-mono">ppm</span>
              </div>
            </PillCard>

            <PillCard className="p-4 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-mono uppercase text-[var(--tm-text-muted)]">Turbidity Limit</span>
                <p className="text-[13px] text-[var(--tm-text-primary)] font-semibold mt-1">
                  Suspension threshold alert
                </p>
              </div>
              <div className="flex items-center gap-2 mt-3 pt-2 border-t border-[var(--tm-subtle-border)]">
                <input
                  type="number"
                  step="5"
                  value={cfg.turbidityAlert}
                  onChange={(e) => set('turbidityAlert')(Number(e.target.value))}
                  className="w-20 h-8 rounded-lg text-center text-[12px] text-[var(--tm-text-primary)] bg-[var(--tm-subtle-bg)] border border-[var(--tm-subtle-border)] font-mono outline-none"
                />
                <span className="text-[11px] text-[var(--tm-text-muted)] font-mono">NTU</span>
              </div>
            </PillCard>
          </div>
        </PanelCard>
      </div>

      {/* Floating Save Toast */}
      {saved && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full shadow-2xl font-semibold text-[13px]"
          style={{ background: 'var(--tm-lime)', color: 'var(--tm-lime-text)' }}
        >
          <Check size={16} strokeWidth={2.5} />
          <span>Configuration saved successfully</span>
        </motion.div>
      )}
    </>
  )
}
