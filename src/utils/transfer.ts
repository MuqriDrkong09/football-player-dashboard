import { formatSeasonLabel } from '@/config/football'
import type { TransferRecord } from '@/types/api-football'

export type ParsedTransferDetails = {
  transferType: string
  fee: string | null
}

export type TransferHighlight = 'record' | 'free' | 'loan' | null

export type CareerSummary = {
  totalClubs: number
  totalTransfers: number
  currentClub: TransferRecord['teams']['in'] | null
  longestClubStay: {
    clubName: string
    durationLabel: string
  } | null
  mostExpensiveTransfer: string | null
}

function parseTransferTimestamp(date: string | null): number | null {
  if (!date) return null

  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return null

  return parsed.getTime()
}

export function formatStayDuration(durationMs: number): string {
  const days = Math.floor(durationMs / (1000 * 60 * 60 * 24))

  if (days < 30) {
    return `${days} day${days === 1 ? '' : 's'}`
  }

  const months = Math.floor(days / 30)

  if (months < 12) {
    return `${months} mo`
  }

  const years = Math.floor(months / 12)
  const remainingMonths = months % 12

  if (remainingMonths === 0) {
    return `${years} yr${years === 1 ? '' : 's'}`
  }

  return `${years} yr${years === 1 ? '' : 's'} ${remainingMonths} mo`
}

function collectUniqueClubIds(transfers: TransferRecord[]): Set<number> {
  const clubIds = new Set<number>()

  for (const transfer of transfers) {
    clubIds.add(transfer.teams.in.id)
    clubIds.add(transfer.teams.out.id)
  }

  return clubIds
}

function buildClubStayDurations(
  transfers: TransferRecord[],
): Array<{ clubId: number; clubName: string; durationMs: number }> {
  const sortedTransfers = sortTransfersByDate(transfers, 'asc')
  const now = Date.now()
  const stayTotals = new Map<number, { clubName: string; durationMs: number }>()

  for (let index = 0; index < sortedTransfers.length; index++) {
    const transfer = sortedTransfers[index]
    const startTime = parseTransferTimestamp(transfer.date)
    if (startTime === null) continue

    const club = transfer.teams.in
    let endTime = now

    for (let nextIndex = index + 1; nextIndex < sortedTransfers.length; nextIndex++) {
      const nextTransfer = sortedTransfers[nextIndex]
      if (nextTransfer.teams.out.id !== club.id) continue

      const leaveTime = parseTransferTimestamp(nextTransfer.date)
      if (leaveTime !== null) {
        endTime = leaveTime
      }
      break
    }

    const durationMs = Math.max(0, endTime - startTime)
    const existing = stayTotals.get(club.id)

    if (existing) {
      existing.durationMs += durationMs
    } else {
      stayTotals.set(club.id, { clubName: club.name, durationMs })
    }
  }

  return Array.from(stayTotals.entries()).map(([clubId, stay]) => ({
    clubId,
    clubName: stay.clubName,
    durationMs: stay.durationMs,
  }))
}

function getMostExpensiveTransferFee(
  transfers: TransferRecord[],
): string | null {
  let maxFeeValue = 0
  let maxFeeLabel: string | null = null

  for (const transfer of transfers) {
    const { fee } = parseTransferDetails(transfer.type)
    if (!fee) continue

    const feeValue = parseFeeValue(fee)
    if (feeValue > maxFeeValue) {
      maxFeeValue = feeValue
      maxFeeLabel = fee
    }
  }

  return maxFeeLabel
}

function getCurrentClub(
  transfers: TransferRecord[],
): TransferRecord['teams']['in'] | null {
  const sortedTransfers = sortTransfersByDate(transfers, 'desc')
  return sortedTransfers[0].teams.in
}

export function buildCareerSummaryFromTransfers(
  transfers: TransferRecord[],
): CareerSummary {
  if (transfers.length === 0) {
    return {
      totalClubs: 0,
      totalTransfers: 0,
      currentClub: null,
      longestClubStay: null,
      mostExpensiveTransfer: null,
    }
  }

  const stays = buildClubStayDurations(transfers)
  const longestStay = stays.reduce<(typeof stays)[number] | null>(
    (longest, stay) => {
      if (!longest || stay.durationMs > longest.durationMs) return stay
      return longest
    },
    null,
  )

  return {
    totalClubs: collectUniqueClubIds(transfers).size,
    totalTransfers: transfers.length,
    currentClub: getCurrentClub(transfers),
    longestClubStay: longestStay
      ? {
          clubName: longestStay.clubName,
          durationLabel: formatStayDuration(longestStay.durationMs),
        }
      : null,
    mostExpensiveTransfer: getMostExpensiveTransferFee(transfers),
  }
}

export function parseFeeValue(fee: string): number {
  const normalized = fee.replace(/,/g, '').trim()
  const match = normalized.match(/(\d+(?:\.\d+)?)/)
  if (!match) return 0

  const value = Number(match[1])
  if (Number.isNaN(value)) return 0

  if (/m$/i.test(normalized)) return value * 1_000_000
  if (/k$/i.test(normalized)) return value * 1_000

  return value
}

export function getMaxTransferFeeValue(transfers: TransferRecord[]): number {
  return transfers.reduce((max, transfer) => {
    const { fee } = parseTransferDetails(transfer.type)
    if (!fee) return max
    return Math.max(max, parseFeeValue(fee))
  }, 0)
}

export function getTransferHighlight(
  transfer: TransferRecord,
  transfers: TransferRecord[],
): TransferHighlight {
  const { transferType, fee } = parseTransferDetails(transfer.type)

  if (transferType === 'Loan') return 'loan'
  if (transferType === 'Free Transfer') return 'free'

  if (fee) {
    const feeValue = parseFeeValue(fee)
    const maxFee = getMaxTransferFeeValue(transfers)
    if (feeValue > 0 && feeValue === maxFee) return 'record'
  }

  return null
}

export function formatTransferDate(date: string | null): string {
  if (!date) return 'Date unknown'

  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return 'Date unknown'

  return new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(parsed)
}

export function getTransferSeasonLabel(date: string | null): string {
  if (!date) return 'Unknown'

  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return 'Unknown'

  const year = parsed.getFullYear()
  const seasonStart = parsed.getMonth() >= 6 ? year : year - 1
  return formatSeasonLabel(seasonStart)
}

export function parseTransferDetails(
  type: string | null,
): ParsedTransferDetails {
  if (!type || type.trim() === '' || /^n\/a$/i.test(type.trim())) {
    return { transferType: 'Unknown', fee: null }
  }

  const normalized = type.trim()

  if (/^free$/i.test(normalized)) {
    return { transferType: 'Free Transfer', fee: null }
  }

  if (/^loan$/i.test(normalized)) {
    return { transferType: 'Loan', fee: null }
  }

  if (/^permanent$/i.test(normalized)) {
    return { transferType: 'Permanent', fee: null }
  }

  if (/[€$£]|\d/.test(normalized)) {
    return { transferType: 'Permanent', fee: normalized }
  }

  return { transferType: normalized, fee: null }
}

export function sortTransfersByDate(
  transfers: TransferRecord[],
  order: 'asc' | 'desc' = 'desc',
): TransferRecord[] {
  const direction = order === 'asc' ? 1 : -1

  return [...transfers].sort((a, b) => {
    const aTime = a.date ? new Date(a.date).getTime() : Number.NaN
    const bTime = b.date ? new Date(b.date).getTime() : Number.NaN

    if (Number.isNaN(aTime) && Number.isNaN(bTime)) return 0
    if (Number.isNaN(aTime)) return 1
    if (Number.isNaN(bTime)) return -1
    return (aTime - bTime) * direction
  })
}
