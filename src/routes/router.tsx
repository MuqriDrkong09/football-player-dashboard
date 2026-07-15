import { createBrowserRouter } from 'react-router-dom'
import { RootLayout } from '@/layouts/RootLayout'
import {
  AboutPage,
  ComparePage,
  FavoritesPage,
  HomePage,
  LeaderboardsPage,
  NotFoundPage,
  PlayerDetailPage,
  PlayersPage,
  TeamDetailPage,
  TeamsPage,
} from '@/routes/lazy-pages'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'players', element: <PlayersPage /> },
      { path: 'players/:playerId', element: <PlayerDetailPage /> },
      { path: 'teams', element: <TeamsPage /> },
      { path: 'teams/:teamId', element: <TeamDetailPage /> },

      { path: 'leaderboards', element: <LeaderboardsPage /> },
      { path: 'compare', element: <ComparePage /> },
      { path: 'favorites', element: <FavoritesPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
