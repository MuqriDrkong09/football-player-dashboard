import type {
  StandingRow,
  TeamStatistics,
} from '@/types/api-football'

export type TeamSeasonStats = {
  matchesPlayed: number
  wins: number
  draws: number
  losses: number
  goalsScored: number
  goalsConceded: number
  goalDifference: number
  position: number | null
  form: string[]
  leagueName: string | null
}

export function parseTeamForm(form: string | null | undefined): string[] {
  if (!form) return []
  return form.replace(/\s+/g, '').toUpperCase().split('').slice(-5)
}

export function buildTeamSeasonStats(
  statistics: TeamStatistics | null,
  standing: StandingRow | null,
): TeamSeasonStats | null {
  if (!statistics && !standing) return null

  const matchesPlayed =
    statistics?.fixtures.played.total ?? standing?.all.played ?? 0
  const wins = statistics?.fixtures.wins.total ?? standing?.all.win ?? 0
  const draws = statistics?.fixtures.draws.total ?? standing?.all.draw ?? 0
  const losses = statistics?.fixtures.loses.total ?? standing?.all.lose ?? 0
  const goalsScored =
    statistics?.goals.for.total.total ?? standing?.all.goals.for ?? 0
  const goalsConceded =
    statistics?.goals.against.total.total ?? standing?.all.goals.against ?? 0
  const goalDifference =
    standing?.goalsDiff ?? goalsScored - goalsConceded
  const form = parseTeamForm(statistics?.form ?? standing?.form)

  return {
    matchesPlayed,
    wins,
    draws,
    losses,
    goalsScored,
    goalsConceded,
    goalDifference,
    position: standing?.rank ?? null,
    form,
    leagueName: statistics?.league.name ?? null,
  }
}
