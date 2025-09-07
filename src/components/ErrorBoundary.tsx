// React 19 Enhanced Error Boundary with shadcn/ui Alert

import React from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw } from 'lucide-react'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{
    error: Error | null
    resetError: () => void
  }>
}

export class TodoErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error, errorInfo: null }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('TodoApp Error Boundary caught an error:', error, errorInfo)
    this.setState({ errorInfo })
    
    // Report error to monitoring service in production
    if (import.meta.env.PROD) {
      // ErrorReportingService.reportError(error, errorInfo)
      console.error('Production error:', { error, errorInfo })
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback component if provided
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return (
          <FallbackComponent 
            error={this.state.error} 
            resetError={this.resetError} 
          />
        )
      }

      // Default error UI with shadcn/ui components
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <div className="w-full max-w-md">
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Application Error</AlertTitle>
              <AlertDescription className="mt-2 space-y-4">
                <p>
                  Sorry, something went wrong. Please try refreshing the page or 
                  contact support if the problem persists.
                </p>
                
                {import.meta.env.DEV && this.state.error && (
                  <details className="text-xs text-muted-foreground bg-muted p-2 rounded">
                    <summary className="cursor-pointer">Error Details</summary>
                    <pre className="mt-2 whitespace-pre-wrap overflow-auto max-h-32">
                      {this.state.error.toString()}
                      {this.state.errorInfo?.componentStack && (
                        <>
                          {'\n\nComponent Stack:'}
                          {this.state.errorInfo.componentStack}
                        </>
                      )}
                    </pre>
                  </details>
                )}
              </AlertDescription>
            </Alert>
            
            <div className="flex gap-2">
              <Button 
                onClick={this.resetError}
                className="flex-1"
                variant="default"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="flex-1"
              >
                Reload Page
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Functional wrapper for easier use with React 19
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType<{
    error: Error | null
    resetError: () => void
  }>
) => {
  const WrappedComponent = (props: P) => (
    <TodoErrorBoundary fallback={fallback}>
      <Component {...props} />
    </TodoErrorBoundary>
  )
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  return WrappedComponent
}