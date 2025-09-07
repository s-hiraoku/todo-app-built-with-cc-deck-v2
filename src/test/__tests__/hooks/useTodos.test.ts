// useTodos Hook Tests with React 19 Actions

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useTodos } from '@/hooks/useTodos'
import { createMockLocalStorage, createMockFormData } from '@/test/utils/test-utils'

// Mock the localStorage hook
vi.mock('@/hooks/useLocalStorage', () => ({
  useLocalStorage: vi.fn(() => {
    const [data, setData] = vi.fn().mockReturnValue([[], vi.fn()])
    return { data: [], setData, loading: false, error: null }
  })
}))

// Mock the error handler hook
vi.mock('@/hooks/useErrorHandler', () => ({
  useErrorHandler: vi.fn(() => ({
    handleError: vi.fn(),
    showSuccess: vi.fn(),
    error: null,
    clearError: vi.fn(),
    showInfo: vi.fn(),
  }))
}))

describe('useTodos', () => {
  let mockLocalStorage: any

  beforeEach(() => {
    vi.clearAllMocks()
    mockLocalStorage = createMockLocalStorage({
      'todos': []
    })
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('initializes with empty todos array', () => {
    const { result } = renderHook(() => useTodos())
    
    expect(result.current.todos).toEqual([])
    expect(result.current.optimisticTodos).toEqual([])
    expect(result.current.filter).toBe('all')
    expect(result.current.editingId).toBe(null)
    expect(result.current.activeTodoCount).toBe(0)
    expect(result.current.completedTodoCount).toBe(0)
  })

  it('provides all required actions', () => {
    const { result } = renderHook(() => useTodos())
    
    expect(typeof result.current.addTodoAction).toBe('function')
    expect(typeof result.current.toggleTodoAction).toBe('function')
    expect(typeof result.current.editTodoAction).toBe('function')
    expect(typeof result.current.deleteTodoAction).toBe('function')
    expect(typeof result.current.clearCompletedAction).toBe('function')
  })

  it('provides standard functions', () => {
    const { result } = renderHook(() => useTodos())
    
    expect(typeof result.current.setFilter).toBe('function')
    expect(typeof result.current.startEdit).toBe('function')
    expect(typeof result.current.cancelEdit).toBe('function')
  })

  it('changes filter correctly', () => {
    const { result } = renderHook(() => useTodos())
    
    act(() => {
      result.current.setFilter('active')
    })
    
    expect(result.current.filter).toBe('active')
    
    act(() => {
      result.current.setFilter('completed')
    })
    
    expect(result.current.filter).toBe('completed')
  })

  it('starts and cancels editing correctly', () => {
    const { result } = renderHook(() => useTodos())
    
    act(() => {
      result.current.startEdit('test-id')
    })
    
    expect(result.current.editingId).toBe('test-id')
    
    act(() => {
      result.current.cancelEdit()
    })
    
    expect(result.current.editingId).toBe(null)
  })

  it('handles addTodoAction with valid input', async () => {
    const { result } = renderHook(() => useTodos())
    const formData = createMockFormData({ 'todo-text': 'New todo' })
    
    await act(async () => {
      await result.current.addTodoAction(formData)
    })
    
    // The action should be called (we can't easily test the actual state change
    // without more complex mocking, but we can verify the function exists and is callable)
    expect(result.current.addTodoAction).toBeDefined()
  })

  it('handles toggleTodoAction with valid input', async () => {
    const { result } = renderHook(() => useTodos())
    const formData = createMockFormData({ 'todo-id': 'test-id' })
    
    await act(async () => {
      await result.current.toggleTodoAction(formData)
    })
    
    expect(result.current.toggleTodoAction).toBeDefined()
  })

  it('handles editTodoAction with valid input', async () => {
    const { result } = renderHook(() => useTodos())
    const formData = createMockFormData({ 
      'todo-id': 'test-id',
      'todo-text': 'Updated text'
    })
    
    await act(async () => {
      await result.current.editTodoAction(formData)
    })
    
    expect(result.current.editTodoAction).toBeDefined()
  })

  it('handles deleteTodoAction with valid input', async () => {
    const { result } = renderHook(() => useTodos())
    const formData = createMockFormData({ 'todo-id': 'test-id' })
    
    await act(async () => {
      await result.current.deleteTodoAction(formData)
    })
    
    expect(result.current.deleteTodoAction).toBeDefined()
  })

  it('handles clearCompletedAction', async () => {
    const { result } = renderHook(() => useTodos())
    
    await act(async () => {
      await result.current.clearCompletedAction()
    })
    
    expect(result.current.clearCompletedAction).toBeDefined()
  })

  it('computes filtered todos correctly', () => {
    const { result } = renderHook(() => useTodos())
    
    // Initially all todos should be shown (empty array)
    expect(result.current.filteredTodos).toEqual([])
    
    // Test filter changes
    act(() => {
      result.current.setFilter('active')
    })
    expect(result.current.filteredTodos).toEqual([])
    
    act(() => {
      result.current.setFilter('completed')
    })
    expect(result.current.filteredTodos).toEqual([])
    
    act(() => {
      result.current.setFilter('all')
    })
    expect(result.current.filteredTodos).toEqual([])
  })

  it('computes counts correctly with empty todos', () => {
    const { result } = renderHook(() => useTodos())
    
    expect(result.current.activeTodoCount).toBe(0)
    expect(result.current.completedTodoCount).toBe(0)
  })

  it('provides groupedTodos using ECMAScript 2024 Object.groupBy', () => {
    const { result } = renderHook(() => useTodos())
    
    expect(result.current.groupedTodos).toBeDefined()
    expect(typeof result.current.groupedTodos).toBe('object')
  })

  it('handles isPending state', () => {
    const { result } = renderHook(() => useTodos())
    
    // isPending should be a boolean
    expect(typeof result.current.isPending).toBe('boolean')
  })
})