import {
  buildLeaderboardRows,
  LEADERBOARD_COLUMNS,
  sortLeaderboardRows,
  type LeaderboardRow,
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
      teamName: 'Man City',
      goals: 25,
      assists: 4,
      nationality: 'Norway',
    })
  })

  it('sorts numeric columns and reassigns ranks', () => {
    const rows = [
      row({ playerId: 1, name: 'A', goals: 5 }),
      row({ playerId: 2, name: 'B', goals: 12 }),
      row({ playerId: 3, name: 'C', goals: 8 }),
    ]

    const sorted = sortLeaderboardRows(rows, 'goals', 'desc')
    expect(sorted.map((item) => item.playerId)).toEqual([2, 3, 1])
    expect(sorted.map((item) => item.rank)).toEqual([1, 2, 3])
  })

  it('sorts string columns ascending', () => {
    const rows = [
      row({ playerId: 1, name: 'Zed' }),
      row({ playerId: 2, name: 'Amy' }),
    ]

    expect(
      sortLeaderboardRows(rows, 'name', 'asc').map((item) => item.name),
    ).toEqual(['Amy', 'Zed'])
  })

  it('exposes expected table columns', () => {
    expect(LEADERBOARD_COLUMNS[0].key).toBe('name')
    expect(LEADERBOARD_COLUMNS.some((column) => column.key === 'goals')).toBe(
      true,
    )
  })
})
