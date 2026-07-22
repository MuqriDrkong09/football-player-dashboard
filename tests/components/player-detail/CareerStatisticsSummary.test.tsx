import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CareerStatisticsSummary } from '@/components/player-detail/CareerStatisticsSummary'
import type { PlayerSeasonHistoryRow } from '@/utils/player'

jest.mock('@/lib/notify', () => ({
  notify: {
    info: jest.fn(),
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
  },
}))

const rows: PlayerSeasonHistoryRow[] = [
  {
    season: 2024,
    team: { id: 40, name: 'Liverpool', logo: 'liv.png' },
    league: { id: 39, name: 'Premier League', logo: 'pl.png' },
    appearances: 34,
    goals: 20,
    assists: 8,
    minutes: 2900,
    yellowCards: 3,
    redCards: 0,
  },
  {
    season: 2023,
    team: { id: 40, name: 'Liverpool', logo: 'liv.png' },
    league: { id: 39, name: 'Premier League', logo: 'pl.png' },
    appearances: 30,
    goals: 18,
    assists: 6,
    minutes: 2700,
    yellowCards: 2,
    redCards: 1,
  },
  {
    season: 2022,
    team: { id: 50, name: 'Manchester City', logo: 'mc.png' },
    league: { id: 39, name: 'Premier League', logo: 'pl.png' },
    appearances: 28,
    goals: 15,
    assists: 6,
    minutes: 2400,
    yellowCards: 1,
    redCards: 0,
  },
]

describe('components/player-detail/CareerStatisticsSummary', () => {
  it('shows loading, error, and empty states', async () => {
    const user = userEvent.setup()
    const onRetry = jest.fn()

    const { rerender } = render(
      <CareerStatisticsSummary rows={[]} isLoading />,
    )
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument()

    rerender(
      <CareerStatisticsSummary
        rows={[]}
        isError
        errorMessage="Career stats failed"
        onRetry={onRetry}
      />,
    )
    expect(screen.getByText(/career stats failed/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /try again/i }))
    expect(onRetry).toHaveBeenCalled()

    rerender(<CareerStatisticsSummary rows={[]} isError />)
    expect(screen.getByText('Failed to load career statistics.')).toBeInTheDocument()

    rerender(<CareerStatisticsSummary rows={[]} />)
    expect(screen.getByText('No career statistics')).toBeInTheDocument()
  })

  it('renders career totals in responsive statistic cards', () => {
    render(<CareerStatisticsSummary rows={rows} />)

    expect(screen.getByText('Total Appearances')).toBeInTheDocument()
    expect(screen.getByText('Total Goals')).toBeInTheDocument()
    expect(screen.getByText('Total Assists')).toBeInTheDocument()
    expect(screen.getByText('Total Minutes')).toBeInTheDocument()
    expect(screen.getByText('Total Yellow Cards')).toBeInTheDocument()
    expect(screen.getByText('Total Red Cards')).toBeInTheDocument()
    expect(screen.getByText('Total Clubs')).toBeInTheDocument()
    expect(screen.getByText('Total Seasons')).toBeInTheDocument()

    expect(screen.getByText('92')).toBeInTheDocument()
    expect(screen.getByText('53')).toBeInTheDocument()
    expect(screen.getByText('20')).toBeInTheDocument()
    expect(screen.getByText('8000')).toBeInTheDocument()
    expect(screen.getByText('6')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })
})
