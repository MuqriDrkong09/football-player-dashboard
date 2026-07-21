import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CareerTimeline } from '@/components/player-detail/CareerTimeline'
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
    redCards: 0,
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

describe('components/player-detail/CareerTimeline', () => {
  it('shows loading, error, and empty states', async () => {
    const user = userEvent.setup()
    const onRetry = jest.fn()

    const { rerender } = render(
      <CareerTimeline rows={[]} isLoading />,
    )
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument()

    rerender(
      <CareerTimeline
        rows={[]}
        isError
        errorMessage="Timeline failed"
        onRetry={onRetry}
      />,
    )
    expect(screen.getByText(/timeline failed/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /try again/i }))
    expect(onRetry).toHaveBeenCalled()

    rerender(<CareerTimeline rows={[]} isError />)
    expect(screen.getByText('Failed to load career timeline.')).toBeInTheDocument()

    rerender(<CareerTimeline rows={[]} />)
    expect(screen.getByText('No career data')).toBeInTheDocument()
  })

  it('renders club stints in chronological order with aggregated stats', () => {
    render(<CareerTimeline rows={rows} />)

    const timeline = screen.getByRole('list', { name: 'Career timeline' })
    const items = timeline.querySelectorAll('li')

    expect(items).toHaveLength(2)
    expect(screen.getByText('Manchester City')).toBeInTheDocument()
    expect(screen.getByText('Liverpool')).toBeInTheDocument()
    expect(screen.getByText('2022/23')).toBeInTheDocument()
    expect(screen.getByText('2023/24 – 2024/25')).toBeInTheDocument()
    expect(screen.getAllByText('Premier League')).toHaveLength(2)
    expect(screen.getByText('64')).toBeInTheDocument()
    expect(screen.getByText('38')).toBeInTheDocument()
    expect(screen.getByText('14')).toBeInTheDocument()
    expect(screen.getByAltText('Liverpool logo')).toBeInTheDocument()
    expect(screen.getByAltText('Manchester City logo')).toBeInTheDocument()
  })

  it('renders initials and unknown league when logo and league are missing', () => {
    const fallbackRows: PlayerSeasonHistoryRow[] = [
      {
        season: 2023,
        team: { id: 99, name: 'Arsenal', logo: '' },
        league: null,
        appearances: 25,
        goals: 10,
        assists: 4,
        minutes: 2200,
        yellowCards: 1,
        redCards: 0,
      },
    ]

    render(<CareerTimeline rows={fallbackRows} />)

    expect(screen.getByText('AR')).toBeInTheDocument()
    expect(screen.getByText('Unknown league')).toBeInTheDocument()
    expect(screen.queryByAltText('Arsenal logo')).not.toBeInTheDocument()
    expect(screen.getByText('Arsenal')).toBeInTheDocument()
    expect(screen.getByText('2023/24')).toBeInTheDocument()
    expect(screen.getByText('25')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByText('4')).toBeInTheDocument()
  })

  it('renders a single stint as the last timeline item without a connector line', () => {
    const singleStintRows: PlayerSeasonHistoryRow[] = [
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
    ]

    const { container } = render(<CareerTimeline rows={singleStintRows} />)

    const timeline = screen.getByRole('list', { name: 'Career timeline' })
    expect(timeline.querySelectorAll('li')).toHaveLength(1)

    const connector = container.querySelector('.mt-1.w-px.flex-1.bg-border')
    expect(connector).not.toBeInTheDocument()

    const lastDot = container.querySelector('.bg-primary-foreground')
    expect(lastDot).toBeInTheDocument()
  })
})
