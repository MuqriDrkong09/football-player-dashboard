import { formatSeasonLabel } from '@/config/football'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'

type SeasonSelectorProps = {
  seasons: number[]
  value: number | null
  onChange: (season: number) => void
  isLoading?: boolean
  label?: string
  id?: string
  disabledSeason?: number | null
}

export function SeasonSelector({
  seasons,
  value,
  onChange,
  isLoading,
  label = 'Season',
  id = 'season-select',
  disabledSeason = null,
}: SeasonSelectorProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-9 w-36" />
      </div>
    )
  }

  if (seasons.length === 0) return null

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Select
        value={value != null ? String(value) : undefined}
        onValueChange={(next) => onChange(Number(next))}
      >
        <SelectTrigger id={id} className="w-full sm:w-40">
          <SelectValue placeholder="Select season" />
        </SelectTrigger>
        <SelectContent>
          {seasons
            .slice()
            .sort((a, b) => b - a)
            .filter((season) => season !== disabledSeason)
            .map((season) => (
              <SelectItem key={season} value={String(season)}>
                {formatSeasonLabel(season)}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
    </div>
  )
}
