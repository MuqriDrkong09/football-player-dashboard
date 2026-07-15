import { render, screen } from '@testing-library/react'
import type { ComponentProps } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { TeamInfoSection } from '@/components/team-detail/TeamInfoSection'
import { LEAGUE_LABEL, formatSeasonLabel } from '@/config/football'
import type { Coach, Team } from '@/types/api-football'
import { createTeam } from '../../fixtures/players'

function renderSection(
  props: Partial<ComponentProps<typeof TeamInfoSection>> & {
    season?: number
  } = {},
) {
  const {
    team = createTeam({
      id: 40,
      name: 'Liverpool',
      country: 'England',
      founded: 1892,
    }),
    coach = null,
    leagueName = 'Premier League',
    season = 2024,
    isLoading,
    isCoachLoading,
  } = props

  return render(
    <MemoryRouter>
      <TeamInfoSection
        team={team}
        coach={coach}
        leagueName={leagueName}
        season={season}
        isLoading={isLoading}
        isCoachLoading={isCoachLoading}
      />
    </MemoryRouter>,
  )
}

function createCoach(overrides: Partial<Coach> = {}): Coach {
  return {
    id: 1,
    name: 'Arne Slot',
    firstname: 'Arne',
    lastname: 'Slot',
    age: 46,
    nationality: 'Netherlands',
    photo: 'https://example.com/coach.png',
    team: { id: 40, name: 'Liverpool', logo: '' },
    career: [],
    ...overrides,
  }
}

describe('components/team-detail/TeamInfoSection', () => {
  it('returns null when there is no team and loading is finished', () => {
    const { container } = renderSection({ team: null })
    expect(container).toBeEmptyDOMElement()
  })

  it('renders loading skeletons when team data is pending', () => {
    const { container } = renderSection({ team: null, isLoading: true })
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(
      0,
    )
  })

  it('renders team profile details, default league fallback, and stadium image', () => {
    const team: Team = {
      ...createTeam({
        id: 40,
        name: 'Liverpool',
        country: 'England',
        founded: 1892,
      }),
      venue: {
        id: 1,
        name: 'Anfield',
        address: null,
        city: 'Liverpool',
        capacity: 61276,
        surface: 'grass',
        image: 'https://example.com/anfield.png',
      },
    }

    renderSection({ team, leagueName: null, coach: createCoach() })

    expect(
      screen.getByRole('link', { name: /back to dashboard/i }),
    ).toHaveAttribute('href', '/')
    expect(screen.getAllByText(LEAGUE_LABEL).length).toBeGreaterThanOrEqual(1)
    expect(screen.getByRole('img', { name: 'Liverpool' })).toHaveAttribute(
      'src',
      'https://example.com/team.png',
    )
    expect(screen.getAllByText('England').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Founded 1892')).toBeInTheDocument()
    expect(screen.getByText(formatSeasonLabel(2024))).toBeInTheDocument()
    expect(screen.getByText('61,276')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Anfield' })).toHaveAttribute(
      'src',
      'https://example.com/anfield.png',
    )
    expect(screen.getByText(/Capacity 61,276 · grass/)).toBeInTheDocument()
    expect(screen.getByText('Arne Slot')).toBeInTheDocument()
    expect(screen.getByText('Netherlands · 46 yrs')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Arne Slot' })).toHaveAttribute(
      'src',
      'https://example.com/coach.png',
    )
  })

  it('shows coach skeleton while coach data is loading', () => {
    const { container } = renderSection({
      isCoachLoading: true,
      coach: null,
    })

    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(
      0,
    )
    expect(screen.queryByText('Arne Slot')).not.toBeInTheDocument()
  })

  it('builds coach name from first and last name and supports age-only subtitle', () => {
    renderSection({
      coach: createCoach({
        name: null,
        firstname: 'Jurgen',
        lastname: 'Klopp',
        nationality: null,
        age: 57,
        photo: null,
      }),
    })

    expect(screen.getByText('Jurgen Klopp')).toBeInTheDocument()
    expect(screen.getByText('57 yrs')).toBeInTheDocument()
  })

  it('shows nationality without age and a photo placeholder', () => {
    renderSection({
      coach: createCoach({
        name: 'Pep Guardiola',
        nationality: 'Spain',
        age: null,
        photo: null,
      }),
    })

    expect(screen.getByText('Pep Guardiola')).toBeInTheDocument()
    expect(screen.getByText('Spain')).toBeInTheDocument()
  })

  it('falls back to Head coach when nationality and age are missing', () => {
    renderSection({
      coach: createCoach({
        name: 'Mystery Manager',
        nationality: null,
        age: null,
        photo: null,
      }),
    })

    expect(screen.getByText('Mystery Manager')).toBeInTheDocument()
    expect(screen.getByText('Head coach')).toBeInTheDocument()
  })

  it('shows an empty coach message when no coach is available', () => {
    renderSection({ coach: null })

    expect(
      screen.getByText('Coach information is not available for this team.'),
    ).toBeInTheDocument()
  })

  it('handles missing country, founded, stadium image, and capacity', () => {
    const team: Team = {
      team: {
        id: 99,
        name: 'Sparse FC',
        logo: 'https://example.com/sparse.png',
        country: null,
        founded: null,
      },
      venue: {
        id: null,
        name: null,
        address: null,
        city: null,
        capacity: null,
        surface: null,
        image: null,
      },
    }

    renderSection({ team, leagueName: 'Championship' })

    expect(screen.getByText('Sparse FC')).toBeInTheDocument()
    expect(screen.getAllByText('Championship').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Venue details unavailable')).toBeInTheDocument()
    expect(screen.getByText('No stadium image available')).toBeInTheDocument()
    expect(screen.getAllByText('—').length).toBeGreaterThan(0)
    expect(screen.queryByText(/Founded \d/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Capacity \d/)).not.toBeInTheDocument()
  })

  it('uses a generated stadium image alt and omits surface when missing', () => {
    const team: Team = {
      ...createTeam({ name: 'Surfaceless United' }),
      venue: {
        id: 2,
        name: null,
        address: null,
        city: 'London',
        capacity: 50000,
        surface: null,
        image: 'https://example.com/ground.png',
      },
    }

    renderSection({ team })

    expect(
      screen.getByRole('img', { name: 'Surfaceless United stadium' }),
    ).toHaveAttribute('src', 'https://example.com/ground.png')
    expect(screen.getByText('Capacity 50,000')).toBeInTheDocument()
    expect(screen.queryByText(/ · /)).not.toBeInTheDocument()
  })
})
