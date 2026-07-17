import { Suspense } from 'react'
import { render, screen } from '@testing-library/react'
import {
  AboutPage,
  ComparePage,
  FavoritesPage,
  HomePage,
  LeaderboardsPage,
  MatchDetailPage,
  NotFoundPage,
  PlayerDetailPage,
  PlayersPage,
  TeamDetailPage,
  TeamsPage,
} from '@/routes/lazy-pages'

jest.mock('@/pages/HomePage', () => ({
  HomePage: () => <div>Home page</div>,
}))

jest.mock('@/pages/PlayersPage', () => ({
  PlayersPage: () => <div>Players page</div>,
}))

jest.mock('@/pages/PlayerDetailPage', () => ({
  PlayerDetailPage: () => <div>Player detail page</div>,
}))

jest.mock('@/pages/TeamsPage', () => ({
  TeamsPage: () => <div>Teams page</div>,
}))

jest.mock('@/pages/TeamDetailPage', () => ({
  TeamDetailPage: () => <div>Team detail page</div>,
}))

jest.mock('@/pages/MatchDetailPage', () => ({
  MatchDetailPage: () => <div>Match detail page</div>,
}))

jest.mock('@/pages/LeaderboardsPage', () => ({
  LeaderboardsPage: () => <div>Leaderboards page</div>,
}))

jest.mock('@/pages/ComparePage', () => ({
  ComparePage: () => <div>Compare page</div>,
}))

jest.mock('@/pages/FavoritesPage', () => ({
  FavoritesPage: () => <div>Favorites page</div>,
}))

jest.mock('@/pages/AboutPage', () => ({
  AboutPage: () => <div>About page</div>,
}))

jest.mock('@/pages/NotFoundPage', () => ({
  NotFoundPage: () => <div>Not found page</div>,
}))

const lazyPages = [
  { Component: HomePage, label: 'Home page' },
  { Component: PlayersPage, label: 'Players page' },
  { Component: PlayerDetailPage, label: 'Player detail page' },
  { Component: TeamsPage, label: 'Teams page' },
  { Component: TeamDetailPage, label: 'Team detail page' },
  { Component: MatchDetailPage, label: 'Match detail page' },
  { Component: LeaderboardsPage, label: 'Leaderboards page' },

  { Component: ComparePage, label: 'Compare page' },
  { Component: FavoritesPage, label: 'Favorites page' },
  { Component: AboutPage, label: 'About page' },
  { Component: NotFoundPage, label: 'Not found page' },
] as const

describe('routes/lazy-pages', () => {
  it.each(lazyPages)(
    'lazily loads $label through its named export',
    async ({ Component, label }) => {
      render(
        <Suspense fallback={<div>Loading…</div>}>
          <Component />
        </Suspense>,
      )

      expect(await screen.findByText(label)).toBeInTheDocument()
    },
  )
})
