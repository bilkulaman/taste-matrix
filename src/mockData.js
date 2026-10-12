// mockData.js – static sample definitions and smooth realistic sensor drifting time series

export const SAMPLES = [
  { id: 'haldi-water',     name: 'Haldi Water',     rasa: 'Tikta (Bitter)',          phBase: 6.5, tdsBase: 140,  turbidityBase: 78.0, color: '#f59e0b' },
  { id: 'neem-water',      name: 'Neem Water',      rasa: 'Tikta (Bitter)',          phBase: 5.4, tdsBase: 95,   turbidityBase: 12.0, color: '#34d399' },
  { id: 'salt-water',      name: 'Salt Water',      rasa: 'Lavana (Salty)',          phBase: 7.2, tdsBase: 5200, turbidityBase: 0.5,  color: '#38bdf8' },
  { id: 'sugar-water',     name: 'Sugar Water',     rasa: 'Madhura (Sweet)',         phBase: 6.9, tdsBase: 280,  turbidityBase: 0.3,  color: '#c6f432' },
  { id: 'distilled-water', name: 'Distilled Water', rasa: 'Anabhilashita (Tasteless)', phBase: 7.0, tdsBase: 2,    turbidityBase: 0.1,  color: '#60a5fa' },
]

export const TASTE_CLASSES = {
  'distilled-water': { predictedTaste: 'Anabhilashita', confidence: 0.97 },
  'salt-water':      { predictedTaste: 'Lavana',         confidence: 0.94 },
  'sugar-water':     { predictedTaste: 'Madhura',        confidence: 0.91 },
  'haldi-water':     { predictedTaste: 'Tikta',          confidence: 0.89 },
  'neem-water':      { predictedTaste: 'Tikta',          confidence: 0.87 },
}

let _readingId = 100

// Generate smooth drifting reading from a previous state (+/-2% random noise)
export function makeDriftingReading(sample, prevReading, timestamp) {
  const t = TASTE_CLASSES[sample.id] || { predictedTaste: 'Tikta', confidence: 0.88 }
  const basePh = sample.phBase
  const baseTds = sample.tdsBase
  const baseTurb = sample.turbidityBase

  // If prev reading exists and belongs to same sample, drift smoothly from it
  let ph, tds, turbidity
  if (prevReading && prevReading.sampleId === sample.id) {
    const phDelta = (Math.random() - 0.5) * 0.03
    ph = Math.max(0, Math.min(14, prevReading.ph + phDelta))

    const tdsDelta = (Math.random() - 0.48) * (baseTds * 0.015 || 1.5)
    tds = Math.max(0, Math.round(prevReading.tds + tdsDelta))

    const turbDelta = (Math.random() - 0.49) * (baseTurb * 0.02 || 0.3)
    turbidity = Math.max(0, parseFloat((prevReading.turbidity + turbDelta).toFixed(2)))
  } else {
    ph = parseFloat((basePh + (Math.random() - 0.5) * 0.08).toFixed(2))
    tds = Math.max(0, Math.round(baseTds * (1 + (Math.random() - 0.5) * 0.03)))
    turbidity = Math.max(0, parseFloat((baseTurb * (1 + (Math.random() - 0.5) * 0.04)).toFixed(2)))
  }

  return {
    id: _readingId++,
    sample: sample.name,
    sampleId: sample.id,
    ph: parseFloat(ph.toFixed(2)),
    tds: Math.round(tds),
    turbidity: parseFloat(turbidity.toFixed(2)),
    timestamp: timestamp ?? new Date().toISOString(),
    predictedTaste: t.predictedTaste,
    confidence: parseFloat(Math.min(0.99, Math.max(0.75, t.confidence + (Math.random() - 0.5) * 0.02)).toFixed(3)),
  }
}

// Pre-generate smooth 35 readings per sample (newest first)
export const SAMPLES_HISTORY = {}
const now = Date.now()

for (const sample of SAMPLES) {
  const list = []
  let prev = null
  for (let i = 0; i < 35; i++) {
    const time = new Date(now - (34 - i) * 3000).toISOString()
    const r = makeDriftingReading(sample, prev, time)
    prev = r
    list.push(r)
  }
  // Store newest first
  SAMPLES_HISTORY[sample.id] = list.reverse()
}

// Combined global history for backward compatibility
export const HISTORY = [...SAMPLES_HISTORY['haldi-water']]

export function makeReading(sample, timestamp) {
  const currentList = SAMPLES_HISTORY[sample.id] || []
  const prev = currentList[0] || null
  const newR = makeDriftingReading(sample, prev, timestamp)
  currentList.unshift(newR)
  if (currentList.length > 50) currentList.pop()
  return newR
}
