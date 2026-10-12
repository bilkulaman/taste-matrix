// src/components/ui/DataChip.jsx
export function DataChip({
  label,
  value,
  unit = '',
  icon: Icon,
  color = '#c6f432',
  className = '',
  style = {},
  ...props
}) {
  return (
    <div
      className={`inline-flex items-center gap-3 px-3.5 py-2 rounded-2xl select-none ${className}`}
      style={{
        background: 'rgba(10, 10, 15, 0.85)',
        border: '1px solid rgba(255, 255, 255, 0.14)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6), 0 0 16px rgba(124, 58, 237, 0.15)',
        ...style,
      }}
      {...props}
    >
      {Icon && (
        <div
          className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background: `${color}15`,
            border: `1px solid ${color}40`,
          }}
        >
          <Icon size={13} color={color} />
        </div>
      )}
      <div className="flex flex-col text-left">
        <span className="text-[9px] text-[#8a8a93] font-mono tracking-wider">
          {label}
        </span>
        <div className="flex items-baseline gap-1">
          <span className="text-[15px] font-semibold text-white tracking-tight leading-tight">
            {value}
          </span>
          {unit && <span className="text-[9px] text-[#8a8a93]">{unit}</span>}
        </div>
      </div>
    </div>
  )
}
