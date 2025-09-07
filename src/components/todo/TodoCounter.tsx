// TodoCounter Component with shadcn/ui Badge

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { TodoCounterProps } from '@/types'
import { cn } from '@/lib/utils'

export const TodoCounter: React.FC<TodoCounterProps> = React.memo(({
  count,
  className
}) => {
  const isZero = count === 0
  const itemText = count === 1 ? 'item' : 'items'
  
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <Badge
        variant={isZero ? "outline" : "secondary"}
        className={cn(
          "transition-all duration-300 px-3 py-1 text-sm font-medium",
          "animate-fade-in",
          isZero && "text-muted-foreground border-muted-foreground/20"
        )}
        aria-live="polite"
        aria-atomic="true"
        aria-label={`${count} ${itemText} left`}
        data-testid="todo-counter"
      >
        <span className="tabular-nums">
          {count}
        </span>
        <span className="ml-1">
          {itemText} left
        </span>
      </Badge>
    </div>
  )
})

TodoCounter.displayName = 'TodoCounter'