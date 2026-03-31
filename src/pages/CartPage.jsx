import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react'
import { useCartStore } from '../store/cartStore'
import { useAuthStore } from '../store/authStore'
import { formatCurrency } from '../utils/helpers'
import { PageLoader } from '../components/common/Skeleton'
import { usePageMeta } from '../hooks/useMeta'
import ConfirmDialog from '../components/common/ConfirmDialog'

const FALLBACK_IMAGE = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='system-ui' font-size='10' fill='%239ca3af'%3ENo Image%3C/text%3E%3C/svg%3E`

export default function CartPage() {
  usePageMeta({ title: 'Your Cart', description: 'Review and manage your shopping cart.' })

  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const { cart, loading, fetchCart, updateItem, removeItem } = useCartStore()
  const [removeDialog, setRemoveDialog] = useState(null) // { itemId, name }
  const [imgErrors, setImgErrors] = useState({})

  useEffect(() => {
    if (isAuthenticated) fetchCart()
  }, [isAuthenticated, fetchCart])

  if (!isAuthenticated) return (
    <div className="container-custom py-20 text-center animate-fade-in">
      <ShoppingBag size={64} className="mx-auto text-gray-200 mb-4" aria-hidden="true" />
      <h1 className="font-display text-2xl font-bold text-gray-900 mb-2">Your cart awaits</h1>
      <p className="text-gray-500 mb-8">Sign in to view and manage your cart</p>
      <Link to="/login" className="btn-primary">Sign In</Link>
    </div>
  )

  if (loading) return <PageLoader />

  if (!cart || cart.items?.length === 0) return (
    <div className="container-custom py-20 text-center animate-fade-in">
      <ShoppingBag size={64} className="mx-auto text-gray-200 mb-4" aria-hidden="true" />
      <h1 className="font-display text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
      <p className="text-gray-500 mb-8">Looks like you haven't added anything yet</p>
      <Link to="/products" className="btn-primary">Start Shopping</Link>
    </div>
  )

  const shipping = cart.totalPrice >= 500 ? 0 : 50
  const tax = cart.totalPrice * 0.18
  const total = cart.totalPrice + shipping + tax

  const handleRemoveConfirm = (itemId, name) => {
    setRemoveDialog({ itemId, name })
  }

  const handleRemoveConfirmed = () => {
    if (removeDialog?.itemId) removeItem(removeDialog.itemId)
    setRemoveDialog(null)
  }

  return (
    <div className="container-custom py-8 animate-fade-in">
      <h1 className="section-title mb-8">
        Shopping Cart
        <span className="ml-3 text-lg font-normal text-gray-400">({cart.totalItems} item{cart.totalItems !== 1 ? 's' : ''})</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <section className="lg:col-span-2 space-y-4" aria-label="Cart items">
          {cart.items.map((item) => (
            <article key={item.id} className="card p-5 flex gap-5">
              <Link
                to={`/products/${item.productSlug}`}
                className="shrink-0 focus:outline-none focus:ring-2 focus:ring-primary-400 rounded-xl"
                aria-label={`View ${item.productName}`}
              >
                <img
                  src={imgErrors[item.id] ? FALLBACK_IMAGE : (item.productImage || FALLBACK_IMAGE)}
                  alt={item.productName}
                  className="w-24 h-24 object-cover rounded-xl bg-gray-100"
                  onError={() => setImgErrors((prev) => ({ ...prev, [item.id]: true }))}
                />
              </Link>

              <div className="flex-1 min-w-0">
                <Link
                  to={`/products/${item.productSlug}`}
                  className="font-semibold text-gray-900 hover:text-primary-600 transition-colors line-clamp-2 focus:outline-none focus:underline"
                >
                  {item.productName}
                </Link>
                <p className="text-primary-600 font-bold mt-1">{formatCurrency(item.price)}</p>
                {item.stockQuantity <= 5 && item.stockQuantity > 0 && (
                  <p className="text-xs text-orange-500 font-medium mt-1" role="status">
                    Only {item.stockQuantity} left
                  </p>
                )}

                <div className="flex items-center justify-between mt-3">
                  {/* Quantity control */}
                  <div
                    className="flex items-center border border-gray-200 rounded-xl"
                    role="group"
                    aria-label={`Quantity for ${item.productName}`}
                  >
                    <button
                      onClick={() => {
                        if (item.quantity - 1 === 0) {
                          handleRemoveConfirm(item.id, item.productName)
                        } else {
                          updateItem(item.id, item.quantity - 1)
                        }
                      }}
                      aria-label="Decrease quantity"
                      className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors focus:outline-none"
                    >
                      <Minus size={14} aria-hidden="true" />
                    </button>
                    <span
                      className="w-10 text-center text-sm font-semibold"
                      aria-live="polite"
                      aria-label={`Quantity: ${item.quantity}`}
                    >
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateItem(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.stockQuantity}
                      aria-label="Increase quantity"
                      className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors disabled:opacity-30 focus:outline-none"
                    >
                      <Plus size={14} aria-hidden="true" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-900">{formatCurrency(item.subtotal)}</span>
                    <button
                      onClick={() => handleRemoveConfirm(item.id, item.productName)}
                      aria-label={`Remove ${item.productName} from cart`}
                      className="text-gray-300 hover:text-red-400 transition-colors focus:outline-none focus:text-red-400"
                    >
                      <Trash2 size={16} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </section>

        {/* Order Summary */}
        <aside>
          <div className="card p-6 sticky top-24">
            <h2 className="font-display font-bold text-gray-900 text-lg mb-5">Order Summary</h2>

            <dl className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <dt>Subtotal ({cart.totalItems} item{cart.totalItems !== 1 ? 's' : ''})</dt>
                <dd>{formatCurrency(cart.totalPrice)}</dd>
              </div>
              <div className="flex justify-between text-gray-600">
                <dt>Shipping</dt>
                <dd className={shipping === 0 ? 'text-green-600 font-medium' : ''}>
                  {shipping === 0 ? 'FREE' : formatCurrency(shipping)}
                </dd>
              </div>
              <div className="flex justify-between text-gray-600">
                <dt>Tax (18% GST)</dt>
                <dd>{formatCurrency(tax)}</dd>
              </div>
            </dl>

            {shipping > 0 && (
              <p className="bg-orange-50 text-orange-600 text-xs font-medium p-3 rounded-xl mt-4" role="note">
                Add {formatCurrency(500 - cart.totalPrice)} more for free shipping!
              </p>
            )}

            <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between font-bold text-gray-900">
              <span>Total</span>
              <span className="text-lg">{formatCurrency(total)}</span>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full btn-primary mt-5 flex items-center justify-center gap-2"
            >
              Proceed to Checkout <ArrowRight size={17} aria-hidden="true" />
            </button>

            <Link
              to="/products"
              className="block text-center text-sm text-primary-600 font-medium mt-4 hover:underline focus:outline-none focus:underline"
            >
              Continue Shopping
            </Link>
          </div>
        </aside>
      </div>

      {/* Remove item confirm dialog */}
      <ConfirmDialog
        open={!!removeDialog}
        title="Remove Item"
        message={`Remove "${removeDialog?.name}" from your cart?`}
        confirmLabel="Remove"
        variant="danger"
        onConfirm={handleRemoveConfirmed}
        onCancel={() => setRemoveDialog(null)}
      />
    </div>
  )
}
