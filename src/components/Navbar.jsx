// components/Navbar.jsx
// Sticky navbar with items aligned on one baseline (same height h-10, 40px).
// "Get Started" pill height 40px, vertically centered with links.

import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Menu, X } from 'lucide-react'

const NAV_LEFT = [
  { label: 'Dashboard',  to: '/dashboard' },
  { label: 'Analysis',   to: '/analysis' },
  { label: 'History',    to: '/history' },
  { label: 'Rasa Guide', to: '/rasa-guide' },
]

const NAV_RIGHT = [
  { label: 'Assistant', to: '/assistant' },
  { label: 'Settings',  to: '/settings' },
  { label: 'About',     to: '/about' },
]

export default function Navbar({ scrolled }) {
  const [open, setOpen] = useState(false)

  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 1.8 }}
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled
          ? 'rgba(0,0,0,0.72)'
          : 'transparent',
        backdropFilter: scrolled ? 'blur(18px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(18px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
      }}
    >
      <div className="max-w-7xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between">
        {/* Left nav – all items h-10, flex items-center */}
        <nav className="hidden md:flex items-center gap-6 h-10">
          {NAV_LEFT.map(({ label, to }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `h-10 flex items-center text-[13px] font-medium leading-none transition-colors duration-200 ${
                  isActive ? 'text-white' : 'text-[#8a8a93] hover:text-white'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Centre logo – h-10, flex items-center */}
        <Link
          to="/"
          className="flex items-center gap-2 h-10 absolute left-1/2 -translate-x-1/2 leading-none"
          aria-label="TasteMatrix home"
        >
          <span
            className="w-5 h-5 flex items-center justify-center rounded-sm"
            style={{ color: '#c6f432' }}
          >
            <Zap size={14} fill="#c6f432" />
          </span>
          <span className="text-white text-[14px] font-semibold tracking-tight">
            TasteMatrix
          </span>
        </Link>

        {/* Right nav + CTA – all items h-10, flex items-center */}
        <div className="hidden md:flex items-center gap-6 h-10">
          {NAV_RIGHT.map(({ label, to }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `h-10 flex items-center text-[13px] font-medium leading-none transition-colors duration-200 ${
                  isActive ? 'text-white' : 'text-[#8a8a93] hover:text-white'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
          <Link
            to="/dashboard"
            className="h-[40px] px-5 rounded-full inline-flex items-center justify-center text-[13px] font-medium text-black leading-none transition-transform duration-150 active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c6f432]"
            style={{ background: '#fff' }}
          >
            Get Started
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden text-[#8a8a93] hover:text-white transition-colors h-10 flex items-center justify-center"
          onClick={() => setOpen(v => !v)}
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden"
            style={{ background: 'rgba(0,0,0,0.95)', borderTop: '1px solid rgba(255,255,255,0.07)' }}
          >
            <nav className="flex flex-col px-5 py-4 gap-3">
              {[...NAV_LEFT, ...NAV_RIGHT].map(({ label, to }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `text-[14px] font-medium py-1 transition-colors ${
                      isActive ? 'text-white' : 'text-[#8a8a93]'
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
              <Link
                to="/dashboard"
                onClick={() => setOpen(false)}
                className="mt-2 h-[40px] px-5 rounded-full inline-flex items-center justify-center text-[13px] font-medium text-black"
                style={{ background: '#fff' }}
              >
                Get Started
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
