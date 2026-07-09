import { apiGet } from '@/api/client'
import type {
  GetPlayerParams,
  GetPlayersParams,
  GetPlayerSeasonsParams,
  GetPlayerStatisticsParams,
  GetTopAssistsParams,
  GetTopRedCardsParams,
  GetTopScorersParams,
  GetTopYellowCardsParams,
  PaginatedResult,
  PlayerProfile,
  SearchPlayersParams,
} from '@/types/api-football'

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

export async function getPlayerStatistics(
  params: GetPlayerStatisticsParams,
): Promise<PlayerProfile | null> {
  const { data } = await apiGet<PlayerProfile[]>('/players', {
    id: params.id,
    season: params.season,
  })

  return data[0] ?? null
}

export async function getPlayerSeasons(
  params: GetPlayerSeasonsParams,
): Promise<number[]> {
  const { data } = await apiGet<number[]>('/players/seasons', params)
  return data
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

export async function getTopScorers(
  params: GetTopScorersParams,
): Promise<PaginatedResult<PlayerProfile[]>> {
  return apiGet<PlayerProfile[]>('/players/topscorers', params)
}

export async function getTopAssists(
  params: GetTopAssistsParams,
): Promise<PaginatedResult<PlayerProfile[]>> {
  return apiGet<PlayerProfile[]>('/players/topassists', params)
}

export async function getTopYellowCards(
  params: GetTopYellowCardsParams,
): Promise<PaginatedResult<PlayerProfile[]>> {
  return apiGet<PlayerProfile[]>('/players/topyellowcards', params)
}

export async function getTopRedCards(
  params: GetTopRedCardsParams,
): Promise<PaginatedResult<PlayerProfile[]>> {
  return apiGet<PlayerProfile[]>('/players/topredcards', params)
}
