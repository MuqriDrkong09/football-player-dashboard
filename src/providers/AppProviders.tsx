import type { ReactNode } from 'react'
import { Toaster } from '@/components/ui/toast'
import { FavoritesProvider } from '@/providers/FavoritesProvider'
import { LeagueSeasonProvider } from '@/providers/LeagueSeasonProvider'
import { QueryProvider } from '@/providers/QueryProvider'
import { ThemeProvider } from '@/providers/ThemeProvider'

type AppProvidersProps = {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider>
      <FavoritesProvider>
        <QueryProvider>
          <LeagueSeasonProvider>
            {children}
            <Toaster richColors closeButton position="top-right" expand />
          </LeagueSeasonProvider>
        </QueryProvider>
      </FavoritesProvider>
    </ThemeProvider>
  )
}
