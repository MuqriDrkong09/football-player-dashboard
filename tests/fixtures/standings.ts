import type { StandingResponseItem, StandingRow } from '@/types/api-football'

export function createStandingRow(
  overrides: Partial<StandingRow> & {
    team?: Partial<StandingRow['team']>
  } = {},
): StandingRow {
  const { team, ...rest } = overrides

  return {
    rank: 1,
    team: {
      id: 40,
      name: 'Liverpool',
      logo: 'https://example.com/liverpool.png',
      ...team,
    },
    points: 84,
    goalsDiff: 45,
    group: 'Premier League',
    form: 'WWDLW',
    status: 'same',
    description: 'Champions League',
    all: {
      played: 34,
      win: 26,
      draw: 6,
      lose: 2,
      goals: { for: 80, against: 35 },
    },
    home: {
      played: 17,
      win: 14,
      draw: 2,
      lose: 1,
      goals: { for: 45, against: 15 },
    },
    away: {
      played: 17,
      win: 12,
      draw: 4,
      lose: 1,
      goals: { for: 35, against: 20 },
    },
    update: '2024-05-01T00:00:00+00:00',
    ...rest,
  }
}

export function createStandingsResponse(
  tables: StandingRow[][] = [[createStandingRow()]],
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
