import { Component } from 'react'
import { RefreshCw, AlertTriangle } from 'lucide-react'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    // In production, send to your error tracking service (e.g. Sentry)
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-[400px] px-4">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={28} className="text-red-500" />
            </div>
            <h2 className="font-display text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
            <p className="text-gray-500 text-sm mb-6">
              {this.props.fallbackMessage || 'An unexpected error occurred. Please try refreshing the page.'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null })
                window.location.reload()
              }}
              className="btn-primary flex items-center gap-2 mx-auto"
            >
              <RefreshCw size={16} /> Refresh Page
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

// Lightweight inline error fallback for sections
export function SectionError({ message = 'Failed to load this section.', onRetry }) {
  return (
    <div className="card p-8 text-center border-red-100">
      <AlertTriangle size={24} className="mx-auto text-red-400 mb-2" />
      <p className="text-sm text-gray-500 mb-3">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="text-xs text-primary-600 font-medium hover:underline">
          Try again
        </button>
      )}
    </div>
  )
}
