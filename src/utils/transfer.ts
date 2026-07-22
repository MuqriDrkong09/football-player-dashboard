import { formatSeasonLabel } from '@/config/football'
import type { TransferRecord } from '@/types/api-football'

export type ParsedTransferDetails = {
  transferType: string
  fee: string | null
}

export type TransferHighlight = 'record' | 'free' | 'loan' | null

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
