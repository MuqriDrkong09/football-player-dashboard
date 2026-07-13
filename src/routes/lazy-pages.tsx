import { lazy } from 'react'

export const HomePage = lazy(() =>
  import('@/pages/HomePage').then((module) => ({ default: module.HomePage })),
)

export const PlayersPage = lazy(() =>
  import('@/pages/PlayersPage').then((module) => ({
    default: module.PlayersPage,
  })),
)

export const PlayerDetailPage = lazy(() =>
  import('@/pages/PlayerDetailPage').then((module) => ({
    default: module.PlayerDetailPage,
  })),
)

export const LeaderboardsPage = lazy(() =>
  import('@/pages/LeaderboardsPage').then((module) => ({
    default: module.LeaderboardsPage,
  })),
)

export const ComparePage = lazy(() =>
  import('@/pages/ComparePage').then((module) => ({
    default: module.ComparePage,
  })),
)

export const FavoritesPage = lazy(() =>
  import('@/pages/FavoritesPage').then((module) => ({
    default: module.FavoritesPage,
  })),
)

export const AboutPage = lazy(() =>
  import('@/pages/AboutPage').then((module) => ({ default: module.AboutPage })),
)

export const NotFoundPage = lazy(() =>
  import('@/pages/NotFoundPage').then((module) => ({
    default: module.NotFoundPage,
  })),
)
