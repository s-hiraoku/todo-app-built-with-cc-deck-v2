// TodoFilters Component with shadcn/ui Button Group

import React from 'react'
import { Button } from '@/components/ui/button'
import { TodoFilterProps, FilterType } from '@/types'
import { cn } from '@/lib/utils'
import { List, Circle, CheckCircle2 } from 'lucide-react'

const filterOptions: { value: FilterType; label: string; icon: React.ComponentType<any> }[] = [
  { value: 'all', label: 'All', icon: List },
  { value: 'active', label: 'Active', icon: Circle },
  { value: 'completed', label: 'Completed', icon: CheckCircle2 },
]

export const TodoFilters: React.FC<TodoFilterProps> = React.memo(({
  currentFilter,
  onFilterChange,
  className
}) => {
  const handleFilterChange = (filter: FilterType) => {
    if (filter !== currentFilter) {
      onFilterChange(filter)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent, filter: FilterType) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleFilterChange(filter)
    }
  }

  return (
    <div 
      className={cn("flex items-center gap-1", className)}
      role="tablist"
      aria-label="Filter todos"
    >
      {filterOptions.map(({ value, label, icon: Icon }) => {
        const isActive = currentFilter === value
        
        return (
          <Button
            key={value}
            type="button"
            variant={isActive ? "default" : "outline"}
            size="sm"
            onClick={() => handleFilterChange(value)}
            onKeyDown={(e) => handleKeyDown(e, value)}
            className={cn(
              "transition-all duration-200 min-w-[80px]",
              "focus:ring-2 focus:ring-ring focus:ring-offset-2",
              isActive && "shadow-sm",
              !isActive && "hover:bg-accent hover:text-accent-foreground"
            )}
            aria-pressed={isActive}
            aria-label={`Show ${label.toLowerCase()} todos`}
            role="tab"
            aria-selected={isActive}
            data-state={isActive ? "active" : "inactive"}
          >
            <Icon className="h-4 w-4 mr-2" />
            {label}
          </Button>
        )
      })}
    </div>
  )
})

TodoFilters.displayName = 'TodoFilters'