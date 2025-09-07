// Error Handler Hook with React 19 Error Boundary & shadcn/ui Toast Integration

import { useState, useCallback } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { TodoAppError, StorageError } from '@/types'
import { Button } from '@/components/ui/button'

export interface UseErrorHandlerReturn {
  error: TodoAppError | null
  handleError: (error: unknown) => void
  clearError: () => void
  showSuccess: (message: string) => void
  showInfo: (message: string) => void
}

export function useErrorHandler(): UseErrorHandlerReturn {
  const { toast } = useToast()
  const [error, setError] = useState<TodoAppError | null>(null)

  const handleError = useCallback((error: unknown) => {
    let todoError: TodoAppError

    if (error instanceof TodoAppError) {
      todoError = error
    } else if (error instanceof StorageError) {
      todoError = error
    } else if (error instanceof Error) {
      todoError = new TodoAppError(
        error.message || 'An unexpected error occurred',
        'UNKNOWN_ERROR',
        true
      )
    } else {
      todoError = new TodoAppError(
        'An unknown error occurred',
        'UNKNOWN_ERROR',
        true
      )
    }

    setError(todoError)

    // Show toast notification
    toast({
      variant: todoError.toastVariant,
      title: getErrorTitle(todoError.code),
      description: todoError.message,
      action: todoError.recoverable ? (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => clearError()}
        >
          Try Again
        </Button>
      ) : undefined
    })

    // Log error for debugging
    console.error('Application error:', {
      code: todoError.code,
      message: todoError.message,
      recoverable: todoError.recoverable,
      originalError: error
    })
  }, [toast])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const showSuccess = useCallback((message: string) => {
    toast({
      title: "Success",
      description: message,
      variant: "default"
    })
  }, [toast])

  const showInfo = useCallback((message: string) => {
    toast({
      title: "Info",
      description: message,
      variant: "default"
    })
  }, [toast])

  return {
    error,
    handleError,
    clearError,
    showSuccess,
    showInfo
  }
}

// Helper function to get user-friendly error titles
function getErrorTitle(code: string): string {
  switch (code) {
    case 'STORAGE_ERROR':
      return 'Storage Error'
    case 'VALIDATION_ERROR':
      return 'Validation Error'
    case 'NETWORK_ERROR':
      return 'Network Error'
    case 'UNKNOWN_ERROR':
      return 'Unexpected Error'
    default:
      return 'Error'
  }
}

// Custom error hook for specific error types
export function useStorageErrorHandler() {
  const { handleError, ...rest } = useErrorHandler()

  const handleStorageError = useCallback((error: unknown) => {
    if (error instanceof Error) {
      const storageError = new StorageError(
        error.message || 'Failed to access local storage'
      )
      handleError(storageError)
    } else {
      handleError(new StorageError('Unknown storage error'))
    }
  }, [handleError])

  return {
    ...rest,
    handleError: handleStorageError
  }
}