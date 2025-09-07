// TypeScript 5.7+ ECMAScript 2024 Type Definitions

export interface Todo {
  id: string
  text: string
  completed: boolean
  createdAt: Date
  updatedAt: Date
  optimisticId?: string // React 19 useOptimistic用
}

export type FilterType = 'all' | 'active' | 'completed'

// ECMAScript 2024 グルーピング用型
export type TodoGroup = ReturnType<typeof Object.groupBy<Todo, string>>
export type TodoMap = ReturnType<typeof Map.groupBy<Todo, FilterType>>

export interface TodoState {
  todos: Todo[]
  filter: FilterType
  editingId: string | null
}

// Local Storage Types with Promise.withResolvers
export interface StorageData {
  todos: Todo[]
  version: string
  lastUpdated: string
}

// React 19 Actions API Types
export interface TodoItemProps {
  todo: Todo
  toggleAction: (formData: FormData) => Promise<void>
  editAction: (formData: FormData) => Promise<void>
  deleteAction: (formData: FormData) => Promise<void>
  onStartEdit: (id: string) => void
  onCancelEdit: () => void
  isEditing: boolean
  isPending?: boolean // useFormStatus用
}

export interface TodoInputProps {
  addAction: (formData: FormData) => Promise<void>
  placeholder?: string
  className?: string
  isPending?: boolean
}

export interface TodoFilterProps {
  currentFilter: FilterType
  onFilterChange: (filter: FilterType) => void
  className?: string
}

export interface TodoCounterProps {
  count: number
  className?: string
}

export interface ClearCompletedButtonProps {
  onClear: () => Promise<void>
  hasCompletedTodos: boolean
  className?: string
  isPending?: boolean
}

// React 19 Hook Return Types with Actions API
export interface UseTodosReturn {
  todos: Todo[]
  optimisticTodos: Todo[] // useOptimistic
  filter: FilterType
  editingId: string | null
  // React 19 Actions
  addTodoAction: (formData: FormData) => Promise<void>
  toggleTodoAction: (formData: FormData) => Promise<void>
  editTodoAction: (formData: FormData) => Promise<void>
  deleteTodoAction: (formData: FormData) => Promise<void>
  clearCompletedAction: () => Promise<void>
  // Standard functions
  setFilter: (filter: FilterType) => void
  startEdit: (id: string) => void
  cancelEdit: () => void
  // Computed values with ECMAScript 2024
  filteredTodos: Todo[]
  groupedTodos: TodoGroup // Object.groupBy結果
  activeTodoCount: number
  completedTodoCount: number
  isPending: boolean // Action pending state
}

export interface UseLocalStorageReturn<T> {
  data: T
  setData: (value: T) => void
  loading: boolean
  error: string | null
}

// Error Types
export class TodoAppError extends Error {
  constructor(
    message: string,
    public code: string,
    public recoverable: boolean = true,
    public toastVariant: 'default' | 'destructive' = 'destructive'
  ) {
    super(message)
    this.name = 'TodoAppError'
  }
}

export class StorageError extends TodoAppError {
  constructor(message: string, recoverable: boolean = true) {
    super(message, 'STORAGE_ERROR', recoverable)
  }
}

// Validation function types
export type ValidatorFn<T> = (value: unknown) => value is T
export type ValidationResult<T> = {
  success: boolean
  data?: T
  error?: string
}