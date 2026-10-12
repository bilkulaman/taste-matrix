// src/components/ui/Skeleton.jsx
export function Skeleton({
  className = '',
  style = {},
  variant = 'rect', // 'rect' | 'circle' | 'text'
  ...props
}) {
  const getRadius = () => {
    if (variant === 'circle') return 'rounded-full'
    if (variant === 'text') return 'rounded-sm'
    return 'rounded-xl'
  }

  return (
    <div
      className={`animate-pulse ${getRadius()} ${className}`}
      style={{
        background: 'rgba(255, 255, 255, 0.06)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        ...style,
      }}
      {...props}
    />
  )
}
