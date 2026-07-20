import { DEFAULT_SEASON } from '@/config/football'
import {
  aggregatePlayerStatistics,
  buildPlayerSeasonHistoryRow,
  buildPlayerSeasonHistoryRows,
  filterPlayersByNationality,
  filterPlayersByPosition,
  getCompetitionChartData,
  getPrimaryCompetition,
  getPrimaryStatistics,
  getSeasonTrendChartData,
  getUniqueNationalities,
  pickDefaultSeason,
} from '@/utils/player'
import {
  createPlayerProfile,
  createStatistics,
} from '../fixtures/players'

describe('utils/player', () => {
  it('returns the first statistics entry as primary', () => {
    const profile = createPlayerProfile({
      statistics: [
        createStatistics({ goals: { total: 1, conceded: 0, assists: 0, saves: null } }),
        createStatistics({ goals: { total: 9, conceded: 0, assists: 0, saves: null } }),
      ],
    })

    expect(getPrimaryStatistics(profile)?.goals.total).toBe(1)
  })

  it('returns null when statistics are empty', () => {
    const profile = createPlayerProfile({ statistics: [] })
    expect(getPrimaryStatistics(profile)).toBeNull()
    expect(getPrimaryCompetition([])).toBeNull()
  })

  it('picks the competition with the most appearances', () => {
    const primary = getPrimaryCompetition([
      createStatistics({
        team: { id: 1, name: 'Cup Side', logo: '' },
        league: {
          id: 2,
          name: 'Cup',
          country: 'England',
          logo: '',
          flag: null,
          season: 2024,
        },
        games: {
          appearences: 3,
          lineups: 3,
          minutes: 270,
          number: 9,
          position: 'Attacker',
          rating: '7',
          captain: false,
        },
      }),
      createStatistics({
        team: { id: 33, name: 'Manchester United', logo: 'mu.png' },
        games: {
          appearences: 20,
          lineups: 18,
          minutes: 1600,
          number: 10,
          position: 'Attacker',
          rating: '7.5',
          captain: false,
        },
      }),
    ])

    expect(primary?.team.name).toBe('Manchester United')
    expect(primary?.league.name).toBe('Premier League')
  })

  it('treats missing appearance counts as zero when choosing a primary competition', () => {
    const withMissingApps = getPrimaryCompetition([
      {
        ...createStatistics({
          team: { id: 1, name: 'No Games Object', logo: '' },
        }),
        games: undefined,
      } as ReturnType<typeof createStatistics>,
      createStatistics({
        team: { id: 2, name: 'Null Appearances', logo: '' },
        games: {
          appearences: null,
          lineups: 0,
          minutes: null,
          number: null,
          position: 'Midfielder',
          rating: null,
          captain: false,
        },
      }),
      createStatistics({
        team: { id: 3, name: 'Has Appearances', logo: '' },
        games: {
          appearences: 1,
          lineups: 1,
          minutes: 90,
          number: 8,
          position: 'Midfielder',
          rating: '7',
          captain: false,
        },
      }),
    ])

    expect(withMissingApps?.team.name).toBe('Has Appearances')
  })

  it('builds season history rows from profiles', () => {
    const profile = createPlayerProfile({
      statistics: [
        createStatistics({
          goals: { total: 10, conceded: 0, assists: 4, saves: null },
          cards: { yellow: 2, yellowred: 0, red: 1 },
        }),
        createStatistics({
          team: { id: 2, name: 'Cup Side', logo: '' },
          league: {
            id: 48,
            name: 'FA Cup',
            country: 'England',
            logo: 'cup.png',
            flag: null,
            season: 2023,
          },
          games: {
            appearences: 2,
            lineups: 2,
            minutes: 180,
            number: 10,
            position: 'Attacker',
            rating: '7',
            captain: false,
          },
          goals: { total: 1, conceded: 0, assists: 1, saves: null },
          cards: { yellow: 0, yellowred: 0, red: 0 },
        }),
      ],
    })

    expect(buildPlayerSeasonHistoryRow(2023, null)).toMatchObject({
      season: 2023,
      team: null,
      league: null,
      appearances: 0,
      goals: 0,
    })
    expect(buildPlayerSeasonHistoryRow(2023, createPlayerProfile({ statistics: [] }))).toMatchObject({
      season: 2023,
      team: null,
      appearances: 0,
    })

    const row = buildPlayerSeasonHistoryRow(2023, profile)
    expect(row).toMatchObject({
      season: 2023,
      team: { id: 33, name: 'Manchester United' },
      league: { id: 39, name: 'Premier League' },
      appearances: 22,
      goals: 11,
      assists: 5,
      minutes: 1780,
      yellowCards: 2,
      redCards: 1,
    })

    const rows = buildPlayerSeasonHistoryRows(
      [2022, 2024],
      new Map([
        [2024, profile],
        [2022, null],
      ]),
    )
    expect(rows.map((item) => item.season)).toEqual([2024, 2022])
    expect(rows[1]?.goals).toBe(0)
  })

  it('aggregates statistics across competitions', () => {
    const totals = aggregatePlayerStatistics([
      createStatistics({
        goals: { total: 10, conceded: 0, assists: 3, saves: null },
        games: {
          appearences: 20,
          lineups: 20,
          minutes: 1800,
          number: 9,
          position: 'Attacker',
          rating: '7',
          captain: false,
        },
        cards: { yellow: 1, yellowred: 0, red: 0 },
      }),
      createStatistics({
        goals: { total: 2, conceded: 0, assists: 1, saves: null },
        games: {
          appearences: 4,
          lineups: 4,
          minutes: 360,
          number: 9,
          position: 'Attacker',
          rating: '7',
          captain: false,
        },
        cards: { yellow: 1, yellowred: 0, red: 1 },
      }),
    ])

    expect(totals).toEqual({
      goals: 12,
      assists: 4,
      minutes: 2160,
      matches: 24,
      yellowCards: 2,
      redCards: 1,
    })
  })

  it('treats missing nested aggregate fields as zero', () => {
    const sparse = {
      ...createStatistics(),
      goals: undefined,
      games: undefined,
      cards: undefined,
    } as ReturnType<typeof createStatistics>

    expect(aggregatePlayerStatistics([sparse])).toEqual({
      goals: 0,
      assists: 0,
      minutes: 0,
      matches: 0,
      yellowCards: 0,
      redCards: 0,
    })
  })

  it('maps competition chart rows', () => {
    const rows = getCompetitionChartData([
      createStatistics({
        league: {
          id: 39,
          name: 'Premier League',
          country: 'England',
          logo: '',
          flag: null,
          season: 2024,
        },
        goals: { total: 8, conceded: 0, assists: 2, saves: null },
      }),
    ])

    expect(rows[0]).toMatchObject({
      name: 'Premier League',
      goals: 8,
      assists: 2,
    })
  })

  it('treats missing nested chart fields as zero', () => {
    const sparse = {
      ...createStatistics({
        league: {
          id: 2,
          name: 'Cup',
          country: 'England',
          logo: '',
          flag: null,
          season: 2024,
        },
      }),
      goals: { total: null, conceded: 0, assists: null, saves: null },
      games: {
        appearences: null,
        lineups: 0,
        minutes: null,
        number: null,
        position: 'Attacker',
        rating: null,
        captain: false,
      },
      cards: { yellow: null, yellowred: 0, red: null },
    } as ReturnType<typeof createStatistics>

    expect(getCompetitionChartData([sparse])[0]).toEqual({
      name: 'Cup',
      goals: 0,
      assists: 0,
      minutes: 0,
      matches: 0,
      yellowCards: 0,
      redCards: 0,
    })
  })

  it('builds chronological season trend chart points', () => {
    const points = getSeasonTrendChartData([
      {
        season: 2024,
        team: null,
        league: null,
        appearances: 30,
        goals: 12,
        assists: 5,
        minutes: 2600,
        yellowCards: 1,
        redCards: 0,
      },
      {
        season: 2022,
        team: null,
        league: null,
        appearances: 20,
        goals: 8,
        assists: 3,
        minutes: 1800,
        yellowCards: 2,
        redCards: 0,
      },
    ])

    expect(points).toEqual([
      {
        season: 2022,
        label: '2022/23',
        goals: 8,
        assists: 3,
        matches: 20,
        minutes: 1800,
      },
      {
        season: 2024,
        label: '2024/25',
        goals: 12,
        assists: 5,
        matches: 30,
        minutes: 2600,
      },
    ])
  })
    expect(pickDefaultSeason([])).toBeNull()
    expect(pickDefaultSeason([2022, DEFAULT_SEASON, 2023])).toBe(DEFAULT_SEASON)
    expect(pickDefaultSeason([2022, 2023])).toBe(2023)
  })

  it('filters players by position and nationality', () => {
    const attacker = createPlayerProfile({
      player: { id: 1, name: 'A', nationality: 'England' },
      statistics: [
        createStatistics({
          games: {
            appearences: 10,
            lineups: 10,
            minutes: 900,
            number: 9,
            position: 'Attacker',
            rating: '7',
            captain: false,
          },
        }),
      ],
    })
    const midfielder = createPlayerProfile({
      player: { id: 2, name: 'B', nationality: 'Brazil' },
      statistics: [
        createStatistics({
          games: {
            appearences: 10,
            lineups: 10,
            minutes: 900,
            number: 8,
            position: 'Midfielder',
            rating: '7',
            captain: false,
          },
        }),
      ],
    })
    const noStats = createPlayerProfile({
      player: { id: 3, name: 'C', nationality: 'Spain' },
      statistics: [],
    })

    expect(filterPlayersByPosition([attacker, midfielder], 'all')).toHaveLength(
      2,
    )
    expect(filterPlayersByPosition([attacker, midfielder], 'Attacker')).toEqual(
      [attacker],
    )
    expect(
      filterPlayersByPosition([attacker, midfielder, noStats], 'Attacker'),
    ).toEqual([attacker])
    expect(
      filterPlayersByNationality([attacker, midfielder], 'Brazil'),
    ).toEqual([midfielder])
    expect(filterPlayersByNationality([attacker, midfielder], 'all')).toHaveLength(
      2,
    )
  })

  it('returns unique sorted nationalities', () => {
    const players = [
      createPlayerProfile({ player: { id: 1, nationality: 'Brazil' } }),
      createPlayerProfile({ player: { id: 2, nationality: 'England' } }),
      createPlayerProfile({ player: { id: 3, nationality: 'Brazil' } }),
      createPlayerProfile({ player: { id: 4, nationality: null } }),
    ]

    expect(getUniqueNationalities(players)).toEqual(['Brazil', 'England'])
  })
})
