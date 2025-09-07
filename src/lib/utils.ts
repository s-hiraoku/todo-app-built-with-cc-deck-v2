import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// shadcn/ui utility function
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Generate unique IDs
export function generateId(): string {
  return crypto.randomUUID()
}

// Performance monitoring utilities
export const performanceMonitor = {
  // React 19 Actions performance
  measureActionPerformance: (actionName: string) => {
    if (typeof performance === 'undefined') return { end: () => {}, promise: Promise.resolve() }
    
    // ECMAScript 2024 Promise.withResolvers
    const { promise, resolve } = Promise.withResolvers<void>()
    performance.mark(`${actionName}-start`)
    
    return {
      end: () => {
        performance.mark(`${actionName}-end`)
        performance.measure(actionName, `${actionName}-start`, `${actionName}-end`)
        resolve()
      },
      promise
    }
  },
  
  // Vite 7.0+ HMR performance
  measureHMR: () => {
    if (import.meta.hot && typeof performance !== 'undefined') {
      import.meta.hot.on('vite:beforeUpdate', () => {
        performance.mark('hmr-start')
      })
      
      import.meta.hot.on('vite:afterUpdate', () => {
        performance.mark('hmr-end')
        performance.measure('hmr-update', 'hmr-start', 'hmr-end')
      })
    }
  },
  
  // Core Web Vitals with React 19
  measureCoreWebVitals: () => {
    if (typeof PerformanceObserver === 'undefined') return
    
    // INP (Interaction to Next Paint) - React 19新指標
    try {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          console.log('INP:', entry.processingStart - entry.startTime)
        }
      }).observe({ entryTypes: ['event'] })
    } catch (error) {
      // Silently fail in unsupported browsers
      console.debug('Performance observer not supported:', error)
    }
  }
}

// Accessibility helpers
export const accessibility = {
  // WCAG 2.1 touch target size
  touchTargetSize: "min-h-[44px] min-w-[44px]",
  
  // ARIA label generators
  generateAriaLabel: (action: string, item: string) => `${action} "${item}"`,
  
  // Focus management
  focusElement: (element: HTMLElement | null) => {
    if (element) {
      element.focus()
    }
  },
  
  // Screen reader announcements
  announce: (message: string) => {
    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', 'polite')
    announcement.setAttribute('aria-atomic', 'true')
    announcement.style.position = 'absolute'
    announcement.style.left = '-10000px'
    announcement.style.width = '1px'
    announcement.style.height = '1px'
    announcement.style.overflow = 'hidden'
    announcement.textContent = message
    
    document.body.appendChild(announcement)
    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 1000)
  }
}

// Date formatting utilities
export const dateUtils = {
  formatCreatedAt: (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'short',
      timeStyle: 'short'
    }).format(date)
  },
  
  formatRelativeTime: (date: Date): string => {
    const rtf = new Intl.RelativeTimeFormat('en-US', { numeric: 'auto' })
    const diffInSeconds = (Date.now() - date.getTime()) / 1000
    
    if (diffInSeconds < 60) return rtf.format(-Math.round(diffInSeconds), 'second')
    if (diffInSeconds < 3600) return rtf.format(-Math.round(diffInSeconds / 60), 'minute')
    if (diffInSeconds < 86400) return rtf.format(-Math.round(diffInSeconds / 3600), 'hour')
    return rtf.format(-Math.round(diffInSeconds / 86400), 'day')
  }
}

// Validation utilities
export const validation = {
  isValidTodoText: (text: string): boolean => {
    return text.trim().length > 0 && text.trim().length <= 500
  },
  
  sanitizeTodoText: (text: string): string => {
    return text.trim().slice(0, 500)
  }
}