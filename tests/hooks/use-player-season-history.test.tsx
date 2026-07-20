import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { usePlayerSeasonHistory } from '@/hooks/use-player-season-history'
import { createPlayerProfile } from '../fixtures/players'

jest.mock('@/services/players.service', () => ({
  getPlayer: jest.fn(),
}))

import { getPlayer } from '@/services/players.service'

const mockedGetPlayer = getPlayer as jest.MockedFunction<typeof getPlayer>

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

describe('hooks/usePlayerSeasonHistory', () => {
  beforeEach(() => {
    mockedGetPlayer.mockReset()
  })

  it('does not fetch when disabled or seasons are empty', () => {
    const { result } = renderHook(
      () => usePlayerSeasonHistory(0, [2024]),
      { wrapper: createWrapper() },
    )

    expect(result.current.rows).toEqual([])
    expect(result.current.isLoading).toBe(false)
    expect(mockedGetPlayer).not.toHaveBeenCalled()

    const empty = renderHook(() => usePlayerSeasonHistory(11, []), {
      wrapper: createWrapper(),
    })
    expect(empty.result.current.rows).toEqual([])
    expect(mockedGetPlayer).not.toHaveBeenCalled()
  })

  it('skips seasons outside the free plan range', async () => {
    mockedGetPlayer.mockResolvedValue(createPlayerProfile())

    const { result } = renderHook(
      () => usePlayerSeasonHistory(11, [2024, 2021, 2019]),
      { wrapper: createWrapper() },
    )

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(mockedGetPlayer).toHaveBeenCalledTimes(1)
    expect(mockedGetPlayer).toHaveBeenCalledWith({ id: 11, season: 2024 })
    expect(result.current.seasons).toEqual([2024])
    expect(result.current.rows).toHaveLength(1)
  })

  it('loads season history rows newest first', async () => {
    mockedGetPlayer.mockImplementation(async ({ season }) =>
      createPlayerProfile({
        statistics: [
          {
            ...createPlayerProfile().statistics[0]!,
            league: {
              id: 39,
              name: 'Premier League',
              country: 'England',
              logo: '',
              flag: null,
              season: season ?? 2024,
            },
            goals: {
              total: season === 2024 ? 12 : 8,
              conceded: 0,
              assists: 3,
              saves: null,
            },
          },
        ],
      }),
    )

    const { result } = renderHook(
      () => usePlayerSeasonHistory(11, [2023, 2024]),
      { wrapper: createWrapper() },
    )

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(mockedGetPlayer).toHaveBeenCalledWith({ id: 11, season: 2023 })
    expect(mockedGetPlayer).toHaveBeenCalledWith({ id: 11, season: 2024 })
    expect(result.current.rows.map((row) => row.season)).toEqual([2024, 2023])
    expect(result.current.rows[0]?.goals).toBe(12)
    expect(result.current.isError).toBe(false)
    expect(result.current.errorMessage).toBeNull()
  })

  it('exposes errors and supports refetch', async () => {
    mockedGetPlayer.mockRejectedValueOnce(new Error('history failed'))

    const { result } = renderHook(
      () => usePlayerSeasonHistory(11, [2024]),
      { wrapper: createWrapper() },
    )

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.errorMessage).toMatch(/history failed/i)

    mockedGetPlayer.mockResolvedValueOnce(createPlayerProfile())
    await result.current.refetch()
    await waitFor(() => expect(result.current.isError).toBe(false))
    expect(result.current.rows).toHaveLength(1)
  })
})
