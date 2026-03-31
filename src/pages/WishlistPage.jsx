import { Link } from 'react-router-dom'
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react'
import { useWishlistStore } from '../store/wishlistStore'
import { useCartStore } from '../store/cartStore'
import { useAuthStore } from '../store/authStore'
import { formatCurrency, discountPercent, getPrimaryImage } from '../utils/helpers'
import { usePageMeta } from '../hooks/useMeta'
import { useNavigate } from 'react-router-dom'

export default function WishlistPage() {
  usePageMeta({
    title: 'My Wishlist',
    description: 'Your saved products on ShopZen.',
  })

  const { items, remove, clear } = useWishlistStore()
  const { addToCart } = useCartStore()
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()

  const handleAddToCart = async (product) => {
    if (!isAuthenticated) { navigate('/login'); return }
    const success = await addToCart(product.id, 1)
    if (success) remove(product.id)
  }

  if (items.length === 0) {
    return (
      <div className="container-custom py-20 text-center animate-fade-in">
        <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-5" aria-hidden="true">
          <Heart size={32} className="text-red-300" />
        </div>
        <h1 className="font-display text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h1>
        <p className="text-gray-500 mb-8">Save products you love and come back to them anytime.</p>
        <Link to="/products" className="btn-primary flex items-center gap-2 inline-flex">
          Browse Products <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    )
  }

  return (
    <div className="container-custom py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <h1 className="section-title">
          My Wishlist
          <span className="ml-3 text-lg font-normal text-gray-400">({items.length})</span>
        </h1>
        <button
          onClick={clear}
          className="text-sm text-red-400 hover:text-red-600 font-medium transition-colors focus:outline-none focus:underline"
          aria-label="Clear all items from wishlist"
        >
          Clear all
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {items.map((product) => {
          const image = getPrimaryImage(product.images)
          const discount = discountPercent(product.price, product.compareAtPrice)
          const isOutOfStock = product.stockQuantity === 0

          return (
            <article key={product.id} className="card group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              {/* Image */}
              <div className="relative aspect-square overflow-hidden bg-gray-50">
                <Link to={`/products/${product.slug}`} tabIndex="-1" aria-hidden="true">
                  <img
                    src={image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </Link>

                {/* Badges */}
                {discount > 0 && (
                  <span className="absolute top-3 left-3 badge bg-green-500 text-white text-xs" aria-hidden="true">
                    {discount}% off
                  </span>
                )}
                {isOutOfStock && (
                  <span className="absolute top-3 left-3 badge bg-gray-800 text-white text-xs">
                    Out of Stock
                  </span>
                )}

                {/* Remove button */}
                <button
                  onClick={() => remove(product.id)}
                  aria-label={`Remove ${product.name} from wishlist`}
                  className="absolute top-3 right-3 w-8 h-8 bg-white rounded-lg shadow-sm flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
                >
                  <Trash2 size={14} aria-hidden="true" />
                </button>
              </div>

              {/* Info */}
              <div className="p-4">
                {product.category && (
                  <span className="text-xs font-medium text-primary-500 uppercase tracking-wide">
                    {product.category.name}
                  </span>
                )}
                <Link
                  to={`/products/${product.slug}`}
                  className="block font-semibold text-gray-900 mt-1 leading-tight line-clamp-2 hover:text-primary-600 transition-colors focus:outline-none focus:underline"
                >
                  {product.name}
                </Link>

                {/* Price */}
                <div className="flex items-center gap-2 mt-3 mb-4">
                  <span className="font-display font-bold text-gray-900 text-lg">
                    {formatCurrency(product.price)}
                  </span>
                  {product.compareAtPrice && product.compareAtPrice > product.price && (
                    <span className="text-sm text-gray-400 line-through">
                      {formatCurrency(product.compareAtPrice)}
                    </span>
                  )}
                </div>

                {/* Add to cart */}
                <button
                  onClick={() => handleAddToCart(product)}
                  disabled={isOutOfStock}
                  aria-label={isOutOfStock ? 'Out of stock' : `Move ${product.name} to cart`}
                  className="w-full btn-primary !py-2.5 !text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCart size={15} aria-hidden="true" />
                  {isOutOfStock ? 'Out of Stock' : 'Move to Cart'}
                </button>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
