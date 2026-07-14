import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { useTeams } from '@/hooks/use-teams'
import { usePlayerSeasons } from '@/hooks/use-player-seasons'
import { usePlayerSearch } from '@/hooks/use-player-search'
import { createTeam, createPlayerProfile } from '../fixtures/players'

jest.mock('@/services/teams.service', () => ({
  getTeams: jest.fn(),
}))

jest.mock('@/services/players.service', () => ({
  getPlayerSeasons: jest.fn(),
  searchPlayers: jest.fn(),
}))

import { getTeams } from '@/services/teams.service'
import { getPlayerSeasons, searchPlayers } from '@/services/players.service'

const mockedGetTeams = getTeams as jest.MockedFunction<typeof getTeams>
const mockedGetPlayerSeasons = getPlayerSeasons as jest.MockedFunction<
  typeof getPlayerSeasons
>
const mockedSearchPlayers = searchPlayers as jest.MockedFunction<
  typeof searchPlayers
>

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
  }
}

describe('hooks/useTeams', () => {
  it('returns teams from the service', async () => {
    mockedGetTeams.mockResolvedValueOnce({
      data: [createTeam({ id: 40, name: 'Liverpool' })],
      results: 1,
      paging: { current: 1, total: 1 },
    })

    const { result } = renderHook(
      () => useTeams({ league: 39, season: 2024 }),
      { wrapper: createWrapper() },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.teams[0].team.name).toBe('Liverpool')
  })
})

describe('hooks/usePlayerSeasons', () => {
  it('returns available seasons', async () => {
    mockedGetPlayerSeasons.mockResolvedValueOnce([2022, 2023, 2024])

    const { result } = renderHook(() => usePlayerSeasons({ player: 11 }), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.seasons).toEqual([2022, 2023, 2024])
  })
})

describe('hooks/usePlayerSearch', () => {
  beforeEach(() => {
    mockedSearchPlayers.mockReset()
  })

  it('does not search until the minimum characters are met', () => {
    const { result } = renderHook(
      () =>
        usePlayerSearch(
          { search: 'ab', league: 39, season: 2024 },
          { minChars: 3 },
        ),
      { wrapper: createWrapper() },
    )

    expect(result.current.fetchStatus).toBe('idle')
    expect(mockedSearchPlayers).not.toHaveBeenCalled()
  })

  it('searches when enough characters are provided', async () => {
    mockedSearchPlayers.mockResolvedValueOnce({
      data: [createPlayerProfile({ player: { name: 'Salah' } })],
      results: 1,
      paging: { current: 1, total: 1 },
    })

    const { result } = renderHook(
      () =>
        usePlayerSearch({ search: 'sal', league: 39, season: 2024 }),
      { wrapper: createWrapper() },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.players[0].player.name).toBe('Salah')
  })
})
