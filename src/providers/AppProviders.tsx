import type { ReactNode } from 'react'
import { Toaster } from '@/components/ui/toast'
import { FavoritesProvider } from '@/providers/FavoritesProvider'
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
          {children}
          <Toaster richColors closeButton position="top-right" />
        </QueryProvider>
      </FavoritesProvider>
    </ThemeProvider>
  )
}
