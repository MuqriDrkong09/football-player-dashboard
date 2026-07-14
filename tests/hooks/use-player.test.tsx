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

  it('loads a player detail', async () => {
    mockedGetPlayer.mockResolvedValueOnce(
      createPlayerProfile({ player: { id: 42, name: 'Detail Player' } }),
    )

    const { result } = renderHook(
      () => usePlayer({ id: 42, season: 2024 }),
      { wrapper: createWrapper() },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.player?.player.name).toBe('Detail Player')
  })
})
