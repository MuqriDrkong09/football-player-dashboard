import { APP_NAME } from '@/config/navigation'
import { router } from '@/routes/router'

describe('routes/router', () => {
  it('registers the expected top-level routes', () => {
    const paths = router.routes[0]?.children?.map((route) =>
      route.index ? '/' : `/${route.path}`,
    )

    expect(paths).toEqual(
      expect.arrayContaining([
        '/',
        '/players',
        '/players/:playerId',
        '/teams',
        '/teams/:teamId',
        '/matches/:matchId',
        '/standings',
        '/fixtures',
        '/leaderboards',

        '/compare',
        '/favorites',
        '/about',
        '/*',
      ]),
    )
  })

  it('keeps the product name available for page chrome', () => {
    expect(APP_NAME).toBe('Football Dashboard')
  })
})
