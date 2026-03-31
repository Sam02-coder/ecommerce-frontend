import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authAPI } from '../services/api'
import toast from 'react-hot-toast'

/**
 * Auth store — persists user + tokens to localStorage via Zustand persist.
 *
 * Token storage strategy:
 *  - Tokens are stored in BOTH zustand persist AND localStorage directly.
 *  - localStorage is the source of truth for the Axios interceptor (api.js).
 *  - Zustand persist handles restoring state on page reload.
 *
 * Do NOT store tokens only in zustand state without persist — they'd be lost on
 * page reload before the store hydrates, causing a flicker of "not logged in".
 */
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isHydrated: false, // true after zustand rehydrates from localStorage

      /**
       * Called by Zustand after store rehydrates from localStorage.
       * Use this to block rendering until auth state is known (avoids flash).
       */
      setHydrated: () => set({ isHydrated: true }),

      login: async (credentials) => {
        const { data } = await authAPI.login(credentials)
        const { accessToken, refreshToken, user } = data.data

        // Keep localStorage in sync for axios interceptor
        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('refreshToken', refreshToken)

        set({ user, accessToken, refreshToken, isAuthenticated: true })
        toast.success(`Welcome back, ${user.firstName}!`)
        return user
      },

      register: async (userData) => {
        const { data } = await authAPI.register(userData)
        const { accessToken, refreshToken, user } = data.data

        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('refreshToken', refreshToken)

        set({ user, accessToken, refreshToken, isAuthenticated: true })
        toast.success('Account created successfully!')
        return user
      },

      logout: () => {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        })
        toast.success('Logged out successfully')
      },

      /**
       * Called by the axios refresh interceptor after a successful token refresh.
       * Keeps zustand state in sync without triggering a full login flow.
       */
      updateTokens: (accessToken, refreshToken) => {
        set({ accessToken, refreshToken })
      },

      updateUser: (user) => set({ user }),

      isAdmin: () => get().user?.role === 'ADMIN',
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated()
      },
    }
  )
)
