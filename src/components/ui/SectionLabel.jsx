// src/components/ui/SectionLabel.jsx
export function SectionLabel({ children, className = '', style = {}, ...props }) {
  return (
    <div
      className={`inline-flex items-center px-3 h-6 rounded-full text-[11px] font-medium tracking-widest uppercase font-mono select-none ${className}`}
      style={{
        border: '1px solid rgba(255, 255, 255, 0.12)',
        color: '#8a8a93',
        background: 'rgba(255, 255, 255, 0.02)',
        ...style,
      }}
      {...props}
    >
      [ {children} ]
    </div>
  )
}
