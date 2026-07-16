import { ArrowRight, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { formatSeasonLabel } from '@/config/football'
import { useLeagueSeason } from '@/hooks'

export function HeroSection() {
  const { season, leagueName } = useLeagueSeason()

  return (
    <section className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/15 via-turf/40 to-background px-6 py-12 sm:px-10 sm:py-16">
      <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 size-72 rounded-full bg-pitch/10 blur-3xl" />

      <div className="relative mx-auto max-w-2xl text-center">
        <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-primary">
          {leagueName} · Season {formatSeasonLabel(season)}
        </p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
          Your Football Player <span className="text-primary">Dashboard</span>
        </h1>
        <p className="mt-4 text-base text-muted-foreground sm:text-lg">
          Discover player stats, top scorers, assists, and teams — all powered
          by live API-Football data.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link to="/players">
              <Search className="size-4" />
              Search Player
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="w-full sm:w-auto"
          >
            <Link to="/compare">
              Compare Players
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
