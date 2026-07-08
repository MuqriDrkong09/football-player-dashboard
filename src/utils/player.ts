import type { PlayerProfile, PlayerStatistics } from '@/types/api-football'
import type { PlayerPosition } from '@/config/players'
import { DEFAULT_SEASON } from '@/config/football'

export interface AggregatedPlayerStats {
  goals: number
  assists: number
  minutes: number
  matches: number
  yellowCards: number
  redCards: number
}

export interface CompetitionChartData {
  name: string
  goals: number
  assists: number
  minutes: number
  matches: number
  yellowCards: number
  redCards: number
}

export function getPrimaryStatistics(profile: PlayerProfile) {
  return profile.statistics[0] ?? null
}

export function aggregatePlayerStatistics(
  statistics: PlayerStatistics[],
): AggregatedPlayerStats {
  return statistics.reduce<AggregatedPlayerStats>(
    (totals, stat) => ({
      goals: totals.goals + (stat.goals?.total ?? 0),
      assists: totals.assists + (stat.goals?.assists ?? 0),
      minutes: totals.minutes + (stat.games?.minutes ?? 0),
      matches: totals.matches + (stat.games?.appearences ?? 0),
      yellowCards: totals.yellowCards + (stat.cards?.yellow ?? 0),
      redCards: totals.redCards + (stat.cards?.red ?? 0),
    }),
    {
      goals: 0,
      assists: 0,
      minutes: 0,
      matches: 0,
      yellowCards: 0,
      redCards: 0,
    },
  )
}

export function getCompetitionChartData(
  statistics: PlayerStatistics[],
): CompetitionChartData[] {
  return statistics.map((stat) => ({
    name: stat.league.name,
    goals: stat.goals?.total ?? 0,
    assists: stat.goals?.assists ?? 0,
    minutes: stat.games?.minutes ?? 0,
    matches: stat.games?.appearences ?? 0,
    yellowCards: stat.cards?.yellow ?? 0,
    redCards: stat.cards?.red ?? 0,
  }))
}

export function pickDefaultSeason(seasons: number[]): number | null {
  if (seasons.length === 0) return null
  if (seasons.includes(DEFAULT_SEASON)) return DEFAULT_SEASON
  return Math.max(...seasons)
}

export function getPlayerGoals(profile: PlayerProfile): number {
  return profile.statistics.reduce(
    (total, stat) => total + (stat.goals?.total ?? 0),
    0,
  )
}

export function getPlayerAssists(profile: PlayerProfile): number {
  return profile.statistics.reduce(
    (total, stat) => total + (stat.goals?.assists ?? 0),
    0,
  )
}

export function filterPlayersByPosition(
  players: PlayerProfile[],
  position: PlayerPosition | 'all',
): PlayerProfile[] {
  if (position === 'all') return players

  return players.filter((profile) => {
    const stats = getPrimaryStatistics(profile)
    return stats?.games?.position === position
  })
}

export function filterPlayersByNationality(
  players: PlayerProfile[],
  nationality: string,
): PlayerProfile[] {
  if (nationality === 'all') return players

  return players.filter((profile) => profile.player.nationality === nationality)
}

export function getUniqueNationalities(players: PlayerProfile[]): string[] {
  const nationalities = players
    .map((profile) => profile.player.nationality)
    .filter((value): value is string => Boolean(value))

  return [...new Set(nationalities)].sort()
}
