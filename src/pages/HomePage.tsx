import {
  FeaturedPlayersSection,
  HeroSection,
  PopularTeamsSection,
  TopAssistsSection,
  TopScorersSection,
} from '@/components/home'

export function HomePage() {
  return (
    <div className="space-y-12 sm:space-y-16">
      <HeroSection />
      <FeaturedPlayersSection />
      <TopScorersSection />
      <TopAssistsSection />
      <PopularTeamsSection />
    </div>
  )
}
