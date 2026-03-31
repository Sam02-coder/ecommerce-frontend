import { useCallback, useRef } from 'react'
import { paymentAPI } from '../services/api'
import toast from 'react-hot-toast'

/**
 * useRazorpay
 *
 * Dynamically loads Razorpay checkout.js (cached — only loads once per session),
 * opens the payment modal, and verifies the signature server-side.
 *
 * Security note:
 *  NEVER trust the frontend result of a Razorpay payment.
 *  Always call /payment/verify on your backend which validates the HMAC signature.
 *  The handler below does exactly this before calling onSuccess.
 *
 * Usage:
 *   const { openRazorpay } = useRazorpay()
 *   await openRazorpay({ amount, orderId, user, onSuccess, onFailure })
 */
export function useRazorpay() {
  // Track whether script is already loading to avoid duplicate injections
  const scriptPromiseRef = useRef(null)

  const loadScript = useCallback(() => {
    // Already loaded
    if (window.Razorpay) return Promise.resolve(true)

    // Already loading — return the same promise
    if (scriptPromiseRef.current) return scriptPromiseRef.current

    scriptPromiseRef.current = new Promise((resolve) => {
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.async = true
      script.onload  = () => resolve(true)
      script.onerror = () => {
        scriptPromiseRef.current = null // Allow retry on next call
        resolve(false)
      }
      document.body.appendChild(script)
    })

    return scriptPromiseRef.current
  }, [])

  /**
   * openRazorpay
   *
   * @param {object} options
   * @param {number}   options.amount      — Total amount in INR (e.g. 499.00)
   * @param {string}   options.orderId     — Your DB order id (sent to /payment/verify)
   * @param {string}   options.receiptId   — Human-readable order number / receipt
   * @param {object}   options.user        — { firstName, lastName, email, phone }
   * @param {function} options.onSuccess   — Called with razorpayPaymentId after verification
   * @param {function} options.onFailure   — Called with error on failure / cancellation
   */
  const openRazorpay = useCallback(async ({
    amount,
    orderId,
    receiptId,
    user,
    onSuccess,
    onFailure,
  }) => {
    // 1. Load Razorpay script
    const loaded = await loadScript()
    if (!loaded) {
      toast.error('Payment gateway failed to load. Please refresh and try again.')
      onFailure?.(new Error('Razorpay script failed to load'))
      return
    }

    try {
      // 2. Fetch Razorpay key from backend (never hardcode in frontend)
      const { data: configData } = await paymentAPI.getConfig()
      const keyId = configData.data?.keyId
      if (!keyId) throw new Error('Missing Razorpay key from server')

      // 3. Create a Razorpay order on backend to get razorpayOrderId + amountInPaise
      const { data: orderData } = await paymentAPI.createOrder({
        amount,
        currency: 'INR',
        receiptId,
      })
      const { razorpayOrderId, amountInPaise } = orderData.data

      // 4. Open Razorpay checkout modal
      const options = {
        key:         keyId,
        amount:      amountInPaise,
        currency:    'INR',
        name:        'ShopZen',
        description: `Order ${receiptId}`,
        order_id:    razorpayOrderId,
        prefill: {
          name:    user ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() : '',
          email:   user?.email   ?? '',
          contact: user?.phone   ?? '',
        },
        theme: { color: '#f07520' },
        // Show all payment methods (UPI, cards, netbanking, wallets)
        method: {
          upi:         true,
          card:        true,
          netbanking:  true,
          wallet:      true,
          emi:         false,
        },

        handler: async (response) => {
          // 5. Verify HMAC signature server-side — this is the critical step
          try {
            await paymentAPI.verify({
              razorpayOrderId:   response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              orderId,
            })
            toast.success('Payment successful! 🎉')
            onSuccess?.(response.razorpay_payment_id)
          } catch (verifyErr) {
            toast.error('Payment verification failed. If money was deducted, contact support with your order number.')
            onFailure?.(verifyErr)
          }
        },

        modal: {
          backdropclose: false, // Prevent accidental close
          escape: false,        // Prevent Escape key closing mid-payment
          ondismiss: () => {
            toast('Payment cancelled', { icon: 'ℹ️' })
            onFailure?.(new Error('Payment dismissed by user'))
          },
        },
      }

      const rzp = new window.Razorpay(options)

      rzp.on('payment.failed', (response) => {
        const reason = response.error?.description || 'Payment failed'
        toast.error(`Payment failed: ${reason}`)
        onFailure?.(response.error)
      })

      rzp.open()
    } catch (err) {
      toast.error('Failed to initiate payment. Please try again.')
      onFailure?.(err)
    }
  }, [loadScript])

  return { openRazorpay }
}
