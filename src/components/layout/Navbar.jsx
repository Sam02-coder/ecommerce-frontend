import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ShoppingCart, Search, User, Menu, X, ChevronDown, LogOut, Package, Settings, Heart } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useCartStore } from '../../store/cartStore'
import { useWishlistStore } from '../../store/wishlistStore'

const NAV_LINKS = [
  { label: 'Home',       to: '/' },
  { label: 'Products',   to: '/products' },
  { label: 'Categories', to: '/categories' },
  { label: 'Deals',      to: '/products?sortBy=price&sortDir=asc' },
]

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isAuthenticated, logout, isAdmin } = useAuthStore()
  const { getItemCount } = useCartStore()
  const wishlistCount = useWishlistStore((s) => s.items.length)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const userMenuRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => { setMobileOpen(false); setUserMenuOpen(false) }, [location.pathname])

  useEffect(() => {
    const h = (e) => { if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false) }
    if (userMenuOpen) document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [userMenuOpen])

  useEffect(() => { document.body.style.overflow = mobileOpen ? 'hidden' : ''; return () => { document.body.style.overflow = '' } }, [mobileOpen])

  const handleLogout = () => { setUserMenuOpen(false); logout(); navigate('/') }
  const itemCount = getItemCount()
  const isActive = (to) => to === '/' ? location.pathname === '/' : location.pathname.startsWith(to.split('?')[0])

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100' : 'bg-white'}`} role="banner">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link to="/" className="flex items-center gap-2 shrink-0" aria-label="ShopZen homepage">
            <div className="w-9 h-9 bg-primary-500 rounded-xl flex items-center justify-center" aria-hidden="true"><span className="text-white font-display font-bold text-lg">S</span></div>
            <span className="font-display text-xl font-bold text-gray-900">ShopZen</span>
          </Link>
          <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
            {NAV_LINKS.map((link) => (
              <Link key={link.to} to={link.to} aria-current={isActive(link.to) ? 'page' : undefined}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive(link.to) ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-1 lg:gap-2">
            <Link to="/search" aria-label="Search products" className="p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400">
              <Search size={20} aria-hidden="true" />
            </Link>
            {isAuthenticated && (
              <Link to="/wishlist" aria-label={`Wishlist, ${wishlistCount} items`} className="relative p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400">
                <Heart size={20} aria-hidden="true" />
                {wishlistCount > 0 && <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-scale-in" aria-hidden="true">{wishlistCount > 9 ? '9+' : wishlistCount}</span>}
              </Link>
            )}
            <Link to="/cart" aria-label={`Cart, ${itemCount} items`} className="relative p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400">
              <ShoppingCart size={20} aria-hidden="true" />
              {itemCount > 0 && <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-scale-in" aria-hidden="true">{itemCount > 9 ? '9+' : itemCount}</span>}
            </Link>
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button onClick={() => setUserMenuOpen(!userMenuOpen)} aria-label="User menu" aria-expanded={userMenuOpen} aria-haspopup="true"
                  className="flex items-center gap-2 pl-2 pr-3 py-2 rounded-xl hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400">
                  <div className="w-7 h-7 bg-primary-100 rounded-full flex items-center justify-center" aria-hidden="true"><span className="text-primary-600 font-semibold text-xs">{user?.firstName?.[0]}{user?.lastName?.[0]}</span></div>
                  <span className="hidden lg:block text-sm font-medium text-gray-700">{user?.firstName}</span>
                  <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-lg border border-gray-100 py-2 z-50 animate-scale-in" role="menu">
                    <div className="px-4 py-2 border-b border-gray-50 mb-1"><p className="text-sm font-semibold text-gray-900">{user?.firstName} {user?.lastName}</p><p className="text-xs text-gray-400 truncate">{user?.email}</p></div>
                    {[{ to: '/account', Icon: User, label: 'My Account' }, { to: '/orders', Icon: Package, label: 'My Orders' }, { to: '/wishlist', Icon: Heart, label: 'Wishlist' }].map(({ to, Icon, label }) => (
                      <Link key={to} to={to} role="menuitem" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"><Icon size={15} aria-hidden="true" /> {label}</Link>
                    ))}
                    {isAdmin() && <Link to="/admin" role="menuitem" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"><Settings size={15} aria-hidden="true" /> Admin Panel</Link>}
                    <div className="border-t border-gray-50 mt-1 pt-1">
                      <button onClick={handleLogout} role="menuitem" className="flex items-center gap-3 w-[calc(100%-8px)] mx-1 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors rounded-xl"><LogOut size={15} aria-hidden="true" /> Sign Out</button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden lg:flex items-center gap-2">
                <Link to="/login" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Sign In</Link>
                <Link to="/register" className="btn-primary !py-2 !px-4 !text-sm">Sign Up</Link>
              </div>
            )}
            <button onClick={() => setMobileOpen(!mobileOpen)} aria-label={mobileOpen ? 'Close menu' : 'Open menu'} aria-expanded={mobileOpen} aria-controls="mobile-menu"
              className="lg:hidden p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400">
              {mobileOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
            </button>
          </div>
        </div>
        {mobileOpen && (
          <div id="mobile-menu" className="lg:hidden pb-4 border-t border-gray-100 animate-slide-up" role="navigation" aria-label="Mobile navigation">
            <nav className="flex flex-col gap-1 pt-3">
              {NAV_LINKS.map((link) => (
                <Link key={link.to} to={link.to} aria-current={isActive(link.to) ? 'page' : undefined}
                  className={`px-4 py-3 rounded-xl font-medium transition-colors ${isActive(link.to) ? 'bg-primary-50 text-primary-600' : 'text-gray-700 hover:bg-gray-50'}`}>
                  {link.label}
                </Link>
              ))}
              {isAuthenticated ? (
                <div className="mt-2 pt-3 border-t border-gray-100 space-y-1">
                  <Link to="/account"  className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 font-medium"><User    size={16} aria-hidden="true" /> My Account</Link>
                  <Link to="/orders"   className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 font-medium"><Package size={16} aria-hidden="true" /> My Orders</Link>
                  <Link to="/wishlist" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 font-medium"><Heart   size={16} aria-hidden="true" /> Wishlist {wishlistCount > 0 && <span className="ml-auto badge bg-red-100 text-red-600 text-xs">{wishlistCount}</span>}</Link>
                  <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 font-medium"><LogOut size={16} aria-hidden="true" /> Sign Out</button>
                </div>
              ) : (
                <div className="flex gap-2 mt-2 pt-3 border-t border-gray-100">
                  <Link to="/login"    className="flex-1 btn-secondary !text-sm !py-2">Sign In</Link>
                  <Link to="/register" className="flex-1 btn-primary !text-sm !py-2">Sign Up</Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
