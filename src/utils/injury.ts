import type { InjuryRecord, SidelinedRecord } from '@/types/api-football'

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

export function buildInjuryHistory(
  sidelinedRecords: SidelinedRecord[],
  injuries: InjuryRecord[],
  now = Date.now(),
): InjuryHistoryItem[] {
  return [...sidelinedRecords]
    .sort((a, b) => {
      const aTime = parseDate(a.start)?.getTime() ?? Number.NaN
      const bTime = parseDate(b.start)?.getTime() ?? Number.NaN

      if (Number.isNaN(aTime) && Number.isNaN(bTime)) return 0
      if (Number.isNaN(aTime)) return 1
      if (Number.isNaN(bTime)) return -1
      return bTime - aTime
    })
    .map((record, index) => {
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
