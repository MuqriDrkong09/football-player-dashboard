import { useEffect } from 'react'
import { formatDocumentTitle, SEO_DEFAULTS, type PageMeta } from '@/config/seo'

function upsertMeta(
  attribute: 'name' | 'property',
  key: string,
  content: string,
) {
  const selector = `meta[${attribute}="${key}"]`
  let element = document.head.querySelector<HTMLMetaElement>(selector)

  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, key)
    document.head.appendChild(element)
  }

  element.content = content
}

export function usePageMeta({
  title,
  description = SEO_DEFAULTS.description,
  noIndex = false,
}: PageMeta) {
  useEffect(() => {
    const previousTitle = document.title
    const formattedTitle = formatDocumentTitle(title)

    document.title = formattedTitle
    upsertMeta('name', 'description', description)
    upsertMeta('name', 'keywords', SEO_DEFAULTS.keywords)
    upsertMeta(
      'name',
      'robots',
      noIndex ? 'noindex, nofollow' : 'index, follow',
    )
    upsertMeta('property', 'og:title', formattedTitle)
    upsertMeta('property', 'og:description', description)
    upsertMeta('property', 'og:type', 'website')
    upsertMeta('property', 'og:site_name', SEO_DEFAULTS.siteName)
    upsertMeta('name', 'twitter:card', 'summary')
    upsertMeta('name', 'twitter:title', formattedTitle)
    upsertMeta('name', 'twitter:description', description)

    return () => {
      document.title = previousTitle
    }
  }, [description, noIndex, title])
}
