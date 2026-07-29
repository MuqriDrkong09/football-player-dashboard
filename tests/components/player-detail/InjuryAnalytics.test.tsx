import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { InjuryAnalytics } from '@/components/player-detail/InjuryAnalytics'
import type {
  InjuriesBySeasonChartPoint,
  InjuryAnalyticsSummary,
  RecoveryDurationTrendChartPoint,
} from '@/utils/injury'

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
    Line: ({ name }: { name?: string }) => (
      <div data-testid={`line-${name?.toLowerCase().replaceAll('.', '').replaceAll(' ', '-')}`} />
    ),
    Bar: ({ name }: { name?: string }) => (
      <div data-testid={`bar-${name?.toLowerCase()}`} />
    ),
  }
})

const summary: InjuryAnalyticsSummary = {
  totalInjuries: 3,
  totalRecoveryDays: 120,
  longestInjury: {
    injuryType: 'Knee Injury',
    durationLabel: '2 mo',
    durationDays: 60,
  },
  currentInjuryStatus: 'Currently sidelined',
}

const injuriesBySeason: InjuriesBySeasonChartPoint[] = [
  { season: 2022, label: '2022/23', injuries: 1 },
  { season: 2023, label: '2023/24', injuries: 2 },
]

const recoveryDurationTrend: RecoveryDurationTrendChartPoint[] = [
  { season: 2022, label: '2022/23', averageDays: 21 },
  { season: 2023, label: '2023/24', averageDays: 45 },
]

describe('components/player-detail/InjuryAnalytics', () => {
  it('shows loading, error, and empty states', async () => {
    const user = userEvent.setup()
    const onRetry = jest.fn()

    const { rerender } = render(
      <InjuryAnalytics
        summary={{
          totalInjuries: 0,
          totalRecoveryDays: 0,
          longestInjury: null,
          currentInjuryStatus: 'Fit',
        }}
        injuriesBySeason={[]}
        recoveryDurationTrend={[]}
        isLoading
      />,
    )
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument()

    rerender(
      <InjuryAnalytics
        summary={{
          totalInjuries: 0,
          totalRecoveryDays: 0,
          longestInjury: null,
          currentInjuryStatus: 'Fit',
        }}
        injuriesBySeason={[]}
        recoveryDurationTrend={[]}
        isError
        errorMessage="Analytics failed"
        onRetry={onRetry}
      />,
    )
    expect(screen.getByText(/analytics failed/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /try again/i }))
    expect(onRetry).toHaveBeenCalled()

    rerender(
      <InjuryAnalytics
        summary={{
          totalInjuries: 0,
          totalRecoveryDays: 0,
          longestInjury: null,
          currentInjuryStatus: 'Fit',
        }}
        injuriesBySeason={[]}
        recoveryDurationTrend={[]}
        isError
      />,
    )
    expect(screen.getByText('Failed to load injury analytics.')).toBeInTheDocument()

    rerender(
      <InjuryAnalytics
        summary={{
          totalInjuries: 0,
          totalRecoveryDays: 0,
          longestInjury: null,
          currentInjuryStatus: 'Fit',
        }}
        injuriesBySeason={[]}
        recoveryDurationTrend={[]}
      />,
    )
    expect(screen.getByText('No injury analytics')).toBeInTheDocument()
  })

  it('renders summary cards and charts', () => {
    render(
      <InjuryAnalytics
        summary={summary}
        injuriesBySeason={injuriesBySeason}
        recoveryDurationTrend={recoveryDurationTrend}
      />,
    )

    expect(screen.getByText('Total injuries')).toBeInTheDocument()
    expect(screen.getByText('Total recovery days')).toBeInTheDocument()
    expect(screen.getByText('Longest injury')).toBeInTheDocument()
    expect(screen.getByText('Current injury status')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('120')).toBeInTheDocument()
    expect(screen.getByText('Knee Injury')).toBeInTheDocument()
    expect(screen.getByText('2 mo')).toBeInTheDocument()
    expect(screen.getByText('Currently sidelined')).toBeInTheDocument()
    expect(screen.getByText('Injuries by season')).toBeInTheDocument()
    expect(screen.getByText('Recovery duration trend')).toBeInTheDocument()
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
    expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    expect(screen.getAllByTestId('responsive-container')).toHaveLength(2)
  })

  it('renders fallback values when longest injury is unavailable', () => {
    render(
      <InjuryAnalytics
        summary={{
          totalInjuries: 1,
          totalRecoveryDays: 0,
          longestInjury: null,
          currentInjuryStatus: 'Fit',
        }}
        injuriesBySeason={[{ season: 2023, label: '2023/24', injuries: 1 }]}
        recoveryDurationTrend={[{ season: 2023, label: '2023/24', averageDays: 0 }]}
      />,
    )

    expect(screen.getByText('None recorded')).toBeInTheDocument()
    expect(screen.getByText('Fit')).toBeInTheDocument()
  })

  it('passes retrying state to the error view', () => {
    render(
      <InjuryAnalytics
        summary={{
          totalInjuries: 0,
          totalRecoveryDays: 0,
          longestInjury: null,
          currentInjuryStatus: 'Fit',
        }}
        injuriesBySeason={[]}
        recoveryDurationTrend={[]}
        isError
        errorMessage="Analytics failed"
        onRetry={jest.fn()}
        isRetrying
      />,
    )

    expect(screen.getByRole('button', { name: /try again/i })).toBeDisabled()
  })
})
