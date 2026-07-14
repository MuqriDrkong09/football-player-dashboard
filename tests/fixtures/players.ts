import type {
  PlayerProfile,
  PlayerStatistics,
  Team,
} from '@/types/api-football'

export function createStatistics(
  overrides: Partial<PlayerStatistics> = {},
): PlayerStatistics {
  return {
    team: {
      id: 33,
      name: 'Manchester United',
      logo: 'https://example.com/team.png',
    },
    league: {
      id: 39,
      name: 'Premier League',
      country: 'England',
      logo: 'https://example.com/league.png',
      flag: null,
      season: 2024,
    },
    games: {
      appearences: 20,
      lineups: 18,
      minutes: 1600,
      number: 10,
      position: 'Attacker',
      rating: '7.5',
      captain: false,
    },
    substitutes: { in: 2, out: 4, bench: 5 },
    shots: { total: 40, on: 18 },
    goals: { total: 12, conceded: 0, assists: 5, saves: null },
    passes: { total: 400, key: 30, accuracy: 80 },
    tackles: { total: 10, blocks: 1, interceptions: 5 },
    duels: { total: 100, won: 55 },
    dribbles: { attempts: 40, success: 20, past: null },
    fouls: { drawn: 15, committed: 10 },
    cards: { yellow: 2, yellowred: 0, red: 0 },
    penalty: {
      won: 1,
      committed: 0,
      scored: 2,
      missed: 0,
      saved: null,
    },
    ...overrides,
  }
}

export function createPlayerProfile(
  overrides: {
    player?: Partial<PlayerProfile['player']>
    statistics?: PlayerStatistics[]
  } = {},
): PlayerProfile {
  return {
    player: {
      id: 1,
      name: 'Test Player',
      firstname: 'Test',
      lastname: 'Player',
      age: 25,
      birth: { date: '1999-01-01', place: 'London', country: 'England' },
      nationality: 'England',
      height: '180 cm',
      weight: '75 kg',
      injured: false,
      photo: 'https://example.com/player.png',
      ...overrides.player,
    },
    statistics: overrides.statistics ?? [createStatistics()],
  }
}

export function createTeam(overrides: Partial<Team['team']> = {}): Team {
  return {
    team: {
      id: 33,
      name: 'Manchester United',
      logo: 'https://example.com/team.png',
      ...overrides,
    },
    venue: {
      id: 1,
      name: 'Old Trafford',
      address: 'Sir Matt Busby Way',
      city: 'Manchester',
      capacity: 74000,
      surface: 'grass',
      image: null,
    },
  }
}
