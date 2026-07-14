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

  it('returns players from the query', async () => {
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
    expect(result.current.players[0].player.name).toBe('Player Three')
    expect(result.current.paging?.total).toBe(2)
  })
})
