// components/ScrollIndicator.jsx
// Floating animated scroll-down prompt at the bottom of the hero section.

import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

export default function ScrollIndicator({ scrollY = 0, onScrollDown }) {
  // Hide as user starts scrolling down
  const opacity = Math.max(0, 1 - scrollY / 90)

  if (opacity <= 0.01) return null

  return (
    <motion.button
      onClick={onScrollDown}
      style={{ opacity }}
      className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1.5 cursor-pointer group bg-transparent border-none outline-none select-none transition-transform duration-200 hover:scale-105 focus-visible:ring-1 focus-visible:ring-[#c6f432]"
      aria-label="Scroll down to explore"
    >
      <span className="text-[10px] tracking-[0.2em] uppercase font-semibold text-[#8a8a93] group-hover:text-white transition-colors">
        Scroll
      </span>

      {/* Pill mouse container */}
      <div
        className="w-5 h-8 rounded-full flex items-start justify-center p-1"
        style={{
          border: '1px solid rgba(255, 255, 255, 0.18)',
          background: 'rgba(255, 255, 255, 0.02)',
          backdropFilter: 'blur(4px)',
        }}
      >
        <motion.div
          className="w-1 h-2 rounded-full"
          style={{
            background: '#c6f432',
            boxShadow: '0 0 6px #c6f432',
          }}
          animate={{
            y: [0, 12, 0],
            opacity: [0.9, 0.3, 0.9],
          }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      <ChevronDown
        size={12}
        className="text-[#8a8a93] group-hover:text-[#c6f432] transition-colors -mt-0.5 animate-pulse"
      />
    </motion.button>
  )
}
