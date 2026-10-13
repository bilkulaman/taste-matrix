import axios from 'axios'
import { SAMPLES, HISTORY, SAMPLES_HISTORY, getStaticMockHistory, getStaticMockRecent, getStaticMockReading } from './mockData.js'

export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const client = axios.create({
  baseURL: API_BASE,
  timeout: 5000,
})

let _activeSampleId = 'haldi-water'
let _backendOnline = false

const SAMPLE_NAME_MAP = {
  'distilled-water': 'Distilled Water',
  'salt-water': 'Salt Water',
  'sugar-water': 'Sugar Water',
  'haldi-water': 'Haldi Water',
  'neem-water': 'Neem Water',
}

const SAMPLE_ID_MAP = {
  'distilled water': 'distilled-water',
  'salt water': 'salt-water',
  'sugar water': 'sugar-water',
  'haldi water': 'haldi-water',
  'neem water': 'neem-water',
}

export function toSampleName(idOrName) {
  if (!idOrName) return 'Haldi Water'
  return SAMPLE_NAME_MAP[idOrName] || idOrName
}

export function toSampleId(idOrName) {
  if (!idOrName) return 'haldi-water'
  const lower = idOrName.toLowerCase().trim()
  return SAMPLE_ID_MAP[lower] || lower.replace(/\s+/g, '-')
}

export function parseUtcDate(timestamp) {
  if (!timestamp) return new Date().toISOString()
  if (typeof timestamp === 'string') {
    if (!timestamp.endsWith('Z') && !timestamp.includes('+') && !timestamp.includes('-')) {
      return `${timestamp}Z`
    }
    if (timestamp.includes('T') && !timestamp.endsWith('Z') && !/[+-]\d{2}:?\d{2}$/.test(timestamp)) {
      return `${timestamp}Z`
    }
  }
  return new Date(timestamp).toISOString()
}

export function setActiveSample(sampleId) {
  _activeSampleId = sampleId ?? 'haldi-water'
}

export function getActiveSampleId() {
  return _activeSampleId
}

export function isBackendOnline() {
  return _backendOnline
}

export function setBackendOnline(status) {
  _backendOnline = Boolean(status)
}

function mapReading(d, isDemo = false) {
  return {
    id: d.id,
    sample: d.sample,
    sampleId: toSampleId(d.sample),
    ph: d.ph,
    tds: d.tds,
    turbidity: d.turbidity,
    temperature: d.temperature,
    timestamp: parseUtcDate(d.timestamp),
    predictedTaste: d.predicted_taste ?? d.predictedTaste ?? 'Tikta',
    confidence: d.confidence ?? 0.88,
    deviceId: d.device_id ?? d.deviceId ?? 'esp32-node-01',
    isDemo: Boolean(isDemo || d.isDemo),
  }
}

// ── GET /readings/latest?sample= ─────────────────────────────────────────────
export async function getLatestReading(sampleParam) {
  const currentSample = sampleParam || _activeSampleId || 'haldi-water'
  const sampleName = toSampleName(currentSample)
  const url = `${API_BASE}/readings/latest?sample=${encodeURIComponent(sampleName)}`

  try {
    const res = await client.get('/readings/latest', {
      params: { sample: sampleName }
    })
    _backendOnline = true
    const d = res.data
    const utcTime = parseUtcDate(d.timestamp)

    if (import.meta.env.DEV) {
      console.log(`[TasteMatrix Poll] ${url} -> reading #${d.id} at ${utcTime} (pH ${d.ph}, TDS ${d.tds}, Turb ${d.turbidity})`)
    }

    const reading = mapReading(d, false)
    reading.url = url
    return reading
  } catch (err) {
    _backendOnline = false
    console.warn(`[TasteMatrix] Backend unreachable at ${url}.`, err?.message)
    throw err
  }
}

// ── GET /readings?limit=5 (all samples, newest first) ────────────────────────
export async function getRecentReadings(limit = 5) {
  const url = `${API_BASE}/readings?limit=${limit}`
  try {
    const res = await client.get('/readings', {
      params: { limit, order: 'desc' }
    })
    _backendOnline = true
    return res.data.map(d => mapReading(d, false))
  } catch (err) {
    _backendOnline = false
    console.warn(`[TasteMatrix] Backend unreachable at ${url}.`, err?.message)
    throw err
  }
}

// ── GET /readings?sample=&from=&to=&limit=&order= ────────────────────────────
export async function getHistory({
  sample,
  sampleId,
  from,
  to,
  limit = 35,
  offset = 0,
  order = 'desc',
} = {}) {
  const sampleParam = sample || (sampleId ? toSampleName(sampleId) : undefined)
  const params = { limit: limit + offset }
  if (sampleParam && sampleParam !== 'All') {
    params.sample = sampleParam
  }
  if (from) params.from = from
  if (to) params.to = to
  if (order) params.order = order

  const url = `${API_BASE}/readings`
  try {
    const res = await client.get('/readings', { params })
    _backendOnline = true

    const allMapped = res.data.map(d => mapReading(d, false))
    const sliced = allMapped.slice(offset, offset + limit)

    return {
      data: sliced,
      chronological: [...sliced].reverse(),
      total: res.data.length,
    }
  } catch (err) {
    _backendOnline = false
    console.warn(`[TasteMatrix] Backend unreachable at ${url}.`, err?.message)
    throw err
  }
}

// ── GET /readings/{id} ─────────────────────────────────────────────────────────
export async function getReadingById(id) {
  const url = `${API_BASE}/readings/${id}`
  try {
    const res = await client.get(`/readings/${id}`)
    _backendOnline = true
    return mapReading(res.data, false)
  } catch (err) {
    _backendOnline = false
    console.warn(`[TasteMatrix] Failed to fetch reading ${id} from ${url}.`, err?.message)
    throw err
  }
}

// ── GET /tests/{id} ───────────────────────────────────────────────────────────
export async function getTestById(id) {
  const url = `${API_BASE}/tests/${id}`
  try {
    const res = await client.get(`/tests/${id}`)
    _backendOnline = true
    const t = res.data
    return {
      id: t.id,
      sample: t.name || t.sample,
      name: t.name,
      rasa: t.predicted_taste || 'Tikta',
      confidence: t.confidence || 0.88,
      status: t.status ? t.status.charAt(0).toUpperCase() + t.status.slice(1).toLowerCase() : 'Pending',
      notes: t.notes,
      time: parseUtcDate(t.created_at),
      createdAt: parseUtcDate(t.created_at),
    }
  } catch (err) {
    _backendOnline = false
    console.warn(`[TasteMatrix] Failed to fetch test ${id} from ${url}.`, err?.message)
    throw err
  }
}

// ── CSV Export URL ────────────────────────────────────────────────────────────
export function getExportReadingsCsvUrl({ sample, from, to, limit = 500 } = {}) {
  const params = new URLSearchParams()
  if (sample && sample !== 'All') {
    params.set('sample', sample)
  }
  if (from) params.set('from', from)
  if (to) params.set('to', to)
  if (limit) params.set('limit', String(limit))
  const qs = params.toString()
  return `${API_BASE}/export/readings.csv${qs ? `?${qs}` : ''}`
}

// ── GET /samples ─────────────────────────────────────────────────────────────
export async function getSamples() {
  const url = `${API_BASE}/samples`
  try {
    const res = await client.get('/samples')
    _backendOnline = true
    return res.data.map(s => ({
      id: s.id,
      name: s.name,
      color: s.color || '#c6f432',
      rasa: s.rasa || '',
      count: s.testCountToday || 12,
      lastReading: s.lastReading ? mapReading(s.lastReading, false) : null,
    }))
  } catch (err) {
    _backendOnline = false
    console.warn(`[TasteMatrix] Backend unreachable at ${url}, using mock samples.`, err?.message)
    return [...SAMPLES]
  }
}

// ── POST /predict ────────────────────────────────────────────────────────────
export async function predictTaste({ ph, tds, turbidity }) {
  const url = `${API_BASE}/predict`
  try {
    const res = await client.post('/predict', { ph, tds, turbidity })
    _backendOnline = true
    const d = res.data
    const rasaMap = {
      Anabhilashita: 'No dominant rasa – pure, neutral',
      Lavana:        'Salty – earth + fire elements',
      Amla:          'Sour – earth + fire elements',
      Tikta:         'Bitter – ether + air elements',
      Madhura:       'Sweet – earth + water elements',
      Katu:          'Pungent – fire + air elements',
      Kashaya:       'Astringent – air + earth elements',
    }
    return {
      predictedTaste: d.taste,
      confidence: d.confidence,
      rasa: rasaMap[d.taste] ?? '',
      breakdown: d.breakdown,
    }
  } catch (err) {
    _backendOnline = false
    console.warn(`[TasteMatrix] Backend unreachable at ${url}, using fallback rule prediction.`, err?.message)
    let predictedTaste = 'Anabhilashita'
    let confidence = 0.95
    if (tds > 3000)        { predictedTaste = 'Lavana';    confidence = 0.93 }
    else if (ph < 5.8)     { predictedTaste = 'Amla';      confidence = 0.88 }
    else if (turbidity > 40) { predictedTaste = 'Tikta';   confidence = 0.86 }
    else if (tds > 200)    { predictedTaste = 'Madhura';   confidence = 0.90 }
    else if (turbidity > 8) { predictedTaste = 'Tikta';    confidence = 0.84 }
    return {
      predictedTaste,
      confidence,
      rasa: predictedTaste,
      breakdown: {
        [predictedTaste]: confidence,
      }
    }
  }
}

// ── AI Assistant Chat ──────────────────────────────────────────────────────
export async function sendChatMessage(messages, context = {}) {
  // Support both (messages, context) array/object and legacy single string argument
  let formattedMessages = []
  if (Array.isArray(messages)) {
    formattedMessages = messages.map(m => ({
      role: m.role || 'user',
      content: m.content || m.text || '',
    }))
  } else if (typeof messages === 'string') {
    formattedMessages = [{ role: 'user', content: messages }]
  } else if (messages && typeof messages === 'object') {
    formattedMessages = [{ role: messages.role || 'user', content: messages.content || messages.text || '' }]
  }

  const fallbackText = 'The assistant is unavailable right now. Please try again.'

  try {
    const res = await axios.post('/api/chat', {
      messages: formattedMessages,
      context,
    }, { timeout: 10000 })

    const reply = res.data?.reply
    if (typeof reply === 'string' && reply.trim()) {
      return reply
    }
    return fallbackText
  } catch (err) {
    console.warn('[TasteMatrix Chat] /api/chat request failed:', err?.message)
    return fallbackText
  }
}

// ── GET /device/status ───────────────────────────────────────────────────────
export async function getDeviceStatus() {
  const url = `${API_BASE}/device/status`
  try {
    const res = await client.get('/device/status')
    _backendOnline = true
    return res.data
  } catch (err) {
    _backendOnline = false
    console.warn(`[TasteMatrix] Backend unreachable at ${url}, device is Offline.`)
    return { online: false, last_seen: null, device_id: null, rssi: null }
  }
}

// ── GET /alerts ─────────────────────────────────────────────────────────────
export async function getAlerts() {
  const url = `${API_BASE}/alerts`
  try {
    const res = await client.get('/alerts')
    _backendOnline = true
    return res.data.map(a => ({
      id: a.id,
      severity: a.severity,
      message: a.message,
      sample: a.sample,
      time: parseUtcDate(a.created_at),
      read: a.read,
    }))
  } catch (err) {
    _backendOnline = false
    console.warn(`[TasteMatrix] Backend unreachable at ${url}, using mock alerts.`)
    return [
      { id: 'a1', severity: 'warn',  message: 'Turbidity spike: Haldi Water at 94.3 NTU – above 80 NTU threshold.', time: new Date(Date.now() - 4 * 60000).toISOString(), read: false },
      { id: 'a2', severity: 'info',  message: 'pH stable for Salt Water across last 12 readings (7.18 ± 0.03).', time: new Date(Date.now() - 18 * 60000).toISOString(), read: false },
      { id: 'a3', severity: 'error', message: 'TDS sensor drift detected: calibration recommended.', time: new Date(Date.now() - 42 * 60000).toISOString(), read: true },
      { id: 'a4', severity: 'info',  message: 'Neem Water analysis complete – Tikta (87% confidence).', time: new Date(Date.now() - 90 * 60000).toISOString(), read: true },
    ]
  }
}

export async function dismissAlert(id) {
  try {
    await client.post(`/alerts/${id}/read`)
    return true
  } catch {
    return true
  }
}

export async function markAllAlertsRead() {
  try {
    await client.post('/alerts/read-all')
    return true
  } catch {
    return true
  }
}

// ── Tests / Kanban ───────────────────────────────────────────────────────────
export async function getKanbanCards() {
  const url = `${API_BASE}/tests`
  try {
    const res = await client.get('/tests')
    _backendOnline = true
    return res.data.map(t => ({
      id: t.id,
      sample: t.name || t.sample,
      rasa: t.predicted_taste || 'Tikta',
      confidence: t.confidence || 0.88,
      status: t.status ? t.status.charAt(0).toUpperCase() + t.status.slice(1).toLowerCase() : 'Pending',
      time: parseUtcDate(t.created_at),
    }))
  } catch (err) {
    _backendOnline = false
    console.warn(`[TasteMatrix] Backend unreachable at ${url}, using mock tests.`)
    return [
      { id: 'k1', sample: 'Haldi Water',     rasa: 'Tikta',         confidence: 0.89, status: 'Verified',  time: new Date(Date.now() - 10 * 60000).toISOString() },
      { id: 'k2', sample: 'Neem Water',      rasa: 'Tikta',         confidence: 0.87, status: 'Verified',  time: new Date(Date.now() - 28 * 60000).toISOString() },
      { id: 'k3', sample: 'Salt Water',      rasa: 'Lavana',        confidence: 0.94, status: 'Analyzing', time: new Date(Date.now() - 2 * 60000).toISOString() },
      { id: 'k4', sample: 'Sugar Water',     rasa: 'Madhura',       confidence: 0.91, status: 'Pending',   time: new Date(Date.now() - 60000).toISOString() },
      { id: 'k5', sample: 'Distilled Water', rasa: 'Anabhilashita', confidence: 0.97, status: 'Flagged',   time: new Date(Date.now() - 55 * 60000).toISOString() },
      { id: 'k6', sample: 'Haldi Water #2',  rasa: 'Tikta',         confidence: 0.82, status: 'Pending',   time: new Date(Date.now() - 30000).toISOString() },
    ]
  }
}

export async function updateKanbanStatus(id, status) {
  try {
    await client.patch(`/tests/${id}`, {
      status: status ? status.toLowerCase() : 'pending'
    })
    return true
  } catch {
    return true
  }
}

export async function addKanbanCard(card) {
  try {
    const res = await client.post('/tests', {
      sample: card.sample,
      name: card.sample,
      status: card.status ? card.status.toLowerCase() : 'analyzing',
      predicted_taste: card.rasa || 'Tikta',
      confidence: card.confidence || 0.88,
      notes: card.notes,
    })
    const d = res.data
    return {
      id: d.id,
      sample: d.name,
      rasa: d.predicted_taste,
      confidence: d.confidence,
      status: d.status ? d.status.charAt(0).toUpperCase() + d.status.slice(1).toLowerCase() : 'Analyzing',
      time: parseUtcDate(d.created_at),
    }
  } catch {
    return { id: `k${Date.now()}`, ...card, time: new Date().toISOString() }
  }
}

export async function saveToHistory(reading) {
  try {
    await client.post('/tests', {
      sample: reading.sample,
      name: reading.sample,
      status: 'verified',
      predicted_taste: reading.predictedTaste,
      confidence: reading.confidence,
    })
    return reading
  } catch {
    return reading
  }
}
