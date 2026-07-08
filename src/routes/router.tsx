import { createBrowserRouter } from 'react-router-dom'
import { RootLayout } from '@/layouts/RootLayout'
import {
  AboutPage,
  ComparePage,
  FavoritesPage,
  HomePage,
  PlayerDetailPage,
  PlayersPage,
} from '@/pages'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'players', element: <PlayersPage /> },
      { path: 'players/:playerId', element: <PlayerDetailPage /> },
      { path: 'compare', element: <ComparePage /> },
      { path: 'favorites', element: <FavoritesPage /> },
      { path: 'about', element: <AboutPage /> },
    ],
  },
])
