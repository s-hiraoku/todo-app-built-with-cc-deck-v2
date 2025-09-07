// TodoItem Component with shadcn/ui and React 19 Actions

import React, { useState, useRef, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TodoItemProps } from '@/types'
import { cn } from '@/lib/utils'
import { X, Edit3, Check, Loader2 } from 'lucide-react'

export const TodoItem: React.FC<TodoItemProps> = React.memo(({
  todo,
  toggleAction,
  editAction,
  deleteAction,
  onStartEdit,
  onCancelEdit,
  isEditing,
  isPending = false
}) => {
  const [editText, setEditText] = useState(todo.text)
  const [localPending, setLocalPending] = useState(false)
  const editInputRef = useRef<HTMLInputElement>(null)

  // Focus edit input when editing starts
  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus()
      editInputRef.current.select()
    }
  }, [isEditing])

  // Reset edit text when todo changes or editing stops
  useEffect(() => {
    if (!isEditing) {
      setEditText(todo.text)
    }
  }, [isEditing, todo.text])

  const handleToggle = async () => {
    if (isPending || localPending) return
    
    setLocalPending(true)
    try {
      const formData = new FormData()
      formData.set('todo-id', todo.id)
      await toggleAction(formData)
    } catch (error) {
      console.error('Toggle error:', error)
    } finally {
      setLocalPending(false)
    }
  }

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isPending || localPending) return

    const trimmedText = editText.trim()
    
    // If text is empty, delete the todo
    if (!trimmedText) {
      handleDelete()
      return
    }

    // If text hasn't changed, just cancel editing
    if (trimmedText === todo.text) {
      onCancelEdit()
      return
    }

    setLocalPending(true)
    try {
      const formData = new FormData()
      formData.set('todo-id', todo.id)
      formData.set('todo-text', trimmedText)
      await editAction(formData)
    } catch (error) {
      console.error('Edit error:', error)
    } finally {
      setLocalPending(false)
    }
  }

  const handleDelete = async () => {
    if (isPending || localPending) return
    
    setLocalPending(true)
    try {
      const formData = new FormData()
      formData.set('todo-id', todo.id)
      await deleteAction(formData)
    } catch (error) {
      console.error('Delete error:', error)
    } finally {
      setLocalPending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleEdit(e as any)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setEditText(todo.text)
      onCancelEdit()
    }
  }

  const handleDoubleClick = () => {
    if (!isPending && !localPending && !isEditing) {
      onStartEdit(todo.id)
    }
  }

  const handleBlur = () => {
    // Small delay to allow form submission to complete
    setTimeout(() => {
      if (isEditing) {
        setEditText(todo.text)
        onCancelEdit()
      }
    }, 100)
  }

  const isProcessing = isPending || localPending
  
  return (
    <Card 
      className={cn(
        "group transition-all duration-200 hover:shadow-md",
        todo.completed && "opacity-75",
        isProcessing && "opacity-50 pointer-events-none",
        "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
      )}
      role="article"
      aria-label={`Todo: ${todo.text}`}
    >
      <CardContent className="flex items-center gap-3 p-4">
        {/* Checkbox for completion toggle */}
        <div className="flex-shrink-0">
          <Checkbox
            checked={todo.completed}
            onCheckedChange={handleToggle}
            disabled={isProcessing}
            aria-label={`Mark "${todo.text}" as ${todo.completed ? 'incomplete' : 'complete'}`}
            className={cn(
              "w-5 h-5 transition-all duration-200",
              "data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            )}
          />
          {isProcessing && (
            <Loader2 className="h-4 w-4 animate-spin absolute ml-0.5 -mt-4 text-muted-foreground" />
          )}
        </div>

        {/* Todo content - either text or edit input */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <form onSubmit={handleEdit} className="w-full">
              <Input
                ref={editInputRef}
                type="text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
                disabled={isProcessing}
                className="w-full text-sm"
                aria-label="Edit todo text"
                maxLength={500}
                autoComplete="off"
              />
            </form>
          ) : (
            <div
              onDoubleClick={handleDoubleClick}
              className={cn(
                "cursor-pointer p-2 rounded transition-colors min-h-[36px] flex items-center",
                "hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring",
                todo.completed && "line-through text-muted-foreground"
              )}
              tabIndex={0}
              role="button"
              aria-label="Double-click to edit"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleDoubleClick()
                }
              }}
            >
              <span className="break-words">{todo.text}</span>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex-shrink-0 flex items-center gap-1">
          {isEditing ? (
            <>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.preventDefault()
                  handleEdit(e as any)
                }}
                disabled={isProcessing}
                className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                aria-label="Save changes"
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.preventDefault()
                  setEditText(todo.text)
                  onCancelEdit()
                }}
                disabled={isProcessing}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                aria-label="Cancel editing"
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleDoubleClick}
                disabled={isProcessing}
                className={cn(
                  "h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity duration-200",
                  "text-muted-foreground hover:text-foreground hover:bg-accent",
                  "focus:opacity-100"
                )}
                aria-label={`Edit "${todo.text}"`}
              >
                <Edit3 className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleDelete}
                disabled={isProcessing}
                className={cn(
                  "h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity duration-200",
                  "text-destructive hover:bg-destructive/10 hover:text-destructive",
                  "focus:opacity-100"
                )}
                aria-label={`Delete "${todo.text}"`}
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
})

TodoItem.displayName = 'TodoItem'