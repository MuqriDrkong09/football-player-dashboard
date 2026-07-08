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
}

export function SeasonSelector({
  seasons,
  value,
  onChange,
  isLoading,
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
      <Label htmlFor="season-select">Season</Label>
      <Select
        value={value != null ? String(value) : undefined}
        onValueChange={(next) => onChange(Number(next))}
      >
        <SelectTrigger id="season-select" className="w-full sm:w-40">
          <SelectValue placeholder="Select season" />
        </SelectTrigger>
        <SelectContent>
          {seasons
            .slice()
            .sort((a, b) => b - a)
            .map((season) => (
              <SelectItem key={season} value={String(season)}>
                {season}/{String(season + 1).slice(-2)}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
    </div>
  )
}
