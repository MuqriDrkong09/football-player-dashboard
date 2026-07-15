import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { usePlayers } from '@/hooks/use-players'
import { createPlayerProfile } from '../fixtures/players'

jest.mock('@/services/players.service', () => ({
  getPlayers: jest.fn(),
}))

import { getPlayers } from '@/services/players.service'

const mockedGetPlayers = getPlayers as jest.MockedFunction<typeof getPlayers>

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

describe('hooks/usePlayers', () => {
  beforeEach(() => {
    mockedGetPlayers.mockReset()
  })

  it('returns empty defaults before data loads', () => {
    mockedGetPlayers.mockImplementation(
      () =>
        new Promise(() => {
          /* never resolves */
        }),
    )

    const { result } = renderHook(
      () => usePlayers({ league: 39, season: 2024, page: 1 }),
      { wrapper: createWrapper() },
    )

    expect(result.current.players).toEqual([])
    expect(result.current.results).toBe(0)
    expect(result.current.paging).toBeUndefined()
    expect(result.current.errorMessage).toBeNull()
  })

  it('returns players, paging, and results from the query', async () => {
    mockedGetPlayers.mockResolvedValueOnce({
      data: [createPlayerProfile({ player: { id: 3, name: 'Player Three' } })],
      results: 1,
      paging: { current: 1, total: 2 },
    })

    const { result } = renderHook(
      () => usePlayers({ league: 39, season: 2024, page: 1 }),
      { wrapper: createWrapper() },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockedGetPlayers).toHaveBeenCalledWith({
      league: 39,
      season: 2024,
      page: 1,
    })
    expect(result.current.players[0]?.player.name).toBe('Player Three')
    expect(result.current.results).toBe(1)
    expect(result.current.paging?.total).toBe(2)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.isError).toBe(false)
    expect(result.current.errorMessage).toBeNull()
  })

  it('keeps previous players visible while the next page loads', async () => {
    mockedGetPlayers
      .mockResolvedValueOnce({
        data: [createPlayerProfile({ player: { id: 1, name: 'Page One' } })],
        results: 1,
        paging: { current: 1, total: 2 },
      })
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                data: [
                  createPlayerProfile({ player: { id: 2, name: 'Page Two' } }),
                ],
                results: 1,
                paging: { current: 2, total: 2 },
              })
            }, 50)
          }),
      )

    const { result, rerender } = renderHook(
      ({ page }) => usePlayers({ league: 39, season: 2024, page }),
      {
        wrapper: createWrapper(),
        initialProps: { page: 1 },
      },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.players[0]?.player.name).toBe('Page One')

    rerender({ page: 2 })

    await waitFor(() => expect(result.current.isFetching).toBe(true))
    expect(result.current.players[0]?.player.name).toBe('Page One')

    await waitFor(() =>
      expect(result.current.players[0]?.player.name).toBe('Page Two'),
    )
  })

  it('exposes a readable errorMessage when the request fails', async () => {
    mockedGetPlayers.mockRejectedValueOnce(new Error('Players unavailable'))

    const { result } = renderHook(
      () => usePlayers({ league: 39, season: 2024, page: 1 }),
      { wrapper: createWrapper() },
    )

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.players).toEqual([])
    expect(result.current.error).toBeInstanceOf(Error)
    expect(result.current.errorMessage).toBe('Players unavailable')
  })

  it('forwards extra query options', async () => {
    mockedGetPlayers.mockResolvedValueOnce({
      data: [createPlayerProfile({ player: { id: 9, name: 'Cached' } })],
      results: 1,
      paging: { current: 1, total: 1 },
    })

    const { result } = renderHook(
      () =>
        usePlayers(
          { league: 39, season: 2024, page: 1 },
          { staleTime: 1_000 },
        ),
      { wrapper: createWrapper() },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.players[0]?.player.name).toBe('Cached')
  })
})
