import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { DEFAULT_LEAGUE_ID, DEFAULT_SEASON } from '@/config/football'
import { useLeagueSeason } from '@/hooks/use-league-season'
import { LeagueSeasonProvider } from '@/providers/LeagueSeasonProvider'
import { queryKeys } from '@/lib/query-keys'
import {
  LEAGUE_SEASON_STORAGE_KEY,
  writeLeagueSeasonPreference,
} from '@/store/league-season'

function createWrapper(initial?: {
  initialLeagueId?: number
  initialSeason?: number
}) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  client.invalidateQueries = jest.fn().mockResolvedValue(undefined)

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={client}>
        <LeagueSeasonProvider
          initialLeagueId={initial?.initialLeagueId}
          initialSeason={initial?.initialSeason}
        >
          {children}
        </LeagueSeasonProvider>
      </QueryClientProvider>
    )
  }

  return { Wrapper, client }
}

describe('providers/LeagueSeasonProvider', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('throws when useLeagueSeason is used outside the provider', () => {
    expect(() => renderHook(() => useLeagueSeason())).toThrow(
      'useLeagueSeason must be used within a LeagueSeasonProvider',
    )
  })

  it('starts at Premier League 2024/25 and does not persist changes', async () => {
    const { Wrapper, client } = createWrapper()
    const { result } = renderHook(() => useLeagueSeason(), {
      wrapper: Wrapper,
    })

    expect(result.current.leagueId).toBe(DEFAULT_LEAGUE_ID)
    expect(result.current.season).toBe(DEFAULT_SEASON)
    expect(result.current.leagueName).toBe('Premier League')

    act(() => {
      result.current.setLeagueId(140)
    })

    expect(result.current.leagueId).toBe(140)
    expect(result.current.leagueName).toBe('La Liga')
    expect(localStorage.getItem(LEAGUE_SEASON_STORAGE_KEY)).toBeNull()
    expect(client.invalidateQueries).toHaveBeenCalledWith({
      queryKey: queryKeys.all,
    })

    act(() => {
      result.current.setSeason(2022)
    })

    await waitFor(() => expect(result.current.season).toBe(2022))
    expect(localStorage.getItem(LEAGUE_SEASON_STORAGE_KEY)).toBeNull()
  })

  it('ignores previously stored preferences on load (refresh reset)', () => {
    writeLeagueSeasonPreference({ leagueId: 140, season: 2022 })

    const { Wrapper } = createWrapper()
    const { result } = renderHook(() => useLeagueSeason(), {
      wrapper: Wrapper,
    })

    expect(result.current.leagueId).toBe(DEFAULT_LEAGUE_ID)
    expect(result.current.season).toBe(DEFAULT_SEASON)
    expect(result.current.leagueName).toBe('Premier League')
  })

  it('ignores invalid and duplicate updates', () => {
    const { Wrapper, client } = createWrapper({
      initialLeagueId: 39,
      initialSeason: 2024,
    })
    const { result } = renderHook(() => useLeagueSeason(), {
      wrapper: Wrapper,
    })

    act(() => {
      result.current.setLeagueId(999)
      result.current.setSeason(1999)
      result.current.setLeagueId(39)
      result.current.setSeason(2024)
      result.current.setLeagueAndSeason(39, 2024)
      result.current.setLeagueAndSeason(999, 2024)
    })

    expect(result.current.leagueId).toBe(39)
    expect(result.current.season).toBe(2024)
    expect(client.invalidateQueries).not.toHaveBeenCalled()
  })

  it('updates both league and season together', () => {
    const { Wrapper, client } = createWrapper()
    const { result } = renderHook(() => useLeagueSeason(), {
      wrapper: Wrapper,
    })

    act(() => {
      result.current.setLeagueAndSeason(78, 2021)
    })

    expect(result.current.leagueId).toBe(78)
    expect(result.current.season).toBe(2021)
    expect(result.current.leagueName).toBe('Bundesliga')
    expect(client.invalidateQueries).toHaveBeenCalled()
  })
})
