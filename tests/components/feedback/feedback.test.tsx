import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RetryButton } from '@/components/feedback/RetryButton'
import { EmptyState } from '@/components/feedback/EmptyState'
import { QueryError } from '@/components/feedback/QueryError'
import { Heart } from 'lucide-react'

jest.mock('@/lib/notify', () => ({
  notify: {
    error: jest.fn(),
    success: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
  },
}))

import { notify } from '@/lib/notify'

describe('components/feedback', () => {
  it('renders RetryButton and disables while retrying', async () => {
    const user = userEvent.setup()
    const onRetry = jest.fn()

    const { rerender } = render(<RetryButton onRetry={onRetry} />)
    await user.click(screen.getByRole('button', { name: 'Try again' }))
    expect(onRetry).toHaveBeenCalledTimes(1)

    rerender(<RetryButton onRetry={onRetry} isRetrying />)
    expect(screen.getByRole('button', { name: 'Try again' })).toBeDisabled()
  })

  it('renders EmptyState title, description, and action', () => {
    render(
      <EmptyState
        icon={Heart}
        title="No favorites"
        description="Save players to see them here."
        action={<button type="button">Browse</button>}
      />,
    )

    expect(screen.getByText('No favorites')).toBeInTheDocument()
    expect(
      screen.getByText('Save players to see them here.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Browse' })).toBeInTheDocument()
  })

  it('renders QueryError and optionally notifies', () => {
    render(
      <QueryError
        title="Failed"
        message="Network down"
        onRetry={jest.fn()}
      />,
    )

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('Network down')).toBeInTheDocument()
    expect(notify.error).toHaveBeenCalledWith('Failed', 'Network down')
  })

  it('can suppress toast notifications on QueryError', () => {
    render(
      <QueryError
        title="Silent"
        message="Hidden toast"
        notifyToast={false}
      />,
    )

    expect(notify.error).not.toHaveBeenCalled()
  })
})
