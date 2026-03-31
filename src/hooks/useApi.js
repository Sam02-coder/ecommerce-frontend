import { useState, useCallback, useRef } from 'react'

/**
 * useApi — lightweight hook for imperative API calls (mutations, one-off fetches).
 * For declarative data fetching use @tanstack/react-query instead.
 *
 * Features:
 *  - Tracks loading + error state
 *  - Cancels in-flight requests on unmount via AbortController
 *  - Returns the unwrapped data payload (response.data.data ?? response.data)
 *
 * Usage:
 *   const { execute, loading, error, reset } = useApi(addressAPI.create)
 *   const newAddr = await execute(addressData)  // throws on error
 */
export function useApi(apiFunction) {
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)
  const abortRef = useRef(null)

  const execute = useCallback(async (...args) => {
    // Cancel any previous in-flight call
    abortRef.current?.abort()
    abortRef.current = new AbortController()

    setLoading(true)
    setError(null)

    try {
      const response = await apiFunction(...args, {
        signal: abortRef.current.signal,
      })
      return response.data?.data ?? response.data
    } catch (err) {
      // Ignore AbortError (unmount / re-call)
      if (err.name === 'AbortError' || err.code === 'ERR_CANCELED') return

      const message = err.response?.data?.message || err.message || 'Request failed'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [apiFunction])

  const reset = useCallback(() => {
    setError(null)
    setLoading(false)
  }, [])

  return { execute, loading, error, reset }
}

/**
 * useDebounce — debounces a value by the given delay (ms).
 *
 * Usage:
 *   const debouncedSearch = useDebounce(searchQuery, 400)
 *   useEffect(() => { fetchResults(debouncedSearch) }, [debouncedSearch])
 */
import { useState as useStateD, useEffect } from 'react'

export function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useStateD(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}

/**
 * useLocalStorage — synced localStorage state with SSR safety.
 *
 * Usage:
 *   const [theme, setTheme] = useLocalStorage('theme', 'light')
 */
import { useState as useStateLS, useCallback as useCallbackLS } from 'react'

export function useLocalStorage(key, initialValue) {
  const [stored, setStored] = useStateLS(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = useCallbackLS((value) => {
    try {
      const toStore = value instanceof Function ? value(stored) : value
      setStored(toStore)
      window.localStorage.setItem(key, JSON.stringify(toStore))
    } catch {
      // Ignore write errors (e.g. private browsing storage quota)
    }
  }, [key, stored])

  return [stored, setValue]
}

/**
 * useIntersectionObserver — triggers a callback when an element enters the viewport.
 * Useful for infinite scroll or lazy-loading sections.
 *
 * Usage:
 *   const ref = useIntersectionObserver(() => loadMore(), { threshold: 0.1 })
 *   <div ref={ref} />
 */
import { useEffect as useEffectIO, useRef as useRefIO, useCallback as useCallbackIO } from 'react'

export function useIntersectionObserver(onIntersect, options = {}) {
  const ref = useRefIO(null)
  const cb  = useCallbackIO(onIntersect, [onIntersect])

  useEffectIO(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) cb() },
      { threshold: 0.1, ...options }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [cb, options])

  return ref
}
