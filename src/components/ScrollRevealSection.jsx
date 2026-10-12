// components/ScrollRevealSection.jsx
// Standardised scroll-reveal wrapper conforming to design specification:
// opacity 0 -> 1, y 24 -> 0, 0.7s, cubic-bezier(0.22, 1, 0.36, 1)

import { motion } from 'framer-motion'
import { useScrollReveal } from '../hooks/useScrollReveal.js'

export default function ScrollRevealSection({
  children,
  className = '',
  delay = 0,
  threshold = 0.12,
  style = {},
}) {
  const { ref, inView } = useScrollReveal(threshold)

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{
        duration: 0.7,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  )
}
