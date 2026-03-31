import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight, Package } from 'lucide-react'
import { categoryAPI } from '../services/api'
import { usePageMeta } from '../hooks/useMeta'
import { SectionError } from '../components/common/ErrorBoundary'

const CATEGORY_EMOJIS = ['📱', '👗', '🏠', '📚', '⚽', '💄', '🎮', '🍳', '🧴', '🎧', '🖥️', '👟']

const GRADIENT_PAIRS = [
  ['from-blue-500 to-indigo-600',   'bg-blue-50'],
  ['from-pink-500 to-rose-600',     'bg-pink-50'],
  ['from-green-500 to-emerald-600', 'bg-green-50'],
  ['from-orange-500 to-amber-600',  'bg-orange-50'],
  ['from-purple-500 to-violet-600', 'bg-purple-50'],
  ['from-cyan-500 to-teal-600',     'bg-cyan-50'],
  ['from-red-500 to-rose-600',      'bg-red-50'],
  ['from-yellow-500 to-orange-500', 'bg-yellow-50'],
]

export default function CategoriesPage() {
  usePageMeta({
    title: 'Shop by Category',
    description: 'Browse all product categories on ShopZen — electronics, fashion, home, sports and more.',
  })

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryAPI.getAll(),
  })

  const categories = data?.data?.data?.filter((c) => c.active) || []

  return (
    <div className="container-custom py-12 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-14">
        <p className="text-sm font-semibold text-primary-500 uppercase tracking-widest mb-2">
          Explore
        </p>
        <h1 className="font-display text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
          Shop by Category
        </h1>
        <p className="text-gray-500 max-w-lg mx-auto leading-relaxed">
          From cutting-edge electronics to everyday essentials — find exactly what you're looking for.
        </p>
      </div>

      {/* Error state */}
      {isError && (
        <SectionError
          message="Failed to load categories."
          onRetry={refetch}
        />
      )}

      {/* Loading skeleton */}
      {isLoading && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="aspect-[4/3] bg-gray-200" />
              <div className="p-5 space-y-2">
                <div className="h-5 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Categories grid */}
      {!isLoading && !isError && (
        <>
          {categories.length === 0 ? (
            <div className="text-center py-20">
              <Package size={48} className="mx-auto text-gray-200 mb-4" aria-hidden="true" />
              <p className="text-gray-500">No categories available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {categories.map((cat, idx) => {
                const [gradient, lightBg] = GRADIENT_PAIRS[idx % GRADIENT_PAIRS.length]
                const emoji = CATEGORY_EMOJIS[idx % CATEGORY_EMOJIS.length]

                return (
                  <Link
                    key={cat.id}
                    to={`/products?categoryId=${cat.id}`}
                    className="group card overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2"
                    aria-label={`Browse ${cat.name}`}
                  >
                    {/* Image / gradient header */}
                    <div className={`relative aspect-[4/3] overflow-hidden ${cat.imageUrl ? '' : `bg-gradient-to-br ${gradient}`}`}>
                      {cat.imageUrl ? (
                        <img
                          src={cat.imageUrl}
                          alt=""
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-5xl select-none" aria-hidden="true">{emoji}</span>
                        </div>
                      )}

                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" aria-hidden="true" />

                      {/* Arrow on hover */}
                      <div className="absolute bottom-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300" aria-hidden="true">
                        <ArrowRight size={14} className="text-gray-700" />
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-5">
                      <h2 className="font-display font-bold text-gray-900 text-lg leading-tight group-hover:text-primary-600 transition-colors">
                        {cat.name}
                      </h2>
                      {cat.description && (
                        <p className="text-sm text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                          {cat.description}
                        </p>
                      )}
                      <p className="text-xs font-semibold text-primary-500 mt-3 flex items-center gap-1">
                        Shop now <ArrowRight size={12} aria-hidden="true" />
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}

          {/* Bottom CTA */}
          {categories.length > 0 && (
            <div className="mt-16 text-center">
              <div className="inline-flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-2xl px-8 py-5">
                <p className="text-gray-600 font-medium">Can't find what you're looking for?</p>
                <Link
                  to="/products"
                  className="btn-primary !py-2 !px-5 !text-sm flex items-center gap-1"
                >
                  Browse All Products <ArrowRight size={14} aria-hidden="true" />
                </Link>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
