import { useCallback, useState } from 'react'
import { Outlet } from 'react-router-dom'
import {
  DataRefreshingIndicator,
  ErrorBoundary,
  RouteSuspense,
} from '@/components/feedback'
import {
  Container,
  Footer,
  MobileNav,
  Navbar,
  PageTransition,
  Sidebar,
  SkipLink,
} from '@/components/layout'

export function RootLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const openMobileNav = useCallback(() => setMobileNavOpen(true), [])
  const closeMobileNav = useCallback(() => setMobileNavOpen(false), [])

  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <SkipLink />
      <Navbar onMenuClick={openMobileNav} />
      <DataRefreshingIndicator />
      <MobileNav open={mobileNavOpen} onClose={closeMobileNav} />

      <div className="flex flex-1">
        <Sidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <main
            id="main-content"
            tabIndex={-1}
            className="flex-1 scroll-mt-16 py-5 outline-none sm:py-8"
          >
            <Container>
              <ErrorBoundary>
                <RouteSuspense>
                  <PageTransition>
                    <Outlet />
                  </PageTransition>
                </RouteSuspense>
              </ErrorBoundary>
            </Container>
          </main>

          <Footer />
        </div>
      </div>
    </div>
  )
}
