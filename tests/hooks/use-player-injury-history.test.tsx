import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { usePlayerInjuryHistory } from '@/hooks/use-player-injury-history'

jest.mock('@/services/players.service', () => ({
  getPlayerSidelined: jest.fn(),
  getPlayerInjuries: jest.fn(),
}))

import { getPlayerInjuries, getPlayerSidelined } from '@/services/players.service'

const mockedGetPlayerSidelined = getPlayerSidelined as jest.MockedFunction<
  typeof getPlayerSidelined
>
const mockedGetPlayerInjuries = getPlayerInjuries as jest.MockedFunction<
  typeof getPlayerInjuries
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

describe('hooks/usePlayerInjuryHistory', () => {
  beforeEach(() => {
    mockedGetPlayerSidelined.mockReset()
    mockedGetPlayerInjuries.mockReset()
  })

  it('does not fetch when player id is missing, disabled, or seasons are unavailable', async () => {
    const missingPlayer = renderHook(
      () => usePlayerInjuryHistory(0, [2024], { enabled: true }),
      { wrapper: createWrapper() },
    )

    expect(missingPlayer.result.current.isLoading).toBe(false)
    expect(missingPlayer.result.current.records).toEqual([])
    expect(missingPlayer.result.current.sidelined).toEqual([])
    expect(missingPlayer.result.current.injuries).toEqual([])
    expect(mockedGetPlayerSidelined).not.toHaveBeenCalled()
    expect(mockedGetPlayerInjuries).not.toHaveBeenCalled()

    const disabled = renderHook(
      () => usePlayerInjuryHistory(11, [2024], { enabled: false }),
      { wrapper: createWrapper() },
    )

    expect(disabled.result.current.isLoading).toBe(false)
    expect(mockedGetPlayerSidelined).not.toHaveBeenCalled()
    expect(mockedGetPlayerInjuries).not.toHaveBeenCalled()

    mockedGetPlayerSidelined.mockResolvedValueOnce([])

    const { result } = renderHook(
      () => usePlayerInjuryHistory(11, [], { enabled: true }),
      { wrapper: createWrapper() },
    )

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(mockedGetPlayerInjuries).not.toHaveBeenCalled()
    expect(result.current.records).toEqual([])
  })

  it('skips seasons outside the free plan range', async () => {
    mockedGetPlayerSidelined.mockResolvedValueOnce([])
    mockedGetPlayerInjuries.mockResolvedValueOnce([])

    const { result } = renderHook(
      () => usePlayerInjuryHistory(11, [2024, 2021, 2019], { enabled: true }),
      { wrapper: createWrapper() },
    )

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(mockedGetPlayerInjuries).toHaveBeenCalledTimes(1)
    expect(mockedGetPlayerInjuries).toHaveBeenCalledWith({
      player: 11,
      season: 2024,
    })
  })

  it('returns injury history records and raw sidelined/injury data', async () => {
    mockedGetPlayerSidelined.mockResolvedValueOnce([
      {
        type: 'Hamstring Injury',
        start: '2023-08-01',
        end: '2023-10-15',
      },
    ])
    mockedGetPlayerInjuries.mockResolvedValueOnce([
      {
        player: {
          id: 11,
          name: 'Test Player',
          photo: '',
          type: 'Missing Fixture',
          reason: 'Hamstring Injury',
        },
        team: { id: 40, name: 'Liverpool', logo: 'liv.png' },
        fixture: {
          id: 100,
          timezone: 'UTC',
          date: '2023-08-20T15:00:00+00:00',
          timestamp: 1,
        },
        league: {
          id: 39,
          name: 'Premier League',
          country: 'England',
          logo: 'pl.png',
          flag: null,
          season: 2023,
        },
      },
    ])

    const { result } = renderHook(() => usePlayerInjuryHistory(11, [2023]), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.records).toHaveLength(1))

    expect(mockedGetPlayerSidelined).toHaveBeenCalledWith({ player: 11 })
    expect(mockedGetPlayerInjuries).toHaveBeenCalledWith({
      player: 11,
      season: 2023,
    })
    expect(result.current.records[0].injuryType).toBe('Hamstring Injury')
    expect(result.current.sidelined).toHaveLength(1)
    expect(result.current.injuries).toHaveLength(1)
    expect(result.current.isError).toBe(false)
    expect(result.current.errorMessage).toBeNull()
    expect(result.current.isFetching).toBe(false)
  })

  it('exposes sidelined errors and supports refetch', async () => {
    mockedGetPlayerSidelined.mockRejectedValueOnce(
      new Error('Sidelined unavailable'),
    )
    mockedGetPlayerInjuries.mockResolvedValueOnce([])

    const { result } = renderHook(
      () => usePlayerInjuryHistory(11, [2023], { enabled: true }),
      { wrapper: createWrapper() },
    )

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error).toBeInstanceOf(Error)
    expect(result.current.errorMessage).toBe('Sidelined unavailable')
    expect(result.current.records).toEqual([])

    mockedGetPlayerSidelined.mockResolvedValueOnce([
      {
        type: 'Knee Injury',
        start: '2024-01-10',
        end: '2024-03-01',
      },
    ])
    mockedGetPlayerInjuries.mockResolvedValueOnce([])

    await result.current.refetch()
    await waitFor(() => expect(result.current.isError).toBe(false))

    expect(result.current.records).toHaveLength(1)
    expect(result.current.records[0].injuryType).toBe('Knee Injury')
    expect(mockedGetPlayerSidelined).toHaveBeenCalledTimes(2)
    expect(mockedGetPlayerInjuries).toHaveBeenCalledTimes(2)
  })

  it('exposes injury query errors when sidelined data succeeds', async () => {
    mockedGetPlayerSidelined.mockResolvedValueOnce([])
    mockedGetPlayerInjuries.mockRejectedValueOnce(
      new Error('Injuries unavailable'),
    )

    const { result } = renderHook(
      () => usePlayerInjuryHistory(11, [2023], { enabled: true }),
      { wrapper: createWrapper() },
    )

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.errorMessage).toBe('Injuries unavailable')
    expect(result.current.records).toEqual([])
  })
})
