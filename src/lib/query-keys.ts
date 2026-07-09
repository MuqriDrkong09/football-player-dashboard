import type {
  GetPlayerParams,
  GetPlayersParams,
  GetTeamsParams,
  GetTopAssistsParams,
  GetTopRedCardsParams,
  GetTopScorersParams,
  GetTopYellowCardsParams,
  SearchPlayersParams,
} from '@/types/api-football'

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
    topScorers: (params: GetTopScorersParams) =>
      [...queryKeys.players.all(), 'top-scorers', params] as const,
    topAssists: (params: GetTopAssistsParams) =>
      [...queryKeys.players.all(), 'top-assists', params] as const,
    topYellowCards: (params: GetTopYellowCardsParams) =>
      [...queryKeys.players.all(), 'top-yellow-cards', params] as const,
    topRedCards: (params: GetTopRedCardsParams) =>
      [...queryKeys.players.all(), 'top-red-cards', params] as const,
  },

  teams: {
    all: () => [...queryKeys.all, 'teams'] as const,
    lists: () => [...queryKeys.teams.all(), 'list'] as const,
    list: (params?: GetTeamsParams) =>
      [...queryKeys.teams.lists(), params ?? {}] as const,
  },
} as const
