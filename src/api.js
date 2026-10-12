// api.js – all data access goes through here (never import mockData directly from components)
import { SAMPLES, HISTORY, makeReading, TASTE_CLASSES } from './mockData.js'

// Internal live state – can be pinned to a specific sample
import { SAMPLES_HISTORY } from './mockData.js'

let _activeSampleId = 'haldi-water'
let _liveReading = { ...(SAMPLES_HISTORY['haldi-water']?.[0] || HISTORY[0]) }
let _sampleIndex = 0

function _refresh() {
  const sample = SAMPLES.find(s => s.id === _activeSampleId) || SAMPLES[0]
  _liveReading = makeReading(sample)
}

// Start the 3 s tick
setInterval(_refresh, 3000)

// ── Active Sample ────────────────────────────────────────────────────────────
export function setActiveSample(sampleId) {
  _activeSampleId = sampleId ?? 'haldi-water'
  _refresh()
}
export function getActiveSampleId() {
  return _activeSampleId
}

/**
 * Returns the most-recent sensor reading (updated every 3 s).
 * @returns {Promise<Object>}
 */
export async function getLatestReading() {
  return { ..._liveReading }
}

/**
 * Returns paginated history (newest first).
 * @param {{ limit?: number, offset?: number, sampleId?: string }} opts
 * @returns {Promise<{ data: Object[], total: number }>}
 */
export async function getHistory({ limit = 30, offset = 0, sampleId } = {}) {
  await _delay(40)
  const targetId = sampleId || _activeSampleId || 'haldi-water'
  const list = SAMPLES_HISTORY[targetId] || HISTORY
  return {
    data:  list.slice(offset, offset + limit),
    total: list.length,
  }
}

/**
 * Returns all sample definitions.
 * @returns {Promise<Object[]>}
 */
export async function getSamples() {
  return [...SAMPLES]
}

/**
 * Runs the taste-prediction model for the given sensor values.
 * @param {{ ph: number, tds: number, turbidity: number }} reading
 * @returns {Promise<{ predictedTaste: string, confidence: number, rasa: string }>}
 */
export async function predictTaste({ ph, tds, turbidity }) {
  await _delay(220)
  // Simple rule-based stand-in for the ML model
  let predictedTaste = 'Anabhilashita'
  let confidence = 0.95
  if (tds > 3000)        { predictedTaste = 'Lavana';    confidence = 0.93 }
  else if (ph < 5.8)     { predictedTaste = 'Amla';      confidence = 0.88 }
  else if (turbidity > 40) { predictedTaste = 'Tikta';   confidence = 0.86 }
  else if (tds > 200)    { predictedTaste = 'Madhura';   confidence = 0.90 }
  else if (turbidity > 8) { predictedTaste = 'Tikta';    confidence = 0.84 }
  const rasaMap = {
    Anabhilashita: 'No dominant rasa – pure, neutral',
    Lavana:        'Salty – earth + fire elements',
    Amla:          'Sour – earth + fire elements',
    Tikta:         'Bitter – ether + air elements',
    Madhura:       'Sweet – earth + water elements',
    Katu:          'Pungent – fire + air elements',
    Kashaya:       'Astringent – air + earth elements',
  }
  return { predictedTaste, confidence, rasa: rasaMap[predictedTaste] ?? '' }
}

/**
 * Sends a message to the AI assistant and returns a reply.
 * @param {string} message
 * @returns {Promise<{ reply: string }>}
 */
export async function sendChatMessage(message) {
  await _delay(600)
  const lower = message.toLowerCase()
  if (lower.includes('ph'))
    return { reply: 'pH measures the hydrogen-ion activity. Values 6–8 are typical for aqueous dravya extracts; strongly acidic (< 5) signals Amla rasa.' }
  if (lower.includes('tds'))
    return { reply: 'TDS (Total Dissolved Solids) reflects ionic content. Salt Water records > 5000 ppm, whereas Distilled Water approaches 0 ppm.' }
  if (lower.includes('turbidity'))
    return { reply: 'Turbidity quantifies light scattering in the sample. Haldi Water shows very high NTU values (60-90) due to curcumin particles.' }
  if (lower.includes('rasa'))
    return { reply: 'Rasa (taste) is one of the five fundamental properties of a dravya in Ayurveda: Madhura, Amla, Lavana, Katu, Tikta, Kashaya.' }
  return { reply: 'Ask me about pH, TDS, turbidity, or rasa. I can also explain any sensor reading in the context of Ayurvedic quality control.' }
}

function _delay(ms) {
  return new Promise(r => setTimeout(r, ms))
}

// ── Mock Alerts ──────────────────────────────────────────────────────────────
let _alerts = [
  { id: 'a1', severity: 'warn',  message: 'Turbidity spike: Haldi Water at 94.3 NTU – above 80 NTU threshold.', time: new Date(Date.now() - 4 * 60000).toISOString(), read: false },
  { id: 'a2', severity: 'info',  message: 'pH stable for Salt Water across last 12 readings (7.18 ± 0.03).', time: new Date(Date.now() - 18 * 60000).toISOString(), read: false },
  { id: 'a3', severity: 'error', message: 'TDS sensor drift detected: calibration recommended.', time: new Date(Date.now() - 42 * 60000).toISOString(), read: true },
  { id: 'a4', severity: 'info',  message: 'Neem Water analysis complete – Tikta (87% confidence).', time: new Date(Date.now() - 90 * 60000).toISOString(), read: true },
]
export async function getAlerts() {
  await _delay(40)
  return [..._alerts]
}
export async function dismissAlert(id) {
  _alerts = _alerts.filter(a => a.id !== id)
  return true
}
export async function markAllAlertsRead() {
  _alerts = _alerts.map(a => ({ ...a, read: true }))
  return true
}

// ── Mock Kanban ──────────────────────────────────────────────────────────────
let _kanban = [
  { id: 'k1', sample: 'Haldi Water',     rasa: 'Tikta',         confidence: 0.89, status: 'Verified',  time: new Date(Date.now() - 10 * 60000).toISOString() },
  { id: 'k2', sample: 'Neem Water',      rasa: 'Tikta',         confidence: 0.87, status: 'Verified',  time: new Date(Date.now() - 28 * 60000).toISOString() },
  { id: 'k3', sample: 'Salt Water',      rasa: 'Lavana',        confidence: 0.94, status: 'Analyzing', time: new Date(Date.now() - 2 * 60000).toISOString() },
  { id: 'k4', sample: 'Sugar Water',     rasa: 'Madhura',       confidence: 0.91, status: 'Pending',   time: new Date(Date.now() - 60000).toISOString() },
  { id: 'k5', sample: 'Distilled Water', rasa: 'Anabhilashita', confidence: 0.97, status: 'Flagged',   time: new Date(Date.now() - 55 * 60000).toISOString() },
  { id: 'k6', sample: 'Haldi Water #2',  rasa: 'Tikta',         confidence: 0.82, status: 'Pending',   time: new Date(Date.now() - 30000).toISOString() },
]
export async function getKanbanCards() {
  await _delay(60)
  return [..._kanban]
}
export async function updateKanbanStatus(id, status) {
  _kanban = _kanban.map(c => c.id === id ? { ...c, status } : c)
  return true
}
export async function addKanbanCard(card) {
  const newCard = { id: `k${Date.now()}`, ...card, time: new Date().toISOString() }
  _kanban = [newCard, ..._kanban]
  return newCard
}

// ── Mock Save ────────────────────────────────────────────────────────────────
export async function saveToHistory(reading) {
  await _delay(80)
  const saved = { ...reading, id: Date.now(), savedAt: new Date().toISOString() }
  HISTORY.unshift(saved)
  return saved
}
