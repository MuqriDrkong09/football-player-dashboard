import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CareerSummary } from '@/components/player-detail/CareerSummary'
import type { TransferRecord } from '@/types/api-football'
import * as transferUtils from '@/utils/transfer'

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
    date: '2019-07-15',
    type: 'Free',
    teams: {
      in: { id: 1, name: 'Liverpool', logo: 'liv.png' },
      out: { id: 2, name: 'Southampton', logo: '' },
    },
  },
  {
    date: '2022-06-01',
    type: '€85M',
    teams: {
      in: { id: 4, name: 'Real Madrid', logo: 'rm.png' },
      out: { id: 5, name: 'Monaco', logo: 'monaco.png' },
    },
  },
  {
    date: '2023-01-10',
    type: 'Loan',
    teams: {
      in: { id: 3, name: 'Bayern Munich', logo: 'bayern.png' },
      out: { id: 1, name: 'Liverpool', logo: 'liv.png' },
    },
  },
]

describe('components/player-detail/CareerSummary', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-01-01T00:00:00Z'))
  })

  afterEach(() => {
    jest.restoreAllMocks()
    jest.useRealTimers()
  })

  it('shows loading, error, and empty states', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    const onRetry = jest.fn()

    const { rerender } = render(<CareerSummary transfers={[]} isLoading />)
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument()

    rerender(
      <CareerSummary
        transfers={[]}
        isError
        errorMessage="Summary failed"
        onRetry={onRetry}
      />,
    )
    expect(screen.getByText(/summary failed/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /try again/i }))
    expect(onRetry).toHaveBeenCalled()

    rerender(<CareerSummary transfers={[]} isError />)
    expect(screen.getByText('Failed to load career summary.')).toBeInTheDocument()

    rerender(<CareerSummary transfers={[]} />)
    expect(screen.getByText('No career summary')).toBeInTheDocument()
  })

  it('renders career summary statistic cards from transfer history', () => {
    render(<CareerSummary transfers={transfers} />)

    expect(screen.getByText('Total Clubs Played')).toBeInTheDocument()
    expect(screen.getByText('Total Transfers')).toBeInTheDocument()
    expect(screen.getByText('Current Club')).toBeInTheDocument()
    expect(screen.getByText('Longest Club Stay')).toBeInTheDocument()
    expect(screen.getByText('Most Expensive Transfer')).toBeInTheDocument()

    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('Bayern Munich')).toBeInTheDocument()
    expect(screen.getByAltText('Bayern Munich logo')).toBeInTheDocument()
    expect(screen.getByText('Real Madrid')).toBeInTheDocument()
    expect(screen.getByText('€85M')).toBeInTheDocument()
  })

  it('shows placeholders when fee and stay data are unavailable', () => {
    const feelessTransfers: TransferRecord[] = [
      {
        date: null,
        type: 'Free',
        teams: {
          in: { id: 10, name: 'Arsenal', logo: '' },
          out: { id: 11, name: 'Chelsea', logo: 'che.png' },
        },
      },
    ]

    render(<CareerSummary transfers={feelessTransfers} />)

    expect(screen.getByText('Arsenal')).toBeInTheDocument()
    expect(screen.getByText('AR')).toBeInTheDocument()
    expect(screen.getByText('No fee data available')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('renders fallback placeholders when summary fields are missing', () => {
    jest.spyOn(transferUtils, 'buildCareerSummaryFromTransfers').mockReturnValue({
      totalClubs: 2,
      totalTransfers: 1,
      currentClub: null,
      longestClubStay: null,
      mostExpensiveTransfer: null,
    })

    render(<CareerSummary transfers={[transfers[0]]} />)

    expect(screen.getAllByText('—')).toHaveLength(2)
    expect(screen.getByText('No fee data available')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('passes retrying state to the error view', () => {
    render(
      <CareerSummary
        transfers={[]}
        isError
        errorMessage="Summary failed"
        onRetry={jest.fn()}
        isRetrying
      />,
    )

    expect(screen.getByRole('button', { name: /try again/i })).toBeDisabled()
  })
})
