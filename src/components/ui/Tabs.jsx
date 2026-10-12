// src/components/ui/Tabs.jsx
import { motion } from 'framer-motion'

export function Tabs({
  tabs = [], // [{ id, label, icon }]
  activeTab,
  onChange,
  className = '',
  layoutId = 'active-tab-indicator',
}) {
  return (
    <div
      className={`inline-flex items-center p-1 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-md ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab
        const Icon = tab.icon

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`relative flex items-center gap-1.5 px-4 h-8 rounded-full text-[13px] font-medium transition-colors duration-200 cursor-pointer select-none outline-none focus-visible:ring-1 focus-visible:ring-[#c6f432] ${
              isActive ? 'text-black font-semibold' : 'text-[#8a8a93] hover:text-white'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId={layoutId}
                className="absolute inset-0 rounded-full bg-[#c6f432]"
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                style={{ zIndex: 0 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5 leading-none">
              {Icon && <Icon size={12} className={isActive ? 'text-black' : 'text-[#8a8a93]'} />}
              <span>{tab.label}</span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
