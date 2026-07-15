import { ArrowLeft, Calendar, MapPin, Shield, UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { LazyImage } from '@/components/ui/lazy-image'
import { Skeleton } from '@/components/ui/skeleton'
import { LEAGUE_LABEL, formatSeasonLabel } from '@/config/football'
import type { Coach, Team } from '@/types/api-football'

type TeamInfoSectionProps = {
  team: Team | null
  coach: Coach | null
  leagueName?: string | null
  season: number
  isLoading?: boolean
  isCoachLoading?: boolean
}

export function TeamInfoSection({
  team,
  coach,
  leagueName,
  season,
  isLoading,
  isCoachLoading,
}: TeamInfoSectionProps) {
  if (!team) {
    if (!isLoading) return null

    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 lg:flex-row">
            <Skeleton className="mx-auto size-28 shrink-0 rounded-full sm:mx-0" />
            <div className="flex-1 space-y-4">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-48" />
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton key={index} className="h-20 rounded-lg" />
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const { team: info, venue } = team
  const joinedCoachName = [coach?.firstname, coach?.lastname]
    .filter(Boolean)
    .join(' ')
  const coachName = coach?.name || joinedCoachName || null

  const details = [
    { label: 'Country', value: info.country },
    { label: 'League', value: leagueName ?? LEAGUE_LABEL },
    {
      label: 'Founded',
      value: info.founded != null ? String(info.founded) : null,
    },
    { label: 'Stadium', value: venue.name },
    {
      label: 'Capacity',
      value:
        venue.capacity != null ? venue.capacity.toLocaleString() : null,
    },
    { label: 'Season', value: formatSeasonLabel(season) },
  ]

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-col gap-4 border-b border-border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <Button asChild variant="ghost" size="sm" className="w-fit gap-2">
          <Link to="/">
            <ArrowLeft className="size-4" />
            Back to Dashboard
          </Link>
        </Button>
        <Badge variant="pitch">{leagueName ?? LEAGUE_LABEL}</Badge>
      </CardHeader>

      <CardContent className="space-y-8 p-6">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          <LazyImage
            src={info.logo}
            alt={info.name}
            width={112}
            height={112}
            className="size-28 shrink-0 object-contain"
          />

          <div className="min-w-0 flex-1 space-y-4 text-center sm:text-left">
            <div>
              <CardTitle className="text-2xl sm:text-3xl">{info.name}</CardTitle>
              <CardDescription className="mt-1 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 sm:justify-start">
                {info.country && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="size-3.5" />
                    {info.country}
                  </span>
                )}
                {venue.city && (
                  <span className="inline-flex items-center gap-1">
                    <Shield className="size-3.5" />
                    {venue.city}
                  </span>
                )}
                {info.founded != null && (
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="size-3.5" />
                    Founded {info.founded}
                  </span>
                )}
              </CardDescription>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {details.map((item) => (
                <div
                  key={item.label}
                  className="rounded-lg border border-border bg-muted/20 px-3 py-2 text-left"
                >
                  <p className="text-xs font-medium text-muted-foreground">
                    {item.label}
                  </p>
                  <p className="mt-1 text-sm font-semibold">
                    {item.value ?? '—'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <Card className="border-dashed">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <UserRound className="size-4 text-primary" />
                Coach
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isCoachLoading ? (
                <div className="flex items-center gap-4">
                  <Skeleton className="size-16 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                </div>
              ) : coachName ? (
                <div className="flex items-center gap-4">
                  {coach?.photo ? (
                    <LazyImage
                      src={coach.photo}
                      alt={coachName}
                      width={64}
                      height={64}
                      className="size-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex size-16 items-center justify-center rounded-full bg-muted">
                      <UserRound className="size-7 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold">{coachName}</p>
                    <p className="text-sm text-muted-foreground">
                      {coach?.nationality
                        ? `${coach.nationality}${coach.age != null ? ` · ${coach.age} yrs` : ''}`
                        : coach?.age != null
                          ? `${coach.age} yrs`
                          : 'Head coach'}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Coach information is not available for this team.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-dashed">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Stadium</CardTitle>
              <CardDescription>
                {venue.name ?? 'Venue details unavailable'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {venue.image ? (
                <LazyImage
                  src={venue.image}
                  alt={venue.name ?? `${info.name} stadium`}
                  width={640}
                  height={360}
                  className="aspect-[16/9] w-full rounded-lg object-cover"
                />
              ) : (
                <div className="flex aspect-[16/9] w-full items-center justify-center rounded-lg bg-muted text-sm text-muted-foreground">
                  No stadium image available
                </div>
              )}
              {venue.capacity != null && (
                <p className="text-sm text-muted-foreground">
                  Capacity {venue.capacity.toLocaleString()}
                  {venue.surface ? ` · ${venue.surface}` : ''}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  )
}
