import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

/**
 * QueryClient configuration
 *
 * retry: 1     — retry failed requests once before surfacing the error
 * staleTime    — data is fresh for 5 min; won't re-fetch on window focus within that window
 * gcTime       — unused cache entries are garbage-collected after 10 min (was cacheTime in v4)
 * refetchOnWindowFocus: false — avoids surprise re-fetches when user Alt+Tabs
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5,   // 5 minutes
      gcTime:    1000 * 60 * 10,   // 10 minutes
      refetchOnWindowFocus: false,
      // Show stale data while re-fetching (better UX than blanking the UI)
      placeholderData: (prev) => prev,
    },
    mutations: {
      // Don't retry mutations — if a POST fails once, don't silently retry
      retry: 0,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <App />
        <Toaster
          position="top-right"
          gutter={8}
          toastOptions={{
            duration: 3500,
            style: {
              borderRadius: '12px',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '14px',
              fontWeight: '500',
              maxWidth: '360px',
            },
            success: {
              iconTheme: { primary: '#f07520', secondary: '#fff' },
            },
            error: {
              duration: 5000, // Errors stay visible a bit longer
              iconTheme: { primary: '#ef4444', secondary: '#fff' },
            },
          }}
        />
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
)
