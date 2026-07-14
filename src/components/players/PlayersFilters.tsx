import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Search as PlayerSearch } from '@/components/search'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LEAGUE_LABEL } from '@/config/football'
import { PLAYER_POSITIONS } from '@/config/players'
import type { PlayerPosition } from '@/config/players'
import type { PlayerProfile, Team } from '@/types/api-football'

export type PlayersFilterState = {
  search: string
  position: PlayerPosition | 'all'
  nationality: string
  teamId: string
}

type PlayersFiltersProps = {
  filters: PlayersFilterState
  nationalities: string[]
  teams: Team[]
  isTeamsLoading: boolean
  onSearchChange: (value: string) => void
  onPlayerSelect: (profile: PlayerProfile) => void
  onPositionChange: (value: PlayerPosition | 'all') => void
  onNationalityChange: (value: string) => void
  onTeamChange: (value: string) => void
  onClearFilters: () => void
}

export function PlayersFilters({
  filters,
  nationalities,
  teams,
  isTeamsLoading,
  onSearchChange,
  onPlayerSelect,
  onPositionChange,
  onNationalityChange,
  onTeamChange,
  onClearFilters,
}: PlayersFiltersProps) {
  const hasActiveFilters =
    filters.search.length > 0 ||
    filters.position !== 'all' ||
    filters.nationality !== 'all' ||
    filters.teamId !== 'all'

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Players</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Search and filter players from the {LEAGUE_LABEL}.
        </p>
      </div>

      <PlayerSearch
        value={filters.search}
        onValueChange={onSearchChange}
        onSelect={onPlayerSelect}
        team={filters.teamId !== 'all' ? Number(filters.teamId) : undefined}
        placeholder="Search by player name (min. 3 characters)…"
        aria-label="Search players by name"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="position-filter">Position</Label>
          <Select
            value={filters.position}
            onValueChange={(value) =>
              onPositionChange(value as PlayerPosition | 'all')
            }
          >
            <SelectTrigger id="position-filter">
              <SelectValue placeholder="All positions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All positions</SelectItem>
              {PLAYER_POSITIONS.map((position) => (
                <SelectItem key={position} value={position}>
                  {position}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="nationality-filter">Nationality</Label>
          <Select
            value={filters.nationality}
            onValueChange={onNationalityChange}
          >
            <SelectTrigger id="nationality-filter">
              <SelectValue placeholder="All nationalities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All nationalities</SelectItem>
              {nationalities.map((nationality) => (
                <SelectItem key={nationality} value={nationality}>
                  {nationality}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="team-filter">Team</Label>
          <Select
            value={filters.teamId}
            onValueChange={onTeamChange}
            disabled={isTeamsLoading}
          >
            <SelectTrigger id="team-filter">
              <SelectValue placeholder="All teams" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All teams</SelectItem>
              {teams.map((team) => (
                <SelectItem key={team.team.id} value={String(team.team.id)}>
                  {team.team.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {hasActiveFilters && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          className="gap-2"
        >
          <X className="size-4" />
          Clear filters
        </Button>
      )}
    </div>
  )
}
