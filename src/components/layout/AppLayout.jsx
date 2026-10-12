// src/components/layout/AppLayout.jsx
// Shared layout for all inner pages (Dashboard, Analysis, History, Rasa Guide, Assistant, Settings, About).
// Contains the floating Sidebar (stays mounted between routes), ambient glow, grain texture,
// and consistent page container geometry.

import { Sidebar } from './Sidebar.jsx'

export function AppLayout({
  children,
  className = '',
  containerClassName = 'relative z-10 pl-4 md:pl-24 pr-4 md:pr-8 py-5 pb-24 md:pb-8 max-w-[1720px] mx-auto flex flex-col gap-5',
}) {
  return (
    <div
      className={`min-h-screen font-sans relative overflow-x-hidden ${className}`}
      style={{
        background: 'var(--tm-bg, #000000)',
        color: 'var(--tm-text-primary, #ffffff)',
      }}
    >
      {/* ── Ambient Glow (Reacts to dark/light theme tokens) ── */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: 'var(--tm-glow-purple-ambient)',
          opacity: 1,
        }}
        aria-hidden="true"
      />

      {/* ── Subtle Grain Overlay ── */}
      <div
        className="pointer-events-none fixed inset-0 z-0 mix-blend-overlay"
        style={{
          opacity: 'var(--tm-grain-opacity, 0.035)',
          backgroundImage:
            'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.6) 1px, transparent 1px)',
          backgroundSize: '4px 4px',
        }}
        aria-hidden="true"
      />

      {/* ── Shared Floating Icon Capsule Sidebar ── */}
      <Sidebar />

      {/* ── Main Page Content ── */}
      <main className={containerClassName}>
        {children}
      </main>
    </div>
  )
}
export default AppLayout
