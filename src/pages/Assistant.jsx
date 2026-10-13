// pages/Assistant.jsx
// Stage 6: AI Chat Assistant for Ayurvedic Dravya & E-Tongue Reasoning.
// Panel-in-panel architecture: 32px frosted panels, 22px nested pill cards, 22px headers, 40px round icon buttons.

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, User, Zap, Sparkles, Trash2, Download, MessageSquare } from 'lucide-react'
import { sendChatMessage } from '../api.js'
import { useLiveReading }  from '../hooks/useLiveReading.js'
import { PanelCard, PillCard, RoundIconButton } from '../components/ui/index.js'

const QUICK_PROMPTS = [
  'What does high TDS in Salt Water indicate?',
  'How does acidic pH classify Amla rasa?',
  'Explain curcumin turbidity in Haldi Water.',
  'What are the six rasas in classical Ayurveda?',
  'How does ESP32 multi-sensor fusion reduce error?',
]

function ChatMessage({ msg }) {
  const isUser = msg.role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      {/* Round Avatar */}
      <div
        className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center"
        style={{
          background: isUser
            ? 'var(--tm-subtle-bg)'
            : 'var(--tm-lime-dim)',
          border: isUser
            ? '1px solid var(--tm-subtle-border)'
            : '1px solid var(--tm-lime-border)',
        }}
      >
        {isUser ? (
          <User size={14} color="var(--tm-text-muted)" />
        ) : (
          <Zap size={14} color="var(--tm-lime)" fill="var(--tm-lime)" />
        )}
      </div>

      {/* Message Bubble (Nested Pill Card Shape) */}
      <div
        className="max-w-[76%] rounded-3xl px-4 py-3 text-[13px] leading-relaxed shadow-sm"
        style={{
          background: isUser
            ? 'var(--tm-card-bg)'
            : 'var(--tm-panel-bg)',
          border: '1px solid var(--tm-card-border)',
          color: isUser
            ? 'var(--tm-text-primary)'
            : 'var(--tm-text-primary)',
          borderRadius: isUser ? '20px 6px 20px 20px' : '6px 20px 20px 20px',
        }}
      >
        {msg.text}
      </div>
    </motion.div>
  )
}

function TypingDots() {
  return (
    <div className="flex gap-3 items-end">
      <div
        className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center"
        style={{ background: 'var(--tm-lime-dim)', border: '1px solid var(--tm-lime-border)' }}
      >
        <Zap size={13} color="var(--tm-lime)" fill="var(--tm-lime)" />
      </div>
      <div
        className="flex items-center gap-1.5 px-4 py-3 rounded-2xl rounded-tl-md bg-[var(--tm-subtle-bg)] border border-[var(--tm-subtle-border)]"
      >
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-[var(--tm-lime)]"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
    </div>
  )
}

export default function Assistant() {
  const { reading } = useLiveReading()
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Namaste! I am your TasteMatrix AI specialist. Ask me anything about electrochemical sensors, pH/TDS/turbidity data correlation, or Ayurvedic dravya quality authentication.',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const send = async (text) => {
    const q = (text ?? input).trim()
    if (!q || loading) return

    setInput('')
    setMessages((prev) => [...prev, { role: 'user', text: q }])
    setLoading(true)

    try {
      const res = await sendChatMessage(
        [...messages, { role: 'user', content: q }],
        { latestReading: reading, selectedSample: reading?.sample }
      )
      const replyText = typeof res === 'string' ? res : (res?.reply || 'The assistant is unavailable right now. Please try again.')
      setMessages((prev) => [...prev, { role: 'assistant', text: replyText }])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: 'The assistant is unavailable right now. Please try again.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setMessages([
      {
        role: 'assistant',
        text: 'Session reset. Ready for new Ayurvedic electrochemical analysis inquiries.',
      },
    ])
  }

  return (
    <>
      {/* ── Top Header Toolbar ── */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[var(--tm-subtle-border)]">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--tm-subtle-bg)] border border-[var(--tm-subtle-border)] text-[12px]">
          <Sparkles size={13} color="var(--tm-lime)" />
          <span className="text-[var(--tm-text-muted)]">Active Context:</span>
          <span className="text-[var(--tm-text-primary)] font-medium">
            {reading?.sample ?? 'ESP32 Live Stream'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <RoundIconButton icon={Trash2} onClick={handleClear} label="Clear Chat Session" />
          <RoundIconButton icon={Download} label="Export Chat Transcript" />
        </div>
      </header>

      {/* ── Page Title ── */}
      <section>
        <h1 className="text-[36px] font-light text-[var(--tm-text-primary)] tracking-[-0.03em] leading-tight">
          AI Assistant
        </h1>
        <p className="text-[13px] text-[var(--tm-text-muted)] mt-0.5">
          Intelligent dravya authentication & sensor-fusion reasoning engine
        </p>
      </section>

      {/* ── Main Panel: Chat Console ── */}
      <PanelCard padding={24} className="flex-1 flex flex-col justify-between max-w-4xl mx-auto w-full" style={{ minHeight: '68vh' }}>
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--tm-subtle-border)]">
          <div className="flex items-center gap-2">
            <MessageSquare size={16} color="var(--tm-lime)" />
            <h2 className="text-[18px] font-semibold text-[var(--tm-text-primary)] tracking-tight">
              Clinical Dravya Consultation
            </h2>
          </div>
          <span className="text-[11px] font-mono text-[var(--tm-text-muted)]">TasteMatrix v2.4</span>
        </div>

        {/* Message Area */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-3 py-2 pr-1 max-h-[460px]">
          {messages.map((m, i) => (
            <ChatMessage key={i} msg={m} />
          ))}
          {loading && <TypingDots />}
          <div ref={bottomRef} />
        </div>

        {/* Quick Prompts Row */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-2 my-2 border-t border-[var(--tm-subtle-border)]">
          {QUICK_PROMPTS.map((p) => (
            <button
              key={p}
              onClick={() => send(p)}
              disabled={loading}
              className="px-3 py-1.5 rounded-full text-[11px] text-[var(--tm-text-muted)] hover:text-[var(--tm-text-primary)] bg-[var(--tm-subtle-bg)] hover:bg-[var(--tm-card-bg)] border border-[var(--tm-subtle-border)] whitespace-nowrap transition-colors"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            send()
          }}
          className="flex items-center gap-2 mt-1"
        >
          <div
            className="flex-1 flex items-center px-4 h-12 rounded-full"
            style={{
              background: 'var(--tm-card-bg)',
              border: '1px solid var(--tm-card-border)',
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about pH, TDS, turbidity, or rasa identification..."
              className="w-full bg-transparent text-[13px] text-[var(--tm-text-primary)] placeholder-[var(--tm-text-muted)] outline-none"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="w-12 h-12 rounded-full flex items-center justify-center transition-all disabled:opacity-40"
            style={{
              background: 'var(--tm-lime)',
              color: 'var(--tm-lime-text)',
              boxShadow: '0 0 16px var(--tm-lime-glow)',
            }}
            aria-label="Send message"
          >
            <Send size={15} />
          </button>
        </form>
      </PanelCard>
    </>
  )
}
