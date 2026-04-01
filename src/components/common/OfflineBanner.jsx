import { useEffect, useState } from 'react'
import { useOnlineStatus } from '../../hooks/useUtils'
import { WifiOff, Wifi } from 'lucide-react'

/**
 * OfflineBanner
 *
 * Shows a fixed banner at the top when the user loses internet connection.
 * Shows a brief "back online" confirmation when connection restores.
 *
 * Place once in App.jsx, above <Routes>.
 */
export default function OfflineBanner() {
  const isOnline = useOnlineStatus()
  const [showRestored, setShowRestored] = useState(false)
  const [wasOffline, setWasOffline] = useState(false)

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true)
    } else if (wasOffline) {
      // Was offline, just came back online
      setShowRestored(true)
      const timer = setTimeout(() => {
        setShowRestored(false)
        setWasOffline(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isOnline, wasOffline])

  if (isOnline && !showRestored) return null

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={`fixed top-0 left-0 right-0 z-[300] flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-all duration-300 ${
        isOnline
          ? 'bg-green-500 text-white'
          : 'bg-gray-900 text-white'
      }`}
    >
      {isOnline ? (
        <>
          <Wifi size={15} aria-hidden="true" />
          Back online
        </>
      ) : (
        <>
          <WifiOff size={15} aria-hidden="true" />
          You're offline — some features may not work
        </>
      )}
    </div>
  )
}
