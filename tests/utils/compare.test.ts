import {
  COMPARISON_STATS,
  buildComparisonChartData,
  buildSeasonComparisonDeltas,
  countComparisonWins,
  countSeasonComparisonChanges,
  getBetterPlayer,
  type ComparisonStatKey,
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
  it('exposes the expected comparison stat metadata', () => {
    expect(COMPARISON_STATS).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: 'goals', higherIsBetter: true }),
        expect.objectContaining({ key: 'yellowCards', higherIsBetter: false }),
      ]),
    )
  })

  it('picks the better player for higher-is-better stats', () => {
    expect(getBetterPlayer('goals', 10, 8)).toBe('player1')
    expect(getBetterPlayer('assists', 3, 7)).toBe('player2')
    expect(getBetterPlayer('minutes', 100, 100)).toBe('tie')
  })

  it('picks the better player for lower-is-better card stats', () => {
    expect(getBetterPlayer('yellowCards', 1, 3)).toBe('player1')
    expect(getBetterPlayer('redCards', 2, 0)).toBe('player2')
  })

  it('defaults unknown keys to higher-is-better', () => {
    const unknownKey = 'unknownStat' as ComparisonStatKey

    expect(getBetterPlayer(unknownKey, 9, 4)).toBe('player1')
    expect(getBetterPlayer(unknownKey, 2, 8)).toBe('player2')
  })

  it('builds comparison chart rows for all stats', () => {
    const rows = buildComparisonChartData(player1, player2)

    expect(rows).toHaveLength(6)
    expect(rows.find((row) => row.stat === 'goals')).toMatchObject({
      label: 'Goals',
      player1: 20,
      player2: 15,
      player1Better: true,
      player2Better: false,
      isTie: false,
    })
    expect(rows.find((row) => row.stat === 'minutes')).toMatchObject({
      isTie: true,
      player1Better: false,
      player2Better: false,
    })
    expect(rows.find((row) => row.stat === 'yellowCards')).toMatchObject({
      player1Better: false,
      player2Better: true,
    })
    expect(rows.find((row) => row.stat === 'assists')).toMatchObject({
      player1Better: false,
      player2Better: true,
    })
  })

  it('counts wins and ties', () => {
    const totals = countComparisonWins(
      buildComparisonChartData(player1, player2),
    )

    expect(totals).toEqual({
      player1: 3,
      player2: 2,
      ties: 1,
    })
  })

  it('builds season comparison deltas and change totals', () => {
    const deltas = buildSeasonComparisonDeltas(player1, player2)

    expect(deltas.find((item) => item.key === 'goals')).toMatchObject({
      baseline: 20,
      compare: 15,
      delta: -5,
      improved: false,
      declined: true,
      unchanged: false,
    })
    expect(deltas.find((item) => item.key === 'assists')).toMatchObject({
      delta: 5,
      improved: true,
      declined: false,
    })
    expect(deltas.find((item) => item.key === 'minutes')).toMatchObject({
      delta: 0,
      unchanged: true,
    })
    expect(deltas.find((item) => item.key === 'yellowCards')).toMatchObject({
      delta: -2,
      improved: true,
      declined: false,
    })

    expect(countSeasonComparisonChanges(deltas)).toEqual({
      improved: 2,
      declined: 3,
      unchanged: 1,
    })
  })
})
