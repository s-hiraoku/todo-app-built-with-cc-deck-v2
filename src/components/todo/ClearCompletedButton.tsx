// ClearCompletedButton Component with shadcn/ui Button

import React from 'react'
import { Button } from '@/components/ui/button'
import { ClearCompletedButtonProps } from '@/types'
import { cn } from '@/lib/utils'
import { Trash2, Loader2 } from 'lucide-react'

export const ClearCompletedButton: React.FC<ClearCompletedButtonProps> = React.memo(({
  onClear,
  hasCompletedTodos,
  className,
  isPending = false
}) => {
  if (!hasCompletedTodos) {
    return null
  }

  const handleClick = async () => {
    if (isPending) return
    
    try {
      await onClear()
    } catch (error) {
      console.error('Clear completed error:', error)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={isPending}
      className={cn(
        "transition-all duration-200",
        "hover:bg-destructive hover:text-destructive-foreground hover:border-destructive",
        "focus:ring-2 focus:ring-destructive focus:ring-offset-2",
        "disabled:opacity-50 disabled:pointer-events-none",
        className
      )}
      aria-label="Clear all completed todos"
      data-testid="clear-completed-button"
    >
      {isPending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          Clearing...
        </>
      ) : (
        <>
          <Trash2 className="h-4 w-4 mr-2" />
          Clear Completed
        </>
      )}
    </Button>
  )
})

ClearCompletedButton.displayName = 'ClearCompletedButton'