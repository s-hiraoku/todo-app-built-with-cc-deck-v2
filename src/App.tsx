// React 19 Main App Component with Error Boundary and Toast Provider

import React from 'react'
import { TodoApp } from '@/components/todo/TodoApp'
import { TodoErrorBoundary } from '@/components/ErrorBoundary'
import { Toaster } from '@/components/ui/toaster'
import { performanceMonitor } from '@/lib/utils'

function App() {
  // Initialize performance monitoring
  React.useEffect(() => {
    if (import.meta.env.VITE_PERFORMANCE_MONITORING === 'true') {
      performanceMonitor.measureHMR()
      performanceMonitor.measureCoreWebVitals()
    }
  }, [])

  return (
    <TodoErrorBoundary>
      <div className="app">
        <TodoApp />
        <Toaster />
      </div>
    </TodoErrorBoundary>
  )
}

export default App