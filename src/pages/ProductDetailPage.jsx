import { useState, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  ShoppingCart, Heart, Share2, Truck, Shield, Star,
  ChevronRight, Minus, Plus, CheckCircle, Copy, Check,
} from 'lucide-react'
import { productAPI, reviewAPI } from '../services/api'
import { useCartStore } from '../store/cartStore'
import { useAuthStore } from '../store/authStore'
import { formatCurrency, discountPercent, formatDate } from '../utils/helpers'
import ProductCard from '../components/product/ProductCard'
import StarRating from '../components/common/StarRating'
import { PageLoader } from '../components/common/Skeleton'
import { usePageMeta } from '../hooks/useMeta'
import toast from 'react-hot-toast'

// Inline SVG fallback — no external dependency
const FALLBACK_IMAGE = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='600' viewBox='0 0 600 600'%3E%3Crect width='600' height='600' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='system-ui' font-size='18' fill='%239ca3af'%3ENo Image%3C/text%3E%3C/svg%3E`

export default function ProductDetailPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCartStore()
  const { isAuthenticated } = useAuthStore()

  const [qty, setQty] = useState(1)
  const [activeTab, setActiveTab] = useState('description')
  const [selectedImage, setSelectedImage] = useState(0)
  const [imgErrors, setImgErrors] = useState({})
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [copied, setCopied] = useState(false)
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' })
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewError, setReviewError] = useState('')

  const { data: productData, isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => productAPI.getBySlug(slug),
  })

  const product = productData?.data?.data

  // Dynamic page title from product data
  usePageMeta({
    title: product?.name,
    description: product?.description
      ? product.description.slice(0, 155)
      : `Buy ${product?.name} at the best price on ShopZen.`,
  })

  const productId = product?.id

  const { data: relatedData } = useQuery({
    queryKey: ['related', productId],
    queryFn: () => productAPI.getRelated(productId),
    enabled: !!productId,
  })

  const { data: reviewsData, refetch: refetchReviews } = useQuery({
    queryKey: ['reviews', productId],
    queryFn: () => reviewAPI.getProductReviews(productId, { page: 0, size: 10 }),
    enabled: !!productId,
  })

  const related = relatedData?.data?.data || []
  const reviews = reviewsData?.data?.data?.content || []

  const handleAddToCart = useCallback(async () => {
    if (!isAuthenticated) { navigate('/login'); return }
    const success = await addToCart(product.id, qty)
    if (success) setQty(1)
  }, [isAuthenticated, navigate, addToCart, product?.id, qty])

  const handleShare = useCallback(async () => {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ title: product?.name, url })
      } catch {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success('Link copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    }
  }, [product?.name])

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    if (!isAuthenticated) { navigate('/login'); return }
    if (reviewForm.comment.trim().length < 10) {
      setReviewError('Review must be at least 10 characters.')
      return
    }
    setReviewError('')
    setSubmittingReview(true)
    try {
      const { data } = await reviewAPI.addReview(product.id, reviewForm)
      if (data.success) {
        toast.success('Review submitted!')
        setReviewForm({ rating: 5, title: '', comment: '' })
        refetchReviews()
      }
    } catch {
      // Error toast handled by API interceptor
    } finally {
      setSubmittingReview(false)
    }
  }

  if (isLoading) return <PageLoader />

  if (!product) return (
    <div className="container-custom py-20 text-center animate-fade-in">
      <p className="text-6xl mb-4 select-none" aria-hidden="true">😕</p>
      <h1 className="font-display text-2xl font-bold text-gray-900 mb-2">Product not found</h1>
      <p className="text-gray-500 mb-6">This product may have been removed or the link is incorrect.</p>
      <Link to="/products" className="btn-primary inline-block">Browse Products</Link>
    </div>
  )

  const discount = discountPercent(product.price, product.compareAtPrice)
  const images = product.images?.length > 0 ? product.images : [{ url: FALLBACK_IMAGE }]
  const isOutOfStock = product.stockQuantity === 0
  const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= 5

  const getImageSrc = (img, i) => imgErrors[i] ? FALLBACK_IMAGE : (img?.url || FALLBACK_IMAGE)

  return (
    <div className="container-custom py-8 animate-fade-in">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-gray-400 mb-8 flex-wrap">
        <Link to="/" className="hover:text-gray-600 transition-colors">Home</Link>
        <ChevronRight size={14} aria-hidden="true" />
        <Link to="/products" className="hover:text-gray-600 transition-colors">Products</Link>
        {product.category && (
          <>
            <ChevronRight size={14} aria-hidden="true" />
            <Link
              to={`/products?categoryId=${product.category.id}`}
              className="hover:text-gray-600 transition-colors"
            >
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight size={14} aria-hidden="true" />
        <span className="text-gray-600 truncate max-w-xs" aria-current="page">{product.name}</span>
      </nav>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Images */}
        <div>
          <div className="aspect-square rounded-2xl overflow-hidden bg-gray-50 mb-4">
            <img
              src={getImageSrc(images[selectedImage], selectedImage)}
              alt={`${product.name} — main image`}
              className="w-full h-full object-cover"
              onError={() => setImgErrors((prev) => ({ ...prev, [selectedImage]: true }))}
            />
          </div>
          {images.length > 1 && (
            <div
              className="flex gap-3 overflow-x-auto pb-2"
              role="list"
              aria-label="Product image thumbnails"
            >
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  aria-label={`View image ${i + 1}`}
                  aria-pressed={i === selectedImage}
                  role="listitem"
                  className={`shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400 ${
                    i === selectedImage ? 'border-primary-500' : 'border-gray-100 hover:border-gray-300'
                  }`}
                >
                  <img
                    src={getImageSrc(img, i)}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={() => setImgErrors((prev) => ({ ...prev, [i]: true }))}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          {product.brand && (
            <p className="text-sm font-medium text-primary-500 uppercase tracking-widest">{product.brand}</p>
          )}
          <h1 className="font-display text-3xl font-bold text-gray-900 mt-1 mb-4">{product.name}</h1>

          {/* Rating */}
          {product.reviewCount > 0 && (
            <div
              className="flex items-center gap-3 mb-5"
              aria-label={`Rated ${product.averageRating} out of 5 based on ${product.reviewCount} reviews`}
            >
              <StarRating rating={product.averageRating} aria-hidden="true" />
              <span className="text-sm font-semibold text-gray-900">{product.averageRating}</span>
              <button
                onClick={() => setActiveTab('reviews')}
                className="text-sm text-primary-600 hover:underline focus:outline-none focus:underline"
              >
                ({product.reviewCount} review{product.reviewCount !== 1 ? 's' : ''})
              </button>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-6" aria-label="Pricing">
            <span className="font-display text-4xl font-bold text-gray-900">{formatCurrency(product.price)}</span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <>
                <span className="text-xl text-gray-400 line-through" aria-label={`Original price ${formatCurrency(product.compareAtPrice)}`}>
                  {formatCurrency(product.compareAtPrice)}
                </span>
                <span className="badge bg-green-100 text-green-700 text-sm">{discount}% off</span>
              </>
            )}
          </div>

          {/* Stock */}
          <div className="flex items-center gap-2 mb-6" role="status" aria-live="polite">
            {!isOutOfStock ? (
              <>
                <CheckCircle size={16} className="text-green-500" aria-hidden="true" />
                <span className={`text-sm font-medium ${isLowStock ? 'text-orange-500' : 'text-green-600'}`}>
                  {isLowStock ? `Only ${product.stockQuantity} left!` : 'In Stock'}
                </span>
              </>
            ) : (
              <span className="badge bg-red-100 text-red-600">Out of Stock</span>
            )}
          </div>

          {/* Qty + Actions */}
          {!isOutOfStock && (
            <div className="flex items-center gap-4 mb-6">
              <div
                className="flex items-center border border-gray-200 rounded-xl"
                role="group"
                aria-label="Quantity selector"
              >
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  aria-label="Decrease quantity"
                  disabled={qty <= 1}
                  className="w-11 h-11 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors disabled:opacity-30 focus:outline-none"
                >
                  <Minus size={16} aria-hidden="true" />
                </button>
                <span className="w-12 text-center font-semibold text-gray-900" aria-live="polite" aria-label={`Quantity: ${qty}`}>
                  {qty}
                </span>
                <button
                  onClick={() => setQty(Math.min(product.stockQuantity, qty + 1))}
                  aria-label="Increase quantity"
                  disabled={qty >= product.stockQuantity}
                  className="w-11 h-11 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors disabled:opacity-30 focus:outline-none"
                >
                  <Plus size={16} aria-hidden="true" />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className="flex-1 btn-primary flex items-center justify-center gap-2"
                aria-label={`Add ${qty} ${qty === 1 ? 'item' : 'items'} to cart`}
              >
                <ShoppingCart size={18} aria-hidden="true" /> Add to Cart
              </button>

              <button
                onClick={() => setIsWishlisted((w) => !w)}
                aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                aria-pressed={isWishlisted}
                className={`w-11 h-11 flex items-center justify-center border rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400 ${
                  isWishlisted
                    ? 'border-red-300 text-red-500 bg-red-50'
                    : 'border-gray-200 text-gray-400 hover:text-red-400 hover:border-red-200'
                }`}
              >
                <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} aria-hidden="true" />
              </button>
            </div>
          )}

          {/* Features */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { icon: Truck, text: 'Free shipping over ₹500' },
              { icon: Shield, text: '100% secure checkout' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 bg-gray-50 rounded-xl p-3">
                <Icon size={15} className="text-primary-500 shrink-0" aria-hidden="true" />
                <span className="text-xs font-medium text-gray-600">{text}</span>
              </div>
            ))}
          </div>

          {/* Share */}
          <button
            onClick={handleShare}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors focus:outline-none focus:underline mb-5"
            aria-label="Share this product"
          >
            {copied ? <Check size={15} className="text-green-500" /> : <Share2 size={15} />}
            {copied ? 'Link copied!' : 'Share this product'}
          </button>

          {/* Specifications */}
          {product.attributes?.length > 0 && (
            <div className="border-t border-gray-100 pt-5">
              <h2 className="font-semibold text-gray-900 mb-3 text-sm">Specifications</h2>
              <dl className="space-y-2">
                {product.attributes.map((attr) => (
                  <div key={attr.id} className="flex justify-between text-sm">
                    <dt className="text-gray-500">{attr.name}</dt>
                    <dd className="font-medium text-gray-900">{attr.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-16">
        <div
          className="flex gap-1 border-b border-gray-100 mb-8"
          role="tablist"
          aria-label="Product details"
        >
          {[
            { id: 'description', label: 'Description' },
            { id: 'reviews', label: `Reviews (${product.reviewCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`panel-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 text-sm font-semibold capitalize transition-colors border-b-2 -mb-px focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-inset ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-400 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Description panel */}
        <div
          id="panel-description"
          role="tabpanel"
          aria-labelledby="tab-description"
          hidden={activeTab !== 'description'}
        >
          {activeTab === 'description' && (
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-600 leading-relaxed text-base whitespace-pre-line">{product.description}</p>
            </div>
          )}
        </div>

        {/* Reviews panel */}
        <div
          id="panel-reviews"
          role="tabpanel"
          aria-labelledby="tab-reviews"
          hidden={activeTab !== 'reviews'}
        >
          {activeTab === 'reviews' && (
            <div className="space-y-8">
              {/* Review list */}
              {reviews.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No reviews yet. Be the first to review!</p>
              ) : (
                <ul className="space-y-5">
                  {reviews.map((rev) => (
                    <li key={rev.id} className="card p-5">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <span className="font-semibold text-gray-900">{rev.userName}</span>
                          <div className="flex items-center gap-2 mt-1">
                            <StarRating rating={rev.rating} size={13} aria-label={`${rev.rating} stars`} />
                            <time className="text-xs text-gray-400" dateTime={rev.createdAt}>
                              {formatDate(rev.createdAt)}
                            </time>
                          </div>
                        </div>
                        {rev.verified && (
                          <span className="badge bg-green-50 text-green-600 text-xs gap-1">
                            <CheckCircle size={10} aria-hidden="true" /> Verified Purchase
                          </span>
                        )}
                      </div>
                      {rev.title && <h4 className="font-semibold text-gray-800 mt-2">{rev.title}</h4>}
                      <p className="text-sm text-gray-600 mt-1 leading-relaxed">{rev.comment}</p>
                    </li>
                  ))}
                </ul>
              )}

              {/* Review form */}
              {isAuthenticated ? (
                <div className="card p-6 mt-8">
                  <h3 className="font-display text-lg font-semibold mb-4">Write a Review</h3>
                  <form onSubmit={handleSubmitReview} className="space-y-4" noValidate>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block" id="rating-label">
                        Your Rating
                      </label>
                      <StarRating
                        rating={reviewForm.rating}
                        size={28}
                        interactive
                        aria-labelledby="rating-label"
                        onChange={(r) => setReviewForm((prev) => ({ ...prev, rating: r }))}
                      />
                    </div>
                    <div>
                      <label htmlFor="review-title" className="text-sm font-medium text-gray-700 mb-1.5 block">
                        Review Title
                      </label>
                      <input
                        id="review-title"
                        type="text"
                        placeholder="Summarize your experience"
                        value={reviewForm.title}
                        onChange={(e) => setReviewForm((prev) => ({ ...prev, title: e.target.value }))}
                        className="input-field"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="review-comment" className="text-sm font-medium text-gray-700 mb-1.5 block">
                        Your Review
                      </label>
                      <textarea
                        id="review-comment"
                        placeholder="Share your experience with this product..."
                        value={reviewForm.comment}
                        onChange={(e) => {
                          setReviewForm((prev) => ({ ...prev, comment: e.target.value }))
                          if (reviewError) setReviewError('')
                        }}
                        className={`input-field resize-none ${reviewError ? 'border-red-300 focus:ring-red-400' : ''}`}
                        rows={4}
                        required
                        minLength={10}
                        aria-describedby={reviewError ? 'review-error' : undefined}
                        aria-invalid={!!reviewError}
                      />
                      {reviewError && (
                        <p id="review-error" className="text-xs text-red-500 mt-1" role="alert">{reviewError}</p>
                      )}
                    </div>
                    <button type="submit" disabled={submittingReview} className="btn-primary">
                      {submittingReview ? 'Submitting…' : 'Submit Review'}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="card p-6 text-center">
                  <p className="text-gray-500 text-sm mb-3">Sign in to leave a review</p>
                  <Link to="/login" className="btn-primary !text-sm !py-2 !px-6 inline-block">Sign In</Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="mt-20" aria-labelledby="related-heading">
          <h2 id="related-heading" className="section-title mb-8">You May Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {related.slice(0, 4).map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  )
}
