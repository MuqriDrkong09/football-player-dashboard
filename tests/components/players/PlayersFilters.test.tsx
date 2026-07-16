import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  PlayersFilters,
  type PlayersFilterState,
} from '@/components/players/PlayersFilters'
import { createPlayerProfile, createTeam } from '../../fixtures/players'
import type { PlayerProfile } from '@/types/api-football'

const selectedProfile = createPlayerProfile({
  player: { id: 11, name: 'Selected Player' },
})

jest.mock('@/components/search', () => ({
  Search: ({
    value,
    onValueChange,
    onSelect,
    team,
    placeholder,
    'aria-label': ariaLabel,
  }: {
    value: string
    onValueChange: (value: string) => void
    onSelect: (profile: PlayerProfile) => void
    team?: number
    placeholder?: string
    'aria-label'?: string
  }) => (
    <div>
      <input
        aria-label={ariaLabel}
        placeholder={placeholder}
        value={value}
        data-team={team ?? ''}
        onChange={(event) => onValueChange(event.target.value)}
      />
      <button type="button" onClick={() => onSelect(selectedProfile)}>
        Pick suggestion
      </button>
    </div>
  ),
}))

const INITIAL_FILTERS: PlayersFilterState = {
  search: '',
  position: 'all',
  nationality: 'all',
  teamId: 'all',
}

function renderFilters(
  overrides: {
    filters?: Partial<PlayersFilterState>
    nationalities?: string[]
    teams?: ReturnType<typeof createTeam>[]
    isTeamsLoading?: boolean
    onSearchChange?: jest.Mock
    onPlayerSelect?: jest.Mock
    onPositionChange?: jest.Mock
    onNationalityChange?: jest.Mock
    onTeamChange?: jest.Mock
    onClearFilters?: jest.Mock
  } = {},
) {
  const props = {
    filters: { ...INITIAL_FILTERS, ...overrides.filters },
    nationalities: overrides.nationalities ?? ['England', 'Brazil'],
    teams: overrides.teams ?? [
      createTeam({ id: 40, name: 'Liverpool' }),
      createTeam({ id: 33, name: 'Manchester United' }),
    ],
    isTeamsLoading: overrides.isTeamsLoading ?? false,
    onSearchChange: overrides.onSearchChange ?? jest.fn(),
    onPlayerSelect: overrides.onPlayerSelect ?? jest.fn(),
    onPositionChange: overrides.onPositionChange ?? jest.fn(),
    onNationalityChange: overrides.onNationalityChange ?? jest.fn(),
    onTeamChange: overrides.onTeamChange ?? jest.fn(),
    onClearFilters: overrides.onClearFilters ?? jest.fn(),
  }

  const view = render(<PlayersFilters {...props} />)
  return { ...view, props }
}

describe('components/players/PlayersFilters', () => {
  beforeAll(() => {
    // Radix Select requires pointer capture APIs that jsdom does not implement.
    Element.prototype.hasPointerCapture ??= (() =>
      false) as typeof Element.prototype.hasPointerCapture
    Element.prototype.setPointerCapture ??= (() =>
      undefined) as typeof Element.prototype.setPointerCapture
    Element.prototype.releasePointerCapture ??= (() =>
      undefined) as typeof Element.prototype.releasePointerCapture
  })

  it('renders the heading and inactive filters without a clear button', () => {
    renderFilters()

    expect(
      screen.getByRole('heading', { name: 'Players' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Search and filter players from the Premier League/i),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /clear filters/i }),
    ).not.toBeInTheDocument()
  })

  it('forwards search changes and player selection', async () => {
    const user = userEvent.setup()
    const onSearchChange = jest.fn()
    const onPlayerSelect = jest.fn()

    renderFilters({ onSearchChange, onPlayerSelect })

    const search = screen.getByRole('textbox', {
      name: 'Search players by name',
    })
    expect(search).toHaveAttribute(
      'placeholder',
      'Search by player name (min. 3 characters)…',
    )
    expect(search).toHaveAttribute('data-team', '')

    await user.type(search, 'sal')
    expect(onSearchChange).toHaveBeenCalled()
    expect(onSearchChange.mock.calls.map((call) => call[0])).toEqual([
      's',
      'a',
      'l',
    ])

    await user.click(screen.getByRole('button', { name: 'Pick suggestion' }))
    expect(onPlayerSelect).toHaveBeenCalledWith(selectedProfile)
  })

  it('passes the selected team id into search when a team filter is active', () => {
    renderFilters({ filters: { teamId: '40' } })

    expect(
      screen.getByRole('textbox', { name: 'Search players by name' }),
    ).toHaveAttribute('data-team', '40')
    expect(
      screen.getByRole('button', { name: /clear filters/i }),
    ).toBeInTheDocument()
  })

  it('shows the clear button for each active filter type and clears on click', async () => {
    const user = userEvent.setup()
    const onClearFilters = jest.fn()

    const { rerender, props } = renderFilters({
      filters: { search: 'salah' },
      onClearFilters,
    })
    expect(
      screen.getByRole('button', { name: /clear filters/i }),
    ).toBeInTheDocument()

    rerender(
      <PlayersFilters
        {...props}
        filters={{ ...INITIAL_FILTERS, position: 'Attacker' }}
      />,
    )
    expect(
      screen.getByRole('button', { name: /clear filters/i }),
    ).toBeInTheDocument()

    rerender(
      <PlayersFilters
        {...props}
        filters={{ ...INITIAL_FILTERS, nationality: 'England' }}
      />,
    )
    expect(
      screen.getByRole('button', { name: /clear filters/i }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /clear filters/i }))
    expect(onClearFilters).toHaveBeenCalled()
  })

  it('changes position, nationality, and team filters', async () => {
    const user = userEvent.setup()
    const onPositionChange = jest.fn()
    const onNationalityChange = jest.fn()
    const onTeamChange = jest.fn()

    renderFilters({
      onPositionChange,
      onNationalityChange,
      onTeamChange,
    })

    await user.click(screen.getByRole('combobox', { name: 'Position' }))
    await user.click(await screen.findByRole('option', { name: 'Midfielder' }))
    expect(onPositionChange).toHaveBeenCalledWith('Midfielder')

    await user.click(screen.getByRole('combobox', { name: 'Nationality' }))
    await user.click(await screen.findByRole('option', { name: 'Brazil' }))
    expect(onNationalityChange).toHaveBeenCalledWith('Brazil')

    await user.click(screen.getByRole('combobox', { name: 'Team' }))
    await user.click(await screen.findByRole('option', { name: 'Liverpool' }))
    expect(onTeamChange).toHaveBeenCalledWith('40')
  })

  it('disables the team filter while teams are loading', () => {
    renderFilters({ isTeamsLoading: true })

    expect(screen.getByRole('combobox', { name: 'Team' })).toBeDisabled()
  })

  it('lists all positions and provided nationality and team options', async () => {
    const user = userEvent.setup()
    renderFilters()

    await user.click(screen.getByRole('combobox', { name: 'Position' }))
    const positionList = await screen.findByRole('listbox')
    expect(
      within(positionList).getByRole('option', { name: 'All positions' }),
    ).toBeInTheDocument()
    expect(
      within(positionList).getByRole('option', { name: 'Goalkeeper' }),
    ).toBeInTheDocument()
    expect(
      within(positionList).getByRole('option', { name: 'Defender' }),
    ).toBeInTheDocument()
    expect(
      within(positionList).getByRole('option', { name: 'Attacker' }),
    ).toBeInTheDocument()

    await user.keyboard('{Escape}')

    await user.click(screen.getByRole('combobox', { name: 'Nationality' }))
    expect(
      await screen.findByRole('option', { name: 'All nationalities' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'England' })).toBeInTheDocument()

    await user.keyboard('{Escape}')

    await user.click(screen.getByRole('combobox', { name: 'Team' }))
    expect(
      await screen.findByRole('option', { name: 'All teams' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('option', { name: 'Manchester United' }),
    ).toBeInTheDocument()
  })
})
