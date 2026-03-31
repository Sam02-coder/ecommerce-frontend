// ── Skeleton Components ───────────────────────────────────────────────────────
// Used as loading placeholders that match the shape of real content.

export function ProductCardSkeleton() {
  return (
    <div className="card animate-pulse" aria-hidden="true" role="presentation">
      <div className="aspect-square bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-3 bg-gray-200 rounded w-20" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="flex items-center gap-2 mt-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="w-3 h-3 bg-gray-200 rounded-full" />
          ))}
        </div>
        <div className="h-6 bg-gray-200 rounded w-24 mt-1" />
      </div>
    </div>
  )
}

export function OrderCardSkeleton() {
  return (
    <div className="card p-5 animate-pulse space-y-4" aria-hidden="true" role="presentation">
      <div className="flex justify-between">
        <div className="h-5 bg-gray-200 rounded w-32" />
        <div className="h-5 bg-gray-200 rounded w-20" />
      </div>
      <div className="h-4 bg-gray-200 rounded w-48" />
      <div className="h-4 bg-gray-200 rounded w-24" />
    </div>
  )
}

export function ProductDetailSkeleton() {
  return (
    <div className="container-custom py-8 animate-pulse" aria-hidden="true" role="presentation">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="aspect-square bg-gray-200 rounded-2xl" />
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded w-24" />
          <div className="h-8 bg-gray-200 rounded w-3/4" />
          <div className="h-8 bg-gray-200 rounded w-1/2" />
          <div className="h-12 bg-gray-200 rounded w-1/3" />
          <div className="flex gap-3">
            <div className="h-12 bg-gray-200 rounded-xl w-32" />
            <div className="h-12 bg-gray-200 rounded-xl flex-1" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function TableRowSkeleton({ cols = 5 }) {
  return (
    <tr aria-hidden="true" role="presentation">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-5 py-4">
          <div className="h-4 bg-gray-200 rounded animate-pulse" style={{ width: `${60 + (i % 3) * 20}%` }} />
        </td>
      ))}
    </tr>
  )
}

export function PageLoader() {
  return (
    <div
      className="flex items-center justify-center min-h-[400px]"
      role="status"
      aria-label="Loading page content"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary-100 border-t-primary-500 rounded-full animate-spin" aria-hidden="true" />
        <p className="text-sm text-gray-400 font-medium">Loading…</p>
      </div>
    </div>
  )
}

export function Spinner({ size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-10 h-10 border-4',
  }
  return (
    <div
      className={`${sizeClasses[size] || sizeClasses.md} border-primary-100 border-t-primary-500 rounded-full animate-spin ${className}`}
      role="status"
      aria-label="Loading"
    />
  )
}

// ── Protected Route Components ────────────────────────────────────────────────
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

/**
 * ProtectedRoute — redirects unauthenticated users to /login.
 * Preserves the intended destination via location state so LoginPage
 * can redirect back after a successful sign-in.
 */
export function ProtectedRoute({ children }) {
  const { isAuthenticated, isHydrated } = useAuthStore()
  const location = useLocation()

  // Wait for Zustand to rehydrate from localStorage before deciding.
  // Without this, users who are logged in see a flash redirect to /login on reload.
  if (!isHydrated) return <PageLoader />

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  return children
}

/**
 * AdminRoute — redirects non-admin authenticated users to /.
 * Unauthenticated users still go to /login.
 */
export function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin, isHydrated } = useAuthStore()
  const location = useLocation()

  if (!isHydrated) return <PageLoader />

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  if (!isAdmin()) {
    return <Navigate to="/" replace />
  }
  return children
}

/**
 * GuestRoute — redirects already-authenticated users away from auth pages.
 */
export function GuestRoute({ children }) {
  const { isAuthenticated, isHydrated } = useAuthStore()

  if (!isHydrated) return <PageLoader />

  if (isAuthenticated) return <Navigate to="/" replace />
  return children
}
