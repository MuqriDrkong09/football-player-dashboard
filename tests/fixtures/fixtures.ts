import type { Fixture } from '@/types/api-football'

export function createFixture(
  overrides: {
    id?: number
    date?: string
    statusShort?: string | null
    statusLong?: string | null
    home?: Partial<Fixture['teams']['home']>
    away?: Partial<Fixture['teams']['away']>
    goals?: Partial<Fixture['goals']>
    league?: Partial<Fixture['league']>
    venue?: Partial<Fixture['fixture']['venue']>
    referee?: string | null
    score?: Partial<Fixture['score']>
  } = {},
): Fixture {
  return {
    fixture: {
      id: overrides.id ?? 1001,
      referee:
        overrides.referee !== undefined ? overrides.referee : 'Michael Oliver',
      timezone: 'UTC',
      date: overrides.date ?? '2024-08-17T14:00:00+00:00',
      timestamp: 1723903200,
      venue: {
        id: 1,
        name: 'Anfield',
        city: 'Liverpool',
        ...overrides.venue,
      },
      status: {
        long:
          overrides.statusLong !== undefined
            ? overrides.statusLong
            : 'Not Started',
        short:
          overrides.statusShort !== undefined ? overrides.statusShort : 'NS',
        elapsed: null,
      },
    },
    league: {
      id: 39,
      name: 'Premier League',
      country: 'England',
      logo: 'https://example.com/pl.png',
      flag: null,
      season: 2024,
      round: 'Regular Season - 1',
      ...overrides.league,
    },
    teams: {
      home: {
        id: 40,
        name: 'Liverpool',
        logo: 'https://example.com/liverpool.png',
        winner: null,
        ...overrides.home,
      },
      away: {
        id: 33,
        name: 'Manchester United',
        logo: 'https://example.com/manutd.png',
        winner: null,
        ...overrides.away,
      },
    },
    goals: {
      home: null,
      away: null,
      ...overrides.goals,
    },
    score: {
      halftime: { home: null, away: null },
      fulltime: { home: null, away: null },
      extratime: { home: null, away: null },
      penalty: { home: null, away: null },
      ...overrides.score,
    },
  }
}
