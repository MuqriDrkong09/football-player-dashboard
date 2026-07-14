import {
  buildComparisonChartData,
  countComparisonWins,
  getBetterPlayer,
} from '@/utils/compare'
import type { AggregatedPlayerStats } from '@/utils/player'

const player1: AggregatedPlayerStats = {
  goals: 20,
  assists: 5,
  minutes: 2000,
  matches: 30,
  yellowCards: 4,
  redCards: 0,
}

const player2: AggregatedPlayerStats = {
  goals: 15,
  assists: 10,
  minutes: 2000,
  matches: 28,
  yellowCards: 2,
  redCards: 1,
}

describe('utils/compare', () => {
  it('picks the better player for higher-is-better stats', () => {
    expect(getBetterPlayer('goals', 10, 8)).toBe('player1')
    expect(getBetterPlayer('assists', 3, 7)).toBe('player2')
    expect(getBetterPlayer('minutes', 100, 100)).toBe('tie')
  })

  it('picks the better player for lower-is-better card stats', () => {
    expect(getBetterPlayer('yellowCards', 1, 3)).toBe('player1')
    expect(getBetterPlayer('redCards', 2, 0)).toBe('player2')
  })

  it('builds comparison chart rows for all stats', () => {
    const rows = buildComparisonChartData(player1, player2)

    expect(rows).toHaveLength(6)
    expect(rows.find((row) => row.stat === 'goals')).toMatchObject({
      player1Better: true,
      player2Better: false,
      isTie: false,
    })
    expect(rows.find((row) => row.stat === 'minutes')).toMatchObject({
      isTie: true,
    })
    expect(rows.find((row) => row.stat === 'yellowCards')).toMatchObject({
      player1Better: false,
      player2Better: true,
    })
  })

  it('counts wins and ties', () => {
    const totals = countComparisonWins(
      buildComparisonChartData(player1, player2),
    )

    expect(totals.player1 + totals.player2 + totals.ties).toBe(6)
    expect(totals.ties).toBeGreaterThanOrEqual(1)
  })
})
