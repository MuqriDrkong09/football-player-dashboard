import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { TeamFixturesSection } from '@/components/team-detail/TeamFixturesSection'
import { createFixture } from '../../fixtures/fixtures'

jest.mock('@/hooks/use-team-fixtures', () => ({
  useTeamFixtures: jest.fn(),
}))

import { useTeamFixtures } from '@/hooks/use-team-fixtures'

const mockedUseTeamFixtures = useTeamFixtures as jest.MockedFunction<
  typeof useTeamFixtures
>

function mockFixtures(
  partial: Partial<ReturnType<typeof useTeamFixtures>> = {},
) {
  mockedUseTeamFixtures.mockReturnValue({
    upcoming: [],
    recent: [],
    isLoading: false,
    isFetching: false,
    isError: false,
    error: null,
    errorMessage: null,
    refetch: jest.fn(),
    ...partial,
  })
}

describe('components/team-detail/TeamFixturesSection', () => {
  beforeEach(() => {
    mockedUseTeamFixtures.mockReset()
  })

  it('shows loading and error states', async () => {
    const user = userEvent.setup()
    const refetch = jest.fn()

    mockFixtures({ isLoading: true })
    const { rerender } = render(
      <MemoryRouter>
        <TeamFixturesSection teamId={40} season={2024} league={39} />
      </MemoryRouter>,
    )

    mockFixtures({
      isError: true,
      errorMessage: 'Fixtures failed',
      refetch,
      isFetching: false,
    })
    rerender(
      <MemoryRouter>
        <TeamFixturesSection teamId={40} season={2024} league={39} />
      </MemoryRouter>,
    )

    expect(screen.getByText(/fixtures failed/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /try again/i }))
    expect(refetch).toHaveBeenCalled()
  })

  it('shows the default message when an error has no message', () => {
    mockFixtures({
      isError: true,
      errorMessage: null,
    })

    render(
      <MemoryRouter>
        <TeamFixturesSection teamId={40} season={2024} league={39} />
      </MemoryRouter>,
    )

    expect(screen.getByText('Failed to load fixtures.')).toBeInTheDocument()
  })

  it('shows empty state when both lists are empty', () => {
    mockFixtures()
    render(
      <MemoryRouter>
        <TeamFixturesSection teamId={40} season={2024} />
      </MemoryRouter>,
    )

    expect(screen.getByText('No fixtures')).toBeInTheDocument()
  })

  it('renders upcoming and recent fixture lists', () => {
    mockFixtures({
      upcoming: [createFixture({ id: 1, statusShort: 'NS' })],
      recent: [
        createFixture({
          id: 2,
          statusShort: 'FT',
          goals: { home: 1, away: 0 },
          home: { name: 'Arsenal' },
          away: { name: 'Chelsea' },
        }),
      ],
    })

    render(
      <MemoryRouter>
        <TeamFixturesSection teamId={40} season={2024} league={39} />
      </MemoryRouter>,
    )

    expect(screen.getByText('Upcoming matches')).toBeInTheDocument()
    expect(screen.getByText('Recent results')).toBeInTheDocument()
    expect(screen.getByText('Liverpool')).toBeInTheDocument()
    expect(screen.getByText('Arsenal')).toBeInTheDocument()
    expect(screen.getByText('1 – 0')).toBeInTheDocument()
  })

  it('shows list-level empty messages when one side has no fixtures', () => {
    mockFixtures({
      upcoming: [createFixture({ id: 1 })],
      recent: [],
    })

    render(
      <MemoryRouter>
        <TeamFixturesSection teamId={40} season={2024} />
      </MemoryRouter>,
    )

    expect(screen.getByText('No recent results')).toBeInTheDocument()
  })
})
