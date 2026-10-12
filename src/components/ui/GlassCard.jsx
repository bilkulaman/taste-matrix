// src/components/ui/GlassCard.jsx
import { forwardRef } from 'react'

export const GlassCard = forwardRef(function GlassCard(
  { children, className = '', hoverEffect = false, elevated = false, style = {}, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={`rounded-2xl transition-all duration-300 relative overflow-hidden ${
        hoverEffect ? 'hover:-translate-y-1 hover:border-white/20' : ''
      } ${className}`}
      style={{
        background: elevated ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  )
})
