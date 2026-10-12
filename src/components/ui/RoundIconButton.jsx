// src/components/ui/RoundIconButton.jsx
// 40px circular action button with subtle border, soft frosted glass background,
// hover lift and glow, as seen in the CRM panel headers. Supports dark & light theme.

import { motion } from 'framer-motion'

export function RoundIconButton({
  icon: Icon,
  onClick,
  label,
  active = false,
  variant = 'default', // 'default' | 'lime' | 'danger'
  size = 40,
  className = '',
  disabled = false,
}) {
  const isLime = variant === 'lime' || active

  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.08, y: -2 }}
      whileTap={disabled ? {} : { scale: 0.94 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`relative flex items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-lime)] ${className}`}
      style={{
        width: size,
        height: size,
        background: isLime
          ? 'var(--tm-lime, #c6f432)'
          : 'var(--tm-subtle-bg, rgba(255, 255, 255, 0.06))',
        color: isLime
          ? 'var(--tm-lime-text, #000000)'
          : 'var(--tm-text-primary, #ffffff)',
        border: isLime
          ? '1px solid var(--tm-lime, #c6f432)'
          : '1px solid var(--tm-border-card, rgba(255, 255, 255, 0.12))',
        boxShadow: isLime
          ? '0 0 16px var(--tm-lime-glow, rgba(198, 244, 50, 0.35))'
          : '0 2px 8px rgba(0, 0, 0, 0.15)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
      }}
    >
      {Icon && <Icon size={size <= 32 ? 14 : 17} strokeWidth={isLime ? 2.4 : 1.8} />}
    </motion.button>
  )
}
export default RoundIconButton
