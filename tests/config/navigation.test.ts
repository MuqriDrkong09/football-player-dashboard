import {
  APP_NAME,
  mainNavItems,
  sidebarNavItems,
} from '@/config/navigation'

describe('config/navigation', () => {
  it('exposes the app name', () => {
    expect(APP_NAME).toBe('Football Dashboard')
  })

  it('lists main nav destinations', () => {
    expect(mainNavItems.map((item) => item.href)).toEqual([
      '/players',
      '/teams',
      '/standings',
      '/fixtures',
      '/leaderboards',
      '/compare',
      '/favorites',
      '/about',
    ])

  })

  it('adds dashboard to the sidebar', () => {
    expect(sidebarNavItems[0]).toMatchObject({
      label: 'Dashboard',
      href: '/',
    })
    expect(sidebarNavItems).toHaveLength(mainNavItems.length + 1)
  })
})
