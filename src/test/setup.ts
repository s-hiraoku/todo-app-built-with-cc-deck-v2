// Vitest Test Setup with React 19 and shadcn/ui support

import '@testing-library/jest-dom'
import { expect, afterEach, vi, beforeAll, afterAll } from 'vitest'
import { cleanup } from '@testing-library/react'

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock localStorage for tests
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock requestIdleCallback for tests
global.requestIdleCallback = vi.fn((cb) => {
  setTimeout(cb, 0)
  return 1
})

global.cancelIdleCallback = vi.fn()

// Mock crypto.randomUUID for consistent test results
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: vi.fn(() => 'test-uuid-1234'),
  },
})

// Mock performance API for tests
Object.defineProperty(global, 'performance', {
  value: {
    mark: vi.fn(),
    measure: vi.fn(),
    getEntriesByType: vi.fn(() => []),
    now: vi.fn(() => Date.now()),
  },
})

// Mock PerformanceObserver
global.PerformanceObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock IntersectionObserver (for potential future use)
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock ResizeObserver (for potential future use)
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Setup console overrides for cleaner test output
beforeAll(() => {
  // Mock console.error to avoid noisy test output
  const originalError = console.error
  console.error = vi.fn((...args) => {
    // Still log actual errors but filter out React warnings we don't care about in tests
    if (
      typeof args[0] === 'string' && 
      !args[0].includes('Warning:') && 
      !args[0].includes('ReactDOM.render is no longer supported')
    ) {
      originalError(...args)
    }
  })

  // Mock console.warn
  const originalWarn = console.warn
  console.warn = vi.fn((...args) => {
    // Filter out known warnings
    if (
      typeof args[0] === 'string' && 
      !args[0].includes('Warning:')
    ) {
      originalWarn(...args)
    }
  })
})

afterAll(() => {
  vi.restoreAllMocks()
})

// Custom matchers for better test assertions
expect.extend({
  toBeValidTodo(received) {
    const pass = (
      received &&
      typeof received === 'object' &&
      typeof received.id === 'string' &&
      typeof received.text === 'string' &&
      typeof received.completed === 'boolean' &&
      received.createdAt instanceof Date &&
      received.updatedAt instanceof Date
    )

    if (pass) {
      return {
        message: () => `expected ${JSON.stringify(received)} not to be a valid todo`,
        pass: true,
      }
    } else {
      return {
        message: () => `expected ${JSON.stringify(received)} to be a valid todo`,
        pass: false,
      }
    }
  }
})

// Extend expect interface for TypeScript
declare module 'vitest' {
  interface Assertion<T = any> {
    toBeValidTodo(): T
  }
  interface AsymmetricMatchersContaining {
    toBeValidTodo(): any
  }
}