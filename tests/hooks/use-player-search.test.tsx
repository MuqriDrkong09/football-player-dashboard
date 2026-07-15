import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { usePlayerSearch } from '@/hooks/use-player-search'
import { createPlayerProfile } from '../fixtures/players'

jest.mock('@/services/players.service', () => ({
  searchPlayers: jest.fn(),
}))

import { searchPlayers } from '@/services/players.service'

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
    expect(result.current.players).toEqual([])
    expect(result.current.results).toBe(0)
    expect(result.current.paging).toBeUndefined()
    expect(result.current.errorMessage).toBeNull()
    expect(mockedSearchPlayers).not.toHaveBeenCalled()
  })

  it('respects enabled: false even when the query is long enough', () => {
    const { result } = renderHook(
      () =>
        usePlayerSearch(
          { search: 'salah', league: 39, season: 2024 },
          { enabled: false },
        ),
      { wrapper: createWrapper() },
    )

    expect(result.current.fetchStatus).toBe('idle')
    expect(mockedSearchPlayers).not.toHaveBeenCalled()
  })

  it('trims search input and returns players, paging, and results', async () => {
    mockedSearchPlayers.mockResolvedValueOnce({
      data: [createPlayerProfile({ player: { name: 'Salah' } })],
      results: 1,
      paging: { current: 1, total: 1 },
    })

    const { result } = renderHook(
      () =>
        usePlayerSearch({ search: '  sal  ', league: 39, season: 2024 }),
      { wrapper: createWrapper() },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockedSearchPlayers).toHaveBeenCalledWith({
      search: 'sal',
      league: 39,
      season: 2024,
    })
    expect(result.current.players[0]?.player.name).toBe('Salah')
    expect(result.current.results).toBe(1)
    expect(result.current.paging).toEqual({ current: 1, total: 1 })
    expect(result.current.isLoading).toBe(false)
    expect(result.current.isFetching).toBe(false)
    expect(result.current.isError).toBe(false)
    expect(result.current.errorMessage).toBeNull()
  })

  it('exposes a readable errorMessage when the search fails', async () => {
    mockedSearchPlayers.mockRejectedValueOnce(new Error('Network down'))

    const { result } = renderHook(
      () => usePlayerSearch({ search: 'sal', league: 39, season: 2024 }),
      { wrapper: createWrapper() },
    )

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.players).toEqual([])
    expect(result.current.error).toBeInstanceOf(Error)
    expect(result.current.errorMessage).toBe('Network down')
  })

  it('uses the default minChars of 3 when options are omitted', () => {
    const { result } = renderHook(
      () => usePlayerSearch({ search: 'ab', league: 39, season: 2024 }),
      { wrapper: createWrapper() },
    )

    expect(result.current.fetchStatus).toBe('idle')
    expect(mockedSearchPlayers).not.toHaveBeenCalled()
  })
})
