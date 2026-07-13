import { Search, X } from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import { LazyImage } from '@/components/ui/lazy-image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { DEFAULT_LEAGUE_ID, DEFAULT_SEASON } from '@/config/football'
import { usePlayers } from '@/hooks'
import type { PlayerProfile } from '@/types/api-football'
import { getPrimaryStatistics } from '@/utils/player'

type PlayerCompareSelectorProps = {
  label: string
  selectedPlayer: PlayerProfile | null
  selectedId: number | null
  onSelect: (playerId: number) => void
  onClear: () => void
  disabledPlayerId?: number | null
  season?: number
}

export function PlayerCompareSelector({
  label,
  selectedPlayer,
  selectedId,
  onSelect,
  onClear,
  disabledPlayerId,
  season = DEFAULT_SEASON,
}: PlayerCompareSelectorProps) {
  const [search, setSearch] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const isSearchMode = searchQuery.length >= 3

  const { players: browsePlayers, isLoading: isBrowseLoading } = usePlayers({
    league: DEFAULT_LEAGUE_ID,
    season,
    page: 1,
  })

  const { players: searchPlayers, isLoading: isSearchLoading } = usePlayers(
    {
      search: searchQuery,
      league: DEFAULT_LEAGUE_ID,
      season,
      page: 1,
    },
    { enabled: isSearchMode },
  )

  const options = useMemo(() => {
    const list = isSearchMode ? searchPlayers : browsePlayers
    return list.filter((profile) => profile.player.id !== disabledPlayerId)
  }, [browsePlayers, disabledPlayerId, isSearchMode, searchPlayers])

  const isLoading = isSearchMode ? isSearchLoading : isBrowseLoading

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSearchQuery(search.trim())
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">{label}</CardTitle>
        <CardDescription>Search and select a player to compare</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search player…"
              className="pl-9"
              aria-label={`${label} search`}
            />
          </div>
          <Button type="submit" variant="secondary">
            Search
          </Button>
        </form>

        <div className="space-y-2">
          <Label htmlFor={`${label}-select`}>Select player</Label>
          {isLoading ? (
            <Skeleton className="h-9 w-full" />
          ) : (
            <Select
              value={selectedId != null ? String(selectedId) : undefined}
              onValueChange={(value) => onSelect(Number(value))}
            >
              <SelectTrigger id={`${label}-select`}>
                <SelectValue
                  placeholder={
                    isSearchMode
                      ? 'Choose from search results'
                      : 'Choose a player'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {options.map((profile) => (
                  <SelectItem
                    key={profile.player.id}
                    value={String(profile.player.id)}
                  >
                    {profile.player.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {selectedPlayer && (
          <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3">
            <LazyImage
              src={selectedPlayer.player.photo}
              alt={selectedPlayer.player.name}
              width={56}
              height={56}
              className="size-14 rounded-full border border-border object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">
                {selectedPlayer.player.name}
              </p>
              <p className="truncate text-sm text-muted-foreground">
                {getPrimaryStatistics(selectedPlayer)?.team?.name ??
                  'Unknown team'}
              </p>
              {getPrimaryStatistics(selectedPlayer)?.games?.position && (
                <Badge variant="secondary" className="mt-1">
                  {getPrimaryStatistics(selectedPlayer)?.games?.position}
                </Badge>
              )}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onClear}
              aria-label={`Clear ${label}`}
            >
              <X className="size-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
