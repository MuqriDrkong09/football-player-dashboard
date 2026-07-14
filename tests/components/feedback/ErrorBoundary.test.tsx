import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary'
import { notify } from '@/lib/notify'

jest.mock('@/lib/notify', () => ({
  notify: {
    error: jest.fn(),
    success: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
  },
}))

function ProblemChild({
  shouldThrow,
  message = 'Render boom',
}: {
  shouldThrow: boolean
  message?: string
}) {
  if (shouldThrow) {
    throw new Error(message)
  }
  return <p>All good</p>
}

function ResettableBoundary() {
  const [shouldThrow, setShouldThrow] = useState(true)

  return (
    <div>
      <button type="button" onClick={() => setShouldThrow(false)}>
        heal
      </button>
      <ErrorBoundary>
        <ProblemChild shouldThrow={shouldThrow} />
      </ErrorBoundary>
    </div>
  )
}

describe('components/feedback/ErrorBoundary', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
    jest.clearAllMocks()
  })

  afterEach(() => {
    ;(console.error as jest.Mock).mockRestore()
  })

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <ProblemChild shouldThrow={false} />
      </ErrorBoundary>,
    )

    expect(screen.getByText('All good')).toBeInTheDocument()
  })

  it('shows default fallback UI and notifies on catch', () => {
    render(
      <ErrorBoundary>
        <ProblemChild shouldThrow />
      </ErrorBoundary>,
    )

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText('Render boom')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Reload section' }),
    ).toBeInTheDocument()
    expect(notify.error).toHaveBeenCalledWith('Unexpected error', 'Render boom')
    expect(console.error).toHaveBeenCalled()
  })

  it('notifies with a fallback message when the thrown error has no message', () => {
    render(
      <ErrorBoundary>
        <ProblemChild shouldThrow message="" />
      </ErrorBoundary>,
    )

    expect(notify.error).toHaveBeenCalledWith(
      'Unexpected error',
      'An unexpected error occurred while rendering this page.',
    )
  })

  it('renders a custom fallback instead of EmptyState', () => {
    render(
      <ErrorBoundary fallback={<p>Custom fallback</p>}>
        <ProblemChild shouldThrow />
      </ErrorBoundary>,
    )

    expect(screen.getByText('Custom fallback')).toBeInTheDocument()
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument()
  })

  it('resets error state and reloads children when retry is clicked', async () => {
    const user = userEvent.setup()
    render(<ResettableBoundary />)

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'heal' }))
    await user.click(screen.getByRole('button', { name: 'Reload section' }))

    expect(screen.getByText('All good')).toBeInTheDocument()
    expect(notify.info).toHaveBeenCalledWith('Section reloaded')
  })

  it('uses the fallback description when error state has no message', () => {
    let boundary: ErrorBoundary | null = null

    render(
      <ErrorBoundary
        ref={(instance) => {
          boundary = instance
        }}
      >
        <ProblemChild shouldThrow={false} />
      </ErrorBoundary>,
    )

    expect(boundary).not.toBeNull()

    act(() => {
      boundary!.setState({ hasError: true, error: null })
    })

    expect(
      screen.getByText(
        'An unexpected error occurred while rendering this page.',
      ),
    ).toBeInTheDocument()
  })
})
