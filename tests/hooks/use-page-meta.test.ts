import { renderHook } from '@testing-library/react'
import { formatDocumentTitle, SEO_DEFAULTS } from '@/config/seo'
import { usePageMeta } from '@/hooks/use-page-meta'

function getMeta(attribute: 'name' | 'property', key: string) {
  return document.head.querySelector<HTMLMetaElement>(
    `meta[${attribute}="${key}"]`,
  )
}

describe('hooks/usePageMeta', () => {
  const previousTitle = 'Previous title'

  beforeEach(() => {
    document.title = previousTitle
    document.head
      .querySelectorAll('meta[name], meta[property]')
      .forEach((el) => el.remove())
  })

  it('sets the document title and creates default SEO meta tags', () => {
    renderHook(() => usePageMeta({ title: 'Dashboard' }))

    const formatted = formatDocumentTitle('Dashboard')
    expect(document.title).toBe(formatted)

    expect(getMeta('name', 'description')?.content).toBe(
      SEO_DEFAULTS.description,
    )
    expect(getMeta('name', 'keywords')?.content).toBe(SEO_DEFAULTS.keywords)
    expect(getMeta('name', 'robots')?.content).toBe('index, follow')
    expect(getMeta('property', 'og:title')?.content).toBe(formatted)
    expect(getMeta('property', 'og:description')?.content).toBe(
      SEO_DEFAULTS.description,
    )
    expect(getMeta('property', 'og:type')?.content).toBe('website')
    expect(getMeta('property', 'og:site_name')?.content).toBe(
      SEO_DEFAULTS.siteName,
    )
    expect(getMeta('name', 'twitter:card')?.content).toBe('summary')
    expect(getMeta('name', 'twitter:title')?.content).toBe(formatted)
    expect(getMeta('name', 'twitter:description')?.content).toBe(
      SEO_DEFAULTS.description,
    )
  })

  it('uses a custom description and noindex robots when requested', () => {
    renderHook(() =>
      usePageMeta({
        title: 'Hidden',
        description: 'Custom page description',
        noIndex: true,
      }),
    )

    expect(getMeta('name', 'description')?.content).toBe(
      'Custom page description',
    )
    expect(getMeta('name', 'robots')?.content).toBe('noindex, nofollow')
    expect(getMeta('property', 'og:description')?.content).toBe(
      'Custom page description',
    )
    expect(getMeta('name', 'twitter:description')?.content).toBe(
      'Custom page description',
    )
  })

  it('updates existing meta tags instead of creating duplicates', () => {
    const existing = document.createElement('meta')
    existing.setAttribute('name', 'description')
    existing.content = 'old'
    document.head.appendChild(existing)

    renderHook(() =>
      usePageMeta({
        title: 'Players',
        description: 'updated description',
      }),
    )

    const descriptions = document.head.querySelectorAll(
      'meta[name="description"]',
    )
    expect(descriptions).toHaveLength(1)
    expect(descriptions[0]?.getAttribute('content')).toBe('updated description')
  })

  it('restores the previous document title on unmount', () => {
    const { unmount } = renderHook(() => usePageMeta({ title: 'Compare' }))

    expect(document.title).toBe(formatDocumentTitle('Compare'))
    unmount()
    expect(document.title).toBe(previousTitle)
  })

  it('refreshes meta tags when title, description, or noIndex change', () => {
    const { rerender } = renderHook(
      ({ title, description, noIndex }) =>
        usePageMeta({ title, description, noIndex }),
      {
        initialProps: {
          title: 'A',
          description: 'first',
          noIndex: false,
        },
      },
    )

    expect(document.title).toBe(formatDocumentTitle('A'))
    expect(getMeta('name', 'robots')?.content).toBe('index, follow')

    rerender({
      title: 'B',
      description: 'second',
      noIndex: true,
    })

    expect(document.title).toBe(formatDocumentTitle('B'))
    expect(getMeta('name', 'description')?.content).toBe('second')
    expect(getMeta('name', 'robots')?.content).toBe('noindex, nofollow')
    expect(getMeta('property', 'og:title')?.content).toBe(
      formatDocumentTitle('B'),
    )
  })
})
