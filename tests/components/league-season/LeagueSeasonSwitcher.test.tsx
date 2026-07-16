import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { LeagueSeasonSwitcher } from '@/components/league-season/LeagueSeasonSwitcher'
import { LeagueSeasonProvider } from '@/providers/LeagueSeasonProvider'

jest.mock('@tanstack/react-query', () => {
  const actual = jest.requireActual('@tanstack/react-query')
  return {
    ...actual,
    useIsFetching: jest.fn(() => 0),
  }
})

import { useIsFetching } from '@tanstack/react-query'

const mockedUseIsFetching = useIsFetching as jest.MockedFunction<
  typeof useIsFetching
>

function renderSwitcher(
  ui: ReactNode = <LeagueSeasonSwitcher showLabels />,
) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return render(
    <QueryClientProvider client={client}>
      <LeagueSeasonProvider initialLeagueId={39} initialSeason={2024}>
        {ui}
      </LeagueSeasonProvider>
    </QueryClientProvider>,
  )
}

describe('components/league-season/LeagueSeasonSwitcher', () => {
  beforeAll(() => {
    Element.prototype.hasPointerCapture ??= (() =>
      false) as typeof Element.prototype.hasPointerCapture
    Element.prototype.setPointerCapture ??= (() =>
      undefined) as typeof Element.prototype.setPointerCapture
    Element.prototype.releasePointerCapture ??= (() =>
      undefined) as typeof Element.prototype.releasePointerCapture
  })

  beforeEach(() => {
    localStorage.clear()
    mockedUseIsFetching.mockReturnValue(0)
  })

  it('renders league and season selects', () => {
    renderSwitcher()

    expect(screen.getByLabelText('League')).toBeInTheDocument()
    expect(screen.getByLabelText('Season')).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Select league' })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Select season' })).toBeInTheDocument()
  })

  it('changes league and season selections', async () => {
    const user = userEvent.setup()
    renderSwitcher()

    await user.click(screen.getByRole('combobox', { name: 'Select league' }))
    await user.click(await screen.findByRole('option', { name: 'La Liga' }))
    expect(screen.getByRole('combobox', { name: 'Select league' })).toHaveTextContent(
      'La Liga',
    )

    await user.click(screen.getByRole('combobox', { name: 'Select season' }))
    await user.click(await screen.findByRole('option', { name: '2022/23' }))
    expect(screen.getByRole('combobox', { name: 'Select season' })).toHaveTextContent(
      '2022/23',
    )
  })

  it('disables selects while queries are fetching', () => {
    mockedUseIsFetching.mockReturnValue(2)
    renderSwitcher(<LeagueSeasonSwitcher />)

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Select league' })).toBeDisabled()
    expect(screen.getByRole('combobox', { name: 'Select season' })).toBeDisabled()
    expect(
      screen.getByRole('combobox', { name: 'Select league' }).closest('[aria-busy]'),
    ).toHaveAttribute('aria-busy', 'true')
  })

  it('applies compact trigger sizing and custom className', () => {
    const { container } = renderSwitcher(
      <LeagueSeasonSwitcher size="compact" className="switcher-extra" />,
    )

    expect(container.firstChild).toHaveClass('switcher-extra')
    expect(screen.getByRole('combobox', { name: 'Select league' })).toHaveClass(
      'h-8',
      'min-w-[8.5rem]',
      'text-xs',
    )
    expect(screen.getByRole('combobox', { name: 'Select season' })).toHaveClass(
      'h-8',
      'min-w-[8.5rem]',
      'text-xs',
    )
    expect(screen.queryByText('League')).not.toBeInTheDocument()
    expect(screen.queryByText('Season')).not.toBeInTheDocument()
  })

  it('lists available leagues and seasons', async () => {
    const user = userEvent.setup()
    renderSwitcher()

    await user.click(screen.getByRole('combobox', { name: 'Select league' }))
    const leagueList = await screen.findByRole('listbox')
    expect(within(leagueList).getByRole('option', { name: 'Serie A' })).toBeInTheDocument()
    expect(
      within(leagueList).getByRole('option', { name: 'Bundesliga' }),
    ).toBeInTheDocument()

    await user.keyboard('{Escape}')
    await user.click(screen.getByRole('combobox', { name: 'Select season' }))
    const seasonList = await screen.findByRole('listbox')
    expect(
      within(seasonList).getByRole('option', { name: '2024/25' }),
    ).toBeInTheDocument()
    expect(
      within(seasonList).getByRole('option', { name: '2023/24' }),
    ).toBeInTheDocument()
  })
})
