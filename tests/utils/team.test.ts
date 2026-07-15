import { buildTeamSeasonStats, parseTeamForm } from '@/utils/team'
import type { StandingRow, TeamStatistics } from '@/types/api-football'

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

function createStanding(overrides: Partial<StandingRow> = {}): StandingRow {
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

describe('utils/team', () => {
  describe('parseTeamForm', () => {
    it('parses the last five form characters', () => {
      expect(parseTeamForm('WWDLW')).toEqual(['W', 'W', 'D', 'L', 'W'])
      expect(parseTeamForm('W W D L W L')).toEqual(['W', 'D', 'L', 'W', 'L'])
    })

    it('returns an empty array for missing form', () => {
      expect(parseTeamForm(null)).toEqual([])
      expect(parseTeamForm(undefined)).toEqual([])
      expect(parseTeamForm('')).toEqual([])
    })
  })

  describe('buildTeamSeasonStats', () => {
    it('returns null when no statistics or standing are available', () => {
      expect(buildTeamSeasonStats(null, null)).toBeNull()
    })

    it('builds season stats from team statistics and standings', () => {
      const stats = buildTeamSeasonStats(createStatistics(), createStanding())

      expect(stats).toEqual({
        matchesPlayed: 34,
        wins: 22,
        draws: 7,
        losses: 5,
        goalsScored: 70,
        goalsConceded: 25,
        goalDifference: 45,
        position: 2,
        form: ['W', 'W', 'D', 'L', 'W'],
        leagueName: 'Premier League',
      })
    })

    it('builds stats from statistics alone and computes goal difference', () => {
      const stats = buildTeamSeasonStats(createStatistics(), null)

      expect(stats).toEqual({
        matchesPlayed: 34,
        wins: 22,
        draws: 7,
        losses: 5,
        goalsScored: 70,
        goalsConceded: 25,
        goalDifference: 45,
        position: null,
        form: ['W', 'W', 'D', 'L', 'W'],
        leagueName: 'Premier League',
      })
    })

    it('builds stats from standing alone', () => {
      const stats = buildTeamSeasonStats(null, createStanding())

      expect(stats).toEqual({
        matchesPlayed: 34,
        wins: 22,
        draws: 7,
        losses: 5,
        goalsScored: 70,
        goalsConceded: 25,
        goalDifference: 45,
        position: 2,
        form: ['W', 'D', 'W', 'W', 'W'],
        leagueName: null,
      })
    })

    it('uses standing form when statistics form is missing', () => {
      const stats = buildTeamSeasonStats(
        createStatistics({ form: null }),
        createStanding({ form: 'LDLDL' }),
      )

      expect(stats?.form).toEqual(['L', 'D', 'L', 'D', 'L'])
    })

    it('falls back to zero when nested totals are missing', () => {
      const incompleteStatistics = {
        league: { name: 'Incomplete League' },
        form: null,
        fixtures: {
          played: {},
          wins: {},
          draws: {},
          loses: {},
        },
        goals: {
          for: { total: {} },
          against: { total: {} },
        },
      } as unknown as TeamStatistics

      const incompleteStanding = {
        rank: null,
        goalsDiff: null,
        form: null,
        all: {
          goals: {},
        },
      } as unknown as StandingRow

      expect(
        buildTeamSeasonStats(incompleteStatistics, incompleteStanding),
      ).toEqual({
        matchesPlayed: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsScored: 0,
        goalsConceded: 0,
        goalDifference: 0,
        position: null,
        form: [],
        leagueName: 'Incomplete League',
      })
    })
  })
})
