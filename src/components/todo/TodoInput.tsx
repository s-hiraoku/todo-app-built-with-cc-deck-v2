// TodoInput Component with shadcn/ui and React 19 Actions

import React, { useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { TodoInputProps } from '@/types'
import { cn } from '@/lib/utils'
import { Plus, Loader2 } from 'lucide-react'

export const TodoInput: React.FC<TodoInputProps> = React.memo(({
  addAction,
  placeholder = 'What needs to be done?',
  className,
  isPending = false
}) => {
  const formRef = useRef<HTMLFormElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSubmit = async (formData: FormData) => {
    if (isPending) return
    
    try {
      await addAction(formData)
      // Reset form after successful submission
      formRef.current?.reset()
      inputRef.current?.focus()
    } catch (error) {
      // Error is handled by the action
      console.error('Todo submission error:', error)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      const formData = new FormData(formRef.current!)
      if (formData.get('todo-text')) {
        handleSubmit(formData)
      }
    }
  }

  return (
    <div className={cn("w-full max-w-md mx-auto", className)}>
      <form 
        ref={formRef}
        action={handleSubmit}
        className="flex gap-2 p-4 bg-card rounded-lg border shadow-sm"
      >
        <div className="flex-1">
          <Input
            ref={inputRef}
            name="todo-text"
            type="text"
            placeholder={placeholder}
            className={cn(
              "text-lg transition-all duration-200",
              "focus:ring-2 focus:ring-primary focus:border-primary",
              isPending && "opacity-50"
            )}
            disabled={isPending}
            onKeyDown={handleKeyDown}
            aria-label="Enter a new todo item"
            aria-describedby="todo-input-help"
            maxLength={500}
            autoComplete="off"
          />
          <div 
            id="todo-input-help" 
            className="sr-only"
          >
            Enter your todo item and press Enter or click Add to create it
          </div>
        </div>
        
        <Button
          type="submit"
          size="default"
          disabled={isPending}
          aria-label="Add todo item"
          className={cn(
            "min-w-[80px] transition-all duration-200",
            "focus:ring-2 focus:ring-primary focus:ring-offset-2"
          )}
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Adding...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Add
            </>
          )}
        </Button>
      </form>
      
      {/* Visual feedback for form state */}
      <div className="mt-2 text-xs text-muted-foreground text-center">
        Press <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Enter</kbd> to add quickly
      </div>
    </div>
  )
})

TodoInput.displayName = 'TodoInput'