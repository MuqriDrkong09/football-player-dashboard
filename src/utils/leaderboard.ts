import type { PlayerProfile } from '@/types/api-football'
import { aggregatePlayerStatistics, getPrimaryStatistics } from '@/utils/player'

export type LeaderboardSortKey =
  | 'name'
  | 'team'
  | 'position'
  | 'nationality'
  | 'matches'
  | 'minutes'
  | 'goals'
  | 'assists'
  | 'yellowCards'
  | 'redCards'

export type SortDirection = 'asc' | 'desc'

export type LeaderboardRow = {
  rank: number
  playerId: number
  name: string
  photo: string
  teamName: string | null
  teamLogo: string | null
  position: string | null
  nationality: string | null
  goals: number
  assists: number
  yellowCards: number
  redCards: number
  matches: number
  minutes: number
}

export function buildLeaderboardRows(
  profiles: PlayerProfile[],
): LeaderboardRow[] {
  return profiles.map((profile, index) => {
    const stats = getPrimaryStatistics(profile)
    const totals = aggregatePlayerStatistics(profile.statistics)

    return {
      rank: index + 1,
      playerId: profile.player.id,
      name: profile.player.name,
      photo: profile.player.photo,
      teamName: stats?.team?.name ?? null,
      teamLogo: stats?.team?.logo ?? null,
      position: stats?.games?.position ?? null,
      nationality: profile.player.nationality,
      goals: totals.goals,
      assists: totals.assists,
      yellowCards: totals.yellowCards,
      redCards: totals.redCards,
      matches: totals.matches,
      minutes: totals.minutes,
    }
  })
}

function compareStrings(a: string | null, b: string | null): number {
  return (a ?? '').localeCompare(b ?? '')
}

export function sortLeaderboardRows(
  rows: LeaderboardRow[],
  sortKey: LeaderboardSortKey,
  direction: SortDirection,
): LeaderboardRow[] {
  const multiplier = direction === 'asc' ? 1 : -1

  const sorted = [...rows].sort((a, b) => {
    switch (sortKey) {
      case 'name':
        return compareStrings(a.name, b.name) * multiplier
      case 'team':
        return compareStrings(a.teamName, b.teamName) * multiplier
      case 'position':
        return compareStrings(a.position, b.position) * multiplier
      case 'nationality':
        return compareStrings(a.nationality, b.nationality) * multiplier
      case 'matches':
        return (a.matches - b.matches) * multiplier
      case 'minutes':
        return (a.minutes - b.minutes) * multiplier
      case 'goals':
        return (a.goals - b.goals) * multiplier
      case 'assists':
        return (a.assists - b.assists) * multiplier
      case 'yellowCards':
        return (a.yellowCards - b.yellowCards) * multiplier
      case 'redCards':
        return (a.redCards - b.redCards) * multiplier
      default:
        return 0
    }
  })

  return sorted.map((row, index) => ({ ...row, rank: index + 1 }))
}

export const LEADERBOARD_COLUMNS: {
  key: LeaderboardSortKey
  label: string
  className?: string
  align?: 'left' | 'right'
}[] = [
  { key: 'name', label: 'Player', className: 'min-w-[12rem]' },
  {
    key: 'team',
    label: 'Team',
    className: 'hidden sm:table-cell min-w-[9rem]',
  },
  {
    key: 'position',
    label: 'Pos',
    className: 'hidden md:table-cell',
    align: 'right',
  },
  {
    key: 'nationality',
    label: 'Nation',
    className: 'hidden lg:table-cell',
  },
  {
    key: 'matches',
    label: 'Apps',
    className: 'hidden md:table-cell',
    align: 'right',
  },
  {
    key: 'minutes',
    label: 'Mins',
    className: 'hidden lg:table-cell',
    align: 'right',
  },
  { key: 'goals', label: 'Goals', align: 'right' },
  {
    key: 'assists',
    label: 'Assists',
    className: 'hidden sm:table-cell',
    align: 'right',
  },
  {
    key: 'yellowCards',
    label: 'YC',
    className: 'hidden md:table-cell',
    align: 'right',
  },
  {
    key: 'redCards',
    label: 'RC',
    className: 'hidden md:table-cell',
    align: 'right',
  },
]
