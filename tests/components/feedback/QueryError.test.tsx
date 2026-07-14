import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryError } from '@/components/feedback/QueryError'
import { notify } from '@/lib/notify'

jest.mock('@/lib/notify', () => ({
  notify: {
    error: jest.fn(),
    success: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
  },
}))

describe('components/feedback/QueryError', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders default title and message, and notifies once', () => {
    render(<QueryError />)

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(
      screen.getByText('Failed to load data. Please try again.'),
    ).toBeInTheDocument()
    expect(notify.error).toHaveBeenCalledTimes(1)
    expect(notify.error).toHaveBeenCalledWith(
      'Something went wrong',
      'Failed to load data. Please try again.',
    )
  })

  it('does not show a retry button when onRetry is omitted', () => {
    render(<QueryError title="Failed" message="Oops" />)

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('renders a retry button and forwards isRetrying', async () => {
    const user = userEvent.setup()
    const onRetry = jest.fn()

    const { rerender } = render(
      <QueryError title="Failed" message="Oops" onRetry={onRetry} />,
    )

    await user.click(screen.getByRole('button', { name: 'Try again' }))
    expect(onRetry).toHaveBeenCalledTimes(1)

    rerender(
      <QueryError
        title="Failed"
        message="Oops"
        onRetry={onRetry}
        isRetrying
      />,
    )

    expect(screen.getByRole('button', { name: 'Try again' })).toBeDisabled()
  })

  it('suppresses toast notifications when notifyToast is false', () => {
    render(
      <QueryError
        title="Silent"
        message="Hidden toast"
        notifyToast={false}
      />,
    )

    expect(notify.error).not.toHaveBeenCalled()
  })

  it('does not re-notify for the same title and message', () => {
    const { rerender } = render(
      <QueryError title="Failed" message="Same error" />,
    )

    expect(notify.error).toHaveBeenCalledTimes(1)

    // Flip notifyToast to re-run the effect, then restore it with the same key.
    rerender(
      <QueryError
        title="Failed"
        message="Same error"
        notifyToast={false}
        className="extra-error"
      />,
    )
    rerender(
      <QueryError
        title="Failed"
        message="Same error"
        notifyToast
        className="extra-error"
      />,
    )

    expect(notify.error).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('alert')).toHaveClass('extra-error')
  })

  it('notifies again when the title or message changes', () => {
    const { rerender } = render(
      <QueryError title="Failed" message="First error" />,
    )

    expect(notify.error).toHaveBeenCalledTimes(1)

    rerender(<QueryError title="Failed" message="Second error" />)

    expect(notify.error).toHaveBeenCalledTimes(2)
    expect(notify.error).toHaveBeenLastCalledWith('Failed', 'Second error')
  })
})
