import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Package, ChevronDown } from 'lucide-react'
import { orderAPI } from '../services/api'
import { formatCurrency, formatDate, ORDER_STATUS, PAYMENT_STATUS } from '../utils/helpers'
import { PageLoader } from '../components/common/Skeleton'
import { usePageMeta } from '../hooks/useMeta'

const FALLBACK_IMAGE = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Crect width='60' height='60' fill='%23f3f4f6'/%3E%3C/svg%3E`

export default function OrdersPage() {
  usePageMeta({ title: 'My Orders', description: 'View and track all your ShopZen orders.' })

  const [page, setPage] = useState(0)
  const [expanded, setExpanded] = useState(null)
  const [imgErrors, setImgErrors] = useState({})

  const { data, isLoading } = useQuery({
    queryKey: ['orders', page],
    queryFn: () => orderAPI.getAll({ page, size: 10 }),
    keepPreviousData: true,
  })

  const orders = data?.data?.data?.content || []
  const totalPages = data?.data?.data?.totalPages || 0

  if (isLoading) return <PageLoader />

  return (
    <div className="container-custom py-8 animate-fade-in">
      <h1 className="section-title mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20" role="status">
          <Package size={64} className="mx-auto text-gray-200 mb-4" aria-hidden="true" />
          <h2 className="font-display text-xl font-bold text-gray-900 mb-2">No orders yet</h2>
          <p className="text-gray-500 mb-8">You haven't placed any orders. Start shopping!</p>
          <Link to="/products" className="btn-primary">Shop Now</Link>
        </div>
      ) : (
        <>
          <div className="space-y-4" role="list" aria-label="Your orders">
            {orders.map((order) => {
              const status = ORDER_STATUS[order.status] || {}
              const payStatus = PAYMENT_STATUS[order.paymentStatus] || {}
              const isOpen = expanded === order.id

              return (
                <article key={order.id} className="card overflow-hidden" role="listitem">
                  {/* Order Header */}
                  <button
                    onClick={() => setExpanded(isOpen ? null : order.id)}
                    aria-expanded={isOpen}
                    aria-controls={`order-details-${order.id}`}
                    className="w-full p-5 flex items-center justify-between hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-400"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-left">
                      <div>
                        <span className="font-semibold text-gray-900 text-sm">{order.orderNumber}</span>
                        <time
                          className="text-xs text-gray-400 ml-3"
                          dateTime={order.createdAt}
                        >
                          {formatDate(order.createdAt)}
                        </time>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`badge ${status.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${status.dot} mr-1.5`} aria-hidden="true" />
                          {status.label}
                        </span>
                        <span className={`text-xs font-semibold ${payStatus.color}`} aria-label={`Payment: ${payStatus.label}`}>
                          {payStatus.label}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <span className="font-bold text-gray-900">{formatCurrency(order.totalAmount)}</span>
                      <ChevronDown
                        size={16}
                        className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                        aria-hidden="true"
                      />
                    </div>
                  </button>

                  {/* Order Details */}
                  {isOpen && (
                    <div
                      id={`order-details-${order.id}`}
                      className="border-t border-gray-50 p-5 animate-slide-up"
                    >
                      {/* Items */}
                      <ul className="space-y-3 mb-5" aria-label="Order items">
                        {order.items?.map((item) => (
                          <li key={item.id} className="flex items-center gap-4">
                            <img
                              src={imgErrors[item.id] ? FALLBACK_IMAGE : (item.productImage || FALLBACK_IMAGE)}
                              alt={item.productName}
                              className="w-14 h-14 object-cover rounded-xl bg-gray-100 shrink-0"
                              onError={() => setImgErrors((p) => ({ ...p, [item.id]: true }))}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 text-sm">{item.productName}</p>
                              <p className="text-xs text-gray-400">
                                Qty: {item.quantity} × {formatCurrency(item.unitPrice)}
                              </p>
                            </div>
                            <span className="font-semibold text-sm shrink-0">{formatCurrency(item.totalPrice)}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Price breakdown */}
                      <div className="bg-gray-50 rounded-xl p-4 mb-4">
                        <dl className="space-y-2 text-sm">
                          <div className="flex justify-between text-gray-600">
                            <dt>Subtotal</dt><dd>{formatCurrency(order.subtotal)}</dd>
                          </div>
                          <div className="flex justify-between text-gray-600">
                            <dt>Shipping</dt>
                            <dd>{order.shippingCost === 0 ? 'FREE' : formatCurrency(order.shippingCost)}</dd>
                          </div>
                          <div className="flex justify-between text-gray-600">
                            <dt>Tax (GST)</dt><dd>{formatCurrency(order.taxAmount)}</dd>
                          </div>
                          {order.discountAmount > 0 && (
                            <div className="flex justify-between text-green-600">
                              <dt>Discount {order.couponCode && `(${order.couponCode})`}</dt>
                              <dd>−{formatCurrency(order.discountAmount)}</dd>
                            </div>
                          )}
                          <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-200">
                            <dt>Total</dt><dd>{formatCurrency(order.totalAmount)}</dd>
                          </div>
                        </dl>
                      </div>

                      {/* Shipping address */}
                      {order.shippingAddress && (
                        <div className="mb-3">
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Shipped To</p>
                          <address className="not-italic text-sm text-gray-700">
                            {order.shippingAddress.fullName} · {order.shippingAddress.addressLine1},
                            {' '}{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                          </address>
                        </div>
                      )}

                      {/* Tracking */}
                      {order.trackingNumber && (
                        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-sm font-medium px-3 py-2 rounded-lg">
                          <Package size={14} aria-hidden="true" />
                          <span>Tracking: <strong>{order.trackingNumber}</strong></span>
                        </div>
                      )}
                    </div>
                  )}
                </article>
              )
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <nav className="flex justify-center gap-2 mt-6" aria-label="Order pages">
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
                aria-label="Previous page"
                className="btn-secondary !py-2 !px-4 !text-sm disabled:opacity-40"
              >
                Previous
              </button>
              <span className="self-center text-sm text-gray-500" aria-live="polite">
                Page {page + 1} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
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
  )
}
