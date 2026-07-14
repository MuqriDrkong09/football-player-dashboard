import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { useTopPlayers } from '@/hooks/use-top-players'
import { createPlayerProfile } from '../fixtures/players'

jest.mock('@/services/players.service', () => ({
  getTopPlayers: jest.fn(),
}))

import { getTopPlayers } from '@/services/players.service'

const mockedGetTopPlayers = getTopPlayers as jest.MockedFunction<
  typeof getTopPlayers
>

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
  }
}

describe('hooks/useTopPlayers', () => {
  beforeEach(() => {
    mockedGetTopPlayers.mockReset()
  })

  it('loads top players for a kind', async () => {
    mockedGetTopPlayers.mockResolvedValueOnce({
      data: [createPlayerProfile({ player: { id: 10, name: 'Scorer' } })],
      results: 1,
      paging: { current: 1, total: 1 },
    })

    const { result } = renderHook(
      () => useTopPlayers('scorers', { league: 39, season: 2024 }),
      { wrapper: createWrapper() },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockedGetTopPlayers).toHaveBeenCalledWith('scorers', {
      league: 39,
      season: 2024,
    })
    expect(result.current.players[0].player.name).toBe('Scorer')
    expect(result.current.errorMessage).toBeNull()
  })

  it('exposes error messages on failure', async () => {
    mockedGetTopPlayers.mockRejectedValueOnce(new Error('Boom'))

    const { result } = renderHook(
      () => useTopPlayers('assists', { league: 39, season: 2024 }),
      { wrapper: createWrapper() },
    )

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.errorMessage).toBe('Boom')
    expect(result.current.players).toEqual([])
  })
})
