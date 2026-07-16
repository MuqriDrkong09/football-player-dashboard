import { useIsFetching } from '@tanstack/react-query'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AVAILABLE_LEAGUES,
  AVAILABLE_SEASONS,
  formatSeasonLabel,
} from '@/config/football'
import { useLeagueSeason } from '@/hooks/use-league-season'
import { queryKeys } from '@/lib/query-keys'
import { cn } from '@/lib/utils'

type LeagueSeasonSwitcherProps = {
  className?: string
  showLabels?: boolean
  size?: 'default' | 'compact'
}

export function LeagueSeasonSwitcher({
  className,
  showLabels = false,
  size = 'default',
}: LeagueSeasonSwitcherProps) {
  const { leagueId, season, setLeagueId, setSeason } = useLeagueSeason()
  const fetchingCount = useIsFetching({ queryKey: queryKeys.all })
  const isRefreshing = fetchingCount > 0

  const triggerClassName =
    size === 'compact' ? 'h-8 min-w-[8.5rem] text-xs' : 'h-9 min-w-[10rem]'

  return (
    <div
      className={cn(
        'flex flex-wrap items-end gap-2 sm:gap-3',
        className,
      )}
      aria-busy={isRefreshing}
    >
      <div className="space-y-1">
        {showLabels && (
          <Label htmlFor="league-switcher" className="text-xs">
            League
          </Label>
        )}
        <Select
          value={String(leagueId)}
          onValueChange={(value) => setLeagueId(Number(value))}
          disabled={isRefreshing}
        >
          <SelectTrigger
            id="league-switcher"
            className={triggerClassName}
            aria-label="Select league"
          >
            <SelectValue placeholder="League" />
          </SelectTrigger>
          <SelectContent>
            {AVAILABLE_LEAGUES.map((league) => (
              <SelectItem key={league.id} value={String(league.id)}>
                {league.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        {showLabels && (
          <Label htmlFor="season-switcher" className="text-xs">
            Season
          </Label>
        )}
        <Select
          value={String(season)}
          onValueChange={(value) => setSeason(Number(value))}
          disabled={isRefreshing}
        >
          <SelectTrigger
            id="season-switcher"
            className={triggerClassName}
            aria-label="Select season"
          >
            <SelectValue placeholder="Season" />
          </SelectTrigger>
          <SelectContent>
            {AVAILABLE_SEASONS.map((year) => (
              <SelectItem key={year} value={String(year)}>
                {formatSeasonLabel(year)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
