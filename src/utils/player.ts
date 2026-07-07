import type { PlayerProfile } from '@/types/api-football'

export function getPrimaryStatistics(profile: PlayerProfile) {
  return profile.statistics[0] ?? null
}

export function getPlayerGoals(profile: PlayerProfile): number {
  return (
    profile.statistics.reduce(
      (total, stat) => total + (stat.goals?.total ?? 0),
      0,
    ) ?? 0
  )
}

export function getPlayerAssists(profile: PlayerProfile): number {
  return (
    profile.statistics.reduce(
      (total, stat) => total + (stat.goals?.assists ?? 0),
      0,
    ) ?? 0
  )
}
