import { DEFAULT_SEASON } from '@/config/football'
import {
  aggregatePlayerStatistics,
  filterPlayersByNationality,
  filterPlayersByPosition,
  getCompetitionChartData,
  getPrimaryStatistics,
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

  it('picks the default or latest available season', () => {
    expect(pickDefaultSeason([])).toBeNull()
    expect(pickDefaultSeason([2022, DEFAULT_SEASON, 2023])).toBe(DEFAULT_SEASON)
    expect(pickDefaultSeason([2020, 2021])).toBe(2021)
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
