// src/components/ui/PageHeader.jsx
export function PageHeader({
  badge,
  title,
  description,
  actions,
  className = '',
}) {
  return (
    <div className={`flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 ${className}`}>
      <div className="flex flex-col gap-2">
        {badge && (
          <div>
            <span className="inline-block text-[10px] font-mono font-medium tracking-[0.25em] text-[#c6f432] px-2.5 py-0.5 rounded-full bg-[#c6f432]/10 border border-[#c6f432]/25 uppercase">
              {badge}
            </span>
          </div>
        )}
        <h1 className="text-white font-semibold text-[26px] md:text-[32px] tracking-tight leading-tight">
          {title}
        </h1>
        {description && (
          <p className="text-[#8a8a93] text-[14px] leading-relaxed max-w-2xl">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-3 shrink-0">
          {actions}
        </div>
      )}
    </div>
  )
}
