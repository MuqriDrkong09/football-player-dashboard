import type {
  GetPlayerParams,
  GetPlayersParams,
  GetTeamsParams,
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
    topPlayers: (kind: TopPlayersKind, params: LeagueSeasonParams) =>
      [...queryKeys.players.all(), TOP_PLAYERS_KEY[kind], params] as const,
  },

  teams: {
    all: () => [...queryKeys.all, 'teams'] as const,
    lists: () => [...queryKeys.teams.all(), 'list'] as const,
    list: (params?: GetTeamsParams) =>
      [...queryKeys.teams.lists(), params ?? {}] as const,
  },
} as const
