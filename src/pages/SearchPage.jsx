import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search, X, TrendingUp } from 'lucide-react'
import { productAPI } from '../services/api'
import ProductCard from '../components/product/ProductCard'
import { ProductCardSkeleton } from '../components/common/Skeleton'
import { usePageMeta } from '../hooks/useMeta'
import { useDebounce } from '../hooks/useApi'

const POPULAR_SEARCHES = [
  'iPhone', 'Laptop', 'Headphones', 'Sneakers', 'Watch', 'Perfume',
]

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialQuery = searchParams.get('q') || ''
  const [query, setQuery] = useState(initialQuery)
  const debouncedQuery = useDebounce(query, 400)

  usePageMeta({
    title: debouncedQuery ? `Search: "${debouncedQuery}"` : 'Search Products',
    description: 'Search thousands of products on ShopZen.',
  })

  // Sync URL with debounced query
  useEffect(() => {
    if (debouncedQuery.trim()) {
      setSearchParams({ q: debouncedQuery.trim() }, { replace: true })
    } else {
      setSearchParams({}, { replace: true })
    }
  }, [debouncedQuery, setSearchParams])

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => productAPI.getAll({
      search: debouncedQuery.trim(),
      size: 24,
      sortBy: 'averageRating',
      sortDir: 'desc',
    }),
    enabled: debouncedQuery.trim().length >= 2,
    keepPreviousData: true,
  })

  const products = data?.data?.data?.content || []
  const total = data?.data?.data?.totalElements || 0
  const hasResults = debouncedQuery.trim().length >= 2

  return (
    <div className="container-custom py-8 animate-fade-in max-w-5xl">
      {/* Search input */}
      <div className="relative mb-8">
        <Search
          size={22}
          className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
          aria-hidden="true"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for products, brands, categories…"
          autoFocus
          className="w-full pl-14 pr-12 py-4 text-lg rounded-2xl border-2 border-gray-200 bg-white focus:outline-none focus:border-primary-400 transition-colors"
          aria-label="Search products"
          aria-describedby={hasResults ? 'search-results-count' : undefined}
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            aria-label="Clear search"
            className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={18} aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Popular searches (shown when no query) */}
      {!query && (
        <div className="animate-fade-in">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-primary-500" aria-hidden="true" />
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              Popular Searches
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {POPULAR_SEARCHES.map((term) => (
              <button
                key={term}
                onClick={() => setQuery(term)}
                className="px-4 py-2 bg-gray-100 hover:bg-primary-50 hover:text-primary-700 text-gray-700 rounded-xl text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Too short */}
      {query && query.trim().length < 2 && (
        <p className="text-gray-400 text-center py-8">
          Type at least 2 characters to search
        </p>
      )}

      {/* Results count */}
      {hasResults && !isLoading && (
        <p
          id="search-results-count"
          className="text-sm text-gray-500 mb-6 flex items-center gap-2"
          aria-live="polite"
          aria-atomic="true"
        >
          {isFetching && (
            <span className="inline-block w-3 h-3 border-2 border-primary-300 border-t-primary-500 rounded-full animate-spin" aria-hidden="true" />
          )}
          {total > 0
            ? <><strong className="text-gray-900">{total.toLocaleString()}</strong> results for &ldquo;{debouncedQuery}&rdquo;</>
            : <>No results for &ldquo;{debouncedQuery}&rdquo;</>
          }
        </p>
      )}

      {/* Loading */}
      {isLoading && hasResults && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5" aria-busy="true">
          {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      )}

      {/* No results */}
      {hasResults && !isLoading && products.length === 0 && (
        <div className="text-center py-16 animate-fade-in">
          <p className="text-5xl mb-4 select-none" aria-hidden="true">🔍</p>
          <h2 className="font-display text-xl font-semibold text-gray-900 mb-2">
            No products found
          </h2>
          <p className="text-gray-500 mb-6">
            Try different keywords or browse our categories
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setQuery('')}
              className="btn-secondary !text-sm"
            >
              Clear Search
            </button>
            <Link to="/categories" className="btn-primary !text-sm">
              Browse Categories
            </Link>
          </div>
        </div>
      )}

      {/* Results grid */}
      {!isLoading && products.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 animate-fade-in">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}

      {/* See all results link */}
      {!isLoading && total > 24 && (
        <div className="text-center mt-8">
          <Link
            to={`/products?search=${encodeURIComponent(debouncedQuery)}`}
            className="btn-secondary flex items-center gap-2 inline-flex"
          >
            See all {total.toLocaleString()} results
          </Link>
        </div>
      )}
    </div>
  )
}
