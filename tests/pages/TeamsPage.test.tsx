import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { TeamsPage } from '@/pages/TeamsPage'
import { createTeam } from '../fixtures/players'

jest.mock('@/hooks/use-page-meta', () => ({
  usePageMeta: jest.fn(),
}))

jest.mock('@/hooks/use-teams', () => ({
  useTeams: jest.fn(),
}))

import { useTeams } from '@/hooks/use-teams'

const mockedUseTeams = useTeams as jest.MockedFunction<typeof useTeams>

function mockTeams(partial: Partial<ReturnType<typeof useTeams>> = {}) {
  mockedUseTeams.mockReturnValue({
    teams: [],
    paging: undefined,
    results: 0,
    isLoading: false,
    isError: false,
    error: null,
    errorMessage: null,
    refetch: jest.fn(),
    isFetching: false,
    ...partial,
  } as ReturnType<typeof useTeams>)
}

function renderTeamsPage() {
  return render(
    <MemoryRouter>
      <TeamsPage />
    </MemoryRouter>,
  )
}

describe('pages/TeamsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('shows a loading skeleton while teams load', () => {
    mockTeams({ isLoading: true })

    const { container } = renderTeamsPage()

    expect(screen.getByText('Loading teams…')).toBeInTheDocument()
    expect(container.querySelector('.animate-pulse')).toBeTruthy()
  })

  it('shows an error state with retry', async () => {
    const user = userEvent.setup()
    const refetch = jest.fn()
    mockTeams({
      isError: true,
      errorMessage: 'Teams unavailable',
      refetch,
    })

    renderTeamsPage()

    expect(screen.getByText('Teams unavailable')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /try again/i }))
    expect(refetch).toHaveBeenCalled()
  })

  it('renders teams and filters by club name or city', async () => {
    const user = userEvent.setup()
    mockTeams({
      teams: [
        {
          ...createTeam({ id: 40, name: 'Liverpool' }),
          venue: {
            id: 1,
            name: 'Anfield',
            address: 'Anfield Road',
            city: 'Liverpool',
            capacity: 61000,
            surface: 'grass',
            image: null,
          },
        },
        {
          ...createTeam({ id: 33, name: 'Manchester United' }),
          venue: {
            id: 2,
            name: 'Old Trafford',
            address: 'Sir Matt Busby Way',
            city: 'Manchester',
            capacity: 74000,
            surface: 'grass',
            image: null,
          },
        },
        {
          ...createTeam({ id: 50, name: 'Arsenal' }),
          venue: null,
        },
      ],
      results: 3,
    })

    renderTeamsPage()

    expect(screen.getByRole('heading', { name: 'Teams' })).toBeInTheDocument()
    expect(screen.getByText('3 teams')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /Liverpool/i }),
    ).toHaveAttribute('href', '/teams/40')
    expect(
      screen.getByRole('link', { name: /Manchester United/i }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Arsenal/i })).toBeInTheDocument()

    await user.type(
      screen.getByRole('searchbox', { name: /search teams/i }),
      'manches',
    )

    expect(screen.getByText('1 team matching your search')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /Manchester United/i }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: /Liverpool/i }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: /Arsenal/i }),
    ).not.toBeInTheDocument()
  })


  it('shows a singular team count and filters teams without a city', async () => {
    const user = userEvent.setup()
    mockTeams({
      teams: [
        {
          ...createTeam({ id: 40, name: 'Liverpool' }),
          venue: {
            id: 1,
            name: 'Anfield',
            address: 'Anfield Road',
            city: null as unknown as string,
            capacity: 61000,
            surface: 'grass',
            image: null,
          },
        },
      ],
      results: 1,
    })

    renderTeamsPage()

    expect(screen.getByText('1 team')).toBeInTheDocument()

    await user.type(
      screen.getByRole('searchbox', { name: /search teams/i }),
      'zzzz',
    )

    expect(screen.getByText('No teams found')).toBeInTheDocument()
    expect(
      screen.getByText('Try a different club name or city.'),
    ).toBeInTheDocument()
  })


  it('shows a generic empty state when no teams are available', () => {
    mockTeams({ teams: [], results: 0 })

    renderTeamsPage()

    expect(screen.getByText('No teams found')).toBeInTheDocument()
    expect(
      screen.getByText('Teams will appear here once data is available.'),
    ).toBeInTheDocument()
  })

  it('falls back to a default error message when none is provided', () => {
    mockTeams({
      isError: true,
      errorMessage: null,
    })

    renderTeamsPage()

    expect(screen.getByText('Failed to load teams.')).toBeInTheDocument()
  })
})
