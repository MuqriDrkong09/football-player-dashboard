import { lazy } from 'react'
import { HeroSection } from '@/components/home/HeroSection'
import { LoadingSkeleton, RouteSuspense } from '@/components/feedback'

const FeaturedPlayersSection = lazy(() =>
  import('@/components/home/FeaturedPlayersSection').then((module) => ({
    default: module.FeaturedPlayersSection,
  })),
)

const TopScorersSection = lazy(() =>
  import('@/components/home/TopScorersSection').then((module) => ({
    default: module.TopScorersSection,
  })),
)

const TopAssistsSection = lazy(() =>
  import('@/components/home/TopAssistsSection').then((module) => ({
    default: module.TopAssistsSection,
  })),
)

const PopularTeamsSection = lazy(() =>
  import('@/components/home/PopularTeamsSection').then((module) => ({
    default: module.PopularTeamsSection,
  })),
)

export function HomePage() {
  return (
    <div className="space-y-12 sm:space-y-16">
      <HeroSection />
      <RouteSuspense
        fallback={<LoadingSkeleton variant="card-grid" count={6} />}
      >
        <FeaturedPlayersSection />
      </RouteSuspense>
      <RouteSuspense
        fallback={<LoadingSkeleton variant="card-grid" count={6} />}
      >
        <TopScorersSection />
      </RouteSuspense>
      <RouteSuspense
        fallback={<LoadingSkeleton variant="card-grid" count={6} />}
      >
        <TopAssistsSection />
      </RouteSuspense>
      <RouteSuspense
        fallback={
          <LoadingSkeleton
            variant="card-grid"
            count={8}
            cardVariant="team"
            className="sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
          />
        }
      >
        <PopularTeamsSection />
      </RouteSuspense>
    </div>
  )
}
