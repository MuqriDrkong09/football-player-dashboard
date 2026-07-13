import { sidebarNavItems } from '@/config/navigation'
import { DarkModeToggle } from '@/components/layout/DarkModeToggle'
import { Logo } from '@/components/layout/Logo'
import { NavLinks } from '@/components/layout/NavLinks'
import { cn } from '@/lib/utils'

type SidebarProps = {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  return (
    <aside
      className={cn(
        'hidden w-64 shrink-0 border-r border-sidebar-border bg-sidebar lg:flex lg:flex-col',
        className,
      )}
      aria-label="Sidebar navigation"
    >
      <div className="flex h-16 items-center border-b border-sidebar-border px-4">
        <Logo showText />
      </div>

      <div className="flex flex-1 flex-col gap-4 p-4">
        <NavLinks
          items={sidebarNavItems}
          orientation="vertical"
          ariaLabel="Sidebar navigation"
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
    </aside>
  )
}
