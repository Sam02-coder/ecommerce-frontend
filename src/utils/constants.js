/**
 * constants.js — centralised business logic constants.
 *
 * These values are referenced in multiple places (CartPage, CheckoutPage,
 * ShippingPage, ProductDetailPage). Keeping them here means a price change
 * only needs to happen in one file.
 *
 * If your backend already returns these values (e.g. in an /api/config
 * endpoint), replace these with a useQuery call and remove this file.
 */

// ── Shipping ──────────────────────────────────────────────────────────────────

/** Minimum order subtotal (INR) to qualify for free shipping */
export const FREE_SHIPPING_THRESHOLD = 500

/** Flat shipping fee (INR) when below the free threshold */
export const STANDARD_SHIPPING_FEE = 50

/** Express delivery surcharge (INR) */
export const EXPRESS_SHIPPING_FEE = 99

/**
 * Calculate the shipping cost for a given subtotal.
 * @param {number} subtotal - Cart subtotal in INR
 * @returns {number} Shipping cost in INR (0 if free)
 */
export const calculateShipping = (subtotal) =>
  subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE

// ── Tax ───────────────────────────────────────────────────────────────────────

/** GST rate applied to the subtotal (18%) */
export const GST_RATE = 0.18

/**
 * Calculate GST amount for a given subtotal.
 * @param {number} subtotal - Pre-tax subtotal in INR
 * @returns {number} Tax amount in INR
 */
export const calculateTax = (subtotal) =>
  Math.round(subtotal * GST_RATE * 100) / 100   // rounded to 2dp

// ── Order totals ──────────────────────────────────────────────────────────────

/**
 * Calculate all order cost components from a cart subtotal.
 * @param {number} subtotal     - Cart subtotal in INR
 * @param {number} [discount=0] - Coupon discount amount in INR
 * @returns {{ shipping, tax, total }}
 */
export const calculateOrderTotal = (subtotal, discount = 0) => {
  const shipping = calculateShipping(subtotal)
  const tax      = calculateTax(subtotal)
  const total    = Math.max(0, subtotal + shipping + tax - discount)
  return { shipping, tax, total }
}

// ── Review ────────────────────────────────────────────────────────────────────

/** Minimum review comment length (characters) */
export const MIN_REVIEW_LENGTH = 10

/** Maximum review comment length (characters) */
export const MAX_REVIEW_LENGTH = 2000

// ── Pagination ────────────────────────────────────────────────────────────────

/** Default number of products per page */
export const PRODUCTS_PER_PAGE = 12

/** Default number of orders per page */
export const ORDERS_PER_PAGE = 10

/** Default number of admin orders per page */
export const ADMIN_ORDERS_PER_PAGE = 15

/** Default number of admin products per page */
export const ADMIN_PRODUCTS_PER_PAGE = 15

// ── Stock thresholds ──────────────────────────────────────────────────────────

/** Show "Only N left!" warning when stock is at or below this number */
export const LOW_STOCK_THRESHOLD = 5

// ── Search ────────────────────────────────────────────────────────────────────

/** Minimum characters before a search query fires */
export const MIN_SEARCH_LENGTH = 2

/** Debounce delay (ms) for search inputs */
export const SEARCH_DEBOUNCE_MS = 400
