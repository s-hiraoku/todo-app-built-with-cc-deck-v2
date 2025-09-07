import { Todo, StorageData, TodoAppError, ValidatorFn, ValidationResult } from '@/types'

// TypeScript 5.7+ Type Guards with Runtime Validation

export const validateTodo: ValidatorFn<Todo> = (todo: unknown): todo is Todo => {
  if (!todo || typeof todo !== 'object') return false
  
  const t = todo as any
  return (
    typeof t.id === 'string' &&
    typeof t.text === 'string' &&
    typeof t.completed === 'boolean' &&
    t.createdAt instanceof Date &&
    t.updatedAt instanceof Date
  )
}

export const validateStorageData: ValidatorFn<StorageData> = (data: unknown): data is StorageData => {
  if (!data || typeof data !== 'object') return false
  
  const d = data as any
  return (
    Array.isArray(d.todos) &&
    d.todos.every((todo: unknown) => validateTodo(todo)) &&
    typeof d.version === 'string' &&
    typeof d.lastUpdated === 'string'
  )
}

// Validation with detailed error messages
export const validateTodoWithResult = (todo: unknown): ValidationResult<Todo> => {
  if (!todo || typeof todo !== 'object') {
    return { success: false, error: 'Todo must be an object' }
  }
  
  const t = todo as any
  
  if (typeof t.id !== 'string') {
    return { success: false, error: 'Todo id must be a string' }
  }
  
  if (typeof t.text !== 'string') {
    return { success: false, error: 'Todo text must be a string' }
  }
  
  if (t.text.trim().length === 0) {
    return { success: false, error: 'Todo text cannot be empty' }
  }
  
  if (t.text.length > 500) {
    return { success: false, error: 'Todo text cannot exceed 500 characters' }
  }
  
  if (typeof t.completed !== 'boolean') {
    return { success: false, error: 'Todo completed must be a boolean' }
  }
  
  if (!(t.createdAt instanceof Date)) {
    return { success: false, error: 'Todo createdAt must be a Date' }
  }
  
  if (!(t.updatedAt instanceof Date)) {
    return { success: false, error: 'Todo updatedAt must be a Date' }
  }
  
  return { success: true, data: t as Todo }
}

// Form data validation
export const validateFormData = (formData: FormData, requiredFields: string[]): ValidationResult<Record<string, string>> => {
  const data: Record<string, string> = {}
  const missingFields: string[] = []
  
  for (const field of requiredFields) {
    const value = formData.get(field)
    if (typeof value === 'string') {
      data[field] = value
    } else {
      missingFields.push(field)
    }
  }
  
  if (missingFields.length > 0) {
    return {
      success: false,
      error: `Missing required fields: ${missingFields.join(', ')}`
    }
  }
  
  return { success: true, data }
}

// Storage data sanitization
export const sanitizeTodoForStorage = (todo: Todo): Todo => {
  return {
    id: todo.id,
    text: todo.text.trim().slice(0, 500),
    completed: Boolean(todo.completed),
    createdAt: new Date(todo.createdAt),
    updatedAt: new Date(todo.updatedAt),
    // Remove optimistic fields for storage
  }
}

// Parse dates from JSON
export const parseTodoFromStorage = (stored: any): Todo => {
  return {
    ...stored,
    createdAt: new Date(stored.createdAt),
    updatedAt: new Date(stored.updatedAt)
  }
}

// Error factory functions
export const createValidationError = (message: string): TodoAppError => {
  return new TodoAppError(message, 'VALIDATION_ERROR', true, 'destructive')
}

export const createStorageError = (message: string): TodoAppError => {
  return new TodoAppError(message, 'STORAGE_ERROR', true, 'destructive')
}