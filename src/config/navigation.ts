import type { LucideIcon } from 'lucide-react'
import {
  GitCompareArrows,
  Heart,
  Info,
  LayoutDashboard,
  Users,
} from 'lucide-react'

export type NavItem = {
  label: string
  href: string
  icon: LucideIcon
}

export const mainNavItems: NavItem[] = [
  { label: 'Players', href: '/players', icon: Users },
  { label: 'Compare', href: '/compare', icon: GitCompareArrows },
  { label: 'Favorites', href: '/favorites', icon: Heart },
  { label: 'About', href: '/about', icon: Info },
]

export const sidebarNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  ...mainNavItems,
]

export const APP_NAME = 'Football Dashboard'
