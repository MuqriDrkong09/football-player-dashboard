export interface ApiFootballPaging {
  current: number
  total: number
}

export type ApiFootballErrors = Record<string, string> | string[]

export interface ApiFootballResponse<T> {
  get: string
  parameters: Record<string, string | number | boolean | undefined>
  errors: ApiFootballErrors
  results: number
  paging: ApiFootballPaging
  response: T
}

export interface PaginatedResult<T> {
  data: T
  results: number
  paging: ApiFootballPaging
}

export interface PlayerBirth {
  date: string | null
  place: string | null
  country: string | null
}

export interface PlayerInfo {
  id: number
  name: string
  firstname: string | null
  lastname: string | null
  age: number | null
  birth: PlayerBirth
  nationality: string | null
  height: string | null
  weight: string | null
  injured: boolean
  photo: string
}

export interface TeamInfo {
  id: number
  name: string
  logo: string
}

export interface LeagueInfo {
  id: number
  name: string
  country: string
  logo: string
  flag: string | null
  season: number
}

export interface LeagueSeason {
  year: number
  start: string
  end: string
  current: boolean
  coverage: {
    fixtures: {
      events: boolean
      lineups: boolean
      statistics_fixtures: boolean
      statistics_players: boolean
    }
    standings: boolean
    players: boolean
    top_scorers: boolean
    top_assists: boolean
    top_cards: boolean
    injuries: boolean
    predictions: boolean
    odds: boolean
  }
}

export interface LeagueCountry {
  name: string
  code: string | null
  flag: string | null
}

export interface League {
  league: {
    id: number
    name: string
    type: string
    logo: string
  }
  country: LeagueCountry
  seasons: LeagueSeason[]
}

export interface TeamVenue {
  id: number | null
  name: string | null
  address: string | null
  city: string | null
  capacity: number | null
  surface: string | null
  image: string | null
}

export interface Team {
  team: TeamInfo
  venue: TeamVenue
}

export interface PlayerGames {
  appearences: number | null
  lineups: number | null
  minutes: number | null
  number: number | null
  position: string | null
  rating: string | null
  captain: boolean
}

export interface PlayerGoals {
  total: number | null
  conceded: number | null
  assists: number | null
  saves: number | null
}

export interface PlayerShots {
  total: number | null
  on: number | null
}

export interface PlayerPasses {
  total: number | null
  key: number | null
  accuracy: number | null
}

export interface PlayerTackles {
  total: number | null
  blocks: number | null
  interceptions: number | null
}

export interface PlayerDuels {
  total: number | null
  won: number | null
}

export interface PlayerDribbles {
  attempts: number | null
  success: number | null
  past: number | null
}

export interface PlayerFouls {
  drawn: number | null
  committed: number | null
}

export interface PlayerCards {
  yellow: number | null
  yellowred: number | null
  red: number | null
}

export interface PlayerPenalty {
  won: number | null
  committed: number | null
  scored: number | null
  missed: number | null
  saved: number | null
}

export interface PlayerStatistics {
  team: TeamInfo
  league: LeagueInfo
  games: PlayerGames
  substitutes: { in: number | null; out: number | null; bench: number | null }
  shots: PlayerShots
  goals: PlayerGoals
  passes: PlayerPasses
  tackles: PlayerTackles
  duels: PlayerDuels
  dribbles: PlayerDribbles
  fouls: PlayerFouls
  cards: PlayerCards
  penalty: PlayerPenalty
}

export interface PlayerProfile {
  player: PlayerInfo
  statistics: PlayerStatistics[]
}

export interface GetPlayersParams {
  id?: number
  team?: number
  league?: number
  season?: number
  search?: string
  page?: number
}

export interface GetPlayerParams {
  id: number
  season?: number
}

export interface GetPlayerStatisticsParams {
  id: number
  season: number
}

export interface GetPlayerSeasonsParams {
  player: number
}

export interface SearchPlayersParams {
  search: string
  league?: number
  team?: number
  season?: number
  page?: number
}

export interface GetTopScorersParams {
  league: number
  season: number
}

export interface GetTopAssistsParams {
  league: number
  season: number
}

export interface GetTeamsParams {
  id?: number
  name?: string
  league?: number
  season?: number
  country?: string
  search?: string
  page?: number
}

export interface GetLeaguesParams {
  id?: number
  name?: string
  country?: string
  code?: string
  season?: number
  team?: number
  type?: string
  current?: boolean
  search?: string
  page?: number
}
