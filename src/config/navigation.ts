import type { LucideIcon } from 'lucide-react'
import {
  CalendarDays,
  GitCompareArrows,
  Heart,
  Info,
  LayoutDashboard,
  ListOrdered,
  Shield,
  Trophy,
  Users,
} from 'lucide-react'

export type NavItem = {
  label: string
  href: string
  icon: LucideIcon
}

export const mainNavItems: NavItem[] = [
  { label: 'Players', href: '/players', icon: Users },
  { label: 'Teams', href: '/teams', icon: Shield },
  { label: 'Standings', href: '/standings', icon: ListOrdered },
  { label: 'Fixtures', href: '/fixtures', icon: CalendarDays },
  { label: 'Leaderboards', href: '/leaderboards', icon: Trophy },
  { label: 'Compare', href: '/compare', icon: GitCompareArrows },
  { label: 'Favorites', href: '/favorites', icon: Heart },
  { label: 'About', href: '/about', icon: Info },
]

export const sidebarNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  ...mainNavItems,
]

export const APP_NAME = 'Football Dashboard'
