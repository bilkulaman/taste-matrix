// src/components/layout/Sidebar.jsx
// Shared floating icon capsule sidebar rendered ONCE inside AppLayout.
// Items: Dashboard, Analysis, History, Rasa Guide, Assistant, Settings, About, plus dark/light toggle.
// Stays mounted between routes. Mobile (<768px): bottom bar.

import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, FlaskConical, History, BookOpen,
  MessageCircle, Settings, Info, Leaf, Moon, Sun,
} from 'lucide-react'
import { useTheme } from '../../context/ThemeContext.jsx'

const NAV_PRIMARY = [
  { to: '/dashboard',  icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/analysis',   icon: FlaskConical,    label: 'Analysis'  },
  { to: '/history',    icon: History,          label: 'History'   },
  { to: '/rasa-guide', icon: BookOpen,         label: 'Rasa Guide'},
  { to: '/assistant',  icon: MessageCircle,    label: 'Assistant' },
]

const NAV_SECONDARY = [
  { to: '/settings',   icon: Settings,         label: 'Settings'  },
  { to: '/about',      icon: Info,             label: 'About'     },
]

function CapsuleItem({ to, icon: Icon, label }) {
  const [hovered, setHovered] = useState(false)

  return (
    <NavLink
      to={to}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      className={({ isActive }) =>
        `relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-lime)] ${
          isActive
            ? 'bg-[var(--tm-lime)] text-[var(--tm-lime-text)] shadow-[0_0_16px_var(--tm-lime-glow)] scale-105 font-bold'
            : 'text-[var(--tm-text-muted)] hover:text-[var(--tm-text-primary)] hover:bg-[var(--tm-subtle-bg)]'
        }`
      }
      aria-label={label}
    >
      {({ isActive }) => (
        <>
          <Icon size={18} strokeWidth={isActive ? 2.4 : 1.8} />
          <AnimatePresence>
            {hovered && (
              <motion.div
                initial={{ opacity: 0, x: -6, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -4, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute left-14 z-50 px-3 py-1.5 rounded-xl text-[12px] font-medium pointer-events-none whitespace-nowrap shadow-2xl"
                style={{
                  background: 'var(--tm-tooltip-bg, rgba(15, 15, 20, 0.96))',
                  border: '1px solid var(--tm-border-card)',
                  color: 'var(--tm-text-primary)',
                  backdropFilter: 'blur(16px)',
                }}
              >
                {label}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </NavLink>
  )
}

export function Sidebar() {
  const { theme, setTheme, toggleTheme } = useTheme()

  return (
    <>
      {/* ── Desktop Floating Vertical Capsule (56px, radius 28px) ── */}
      <aside
        className="hidden md:flex flex-col items-center fixed left-4 top-4 bottom-4 z-40 py-4 px-2 gap-2"
        style={{
          width: 56,
          borderRadius: 28,
          background: 'var(--tm-rail-bg)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid var(--tm-rail-border)',
          boxShadow: 'var(--tm-rail-shadow)',
        }}
        aria-label="Main sidebar navigation"
      >
        {/* Brand Leaf logo */}
        <NavLink
          to="/"
          className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-[var(--tm-subtle-bg)] transition-colors mb-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-lime)]"
          aria-label="TasteMatrix Home"
          title="TasteMatrix"
        >
          <Leaf size={20} color="var(--tm-lime)" strokeWidth={2.4} />
        </NavLink>

        {/* Primary nav group */}
        <div className="flex flex-col items-center gap-2 flex-1">
          {NAV_PRIMARY.map((item) => (
            <CapsuleItem key={item.to} {...item} />
          ))}
        </div>

        {/* Secondary nav group */}
        <div className="flex flex-col items-center gap-2">
          {NAV_SECONDARY.map((item) => (
            <CapsuleItem key={item.to} {...item} />
          ))}

          {/* Theme toggles (Moon / Sun) at bottom */}
          <div
            className="flex flex-col items-center gap-1.5 p-1 rounded-full mt-1"
            style={{
              background: 'var(--tm-subtle-bg)',
              border: '1px solid var(--tm-subtle-border)',
            }}
          >
            <button
              onClick={() => setTheme('dark')}
              title="Dark theme"
              aria-label="Enable dark theme"
              className={`flex items-center justify-center w-8 h-8 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-lime)] ${
                theme === 'dark'
                  ? 'bg-[var(--tm-panel-border)] text-white shadow-sm'
                  : 'text-[var(--tm-text-muted)] hover:text-[var(--tm-text-primary)]'
              }`}
            >
              <Moon size={14} />
            </button>
            <button
              onClick={() => setTheme('light')}
              title="Light theme"
              aria-label="Enable light theme"
              className={`flex items-center justify-center w-8 h-8 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-lime)] ${
                theme === 'light'
                  ? 'bg-[var(--tm-lime)] text-[var(--tm-lime-text)] font-bold shadow-sm'
                  : 'text-[var(--tm-text-muted)] hover:text-[var(--tm-text-primary)]'
              }`}
            >
              <Sun size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Mobile Bottom Navigation Bar (<768px) ── */}
      <nav
        className="md:hidden fixed bottom-3 left-4 right-4 z-40 flex items-center justify-around px-2 py-1.5 shadow-2xl"
        style={{
          borderRadius: 24,
          background: 'var(--tm-rail-bg)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid var(--tm-rail-border)',
          height: 56,
        }}
        aria-label="Mobile navigation bar"
      >
        {[...NAV_PRIMARY, ...NAV_SECONDARY].map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-9 h-9 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-lime)] ${
                isActive
                  ? 'bg-[var(--tm-lime)] text-[var(--tm-lime-text)] shadow-[0_0_12px_var(--tm-lime-glow)] font-bold'
                  : 'text-[var(--tm-text-muted)]'
              }`
            }
            aria-label={label}
          >
            <Icon size={17} strokeWidth={1.8} />
          </NavLink>
        ))}
        {/* Mobile quick theme toggle */}
        <button
          onClick={toggleTheme}
          className="flex flex-col items-center justify-center w-9 h-9 rounded-full text-[var(--tm-text-muted)] hover:text-[var(--tm-text-primary)] transition-colors"
          aria-label="Toggle theme"
          title="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>
      </nav>
    </>
  )
}
export default Sidebar
