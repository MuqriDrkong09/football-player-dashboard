import { Menu } from 'lucide-react'
import { mainNavItems } from '@/config/navigation'
import { Container } from '@/components/layout/Container'
import { DarkModeToggle } from '@/components/layout/DarkModeToggle'
import { Logo } from '@/components/layout/Logo'
import { NavLinks } from '@/components/layout/NavLinks'
import { Button } from '@/components/ui/button'

type NavbarProps = {
  onMenuClick: () => void
}

export function Navbar({ onMenuClick }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <Container className="flex h-14 items-center justify-between gap-4 sm:h-16">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMenuClick}
            aria-label="Open navigation menu"
          >
            <Menu className="size-5" />
          </Button>
          <Logo />
        </div>

        <NavLinks
          items={mainNavItems}
          orientation="horizontal"
          className="hidden lg:flex"
        />

        <div className="flex items-center gap-1">
          <DarkModeToggle />
        </div>
      </Container>
    </header>
  )
}
