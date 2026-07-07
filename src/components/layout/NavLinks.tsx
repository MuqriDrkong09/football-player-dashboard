import { NavLink } from 'react-router-dom'
import type { NavItem } from '@/config/navigation'
import { cn } from '@/lib/utils'

type NavLinksProps = {
  items: NavItem[]
  orientation?: 'horizontal' | 'vertical'
  onNavigate?: () => void
  className?: string
}

export function NavLinks({
  items,
  orientation = 'horizontal',
  onNavigate,
  className,
}: NavLinksProps) {
  return (
    <nav
      className={cn(
        orientation === 'horizontal'
          ? 'flex items-center gap-1'
          : 'flex flex-col gap-1',
        className,
      )}
      aria-label="Main navigation"
    >
      {items.map(({ label, href, icon: Icon }) => (
        <NavLink
          key={href}
          to={href}
          end={href === '/'}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              orientation === 'horizontal' && 'whitespace-nowrap',
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
            )
          }
        >
          <Icon className="size-4 shrink-0" aria-hidden="true" />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
