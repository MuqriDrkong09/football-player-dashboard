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
  country?: string | null
  founded?: number | null
  national?: boolean
}

export interface LeagueInfo {
  id: number
  name: string
  country: string
  logo: string
  flag: string | null
  season: number
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

export interface GetPlayerSeasonsParams {
  player: number
}

export interface TransferTeam {
  id: number
  name: string
  logo: string
}

export interface TransferRecord {
  date: string | null
  type: string | null
  teams: {
    in: TransferTeam
    out: TransferTeam
  }
}

export interface PlayerTransfers {
  player: Pick<PlayerInfo, 'id' | 'name'>
  update: string
  transfers: TransferRecord[]
}

export interface GetPlayerTransfersParams {
  player: number
}

export interface SearchPlayersParams {
  search: string
  league?: number
  team?: number
  season?: number
  page?: number
}

/** Shared params for league-season leaderboard endpoints. */
export interface LeagueSeasonParams {
  league: number
  season: number
}

export type TopPlayersKind =
  'scorers' | 'assists' | 'yellow-cards' | 'red-cards'

export interface GetTeamsParams {
  id?: number
  name?: string
  league?: number
  season?: number
  country?: string
  search?: string
  page?: number
}

export interface GetTeamParams {
  id: number
}

export interface GetTeamStatisticsParams {
  team: number
  league: number
  season: number
}

export interface GetTeamCoachParams {
  team: number
}

export interface GetStandingsParams {
  league: number
  season: number
  team?: number
}

export interface TeamStatSplit {
  home: number | null
  away: number | null
  total: number | null
}

export interface TeamStatisticsFixtures {
  played: TeamStatSplit
  wins: TeamStatSplit
  draws: TeamStatSplit
  loses: TeamStatSplit
}

export interface TeamGoalsMinuteBucket {
  total: number | null
  percentage: string | null
}

export interface TeamStatisticsGoals {
  for: {
    total: TeamStatSplit
    average: { home: string | null; away: string | null; total: string | null }
    minute?: Record<string, TeamGoalsMinuteBucket>
  }
  against: {
    total: TeamStatSplit
    average: { home: string | null; away: string | null; total: string | null }
    minute?: Record<string, TeamGoalsMinuteBucket>
  }
}

export interface TeamStatistics {
  league: LeagueInfo
  team: TeamInfo
  form: string | null
  fixtures: TeamStatisticsFixtures
  goals: TeamStatisticsGoals
}

export interface CoachCareerItem {
  team: TeamInfo
  start: string | null
  end: string | null
}

export interface Coach {
  id: number
  name: string | null
  firstname: string | null
  lastname: string | null
  age: number | null
  nationality: string | null
  photo: string | null
  team: TeamInfo | null
  career: CoachCareerItem[]
}

export interface StandingTeamGoals {
  for: number
  against: number
}

export interface StandingTeamRecord {
  played: number
  win: number
  draw: number
  lose: number
  goals: StandingTeamGoals
}

export interface StandingRow {
  rank: number
  team: TeamInfo
  points: number
  goalsDiff: number
  group: string
  form: string | null
  status: string | null
  description: string | null
  all: StandingTeamRecord
  home: StandingTeamRecord
  away: StandingTeamRecord
  update: string
}

export interface StandingLeague {
  id: number
  name: string
  country: string
  logo: string
  flag: string | null
  season: number
  standings: StandingRow[][]
}

export interface StandingResponseItem {
  league: StandingLeague
}

export interface FixtureStatus {
  long: string | null
  short: string | null
  elapsed: number | null
}

export interface FixtureVenue {
  id: number | null
  name: string | null
  city: string | null
}

export interface FixtureInfo {
  id: number
  referee: string | null
  timezone: string
  date: string
  timestamp: number
  venue: FixtureVenue
  status: FixtureStatus
}

export interface FixtureLeague {
  id: number
  name: string
  country: string
  logo: string
  flag: string | null
  season: number
  round: string | null
}

export interface FixtureTeam {
  id: number
  name: string
  logo: string
  winner: boolean | null
}

export interface FixtureGoals {
  home: number | null
  away: number | null
}

export interface FixtureScoreLine {
  home: number | null
  away: number | null
}

export interface FixtureScore {
  halftime: FixtureScoreLine
  fulltime: FixtureScoreLine
  extratime: FixtureScoreLine
  penalty: FixtureScoreLine
}

export interface Fixture {
  fixture: FixtureInfo
  league: FixtureLeague
  teams: {
    home: FixtureTeam
    away: FixtureTeam
  }
  goals: FixtureGoals
  score: FixtureScore
}

export interface GetFixturesParams {
  id?: number
  ids?: string
  live?: string
  date?: string
  league?: number
  season?: number
  team?: number
  last?: number
  next?: number
  from?: string
  to?: string
  round?: string
  status?: string
  venue?: number
  timezone?: string
}
