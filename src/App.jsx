import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { useCartStore } from './store/cartStore'
import { useScrollToTop } from './hooks/useMeta'
import { ErrorBoundary } from './components/common/ErrorBoundary'
import NavigationProgress from './components/common/NavigationProgress'
import OfflineBanner from './components/common/OfflineBanner'

import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import { ProtectedRoute, AdminRoute, GuestRoute } from './components/common/ProtectedRoute'

import HomePage            from './pages/HomePage'
import ProductsPage        from './pages/ProductsPage'
import ProductDetailPage   from './pages/ProductDetailPage'
import CategoriesPage      from './pages/CategoriesPage'
import CartPage            from './pages/CartPage'
import CheckoutPage        from './pages/CheckoutPage'
import OrdersPage          from './pages/OrdersPage'
import AccountPage         from './pages/AccountPage'
import WishlistPage        from './pages/WishlistPage'
import SearchPage          from './pages/SearchPage'
import BlogPage            from './pages/BlogPage'
import AdminPage           from './pages/AdminPage'
import AdminProductFormPage from './pages/AdminProductFormPage'
import { LoginPage, RegisterPage }                from './pages/AuthPages'
import { ForgotPasswordPage, ResetPasswordPage }  from './pages/ForgotPasswordPage'
import { NotFoundPage }                           from './pages/ErrorPages'
import {
  AboutPage, ContactPage, PrivacyPage,
  TermsPage, ShippingPage, ReturnsPage,
} from './pages/StaticPages'

// ── Layouts ───────────────────────────────────────────────────────────────────

function Layout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main
        id="main-content"
        className="flex-1 pt-16 lg:pt-20"
        tabIndex="-1"
        aria-label="Main content"
      >
        <ErrorBoundary>{children}</ErrorBoundary>
      </main>
      <Footer />
    </div>
  )
}

/** Auth pages — full screen, no Navbar/Footer */
function AuthLayout({ children }) {
  return <ErrorBoundary>{children}</ErrorBoundary>
}

function ScrollToTop() {
  useScrollToTop()
  return null
}

// ── App root ──────────────────────────────────────────────────────────────────

export default function App() {
  const { isAuthenticated } = useAuthStore()
  const { fetchCart } = useCartStore()

  useEffect(() => {
    if (isAuthenticated) fetchCart()
  }, [isAuthenticated, fetchCart])

  return (
    <>
      {/* Slim navigation progress bar */}
      <NavigationProgress />

      {/* Offline status banner */}
      <OfflineBanner />

      {/* Scroll-to-top on route change */}
      <ScrollToTop />

      {/* Skip-to-content for keyboard/AT users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] btn-primary !py-2 !px-4 !text-sm"
      >
        Skip to main content
      </a>

      <Routes>
        {/* ── Guest-only auth pages (no nav/footer) ── */}
        <Route path="/login"           element={<GuestRoute><AuthLayout><LoginPage /></AuthLayout></GuestRoute>} />
        <Route path="/register"        element={<GuestRoute><AuthLayout><RegisterPage /></AuthLayout></GuestRoute>} />
        <Route path="/forgot-password" element={<GuestRoute><AuthLayout><ForgotPasswordPage /></AuthLayout></GuestRoute>} />
        <Route path="/reset-password"  element={<AuthLayout><ResetPasswordPage /></AuthLayout>} />

        {/* ── Public pages ── */}
        <Route path="/"               element={<Layout><HomePage /></Layout>} />
        <Route path="/products"       element={<Layout><ProductsPage /></Layout>} />
        <Route path="/products/:slug" element={<Layout><ProductDetailPage /></Layout>} />
        <Route path="/categories"     element={<Layout><CategoriesPage /></Layout>} />
        <Route path="/search"         element={<Layout><SearchPage /></Layout>} />
        <Route path="/cart"           element={<Layout><CartPage /></Layout>} />
        <Route path="/blog"           element={<Layout><BlogPage /></Layout>} />

        {/* ── Static info pages ── */}
        <Route path="/about"    element={<Layout><AboutPage /></Layout>} />
        <Route path="/contact"  element={<Layout><ContactPage /></Layout>} />
        <Route path="/privacy"  element={<Layout><PrivacyPage /></Layout>} />
        <Route path="/terms"    element={<Layout><TermsPage /></Layout>} />
        <Route path="/shipping" element={<Layout><ShippingPage /></Layout>} />
        <Route path="/returns"  element={<Layout><ReturnsPage /></Layout>} />

        {/* ── Authenticated pages ── */}
        <Route path="/checkout" element={<ProtectedRoute><Layout><CheckoutPage /></Layout></ProtectedRoute>} />
        <Route path="/orders"   element={<ProtectedRoute><Layout><OrdersPage /></Layout></ProtectedRoute>} />
        <Route path="/account"  element={<ProtectedRoute><Layout><AccountPage /></Layout></ProtectedRoute>} />
        <Route path="/wishlist" element={<ProtectedRoute><Layout><WishlistPage /></Layout></ProtectedRoute>} />

        {/* ── Admin pages ── */}
        <Route path="/admin"                   element={<AdminRoute><Layout><AdminPage /></Layout></AdminRoute>} />
        <Route path="/admin/products/new"      element={<AdminRoute><Layout><AdminProductFormPage /></Layout></AdminRoute>} />
        <Route path="/admin/products/edit/:id" element={<AdminRoute><Layout><AdminProductFormPage /></Layout></AdminRoute>} />

        {/* ── 404 catch-all ── */}
        <Route path="*" element={<Layout><NotFoundPage /></Layout>} />
      </Routes>
    </>
  )
}
