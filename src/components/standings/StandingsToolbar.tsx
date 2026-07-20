import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { StandingsSortBy } from '@/utils/standings'

type StandingsToolbarProps = {
  search: string
  onSearchChange: (value: string) => void
  sortBy: StandingsSortBy
  onSortByChange: (value: StandingsSortBy) => void
  className?: string
}

const SORT_OPTIONS: Array<{ value: StandingsSortBy; label: string }> = [
  { value: 'position', label: 'Position' },
  { value: 'points', label: 'Points' },
  { value: 'name', label: 'Name A–Z' },
]

export function StandingsToolbar({
  search,
  onSearchChange,
  sortBy,
  onSortByChange,
  className,
}: StandingsToolbarProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      <Input
        type="search"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Search team…"
        aria-label="Search team"
        className="w-full sm:max-w-xs"
      />

      <div className="flex items-center gap-2">
        <label htmlFor="standings-sort" className="sr-only">
          Sort standings
        </label>
        <Select
          value={sortBy}
          onValueChange={(value) => onSortByChange(value as StandingsSortBy)}
        >
          <SelectTrigger
            id="standings-sort"
            className="w-full sm:w-44"
            aria-label="Sort standings"
          >
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
