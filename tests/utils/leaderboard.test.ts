import {
  buildLeaderboardRows,
  LEADERBOARD_COLUMNS,
  sortLeaderboardRows,
  type LeaderboardRow,
  type LeaderboardSortKey,
} from '@/utils/leaderboard'
import { createPlayerProfile, createStatistics } from '../fixtures/players'

function row(
  partial: Partial<LeaderboardRow> & Pick<LeaderboardRow, 'playerId' | 'name'>,
): LeaderboardRow {
  return {
    rank: 1,
    photo: '',
    teamName: null,
    teamLogo: null,
    position: null,
    nationality: null,
    goals: 0,
    assists: 0,
    yellowCards: 0,
    redCards: 0,
    matches: 0,
    minutes: 0,
    ...partial,
  }
}

describe('utils/leaderboard', () => {
  it('builds rows from player profiles', () => {
    const profiles = [
      createPlayerProfile({
        player: { id: 7, name: 'Haaland', nationality: 'Norway' },
        statistics: [
          createStatistics({
            team: { id: 50, name: 'Man City', logo: 'city.png' },
            goals: { total: 25, conceded: 0, assists: 4, saves: null },
          }),
        ],
      }),
    ]

    expect(buildLeaderboardRows(profiles)[0]).toMatchObject({
      rank: 1,
      playerId: 7,
      name: 'Haaland',
      photo: expect.any(String),
      teamName: 'Man City',
      teamLogo: 'city.png',
      position: 'Attacker',
      goals: 25,
      assists: 4,
      nationality: 'Norway',
    })
  })

  it('builds null team and position fields when stats are missing', () => {
    const [built] = buildLeaderboardRows([
      createPlayerProfile({
        player: { id: 9, name: 'Bench' },
        statistics: [],
      }),
    ])

    expect(built).toMatchObject({
      playerId: 9,
      teamName: null,
      teamLogo: null,
      position: null,
      goals: 0,
      assists: 0,
    })
  })

  it('sorts string columns and treats nulls as empty strings', () => {
    const rows = [
      row({ playerId: 1, name: 'Zed', teamName: 'United', position: 'FW', nationality: 'Spain' }),
      row({
        playerId: 2,
        name: 'Amy',
        teamName: null,
        position: null,
        nationality: null,
      }),
      row({
        playerId: 3,
        name: 'Ben',
        teamName: 'Arsenal',
        position: 'MF',
        nationality: 'England',
      }),
    ]

    expect(
      sortLeaderboardRows(rows, 'name', 'asc').map((item) => item.name),
    ).toEqual(['Amy', 'Ben', 'Zed'])

    expect(
      sortLeaderboardRows(rows, 'team', 'asc').map((item) => item.playerId),
    ).toEqual([2, 3, 1])

    expect(
      sortLeaderboardRows(rows, 'position', 'desc').map((item) => item.playerId),
    ).toEqual([3, 1, 2])

    expect(
      sortLeaderboardRows(rows, 'nationality', 'asc').map(
        (item) => item.playerId,
      ),
    ).toEqual([2, 3, 1])
  })

  it('sorts every numeric column and reassigns ranks', () => {
    const rows = [
      row({
        playerId: 1,
        name: 'A',
        matches: 10,
        minutes: 900,
        goals: 5,
        assists: 2,
        yellowCards: 1,
        redCards: 0,
      }),
      row({
        playerId: 2,
        name: 'B',
        matches: 20,
        minutes: 1800,
        goals: 12,
        assists: 8,
        yellowCards: 4,
        redCards: 2,
      }),
      row({
        playerId: 3,
        name: 'C',
        matches: 15,
        minutes: 1200,
        goals: 8,
        assists: 5,
        yellowCards: 2,
        redCards: 1,
      }),
    ]

    const cases: Array<[LeaderboardSortKey, number[]]> = [
      ['matches', [2, 3, 1]],
      ['minutes', [2, 3, 1]],
      ['goals', [2, 3, 1]],
      ['assists', [2, 3, 1]],
      ['yellowCards', [2, 3, 1]],
      ['redCards', [2, 3, 1]],
    ]

    for (const [key, expectedIds] of cases) {
      const sorted = sortLeaderboardRows(rows, key, 'desc')
      expect(sorted.map((item) => item.playerId)).toEqual(expectedIds)
      expect(sorted.map((item) => item.rank)).toEqual([1, 2, 3])
    }

    expect(
      sortLeaderboardRows(rows, 'goals', 'asc').map((item) => item.playerId),
    ).toEqual([1, 3, 2])
  })

  it('keeps relative order for unknown sort keys', () => {
    const rows = [
      row({ playerId: 1, name: 'A', goals: 5 }),
      row({ playerId: 2, name: 'B', goals: 12 }),
    ]

    const sorted = sortLeaderboardRows(
      rows,
      'unknown' as LeaderboardSortKey,
      'asc',
    )

    expect(sorted.map((item) => item.playerId)).toEqual([1, 2])
    expect(sorted.map((item) => item.rank)).toEqual([1, 2])
  })

  it('exposes expected table columns', () => {
    expect(LEADERBOARD_COLUMNS.map((column) => column.key)).toEqual([
      'name',
      'team',
      'position',
      'nationality',
      'matches',
      'minutes',
      'goals',
      'assists',
      'yellowCards',
      'redCards',
    ])
  })
})
