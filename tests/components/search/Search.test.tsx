import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Search } from '@/components/search/Search'
import {
  createPlayerProfile,
  createStatistics,
} from '../../fixtures/players'

jest.mock('@/hooks/use-debounce', () => ({
  useDebounce: jest.fn((value: string) => value),
}))

jest.mock('@/hooks/use-player-search', () => ({
  usePlayerSearch: jest.fn(),
}))

import { useDebounce } from '@/hooks/use-debounce'
import { usePlayerSearch } from '@/hooks/use-player-search'

const mockedUseDebounce = useDebounce as jest.MockedFunction<typeof useDebounce>
const mockedUsePlayerSearch = usePlayerSearch as jest.MockedFunction<
  typeof usePlayerSearch
>

function mockSearch(
  partial: Partial<ReturnType<typeof usePlayerSearch>> = {},
) {
  mockedUsePlayerSearch.mockReturnValue({
    players: [],
    isLoading: false,
    isFetching: false,
    isError: false,
    errorMessage: null,
    refetch: jest.fn(),
    ...partial,
  } as ReturnType<typeof usePlayerSearch>)
}

describe('components/search/Search', () => {
  beforeEach(() => {
    mockedUseDebounce.mockImplementation((value) => value)
    mockSearch()
    Element.prototype.scrollIntoView = jest.fn()
  })

  it('renders with accessible defaults and custom chrome props', () => {
    render(
      <Search
        id="player-search"
        name="q"
        placeholder="Find talent"
        aria-label="Find players"
        className="wrapper"
        inputClassName="input-extra"
        autoFocus
      />,
    )

    const input = screen.getByRole('combobox', { name: 'Find players' })
    expect(input).toHaveAttribute('id', 'player-search')
    expect(input).toHaveAttribute('name', 'q')
    expect(input).toHaveAttribute('placeholder', 'Find talent')
    expect(input).toHaveClass('input-extra')
    expect(input.parentElement?.parentElement).toHaveClass('wrapper')
  })

  it('supports controlled values and onValueChange', async () => {
    const user = userEvent.setup()
    const onValueChange = jest.fn()

    const { rerender } = render(
      <Search value="sa" onValueChange={onValueChange} minChars={1} />,
    )

    expect(screen.getByRole('combobox')).toHaveValue('sa')
    await user.type(screen.getByRole('combobox'), 'k')
    expect(onValueChange).toHaveBeenCalledWith('sak')

    rerender(
      <Search value="saka" onValueChange={onValueChange} minChars={1} />,
    )
    expect(screen.getByRole('combobox')).toHaveValue('saka')
  })

  it('shows the minimum characters hint while the dropdown is open', async () => {
    const user = userEvent.setup()
    render(<Search minChars={3} debounceMs={0} />)

    await user.type(screen.getByRole('combobox'), 'ab')
    expect(
      screen.getByText('Type at least 3 characters to search'),
    ).toBeInTheDocument()
  })

  it('shows searching and empty states', async () => {
    const user = userEvent.setup()
    mockSearch({ isLoading: true, players: [] })

    const { rerender } = render(<Search minChars={1} />)
    await user.type(screen.getByRole('combobox'), 'a')
    expect(screen.getByText('Searching players…')).toBeInTheDocument()
    expect(screen.getByText('Searching players')).toBeInTheDocument()

    mockSearch({ players: [] })
    rerender(<Search minChars={1} defaultValue="a" />)
    await user.click(screen.getByRole('combobox'))
    expect(await screen.findByText('No players found')).toBeInTheDocument()
  })

  it('shows the searching spinner while debouncing', async () => {
    const user = userEvent.setup()
    mockedUseDebounce.mockImplementation(() => '')

    render(<Search minChars={3} />)
    await user.type(screen.getByRole('combobox'), 'abc')

    expect(screen.getByText('Searching players')).toBeInTheDocument()
  })

  it('renders suggestions, meta text, and selects via click', async () => {
    const user = userEvent.setup()
    const onSelect = jest.fn()
    const profile = createPlayerProfile({
      player: { id: 9, name: 'Saka', nationality: 'England' },
      statistics: [
        createStatistics({
          team: { id: 42, name: 'Arsenal', logo: 'a.png' },
          games: {
            appearences: 10,
            lineups: 10,
            minutes: 900,
            number: 7,
            position: 'Attacker',
            rating: '7',
            captain: false,
          },
        }),
      ],
    })
    mockSearch({ players: [profile] })

    render(<Search onSelect={onSelect} minChars={1} />)
    await user.type(screen.getByRole('combobox'), 'Sak')

    expect(await screen.findByText('Saka')).toBeInTheDocument()
    expect(screen.getByText(/Arsenal · Attacker · England/)).toBeInTheDocument()

    await user.click(screen.getByText('Saka'))
    expect(onSelect).toHaveBeenCalledWith(profile)
    expect(screen.getByRole('combobox')).toHaveValue('Saka')
  })

  it('renders suggestions without meta when details are missing', async () => {
    const user = userEvent.setup()
    mockSearch({
      players: [
        createPlayerProfile({
          player: {
            id: 11,
            name: 'Mystery',
            nationality: null,
          },
          statistics: [],
        }),
      ],
    })

    render(<Search minChars={1} />)
    await user.type(screen.getByRole('combobox'), 'm')

    expect(await screen.findByText('Mystery')).toBeInTheDocument()
    expect(screen.queryByText('·')).not.toBeInTheDocument()
  })

  it('shows errors and retries via Try again', async () => {
    const user = userEvent.setup()
    const refetch = jest.fn()
    mockSearch({
      isError: true,
      errorMessage: 'Network down',
      refetch,
    })

    render(<Search minChars={1} />)
    await user.type(screen.getByRole('combobox'), 'x')
    expect(await screen.findByText('Network down')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Try again' }))
    expect(refetch).toHaveBeenCalled()
  })

  it('falls back to a default error message when none is provided', async () => {
    jest.useFakeTimers()
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    mockSearch({
      isError: true,
      errorMessage: null,
    })

    render(<Search minChars={1} defaultValue="x" />)
    await user.click(screen.getByRole('combobox'))

    expect(
      await screen.findByText('Failed to load suggestions'),
    ).toBeInTheDocument()

    jest.useRealTimers()
  })

  it('clears the query and refocuses the input', async () => {
    const user = userEvent.setup()
    render(<Search defaultValue="salah" minChars={1} />)

    const input = screen.getByRole('combobox')
    await user.click(input)
    await user.click(screen.getByRole('button', { name: 'Clear search' }))

    expect(input).toHaveValue('')
    expect(input).toHaveFocus()
  })

  it('hides the clear button while disabled', () => {
    render(<Search defaultValue="salah" disabled />)

    expect(screen.getByRole('combobox')).toBeDisabled()
    expect(
      screen.queryByRole('button', { name: 'Clear search' }),
    ).not.toBeInTheDocument()
  })

  it('supports keyboard navigation, selection, Escape, and Tab', async () => {
    const user = userEvent.setup()
    const onSelect = jest.fn()
    const players = [
      createPlayerProfile({ player: { id: 1, name: 'Alpha' } }),
      createPlayerProfile({ player: { id: 2, name: 'Beta' } }),
    ]
    mockSearch({ players })

    render(<Search onSelect={onSelect} minChars={1} />)
    const input = screen.getByRole('combobox')

    await user.type(input, 'a')
    expect(await screen.findByText('Alpha')).toBeInTheDocument()

    await user.keyboard('{ArrowDown}')
    expect(screen.getByRole('option', { name: /Alpha/ })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled()

    await user.keyboard('{ArrowDown}')
    expect(screen.getByRole('option', { name: /Beta/ })).toHaveAttribute(
      'aria-selected',
      'true',
    )

    await user.keyboard('{ArrowUp}')
    expect(screen.getByRole('option', { name: /Alpha/ })).toHaveAttribute(
      'aria-selected',
      'true',
    )

    await user.keyboard('{ArrowUp}')
    expect(screen.getByRole('option', { name: /Beta/ })).toHaveAttribute(
      'aria-selected',
      'true',
    )

    await user.keyboard('{Enter}')
    expect(onSelect).toHaveBeenCalledWith(players[1])
  })

  it('opens on ArrowDown when closed, and closes on Escape/Tab', async () => {
    const user = userEvent.setup()
    mockSearch({
      players: [createPlayerProfile({ player: { id: 1, name: 'Closed' } })],
    })

    render(<Search defaultValue="clo" minChars={1} />)
    const input = screen.getByRole('combobox')
    await user.click(input)

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()

    await user.keyboard('{ArrowDown}')
    expect(await screen.findByRole('listbox')).toBeInTheDocument()

    await user.keyboard('{Tab}')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('ignores arrow and enter handling when there are no suggestions', async () => {
    const user = userEvent.setup()
    mockSearch({ players: [] })

    render(<Search minChars={1} />)
    const input = screen.getByRole('combobox')
    await user.type(input, 'zzz')

    expect(await screen.findByText('No players found')).toBeInTheDocument()
    await user.keyboard('{ArrowDown}{ArrowUp}{Enter}')
    expect(screen.getByRole('combobox')).toHaveValue('zzz')
  })

  it('highlights options on mouse enter and prevents blur on mouse down', async () => {
    const user = userEvent.setup()
    const players = [
      createPlayerProfile({ player: { id: 1, name: 'Alpha' } }),
      createPlayerProfile({ player: { id: 2, name: 'Beta' } }),
    ]
    mockSearch({ players })

    render(<Search minChars={1} />)
    await user.type(screen.getByRole('combobox'), 'a')

    const beta = await screen.findByRole('option', { name: /Beta/ })
    await user.hover(beta)
    expect(beta).toHaveAttribute('aria-selected', 'true')
  })

  it('closes the dropdown shortly after blur', async () => {
    jest.useFakeTimers()
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    mockSearch({
      players: [createPlayerProfile({ player: { id: 1, name: 'Blur' } })],
    })

    render(<Search minChars={1} />)
    await user.type(screen.getByRole('combobox'), 'b')
    expect(await screen.findByRole('listbox')).toBeInTheDocument()

    screen.getByRole('combobox').blur()
    act(() => {
      jest.advanceTimersByTime(150)
    })

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    jest.useRealTimers()
  })

  it('passes team/league/season into the search hook and limits suggestions', async () => {
    const user = userEvent.setup()
    mockSearch({
      players: [
        createPlayerProfile({ player: { id: 1, name: 'One' } }),
        createPlayerProfile({ player: { id: 2, name: 'Two' } }),
        createPlayerProfile({ player: { id: 3, name: 'Three' } }),
      ],
    })

    render(
      <Search minChars={1} maxSuggestions={2} league={39} season={2024} team={42} />,
    )
    await user.type(screen.getByRole('combobox'), 't')

    expect(mockedUsePlayerSearch).toHaveBeenCalledWith(
      expect.objectContaining({
        search: 't',
        league: 39,
        season: 2024,
        team: 42,
        page: 1,
      }),
      expect.objectContaining({ minChars: 1 }),
    )

    expect(await screen.findByText('One')).toBeInTheDocument()
    expect(screen.getByText('Two')).toBeInTheDocument()
    expect(screen.queryByText('Three')).not.toBeInTheDocument()
  })
})
