import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { MapPin, CreditCard, Tag, CheckCircle, Plus, Truck } from 'lucide-react'
import { useCartStore } from '../store/cartStore'
import { useAuthStore } from '../store/authStore'
import { orderAPI, addressAPI } from '../services/api'
import { useRazorpay } from '../hooks/useRazorpay'
import { formatCurrency } from '../utils/helpers'
import { usePageMeta } from '../hooks/useMeta'
import toast from 'react-hot-toast'

const FALLBACK_IMAGE = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Crect width='60' height='60' fill='%23f3f4f6'/%3E%3C/svg%3E`

const STEPS = [
  { id: 1, label: 'Address', icon: MapPin },
  { id: 2, label: 'Payment', icon: CreditCard },
  { id: 3, label: 'Review', icon: CheckCircle },
]

export default function CheckoutPage() {
  usePageMeta({ title: 'Checkout' })

  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { cart, fetchCart } = useCartStore()
  const { openRazorpay } = useRazorpay()

  const [step, setStep] = useState(1)
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('COD')
  const [couponCode, setCouponCode] = useState('')
  const [couponData, setCouponData] = useState(null)
  const [couponLoading, setCouponLoading] = useState(false)
  const [placing, setPlacing] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [imgErrors, setImgErrors] = useState({})
  const [addrErrors, setAddrErrors] = useState({})

  const [newAddr, setNewAddr] = useState({
    fullName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '',
    phone: user?.phone || '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    defaultAddress: false,
  })

  const { data: addrData, refetch: refetchAddr } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => addressAPI.getAll(),
  })
  const addresses = addrData?.data?.data || []

  useEffect(() => { fetchCart() }, [fetchCart])

  useEffect(() => {
    if (addresses.length > 0 && !selectedAddress) {
      const def = addresses.find((a) => a.defaultAddress) || addresses[0]
      setSelectedAddress(def.id)
    }
  }, [addresses, selectedAddress])

  if (!cart || cart.items?.length === 0) {
    navigate('/cart')
    return null
  }

  const shipping = cart.totalPrice >= 500 ? 0 : 50
  const tax = cart.totalPrice * 0.18
  const discount = couponData?.discountAmount || 0
  const total = cart.totalPrice + shipping + tax - discount

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) { toast.error('Enter a coupon code'); return }
    setCouponLoading(true)
    try {
      const { data } = await orderAPI.validateCoupon({ code: couponCode.trim(), orderAmount: cart.totalPrice })
      if (data.data.valid) {
        setCouponData(data.data)
        toast.success(data.data.message)
      } else {
        toast.error(data.data.message)
        setCouponData(null)
      }
    } catch {
      setCouponData(null)
    } finally {
      setCouponLoading(false)
    }
  }

  const validateNewAddress = () => {
    const errors = {}
    if (!newAddr.fullName.trim()) errors.fullName = 'Required'
    if (!newAddr.phone.trim()) errors.phone = 'Required'
    if (!/^\d{10}$/.test(newAddr.phone.replace(/\s/g, ''))) errors.phone = 'Enter a valid 10-digit number'
    if (!newAddr.addressLine1.trim()) errors.addressLine1 = 'Required'
    if (!newAddr.city.trim()) errors.city = 'Required'
    if (!newAddr.state.trim()) errors.state = 'Required'
    if (!newAddr.postalCode.trim()) errors.postalCode = 'Required'
    if (!/^\d{6}$/.test(newAddr.postalCode.trim())) errors.postalCode = 'Enter a valid 6-digit PIN code'
    return errors
  }

  const handleSaveAddress = async (e) => {
    e.preventDefault()
    const errors = validateNewAddress()
    if (Object.keys(errors).length > 0) { setAddrErrors(errors); return }
    setAddrErrors({})
    try {
      await addressAPI.create(newAddr)
      toast.success('Address saved!')
      refetchAddr()
      setShowForm(false)
    } catch {
      // Error toast handled by API interceptor
    }
  }

  const updateAddr = useCallback((field) => (e) => {
    setNewAddr((p) => ({ ...p, [field]: e.target.value }))
    if (addrErrors[field]) setAddrErrors((p) => ({ ...p, [field]: '' }))
  }, [addrErrors])

  const placeOrderCOD = async () => {
    setPlacing(true)
    try {
      await orderAPI.place({ addressId: selectedAddress, paymentMethod: 'COD', couponCode: couponData?.code })
      toast.success('Order placed! 🎉')
      navigate('/orders')
    } catch {
      // Error toast handled by API interceptor
    } finally {
      setPlacing(false)
    }
  }

  const placeOrderOnline = async () => {
    setPlacing(true)
    try {
      const { data: orderResp } = await orderAPI.place({
        addressId: selectedAddress,
        paymentMethod: 'ONLINE',
        couponCode: couponData?.code,
      })
      const created = orderResp.data
      await openRazorpay({
        amount: total,
        orderId: created.id,
        receiptId: created.orderNumber,
        user,
        onSuccess: () => navigate('/orders'),
        onFailure: () => setPlacing(false),
      })
    } catch {
      setPlacing(false)
    }
  }

  const handlePlaceOrder = () => {
    if (!selectedAddress) { toast.error('Please select a delivery address'); return }
    paymentMethod === 'COD' ? placeOrderCOD() : placeOrderOnline()
  }

  return (
    <div className="container-custom py-8 animate-fade-in max-w-5xl">
      <h1 className="section-title mb-8">Checkout</h1>

      {/* Step indicator */}
      <nav aria-label="Checkout steps" className="flex items-center gap-0 mb-10">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center flex-1 last:flex-none">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  step > i + 1
                    ? 'bg-green-500 text-white'
                    : step === i + 1
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-400'
                }`}
                aria-current={step === i + 1 ? 'step' : undefined}
              >
                {step > i + 1 ? <CheckCircle size={16} aria-hidden="true" /> : i + 1}
              </div>
              <span className={`text-sm font-medium hidden sm:block ${step === i + 1 ? 'text-gray-900' : 'text-gray-400'}`}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-3 transition-colors ${step > i + 1 ? 'bg-green-400' : 'bg-gray-200'}`} aria-hidden="true" />
            )}
          </div>
        ))}
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">

          {/* Step 1: Address */}
          <section className={`card overflow-hidden ${step !== 1 ? 'opacity-60' : ''}`} aria-label="Delivery address">
            <div
              className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => step > 1 && setStep(1)}
              role={step > 1 ? 'button' : undefined}
              tabIndex={step > 1 ? 0 : undefined}
              onKeyDown={step > 1 ? (e) => e.key === 'Enter' && setStep(1) : undefined}
              aria-label={step > 1 ? 'Edit delivery address' : undefined}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center" aria-hidden="true">
                  <MapPin size={18} />
                </div>
                <h2 className="font-display font-semibold">Delivery Address</h2>
              </div>
              {step !== 1 && selectedAddress && (
                <span className="text-sm text-primary-600 font-medium">Change</span>
              )}
            </div>

            {step === 1 && (
              <div className="px-5 pb-5">
                {addresses.length === 0 && !showForm && (
                  <p className="text-sm text-gray-500 mb-4">No saved addresses. Add one below.</p>
                )}
                <fieldset>
                  <legend className="sr-only">Choose delivery address</legend>
                  <div className="space-y-3 mb-4">
                    {addresses.map((addr) => (
                      <label
                        key={addr.id}
                        className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                          selectedAddress === addr.id ? 'border-primary-400 bg-primary-50' : 'border-gray-100 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="delivery-address"
                          checked={selectedAddress === addr.id}
                          onChange={() => setSelectedAddress(addr.id)}
                          className="mt-1 accent-primary-500"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">{addr.fullName}</span>
                            {addr.defaultAddress && (
                              <span className="badge bg-primary-100 text-primary-600 text-xs">Default</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">{addr.phone}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            {addr.addressLine1}, {addr.city}, {addr.state} — {addr.postalCode}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </fieldset>

                {showForm ? (
                  <form onSubmit={handleSaveAddress} className="space-y-3 bg-gray-50 p-4 rounded-xl" noValidate>
                    <h3 className="font-semibold text-sm text-gray-900">New Address</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: 'fullName', label: 'Full Name', type: 'text', placeholder: 'Full Name' },
                        { id: 'phone', label: 'Phone Number', type: 'tel', placeholder: '10-digit mobile' },
                      ].map(({ id, label, type, placeholder }) => (
                        <div key={id}>
                          <label htmlFor={`addr-new-${id}`} className="sr-only">{label}</label>
                          <input
                            id={`addr-new-${id}`}
                            type={type}
                            className={`input-field !text-sm ${addrErrors[id] ? 'border-red-300' : ''}`}
                            placeholder={placeholder}
                            value={newAddr[id]}
                            onChange={updateAddr(id)}
                          />
                          {addrErrors[id] && <p className="text-xs text-red-500 mt-0.5">{addrErrors[id]}</p>}
                        </div>
                      ))}
                    </div>
                    <div>
                      <label htmlFor="addr-new-line1" className="sr-only">Address Line 1</label>
                      <input
                        id="addr-new-line1"
                        className={`input-field !text-sm ${addrErrors.addressLine1 ? 'border-red-300' : ''}`}
                        placeholder="Address Line 1"
                        value={newAddr.addressLine1}
                        onChange={updateAddr('addressLine1')}
                      />
                      {addrErrors.addressLine1 && <p className="text-xs text-red-500 mt-0.5">{addrErrors.addressLine1}</p>}
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: 'city', label: 'City', placeholder: 'City' },
                        { id: 'state', label: 'State', placeholder: 'State' },
                        { id: 'postalCode', label: 'PIN Code', placeholder: 'PIN Code' },
                      ].map(({ id, label, placeholder }) => (
                        <div key={id}>
                          <label htmlFor={`addr-new-${id}`} className="sr-only">{label}</label>
                          <input
                            id={`addr-new-${id}`}
                            className={`input-field !text-sm ${addrErrors[id] ? 'border-red-300' : ''}`}
                            placeholder={placeholder}
                            value={newAddr[id]}
                            onChange={updateAddr(id)}
                          />
                          {addrErrors[id] && <p className="text-xs text-red-500 mt-0.5">{addrErrors[id]}</p>}
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button type="submit" className="btn-primary !py-2 !px-5 !text-sm">Save Address</button>
                      <button type="button" onClick={() => { setShowForm(false); setAddrErrors({}) }} className="btn-secondary !py-2 !px-5 !text-sm">Cancel</button>
                    </div>
                  </form>
                ) : (
                  <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 text-sm text-primary-600 font-medium hover:underline focus:outline-none focus:underline"
                  >
                    <Plus size={16} aria-hidden="true" /> Add New Address
                  </button>
                )}

                {addresses.length > 0 && (
                  <button
                    onClick={() => setStep(2)}
                    disabled={!selectedAddress}
                    className="btn-primary mt-5 w-full !text-sm disabled:opacity-40"
                  >
                    Continue to Payment
                  </button>
                )}
              </div>
            )}
          </section>

          {/* Step 2: Payment */}
          <section className={`card overflow-hidden ${step !== 2 ? 'opacity-60' : ''}`} aria-label="Payment method">
            <div
              className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => step > 2 && setStep(2)}
              role={step > 2 ? 'button' : undefined}
              tabIndex={step > 2 ? 0 : undefined}
              onKeyDown={step > 2 ? (e) => e.key === 'Enter' && setStep(2) : undefined}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center" aria-hidden="true">
                  <CreditCard size={18} />
                </div>
                <h2 className="font-display font-semibold">Payment Method</h2>
              </div>
              {step > 2 && <span className="text-sm text-primary-600 font-medium">Change</span>}
            </div>

            {step === 2 && (
              <div className="px-5 pb-5 space-y-3">
                <fieldset>
                  <legend className="sr-only">Choose payment method</legend>
                  {[
                    { value: 'COD', label: 'Cash on Delivery', desc: 'Pay when your order arrives', icon: '💵' },
                    { value: 'UPI', label: 'UPI / Cards / Netbanking', desc: 'Razorpay secure checkout', icon: '🔒' },
                  ].map((m) => (
                    <label
                      key={m.value}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors mb-3 last:mb-0 ${
                        paymentMethod === m.value ? 'border-primary-400 bg-primary-50' : 'border-gray-100 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment-method"
                        value={m.value}
                        checked={paymentMethod === m.value}
                        onChange={() => setPaymentMethod(m.value)}
                        className="accent-primary-500"
                      />
                      <span className="text-2xl" aria-hidden="true">{m.icon}</span>
                      <div>
                        <p className="font-semibold text-sm">{m.label}</p>
                        <p className="text-xs text-gray-400">{m.desc}</p>
                      </div>
                    </label>
                  ))}
                </fieldset>

                {/* Coupon */}
                <div className="border-t border-gray-100 pt-4">
                  <p className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <Tag size={14} className="text-primary-500" aria-hidden="true" /> Apply Coupon
                  </p>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label htmlFor="coupon-input" className="sr-only">Coupon code</label>
                      <input
                        id="coupon-input"
                        type="text"
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                        className="input-field !text-sm"
                        aria-describedby={couponData?.valid ? 'coupon-success' : undefined}
                      />
                    </div>
                    <button
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !couponCode.trim()}
                      className="btn-outline !py-2 !px-4 !text-sm disabled:opacity-40"
                    >
                      {couponLoading ? '…' : 'Apply'}
                    </button>
                  </div>
                  {couponData?.valid && (
                    <p id="coupon-success" className="text-green-600 text-xs font-medium mt-2" role="status">
                      ✓ {couponData.message}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">Try: WELCOME10 · FLAT200 · SAVE20</p>
                </div>

                <button onClick={() => setStep(3)} className="btn-primary w-full !text-sm mt-2">
                  Review Order
                </button>
              </div>
            )}
          </section>

          {/* Step 3: Review & Place */}
          {step === 3 && (
            <section className="card p-5 animate-slide-up" aria-label="Review and place order">
              <h2 className="font-display font-semibold mb-4">Review & Place Order</h2>
              <ul className="space-y-3 mb-5" aria-label="Order items">
                {cart.items.map((item) => (
                  <li key={item.id} className="flex items-center gap-3">
                    <img
                      src={imgErrors[item.id] ? FALLBACK_IMAGE : (item.productImage || FALLBACK_IMAGE)}
                      alt=""
                      className="w-12 h-12 rounded-lg object-cover bg-gray-100 shrink-0"
                      onError={() => setImgErrors((p) => ({ ...p, [item.id]: true }))}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.productName}</p>
                      <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-sm font-semibold shrink-0">{formatCurrency(item.subtotal)}</span>
                  </li>
                ))}
              </ul>

              {paymentMethod !== 'COD' && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-4 text-xs text-blue-700" role="note">
                  🔒 You'll be redirected to Razorpay's secure payment page to complete payment.
                </div>
              )}

              <button
                onClick={handlePlaceOrder}
                disabled={placing}
                className="w-full btn-primary !text-base !py-4 flex items-center justify-center gap-2"
                aria-busy={placing}
              >
                {placing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                    <span>Processing…</span>
                  </>
                ) : (
                  paymentMethod === 'COD'
                    ? `Place Order · ${formatCurrency(total)}`
                    : `Pay Now · ${formatCurrency(total)}`
                )}
              </button>
              <p className="text-xs text-gray-400 text-center mt-3">
                By placing your order you agree to our{' '}
                <a href="/terms" className="underline hover:text-gray-600">Terms of Service</a>.
              </p>
            </section>
          )}
        </div>

        {/* Order Summary sidebar */}
        <aside aria-label="Order summary">
          <div className="card p-5 sticky top-24">
            <h3 className="font-display font-semibold mb-4">Order Summary</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <dt>Items ({cart.totalItems})</dt>
                <dd>{formatCurrency(cart.totalPrice)}</dd>
              </div>
              <div className="flex justify-between text-gray-600">
                <dt className="flex items-center gap-1"><Truck size={12} aria-hidden="true" /> Shipping</dt>
                <dd className={shipping === 0 ? 'text-green-600 font-medium' : ''}>{shipping === 0 ? 'FREE' : formatCurrency(shipping)}</dd>
              </div>
              <div className="flex justify-between text-gray-600">
                <dt>Tax (18% GST)</dt>
                <dd>{formatCurrency(tax)}</dd>
              </div>
              {couponData?.valid && (
                <div className="flex justify-between text-green-600 font-medium">
                  <dt>Discount ({couponData.code})</dt>
                  <dd>−{formatCurrency(discount)}</dd>
                </div>
              )}
              <div className="border-t border-gray-100 pt-3 mt-2 flex justify-between font-bold">
                <dt>Total</dt>
                <dd className="text-lg">{formatCurrency(total)}</dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </div>
  )
}
