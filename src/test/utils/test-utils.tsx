// Testing Utilities with shadcn/ui Provider Support

import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { ToastProvider } from '@/components/ui/toast'

// Custom render function with providers
const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ToastProvider>
      {children}
    </ToastProvider>
  )
}

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

// Re-export everything from @testing-library/react
export * from '@testing-library/react'

// Override render method
export { customRender as render }

// Mock data for tests
export const mockTodos = [
  {
    id: '1',
    text: 'Learn React 19',
    completed: false,
    createdAt: new Date('2025-01-01T10:00:00Z'),
    updatedAt: new Date('2025-01-01T10:00:00Z'),
  },
  {
    id: '2',
    text: 'Build TODO app',
    completed: true,
    createdAt: new Date('2025-01-01T11:00:00Z'),
    updatedAt: new Date('2025-01-01T11:30:00Z'),
  },
  {
    id: '3',
    text: 'Write tests',
    completed: false,
    createdAt: new Date('2025-01-01T12:00:00Z'),
    updatedAt: new Date('2025-01-01T12:00:00Z'),
  },
]

// Helper functions for testing
export const createMockFormData = (data: Record<string, string>) => {
  const formData = new FormData()
  Object.entries(data).forEach(([key, value]) => {
    formData.set(key, value)
  })
  return formData
}

export const waitForLoadingToFinish = () => {
  return new Promise((resolve) => setTimeout(resolve, 0))
}

// Mock localStorage for individual tests
export const createMockLocalStorage = (initialData: any = {}) => {
  const store: Record<string, string> = {}
  
  return {
    getItem: vi.fn((key: string) => {
      const value = initialData[key] || store[key] || null
      return value ? JSON.stringify(value) : null
    }),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach(key => delete store[key])
    }),
    length: 0,
    key: vi.fn(),
  }
}

// Helper to mock React 19 actions in tests
export const createMockAction = (mockFn = vi.fn()) => {
  const actionFn = async (formData: FormData) => {
    return mockFn(formData)
  }
  actionFn.mock = mockFn
  return actionFn
}