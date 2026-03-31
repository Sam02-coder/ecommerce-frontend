import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { ArrowRight, Truck, ShieldCheck, RotateCcw, Headphones, Zap } from 'lucide-react'
import { productAPI, categoryAPI } from '../services/api'
import ProductCard from '../components/product/ProductCard'
import { ProductCardSkeleton } from '../components/common/Skeleton'
import { usePageMeta } from '../hooks/useMeta'

const FEATURES = [
  { icon: Truck, title: 'Free Shipping', desc: 'On orders above ₹500', color: 'text-blue-500', bg: 'bg-blue-50' },
  { icon: ShieldCheck, title: 'Secure Payment', desc: '100% protected checkout', color: 'text-green-500', bg: 'bg-green-50' },
  { icon: RotateCcw, title: 'Easy Returns', desc: '30 day return policy', color: 'text-purple-500', bg: 'bg-purple-50' },
  { icon: Headphones, title: '24/7 Support', desc: 'Always here to help', color: 'text-orange-500', bg: 'bg-orange-50' },
]

const CATEGORY_EMOJIS = ['📱', '👗', '🏠', '📚', '⚽', '💄', '🎮', '🍳']

export default function HomePage() {
  usePageMeta({
    title: 'ShopZen — Modern Commerce',
    description: 'Discover thousands of curated products. Electronics, fashion, home & more. Quality guaranteed, fast delivery.',
  })

  const { data: featuredData, isLoading: featuredLoading } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => productAPI.getFeatured(),
  })

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryAPI.getAll(),
  })

  const { data: newArrivalsData, isLoading: newLoading } = useQuery({
    queryKey: ['new-arrivals'],
    queryFn: () => productAPI.getAll({ sortBy: 'createdAt', sortDir: 'desc', size: 8 }),
  })

  const featured = featuredData?.data?.data || []
  const categories = categoriesData?.data?.data || []
  const newArrivals = newArrivalsData?.data?.data?.content || []

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white" aria-label="Hero banner">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" aria-hidden="true" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" aria-hidden="true" />

        <div className="container-custom relative z-10 py-24 lg:py-32">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Zap size={14} className="text-primary-400" aria-hidden="true" />
              <span>New Arrivals — Up to 40% off</span>
            </div>
            <h1 className="font-display text-5xl lg:text-7xl font-bold leading-tight mb-6">
              Discover Your
              <span className="block text-primary-400">Perfect Style</span>
            </h1>
            <p className="text-xl text-gray-300 mb-10 leading-relaxed max-w-lg">
              Explore thousands of curated products across electronics, fashion, home & more. Quality guaranteed.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/products" className="btn-primary flex items-center gap-2 !text-base !px-8 !py-4">
                Shop Now <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link
                to="/categories"
                className="flex items-center gap-2 !text-base !px-8 !py-4 rounded-xl font-semibold border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-all duration-200 active:scale-95"
              >
                Browse Categories
              </Link>
            </div>

            {/* Stats */}
            <dl className="flex gap-10 mt-14 pt-10 border-t border-white/10">
              {[['50K+', 'Products'], ['200K+', 'Customers'], ['4.9★', 'Avg Rating']].map(([num, label]) => (
                <div key={label}>
                  <dt className="font-display text-2xl font-bold text-primary-400">{num}</dt>
                  <dd className="text-sm text-gray-400">{label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container-custom -mt-8 relative z-10" aria-label="Store features">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map(({ icon: Icon, title, desc, color, bg }) => (
            <div key={title} className="card p-5 flex items-center gap-4">
              <div className={`${bg} ${color} p-3 rounded-xl shrink-0`} aria-hidden="true">
                <Icon size={20} />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="container-custom mt-20" aria-labelledby="categories-heading">
          <div className="flex items-center justify-between mb-8">
            <h2 id="categories-heading" className="section-title">Shop by Category</h2>
            <Link to="/categories" className="text-primary-600 font-medium text-sm flex items-center gap-1 hover:gap-2 transition-all">
              View all <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat, idx) => (
              <Link
                key={cat.id}
                to={`/products?categoryId=${cat.id}`}
                className="card p-5 flex flex-col items-center gap-3 hover:border-primary-200 hover:shadow-md transition-all duration-200 group text-center focus:outline-none focus:ring-2 focus:ring-primary-400"
              >
                {cat.imageUrl ? (
                  <img src={cat.imageUrl} alt="" className="w-14 h-14 object-cover rounded-xl" />
                ) : (
                  <div className="w-14 h-14 bg-primary-50 rounded-xl flex items-center justify-center text-2xl" aria-hidden="true">
                    {CATEGORY_EMOJIS[idx % CATEGORY_EMOJIS.length]}
                  </div>
                )}
                <span className="text-sm font-semibold text-gray-700 group-hover:text-primary-600 transition-colors">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="container-custom mt-20" aria-labelledby="featured-heading">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 id="featured-heading" className="section-title">Featured Products</h2>
            <p className="text-gray-500 mt-1">Handpicked by our team</p>
          </div>
          <Link to="/products?featured=true" className="text-primary-600 font-medium text-sm flex items-center gap-1 hover:gap-2 transition-all">
            See all <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {featuredLoading
            ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : featured.slice(0, 8).map((p) => <ProductCard key={p.id} product={p} />)
          }
        </div>
      </section>

      {/* Promo Banner */}
      <section className="container-custom mt-20" aria-label="Promotional offer">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-500 to-orange-500 p-10 lg:p-16 text-white">
          <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/3 translate-x-1/3 blur-2xl" aria-hidden="true" />
          <div className="relative z-10 max-w-xl">
            <span className="text-sm font-semibold uppercase tracking-widest opacity-80">Limited time offer</span>
            <h2 className="font-display text-4xl lg:text-5xl font-bold mt-2 mb-4">Get 20% off your first order</h2>
            <p className="text-white/80 mb-8">
              Use code <strong className="text-white bg-white/20 px-2 py-0.5 rounded font-mono">WELCOME10</strong> at checkout. No minimum order required.
            </p>
            <Link to="/products" className="inline-flex items-center gap-2 bg-white text-primary-600 font-semibold px-8 py-4 rounded-xl hover:bg-gray-50 transition-colors">
              Shop Now <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="container-custom mt-20 mb-8" aria-labelledby="arrivals-heading">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 id="arrivals-heading" className="section-title">New Arrivals</h2>
            <p className="text-gray-500 mt-1">Fresh drops this week</p>
          </div>
          <Link to="/products?sortBy=createdAt&sortDir=desc" className="text-primary-600 font-medium text-sm flex items-center gap-1 hover:gap-2 transition-all">
            View all <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {newLoading
            ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : newArrivals.map((p) => <ProductCard key={p.id} product={p} />)
          }
        </div>
      </section>
    </div>
  )
}
