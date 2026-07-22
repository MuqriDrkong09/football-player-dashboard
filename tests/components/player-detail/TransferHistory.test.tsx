import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TransferHistory } from '@/components/player-detail/TransferHistory'
import type { TransferRecord } from '@/types/api-football'

jest.mock('@/lib/notify', () => ({
  notify: {
    info: jest.fn(),
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
  },
}))

const transfers: TransferRecord[] = [
  {
    date: '2023-01-10',
    type: 'Loan',
    teams: {
      in: { id: 3, name: 'Bayern Munich', logo: 'bayern.png' },
      out: { id: 1, name: 'Liverpool', logo: 'liv.png' },
    },
  },
  {
    date: '2019-07-15',
    type: '€75M',
    teams: {
      in: { id: 1, name: 'Liverpool', logo: 'liv.png' },
      out: { id: 2, name: 'Southampton', logo: '' },
    },
  },
]

describe('components/player-detail/TransferHistory', () => {
  it('shows loading, error, and empty states', async () => {
    const user = userEvent.setup()
    const onRetry = jest.fn()

    const { rerender } = render(
      <TransferHistory transfers={[]} isLoading />,
    )
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument()

    rerender(
      <TransferHistory
        transfers={[]}
        isError
        errorMessage="Transfers failed"
        onRetry={onRetry}
      />,
    )
    expect(screen.getByText(/transfers failed/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /try again/i }))
    expect(onRetry).toHaveBeenCalled()

    rerender(<TransferHistory transfers={[]} isError />)
    expect(screen.getByText('Failed to load transfer history.')).toBeInTheDocument()

    rerender(<TransferHistory transfers={[]} />)
    expect(screen.getByText('No transfer history')).toBeInTheDocument()
  })

  it('renders transfer cards with club details and fees', () => {
    render(<TransferHistory transfers={transfers} />)

    expect(screen.getByLabelText('Transfer history')).toBeInTheDocument()
    expect(screen.getByText('Loan')).toBeInTheDocument()
    expect(screen.getByText('Permanent')).toBeInTheDocument()
    expect(screen.getByText('Season 2022/23')).toBeInTheDocument()
    expect(screen.getByText('Season 2019/20')).toBeInTheDocument()
    expect(screen.getByText('Bayern Munich')).toBeInTheDocument()
    expect(screen.getAllByText('Liverpool')).toHaveLength(2)
    expect(screen.getByText('Southampton')).toBeInTheDocument()
    expect(screen.getByText('SO')).toBeInTheDocument()
    expect(screen.getByText('Transfer fee:')).toBeInTheDocument()
    expect(screen.getByText('€75M')).toBeInTheDocument()
    expect(screen.getByAltText('Bayern Munich logo')).toBeInTheDocument()
    expect(screen.queryByAltText('Southampton logo')).not.toBeInTheDocument()
  })

  it('renders unknown date labels and omits the fee section for non-fee transfers', () => {
    const fallbackTransfers: TransferRecord[] = [
      {
        date: null,
        type: 'Free',
        teams: {
          in: { id: 10, name: 'Arsenal', logo: 'ars.png' },
          out: { id: 11, name: 'Chelsea', logo: '' },
        },
      },
    ]

    render(<TransferHistory transfers={fallbackTransfers} />)

    expect(screen.getByText('Date unknown')).toBeInTheDocument()
    expect(screen.getByText('Season Unknown')).toBeInTheDocument()
    expect(screen.getByText('Free Transfer')).toBeInTheDocument()
    expect(screen.getByText('CH')).toBeInTheDocument()
    expect(screen.getByAltText('Arsenal logo')).toBeInTheDocument()
    expect(screen.queryByText('Transfer fee:')).not.toBeInTheDocument()
  })

  it('passes retrying state to the error view', () => {
    render(
      <TransferHistory
        transfers={[]}
        isError
        errorMessage="Transfers failed"
        onRetry={jest.fn()}
        isRetrying
      />,
    )

    expect(screen.getByRole('button', { name: /try again/i })).toBeDisabled()
  })
})
