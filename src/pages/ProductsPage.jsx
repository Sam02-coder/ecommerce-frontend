import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { SlidersHorizontal, X, ChevronDown, ChevronUp } from 'lucide-react'
import { productAPI, categoryAPI } from '../services/api'
import ProductCard from '../components/product/ProductCard'
import { ProductCardSkeleton } from '../components/common/Skeleton'
import { usePageMeta } from '../hooks/useMeta'

const SORT_OPTIONS = [
  { value: 'createdAt-desc', label: 'Newest First' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'averageRating-desc', label: 'Top Rated' },
  { value: 'name-asc', label: 'Name A–Z' },
]

const INITIAL_FILTERS = {
  search: '',
  categoryId: '',
  minPrice: '',
  maxPrice: '',
  brand: '',
  sort: 'createdAt-desc',
  page: 0,
}

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [filterOpen, setFilterOpen] = useState(false)
  const [priceOpen, setPriceOpen] = useState(true)
  const [brandOpen, setBrandOpen] = useState(true)

  const [localFilters, setLocalFilters] = useState({
    ...INITIAL_FILTERS,
    search: searchParams.get('search') || '',
    categoryId: searchParams.get('categoryId') || '',
  })

  const pageTitle = localFilters.search
    ? `Search: "${localFilters.search}"`
    : localFilters.categoryId
    ? 'Category Products'
    : 'All Products'

  usePageMeta({
    title: pageTitle,
    description: 'Browse thousands of quality products. Filter by category, price, brand and more.',
  })

  const [sortBy, sortDir] = localFilters.sort.split('-')

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products', localFilters],
    queryFn: () => productAPI.getAll({
      search: localFilters.search || undefined,
      categoryId: localFilters.categoryId || undefined,
      minPrice: localFilters.minPrice || undefined,
      maxPrice: localFilters.maxPrice || undefined,
      brand: localFilters.brand || undefined,
      sortBy,
      sortDir,
      page: localFilters.page,
      size: 12,
    }),
    keepPreviousData: true,
  })

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryAPI.getAll(),
  })

  const { data: brandsData } = useQuery({
    queryKey: ['brands'],
    queryFn: () => productAPI.getBrands(),
  })

  const products = productsData?.data?.data?.content || []
  const totalPages = productsData?.data?.data?.totalPages || 0
  const totalElements = productsData?.data?.data?.totalElements || 0
  const categories = categoriesData?.data?.data || []
  const brands = brandsData?.data?.data || []

  // Sync URL params → filters
  useEffect(() => {
    setLocalFilters((prev) => ({
      ...prev,
      search: searchParams.get('search') || '',
      categoryId: searchParams.get('categoryId') || '',
      page: 0,
    }))
  }, [searchParams])

  const updateFilter = useCallback((key, value) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value, page: 0 }))
  }, [])

  const clearFilters = useCallback(() => {
    setLocalFilters(INITIAL_FILTERS)
    setSearchParams({})
  }, [setSearchParams])

  const hasFilters = localFilters.search || localFilters.categoryId || localFilters.minPrice || localFilters.maxPrice || localFilters.brand

  // Build pagination window
  const pageWindow = (() => {
    const delta = 2
    const range = []
    for (let i = Math.max(0, localFilters.page - delta); i <= Math.min(totalPages - 1, localFilters.page + delta); i++) {
      range.push(i)
    }
    return range
  })()

  return (
    <div className="container-custom py-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="section-title">
            {localFilters.search ? `Results for "${localFilters.search}"` : 'All Products'}
          </h1>
          {!isLoading && (
            <p className="text-gray-500 mt-1 text-sm" aria-live="polite" aria-atomic="true">
              {totalElements.toLocaleString()} product{totalElements !== 1 ? 's' : ''} found
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            aria-expanded={filterOpen}
            aria-controls="filter-sidebar"
            className="flex items-center gap-2 btn-secondary !py-2.5 !px-4 !text-sm lg:hidden"
          >
            <SlidersHorizontal size={16} aria-hidden="true" />
            Filters
            {hasFilters && (
              <span className="w-5 h-5 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center" aria-label="Active filters">
                !
              </span>
            )}
          </button>
          <div>
            <label htmlFor="sort-select" className="sr-only">Sort products</label>
            <select
              id="sort-select"
              value={localFilters.sort}
              onChange={(e) => updateFilter('sort', e.target.value)}
              className="input-field !py-2.5 !text-sm w-auto"
            >
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Active filters */}
      {hasFilters && (
        <div className="flex flex-wrap items-center gap-2 mb-6" role="group" aria-label="Active filters">
          <span className="text-sm text-gray-500">Active filters:</span>
          {localFilters.search && (
            <span className="badge bg-primary-100 text-primary-700 gap-1.5">
              Search: {localFilters.search}
              <button onClick={() => updateFilter('search', '')} aria-label="Remove search filter" className="hover:text-primary-900">
                <X size={12} />
              </button>
            </span>
          )}
          {localFilters.categoryId && (
            <span className="badge bg-primary-100 text-primary-700 gap-1.5">
              Category: {categories.find((c) => String(c.id) === String(localFilters.categoryId))?.name || 'Unknown'}
              <button onClick={() => updateFilter('categoryId', '')} aria-label="Remove category filter" className="hover:text-primary-900">
                <X size={12} />
              </button>
            </span>
          )}
          {localFilters.minPrice && (
            <span className="badge bg-primary-100 text-primary-700 gap-1.5">
              Min ₹{localFilters.minPrice}
              <button onClick={() => updateFilter('minPrice', '')} aria-label="Remove minimum price filter" className="hover:text-primary-900">
                <X size={12} />
              </button>
            </span>
          )}
          {localFilters.maxPrice && (
            <span className="badge bg-primary-100 text-primary-700 gap-1.5">
              Max ₹{localFilters.maxPrice}
              <button onClick={() => updateFilter('maxPrice', '')} aria-label="Remove maximum price filter" className="hover:text-primary-900">
                <X size={12} />
              </button>
            </span>
          )}
          {localFilters.brand && (
            <span className="badge bg-primary-100 text-primary-700 gap-1.5">
              Brand: {localFilters.brand}
              <button onClick={() => updateFilter('brand', '')} aria-label="Remove brand filter" className="hover:text-primary-900">
                <X size={12} />
              </button>
            </span>
          )}
          <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-700 font-medium underline-offset-2 hover:underline">
            Clear all
          </button>
        </div>
      )}

      <div className="flex gap-8">
        {/* Sidebar Filters */}
        <aside
          id="filter-sidebar"
          className={`${filterOpen ? 'block' : 'hidden'} lg:block w-64 shrink-0`}
          aria-label="Product filters"
        >
          <div className="card p-5 space-y-6 sticky top-24">
            {/* Categories */}
            <div>
              <h3 className="font-display font-semibold text-gray-900 mb-3 text-sm">Categories</h3>
              <div className="space-y-1" role="radiogroup" aria-label="Filter by category">
                <button
                  onClick={() => updateFilter('categoryId', '')}
                  aria-pressed={!localFilters.categoryId}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400 ${
                    !localFilters.categoryId ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => updateFilter('categoryId', cat.id)}
                    aria-pressed={String(localFilters.categoryId) === String(cat.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400 ${
                      String(localFilters.categoryId) === String(cat.id) ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="border-t border-gray-100 pt-5">
              <button
                onClick={() => setPriceOpen(!priceOpen)}
                aria-expanded={priceOpen}
                className="flex items-center justify-between w-full font-display font-semibold text-gray-900 text-sm mb-3 focus:outline-none"
              >
                Price Range
                {priceOpen ? <ChevronUp size={15} aria-hidden="true" /> : <ChevronDown size={15} aria-hidden="true" />}
              </button>
              {priceOpen && (
                <div className="flex gap-2">
                  <div>
                    <label htmlFor="price-min" className="sr-only">Minimum price in rupees</label>
                    <input
                      id="price-min"
                      type="number"
                      placeholder="Min ₹"
                      min="0"
                      value={localFilters.minPrice}
                      onChange={(e) => updateFilter('minPrice', e.target.value)}
                      className="input-field !py-2 !text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="price-max" className="sr-only">Maximum price in rupees</label>
                    <input
                      id="price-max"
                      type="number"
                      placeholder="Max ₹"
                      min="0"
                      value={localFilters.maxPrice}
                      onChange={(e) => updateFilter('maxPrice', e.target.value)}
                      className="input-field !py-2 !text-sm"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Brands */}
            {brands.length > 0 && (
              <div className="border-t border-gray-100 pt-5">
                <button
                  onClick={() => setBrandOpen(!brandOpen)}
                  aria-expanded={brandOpen}
                  className="flex items-center justify-between w-full font-display font-semibold text-gray-900 text-sm mb-3 focus:outline-none"
                >
                  Brands
                  {brandOpen ? <ChevronUp size={15} aria-hidden="true" /> : <ChevronDown size={15} aria-hidden="true" />}
                </button>
                {brandOpen && (
                  <fieldset>
                    <legend className="sr-only">Filter by brand</legend>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {brands.map((brand) => (
                        <label key={brand} className="flex items-center gap-2 cursor-pointer group">
                          <input
                            type="radio"
                            name="brand"
                            value={brand}
                            checked={localFilters.brand === brand}
                            onChange={() => updateFilter('brand', localFilters.brand === brand ? '' : brand)}
                            className="accent-primary-500"
                          />
                          <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">{brand}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                )}
              </div>
            )}

            {hasFilters && (
              <button
                onClick={clearFilters}
                className="w-full btn-secondary !text-sm !py-2 border-dashed"
              >
                Clear All Filters
              </button>
            )}
          </div>
        </aside>

        {/* Products Grid */}
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-5" aria-busy="true" aria-label="Loading products">
              {Array.from({ length: 12 }).map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20" role="status">
              <p className="text-6xl mb-4 select-none" aria-hidden="true">🔍</p>
              <h2 className="font-display text-xl font-semibold text-gray-900 mb-2">No products found</h2>
              <p className="text-gray-500 mb-6">Try adjusting your search or filters</p>
              <button onClick={clearFilters} className="btn-primary">Clear Filters</button>
            </div>
          ) : (
            <>
              <div
                className="grid grid-cols-2 lg:grid-cols-3 gap-5"
                role="list"
                aria-label={`${products.length} products`}
              >
                {products.map((p) => (
                  <div key={p.id} role="listitem">
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <nav className="flex justify-center items-center gap-2 mt-10" aria-label="Product pages">
                  <button
                    disabled={localFilters.page === 0}
                    onClick={() => updateFilter('page', localFilters.page - 1)}
                    aria-label="Previous page"
                    className="btn-secondary !py-2 !px-4 !text-sm disabled:opacity-40"
                  >
                    Previous
                  </button>

                  {pageWindow[0] > 0 && (
                    <>
                      <button onClick={() => updateFilter('page', 0)} className="w-10 h-10 rounded-xl text-sm font-medium bg-white text-gray-600 border border-gray-200 hover:border-primary-300 transition-colors">1</button>
                      {pageWindow[0] > 1 && <span className="text-gray-400 px-1">…</span>}
                    </>
                  )}

                  {pageWindow.map((i) => (
                    <button
                      key={i}
                      onClick={() => updateFilter('page', i)}
                      aria-current={i === localFilters.page ? 'page' : undefined}
                      aria-label={`Page ${i + 1}`}
                      className={`w-10 h-10 rounded-xl text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400 ${
                        i === localFilters.page ? 'bg-primary-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}

                  {pageWindow[pageWindow.length - 1] < totalPages - 1 && (
                    <>
                      {pageWindow[pageWindow.length - 1] < totalPages - 2 && <span className="text-gray-400 px-1">…</span>}
                      <button onClick={() => updateFilter('page', totalPages - 1)} className="w-10 h-10 rounded-xl text-sm font-medium bg-white text-gray-600 border border-gray-200 hover:border-primary-300 transition-colors">{totalPages}</button>
                    </>
                  )}

                  <button
                    disabled={localFilters.page >= totalPages - 1}
                    onClick={() => updateFilter('page', localFilters.page + 1)}
                    aria-label="Next page"
                    className="btn-secondary !py-2 !px-4 !text-sm disabled:opacity-40"
                  >
                    Next
                  </button>
                </nav>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
