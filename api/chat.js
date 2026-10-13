// api/chat.js - Vercel serverless function for TasteMatrix AI Assistant via Groq

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    console.error('[TasteMatrix Chat] Missing GROQ_API_KEY environment variable.')
    return res.status(502).json({ error: 'Chat unavailable' })
  }

  try {
    const { messages = [], context = {} } = req.body || {}

    const systemPromptText =
      'You are TasteMatrix Assistant, an expert in Ayurveda (rasa, dravya) and the E-Tongue project (ESP32 with pH, TDS and turbidity sensors). Answer briefly and concretely. Use the provided latest reading and selected sample as context. If unsure, say so. No medical advice.\n\nContext:\n' +
      JSON.stringify(context, null, 2)

    // Normalize messages to [{role, content}], keeping only valid roles
    const normalizedMessages = Array.isArray(messages)
      ? messages
          .filter((m) => m && (m.content || m.text))
          .map((m) => ({
            role: m.role === 'user' ? 'user' : 'assistant',
            content: m.content || m.text || '',
          }))
      : []

    // Keep the last 10 messages
    const trimmedMessages = normalizedMessages.slice(-10)

    const modelName = process.env.GROQ_MODEL || 'openai/gpt-oss-120b'

    const payload = {
      model: modelName,
      temperature: 0.4,
      max_tokens: 500,
      messages: [
        { role: 'system', content: systemPromptText },
        ...trimmedMessages,
      ],
    }

    const upstreamRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    })

    if (!upstreamRes.ok) {
      const errBody = await upstreamRes.text()
      console.error(
        `[TasteMatrix Chat] Upstream error from Groq API (status ${upstreamRes.status}):`,
        errBody
      )
      return res.status(502).json({ error: 'Chat unavailable' })
    }

    const data = await upstreamRes.json()
    let reply = data.choices?.[0]?.message?.content
    if (!reply || typeof reply !== 'string' || !reply.trim()) {
      reply = 'The assistant could not generate a response. Please try rephrasing your question.'
    }

    return res.status(200).json({ reply })
  } catch (err) {
    console.error('[TasteMatrix Chat] Internal handler error:', err?.message || err)
    return res.status(502).json({ error: 'Chat unavailable' })
  }
}
