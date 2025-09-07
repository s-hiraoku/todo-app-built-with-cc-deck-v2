// React 19 Actions API + ECMAScript 2024 Todo Management Hook

import { useState, useCallback, useMemo, useOptimistic, useTransition } from 'react'
import { Todo, FilterType, UseTodosReturn } from '@/types'
import { useLocalStorage } from './useLocalStorage'
import { useErrorHandler } from './useErrorHandler'
import { generateId, performanceMonitor } from '@/lib/utils'
import { validateFormData, sanitizeTodoForStorage } from '@/utils/validation'
import { TodoStorageManager } from '@/utils/storage'

export function useTodos(): UseTodosReturn {
  // Local storage for persistence
  const { data: todos, setData: setTodos, loading: storageLoading } = useLocalStorage<Todo[]>('todos', [])
  
  // React 19 useOptimistic for optimistic updates
  const [optimisticTodos, setOptimisticTodos] = useOptimistic(
    todos,
    (currentTodos, optimisticUpdate: { type: string; payload: any }) => {
      switch (optimisticUpdate.type) {
        case 'ADD_TODO':
          return [optimisticUpdate.payload, ...currentTodos]
        case 'TOGGLE_TODO':
          return currentTodos.map(todo =>
            todo.id === optimisticUpdate.payload
              ? { ...todo, completed: !todo.completed, updatedAt: new Date() }
              : todo
          )
        case 'EDIT_TODO':
          return currentTodos.map(todo =>
            todo.id === optimisticUpdate.payload.id
              ? { ...todo, text: optimisticUpdate.payload.text, updatedAt: new Date() }
              : todo
          )
        case 'DELETE_TODO':
          return currentTodos.filter(todo => todo.id !== optimisticUpdate.payload)
        case 'CLEAR_COMPLETED':
          return currentTodos.filter(todo => !todo.completed)
        default:
          return currentTodos
      }
    }
  )

  // React 19 useTransition for non-blocking updates
  const [isPending, startTransition] = useTransition()
  
  // Local state
  const [filter, setFilter] = useState<FilterType>('all')
  const [editingId, setEditingId] = useState<string | null>(null)
  
  // Error handling
  const { handleError, showSuccess } = useErrorHandler()

  // ECMAScript 2024 Object.groupBy for efficient grouping
  const groupedTodos = useMemo(() => {
    return Object.groupBy(optimisticTodos, (todo) => 
      todo.completed ? 'completed' : 'active'
    )
  }, [optimisticTodos])

  // Filtered todos based on current filter
  const filteredTodos = useMemo(() => {
    switch (filter) {
      case 'active':
        return groupedTodos.active || []
      case 'completed':
        return groupedTodos.completed || []
      default:
        return optimisticTodos
    }
  }, [optimisticTodos, filter, groupedTodos])

  // Computed counts
  const activeTodoCount = useMemo(() => 
    optimisticTodos.filter(todo => !todo.completed).length,
    [optimisticTodos]
  )

  const completedTodoCount = useMemo(() =>
    optimisticTodos.filter(todo => todo.completed).length,
    [optimisticTodos]
  )

  // React 19 Action for adding todos
  const addTodoAction = useCallback(async (formData: FormData) => {
    const monitor = performanceMonitor.measureActionPerformance('addTodo')
    
    try {
      const validation = validateFormData(formData, ['todo-text'])
      if (!validation.success) {
        handleError(new Error(validation.error))
        return
      }

      const text = validation.data!['todo-text'].trim()
      if (!text) {
        handleError(new Error('Todo text cannot be empty'))
        return
      }

      if (text.length > 500) {
        handleError(new Error('Todo text cannot exceed 500 characters'))
        return
      }

      const newTodo: Todo = {
        id: generateId(),
        text,
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        optimisticId: generateId()
      }

      // Optimistic update
      startTransition(() => {
        setOptimisticTodos({
          type: 'ADD_TODO',
          payload: newTodo
        })
      })

      // Actual update with error handling
      try {
        const newTodos = [newTodo, ...todos]
        await setTodos(newTodos)
        showSuccess('Todo added successfully')
      } catch (error) {
        // Revert optimistic update on error
        handleError(error)
        setOptimisticTodos({
          type: 'DELETE_TODO',
          payload: newTodo.id
        })
      }
    } catch (error) {
      handleError(error)
    } finally {
      monitor.end()
    }
  }, [todos, setTodos, handleError, showSuccess, setOptimisticTodos])

  // React 19 Action for toggling todos
  const toggleTodoAction = useCallback(async (formData: FormData) => {
    const monitor = performanceMonitor.measureActionPerformance('toggleTodo')
    
    try {
      const validation = validateFormData(formData, ['todo-id'])
      if (!validation.success) {
        handleError(new Error(validation.error))
        return
      }

      const id = validation.data!['todo-id']
      const todoToToggle = todos.find(todo => todo.id === id)
      
      if (!todoToToggle) {
        handleError(new Error('Todo not found'))
        return
      }

      // Optimistic update
      startTransition(() => {
        setOptimisticTodos({
          type: 'TOGGLE_TODO',
          payload: id
        })
      })

      // Actual update
      try {
        const updatedTodos = todos.map(todo =>
          todo.id === id
            ? { ...todo, completed: !todo.completed, updatedAt: new Date() }
            : todo
        )
        await setTodos(updatedTodos)
      } catch (error) {
        // Revert optimistic update on error
        handleError(error)
        startTransition(() => {
          setOptimisticTodos({
            type: 'TOGGLE_TODO',
            payload: id
          })
        })
      }
    } catch (error) {
      handleError(error)
    } finally {
      monitor.end()
    }
  }, [todos, setTodos, handleError, setOptimisticTodos])

  // React 19 Action for editing todos
  const editTodoAction = useCallback(async (formData: FormData) => {
    const monitor = performanceMonitor.measureActionPerformance('editTodo')
    
    try {
      const validation = validateFormData(formData, ['todo-id', 'todo-text'])
      if (!validation.success) {
        handleError(new Error(validation.error))
        return
      }

      const id = validation.data!['todo-id']
      const text = validation.data!['todo-text'].trim()

      if (!text) {
        // Delete todo if text is empty
        await deleteTodoAction(formData)
        return
      }

      if (text.length > 500) {
        handleError(new Error('Todo text cannot exceed 500 characters'))
        return
      }

      // Optimistic update
      startTransition(() => {
        setOptimisticTodos({
          type: 'EDIT_TODO',
          payload: { id, text }
        })
      })

      // Actual update
      try {
        const updatedTodos = todos.map(todo =>
          todo.id === id
            ? { ...todo, text, updatedAt: new Date() }
            : todo
        )
        await setTodos(updatedTodos)
        showSuccess('Todo updated successfully')
      } catch (error) {
        handleError(error)
        // Revert optimistic update would be complex here, so we reload
        window.location.reload()
      } finally {
        setEditingId(null)
      }
    } catch (error) {
      handleError(error)
    } finally {
      monitor.end()
    }
  }, [todos, setTodos, handleError, showSuccess, setOptimisticTodos])

  // React 19 Action for deleting todos
  const deleteTodoAction = useCallback(async (formData: FormData) => {
    const monitor = performanceMonitor.measureActionPerformance('deleteTodo')
    
    try {
      const validation = validateFormData(formData, ['todo-id'])
      if (!validation.success) {
        handleError(new Error(validation.error))
        return
      }

      const id = validation.data!['todo-id']

      // Optimistic update
      startTransition(() => {
        setOptimisticTodos({
          type: 'DELETE_TODO',
          payload: id
        })
      })

      // Actual update
      try {
        const updatedTodos = todos.filter(todo => todo.id !== id)
        await setTodos(updatedTodos)
        showSuccess('Todo deleted successfully')
      } catch (error) {
        handleError(error)
        // Revert optimistic update by reloading the page
        window.location.reload()
      }
    } catch (error) {
      handleError(error)
    } finally {
      monitor.end()
    }
  }, [todos, setTodos, handleError, showSuccess, setOptimisticTodos])

  // Action for clearing completed todos
  const clearCompletedAction = useCallback(async () => {
    const monitor = performanceMonitor.measureActionPerformance('clearCompleted')
    
    try {
      if (completedTodoCount === 0) return

      // Optimistic update
      startTransition(() => {
        setOptimisticTodos({
          type: 'CLEAR_COMPLETED',
          payload: null
        })
      })

      // Actual update
      try {
        const activeTodos = todos.filter(todo => !todo.completed)
        await setTodos(activeTodos)
        showSuccess(`${completedTodoCount} completed todos cleared`)
      } catch (error) {
        handleError(error)
        // Reload on error to get consistent state
        window.location.reload()
      }
    } catch (error) {
      handleError(error)
    } finally {
      monitor.end()
    }
  }, [todos, setTodos, handleError, showSuccess, completedTodoCount, setOptimisticTodos])

  // Standard functions
  const startEdit = useCallback((id: string) => {
    setEditingId(id)
  }, [])

  const cancelEdit = useCallback(() => {
    setEditingId(null)
  }, [])

  return {
    todos,
    optimisticTodos,
    filter,
    editingId,
    // React 19 Actions
    addTodoAction,
    toggleTodoAction,
    editTodoAction,
    deleteTodoAction,
    clearCompletedAction,
    // Standard functions
    setFilter,
    startEdit,
    cancelEdit,
    // Computed values
    filteredTodos,
    groupedTodos,
    activeTodoCount,
    completedTodoCount,
    isPending: isPending || storageLoading
  }
}