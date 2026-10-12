// App.jsx – router + layout + page transitions
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'

import Landing    from './pages/Landing.jsx'
import Dashboard  from './pages/Dashboard.jsx'
import Analysis   from './pages/Analysis.jsx'
import History    from './pages/History.jsx'
import RasaGuide  from './pages/RasaGuide.jsx'
import Assistant  from './pages/Assistant.jsx'
import Settings   from './pages/Settings.jsx'
import About      from './pages/About.jsx'
import AppLayout  from './components/layout/AppLayout.jsx'

import { Component } from 'react'

class ErrorBoundary extends Component {
  state = { hasError: false, error: null }
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div
          className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center rounded-3xl"
          style={{ background: 'var(--tm-panel-bg)', border: '1px solid var(--tm-border-card)' }}
        >
          <h2 className="text-xl font-semibold text-[var(--tm-text-primary)] mb-2">Render Anomaly Detected</h2>
          <p className="text-sm text-[var(--tm-text-muted)] max-w-md mb-4 font-mono">{this.state.error?.message}</p>
          <button
            onClick={() => { this.setState({ hasError: false }); window.location.reload() }}
            className="px-5 py-2 rounded-full font-medium text-black bg-[var(--tm-lime)] transition-transform hover:scale-105"
          >
            Reload
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

function PageWrapper({ children }) {
  return (
    <ErrorBoundary>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col gap-5 w-full"
      >
        {children}
      </motion.div>
    </ErrorBoundary>
  )
}

export default function App() {
  const location = useLocation()
  const isLanding = location.pathname === '/'

  // Landing page stays dark, untouched, no sidebar
  if (isLanding) {
    return (
      <AnimatePresence mode="wait">
        <Routes location={location} key="landing-route">
          <Route path="/" element={<Landing />} />
        </Routes>
      </AnimatePresence>
    )
  }

  // All inner pages share AppLayout; Sidebar stays mounted between routes
  return (
    <AppLayout>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/dashboard"  element={<PageWrapper><Dashboard /></PageWrapper>} />
          <Route path="/analysis"   element={<PageWrapper><Analysis  /></PageWrapper>} />
          <Route path="/history"    element={<PageWrapper><History   /></PageWrapper>} />
          <Route path="/rasa-guide" element={<PageWrapper><RasaGuide /></PageWrapper>} />
          <Route path="/assistant"  element={<PageWrapper><Assistant /></PageWrapper>} />
          <Route path="/settings"   element={<PageWrapper><Settings  /></PageWrapper>} />
          <Route path="/about"      element={<PageWrapper><About     /></PageWrapper>} />
          <Route path="*"           element={<PageWrapper><Dashboard /></PageWrapper>} />
        </Routes>
      </AnimatePresence>
    </AppLayout>
  )
}
