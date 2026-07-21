import type { AggregatedPlayerStats } from '@/utils/player'

export type ComparisonStatKey = keyof AggregatedPlayerStats

export const COMPARISON_STATS: {
  key: ComparisonStatKey
  label: string
  higherIsBetter: boolean
}[] = [
  { key: 'goals', label: 'Goals', higherIsBetter: true },
  { key: 'assists', label: 'Assists', higherIsBetter: true },
  { key: 'minutes', label: 'Minutes', higherIsBetter: true },
  { key: 'matches', label: 'Matches', higherIsBetter: true },
  { key: 'yellowCards', label: 'Yellow Cards', higherIsBetter: false },
  { key: 'redCards', label: 'Red Cards', higherIsBetter: false },
]

export type ComparisonChartRow = {
  stat: string
  label: string
  player1: number
  player2: number
  player1Better: boolean
  player2Better: boolean
  isTie: boolean
}

export function getBetterPlayer(
  key: ComparisonStatKey,
  player1Value: number,
  player2Value: number,
): 'player1' | 'player2' | 'tie' {
  if (player1Value === player2Value) return 'tie'

  const config = COMPARISON_STATS.find((stat) => stat.key === key)
  const higherIsBetter = config?.higherIsBetter ?? true

  if (higherIsBetter) {
    return player1Value > player2Value ? 'player1' : 'player2'
  }

  return player1Value < player2Value ? 'player1' : 'player2'
}

export function buildComparisonChartData(
  player1Stats: AggregatedPlayerStats,
  player2Stats: AggregatedPlayerStats,
): ComparisonChartRow[] {
  return COMPARISON_STATS.map(({ key, label }) => {
    const player1 = player1Stats[key]
    const player2 = player2Stats[key]
    const better = getBetterPlayer(key, player1, player2)

    return {
      stat: key,
      label,
      player1,
      player2,
      player1Better: better === 'player1',
      player2Better: better === 'player2',
      isTie: better === 'tie',
    }
  })
}

export function countComparisonWins(rows: ComparisonChartRow[]) {
  return rows.reduce(
    (totals, row) => ({
      player1: totals.player1 + (row.player1Better ? 1 : 0),
      player2: totals.player2 + (row.player2Better ? 1 : 0),
      ties: totals.ties + (row.isTie ? 1 : 0),
    }),
    { player1: 0, player2: 0, ties: 0 },
  )
}

export type SeasonComparisonDelta = {
  key: ComparisonStatKey
  label: string
  baseline: number
  compare: number
  delta: number
  improved: boolean
  declined: boolean
  unchanged: boolean
}

export function buildSeasonComparisonDeltas(
  baselineStats: AggregatedPlayerStats,
  compareStats: AggregatedPlayerStats,
): SeasonComparisonDelta[] {
  return COMPARISON_STATS.map(({ key, label, higherIsBetter }) => {
    const baseline = baselineStats[key]
    const compare = compareStats[key]
    const delta = compare - baseline

    return {
      key,
      label,
      baseline,
      compare,
      delta,
      improved: higherIsBetter ? delta > 0 : delta < 0,
      declined: higherIsBetter ? delta < 0 : delta > 0,
      unchanged: delta === 0,
    }
  })
}

export function countSeasonComparisonChanges(deltas: SeasonComparisonDelta[]) {
  return deltas.reduce(
    (totals, item) => ({
      improved: totals.improved + (item.improved ? 1 : 0),
      declined: totals.declined + (item.declined ? 1 : 0),
      unchanged: totals.unchanged + (item.unchanged ? 1 : 0),
    }),
    { improved: 0, declined: 0, unchanged: 0 },
  )
}
