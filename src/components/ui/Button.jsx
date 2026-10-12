// src/components/ui/Button.jsx
import { forwardRef } from 'react'
import { Link } from 'react-router-dom'

export const Button = forwardRef(function Button(
  {
    children,
    variant = 'primary', // 'primary' (lime) | 'secondary' (frosted) | 'white'
    to,
    href,
    icon: Icon,
    iconRight: IconRight,
    className = '',
    style = {},
    ...props
  },
  ref
) {
  const getStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          background: '#c6f432',
          color: '#000000',
          boxShadow: '0 0 24px rgba(198, 244, 50, 0.35)',
          border: 'none',
        }
      case 'white':
        return {
          background: '#ffffff',
          color: '#000000',
          border: 'none',
        }
      case 'secondary':
      default:
        return {
          background: 'rgba(255, 255, 255, 0.08)',
          color: '#ffffff',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }
    }
  }

  const baseClasses = `inline-flex items-center justify-center gap-2 h-10 px-6 rounded-full text-[13px] font-semibold transition-transform duration-150 active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c6f432] cursor-pointer select-none leading-none ${className}`

  const content = (
    <>
      {Icon && <Icon size={14} className="shrink-0" />}
      <span>{children}</span>
      {IconRight && <IconRight size={14} className="shrink-0" />}
    </>
  )

  if (to) {
    return (
      <Link ref={ref} to={to} className={baseClasses} style={{ ...getStyles(), ...style }} {...props}>
        {content}
      </Link>
    )
  }

  if (href) {
    return (
      <a ref={ref} href={href} className={baseClasses} style={{ ...getStyles(), ...style }} {...props}>
        {content}
      </a>
    )
  }

  return (
    <button ref={ref} className={baseClasses} style={{ ...getStyles(), ...style }} {...props}>
      {content}
    </button>
  )
})
