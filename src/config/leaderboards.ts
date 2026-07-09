export type LeaderboardStatKey =
  | 'goals'
  | 'assists'
  | 'yellowCards'
  | 'redCards'

export type LeaderboardTabValue =
  | 'scorers'
  | 'assists'
  | 'yellow-cards'
  | 'red-cards'

export type LeaderboardTab = {
  value: LeaderboardTabValue
  label: string
  description: string
  primaryStat: LeaderboardStatKey
}

export const LEADERBOARD_TABS: LeaderboardTab[] = [
  {
    value: 'scorers',
    label: 'Top Scorers',
    description: 'Players ranked by goals scored',
    primaryStat: 'goals',
  },
  {
    value: 'assists',
    label: 'Top Assists',
    description: 'Players ranked by assists',
    primaryStat: 'assists',
  },
  {
    value: 'yellow-cards',
    label: 'Most Yellow Cards',
    description: 'Players ranked by yellow cards received',
    primaryStat: 'yellowCards',
  },
  {
    value: 'red-cards',
    label: 'Most Red Cards',
    description: 'Players ranked by red cards received',
    primaryStat: 'redCards',
  },
]

export function getLeaderboardTab(value: string): LeaderboardTab {
  return (
    LEADERBOARD_TABS.find((tab) => tab.value === value) ?? LEADERBOARD_TABS[0]
  )
}
