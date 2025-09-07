// TodoList Component with shadcn/ui Cards and Animations

import React from 'react'
import { TodoItem } from './TodoItem'
import { Todo, FilterType } from '@/types'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle2, Circle, ListTodo } from 'lucide-react'

interface TodoListProps {
  todos: Todo[]
  filter: FilterType
  editingId: string | null
  isPending: boolean
  toggleTodoAction: (formData: FormData) => Promise<void>
  editTodoAction: (formData: FormData) => Promise<void>
  deleteTodoAction: (formData: FormData) => Promise<void>
  onStartEdit: (id: string) => void
  onCancelEdit: () => void
  className?: string
}

export const TodoList: React.FC<TodoListProps> = React.memo(({
  todos,
  filter,
  editingId,
  isPending,
  toggleTodoAction,
  editTodoAction,
  deleteTodoAction,
  onStartEdit,
  onCancelEdit,
  className
}) => {
  // Empty state messages based on filter
  const getEmptyMessage = () => {
    switch (filter) {
      case 'active':
        return {
          icon: Circle,
          title: 'No active todos',
          description: 'All your todos are completed! 🎉'
        }
      case 'completed':
        return {
          icon: CheckCircle2,
          title: 'No completed todos',
          description: 'Complete some todos to see them here.'
        }
      default:
        return {
          icon: ListTodo,
          title: 'No todos yet',
          description: 'Add your first todo to get started!'
        }
    }
  }

  if (todos.length === 0) {
    const emptyMessage = getEmptyMessage()
    const EmptyIcon = emptyMessage.icon

    return (
      <div className={cn("w-full max-w-md mx-auto", className)}>
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <EmptyIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {emptyMessage.title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {emptyMessage.description}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div 
      className={cn("w-full max-w-md mx-auto space-y-2", className)}
      role="list"
      aria-label={`${filter} todos`}
    >
      {todos.map((todo, index) => (
        <div
          key={todo.id}
          role="listitem"
          className={cn(
            "animate-slide-in-bottom",
            "transition-all duration-200"
          )}
          style={{
            animationDelay: `${index * 50}ms`,
            animationFillMode: 'backwards'
          }}
        >
          <TodoItem
            todo={todo}
            toggleAction={toggleTodoAction}
            editAction={editTodoAction}
            deleteAction={deleteTodoAction}
            onStartEdit={onStartEdit}
            onCancelEdit={onCancelEdit}
            isEditing={editingId === todo.id}
            isPending={isPending}
          />
        </div>
      ))}
      
      {/* Accessibility announcement for list updates */}
      <div 
        className="sr-only" 
        aria-live="polite" 
        aria-atomic="true"
      >
        {todos.length} {filter} {todos.length === 1 ? 'todo' : 'todos'} displayed
      </div>
    </div>
  )
})

TodoList.displayName = 'TodoList'