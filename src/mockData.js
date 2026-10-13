// src/mockData.js
// Static fallback definitions and deterministic mock datasets for offline fallback only.
// ZERO Math.random or random-walk simulation is used here.

export const SAMPLES = [
  { id: 'haldi-water',     name: 'Haldi Water',     rasa: 'Tikta (Bitter)',          phBase: 6.65, tdsBase: 360,  turbidityBase: 92.0, color: '#f59e0b' },
  { id: 'neem-water',      name: 'Neem Water',      rasa: 'Tikta (Bitter)',          phBase: 5.85, tdsBase: 270,  turbidityBase: 48.0, color: '#34d399' },
  { id: 'salt-water',      name: 'Salt Water',      rasa: 'Lavana (Salty)',          phBase: 7.10, tdsBase: 2150, turbidityBase: 5.5,  color: '#38bdf8' },
  { id: 'sugar-water',     name: 'Sugar Water',     rasa: 'Madhura (Sweet)',         phBase: 6.85, tdsBase: 200,  turbidityBase: 2.5,  color: '#c6f432' },
  { id: 'distilled-water', name: 'Distilled Water', rasa: 'Anabhilashita (Tasteless)', phBase: 7.05, tdsBase: 10,   turbidityBase: 0.3,  color: '#60a5fa' },
]

export const TASTE_CLASSES = {
  'distilled-water': { predictedTaste: 'Anabhilashita', confidence: 0.98 },
  'salt-water':      { predictedTaste: 'Lavana',         confidence: 0.87 },
  'sugar-water':     { predictedTaste: 'Madhura',        confidence: 0.86 },
  'haldi-water':     { predictedTaste: 'Tikta',          confidence: 0.74 },
  'neem-water':      { predictedTaste: 'Tikta',          confidence: 0.88 },
}

// Deterministic sample values
const SAMPLE_DEFAULTS = {
  'haldi-water':     { ph: 6.65, tds: 360, turb: 92.0, taste: 'Tikta', conf: 0.74 },
  'neem-water':      { ph: 5.85, tds: 270, turb: 48.0, taste: 'Tikta', conf: 0.88 },
  'salt-water':      { ph: 7.10, tds: 2150, turb: 5.5, taste: 'Lavana', conf: 0.87 },
  'sugar-water':     { ph: 6.85, tds: 200, turb: 2.5, taste: 'Madhura', conf: 0.86 },
  'distilled-water': { ph: 7.05, tds: 10,  turb: 0.3, taste: 'Anabhilashita', conf: 0.98 },
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
