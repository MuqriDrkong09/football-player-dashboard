import { render, screen } from '@testing-library/react'
import { ComparisonCharts } from '@/components/compare/ComparisonCharts'
import type { ComparisonChartRow } from '@/utils/compare'

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
    Bar: ({
      name,
      children,
    }: {
      name?: string
      children?: React.ReactNode
    }) => <div data-testid={`bar-${name}`}>{children}</div>,
    Cell: ({ fill }: { fill?: string }) => (
      <span data-testid="chart-cell" data-fill={fill} />
    ),
  }
})

const data: ComparisonChartRow[] = [
  {
    stat: 'goals',
    label: 'Goals',
    player1: 20,
    player2: 15,
    player1Better: true,
    player2Better: false,
    isTie: false,
  },
  {
    stat: 'assists',
    label: 'Assists',
    player1: 5,
    player2: 10,
    player1Better: false,
    player2Better: true,
    isTie: false,
  },
  {
    stat: 'minutes',
    label: 'Minutes',
    player1: 2000,
    player2: 2000,
    player1Better: false,
    player2Better: false,
    isTie: true,
  },
  {
    stat: 'matches',
    label: 'Matches',
    player1: 30,
    player2: 28,
    player1Better: true,
    player2Better: false,
    isTie: false,
  },
  {
    stat: 'yellowCards',
    label: 'Yellow Cards',
    player1: 2,
    player2: 4,
    player1Better: true,
    player2Better: false,
    isTie: false,
  },
  {
    stat: 'redCards',
    label: 'Red Cards',
    player1: 1,
    player2: 1,
    player1Better: false,
    player2Better: false,
    isTie: true,
  },
]

describe('components/compare/ComparisonCharts', () => {
  it('renders a loading skeleton when isLoading is true', () => {
    const { container } = render(
      <ComparisonCharts
        data={[]}
        player1Name="Player A"
        player2Name="Player B"
        isLoading
      />,
    )

    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
    expect(screen.queryByText('Head-to-Head Comparison')).not.toBeInTheDocument()
  })

  it('renders win summaries, chart, and per-stat cards', () => {
    render(
      <ComparisonCharts
        data={data}
        player1Name="Erling Haaland"
        player2Name="Mohamed Salah"
      />,
    )

    expect(screen.getAllByText('Erling Haaland').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Mohamed Salah').length).toBeGreaterThan(0)
    expect(screen.getByText('Head-to-Head Comparison')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Brighter bars highlight the better statistic in each category',
      ),
    ).toBeInTheDocument()
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
    expect(screen.getByTestId('bar-Erling Haaland')).toBeInTheDocument()
    expect(screen.getByTestId('bar-Mohamed Salah')).toBeInTheDocument()

    expect(screen.getByText('Ties')).toBeInTheDocument()
    expect(screen.getAllByText('categories won')).toHaveLength(2)
    expect(screen.getByText('even stats')).toBeInTheDocument()

    expect(screen.getAllByText('Better')).toHaveLength(4)
    expect(screen.getAllByText('Tie')).toHaveLength(2)
    expect(screen.getByText('Goals')).toBeInTheDocument()
    expect(screen.getByText('Assists')).toBeInTheDocument()
  })

  it('colors chart cells for winners and muted values', () => {
    render(
      <ComparisonCharts
        data={data}
        player1Name="Player A"
        player2Name="Player B"
      />,
    )

    const cells = screen.getAllByTestId('chart-cell')
    expect(cells.some((cell) => cell.getAttribute('data-fill') === 'var(--color-chart-1)')).toBe(
      true,
    )
    expect(cells.some((cell) => cell.getAttribute('data-fill') === 'var(--color-chart-2)')).toBe(
      true,
    )
    expect(cells.some((cell) => cell.getAttribute('data-fill') === 'var(--color-muted)')).toBe(
      true,
    )
  })
})
