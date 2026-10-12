// components/RasaBadge.jsx
// Pill badge that colours each rasa classification.

const RASA_COLORS = {
  Madhura:       { bg: 'rgba(251,191,36,0.12)',  border: 'rgba(251,191,36,0.35)',  text: '#fbbf24' },
  Lavana:        { bg: 'rgba(59,130,246,0.12)',  border: 'rgba(59,130,246,0.35)',  text: '#60a5fa' },
  Amla:          { bg: 'rgba(251,113,133,0.12)', border: 'rgba(251,113,133,0.35)', text: '#fb7185' },
  Tikta:         { bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.35)', text: '#a78bfa' },
  Katu:          { bg: 'rgba(249,115,22,0.12)',  border: 'rgba(249,115,22,0.35)',  text: '#fb923c' },
  Kashaya:       { bg: 'rgba(52,211,153,0.12)',  border: 'rgba(52,211,153,0.35)',  text: '#34d399' },
  Anabhilashita: { bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.14)', text: '#8a8a93' },
}

export default function RasaBadge({ rasa, small = false }) {
  const c = RASA_COLORS[rasa] ?? RASA_COLORS.Anabhilashita
  return (
    <span
      className="inline-flex items-center rounded-full font-medium"
      style={{
        background: c.bg,
        border: `1px solid ${c.border}`,
        color: c.text,
        fontSize: small ? 10 : 12,
        padding: small ? '1px 8px' : '3px 10px',
      }}
    >
      {rasa}
    </span>
  )
}
