// React 19 + ECMAScript 2024 Local Storage Hook with Promise.withResolvers

import { useState, useCallback, useEffect } from 'react'
import { TodoStorageManager, storageUtils } from '@/utils/storage'
import { StorageError } from '@/types'
import { UseLocalStorageReturn } from '@/types'

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): UseLocalStorageReturn<T> {
  const [data, setDataState] = useState<T>(() => {
    // Don't access localStorage during SSR
    if (!storageUtils.isBrowser()) return initialValue
    
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ECMAScript 2024 Promise.withResolvers for async operations
  const setData = useCallback(async (value: T | ((prev: T) => T)) => {
    if (!storageUtils.isBrowser()) return

    setLoading(true)
    setError(null)
    
    const { promise, resolve, reject } = Promise.withResolvers<void>()
    
    try {
      const valueToStore = value instanceof Function ? value(data) : value
      setDataState(valueToStore)
      
      // Use requestIdleCallback for better performance
      const saveToStorage = () => {
        try {
          window.localStorage.setItem(key, JSON.stringify(valueToStore))
          resolve()
        } catch (error) {
          const storageError = error instanceof Error
            ? new StorageError(`Failed to save ${key}: ${error.message}`)
            : new StorageError(`Failed to save ${key}`)
          setError(storageError.message)
          reject(storageError)
        }
      }
      
      if (typeof requestIdleCallback !== 'undefined') {
        requestIdleCallback(saveToStorage)
      } else {
        setTimeout(saveToStorage, 0)
      }
    } catch (error) {
      const storageError = error instanceof StorageError 
        ? error 
        : new StorageError('Unexpected error occurred')
      setError(storageError.message)
      reject(storageError)
    } finally {
      setLoading(false)
    }
    
    return promise
  }, [key, data])

  // Listen for storage changes from other tabs
  useEffect(() => {
    if (!storageUtils.isBrowser()) return

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          const newValue = JSON.parse(e.newValue)
          setDataState(newValue)
          setError(null)
        } catch (error) {
          console.error(`Error parsing storage event for key "${key}":`, error)
          setError('Failed to sync data from other tab')
        }
      }
    }

    const cleanup = storageUtils.onStorageChange(handleStorageChange)
    return cleanup
  }, [key])

  // Performance monitoring
  useEffect(() => {
    if (import.meta.env.VITE_PERFORMANCE_MONITORING === 'true') {
      const perfMark = `localStorage-${key}-access`
      performance.mark(perfMark)
      
      return () => {
        try {
          performance.measure(`localStorage-${key}-duration`, perfMark)
        } catch {
          // Ignore measurement errors
        }
      }
    }
  }, [key])

  return {
    data,
    setData,
    loading,
    error
  }
}