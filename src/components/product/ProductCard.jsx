import { memo, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Star, Heart } from 'lucide-react'
import { useCartStore } from '../../store/cartStore'
import { useAuthStore } from '../../store/authStore'
import { useWishlistStore } from '../../store/wishlistStore'
import { formatCurrency, discountPercent, getPrimaryImage } from '../../utils/helpers'

const FALLBACK_IMAGE = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='system-ui' font-size='14' fill='%239ca3af'%3ENo Image%3C/text%3E%3C/svg%3E`

const ProductCard = memo(function ProductCard({ product }) {
  const navigate = useNavigate()
  const { addToCart } = useCartStore()
  const { isAuthenticated } = useAuthStore()
  const { toggle, isWishlisted } = useWishlistStore()
  const [imgError, setImgError] = useState(false)
  const wishlisted = isWishlisted(product.id)
  const discount = discountPercent(product.price, product.compareAtPrice)
  const image = imgError ? FALLBACK_IMAGE : (getPrimaryImage(product.images) || FALLBACK_IMAGE)
  const isOutOfStock = product.stockQuantity === 0
  const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= 5

  const handleAddToCart = useCallback(async (e) => {
    e.preventDefault(); e.stopPropagation()
    if (!isAuthenticated) { navigate('/login'); return }
    await addToCart(product.id, 1)
  }, [isAuthenticated, navigate, addToCart, product.id])

  const handleWishlist = useCallback((e) => {
    e.preventDefault(); e.stopPropagation()
    toggle(product)
  }, [toggle, product])

  return (
    <Link to={`/products/${product.slug}`}
      className="group card hover:shadow-lg transition-all duration-300 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2"
      aria-label={`${product.name}${isOutOfStock ? ' — Out of stock' : ''}`}>
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <img src={image} alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy" onError={() => setImgError(true)} />
        <div className="absolute top-3 left-3 flex flex-col gap-1.5" aria-hidden="true">
          {product.featured && <span className="badge bg-primary-500 text-white text-xs">Featured</span>}
          {discount > 0 && <span className="badge bg-green-500 text-white text-xs">{discount}% off</span>}
          {isOutOfStock && <span className="badge bg-gray-800 text-white text-xs">Out of Stock</span>}
        </div>
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button onClick={handleWishlist} aria-pressed={wishlisted}
            aria-label={wishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
            className={`w-8 h-8 bg-white rounded-lg shadow-sm flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400 ${wishlisted ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}>
            <Heart size={15} fill={wishlisted ? 'currentColor' : 'none'} aria-hidden="true" />
          </button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button onClick={handleAddToCart} disabled={isOutOfStock}
            aria-label={isOutOfStock ? 'Out of stock' : `Add ${product.name} to cart`}
            className="w-full btn-primary !py-2.5 !text-sm flex items-center justify-center gap-2 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed">
            <ShoppingCart size={16} aria-hidden="true" />
            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
      <div className="p-4">
        {product.category && <span className="text-xs font-medium text-primary-500 uppercase tracking-wide">{product.category.name}</span>}
        <h3 className="font-semibold text-gray-900 mt-1 leading-tight line-clamp-2 group-hover:text-primary-600 transition-colors">{product.name}</h3>
        {product.reviewCount > 0 && (
          <div className="flex items-center gap-1.5 mt-2" aria-label={`${product.averageRating} out of 5, ${product.reviewCount} reviews`}>
            <div className="flex" aria-hidden="true">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={12} className={i < Math.floor(product.averageRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'} />
              ))}
            </div>
            <span className="text-xs text-gray-500" aria-hidden="true">({product.reviewCount})</span>
          </div>
        )}
        <div className="flex items-center gap-2 mt-3">
          <span className="font-display font-bold text-gray-900 text-lg">{formatCurrency(product.price)}</span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="text-sm text-gray-400 line-through" aria-label={`Original price ${formatCurrency(product.compareAtPrice)}`}>{formatCurrency(product.compareAtPrice)}</span>
          )}
        </div>
        {isLowStock && <p className="text-xs text-orange-500 font-medium mt-1.5" role="status">Only {product.stockQuantity} left!</p>}
      </div>
    </Link>
  )
})

export default ProductCard
