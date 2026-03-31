// ── Currency ──────────────────────────────────────────────────────────────────

/**
 * Format a number as Indian Rupee currency.
 * Handles null/undefined/NaN gracefully.
 */
export const formatCurrency = (amount) => {
  const value = Number(amount)
  if (amount == null || Number.isNaN(value)) return '₹0'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)
}

// ── Dates ─────────────────────────────────────────────────────────────────────

/**
 * Format an ISO date string to a human-readable date (e.g. "12 Jan 2025").
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Format an ISO date string to a datetime (e.g. "12 Jan 2025, 3:45 PM").
 */
export const formatDateTime = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Returns a relative time string for recent dates (e.g. "2 hours ago"),
 * falling back to formatDate for older ones.
 */
export const formatRelativeDate = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return ''
  const diffMs = Date.now() - d.getTime()
  const diffMins = Math.floor(diffMs / 60_000)
  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  return formatDate(dateStr)
}

// ── Pricing ───────────────────────────────────────────────────────────────────

/**
 * Calculate discount percentage between sale price and compare-at price.
 * Returns 0 if there's no discount or inputs are invalid.
 */
export const discountPercent = (price, compareAtPrice) => {
  const p = Number(price)
  const c = Number(compareAtPrice)
  if (!c || Number.isNaN(p) || Number.isNaN(c) || c <= p) return 0
  return Math.round(((c - p) / c) * 100)
}

// ── Text ──────────────────────────────────────────────────────────────────────

/**
 * Truncate text to a given length with ellipsis.
 */
export const truncate = (text, length = 100) => {
  if (!text) return ''
  const str = String(text)
  return str.length > length ? `${str.slice(0, length)}…` : str
}

/**
 * Convert a string to a URL-friendly slug.
 * e.g. "Hello World!" → "hello-world"
 */
export const slugify = (text) => {
  if (!text) return ''
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Capitalise first letter of each word.
 */
export const titleCase = (text) => {
  if (!text) return ''
  return String(text)
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

// ── Images ────────────────────────────────────────────────────────────────────

/** Inline SVG used as a local fallback — no external CDN dependency */
export const FALLBACK_IMAGE_SM = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='system-ui' font-size='10' fill='%239ca3af'%3ENo Image%3C/text%3E%3C/svg%3E`

export const FALLBACK_IMAGE_LG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='600' viewBox='0 0 600 600'%3E%3Crect width='600' height='600' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='system-ui' font-size='18' fill='%239ca3af'%3ENo Image%3C/text%3E%3C/svg%3E`

/**
 * Get the primary image URL from an array of product images.
 * Falls back to first image, then to the local SVG placeholder.
 */
export const getPrimaryImage = (images, size = 'sm') => {
  if (!images?.length) return size === 'lg' ? FALLBACK_IMAGE_LG : FALLBACK_IMAGE_SM
  const primary = images.find((img) => img?.primary)
  return primary?.url || images[0]?.url || (size === 'lg' ? FALLBACK_IMAGE_LG : FALLBACK_IMAGE_SM)
}

// ── Order / Payment status config ─────────────────────────────────────────────

export const ORDER_STATUS = {
  PENDING:    { label: 'Pending',    color: 'bg-yellow-100 text-yellow-800', dot: 'bg-yellow-400' },
  CONFIRMED:  { label: 'Confirmed',  color: 'bg-blue-100 text-blue-800',    dot: 'bg-blue-400'   },
  PROCESSING: { label: 'Processing', color: 'bg-indigo-100 text-indigo-800', dot: 'bg-indigo-400' },
  SHIPPED:    { label: 'Shipped',    color: 'bg-purple-100 text-purple-800', dot: 'bg-purple-400' },
  DELIVERED:  { label: 'Delivered',  color: 'bg-green-100 text-green-800',  dot: 'bg-green-400'  },
  CANCELLED:  { label: 'Cancelled',  color: 'bg-red-100 text-red-800',      dot: 'bg-red-400'    },
  REFUNDED:   { label: 'Refunded',   color: 'bg-gray-100 text-gray-800',    dot: 'bg-gray-400'   },
}

export const PAYMENT_STATUS = {
  PENDING:   { label: 'Pending',  color: 'text-yellow-600' },
  COMPLETED: { label: 'Paid',     color: 'text-green-600'  },
  FAILED:    { label: 'Failed',   color: 'text-red-600'    },
  REFUNDED:  { label: 'Refunded', color: 'text-gray-600'   },
}

// ── Validation helpers ────────────────────────────────────────────────────────

/** Basic email format check */
export const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())

/** Indian mobile number (10 digits, optional +91 prefix) */
export const isValidPhone = (phone) =>
  /^(\+91[\s-]?)?[6-9]\d{9}$/.test(String(phone).replace(/\s/g, ''))

/** Indian PIN code (6 digits) */
export const isValidPIN = (pin) =>
  /^\d{6}$/.test(String(pin).trim())

// ── Misc ──────────────────────────────────────────────────────────────────────

/**
 * Star rating array — useful for rendering star icons.
 * Returns an array of { filled, half } objects.
 */
export const getStars = (rating) =>
  Array.from({ length: 5 }, (_, i) => ({
    filled: i < Math.floor(rating),
    half:   i === Math.floor(rating) && rating % 1 >= 0.5,
  }))

/**
 * Clamp a number between min and max.
 */
export const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

/**
 * Debounce a function call.
 * Returns a debounced version of fn that delays invocation by `wait` ms.
 */
export const debounce = (fn, wait = 300) => {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), wait)
  }
}
