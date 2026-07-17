import type { Fixture } from '@/types/api-football'

const COMPLETED_STATUSES = new Set([
  'FT',
  'AET',
  'PEN',
  'AWD',
  'WO',
])

export function isFixtureCompleted(fixture: Fixture): boolean {
  const short = fixture.fixture.status.short
  return short != null && COMPLETED_STATUSES.has(short)
}

function fixtureTimestamp(fixture: Fixture): number {
  return new Date(fixture.fixture.date).getTime()
}

function compareByDateAsc(a: Fixture, b: Fixture): number {
  return fixtureTimestamp(a) - fixtureTimestamp(b)
}

function compareByDateDesc(a: Fixture, b: Fixture): number {
  return fixtureTimestamp(b) - fixtureTimestamp(a)
}

/** Upcoming fixtures for free-plan season lists (no `next` param). */
export function pickUpcomingFixtures(
  fixtures: Fixture[],
  limit: number,
  now: Date = new Date(),
): Fixture[] {
  const nowMs = now.getTime()

  return fixtures
    .filter((fixture) => {
      if (isFixtureCompleted(fixture)) return false
      const time = fixtureTimestamp(fixture)
      return Number.isNaN(time) || time >= nowMs
    })
    .sort(compareByDateAsc)
    .slice(0, limit)
}

/** Recent completed fixtures for free-plan season lists (no `last` param). */
export function pickRecentFixtures(
  fixtures: Fixture[],
  limit: number,
): Fixture[] {
  return fixtures
    .filter(isFixtureCompleted)
    .sort(compareByDateDesc)
    .slice(0, limit)
}

export function formatFixtureDate(isoDate: string): string {
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return 'Date TBD'

  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export function formatFixtureKickoff(isoDate: string): string {
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return 'Kickoff TBD'

  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

export function formatFixtureScore(fixture: Fixture): string | null {
  if (!isFixtureCompleted(fixture)) return null

  const home =
    fixture.goals.home ??
    fixture.score.fulltime.home ??
    fixture.score.extratime.home
  const away =
    fixture.goals.away ??
    fixture.score.fulltime.away ??
    fixture.score.extratime.away

  if (home == null || away == null) return null
  return `${home} – ${away}`
}

export function getFixtureCompetitionLabel(fixture: Fixture): string {
  const { name, round } = fixture.league
  if (round) return `${name} · ${round}`
  return name
}
