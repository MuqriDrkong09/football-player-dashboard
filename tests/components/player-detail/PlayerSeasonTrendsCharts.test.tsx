import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PlayerSeasonTrendsCharts } from '@/components/player-detail/PlayerSeasonTrendsCharts'
import type { SeasonTrendChartPoint } from '@/utils/player'

jest.mock('recharts', () => {
  const React = require('react') as typeof import('react')

  const Passthrough = ({ children }: { children?: React.ReactNode }) => (
    <div>{children}</div>
  )

  return {
    ResponsiveContainer: ({ children }: { children?: React.ReactNode }) => (
      <div data-testid="responsive-container">{children}</div>
    ),
    LineChart: ({ children }: { children?: React.ReactNode }) => (
      <div data-testid="line-chart">{children}</div>
    ),
    BarChart: ({ children }: { children?: React.ReactNode }) => (
      <div data-testid="bar-chart">{children}</div>
    ),
    CartesianGrid: Passthrough,
    XAxis: () => null,
    YAxis: () => null,
    Tooltip: () => null,
    Legend: () => null,
    Line: ({ name }: { name?: string }) => (
      <div data-testid={`line-${name?.toLowerCase()}`} />
    ),
    Bar: ({ name }: { name?: string }) => (
      <div data-testid={`bar-${name?.toLowerCase()}`} />
    ),
  }
})

const data: SeasonTrendChartPoint[] = [
  {
    season: 2022,
    label: '2022/23',
    goals: 8,
    assists: 3,
    matches: 20,
    minutes: 1800,
  },
  {
    season: 2024,
    label: '2024/25',
    goals: 12,
    assists: 5,
    matches: 30,
    minutes: 2600,
  },
]

describe('components/player-detail/PlayerSeasonTrendsCharts', () => {
  it('shows loading and empty states', () => {
    const { rerender } = render(
      <PlayerSeasonTrendsCharts data={[]} isLoading />,
    )
    expect(document.querySelectorAll('.animate-pulse').length).toBeGreaterThan(
      0,
    )

    rerender(<PlayerSeasonTrendsCharts data={[]} />)
    expect(
      screen.getByText('No season trend data available yet.'),
    ).toBeInTheDocument()
  })

  it('renders line charts by default and switches to bar charts', async () => {
    const user = userEvent.setup()

    render(<PlayerSeasonTrendsCharts data={data} />)

    expect(screen.getByText('Goals & Assists')).toBeInTheDocument()
    expect(screen.getByText('Matches & Minutes')).toBeInTheDocument()
    expect(screen.getAllByTestId('line-chart')).toHaveLength(2)
    expect(
      screen.getAllByTestId('responsive-container').length,
    ).toBeGreaterThan(0)
    expect(screen.getByTestId('line-goals')).toBeInTheDocument()
    expect(screen.getByTestId('line-assists')).toBeInTheDocument()
    expect(screen.getByTestId('line-matches')).toBeInTheDocument()
    expect(screen.getByTestId('line-minutes')).toBeInTheDocument()

    await user.click(screen.getByRole('tab', { name: 'Bar Chart' }))

    expect(screen.getAllByTestId('bar-chart')).toHaveLength(2)
    expect(screen.getByTestId('bar-goals')).toBeInTheDocument()
    expect(screen.getByTestId('bar-assists')).toBeInTheDocument()
    expect(screen.getByTestId('bar-matches')).toBeInTheDocument()
    expect(screen.getByTestId('bar-minutes')).toBeInTheDocument()
    expect(screen.queryByTestId('line-chart')).not.toBeInTheDocument()

    await user.click(screen.getByRole('tab', { name: 'Line Chart' }))
    expect(screen.getAllByTestId('line-chart')).toHaveLength(2)
  })
})
