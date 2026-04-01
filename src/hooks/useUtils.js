import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * useWindowSize — returns current viewport { width, height }.
 * Updates on resize. SSR-safe (returns { width: 0, height: 0 } on server).
 *
 * Usage:
 *   const { width } = useWindowSize()
 *   const isMobile = width < 768
 */
export function useWindowSize() {
  const [size, setSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const update = () => setSize({ width: window.innerWidth, height: window.innerHeight })
    update()
    window.addEventListener('resize', update, { passive: true })
    return () => window.removeEventListener('resize', update)
  }, [])

  return size
}

/**
 * useOnlineStatus — returns whether the browser has a network connection.
 * Shows a toast when connection drops/restores so users know why requests fail.
 *
 * Usage:
 *   const isOnline = useOnlineStatus()
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  )

  useEffect(() => {
    const goOnline  = () => setIsOnline(true)
    const goOffline = () => setIsOnline(false)
    window.addEventListener('online',  goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online',  goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  return isOnline
}

/**
 * useKeyPress — fires a callback when a specific key is pressed.
 * Cleans up the listener automatically on unmount.
 *
 * Usage:
 *   useKeyPress('Escape', () => setModalOpen(false))
 *   useKeyPress('Enter',  handleSubmit, { ctrlKey: true })
 *
 * @param {string}   key      - Key name (e.g. 'Escape', 'Enter', 'ArrowUp')
 * @param {function} callback - Function to call when key matches
 * @param {object}   [opts]   - { ctrlKey, metaKey, shiftKey, altKey, enabled }
 */
export function useKeyPress(key, callback, opts = {}) {
  const { ctrlKey = false, metaKey = false, shiftKey = false, altKey = false, enabled = true } = opts
  const cb = useRef(callback)
  useEffect(() => { cb.current = callback }, [callback])

  useEffect(() => {
    if (!enabled) return
    const handler = (e) => {
      if (
        e.key === key &&
        e.ctrlKey  === ctrlKey  &&
        e.metaKey  === metaKey  &&
        e.shiftKey === shiftKey &&
        e.altKey   === altKey
      ) {
        cb.current(e)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [key, ctrlKey, metaKey, shiftKey, altKey, enabled])
}

/**
 * useClipboard — copy text to clipboard with a brief "copied" state.
 *
 * Usage:
 *   const { copy, copied } = useClipboard(1500)
 *   <button onClick={() => copy('some text')}>
 *     {copied ? 'Copied!' : 'Copy'}
 *   </button>
 *
 * @param {number} [resetDelay=2000] - ms before `copied` resets to false
 */
export function useClipboard(resetDelay = 2000) {
  const [copied, setCopied] = useState(false)
  const timer = useRef(null)

  const copy = useCallback(async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setCopied(false), resetDelay)
    } catch {
      // Clipboard API not available (HTTP, old browsers)
      setCopied(false)
    }
  }, [resetDelay])

  useEffect(() => () => clearTimeout(timer.current), [])

  return { copy, copied }
}

/**
 * usePrevious — returns the previous value of a variable.
 * Useful for comparing old vs new values inside effects.
 *
 * Usage:
 *   const prevCount = usePrevious(count)
 */
export function usePrevious(value) {
  const ref = useRef(undefined)
  useEffect(() => { ref.current = value }, [value])
  return ref.current
}

/**
 * useMediaQuery — returns true when the CSS media query matches.
 *
 * Usage:
 *   const isDark   = useMediaQuery('(prefers-color-scheme: dark)')
 *   const isMobile = useMediaQuery('(max-width: 767px)')
 */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia(query)
    setMatches(mq.matches)
    const handler = (e) => setMatches(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [query])

  return matches
}

/**
 * useOutsideClick — fires a callback when the user clicks outside a ref'd element.
 * Returns a ref to attach to your element.
 *
 * Usage:
 *   const ref = useOutsideClick(() => setOpen(false))
 *   <div ref={ref}>...</div>
 */
export function useOutsideClick(callback) {
  const ref = useRef(null)
  const cb  = useRef(callback)
  useEffect(() => { cb.current = callback }, [callback])

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        cb.current(e)
      }
    }
    document.addEventListener('mousedown', handler)
    document.addEventListener('touchstart', handler)
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('touchstart', handler)
    }
  }, [])

  return ref
}

/**
 * usePageLeave — fires a callback when the user tries to leave the page
 * (close tab, navigate away). Useful for "you have unsaved changes" warnings.
 *
 * Call enable() to activate the guard, disable() to remove it.
 *
 * Usage:
 *   const { enable, disable } = usePageLeave('You have unsaved changes.')
 *   useEffect(() => { if (isDirty) enable(); else disable() }, [isDirty])
 */
export function usePageLeave(message = 'You have unsaved changes. Are you sure you want to leave?') {
  const enabled = useRef(false)

  useEffect(() => {
    const handler = (e) => {
      if (!enabled.current) return
      e.preventDefault()
      e.returnValue = message
      return message
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [message])

  const enable  = useCallback(() => { enabled.current = true  }, [])
  const disable = useCallback(() => { enabled.current = false }, [])

  return { enable, disable }
}
