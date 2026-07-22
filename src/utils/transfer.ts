import { formatSeasonLabel } from '@/config/football'
import type { TransferRecord } from '@/types/api-football'

export type ParsedTransferDetails = {
  transferType: string
  fee: string | null
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
): TransferRecord[] {
  return [...transfers].sort((a, b) => {
    const aTime = a.date ? new Date(a.date).getTime() : Number.NaN
    const bTime = b.date ? new Date(b.date).getTime() : Number.NaN

    if (Number.isNaN(aTime) && Number.isNaN(bTime)) return 0
    if (Number.isNaN(aTime)) return 1
    if (Number.isNaN(bTime)) return -1
    return bTime - aTime
  })
}
