import axios from 'axios'
import toast from 'react-hot-toast'

// ── Base URL from environment ────────────────────────────────────────────────
// In development, Vite proxies /api → localhost:8080 (see vite.config.js)
// In production, set VITE_API_BASE_URL to your backend URL, e.g. https://api.shopzen.in
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

// ── Axios instance ────────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
})

// ── Request interceptor — attach JWT ─────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

// ── Response interceptor — silent refresh on 401 ─────────────────────────────
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token)
  )
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config

    // ── 401 handling with token refresh ──────────────────────────────────────
    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        // Queue subsequent 401s until refresh resolves
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`
          return api(original)
        }).catch((err) => Promise.reject(err))
      }

      original._retry = true
      isRefreshing = true

      const refreshToken = localStorage.getItem('refreshToken')

      if (refreshToken) {
        try {
          const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken })
          const { accessToken, refreshToken: newRefresh } = data.data

          localStorage.setItem('accessToken', accessToken)
          localStorage.setItem('refreshToken', newRefresh)
          api.defaults.headers.common.Authorization = `Bearer ${accessToken}`

          // Keep zustand auth store in sync if available
          try {
            const { useAuthStore } = await import('../store/authStore')
            useAuthStore.getState().updateTokens(accessToken, newRefresh)
          } catch {
            // Store may not be available in all contexts
          }

          processQueue(null, accessToken)
          original.headers.Authorization = `Bearer ${accessToken}`
          return api(original)
        } catch (refreshError) {
          processQueue(refreshError, null)
          // Clear auth and redirect to login
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          try {
            const { useAuthStore } = await import('../store/authStore')
            useAuthStore.getState().logout()
          } catch { /* ignore */ }
          window.location.href = '/login?expired=1'
          return Promise.reject(refreshError)
        } finally {
          isRefreshing = false
        }
      } else {
        // No refresh token — clear state and redirect
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login?expired=1'
        return Promise.reject(error)
      }
    }

    // ── Non-401 error toasts ──────────────────────────────────────────────────
    if (error.response) {
      const status = error.response.status
      const message = error.response.data?.message

      // Don't show toast for validation errors (400) — handled by forms
      // Don't re-toast 401 — handled above
      if (status === 403) {
        toast.error("You don't have permission to do that.")
      } else if (status === 404) {
        // Only toast if there's a meaningful message from the server
        if (message && message !== 'Not Found') toast.error(message)
      } else if (status === 429) {
        toast.error('Too many requests. Please wait a moment and try again.')
      } else if (status >= 500) {
        toast.error('A server error occurred. Please try again later.')
      } else if (status !== 400 && status !== 401) {
        toast.error(message || 'Something went wrong.')
      }
    } else if (error.code === 'ECONNABORTED') {
      toast.error('Request timed out. Please check your connection.')
    } else if (!error.response) {
      toast.error('Network error — please check your internet connection.')
    }

    return Promise.reject(error)
  }
)

export default api

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  register:       (data) => api.post('/auth/register', data),
  login:          (data) => api.post('/auth/login', data),
  refresh:        (data) => api.post('/auth/refresh', data),
  changePassword: (data) => api.put('/auth/change-password', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword:  (data) => api.post('/auth/reset-password', data),
}

// ── Products ──────────────────────────────────────────────────────────────────
export const productAPI = {
  getAll:      (params) => api.get('/products', { params }),
  getBySlug:   (slug)   => api.get(`/products/${slug}`),
  getFeatured: ()       => api.get('/products/featured'),
  getRelated:  (id)     => api.get(`/products/${id}/related`),
  getBrands:   ()       => api.get('/products/brands'),
  create:      (data)   => api.post('/products', data),
  update:      (id, d)  => api.put(`/products/${id}`, d),
  delete:      (id)     => api.delete(`/products/${id}`),
}

// ── Categories ────────────────────────────────────────────────────────────────
export const categoryAPI = {
  getAll:  ()        => api.get('/categories'),
  getOne:  (id)      => api.get(`/categories/${id}`),
  create:  (data)    => api.post('/categories', data),
  update:  (id, d)   => api.put(`/categories/${id}`, d),
  delete:  (id)      => api.delete(`/categories/${id}`),
}

// ── Cart ──────────────────────────────────────────────────────────────────────
export const cartAPI = {
  get:        ()           => api.get('/cart'),
  addItem:    (data)       => api.post('/cart/items', data),
  updateItem: (id, qty)    => api.put(`/cart/items/${id}`, null, { params: { quantity: qty } }),
  removeItem: (id)         => api.delete(`/cart/items/${id}`),
  clear:      ()           => api.delete('/cart'),
}

// ── Orders ────────────────────────────────────────────────────────────────────
export const orderAPI = {
  place:             (data)   => api.post('/orders', data),
  getAll:            (params) => api.get('/orders', { params }),
  getOne:            (id)     => api.get(`/orders/${id}`),
  validateCoupon:    (data)   => api.post('/orders/validate-coupon', data),
  adminGetAll:       (params) => api.get('/orders/admin/all', { params }),
  adminUpdateStatus: (id, d)  => api.put(`/orders/admin/${id}/status`, d),
}

// ── Payment (Razorpay) ────────────────────────────────────────────────────────
export const paymentAPI = {
  getConfig:   ()     => api.get('/payment/config'),
  createOrder: (data) => api.post('/payment/create-order', data),
  verify:      (data) => api.post('/payment/verify', data),
}

// ── Reviews ───────────────────────────────────────────────────────────────────
export const reviewAPI = {
  getProductReviews: (productId, params) => api.get(`/reviews/product/${productId}`, { params }),
  addReview:         (productId, data)   => api.post(`/reviews/product/${productId}`, data),
}

// ── Addresses ─────────────────────────────────────────────────────────────────
export const addressAPI = {
  getAll:     ()        => api.get('/addresses'),
  create:     (data)    => api.post('/addresses', data),
  update:     (id, d)   => api.put(`/addresses/${id}`, d),
  delete:     (id)      => api.delete(`/addresses/${id}`),
  setDefault: (id)      => api.patch(`/addresses/${id}/default`),
}
