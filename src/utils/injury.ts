import type {
  InjuryRecord,
  SidelinedRecord,
  TransferRecord,
} from '@/types/api-football'
import { formatStayDuration, sortTransfersByDate } from '@/utils/transfer'

export type InjuryRecoveryStatus =
  | 'Recovered'
  | 'Ongoing'
  | 'Expected return'
  | 'Unknown'

export type InjuryHistoryItem = {
  id: string
  injuryType: string
  bodyArea: string | null
  startDate: string
  endDateLabel: string
  recoveryStatus: InjuryRecoveryStatus
  recoveryLabel: string
  matchesMissed: number | null
}

export type InjuryTimelineHighlight = 'current' | 'long-term'

export type InjuryTimelineClub = {
  id: number
  name: string
  logo: string
}

export type InjuryTimelineItem = {
  id: string
  injuryType: string
  bodyArea: string | null
  startDate: string
  returnDateLabel: string
  recoveryDuration: string | null
  club: InjuryTimelineClub | null
  recoveryStatus: InjuryRecoveryStatus
  highlights: InjuryTimelineHighlight[]
}

export const LONG_TERM_INJURY_MS = 30 * 24 * 60 * 60 * 1000

const BODY_AREA_PATTERNS = [
  'Hamstring',
  'Knee',
  'Ankle',
  'Groin',
  'Calf',
  'Thigh',
  'Shoulder',
  'Foot',
  'Back',
  'Hip',
  'Wrist',
  'Achilles',
  'Head',
  'Concussion',
  'Muscle',
  'Leg',
  'Arm',
  'Ribs',
  'Toe',
] as const

function parseDate(date: string | null): Date | null {
  if (!date || date.trim() === '' || /^unknown$/i.test(date.trim())) return null

  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return null

  return parsed
}

export function formatInjuryDate(date: string | null): string {
  const parsed = parseDate(date)
  if (!parsed) return 'Unknown'

  return new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(parsed)
}

export function extractBodyArea(type: string): string | null {
  const normalized = type.trim()
  if (!normalized) return null

  for (const area of BODY_AREA_PATTERNS) {
    if (normalized.toLowerCase().includes(area.toLowerCase())) {
      return area
    }
  }

  const injuryMatch = normalized.match(/^(.+?)\s+injury$/i)
  if (injuryMatch?.[1]) return injuryMatch[1].trim()

  return null
}

export function getInjuryRecoveryStatus(
  start: string,
  end: string | null,
  now = Date.now(),
): { status: InjuryRecoveryStatus; label: string; endDateLabel: string } {
  const startDate = parseDate(start)
  const endDate = parseDate(end)

  if (!endDate) {
    if (startDate && startDate.getTime() <= now) {
      return {
        status: 'Ongoing',
        label: 'Currently sidelined',
        endDateLabel: 'Expected return unknown',
      }
    }

    return {
      status: 'Unknown',
      label: 'Return date unknown',
      endDateLabel: 'Expected return unknown',
    }
  }

  if (endDate.getTime() > now) {
    return {
      status: 'Expected return',
      label: `Expected return ${formatInjuryDate(end)}`,
      endDateLabel: formatInjuryDate(end),
    }
  }

  return {
    status: 'Recovered',
    label: 'Recovered',
    endDateLabel: formatInjuryDate(end),
  }
}

function isWithinRange(
  fixtureDate: string,
  start: Date,
  end: Date | null,
  now: number,
): boolean {
  const fixtureTime = parseDate(fixtureDate)?.getTime()
  if (fixtureTime === undefined || fixtureTime === null) return false

  const rangeEnd = end?.getTime() ?? now
  return fixtureTime >= start.getTime() && fixtureTime <= rangeEnd
}

export function countMatchesMissed(
  sidelined: SidelinedRecord,
  injuries: InjuryRecord[],
  now = Date.now(),
): number | null {
  const startDate = parseDate(sidelined.start)
  if (!startDate) return null

  const endDate = parseDate(sidelined.end)
  const fixtureIds = new Set<number>()

  for (const injury of injuries) {
    if (!isWithinRange(injury.fixture.date, startDate, endDate, now)) continue
    fixtureIds.add(injury.fixture.id)
  }

  return fixtureIds.size > 0 ? fixtureIds.size : null
}

function sortSidelinedByStart(
  sidelinedRecords: SidelinedRecord[],
  direction: 'asc' | 'desc',
): SidelinedRecord[] {
  const multiplier = direction === 'asc' ? 1 : -1

  return [...sidelinedRecords].sort((a, b) => {
    const aTime = parseDate(a.start)?.getTime() ?? Number.NaN
    const bTime = parseDate(b.start)?.getTime() ?? Number.NaN

    if (Number.isNaN(aTime) && Number.isNaN(bTime)) return 0
    if (Number.isNaN(aTime)) return 1
    if (Number.isNaN(bTime)) return -1
    return (aTime - bTime) * multiplier
  })
}

export function getRecoveryDurationLabel(
  start: string,
  end: string | null,
  now = Date.now(),
): string | null {
  const startDate = parseDate(start)
  if (!startDate) return null

  const endDate = parseDate(end)
  const rangeEnd = endDate && endDate.getTime() <= now ? endDate.getTime() : now

  if (rangeEnd < startDate.getTime()) return null

  return formatStayDuration(rangeEnd - startDate.getTime())
}

export function isCurrentInjury(
  status: InjuryRecoveryStatus,
): boolean {
  return status === 'Ongoing' || status === 'Expected return'
}

export function isLongTermInjury(
  start: string,
  end: string | null,
  now = Date.now(),
): boolean {
  const startDate = parseDate(start)
  if (!startDate) return false

  const endDate = parseDate(end)
  const rangeEnd =
    endDate && endDate.getTime() > now
      ? endDate.getTime()
      : endDate && endDate.getTime() <= now
        ? endDate.getTime()
        : now

  return rangeEnd - startDate.getTime() >= LONG_TERM_INJURY_MS
}

export function getInjuryTimelineHighlights(
  start: string,
  end: string | null,
  recoveryStatus: InjuryRecoveryStatus,
  now = Date.now(),
): InjuryTimelineHighlight[] {
  const highlights: InjuryTimelineHighlight[] = []

  if (isCurrentInjury(recoveryStatus)) {
    highlights.push('current')
  }

  if (isLongTermInjury(start, end, now)) {
    highlights.push('long-term')
  }

  return highlights
}

function getClubFromInjuryFixtures(
  sidelined: SidelinedRecord,
  injuries: InjuryRecord[],
  now: number,
): InjuryTimelineClub | null {
  const startDate = parseDate(sidelined.start)
  if (!startDate) return null

  const endDate = parseDate(sidelined.end)

  for (const injury of injuries) {
    if (!isWithinRange(injury.fixture.date, startDate, endDate, now)) continue

    return {
      id: injury.team.id,
      name: injury.team.name,
      logo: injury.team.logo,
    }
  }

  return null
}

export function getClubAtInjury(
  sidelined: SidelinedRecord,
  injuries: InjuryRecord[],
  transfers: TransferRecord[],
  now = Date.now(),
): InjuryTimelineClub | null {
  const fromFixtures = getClubFromInjuryFixtures(sidelined, injuries, now)
  if (fromFixtures) return fromFixtures

  const injuryTime = parseDate(sidelined.start)?.getTime()
  if (injuryTime == null) return null

  let club: InjuryTimelineClub | null = null

  for (const transfer of sortTransfersByDate(transfers, 'asc')) {
    const transferTime = parseDate(transfer.date)?.getTime()
    if (transferTime == null) continue
    if (transferTime > injuryTime) break

    club = {
      id: transfer.teams.in.id,
      name: transfer.teams.in.name,
      logo: transfer.teams.in.logo,
    }
  }

  return club
}

export function buildInjuryHistory(
  sidelinedRecords: SidelinedRecord[],
  injuries: InjuryRecord[],
  now = Date.now(),
): InjuryHistoryItem[] {
  return sortSidelinedByStart(sidelinedRecords, 'desc').map((record, index) => {
    const recovery = getInjuryRecoveryStatus(record.start, record.end, now)

    return {
      id: `${record.type}-${record.start}-${index}`,
      injuryType: record.type,
      bodyArea: extractBodyArea(record.type),
      startDate: formatInjuryDate(record.start),
      endDateLabel: recovery.endDateLabel,
      recoveryStatus: recovery.status,
      recoveryLabel: recovery.label,
      matchesMissed: countMatchesMissed(record, injuries, now),
    }
  })
}

export function buildInjuryTimeline(
  sidelinedRecords: SidelinedRecord[],
  injuries: InjuryRecord[],
  transfers: TransferRecord[] = [],
  now = Date.now(),
): InjuryTimelineItem[] {
  return sortSidelinedByStart(sidelinedRecords, 'asc').map((record, index) => {
    const recovery = getInjuryRecoveryStatus(record.start, record.end, now)

    return {
      id: `${record.type}-${record.start}-${index}`,
      injuryType: record.type,
      bodyArea: extractBodyArea(record.type),
      startDate: formatInjuryDate(record.start),
      returnDateLabel: recovery.endDateLabel,
      recoveryDuration: getRecoveryDurationLabel(record.start, record.end, now),
      club: getClubAtInjury(record, injuries, transfers, now),
      recoveryStatus: recovery.status,
      highlights: getInjuryTimelineHighlights(
        record.start,
        record.end,
        recovery.status,
        now,
      ),
    }
  })
}
