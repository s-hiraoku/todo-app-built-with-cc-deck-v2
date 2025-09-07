// Modern Local Storage Manager with ECMAScript 2024 Promise.withResolvers

import { Todo, StorageData, StorageError } from '@/types'
import { validateStorageData, sanitizeTodoForStorage, parseTodoFromStorage } from './validation'

export class TodoStorageManager {
  private static readonly TODOS_KEY = 'todos-v1'
  private static readonly VERSION = '1.0.0'
  
  // Save todos with ECMAScript 2024 Promise.withResolvers
  static async saveTodos(todos: Todo[]): Promise<void> {
    const { promise, resolve, reject } = Promise.withResolvers<void>()
    
    try {
      const sanitizedTodos = todos.map(sanitizeTodoForStorage)
      const data: StorageData = {
        todos: sanitizedTodos,
        version: this.VERSION,
        lastUpdated: new Date().toISOString()
      }
      
      // Use requestIdleCallback if available for better performance
      const saveToStorage = () => {
        try {
          localStorage.setItem(this.TODOS_KEY, JSON.stringify(data))
          resolve()
        } catch (error) {
          console.error('Failed to save todos to localStorage:', error)
          reject(new StorageError('ストレージへの保存に失敗しました'))
        }
      }
      
      if (typeof requestIdleCallback !== 'undefined') {
        requestIdleCallback(saveToStorage)
      } else {
        saveToStorage()
      }
    } catch (error) {
      reject(error instanceof StorageError ? error : new StorageError('予期しないエラーが発生しました'))
    }
    
    return promise
  }
  
  // Load todos with Promise.withResolvers
  static async loadTodos(): Promise<Todo[]> {
    const { promise, resolve } = Promise.withResolvers<Todo[]>()
    
    try {
      const stored = localStorage.getItem(this.TODOS_KEY)
      if (!stored) {
        resolve([])
        return promise
      }

      const parsed = JSON.parse(stored)
      if (!this.validateStoredData(parsed)) {
        console.warn('Invalid stored data format, resetting to empty array')
        // Clear invalid data
        localStorage.removeItem(this.TODOS_KEY)
        resolve([])
        return promise
      }

      const todos = parsed.todos.map(parseTodoFromStorage)
      resolve(todos)
    } catch (error) {
      console.error('Failed to load todos from localStorage:', error)
      // Don't throw, just return empty array for better UX
      resolve([])
    }
    
    return promise
  }
  
  // Check storage availability
  static isStorageAvailable(): boolean {
    try {
      const test = '__storage_test__'
      localStorage.setItem(test, test)
      localStorage.removeItem(test)
      return true
    } catch {
      return false
    }
  }
  
  // Get storage usage info
  static getStorageInfo(): { used: number; available: number; percentage: number } {
    try {
      const estimate = navigator.storage?.estimate?.()
      if (estimate) {
        estimate.then(({ usage = 0, quota = 0 }) => {
          return {
            used: usage,
            available: quota - usage,
            percentage: quota > 0 ? (usage / quota) * 100 : 0
          }
        })
      }
      
      // Fallback estimation
      const allItems = Object.keys(localStorage)
      const totalSize = allItems.reduce((size, key) => {
        const item = localStorage.getItem(key)
        return size + (item ? item.length : 0)
      }, 0)
      
      // Estimate 5MB typical quota
      const estimatedQuota = 5 * 1024 * 1024
      return {
        used: totalSize * 2, // UTF-16 encoding
        available: estimatedQuota - (totalSize * 2),
        percentage: (totalSize * 2 / estimatedQuota) * 100
      }
    } catch {
      return { used: 0, available: 0, percentage: 0 }
    }
  }
  
  // Clear all todos
  static async clearAllTodos(): Promise<void> {
    const { promise, resolve, reject } = Promise.withResolvers<void>()
    
    try {
      localStorage.removeItem(this.TODOS_KEY)
      resolve()
    } catch (error) {
      console.error('Failed to clear todos from localStorage:', error)
      reject(new StorageError('データのクリアに失敗しました'))
    }
    
    return promise
  }
  
  // Export todos as JSON
  static exportTodos(): string {
    try {
      const stored = localStorage.getItem(this.TODOS_KEY)
      if (!stored) return JSON.stringify({ todos: [], version: this.VERSION })
      
      const parsed = JSON.parse(stored)
      return JSON.stringify(parsed, null, 2)
    } catch (error) {
      console.error('Failed to export todos:', error)
      throw new StorageError('データのエクスポートに失敗しました')
    }
  }
  
  // Import todos from JSON
  static async importTodos(jsonData: string): Promise<Todo[]> {
    const { promise, resolve, reject } = Promise.withResolvers<Todo[]>()
    
    try {
      const data = JSON.parse(jsonData)
      
      if (!this.validateStoredData(data)) {
        reject(new StorageError('無効なデータ形式です'))
        return promise
      }
      
      await this.saveTodos(data.todos.map(parseTodoFromStorage))
      const todos = data.todos.map(parseTodoFromStorage)
      resolve(todos)
    } catch (error) {
      if (error instanceof StorageError) {
        reject(error)
      } else {
        console.error('Failed to import todos:', error)
        reject(new StorageError('データのインポートに失敗しました'))
      }
    }
    
    return promise
  }
  
  private static validateStoredData(data: any): data is StorageData {
    return validateStorageData(data)
  }
}

// Utility functions for storage operations
export const storageUtils = {
  // Check if running in browser
  isBrowser: (): boolean => typeof window !== 'undefined' && typeof localStorage !== 'undefined',
  
  // Get storage quota
  getQuota: async (): Promise<number> => {
    try {
      if (navigator.storage?.estimate) {
        const estimate = await navigator.storage.estimate()
        return estimate.quota || 0
      }
      return 5 * 1024 * 1024 // 5MB fallback
    } catch {
      return 5 * 1024 * 1024 // 5MB fallback
    }
  },
  
  // Monitor storage events
  onStorageChange: (callback: (e: StorageEvent) => void): (() => void) => {
    if (!storageUtils.isBrowser()) return () => {}
    
    window.addEventListener('storage', callback)
    return () => window.removeEventListener('storage', callback)
  }
}