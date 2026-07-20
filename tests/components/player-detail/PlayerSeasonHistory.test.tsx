import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PlayerSeasonHistory } from '@/components/player-detail/PlayerSeasonHistory'
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
    team: null,
    league: null,
    appearances: 0,
    goals: 0,
    assists: 0,
    minutes: 0,
    yellowCards: 0,
    redCards: 0,
  },
  {
    season: 2022,
    team: { id: 50, name: 'Manchester City', logo: '' },
    league: { id: 39, name: 'Premier League', logo: '' },
    appearances: 28,
    goals: 15,
    assists: 6,
    minutes: 2400,
    yellowCards: 1,
    redCards: 0,
  },
]

describe('components/player-detail/PlayerSeasonHistory', () => {
  it('shows loading, error, and empty states', async () => {
    const user = userEvent.setup()
    const onRetry = jest.fn()

    const { rerender } = render(
      <PlayerSeasonHistory
        rows={[]}
        selectedSeason={null}
        onSeasonSelect={jest.fn()}
        isLoading
      />,
    )
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument()

    rerender(
      <PlayerSeasonHistory
        rows={[]}
        selectedSeason={null}
        onSeasonSelect={jest.fn()}
        isError
        errorMessage="History failed"
        onRetry={onRetry}
      />,
    )
    expect(screen.getByText(/history failed/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /try again/i }))
    expect(onRetry).toHaveBeenCalled()

    rerender(
      <PlayerSeasonHistory
        rows={[]}
        selectedSeason={null}
        onSeasonSelect={jest.fn()}
        isError
      />,
    )
    expect(screen.getByText('Failed to load season history.')).toBeInTheDocument()

    rerender(
      <PlayerSeasonHistory
        rows={[]}
        selectedSeason={null}
        onSeasonSelect={jest.fn()}
      />,
    )
    expect(screen.getByText('No season history')).toBeInTheDocument()
  })

  it('renders season rows and selects a season from the table', async () => {
    const user = userEvent.setup()
    const onSeasonSelect = jest.fn()

    render(
      <PlayerSeasonHistory
        rows={rows}
        selectedSeason={2024}
        onSeasonSelect={onSeasonSelect}
      />,
    )

    expect(screen.getAllByText('2024/25').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Liverpool').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Premier League').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Manchester City').length).toBeGreaterThan(0)
    expect(screen.getAllByText('20').length).toBeGreaterThan(0)
    expect(screen.getAllByText('—').length).toBeGreaterThan(0)
    expect(screen.queryByAltText('Manchester City logo')).not.toBeInTheDocument()

    await user.click(
      screen.getByRole('button', { name: 'View 2023/24 statistics' }),
    )
    expect(onSeasonSelect).toHaveBeenCalledWith(2023)
  })

  it('selects a season from the mobile list and via keyboard', async () => {
    const user = userEvent.setup()
    const onSeasonSelect = jest.fn()

    render(
      <PlayerSeasonHistory
        rows={rows}
        selectedSeason={2023}
        onSeasonSelect={onSeasonSelect}
      />,
    )

    const mobileButtons = screen.getAllByRole('button', { pressed: true })
    expect(mobileButtons.length).toBeGreaterThan(0)

    await user.click(screen.getAllByText('2024/25')[0]!)
    expect(onSeasonSelect).toHaveBeenCalledWith(2024)

    const tableRow = screen.getByRole('button', {
      name: 'View 2023/24 statistics',
    })
    tableRow.focus()
    await user.keyboard('{Enter}')
    expect(onSeasonSelect).toHaveBeenCalledWith(2023)

    await user.keyboard(' ')
    expect(onSeasonSelect).toHaveBeenCalledTimes(3)

    await user.keyboard('{ArrowDown}')
    expect(onSeasonSelect).toHaveBeenCalledTimes(3)
  })
})
