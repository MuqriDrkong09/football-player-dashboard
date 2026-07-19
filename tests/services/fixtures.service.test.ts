jest.mock('@/api/client', () => ({
  apiGet: jest.fn(),
}))

import { apiGet } from '@/api/client'
import {
  getFixture,
  getFixtures,
  getLeagueSeasonFixtures,
  getTeamSeasonFixtures,
} from '@/services/fixtures.service'
import { createFixture } from '../fixtures/fixtures'

const mockedApiGet = apiGet as jest.MockedFunction<typeof apiGet>

describe('services/fixtures.service', () => {
  beforeEach(() => {
    mockedApiGet.mockReset()
  })

  it('fetches fixtures with params', async () => {
    const fixtures = [createFixture()]
    mockedApiGet.mockResolvedValueOnce({
      data: fixtures,
      results: 1,
      paging: { current: 1, total: 1 },
    })

    await expect(
      getFixtures({ team: 40, season: 2024 }),
    ).resolves.toEqual(fixtures)
    expect(mockedApiGet).toHaveBeenCalledWith('/fixtures', {
      team: 40,
      season: 2024,
    })
  })

  it('fetches fixtures without params', async () => {
    mockedApiGet.mockResolvedValueOnce({
      data: [],
      results: 0,
      paging: { current: 1, total: 1 },
    })

    await expect(getFixtures()).resolves.toEqual([])
    expect(mockedApiGet).toHaveBeenCalledWith('/fixtures', undefined)
  })

  it('returns the first fixture or null by id', async () => {
    const fixture = createFixture({ id: 55 })
    mockedApiGet.mockResolvedValueOnce({
      data: [fixture],
      results: 1,
      paging: { current: 1, total: 1 },
    })

    await expect(getFixture(55)).resolves.toEqual(fixture)

    mockedApiGet.mockResolvedValueOnce({
      data: [],
      results: 0,
      paging: { current: 1, total: 1 },
    })
    await expect(getFixture(99)).resolves.toBeNull()
  })

  it('splits season fixtures into upcoming and recent without next/last', async () => {
    const upcoming = createFixture({
      id: 1,
      statusShort: 'NS',
      date: '2099-08-17T14:00:00+00:00',
    })
    const recent = createFixture({
      id: 2,
      statusShort: 'FT',
      date: '2024-08-10T14:00:00+00:00',
      goals: { home: 2, away: 1 },
    })

    mockedApiGet.mockResolvedValueOnce({
      data: [upcoming, recent],
      results: 2,
      paging: { current: 1, total: 1 },
    })

    await expect(
      getTeamSeasonFixtures({ team: 40, season: 2024, league: 39 }),
    ).resolves.toEqual({
      upcoming: [upcoming],
      recent: [recent],
    })

    expect(mockedApiGet).toHaveBeenCalledWith('/fixtures', {
      team: 40,
      season: 2024,
      league: 39,
    })
  })

  it('applies custom limits and omits league when not provided', async () => {
    const fixtures = [
      createFixture({
        id: 1,
        statusShort: 'FT',
        date: '2024-08-01T12:00:00+00:00',
        goals: { home: 1, away: 0 },
      }),
      createFixture({
        id: 2,
        statusShort: 'FT',
        date: '2024-08-08T12:00:00+00:00',
        goals: { home: 3, away: 1 },
      }),
      createFixture({
        id: 3,
        statusShort: 'NS',
        date: '2099-09-01T12:00:00+00:00',
      }),
      createFixture({
        id: 4,
        statusShort: 'NS',
        date: '2099-09-08T12:00:00+00:00',
      }),
    ]

    mockedApiGet.mockResolvedValueOnce({
      data: fixtures,
      results: fixtures.length,
      paging: { current: 1, total: 1 },
    })

    const result = await getTeamSeasonFixtures(
      { team: 40, season: 2024 },
      { upcoming: 1, recent: 1 },
    )

    expect(mockedApiGet).toHaveBeenCalledWith('/fixtures', {
      team: 40,
      season: 2024,
    })
    expect(result.upcoming).toHaveLength(1)
    expect(result.upcoming[0]?.fixture.id).toBe(3)
    expect(result.recent).toHaveLength(1)
    expect(result.recent[0]?.fixture.id).toBe(2)
  })

  it('fetches league season fixtures without team or next/last params', async () => {
    const upcoming = createFixture({
      id: 10,
      statusShort: 'NS',
      date: '2099-08-17T14:00:00+00:00',
    })

    mockedApiGet.mockResolvedValueOnce({
      data: [upcoming],
      results: 1,
      paging: { current: 1, total: 1 },
    })

    await expect(
      getLeagueSeasonFixtures({ league: 39, season: 2024 }),
    ).resolves.toEqual({
      upcoming: [upcoming],
      recent: [],
    })

    expect(mockedApiGet).toHaveBeenCalledWith('/fixtures', {
      league: 39,
      season: 2024,
    })
  })
})
