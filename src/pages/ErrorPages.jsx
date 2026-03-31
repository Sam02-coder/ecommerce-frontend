import { Link, useNavigate, useRouteError, isRouteErrorResponse } from 'react-router-dom'
import { Home, ArrowLeft, RefreshCw, AlertTriangle, Search } from 'lucide-react'
import { usePageMeta } from '../hooks/useMeta'

// ── 404 Not Found ─────────────────────────────────────────────────────────────
export function NotFoundPage() {
  usePageMeta({ title: '404 — Page Not Found' })
  const navigate = useNavigate()

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md animate-fade-in">
        {/* Large illustrated 404 */}
        <div className="relative inline-flex items-center justify-center mb-8">
          <div className="w-32 h-32 bg-primary-50 rounded-full flex items-center justify-center">
            <Search size={48} className="text-primary-300" aria-hidden="true" />
          </div>
          <span
            className="absolute -top-2 -right-2 w-12 h-12 bg-primary-500 text-white font-display font-bold text-lg rounded-2xl flex items-center justify-center shadow-lg"
            aria-hidden="true"
          >
            ?
          </span>
        </div>

        <p className="text-sm font-semibold text-primary-500 uppercase tracking-widest mb-2">
          Error 404
        </p>
        <h1 className="font-display text-4xl font-bold text-gray-900 mb-3">
          Page not found
        </h1>
        <p className="text-gray-500 leading-relaxed mb-8">
          The page you're looking for doesn't exist, has been moved, or the link is incorrect.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="btn-secondary flex items-center justify-center gap-2"
          >
            <ArrowLeft size={16} aria-hidden="true" /> Go Back
          </button>
          <Link to="/" className="btn-primary flex items-center justify-center gap-2">
            <Home size={16} aria-hidden="true" /> Go Home
          </Link>
        </div>

        {/* Helpful links */}
        <div className="mt-10 pt-8 border-t border-gray-100">
          <p className="text-sm text-gray-400 mb-4">You might be looking for:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              { label: 'Products', to: '/products' },
              { label: 'Categories', to: '/categories' },
              { label: 'My Orders', to: '/orders' },
              { label: 'My Account', to: '/account' },
            ].map(({ label, to }) => (
              <Link
                key={to}
                to={to}
                className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-primary-50 hover:text-primary-700 rounded-lg transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Generic Error Page ────────────────────────────────────────────────────────
export function ErrorPage() {
  usePageMeta({ title: 'Something went wrong' })
  const error = useRouteError()

  // Determine if this is a known route error or an unexpected JS error
  const isNotFound = isRouteErrorResponse(error) && error.status === 404
  if (isNotFound) return <NotFoundPage />

  const statusCode = isRouteErrorResponse(error) ? error.status : 500
  const message = isRouteErrorResponse(error)
    ? error.statusText
    : error?.message || 'An unexpected error occurred'

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md animate-fade-in">
        <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={36} className="text-red-400" aria-hidden="true" />
        </div>

        <p className="text-sm font-semibold text-red-500 uppercase tracking-widest mb-2">
          Error {statusCode}
        </p>
        <h1 className="font-display text-3xl font-bold text-gray-900 mb-3">
          Something went wrong
        </h1>
        <p className="text-gray-500 leading-relaxed mb-8">{message}</p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="btn-secondary flex items-center justify-center gap-2"
          >
            <RefreshCw size={16} aria-hidden="true" /> Try Again
          </button>
          <Link to="/" className="btn-primary flex items-center justify-center gap-2">
            <Home size={16} aria-hidden="true" /> Go Home
          </Link>
        </div>

        {/* Dev-only error details */}
        {import.meta.env.DEV && error?.stack && (
          <details className="mt-8 text-left bg-gray-900 text-gray-200 rounded-xl p-4 text-xs font-mono overflow-auto max-h-48">
            <summary className="cursor-pointer text-gray-400 mb-2">Stack trace (dev only)</summary>
            <pre className="whitespace-pre-wrap break-words">{error.stack}</pre>
          </details>
        )}
      </div>
    </div>
  )
}

// ── Offline Page ──────────────────────────────────────────────────────────────
export function OfflinePage() {
  usePageMeta({ title: 'You\'re offline' })

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-sm animate-fade-in">
        <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-4xl" aria-hidden="true">
          📡
        </div>
        <h1 className="font-display text-3xl font-bold text-gray-900 mb-3">You're offline</h1>
        <p className="text-gray-500 mb-8 leading-relaxed">
          Check your internet connection and try again.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="btn-primary flex items-center justify-center gap-2 mx-auto"
        >
          <RefreshCw size={16} aria-hidden="true" /> Retry
        </button>
      </div>
    </div>
  )
}
