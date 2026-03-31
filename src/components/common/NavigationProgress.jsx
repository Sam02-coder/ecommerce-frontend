import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'

export default function NavigationProgress() {
  const location = useLocation()

  const [width, setWidth] = useState(0)
  const [visible, setVisible] = useState(false)

  const intervalRef = useRef(null)
  const timeoutRef = useRef(null)
  const delayRef = useRef(null)

  useEffect(() => {
    // 🧠 Small delay to avoid flicker on fast navigation
    delayRef.current = setTimeout(() => {
      setVisible(true)
      setWidth(10)

      intervalRef.current = setInterval(() => {
        setWidth((prev) => {
          if (prev >= 90) return prev
          const increment = prev < 50 ? 8 : prev < 75 ? 4 : 1
          return Math.min(90, prev + increment)
        })
      }, 200)
    }, 120) // delay before showing

    // When route changes, complete progress
    clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      clearInterval(intervalRef.current)
      setWidth(100)

      setTimeout(() => {
        setVisible(false)
        setWidth(0)
      }, 200)
    }, 500)

    return () => {
      clearInterval(intervalRef.current)
      clearTimeout(timeoutRef.current)
      clearTimeout(delayRef.current)
    }
  }, [location.pathname]) // 🔥 triggers on route change

  if (!visible) return null

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={width}
      aria-label="Page loading"
      className="fixed top-0 left-0 right-0 z-[200] h-[3px] pointer-events-none"
    >
      <div
        className="h-full bg-primary-500 transition-all ease-out"
        style={{
          width: `${width}%`,
          transitionDuration: width === 100 ? '200ms' : '300ms',
          boxShadow: '0 0 8px rgba(240, 117, 32, 0.6)',
        }}
      />
    </div>
  )
}