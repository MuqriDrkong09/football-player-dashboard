import { apiGet } from '@/api/client'
import type {
  GetPlayerParams,
  GetPlayersParams,
  GetPlayerSeasonsParams,
  GetPlayerTransfersParams,
  LeagueSeasonParams,
  PaginatedResult,
  PlayerProfile,
  PlayerTransfers,
  SearchPlayersParams,
  TopPlayersKind,
} from '@/types/api-football'

const TOP_PLAYERS_ENDPOINTS: Record<TopPlayersKind, string> = {
  scorers: '/players/topscorers',
  assists: '/players/topassists',
  'yellow-cards': '/players/topyellowcards',
  'red-cards': '/players/topredcards',
}

export async function getPlayers(
  params: GetPlayersParams,
): Promise<PaginatedResult<PlayerProfile[]>> {
  return apiGet<PlayerProfile[]>('/players', params)
}

export async function getPlayer(
  params: GetPlayerParams,
): Promise<PlayerProfile | null> {
  const { data } = await apiGet<PlayerProfile[]>('/players', params)
  return data[0] ?? null
}

export async function getPlayerSeasons(
  params: GetPlayerSeasonsParams,
): Promise<number[]> {
  const { data } = await apiGet<number[]>('/players/seasons', params)
  return data
}

export async function getPlayerTransfers(
  params: GetPlayerTransfersParams,
): Promise<PlayerTransfers | null> {
  const { data } = await apiGet<PlayerTransfers[]>('/transfers', params)
  return data[0] ?? null
}

export async function searchPlayers(
  params: SearchPlayersParams,
): Promise<PaginatedResult<PlayerProfile[]>> {
  return apiGet<PlayerProfile[]>('/players', {
    search: params.search,
    league: params.league,
    team: params.team,
    season: params.season,
    page: params.page,
  })
}

export async function getTopPlayers(
  kind: TopPlayersKind,
  params: LeagueSeasonParams,
): Promise<PaginatedResult<PlayerProfile[]>> {
  return apiGet<PlayerProfile[]>(TOP_PLAYERS_ENDPOINTS[kind], params)
}
