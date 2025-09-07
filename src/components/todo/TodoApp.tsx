// Main TodoApp Component with React 19 and shadcn/ui

import React from 'react'
import { useTodos } from '@/hooks/useTodos'
import { TodoInput } from './TodoInput'
import { TodoList } from './TodoList'
import { TodoFilters } from './TodoFilters'
import { TodoCounter } from './TodoCounter'
import { ClearCompletedButton } from './ClearCompletedButton'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { CheckSquare } from 'lucide-react'

interface TodoAppProps {
  className?: string
}

export const TodoApp: React.FC<TodoAppProps> = React.memo(({ className }) => {
  const {
    filteredTodos,
    filter,
    editingId,
    isPending,
    addTodoAction,
    toggleTodoAction,
    editTodoAction,
    deleteTodoAction,
    clearCompletedAction,
    setFilter,
    startEdit,
    cancelEdit,
    activeTodoCount,
    completedTodoCount
  } = useTodos()

  const hasCompletedTodos = completedTodoCount > 0

  return (
    <div className={cn("min-h-screen bg-background p-4", className)}>
      <div className="container mx-auto max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <CheckSquare className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground tracking-tight">
              Modern TODO
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Built with React 19, TypeScript 5.7+, and shadcn/ui
          </p>
        </div>

        {/* Main Content Card */}
        <Card className="shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="sr-only">Todo Application</CardTitle>
            
            {/* Todo Input */}
            <TodoInput 
              addAction={addTodoAction}
              isPending={isPending}
              placeholder="What needs to be done?"
            />
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Filters and Counter */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2 border-b">
              <TodoFilters
                currentFilter={filter}
                onFilterChange={setFilter}
                className="order-2 sm:order-1"
              />
              
              <TodoCounter
                count={activeTodoCount}
                className="order-1 sm:order-2"
              />
            </div>

            {/* Todo List */}
            <div className="min-h-[200px]">
              <TodoList
                todos={filteredTodos}
                filter={filter}
                editingId={editingId}
                isPending={isPending}
                toggleTodoAction={toggleTodoAction}
                editTodoAction={editTodoAction}
                deleteTodoAction={deleteTodoAction}
                onStartEdit={startEdit}
                onCancelEdit={cancelEdit}
              />
            </div>

            {/* Footer Actions */}
            {hasCompletedTodos && (
              <div className="flex justify-center pt-4 border-t">
                <ClearCompletedButton
                  onClear={clearCompletedAction}
                  hasCompletedTodos={hasCompletedTodos}
                  isPending={isPending}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <footer className="text-center mt-8 text-sm text-muted-foreground">
          <p>
            Double-click to edit • ESC to cancel • Enter to save
          </p>
          <p className="mt-2">
            Made with ❤️ using modern web technologies
          </p>
        </footer>
      </div>

      {/* Performance monitoring in development */}
      {import.meta.env.DEV && (
        <div className="fixed bottom-4 left-4 text-xs text-muted-foreground bg-muted p-2 rounded">
          {filteredTodos.length} todos • {activeTodoCount} active • {completedTodoCount} completed
        </div>
      )}
    </div>
  )
})

TodoApp.displayName = 'TodoApp'