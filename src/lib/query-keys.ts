import type {
  GetPlayerParams,
  GetPlayersParams,
  GetStandingsParams,
  GetTeamCoachParams,
  GetTeamParams,
  GetTeamsParams,
  GetTeamStatisticsParams,
  LeagueSeasonParams,
  SearchPlayersParams,
  TopPlayersKind,
} from '@/types/api-football'

const TOP_PLAYERS_KEY: Record<TopPlayersKind, string> = {
  scorers: 'top-scorers',
  assists: 'top-assists',
  'yellow-cards': 'top-yellow-cards',
  'red-cards': 'top-red-cards',
}

export const queryKeys = {
  all: ['football'] as const,

  players: {
    all: () => [...queryKeys.all, 'players'] as const,
    lists: () => [...queryKeys.players.all(), 'list'] as const,
    list: (params: GetPlayersParams) =>
      [...queryKeys.players.lists(), params] as const,
    search: (params: SearchPlayersParams) =>
      [...queryKeys.players.all(), 'search', params] as const,
    details: () => [...queryKeys.players.all(), 'detail'] as const,
    detail: (params: GetPlayerParams) =>
      [...queryKeys.players.details(), params] as const,
    seasons: (playerId: number) =>
      [...queryKeys.players.all(), 'seasons', playerId] as const,
    transfers: (playerId: number) =>
      [...queryKeys.players.all(), 'transfers', playerId] as const,
    topPlayers: (kind: TopPlayersKind, params: LeagueSeasonParams) =>
      [...queryKeys.players.all(), TOP_PLAYERS_KEY[kind], params] as const,
  },

  teams: {
    all: () => [...queryKeys.all, 'teams'] as const,
    lists: () => [...queryKeys.teams.all(), 'list'] as const,
    list: (params?: GetTeamsParams) =>
      [...queryKeys.teams.lists(), params ?? {}] as const,
    details: () => [...queryKeys.teams.all(), 'detail'] as const,
    detail: (params: GetTeamParams) =>
      [...queryKeys.teams.details(), params] as const,
    statistics: (params: GetTeamStatisticsParams) =>
      [...queryKeys.teams.all(), 'statistics', params] as const,
    coach: (params: GetTeamCoachParams) =>
      [...queryKeys.teams.all(), 'coach', params] as const,
    standing: (params: GetStandingsParams & { team: number }) =>
      [...queryKeys.teams.all(), 'standing', params] as const,
    fixtures: (params: {
      team: number
      season: number
      league?: number
      upcomingLimit?: number
      recentLimit?: number
    }) => [...queryKeys.teams.all(), 'fixtures', params] as const,
  },

  fixtures: {
    all: () => [...queryKeys.all, 'fixtures'] as const,
    detail: (id: number) => [...queryKeys.fixtures.all(), 'detail', id] as const,
    league: (params: {
      league: number
      season: number
      upcomingLimit?: number
      recentLimit?: number
    }) => [...queryKeys.fixtures.all(), 'league', params] as const,
  },

  standings: {
    all: () => [...queryKeys.all, 'standings'] as const,
    list: (params: GetStandingsParams) =>
      [...queryKeys.standings.all(), 'list', params] as const,
  },
} as const
