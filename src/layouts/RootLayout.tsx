import { useCallback, useState } from 'react'
import { Outlet } from 'react-router-dom'
import {
  Container,
  Footer,
  MobileNav,
  Navbar,
  Sidebar,
} from '@/components/layout'

export function RootLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const openMobileNav = useCallback(() => setMobileNavOpen(true), [])
  const closeMobileNav = useCallback(() => setMobileNavOpen(false), [])

  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <Navbar onMenuClick={openMobileNav} />
      <MobileNav open={mobileNavOpen} onClose={closeMobileNav} />

      <div className="flex flex-1">
        <Sidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <main className="flex-1 py-6 sm:py-8">
            <Container as="section">
              <Outlet />
            </Container>
          </main>

          <Footer />
        </div>
      </div>
    </div>
  )
}
