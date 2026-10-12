// components/ScrollProgressBar.jsx
// Ultra-thin glowing progress bar at viewport top tracking page scroll.

import { motion, useScroll, useSpring } from 'framer-motion'

export default function ScrollProgressBar() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  })

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[2px] z-[100] origin-left pointer-events-none"
      style={{
        scaleX,
        background: 'linear-gradient(90deg, #7c3aed 0%, #c6f432 100%)',
        boxShadow: '0 0 10px rgba(198, 244, 50, 0.6), 0 0 20px rgba(124, 58, 237, 0.4)',
      }}
    />
  )
}
