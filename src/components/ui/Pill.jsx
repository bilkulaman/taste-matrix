// src/components/ui/Pill.jsx
export function Pill({
  children,
  active = false,
  variant = 'default', // 'default' | 'lime' | 'muted'
  icon: Icon,
  className = '',
  onClick,
  ...props
}) {
  const isInteractive = typeof onClick === 'function'

  // Variant styling matching TagPills & SampleBadge
  const getStyles = () => {
    if (active || variant === 'lime') {
      return {
        background: 'rgba(198,244,50,0.15)',
        border: '1px solid rgba(198,244,50,0.40)',
        color: '#c6f432',
      }
    }
    if (variant === 'muted') {
      return {
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        color: '#8a8a93',
      }
    }
    return {
      background: 'rgba(255,255,255,0.06)',
      border: '1px solid rgba(255,255,255,0.08)',
      color: '#8a8a93',
    }
  }

  return (
    <div
      role={isInteractive ? 'button' : 'status'}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 h-7 rounded-full text-[12px] font-medium transition-all duration-200 select-none ${
        isInteractive ? 'cursor-pointer hover:border-white/20 active:scale-[0.98]' : 'cursor-default'
      } ${className}`}
      style={getStyles()}
      {...props}
    >
      {Icon && <Icon size={11} className="shrink-0" />}
      <span>{children}</span>
    </div>
  )
}
