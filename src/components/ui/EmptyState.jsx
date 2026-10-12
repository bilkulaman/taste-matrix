// src/components/ui/EmptyState.jsx
import { SectionLabel } from './SectionLabel.jsx'

export function EmptyState({
  icon: Icon,
  badge = 'No Data',
  title = 'No records found',
  description = 'Sensor streaming or filter criteria did not yield any results.',
  action,
  className = '',
}) {
  return (
    <div
      className={`rounded-2xl p-10 flex flex-col items-center justify-center text-center border border-dashed border-white/10 bg-white/[0.01] ${className}`}
    >
      {badge && <SectionLabel className="mb-4">{badge}</SectionLabel>}

      {Icon && (
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: 'rgba(124, 58, 237, 0.15)', border: '1px solid rgba(124, 58, 237, 0.3)' }}
        >
          <Icon size={20} className="text-[#c6f432]" />
        </div>
      )}

      <h3 className="text-white text-[17px] font-semibold tracking-tight mb-1.5">
        {title}
      </h3>

      <p className="text-[#8a8a93] text-[13px] leading-relaxed max-w-sm mb-6">
        {description}
      </p>

      {action && <div>{action}</div>}
    </div>
  )
}
