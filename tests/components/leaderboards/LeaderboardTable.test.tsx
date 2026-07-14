import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactElement } from 'react'
import { MemoryRouter } from 'react-router-dom'
import {
  getCellValue,
  getNumericValue,
  LeaderboardTable,
} from '@/components/leaderboards/LeaderboardTable'
import type { LeaderboardRow, LeaderboardSortKey } from '@/utils/leaderboard'

jest.mock('@/lib/notify', () => ({
  notify: {
    error: jest.fn(),
    success: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
  },
}))

const rows: LeaderboardRow[] = [
  {
    rank: 1,
    playerId: 1,
    name: 'Alpha',
    photo: 'alpha.png',
    teamName: 'Team A',
    teamLogo: 'team-a.png',
    position: 'Attacker',
    nationality: 'England',
    goals: 5,
    assists: 1,
    yellowCards: 2,
    redCards: 1,
    matches: 10,
    minutes: 900,
  },
  {
    rank: 2,
    playerId: 2,
    name: 'Beta',
    photo: 'beta.png',
    teamName: 'Team B',
    teamLogo: null,
    position: 'Midfielder',
    nationality: 'Spain',
    goals: 12,
    assists: 4,
    yellowCards: 1,
    redCards: 0,
    matches: 12,
    minutes: 1000,
  },
]

const sparseRow: LeaderboardRow = {
  rank: 3,
  playerId: 3,
  name: 'Gamma',
  photo: '',
  teamName: null,
  teamLogo: null,
  position: null,
  nationality: null,
  goals: 0,
  assists: 0,
  yellowCards: 0,
  redCards: 0,
  matches: 0,
  minutes: 0,
}

function renderTable(
  ui: ReactElement = <LeaderboardTable rows={rows} primaryStat="goals" />,
) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

describe('components/leaderboards/LeaderboardTable', () => {
  describe('getCellValue / getNumericValue', () => {
    it('formats every supported cell key and falls back for unknowns', () => {
      expect(getCellValue(rows[0], 'name')).toBe('Alpha')
      expect(getCellValue(rows[0], 'team')).toBe('Team A')
      expect(getCellValue(sparseRow, 'team')).toBe('—')
      expect(getCellValue(rows[0], 'position')).toBe('Attacker')
      expect(getCellValue(sparseRow, 'position')).toBe('—')
      expect(getCellValue(rows[0], 'nationality')).toBe('England')
      expect(getCellValue(sparseRow, 'nationality')).toBe('—')
      expect(getCellValue(rows[0], 'matches')).toBe('10')
      expect(getCellValue(rows[0], 'minutes')).toBe((900).toLocaleString())
      expect(getCellValue(rows[0], 'goals')).toBe('5')
      expect(getCellValue(rows[0], 'assists')).toBe('1')
      expect(getCellValue(rows[0], 'yellowCards')).toBe('2')
      expect(getCellValue(rows[0], 'redCards')).toBe('1')
      expect(
        getCellValue(rows[0], 'not-a-key' as LeaderboardSortKey),
      ).toBe('—')
      expect(getNumericValue(rows[0], 'goals')).toBe(5)
      expect(getNumericValue(rows[0], 'assists')).toBe(1)
    })
  })

  it('renders player rows with team logos, badges, and detail links', () => {
    renderTable()

    expect(screen.getByRole('link', { name: 'Alpha' })).toHaveAttribute(
      'href',
      '/players/1',
    )
    expect(screen.getByText('Team A')).toBeInTheDocument()
    expect(document.querySelector('.bg-pitch')).toHaveTextContent('12')
    expect(document.querySelector('img[src="team-a.png"]')).toBeInTheDocument()
  })

  it('shows empty state messaging', () => {
    renderTable(
      <LeaderboardTable
        rows={[]}
        primaryStat="goals"
        emptyMessage="Custom empty"
      />,
    )

    expect(screen.getByText('Custom empty')).toBeInTheDocument()
  })

  it('shows the default empty message when none is provided', () => {
    renderTable(<LeaderboardTable rows={[]} primaryStat="goals" />)

    expect(
      screen.getByText('No players found for this leaderboard.'),
    ).toBeInTheDocument()
  })

  it('renders loading and error states, including the default error message', () => {
    const onRetry = jest.fn()
    const { container, rerender } = render(
      <LeaderboardTable rows={[]} primaryStat="goals" isLoading />,
    )

    expect(container.querySelector('table')).toBeInTheDocument()

    rerender(
      <MemoryRouter>
        <LeaderboardTable
          rows={[]}
          primaryStat="goals"
          isError
          errorMessage="Leaderboard failed"
          onRetry={onRetry}
          isRetrying
        />
      </MemoryRouter>,
    )
    expect(screen.getByText('Leaderboard failed')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Try again' })).toBeDisabled()

    rerender(
      <MemoryRouter>
        <LeaderboardTable rows={[]} primaryStat="goals" isError />
      </MemoryRouter>,
    )
    expect(screen.getByText('Failed to load leaderboard.')).toBeInTheDocument()
  })

  it('toggles sort direction and switches sort keys', async () => {
    const user = userEvent.setup()
    renderTable()

    const goalsHeader = screen
      .getByRole('button', { name: 'Sort by Goals' })
      .closest('th')
    expect(goalsHeader).toHaveAttribute('aria-sort', 'descending')

    await user.click(screen.getByRole('button', { name: 'Sort by Goals' }))
    expect(goalsHeader).toHaveAttribute('aria-sort', 'ascending')

    await user.click(screen.getByRole('button', { name: 'Sort by Goals' }))
    expect(goalsHeader).toHaveAttribute('aria-sort', 'descending')

    await user.click(screen.getByRole('button', { name: 'Sort by Player' }))
    expect(
      screen.getByRole('button', { name: 'Sort by Player' }).closest('th'),
    ).toHaveAttribute('aria-sort', 'ascending')

    await user.click(screen.getByRole('button', { name: 'Sort by Team' }))
    expect(
      screen.getByRole('button', { name: 'Sort by Team' }).closest('th'),
    ).toHaveAttribute('aria-sort', 'ascending')

    await user.click(screen.getByRole('button', { name: 'Sort by Assists' }))
    expect(
      screen.getByRole('button', { name: 'Sort by Assists' }).closest('th'),
    ).toHaveAttribute('aria-sort', 'descending')
  })

  it('resets sorting when primaryStat changes', async () => {
    const user = userEvent.setup()
    const { rerender } = renderTable()

    await user.click(screen.getByRole('button', { name: 'Sort by Player' }))
    expect(
      screen.getByRole('button', { name: 'Sort by Player' }).closest('th'),
    ).toHaveAttribute('aria-sort', 'ascending')

    rerender(
      <MemoryRouter>
        <LeaderboardTable rows={rows} primaryStat="assists" />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('button', { name: 'Sort by Assists' }).closest('th'),
    ).toHaveAttribute('aria-sort', 'descending')
  })

  it('renders sparse nullable fields with dashes', () => {
    renderTable(
      <LeaderboardTable rows={[sparseRow]} primaryStat="yellowCards" />,
    )

    expect(screen.getAllByText('—').length).toBeGreaterThan(0)
    expect(document.querySelector('.bg-pitch')).toHaveTextContent('0')
  })
})
