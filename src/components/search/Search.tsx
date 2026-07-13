import { Loader2, Search as SearchIcon, X } from 'lucide-react'
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { RetryButton } from '@/components/feedback/RetryButton'
import { DEFAULT_LEAGUE_ID, DEFAULT_SEASON } from '@/config/football'
import { useDebounce } from '@/hooks/use-debounce'
import { usePlayerSearch } from '@/hooks/use-player-search'
import { cn } from '@/lib/utils'
import type { PlayerProfile } from '@/types/api-football'
import { getPrimaryStatistics } from '@/utils/player'

const DEFAULT_MIN_CHARS = 3
const DEFAULT_DEBOUNCE_MS = 300
const DEFAULT_MAX_SUGGESTIONS = 8

export type SearchProps = {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  onSelect?: (player: PlayerProfile) => void
  placeholder?: string
  league?: number
  season?: number
  team?: number
  minChars?: number
  debounceMs?: number
  maxSuggestions?: number
  className?: string
  inputClassName?: string
  disabled?: boolean
  autoFocus?: boolean
  id?: string
  name?: string
}

export function Search({
  value,
  defaultValue = '',
  onValueChange,
  onSelect,
  placeholder = 'Search players…',
  league = DEFAULT_LEAGUE_ID,
  season = DEFAULT_SEASON,
  team,
  minChars = DEFAULT_MIN_CHARS,
  debounceMs = DEFAULT_DEBOUNCE_MS,
  maxSuggestions = DEFAULT_MAX_SUGGESTIONS,
  className,
  inputClassName,
  disabled = false,
  autoFocus = false,
  id,
  name,
}: SearchProps) {
  const listboxId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const isControlled = value !== undefined
  const [internalValue, setInternalValue] = useState(defaultValue)
  const query = isControlled ? value : internalValue

  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  const setQuery = useCallback(
    (next: string) => {
      if (!isControlled) {
        setInternalValue(next)
      }

      onValueChange?.(next)
    },
    [isControlled, onValueChange],
  )

  const debouncedQuery = useDebounce(query, debounceMs)
  const trimmedQuery = debouncedQuery.trim()
  const trimmedInput = query.trim()
  const canSearch = trimmedQuery.length >= minChars
  const isDebouncing =
    trimmedInput.length >= minChars && trimmedInput !== trimmedQuery

  const { players, isLoading, isFetching, isError, errorMessage, refetch } =
    usePlayerSearch(
      {
        search: trimmedQuery,
        league,
        season,
        team,
        page: 1,
      },
      {
        minChars,
        enabled: isOpen && canSearch,
      },
    )

  const suggestions = players.slice(0, maxSuggestions)
  const showDropdown = isOpen && query.length > 0
  const isSearching =
    isDebouncing || (canSearch && (isLoading || isFetching))

  useEffect(() => {
    setActiveIndex(-1)
  }, [trimmedQuery, suggestions.length])

  useEffect(() => {
    if (activeIndex < 0 || !listRef.current) return

    const item = listRef.current.children[activeIndex] as
      | HTMLElement
      | undefined

    item?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  const handleSelect = useCallback(
    (profile: PlayerProfile) => {
      setQuery(profile.player.name)
      setIsOpen(false)
      setActiveIndex(-1)
      onSelect?.(profile)
      inputRef.current?.blur()
    },
    [onSelect, setQuery],
  )

  const handleClear = () => {
    setQuery('')
    setActiveIndex(-1)
    setIsOpen(false)
    inputRef.current?.focus()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown) {
      if (event.key === 'ArrowDown' && query.length > 0) {
        setIsOpen(true)
      }

      return
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()

        if (suggestions.length === 0) return

        setActiveIndex((prev) => (prev + 1) % suggestions.length)
        break
      case 'ArrowUp':
        event.preventDefault()

        if (suggestions.length === 0) return

        setActiveIndex((prev) =>
          prev <= 0 ? suggestions.length - 1 : prev - 1,
        )
        break
      case 'Enter':
        event.preventDefault()

        if (activeIndex >= 0 && suggestions[activeIndex]) {
          handleSelect(suggestions[activeIndex])
        }

        break
      case 'Escape':
        event.preventDefault()
        setIsOpen(false)
        setActiveIndex(-1)
        break
      case 'Tab':
        setIsOpen(false)
        setActiveIndex(-1)
        break
    }
  }

  return (
    <div className={cn('relative w-full', className)}>
      <div className="relative">
        <SearchIcon
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          ref={inputRef}
          id={id}
          name={name}
          type="text"
          role="combobox"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => {
            window.setTimeout(() => setIsOpen(false), 150)
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          aria-expanded={showDropdown}
          aria-controls={listboxId}
          aria-activedescendant={
            activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined
          }
          aria-autocomplete="list"
          autoComplete="off"
          className={cn('pr-16 pl-9', inputClassName)}
        />

        <div className="absolute top-1/2 right-1 flex -translate-y-1/2 items-center gap-0.5">
          {isSearching && (
            <span className="flex size-7 items-center justify-center">
              <Loader2
                className="size-4 animate-spin text-muted-foreground"
                aria-hidden="true"
              />
              <span className="sr-only">Searching players</span>
            </span>
          )}
          {query.length > 0 && !disabled && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7"
              onClick={handleClear}
              aria-label="Clear search"
            >
              <X className="size-4" />
            </Button>
          )}
        </div>
      </div>

      {showDropdown && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-md">
          <ul
            ref={listRef}
            id={listboxId}
            role="listbox"
            aria-label="Player suggestions"
            className="max-h-72 overflow-y-auto py-1"
          >
            {!canSearch && (
              <li className="px-3 py-2 text-sm text-muted-foreground" role="status">
                Type at least {minChars} characters to search
              </li>
            )}

            {canSearch && isSearching && suggestions.length === 0 && (
              <li className="px-3 py-2 text-sm text-muted-foreground" role="status">
                Searching players…
              </li>
            )}

            {canSearch && isError && (
              <li className="px-3 py-2" role="alert">
                <p className="text-sm text-destructive">
                  {errorMessage ?? 'Failed to load suggestions'}
                </p>
                <RetryButton
                  onRetry={() => refetch()}
                  isRetrying={isFetching}
                  size="sm"
                  className="mt-2"
                />
              </li>
            )}

            {canSearch &&
              !isSearching &&
              !isError &&
              suggestions.length === 0 && (
                <li
                  className="px-3 py-2 text-sm text-muted-foreground"
                  role="status"
                >
                  No players found
                </li>
              )}

            {suggestions.map((profile, index) => {
              const { player } = profile
              const stats = getPrimaryStatistics(profile)
              const isActive = index === activeIndex
              const meta = [
                stats?.team?.name,
                stats?.games?.position,
                player.nationality,
              ]
                .filter(Boolean)
                .join(' · ')

              return (
                <li
                  key={player.id}
                  id={`${listboxId}-option-${index}`}
                  role="option"
                  aria-selected={isActive}
                  className={cn(
                    'flex cursor-pointer items-center gap-3 px-3 py-2 text-sm outline-none',
                    isActive && 'bg-accent text-accent-foreground',
                  )}
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => handleSelect(profile)}
                >
                  <img
                    src={player.photo}
                    alt=""
                    className="size-8 rounded-full border border-border bg-muted object-cover"
                    loading="lazy"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{player.name}</p>
                    {meta && (
                      <p className="truncate text-xs text-muted-foreground">
                        {meta}
                      </p>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
