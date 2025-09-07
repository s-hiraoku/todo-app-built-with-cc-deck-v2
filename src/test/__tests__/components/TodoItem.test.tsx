// TodoItem Component Tests

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render, createMockAction, mockTodos } from '@/test/utils/test-utils'
import { TodoItem } from '@/components/todo/TodoItem'

describe('TodoItem', () => {
  const mockToggleAction = createMockAction()
  const mockEditAction = createMockAction()
  const mockDeleteAction = createMockAction()
  const mockStartEdit = vi.fn()
  const mockCancelEdit = vi.fn()

  const defaultProps = {
    todo: mockTodos[0],
    toggleAction: mockToggleAction,
    editAction: mockEditAction,
    deleteAction: mockDeleteAction,
    onStartEdit: mockStartEdit,
    onCancelEdit: mockCancelEdit,
    isEditing: false,
    isPending: false,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders todo text correctly', () => {
    render(<TodoItem {...defaultProps} />)
    
    expect(screen.getByText(mockTodos[0].text)).toBeInTheDocument()
  })

  it('shows checkbox in correct state for incomplete todo', () => {
    render(<TodoItem {...defaultProps} />)
    
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).not.toBeChecked()
  })

  it('shows checkbox in correct state for completed todo', () => {
    const completedTodo = { ...mockTodos[0], completed: true }
    render(<TodoItem {...defaultProps} todo={completedTodo} />)
    
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeChecked()
  })

  it('calls toggleAction when checkbox is clicked', async () => {
    const user = userEvent.setup()
    render(<TodoItem {...defaultProps} />)
    
    const checkbox = screen.getByRole('checkbox')
    await user.click(checkbox)
    
    await waitFor(() => {
      expect(mockToggleAction.mock).toHaveBeenCalledWith(
        expect.any(FormData)
      )
    })

    const formData = mockToggleAction.mock.calls[0][0]
    expect(formData.get('todo-id')).toBe(mockTodos[0].id)
  })

  it('enters edit mode when double-clicked', async () => {
    const user = userEvent.setup()
    render(<TodoItem {...defaultProps} />)
    
    const todoText = screen.getByText(mockTodos[0].text)
    await user.dblClick(todoText)
    
    expect(mockStartEdit).toHaveBeenCalledWith(mockTodos[0].id)
  })

  it('shows edit input when isEditing is true', () => {
    render(<TodoItem {...defaultProps} isEditing={true} />)
    
    const editInput = screen.getByDisplayValue(mockTodos[0].text)
    expect(editInput).toBeInTheDocument()
    expect(editInput).toHaveFocus()
  })

  it('saves changes when Enter is pressed in edit mode', async () => {
    const user = userEvent.setup()
    render(<TodoItem {...defaultProps} isEditing={true} />)
    
    const editInput = screen.getByDisplayValue(mockTodos[0].text)
    
    await user.clear(editInput)
    await user.type(editInput, 'Updated todo text')
    await user.keyboard('{Enter}')
    
    await waitFor(() => {
      expect(mockEditAction.mock).toHaveBeenCalledWith(
        expect.any(FormData)
      )
    })

    const formData = mockEditAction.mock.calls[0][0]
    expect(formData.get('todo-text')).toBe('Updated todo text')
  })

  it('cancels editing when Escape is pressed', async () => {
    const user = userEvent.setup()
    render(<TodoItem {...defaultProps} isEditing={true} />)
    
    const editInput = screen.getByDisplayValue(mockTodos[0].text)
    
    await user.type(editInput, ' modified')
    await user.keyboard('{Escape}')
    
    expect(mockCancelEdit).toHaveBeenCalled()
  })

  it('calls deleteAction when delete button is clicked', async () => {
    const user = userEvent.setup()
    render(<TodoItem {...defaultProps} />)
    
    // Need to hover to see the delete button
    const todoItem = screen.getByRole('article')
    await user.hover(todoItem)
    
    const deleteButton = screen.getByLabelText(`Delete "${mockTodos[0].text}"`)
    await user.click(deleteButton)
    
    await waitFor(() => {
      expect(mockDeleteAction.mock).toHaveBeenCalledWith(
        expect.any(FormData)
      )
    })
  })

  it('deletes todo when edit text is empty and submitted', async () => {
    const user = userEvent.setup()
    render(<TodoItem {...defaultProps} isEditing={true} />)
    
    const editInput = screen.getByDisplayValue(mockTodos[0].text)
    
    await user.clear(editInput)
    await user.keyboard('{Enter}')
    
    await waitFor(() => {
      expect(mockDeleteAction.mock).toHaveBeenCalledWith(
        expect.any(FormData)
      )
    })
  })

  it('shows completed styling for completed todos', () => {
    const completedTodo = { ...mockTodos[0], completed: true }
    render(<TodoItem {...defaultProps} todo={completedTodo} />)
    
    const todoText = screen.getByText(completedTodo.text)
    expect(todoText.parentElement).toHaveClass('line-through')
  })

  it('shows pending state correctly', () => {
    render(<TodoItem {...defaultProps} isPending={true} />)
    
    const todoItem = screen.getByRole('article')
    expect(todoItem).toHaveClass('opacity-50', 'pointer-events-none')
  })

  it('has proper accessibility attributes', () => {
    render(<TodoItem {...defaultProps} />)
    
    const checkbox = screen.getByRole('checkbox')
    const article = screen.getByRole('article')
    
    expect(checkbox).toHaveAttribute(
      'aria-label', 
      `Mark "${mockTodos[0].text}" as complete`
    )
    expect(article).toHaveAttribute('aria-label', `Todo: ${mockTodos[0].text}`)
  })

  it('does not allow editing when pending', async () => {
    const user = userEvent.setup()
    render(<TodoItem {...defaultProps} isPending={true} />)
    
    const todoText = screen.getByText(mockTodos[0].text)
    await user.dblClick(todoText)
    
    expect(mockStartEdit).not.toHaveBeenCalled()
  })
})