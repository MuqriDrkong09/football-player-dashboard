import { X } from 'lucide-react'
import { useEffect, useId, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { sidebarNavItems } from '@/config/navigation'
import { DarkModeToggle } from '@/components/layout/DarkModeToggle'
import { Logo } from '@/components/layout/Logo'
import { NavLinks } from '@/components/layout/NavLinks'
import { LeagueSeasonSwitcher } from '@/components/league-season'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type MobileNavProps = {
  open: boolean
  onClose: () => void
}

export function MobileNav({ open, onClose }: MobileNavProps) {
  const location = useLocation()
  const panelRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const titleId = useId()

  useEffect(() => {
    onClose()
  }, [location.pathname, onClose])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    if (!open) return

    const previouslyFocused = document.activeElement as HTMLElement | null
    closeButtonRef.current?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }

      if (event.key !== 'Tab' || !panelRef.current) return

      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
      )

      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      previouslyFocused?.focus()
    }
  }, [open, onClose])

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-50 bg-black/60 transition-opacity duration-300 lg:hidden',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-[min(85vw,20rem)] flex-col border-r border-sidebar-border bg-sidebar shadow-xl transition-transform duration-300 ease-in-out lg:hidden',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-hidden={!open}
      >
        <div className="flex h-14 items-center justify-between border-b border-sidebar-border px-4 sm:h-16">
          <div id={titleId}>
            <Logo showText />
          </div>
          <Button
            ref={closeButtonRef}
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close navigation menu"
          >
            <X className="size-5" aria-hidden="true" />
          </Button>
        </div>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
          <NavLinks
            items={sidebarNavItems}
            orientation="vertical"
            onNavigate={onClose}
            ariaLabel="Mobile navigation"
          />
        </div>

        <div className="space-y-3 border-t border-sidebar-border p-4">
          <LeagueSeasonSwitcher showLabels size="compact" className="w-full" />
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
