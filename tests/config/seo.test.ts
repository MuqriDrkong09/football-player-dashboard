import { APP_NAME } from '@/config/navigation'
import { formatDocumentTitle, PAGE_META, SEO_DEFAULTS } from '@/config/seo'

describe('config/seo', () => {
  it('exposes default SEO metadata', () => {
    expect(SEO_DEFAULTS.siteName).toBe(APP_NAME)
    expect(SEO_DEFAULTS.themeColor).toBe('#15803d')
    expect(SEO_DEFAULTS.keywords).toContain('premier league')
  })

  it('defines page metadata for each route surface', () => {
    expect(PAGE_META.home.title).toBe('Dashboard')
    expect(PAGE_META.notFound.noIndex).toBe(true)
    expect(PAGE_META.favorites.description).toContain('saved')
  })

  it('formats document titles', () => {
    expect(formatDocumentTitle('Dashboard')).toContain(APP_NAME)
    expect(formatDocumentTitle('Players')).toBe(`Players | ${APP_NAME}`)
    expect(formatDocumentTitle(APP_NAME)).toContain('Premier League')
  })
})
