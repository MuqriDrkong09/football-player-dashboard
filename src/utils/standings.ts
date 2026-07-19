export type StandingZone =
  | 'champions-league'
  | 'europa-league'
  | 'conference-league'
  | 'relegation'
  | null

/**
 * Classify a standing row using API-Football's `description` field
 * (e.g. "Promotion - Champions League", "Relegation").
 */
export function getStandingZone(description: string | null): StandingZone {
  if (!description) return null

  const value = description.toLowerCase()

  if (value.includes('relegation')) return 'relegation'
  if (value.includes('champions league')) return 'champions-league'
  if (value.includes('europa league')) return 'europa-league'
  if (value.includes('conference league')) return 'conference-league'

  return null
}

export const STANDING_ZONE_STYLES: Record<
  Exclude<StandingZone, null>,
  string
> = {
  'champions-league': 'border-l-4 border-l-sky-500 bg-sky-500/5',
  'europa-league': 'border-l-4 border-l-amber-500 bg-amber-500/5',
  'conference-league': 'border-l-4 border-l-emerald-500 bg-emerald-500/5',
  relegation: 'border-l-4 border-l-destructive bg-destructive/5',
}

export const STANDING_ZONE_LEGEND: Array<{
  zone: Exclude<StandingZone, null>
  label: string
  swatch: string
}> = [
  {
    zone: 'champions-league',
    label: 'Champions League',
    swatch: 'bg-sky-500',
  },
  {
    zone: 'europa-league',
    label: 'Europa League',
    swatch: 'bg-amber-500',
  },
  {
    zone: 'conference-league',
    label: 'Conference League',
    swatch: 'bg-emerald-500',
  },
  {
    zone: 'relegation',
    label: 'Relegation',
    swatch: 'bg-destructive',
  },
]
