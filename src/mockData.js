// src/mockData.js
// Static fallback definitions and deterministic mock datasets for offline fallback only.
// ZERO Math.random or random-walk simulation is used here.

export const SAMPLES = [
  { id: 'distilled-water', name: 'Distilled Water', rasa: 'Anabhilashita (Tasteless)', phBase: 6.9,  tdsBase: 345,  turbidityBase: 0.0,  color: '#60a5fa' },
  { id: 'haldi-water',     name: 'Haldi Water',     rasa: 'Tikta (Bitter)',          phBase: 6.4,  tdsBase: 0,    turbidityBase: 0.0,  color: '#f59e0b' },
  { id: 'basic-water',     name: 'Basic Water',     rasa: 'Lavana (Salty)',          phBase: 7.8,  tdsBase: 1240, turbidityBase: 92.0, color: '#38bdf8' },
  { id: 'chalk-water',     name: 'Chalk Water',     rasa: 'Kashaya (Astringent)',    phBase: 6.1,  tdsBase: 1283, turbidityBase: 45.0, color: '#a78bfa' },
]

export const TASTE_CLASSES = {
  'distilled-water': { predictedTaste: 'Anabhilashita', confidence: 0.98 },
  'haldi-water':     { predictedTaste: 'Tikta',          confidence: 0.95 },
  'basic-water':     { predictedTaste: 'Lavana',         confidence: 0.94 },
  'chalk-water':     { predictedTaste: 'Kashaya',        confidence: 0.92 },
}

// Deterministic sample values
const SAMPLE_DEFAULTS = {
  'distilled-water': { ph: 6.9, tds: 345,  turb: 0.0,  taste: 'Anabhilashita', conf: 0.98 },
  'haldi-water':     { ph: 6.4, tds: 0,    turb: 0.0,  taste: 'Tikta',         conf: 0.95 },
  'basic-water':     { ph: 7.8, tds: 1240, turb: 92.0, taste: 'Lavana',        conf: 0.94 },
  'chalk-water':     { ph: 6.1, tds: 1283, turb: 45.0, taste: 'Kashaya',       conf: 0.92 },
}

// Generate static deterministic fallback readings (newest first)
function generateStaticFallback(sampleId) {
  const meta = SAMPLES.find(s => s.id === sampleId) || SAMPLES[0]
  const d = SAMPLE_DEFAULTS[sampleId] || SAMPLE_DEFAULTS['haldi-water']
  const fixedBaseTime = 1776000000000 // Fixed deterministic epoch
  const list = []

  for (let i = 0; i < 35; i++) {
    // Deterministic fixed variations
    const phVariance = Math.round(Math.sin(i * 0.3) * 3) / 100
    const tdsVariance = Math.round(Math.cos(i * 0.2) * 5)
    const turbVariance = Math.round(Math.sin(i * 0.4) * 4) / 10

    list.push({
      id: 9000 + i,
      sample: meta.name,
      sampleId: meta.id,
      ph: parseFloat((d.ph + phVariance).toFixed(2)),
      tds: Math.round(d.tds + tdsVariance),
      turbidity: parseFloat((d.turb + turbVariance).toFixed(1)),
      temperature: 25.0,
      timestamp: new Date(fixedBaseTime - i * 3000).toISOString(),
      predictedTaste: d.taste,
      confidence: d.conf,
      deviceId: 'esp32-node-fallback',
      isDemo: true,
    })
  }

  return list
}

export const SAMPLES_HISTORY = {
  'haldi-water':     generateStaticFallback('haldi-water'),
  'neem-water':      generateStaticFallback('neem-water'),
  'salt-water':      generateStaticFallback('salt-water'),
  'sugar-water':     generateStaticFallback('sugar-water'),
  'distilled-water': generateStaticFallback('distilled-water'),
}

export const HISTORY = [...SAMPLES_HISTORY['haldi-water']]

// Static fixtures for initial empty state when backend has never responded
export function getStaticMockHistory(sampleId) {
  const key = sampleId ? sampleId.toLowerCase().replace(/\s+/g, '-') : 'haldi-water'
  const list = SAMPLES_HISTORY[key] || SAMPLES_HISTORY['haldi-water']
  // Return in chronological order (oldest to newest, exactly 30 items)
  return [...list].reverse().slice(-30)
}

export function getStaticMockRecent(limit = 5) {
  return HISTORY.slice(0, limit)
}

export function getStaticMockReading(sampleId) {
  const hist = getStaticMockHistory(sampleId)
  return hist[hist.length - 1]
}

export function makeReading(sample, timestamp) {
  const d = SAMPLE_DEFAULTS[sample.id] || SAMPLE_DEFAULTS['haldi-water']
  return {
    id: 9999,
    sample: sample.name,
    sampleId: sample.id,
    ph: d.ph,
    tds: d.tds,
    turbidity: d.turb,
    temperature: 25.0,
    timestamp: timestamp || '2026-04-12T00:00:00.000Z',
    predictedTaste: d.taste,
    confidence: d.conf,
    deviceId: 'esp32-node-fallback',
    isDemo: true,
  }
}
