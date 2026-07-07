import { X } from 'lucide-react'
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { sidebarNavItems } from '@/config/navigation'
import { DarkModeToggle } from '@/components/layout/DarkModeToggle'
import { Logo } from '@/components/layout/Logo'
import { NavLinks } from '@/components/layout/NavLinks'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type MobileNavProps = {
  open: boolean
  onClose: () => void
}

export function MobileNav({ open, onClose }: MobileNavProps) {
  const location = useLocation()

  useEffect(() => {
    onClose()
  }, [location.pathname, onClose])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-50 bg-black/60 transition-opacity lg:hidden',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-[min(85vw,20rem)] flex-col border-r border-sidebar-border bg-sidebar shadow-xl transition-transform duration-300 ease-in-out lg:hidden',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
      >
        <div className="flex h-14 items-center justify-between border-b border-sidebar-border px-4 sm:h-16">
          <Logo showText />
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close navigation menu"
          >
            <X className="size-5" />
          </Button>
        </div>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
          <NavLinks
            items={sidebarNavItems}
            orientation="vertical"
            onNavigate={onClose}
          />
        </div>

        <div className="border-t border-sidebar-border p-4">
          <div className="flex items-center justify-between rounded-lg bg-sidebar-accent px-3 py-2">
            <span className="text-sm font-medium text-sidebar-accent-foreground">
              Theme
            </span>
            <DarkModeToggle />
          </div>
        </div>
      </div>
    </>
  )
}
