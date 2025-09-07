// React 19 Entry Point with createRoot

import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './styles/globals.css'

// React 19 createRoot with enhanced error handling
const container = document.getElementById('root')

if (!container) {
  throw new Error('Root element not found. Make sure you have a div with id="root" in your HTML.')
}

const root = createRoot(container)

// Render app with React 19 StrictMode for development
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

// Performance monitoring for initial load
if (import.meta.env.VITE_PERFORMANCE_MONITORING === 'true') {
  // Mark initial load complete
  performance.mark('app-load-complete')
  
  // Log performance metrics after app is loaded
  setTimeout(() => {
    const perfEntries = performance.getEntriesByType('measure')
    console.group('📊 Performance Metrics')
    perfEntries.forEach(entry => {
      console.log(`${entry.name}: ${entry.duration.toFixed(2)}ms`)
    })
    console.groupEnd()
  }, 1000)
}

// Enable HMR in development
if (import.meta.hot) {
  import.meta.hot.accept('./App.tsx', (newModule) => {
    if (newModule) {
      const NewApp = newModule.default
      root.render(
        <React.StrictMode>
          <NewApp />
        </React.StrictMode>
      )
    }
  })
}