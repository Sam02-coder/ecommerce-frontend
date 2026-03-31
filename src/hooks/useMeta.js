import { useEffect } from 'react'

/**
 * usePageMeta — sets document title and meta description per page.
 *
 * Usage:
 *   usePageMeta({ title: 'Products', description: 'Browse all products' })
 *
 * Automatically restores defaults on unmount.
 */
const DEFAULT_TITLE = 'ShopZen — Modern Commerce'
const DEFAULT_DESCRIPTION = 'Your one-stop destination for quality products across electronics, fashion, home & more. Lightning-fast delivery.'

export function usePageMeta({ title, description } = {}) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ShopZen` : DEFAULT_TITLE
    document.title = fullTitle

    // Update meta description
    let metaDesc = document.querySelector('meta[name="description"]')
    if (!metaDesc) {
      metaDesc = document.createElement('meta')
      metaDesc.name = 'description'
      document.head.appendChild(metaDesc)
    }
    metaDesc.content = description || DEFAULT_DESCRIPTION

    // Update OG tags
    const ogTitle = document.querySelector('meta[property="og:title"]')
    if (ogTitle) ogTitle.content = fullTitle

    const ogDesc = document.querySelector('meta[property="og:description"]')
    if (ogDesc) ogDesc.content = description || DEFAULT_DESCRIPTION

    return () => {
      document.title = DEFAULT_TITLE
      if (metaDesc) metaDesc.content = DEFAULT_DESCRIPTION
    }
  }, [title, description])
}

/**
 * useScrollToTop — scrolls to top on route change.
 * Place in root App or Layout component.
 */
import { useLocation } from 'react-router-dom'

export function useScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])
}
