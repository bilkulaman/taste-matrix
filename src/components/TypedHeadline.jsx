// components/TypedHeadline.jsx
// Types a headline character by character at ~35ms/char with a blinking block cursor.
// Styled to specification:
// - font-weight: 300 (light)
// - letter-spacing: -0.03em
// - line-height: 1.02
// - font-size: clamp(44px, 5.6vw, 84px)
// - max-width: ~11ch so it wraps cleanly to 3 lines:
//   "Identify Dravya, / Authenticate Rasa, / Detect Adulteration."

import { useState, useEffect } from 'react'

const LINES = [
  'Identify Dravya,',
  'Authenticate Rasa,',
  'Detect Adulteration.',
]

export default function TypedHeadline({ onComplete }) {
  const [displayLines, setDisplayLines] = useState(['', '', ''])
  const [currentLine, setCurrentLine] = useState(0)
  const [finished, setFinished] = useState(false)

  useEffect(() => {
    const prefersReduced =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReduced) {
      setDisplayLines([...LINES])
      setCurrentLine(LINES.length)
      setFinished(true)
      onComplete?.()
      return
    }

    let lineIdx = 0
    let charIdx = 0
    let timer

    function typeNext() {
      if (lineIdx >= LINES.length) {
        setFinished(true)
        onComplete?.()
        return
      }
      const line = LINES[lineIdx]
      if (charIdx <= line.length) {
        setDisplayLines(prev => {
          const next = [...prev]
          next[lineIdx] = line.slice(0, charIdx)
          return next
        })
        setCurrentLine(lineIdx)
        charIdx++
        timer = setTimeout(typeNext, 35)
      } else {
        lineIdx++
        charIdx = 0
        timer = setTimeout(typeNext, 80)
      }
    }

    const startDelay = setTimeout(typeNext, 500)
    return () => { clearTimeout(startDelay); clearTimeout(timer) }
  }, [onComplete])

  return (
    <h1
      className="text-white text-left font-light"
      style={{
        fontSize: 'clamp(44px, 5.6vw, 84px)',
        fontWeight: 300,
        lineHeight: 1.02,
        letterSpacing: '-0.03em',
        maxWidth: '11ch',
      }}
      aria-label={LINES.join(' ')}
    >
      {displayLines.map((line, i) => (
        <span key={i} className="block whitespace-nowrap">
          {line}
          {!finished && i === currentLine && (
            <span
              className="inline-block w-[0.3em] h-[0.8em] bg-white ml-1 align-middle animate-pulse"
              style={{ fontWeight: 300 }}
              aria-hidden="true"
            />
          )}
        </span>
      ))}
    </h1>
  )
}
