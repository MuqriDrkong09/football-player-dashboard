jest.mock('@/api/client', () => ({
  apiGet: jest.fn(),
}))

import { apiGet } from '@/api/client'
import {
  getStandings,
  getTeam,
  getTeamCoach,
  getTeamCoaches,
  getTeams,
  getTeamStanding,
  getTeamStatistics,
} from '@/services/teams.service'
import type {
  Coach,
  StandingResponseItem,
  StandingRow,
  TeamStatistics,
} from '@/types/api-football'
import { createTeam } from '../fixtures/players'

const mockedApiGet = apiGet as jest.MockedFunction<typeof apiGet>

function createStatistics(
  overrides: Partial<TeamStatistics> = {},
): TeamStatistics {
  return {
    league: {
      id: 39,
      name: 'Premier League',
      country: 'England',
      logo: '',
      flag: null,
      season: 2024,
    },
    team: { id: 40, name: 'Liverpool', logo: '' },
    form: 'WWDLW',
    fixtures: {
      played: { home: 17, away: 17, total: 34 },
      wins: { home: 12, away: 10, total: 22 },
      draws: { home: 3, away: 4, total: 7 },
      loses: { home: 2, away: 3, total: 5 },
    },
    goals: {
      for: {
        total: { home: 40, away: 30, total: 70 },
        average: { home: '2.3', away: '1.8', total: '2.1' },
      },
      against: {
        total: { home: 10, away: 15, total: 25 },
        average: { home: '0.6', away: '0.9', total: '0.7' },
      },
    },
    ...overrides,
  }
}

function createCoach(overrides: Partial<Coach> = {}): Coach {
  return {
    id: 1,
    name: 'Arne Slot',
    firstname: 'Arne',
    lastname: 'Slot',
    age: 46,
    nationality: 'Netherlands',
    photo: null,
    team: { id: 40, name: 'Liverpool', logo: '' },
    career: [],
    ...overrides,
  }
}

function createStandingRow(overrides: Partial<StandingRow> = {}): StandingRow {
  return {
    rank: 2,
    team: { id: 40, name: 'Liverpool', logo: '' },
    points: 73,
    goalsDiff: 45,
    group: 'Premier League',
    form: 'WDWWW',
    status: 'same',
    description: 'Champions League',
    all: {
      played: 34,
      win: 22,
      draw: 7,
      lose: 5,
      goals: { for: 70, against: 25 },
    },
    home: {
      played: 17,
      win: 12,
      draw: 3,
      lose: 2,
      goals: { for: 40, against: 10 },
    },
    away: {
      played: 17,
      win: 10,
      draw: 4,
      lose: 3,
      goals: { for: 30, against: 15 },
    },
    update: '2024-05-01T00:00:00+00:00',
    ...overrides,
  }
}

function createStandingsResponse(
  tables: StandingRow[][],
): StandingResponseItem[] {
  return [
    {
      league: {
        id: 39,
        name: 'Premier League',
        country: 'England',
        logo: '',
        flag: null,
        season: 2024,
        standings: tables,
      },
    },
  ]
}

describe('services/teams.service', () => {
  beforeEach(() => {
    mockedApiGet.mockReset()
  })

  describe('getTeams', () => {
    it('fetches teams with optional params', async () => {
      const payload = {
        data: [createTeam()],
        results: 1,
        paging: { current: 1, total: 1 },
      }
      mockedApiGet.mockResolvedValueOnce(payload)

      await expect(getTeams({ league: 39, season: 2024 })).resolves.toEqual(
        payload,
      )
      expect(mockedApiGet).toHaveBeenCalledWith('/teams', {
        league: 39,
        season: 2024,
      })
    })

    it('fetches teams without params', async () => {
      const payload = {
        data: [],
        results: 0,
        paging: { current: 1, total: 1 },
      }
      mockedApiGet.mockResolvedValueOnce(payload)

      await expect(getTeams()).resolves.toEqual(payload)
      expect(mockedApiGet).toHaveBeenCalledWith('/teams', undefined)
    })
  })

  describe('getTeam', () => {
    it('returns the first team', async () => {
      const team = createTeam({ id: 40, name: 'Liverpool' })
      mockedApiGet.mockResolvedValueOnce({
        data: [team],
        results: 1,
        paging: { current: 1, total: 1 },
      })

      await expect(getTeam({ id: 40 })).resolves.toEqual(team)
      expect(mockedApiGet).toHaveBeenCalledWith('/teams', { id: 40 })
    })

    it('returns null when the list is empty', async () => {
      mockedApiGet.mockResolvedValueOnce({
        data: [],
        results: 0,
        paging: { current: 1, total: 1 },
      })

      await expect(getTeam({ id: 999 })).resolves.toBeNull()
    })
  })

  describe('getTeamStatistics', () => {
    it('returns statistics when results are present', async () => {
      const stats = createStatistics()
      mockedApiGet.mockResolvedValueOnce({
        data: stats,
        results: 1,
        paging: { current: 1, total: 1 },
      })

      await expect(
        getTeamStatistics({ team: 40, league: 39, season: 2024 }),
      ).resolves.toEqual(stats)
      expect(mockedApiGet).toHaveBeenCalledWith('/teams/statistics', {
        team: 40,
        league: 39,
        season: 2024,
      })
    })

    it('returns null when results are zero', async () => {
      mockedApiGet.mockResolvedValueOnce({
        data: createStatistics(),
        results: 0,
        paging: { current: 1, total: 1 },
      })

      await expect(
        getTeamStatistics({ team: 40, league: 39, season: 2024 }),
      ).resolves.toBeNull()
    })
  })

  describe('getTeamCoaches', () => {
    it('returns coach list data', async () => {
      const coaches = [createCoach()]
      mockedApiGet.mockResolvedValueOnce({
        data: coaches,
        results: 1,
        paging: { current: 1, total: 1 },
      })

      await expect(getTeamCoaches({ team: 40 })).resolves.toEqual(coaches)
      expect(mockedApiGet).toHaveBeenCalledWith('/coachs', { team: 40 })
    })
  })

  describe('getTeamCoach', () => {
    it('returns null when there are no coaches', async () => {
      mockedApiGet.mockResolvedValueOnce({
        data: [],
        results: 0,
        paging: { current: 1, total: 1 },
      })

      await expect(getTeamCoach({ team: 40 })).resolves.toBeNull()
    })

    it('prefers the coach with an open career entry for the team', async () => {
      const former = createCoach({
        id: 1,
        name: 'Former',
        career: [
          {
            team: { id: 40, name: 'Liverpool', logo: '' },
            start: '2020-01-01',
            end: '2023-01-01',
          },
        ],
      })
      const current = createCoach({
        id: 2,
        name: 'Current',
        career: [
          {
            team: { id: 33, name: 'Other', logo: '' },
            start: '2018-01-01',
            end: null,
          },
          {
            team: { id: 40, name: 'Liverpool', logo: '' },
            start: '2024-01-01',
            end: null,
          },
        ],
      })
      mockedApiGet.mockResolvedValueOnce({
        data: [former, current],
        results: 2,
        paging: { current: 1, total: 1 },
      })

      await expect(getTeamCoach({ team: 40 })).resolves.toEqual(current)
    })

    it('falls back to the first coach when none are current', async () => {
      const first = createCoach({
        id: 1,
        name: 'First',
        career: [
          {
            team: { id: 40, name: 'Liverpool', logo: '' },
            start: '2020-01-01',
            end: '2023-01-01',
          },
        ],
      })
      const second = createCoach({
        id: 2,
        name: 'Second',
        career: undefined as unknown as Coach['career'],
      })
      mockedApiGet.mockResolvedValueOnce({
        data: [first, second],
        results: 2,
        paging: { current: 1, total: 1 },
      })

      await expect(getTeamCoach({ team: 40 })).resolves.toEqual(first)
    })

    it('returns null when the coach entry is empty', async () => {
      mockedApiGet.mockResolvedValueOnce({
        data: [null],
        results: 1,
        paging: { current: 1, total: 1 },
      })

      await expect(getTeamCoach({ team: 40 })).resolves.toBeNull()
    })
  })

  describe('getStandings', () => {
    it('returns standings data', async () => {
      const standings = createStandingsResponse([
        [createStandingRow()],
      ])
      mockedApiGet.mockResolvedValueOnce({
        data: standings,
        results: 1,
        paging: { current: 1, total: 1 },
      })

      await expect(
        getStandings({ league: 39, season: 2024 }),
      ).resolves.toEqual(standings)
      expect(mockedApiGet).toHaveBeenCalledWith('/standings', {
        league: 39,
        season: 2024,
      })
    })
  })

  describe('getTeamStanding', () => {
    it('returns the matching row from the first table', async () => {
      const row = createStandingRow({ team: { id: 40, name: 'Liverpool', logo: '' } })
      mockedApiGet.mockResolvedValueOnce({
        data: createStandingsResponse([
          [
            createStandingRow({ team: { id: 33, name: 'United', logo: '' } }),
            row,
          ],
        ]),
        results: 1,
        paging: { current: 1, total: 1 },
      })

      await expect(
        getTeamStanding({ league: 39, season: 2024, team: 40 }),
      ).resolves.toEqual(row)
    })

    it('searches later tables when the first has no match', async () => {
      const row = createStandingRow({
        team: { id: 50, name: 'Other', logo: '' },
        rank: 1,
      })
      mockedApiGet.mockResolvedValueOnce({
        data: createStandingsResponse([
          [createStandingRow({ team: { id: 33, name: 'United', logo: '' } })],
          [row],
        ]),
        results: 1,
        paging: { current: 1, total: 1 },
      })

      await expect(
        getTeamStanding({ league: 39, season: 2024, team: 50 }),
      ).resolves.toEqual(row)
    })

    it('returns null when no row matches', async () => {
      mockedApiGet.mockResolvedValueOnce({
        data: createStandingsResponse([
          [createStandingRow({ team: { id: 33, name: 'United', logo: '' } })],
        ]),
        results: 1,
        paging: { current: 1, total: 1 },
      })

      await expect(
        getTeamStanding({ league: 39, season: 2024, team: 40 }),
      ).resolves.toBeNull()
    })

    it('returns null when standings data is missing', async () => {
      mockedApiGet.mockResolvedValueOnce({
        data: [],
        results: 0,
        paging: { current: 1, total: 1 },
      })

      await expect(
        getTeamStanding({ league: 39, season: 2024, team: 40 }),
      ).resolves.toBeNull()
    })
  })
})
