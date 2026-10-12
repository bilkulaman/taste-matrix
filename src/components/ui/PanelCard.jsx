// src/components/ui/PanelCard.jsx
// Large frosted glass panel (radius 32px, backdrop-blur-xl, border, inner highlight, shadow)
// and lighter nested pill card (radius 22px). Uses CSS variables for light/dark theme support.

import { motion } from 'framer-motion'

export function PanelCard({
  children,
  className = '',
  style = {},
  padding = 28,
  animate = false,
  delay = 0,
}) {
  const Comp = animate ? motion.div : 'div'
  const motionProps = animate
    ? {
        initial: { opacity: 0, y: 16 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] },
      }
    : {}

  return (
    <Comp
      {...motionProps}
      className={`relative ${className}`}
      style={{
        borderRadius: 32,
        background: 'var(--tm-panel-bg, rgba(255,255,255,0.05))',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid var(--tm-panel-border, rgba(255,255,255,0.10))',
        boxShadow: 'var(--tm-panel-shadow, 0 4px 40px rgba(0,0,0,0.45))',
        padding,
        ...style,
      }}
    >
      {children}
    </Comp>
  )
}

// Nested pill card — lighter surface inside a PanelCard
export function PillCard({
  children,
  className = '',
  style = {},
  onClick,
  role,
  tabIndex,
  'aria-label': ariaLabel,
}) {
  return (
    <div
      className={`${className} ${onClick ? 'cursor-pointer transition-all hover:scale-[1.01]' : ''}`}
      style={{
        borderRadius: 22,
        background: 'var(--tm-card-bg, rgba(255,255,255,0.07))',
        border: '1px solid var(--tm-card-border, rgba(255,255,255,0.09))',
        boxShadow: 'var(--tm-card-shadow, 0 2px 12px rgba(0,0,0,0.2))',
        ...style,
      }}
      onClick={onClick}
      role={role}
      tabIndex={tabIndex}
      aria-label={ariaLabel}
    >
      {children}
    </div>
  )
}
