import { create } from 'zustand'
import { cartAPI } from '../services/api'
import toast from 'react-hot-toast'

/**
 * Cart store.
 *
 * Uses optimistic updates for quantity changes so the UI feels instant:
 *  1. Update local state immediately
 *  2. Fire the API call
 *  3. On error, roll back to the previous state and show a toast
 *
 * addToCart and removeItem are not optimistic because the server response
 * contains recalculated totals we need.
 */
export const useCartStore = create((set, get) => ({
  cart: null,
  loading: false,
  error: null,

  fetchCart: async () => {
    set({ loading: true, error: null })
    try {
      const { data } = await cartAPI.get()
      set({ cart: data.data })
    } catch (err) {
      // Silently fail if user is not authenticated (401 is swallowed by interceptor)
      const status = err?.response?.status
      if (status && status !== 401) {
        set({ error: 'Failed to load cart' })
      }
    } finally {
      set({ loading: false })
    }
  },

  addToCart: async (productId, quantity = 1) => {
    try {
      const { data } = await cartAPI.addItem({ productId, quantity })
      set({ cart: data.data })
      toast.success('Added to cart!')
      return true
    } catch {
      // Error toast already shown by the Axios response interceptor
      return false
    }
  },

  /**
   * Optimistic quantity update.
   * If quantity reaches 0 the item is removed (handled by the caller via ConfirmDialog).
   */
  updateItem: async (itemId, quantity) => {
    if (quantity < 1) return

    const previousCart = get().cart
    // Optimistic update
    set((state) => ({
      cart: state.cart
        ? {
            ...state.cart,
            items: state.cart.items.map((item) =>
              item.id === itemId ? { ...item, quantity, subtotal: item.price * quantity } : item
            ),
            totalItems: state.cart.items.reduce(
              (sum, item) => sum + (item.id === itemId ? quantity : item.quantity),
              0
            ),
            totalPrice: state.cart.items.reduce(
              (sum, item) => sum + item.price * (item.id === itemId ? quantity : item.quantity),
              0
            ),
          }
        : state.cart,
    }))

    try {
      const { data } = await cartAPI.updateItem(itemId, quantity)
      // Replace with authoritative server response
      set({ cart: data.data })
    } catch {
      // Roll back on error
      set({ cart: previousCart })
      toast.error('Failed to update quantity')
    }
  },

  removeItem: async (itemId) => {
    const previousCart = get().cart
    // Optimistic remove
    set((state) => ({
      cart: state.cart
        ? {
            ...state.cart,
            items: state.cart.items.filter((item) => item.id !== itemId),
          }
        : state.cart,
    }))

    try {
      const { data } = await cartAPI.removeItem(itemId)
      set({ cart: data.data })
      toast.success('Item removed')
    } catch {
      set({ cart: previousCart })
      toast.error('Failed to remove item')
    }
  },

  clearCart: async () => {
    const previousCart = get().cart
    set({ cart: null })
    try {
      await cartAPI.clear()
    } catch {
      set({ cart: previousCart })
    }
  },

  /** Clears cart state without an API call (used after successful order placement) */
  resetCart: () => set({ cart: null }),

  getItemCount: () => get().cart?.totalItems ?? 0,

  getTotal: () => get().cart?.totalPrice ?? 0,
}))
