import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import toast from 'react-hot-toast'

/**
 * useWishlistStore — client-side wishlist persisted to localStorage.
 *
 * This is intentionally kept client-side only for simplicity.
 * To make it server-synced, replace the add/remove methods with API calls
 * and fetch the list on login.
 *
 * Items are stored as full product snapshots so the wishlist page
 * can render without any additional API calls.
 */
export const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [], // Array of product objects

      /**
       * Toggle a product in/out of the wishlist.
       * Pass the full product object so we can display it without re-fetching.
       */
      toggle: (product) => {
        const exists = get().items.some((item) => item.id === product.id)
        if (exists) {
          set((state) => ({ items: state.items.filter((i) => i.id !== product.id) }))
          toast('Removed from wishlist', { icon: '🗑️' })
        } else {
          set((state) => ({ items: [...state.items, product] }))
          toast.success('Added to wishlist!')
        }
      },

      isWishlisted: (productId) =>
        get().items.some((item) => item.id === productId),

      remove: (productId) => {
        set((state) => ({ items: state.items.filter((i) => i.id !== productId) }))
      },

      clear: () => set({ items: [] }),

      count: () => get().items.length,
    }),
    {
      name: 'wishlist-storage',
      // Only persist the items array
      partialize: (state) => ({ items: state.items }),
    }
  )
)
