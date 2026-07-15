import { render, screen } from '@testing-library/react'
import { TeamStatsSection } from '@/components/team-detail/TeamStatsSection'
import type { TeamSeasonStats } from '@/utils/team'

function createStats(
  overrides: Partial<TeamSeasonStats> = {},
): TeamSeasonStats {
  return {
    matchesPlayed: 34,
    wins: 22,
    draws: 7,
    losses: 5,
    goalsScored: 70,
    goalsConceded: 25,
    goalDifference: 45,
    position: 2,
    form: ['W', 'W', 'D', 'L', 'W'],
    leagueName: 'Premier League',
    ...overrides,
  }
}

describe('components/team-detail/TeamStatsSection', () => {
  it('renders loading skeletons', () => {
    const { container } = render(
      <TeamStatsSection stats={null} isLoading />,
    )

    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(
      0,
    )
  })

  it('returns null when there are no stats and loading is finished', () => {
    const { container } = render(<TeamStatsSection stats={null} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders season stats, positive goal difference, and form badges', () => {
    render(<TeamStatsSection stats={createStats()} />)

    expect(screen.getByText('Matches Played')).toBeInTheDocument()
    expect(screen.getByText('34')).toBeInTheDocument()
    expect(screen.getByText('Wins')).toBeInTheDocument()
    expect(screen.getByText('22')).toBeInTheDocument()
    expect(screen.getByText('Draws')).toBeInTheDocument()
    expect(screen.getByText('7')).toBeInTheDocument()
    expect(screen.getByText('Losses')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('Goals Scored')).toBeInTheDocument()
    expect(screen.getByText('70')).toBeInTheDocument()
    expect(screen.getByText('Goals Conceded')).toBeInTheDocument()
    expect(screen.getByText('25')).toBeInTheDocument()
    expect(screen.getByText('Goal Difference')).toBeInTheDocument()
    expect(screen.getByText('+45')).toBeInTheDocument()
    expect(screen.getByText('League Position')).toBeInTheDocument()
    expect(screen.getByText('#2')).toBeInTheDocument()

    expect(screen.getByText('Current Form')).toBeInTheDocument()
    expect(screen.getByText('Last 5 matches')).toBeInTheDocument()
    expect(screen.getAllByText('W')).toHaveLength(3)
    expect(screen.getByText('D')).toBeInTheDocument()
    expect(screen.getByText('L')).toBeInTheDocument()
  })

  it('formats missing position and non-positive goal difference', () => {
    render(
      <TeamStatsSection
        stats={createStats({
          position: null,
          goalDifference: -4,
          form: [],
        })}
      />,
    )

    expect(screen.getByText('—')).toBeInTheDocument()
    expect(screen.getByText('-4')).toBeInTheDocument()
    expect(
      screen.getByText('Recent form is not available for this season.'),
    ).toBeInTheDocument()
  })

  it('formats a zero goal difference without a plus sign', () => {
    render(
      <TeamStatsSection
        stats={createStats({ goalDifference: 0, form: ['X'] })}
      />,
    )

    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.getByText('X')).toBeInTheDocument()
    expect(screen.getByText('Last 1 matches')).toBeInTheDocument()
  })
})
