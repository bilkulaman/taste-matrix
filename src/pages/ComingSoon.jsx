// pages/ComingSoon.jsx
// Placeholder for routes not yet implemented.

import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Zap } from 'lucide-react'

export default function ComingSoon() {
  return (
    <div className="min-h-screen bg-black font-sans flex flex-col items-center justify-center px-5 text-center">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center gap-6 max-w-sm"
      >
        <div className="flex items-center gap-2 mb-2">
          <Zap size={16} fill="#c6f432" color="#c6f432" />
          <span className="text-white text-[14px] font-semibold tracking-tight">TasteMatrix</span>
        </div>
        <div
          className="inline-flex items-center px-3 h-6 rounded-full text-[11px] font-medium tracking-widest uppercase"
          style={{ border: '1px solid rgba(255,255,255,0.12)', color: '#8a8a93' }}
        >
          [ Coming soon ]
        </div>
        <h1
          className="text-white font-bold tracking-tight leading-tight"
          style={{ fontSize: 'clamp(28px, 5vw, 42px)' }}
        >
          This page is being<br />built for Stage 2.
        </h1>
        <p className="text-[#8a8a93] text-[13px] leading-relaxed">
          Each section of TasteMatrix is added one stage at a time without redesigning what already works.
        </p>
        <Link
          to="/"
          className="flex items-center gap-2 h-9 px-4 rounded-full text-[13px] font-medium text-[#8a8a93] hover:text-white transition-colors"
          style={{ border: '1px solid rgba(255,255,255,0.12)' }}
        >
          <ArrowLeft size={13} />
          Back to Landing
        </Link>
      </motion.div>
    </div>
  )
}
