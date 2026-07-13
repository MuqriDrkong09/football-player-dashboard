import { lazy } from 'react'
import { HeroSection } from '@/components/home/HeroSection'
import { LoadingSkeleton, RouteSuspense } from '@/components/feedback'
import { FadeIn } from '@/components/motion'
import { PAGE_META } from '@/config/seo'
import { usePageMeta } from '@/hooks'

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
  usePageMeta(PAGE_META.home)

  return (
    <div className="space-y-12 sm:space-y-16">
      <FadeIn>
        <HeroSection />
      </FadeIn>

      <RouteSuspense
        fallback={<LoadingSkeleton variant="card-grid" count={6} />}
      >
        <FadeIn delayMs={60}>
          <FeaturedPlayersSection />
        </FadeIn>
      </RouteSuspense>

      <RouteSuspense
        fallback={<LoadingSkeleton variant="card-grid" count={6} />}
      >
        <FadeIn delayMs={100}>
          <TopScorersSection />
        </FadeIn>
      </RouteSuspense>

      <RouteSuspense
        fallback={<LoadingSkeleton variant="card-grid" count={6} />}
      >
        <FadeIn delayMs={140}>
          <TopAssistsSection />
        </FadeIn>
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
        <FadeIn delayMs={180}>
          <PopularTeamsSection />
        </FadeIn>
      </RouteSuspense>
    </div>
  )
}
