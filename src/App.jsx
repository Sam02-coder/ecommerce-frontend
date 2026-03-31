import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { useCartStore } from './store/cartStore'
import { useScrollToTop } from './hooks/useMeta'
import { ErrorBoundary } from './components/common/ErrorBoundary'
import NavigationProgress from './components/common/NavigationProgress'

import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import { ProtectedRoute, AdminRoute, GuestRoute } from './components/common/ProtectedRoute'

import HomePage from './pages/HomePage'
import ProductsPage from './pages/ProductsPage'
import ProductDetailPage from './pages/ProductDetailPage'
import CategoriesPage from './pages/CategoriesPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import OrdersPage from './pages/OrdersPage'
import AccountPage from './pages/AccountPage'
import WishlistPage from './pages/WishlistPage'
import SearchPage from './pages/SearchPage'
import AdminPage from './pages/AdminPage'
import AdminProductFormPage from './pages/AdminProductFormPage'
import { LoginPage, RegisterPage } from './pages/AuthPages'
import { NotFoundPage } from './pages/ErrorPages'

function Layout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main id="main-content" className="flex-1 pt-16 lg:pt-20" tabIndex="-1" aria-label="Main content">
        <ErrorBoundary>{children}</ErrorBoundary>
      </main>
      <Footer />
    </div>
  )
}

function AuthLayout({ children }) {
  return <ErrorBoundary>{children}</ErrorBoundary>
}

function ScrollToTop() {
  useScrollToTop()
  return null
}

export default function App() {
  const { isAuthenticated } = useAuthStore()
  const { fetchCart } = useCartStore()

  useEffect(() => {
    if (isAuthenticated) fetchCart()
  }, [isAuthenticated, fetchCart])

  return (
    <>
      <NavigationProgress />
      <ScrollToTop />
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] btn-primary !py-2 !px-4 !text-sm">
        Skip to main content
      </a>
      <Routes>
        <Route path="/login"    element={<GuestRoute><AuthLayout><LoginPage /></AuthLayout></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><AuthLayout><RegisterPage /></AuthLayout></GuestRoute>} />

        <Route path="/"               element={<Layout><HomePage /></Layout>} />
        <Route path="/products"       element={<Layout><ProductsPage /></Layout>} />
        <Route path="/products/:slug" element={<Layout><ProductDetailPage /></Layout>} />
        <Route path="/categories"     element={<Layout><CategoriesPage /></Layout>} />
        <Route path="/search"         element={<Layout><SearchPage /></Layout>} />
        <Route path="/cart"           element={<Layout><CartPage /></Layout>} />

        <Route path="/checkout" element={<ProtectedRoute><Layout><CheckoutPage /></Layout></ProtectedRoute>} />
        <Route path="/orders"   element={<ProtectedRoute><Layout><OrdersPage /></Layout></ProtectedRoute>} />
        <Route path="/account"  element={<ProtectedRoute><Layout><AccountPage /></Layout></ProtectedRoute>} />
        <Route path="/wishlist" element={<ProtectedRoute><Layout><WishlistPage /></Layout></ProtectedRoute>} />

        <Route path="/admin"                   element={<AdminRoute><Layout><AdminPage /></Layout></AdminRoute>} />
        <Route path="/admin/products/new"      element={<AdminRoute><Layout><AdminProductFormPage /></Layout></AdminRoute>} />
        <Route path="/admin/products/edit/:id" element={<AdminRoute><Layout><AdminProductFormPage /></Layout></AdminRoute>} />

        <Route path="*" element={<Layout><NotFoundPage /></Layout>} />
      </Routes>
    </>
  )
}
