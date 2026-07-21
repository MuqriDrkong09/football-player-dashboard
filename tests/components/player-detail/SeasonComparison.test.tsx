import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SeasonComparison } from '@/components/player-detail/SeasonComparison'
import type { PlayerSeasonHistoryRow } from '@/utils/player'

jest.mock('@/lib/notify', () => ({
  notify: {
    info: jest.fn(),
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
  },
}))

jest.mock('recharts', () => {
  const React = require('react') as typeof import('react')

  const Passthrough = ({ children }: { children?: React.ReactNode }) => (
    <div>{children}</div>
  )

  return {
    ResponsiveContainer: ({ children }: { children?: React.ReactNode }) => (
      <div data-testid="responsive-container">{children}</div>
    ),
    BarChart: ({ children }: { children?: React.ReactNode }) => (
      <div data-testid="bar-chart">{children}</div>
    ),
    CartesianGrid: Passthrough,
    XAxis: () => null,
    YAxis: () => null,
    Tooltip: () => null,
    Legend: () => null,
    Bar: ({ name }: { name?: string }) => (
      <div data-testid={`bar-${name?.toLowerCase().replace(/\//g, '-')}`} />
    ),
    Cell: () => null,
  }
})

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
    yellowCards: 5,
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
    yellowCards: 2,
    redCards: 0,
  },
]

const mixedComparisonRows: PlayerSeasonHistoryRow[] = [
  {
    season: 2024,
    team: { id: 40, name: 'Liverpool', logo: 'liv.png' },
    league: { id: 39, name: 'Premier League', logo: 'pl.png' },
    appearances: 20,
    goals: 10,
    assists: 5,
    minutes: 1000,
    yellowCards: 1,
    redCards: 0,
  },
  {
    season: 2023,
    team: { id: 40, name: 'Liverpool', logo: 'liv.png' },
    league: { id: 39, name: 'Premier League', logo: 'pl.png' },
    appearances: 25,
    goals: 15,
    assists: 5,
    minutes: 1000,
    yellowCards: 2,
    redCards: 1,
  },
]

describe('components/player-detail/SeasonComparison', () => {
  it('shows loading, error, and insufficient season states', async () => {
    const user = userEvent.setup()
    const onRetry = jest.fn()

    const { rerender } = render(
      <SeasonComparison rows={[]} seasons={[]} isLoading />,
    )
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument()

    rerender(
      <SeasonComparison
        rows={[]}
        seasons={[2024]}
        isError
        errorMessage="Comparison failed"
        onRetry={onRetry}
      />,
    )
    expect(screen.getByText(/comparison failed/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /try again/i }))
    expect(onRetry).toHaveBeenCalled()

    rerender(<SeasonComparison rows={rows} seasons={[2024]} />)
    expect(screen.getByText('Not enough seasons to compare')).toBeInTheDocument()

    rerender(<SeasonComparison rows={[]} seasons={[2024, 2023]} isError />)
    expect(
      screen.getByText('Failed to load season comparison data.'),
    ).toBeInTheDocument()
  })

  it('renders comparison summary and charts for two seasons', () => {
    render(<SeasonComparison rows={rows} seasons={[2024, 2023, 2022]} />)

    expect(screen.getByText('Improvements')).toBeInTheDocument()
    expect(screen.getByText('Declines')).toBeInTheDocument()
    expect(screen.getByText('Unchanged')).toBeInTheDocument()
    expect(screen.getByText('Head-to-Head Comparison')).toBeInTheDocument()
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
    expect(screen.getAllByText('2023/24').length).toBeGreaterThan(0)
    expect(screen.getAllByText('2024/25').length).toBeGreaterThan(0)
    expect(screen.getAllByText('+2 change').length).toBeGreaterThan(0)
    expect(screen.getByText('-2 change')).toBeInTheDocument()
    expect(screen.getAllByText('Improved').length).toBeGreaterThan(0)
  })

  it('renders baseline and comparison season selectors', async () => {
    render(<SeasonComparison rows={rows} seasons={[2024, 2023, 2022]} />)

    await waitFor(() => {
      expect(
        screen.getByRole('combobox', { name: 'Baseline season' }),
      ).toHaveTextContent('2023/24')
    })
    expect(
      screen.getByRole('combobox', { name: 'Comparison season' }),
    ).toHaveTextContent('2024/25')
  })

  it('highlights declined and unchanged stats in the summary cards', async () => {
    render(
      <SeasonComparison
        rows={mixedComparisonRows}
        seasons={[2024, 2023]}
      />,
    )

    await waitFor(() => {
      expect(screen.getAllByText('Declined').length).toBeGreaterThan(0)
    })

    expect(screen.getAllByText('Unchanged').length).toBeGreaterThan(0)
    expect(screen.getAllByText('No change').length).toBeGreaterThan(0)
    expect(screen.getAllByText('-5 change').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Improved').length).toBeGreaterThan(0)
  })

  it('prompts for season selection when row data is missing', async () => {
    render(
      <SeasonComparison
        rows={[]}
        seasons={[2024, 2023]}
      />,
    )

    await waitFor(() => {
      expect(
        screen.getByText('Select two different seasons'),
      ).toBeInTheDocument()
    })
  })

  it('keeps selected seasons when the season list still includes them', async () => {
    const { rerender } = render(
      <SeasonComparison rows={rows} seasons={[2024, 2023, 2022]} />,
    )

    await waitFor(() => {
      expect(
        screen.getByRole('combobox', { name: 'Baseline season' }),
      ).toHaveTextContent('2023/24')
    })

    rerender(<SeasonComparison rows={rows} seasons={[2024, 2023]} />)

    await waitFor(() => {
      expect(
        screen.getByRole('combobox', { name: 'Baseline season' }),
      ).toHaveTextContent('2023/24')
      expect(
        screen.getByRole('combobox', { name: 'Comparison season' }),
      ).toHaveTextContent('2024/25')
    })
  })

  it('resets selected seasons when they are no longer available', async () => {
    const { rerender } = render(
      <SeasonComparison rows={rows} seasons={[2024, 2023, 2022]} />,
    )

    await waitFor(() => {
      expect(
        screen.getByRole('combobox', { name: 'Baseline season' }),
      ).toHaveTextContent('2023/24')
    })

    rerender(<SeasonComparison rows={rows} seasons={[2024, 2022]} />)

    await waitFor(() => {
      expect(
        screen.getByRole('combobox', { name: 'Baseline season' }),
      ).toHaveTextContent('2022/23')
      expect(
        screen.getByRole('combobox', { name: 'Comparison season' }),
      ).toHaveTextContent('2024/25')
    })
  })
})
