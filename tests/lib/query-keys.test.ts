import { queryKeys } from '@/lib/query-keys'

describe('lib/query-keys', () => {
  it('nests keys under football root', () => {
    expect(queryKeys.all).toEqual(['football'])
    expect(queryKeys.players.all()).toEqual(['football', 'players'])
    expect(queryKeys.teams.all()).toEqual(['football', 'teams'])
  })

  it('builds list and detail keys with params', () => {
    const listParams = { league: 39, season: 2024, page: 1 }
    expect(queryKeys.players.list(listParams)).toEqual([
      'football',
      'players',
      'list',
      listParams,
    ])

    const detailParams = { id: 10, season: 2024 }
    expect(queryKeys.players.detail(detailParams)).toEqual([
      'football',
      'players',
      'detail',
      detailParams,
    ])
  })

  it('builds search, seasons, and top-players keys', () => {
    expect(
      queryKeys.players.search({ search: 'salah', league: 39, season: 2024 }),
    ).toEqual([
      'football',
      'players',
      'search',
      { search: 'salah', league: 39, season: 2024 },
    ])

    expect(queryKeys.players.seasons(11)).toEqual([
      'football',
      'players',
      'seasons',
      11,
    ])

    expect(
      queryKeys.players.topPlayers('scorers', { league: 39, season: 2024 }),
    ).toEqual([
      'football',
      'players',
      'top-scorers',
      { league: 39, season: 2024 },
    ])

    expect(
      queryKeys.players.topPlayers('yellow-cards', {
        league: 39,
        season: 2024,
      }),
    ).toEqual([
      'football',
      'players',
      'top-yellow-cards',
      { league: 39, season: 2024 },
    ])
  })

  it('builds team list keys', () => {
    expect(queryKeys.teams.list()).toEqual(['football', 'teams', 'list', {}])
    expect(queryKeys.teams.list({ league: 39 })).toEqual([
      'football',
      'teams',
      'list',
      { league: 39 },
    ])
  })
})
