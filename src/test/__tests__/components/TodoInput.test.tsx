// TodoInput Component Tests

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render, createMockAction } from '@/test/utils/test-utils'
import { TodoInput } from '@/components/todo/TodoInput'

describe('TodoInput', () => {
  const mockAddAction = createMockAction()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders input with correct placeholder', () => {
    render(<TodoInput addAction={mockAddAction} placeholder="Test placeholder" />)
    
    expect(screen.getByPlaceholderText('Test placeholder')).toBeInTheDocument()
  })

  it('renders with default placeholder when none provided', () => {
    render(<TodoInput addAction={mockAddAction} />)
    
    expect(screen.getByPlaceholderText('What needs to be done?')).toBeInTheDocument()
  })

  it('calls addAction when form is submitted with Enter key', async () => {
    const user = userEvent.setup()
    render(<TodoInput addAction={mockAddAction} />)
    
    const input = screen.getByPlaceholderText('What needs to be done?')
    
    await user.type(input, 'New todo item')
    await user.keyboard('{Enter}')
    
    await waitFor(() => {
      expect(mockAddAction.mock).toHaveBeenCalledWith(
        expect.any(FormData)
      )
    })
    
    // Check that the FormData contains the correct value
    const formData = mockAddAction.mock.calls[0][0]
    expect(formData.get('todo-text')).toBe('New todo item')
  })

  it('calls addAction when Add button is clicked', async () => {
    const user = userEvent.setup()
    render(<TodoInput addAction={mockAddAction} />)
    
    const input = screen.getByPlaceholderText('What needs to be done?')
    const addButton = screen.getByRole('button', { name: /add todo/i })
    
    await user.type(input, 'Another todo')
    await user.click(addButton)
    
    await waitFor(() => {
      expect(mockAddAction.mock).toHaveBeenCalledWith(
        expect.any(FormData)
      )
    })
  })

  it('does not submit empty todo', async () => {
    const user = userEvent.setup()
    render(<TodoInput addAction={mockAddAction} />)
    
    const input = screen.getByPlaceholderText('What needs to be done?')
    
    await user.type(input, '   ') // Only whitespace
    await user.keyboard('{Enter}')
    
    // Wait a bit to ensure no action is called
    await new Promise(resolve => setTimeout(resolve, 100))
    
    expect(mockAddAction.mock).not.toHaveBeenCalled()
  })

  it('clears input after successful submission', async () => {
    const user = userEvent.setup()
    render(<TodoInput addAction={mockAddAction} />)
    
    const input = screen.getByPlaceholderText('What needs to be done?') as HTMLInputElement
    
    await user.type(input, 'Todo to clear')
    await user.keyboard('{Enter}')
    
    await waitFor(() => {
      expect(input.value).toBe('')
    })
  })

  it('shows pending state when isPending is true', () => {
    render(<TodoInput addAction={mockAddAction} isPending={true} />)
    
    const input = screen.getByPlaceholderText('What needs to be done?')
    const button = screen.getByRole('button')
    
    expect(input).toBeDisabled()
    expect(button).toBeDisabled()
    expect(screen.getByText('Adding...')).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    render(<TodoInput addAction={mockAddAction} />)
    
    const input = screen.getByPlaceholderText('What needs to be done?')
    
    expect(input).toHaveAttribute('aria-label', 'Enter a new todo item')
    expect(input).toHaveAttribute('aria-describedby', 'todo-input-help')
    expect(input).toHaveAttribute('maxLength', '500')
  })

  it('prevents submission when pending', async () => {
    const user = userEvent.setup()
    render(<TodoInput addAction={mockAddAction} isPending={true} />)
    
    const input = screen.getByPlaceholderText('What needs to be done?')
    
    // Try to type and submit while pending
    await user.type(input, 'Should not submit')
    await user.keyboard('{Enter}')
    
    expect(mockAddAction.mock).not.toHaveBeenCalled()
  })
})