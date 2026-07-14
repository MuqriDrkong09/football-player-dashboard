jest.mock('@/api/client', () => ({
  apiGet: jest.fn(),
}))

import { apiGet } from '@/api/client'
import {
  getPlayer,
  getPlayers,
  getPlayerSeasons,
  getTopPlayers,
  searchPlayers,
} from '@/services/players.service'
import { createPlayerProfile } from '../fixtures/players'

const mockedApiGet = apiGet as jest.MockedFunction<typeof apiGet>

describe('services/players.service', () => {
  beforeEach(() => {
    mockedApiGet.mockReset()
  })

  it('fetches player lists', async () => {
    const payload = {
      data: [createPlayerProfile()],
      results: 1,
      paging: { current: 1, total: 1 },
    }
    mockedApiGet.mockResolvedValueOnce(payload)

    await expect(getPlayers({ league: 39, season: 2024 })).resolves.toEqual(
      payload,
    )
    expect(mockedApiGet).toHaveBeenCalledWith('/players', {
      league: 39,
      season: 2024,
    })
  })

  it('returns the first player or null', async () => {
    mockedApiGet.mockResolvedValueOnce({
      data: [createPlayerProfile({ player: { id: 5 } })],
      results: 1,
      paging: { current: 1, total: 1 },
    })
    await expect(getPlayer({ id: 5, season: 2024 })).resolves.toMatchObject({
      player: { id: 5 },
    })

    mockedApiGet.mockResolvedValueOnce({
      data: [],
      results: 0,
      paging: { current: 1, total: 1 },
    })
    await expect(getPlayer({ id: 5 })).resolves.toBeNull()
  })

  it('fetches seasons and search results', async () => {
    mockedApiGet.mockResolvedValueOnce({
      data: [2022, 2023, 2024],
      results: 3,
      paging: { current: 1, total: 1 },
    })
    await expect(getPlayerSeasons({ player: 1 })).resolves.toEqual([
      2022, 2023, 2024,
    ])

    mockedApiGet.mockResolvedValueOnce({
      data: [],
      results: 0,
      paging: { current: 1, total: 1 },
    })
    await searchPlayers({
      search: 'salah',
      league: 39,
      season: 2024,
      page: 1,
    })
    expect(mockedApiGet).toHaveBeenLastCalledWith('/players', {
      search: 'salah',
      league: 39,
      season: 2024,
      page: 1,
      team: undefined,
    })
  })

  it('routes top-player kinds to the correct endpoints', async () => {
    mockedApiGet.mockResolvedValue({
      data: [],
      results: 0,
      paging: { current: 1, total: 1 },
    })

    await getTopPlayers('scorers', { league: 39, season: 2024 })
    await getTopPlayers('assists', { league: 39, season: 2024 })
    await getTopPlayers('yellow-cards', { league: 39, season: 2024 })
    await getTopPlayers('red-cards', { league: 39, season: 2024 })

    expect(mockedApiGet.mock.calls.map((call) => call[0])).toEqual([
      '/players/topscorers',
      '/players/topassists',
      '/players/topyellowcards',
      '/players/topredcards',
    ])
  })
})
