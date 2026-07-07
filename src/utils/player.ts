import type { PlayerProfile } from '@/types/api-football'
import type { PlayerPosition } from '@/config/players'

export function getPrimaryStatistics(profile: PlayerProfile) {
  return profile.statistics[0] ?? null
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
