import { Link } from 'react-router-dom'
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react'

const QUICK_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Products', to: '/products' },
  { label: 'Categories', to: '/categories' },
  { label: 'About Us', to: '/about' },
  { label: 'Blog', to: '/blog' },
  { label: 'Contact', to: '/contact' },
]

const CUSTOMER_LINKS = [
  { label: 'My Account', to: '/account' },
  { label: 'Track Order', to: '/orders' },
  { label: 'Returns & Refunds', to: '/returns' },
  { label: 'Shipping Policy', to: '/shipping' },
  { label: 'Privacy Policy', to: '/privacy' },
  { label: 'Terms of Service', to: '/terms' },
]

const SOCIALS = [
  { Icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
  { Icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
  { Icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
  { Icon: Youtube, href: 'https://youtube.com', label: 'YouTube' },
]

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-gray-300 mt-20">
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4" aria-label="ShopZen home">
              <div className="w-9 h-9 bg-primary-500 rounded-xl flex items-center justify-center" aria-hidden="true">
                <span className="text-white font-display font-bold text-lg">S</span>
              </div>
              <span className="font-display text-xl font-bold text-white">ShopZen</span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              Your one-stop destination for all things modern. Quality products, lightning-fast delivery.
            </p>
            <div className="flex gap-3" role="list" aria-label="Social media links">
              {SOCIALS.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 bg-gray-800 hover:bg-primary-500 rounded-xl flex items-center justify-center transition-colors"
                  role="listitem"
                >
                  <Icon size={16} aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <nav aria-label="Quick links">
            <h4 className="font-display font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2.5 text-sm">
              {QUICK_LINKS.map(({ label, to }) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="hover:text-primary-400 transition-colors focus:outline-none focus:text-primary-400"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Customer Service */}
          <nav aria-label="Customer service links">
            <h4 className="font-display font-semibold text-white mb-4">Customer Service</h4>
            <ul className="space-y-2.5 text-sm">
              {CUSTOMER_LINKS.map(({ label, to }) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="hover:text-primary-400 transition-colors focus:outline-none focus:text-primary-400"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold text-white mb-4">Contact Us</h4>
            <address className="not-italic">
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <MapPin size={15} className="text-primary-400 mt-0.5 shrink-0" aria-hidden="true" />
                  <span className="text-gray-400">123 Commerce Street, Bengaluru, Karnataka 560001</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone size={15} className="text-primary-400 shrink-0" aria-hidden="true" />
                  <a href="tel:+919876543210" className="text-gray-400 hover:text-primary-400 transition-colors">
                    +91 98765 43210
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <Mail size={15} className="text-primary-400 shrink-0" aria-hidden="true" />
                  <a href="mailto:support@shopzen.com" className="text-gray-400 hover:text-primary-400 transition-colors">
                    support@shopzen.com
                  </a>
                </li>
              </ul>
            </address>
            <div className="mt-5">
              <p className="text-xs font-medium text-gray-400 mb-2">We accept</p>
              <div className="flex gap-2" role="list" aria-label="Accepted payment methods">
                {['Visa', 'MC', 'UPI', 'PayTM'].map((p) => (
                  <span
                    key={p}
                    className="px-2 py-1 bg-gray-800 rounded-lg text-xs font-medium text-gray-300"
                    role="listitem"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800">
        <div className="container-custom py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500">© {year} ShopZen. All rights reserved.</p>
          <p className="text-xs text-gray-500">Made with ❤️ in India</p>
        </div>
      </div>
    </footer>
  )
}
