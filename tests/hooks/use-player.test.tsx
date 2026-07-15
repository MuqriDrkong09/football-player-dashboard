import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { usePlayer } from '@/hooks/use-player'
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

describe('hooks/usePlayer', () => {
  beforeEach(() => {
    mockedGetPlayer.mockReset()
  })

  it('does not fetch when player id is missing', () => {
    const { result } = renderHook(
      () => usePlayer({ id: 0, season: 2024 }),
      { wrapper: createWrapper() },
    )

    expect(result.current.fetchStatus).toBe('idle')
    expect(result.current.player).toBeNull()
    expect(result.current.errorMessage).toBeNull()
    expect(mockedGetPlayer).not.toHaveBeenCalled()
  })

  it('loads a player detail', async () => {
    mockedGetPlayer.mockResolvedValueOnce(
      createPlayerProfile({ player: { id: 42, name: 'Detail Player' } }),
    )

    const { result } = renderHook(
      () => usePlayer({ id: 42, season: 2024 }),
      { wrapper: createWrapper() },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockedGetPlayer).toHaveBeenCalledWith({ id: 42, season: 2024 })
    expect(result.current.player?.player.name).toBe('Detail Player')
    expect(result.current.isLoading).toBe(false)
    expect(result.current.isError).toBe(false)
    expect(result.current.errorMessage).toBeNull()
  })

  it('returns null player when the service finds nothing', async () => {
    mockedGetPlayer.mockResolvedValueOnce(null)

    const { result } = renderHook(
      () => usePlayer({ id: 99, season: 2024 }),
      { wrapper: createWrapper() },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.player).toBeNull()
  })

  it('exposes a readable errorMessage when the request fails', async () => {
    mockedGetPlayer.mockRejectedValueOnce(new Error('Player unavailable'))

    const { result } = renderHook(
      () => usePlayer({ id: 42, season: 2024 }),
      { wrapper: createWrapper() },
    )

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.player).toBeNull()
    expect(result.current.error).toBeInstanceOf(Error)
    expect(result.current.errorMessage).toBe('Player unavailable')
  })

  it('forwards extra query options', async () => {
    mockedGetPlayer.mockResolvedValueOnce(
      createPlayerProfile({ player: { id: 7, name: 'Cached' } }),
    )

    const { result } = renderHook(
      () => usePlayer({ id: 7, season: 2024 }, { staleTime: 1_000 }),
      { wrapper: createWrapper() },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.player?.player.name).toBe('Cached')
  })
})
