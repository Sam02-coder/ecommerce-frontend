import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin, ArrowRight, Shield, Truck, RotateCcw, Clock } from 'lucide-react'
import { usePageMeta } from '../hooks/useMeta'

// ── Shared layout for all static pages ───────────────────────────────────────
function StaticLayout({ title, description, children }) {
  usePageMeta({ title, description })
  return (
    <div className="container-custom py-12 animate-fade-in max-w-3xl">
      {children}
    </div>
  )
}

function Prose({ children }) {
  return (
    <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed space-y-4">
      {children}
    </div>
  )
}

function SectionHeading({ children }) {
  return <h2 className="font-display text-xl font-bold text-gray-900 mt-8 mb-3">{children}</h2>
}

// ── About ─────────────────────────────────────────────────────────────────────
export function AboutPage() {
  return (
    <StaticLayout title="About Us" description="Learn about ShopZen — our story, mission, and values.">
      <div className="text-center mb-12">
        <p className="text-sm font-semibold text-primary-500 uppercase tracking-widest mb-2">Our Story</p>
        <h1 className="font-display text-4xl font-bold text-gray-900 mb-4">About ShopZen</h1>
        <p className="text-gray-500 max-w-xl mx-auto">
          Born in Bengaluru, built for India. ShopZen makes quality products accessible to everyone.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {[
          { icon: Shield, title: 'Quality First',   desc: 'Every product is vetted before it appears on our platform.' },
          { icon: Truck,  title: 'Fast Delivery',   desc: 'Same-day dispatch on orders placed before 2 PM.' },
          { icon: Clock,  title: '24/7 Support',    desc: 'Our team is always here when you need us.' },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="card p-6 text-center">
            <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Icon size={22} className="text-primary-500" aria-hidden="true" />
            </div>
            <h3 className="font-display font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-sm text-gray-500">{desc}</p>
          </div>
        ))}
      </div>

      <Prose>
        <p>
          ShopZen was founded in 2023 with a simple belief: shopping online should feel as
          comfortable and trustworthy as buying from a store you've known for years.
        </p>
        <SectionHeading>Our Mission</SectionHeading>
        <p>
          We connect quality manufacturers directly with shoppers, cutting out unnecessary
          middlemen so you get better products at fairer prices.
        </p>
        <SectionHeading>Our Values</SectionHeading>
        <ul className="list-disc pl-5 space-y-2">
          <li>Transparency in pricing — no hidden charges, ever.</li>
          <li>Genuine products — we work directly with verified sellers.</li>
          <li>Sustainability — we are actively reducing packaging waste.</li>
          <li>Community — 1% of profits go to digital literacy programs.</li>
        </ul>
      </Prose>

      <div className="mt-10 text-center">
        <Link to="/products" className="btn-primary inline-flex items-center gap-2">
          Start Shopping <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </StaticLayout>
  )
}

// ── Contact ───────────────────────────────────────────────────────────────────
export function ContactPage() {
  const [sent, setSent] = useState(false)
  return (
    <StaticLayout title="Contact Us" description="Get in touch with ShopZen's support team.">
      <div className="text-center mb-10">
        <h1 className="font-display text-4xl font-bold text-gray-900 mb-3">Contact Us</h1>
        <p className="text-gray-500">We're here to help. Reach out through any of these channels.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
        {[
          { icon: Mail,   label: 'Email',   value: 'support@shopzen.com',    href: 'mailto:support@shopzen.com' },
          { icon: Phone,  label: 'Phone',   value: '+91 98765 43210',        href: 'tel:+919876543210' },
          { icon: MapPin, label: 'Address', value: '123 Commerce Street, Bengaluru, Karnataka 560001', href: null },
        ].map(({ icon: Icon, label, value, href }) => (
          <div key={label} className="card p-6 text-center">
            <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Icon size={18} className="text-primary-500" aria-hidden="true" />
            </div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{label}</p>
            {href
              ? <a href={href} className="text-sm font-medium text-gray-900 hover:text-primary-600 transition-colors">{value}</a>
              : <p className="text-sm text-gray-700">{value}</p>
            }
          </div>
        ))}
      </div>

      <div className="card p-8">
        <h2 className="font-display font-bold text-gray-900 text-xl mb-5">Send a Message</h2>
        <form
          onSubmit={(e) => { e.preventDefault(); setSent(true) }}
          className="space-y-4"
          noValidate
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="contact-name" className="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
              <input id="contact-name" type="text" required className="input-field" placeholder="Your name" />
            </div>
            <div>
              <label htmlFor="contact-email" className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input id="contact-email" type="email" required className="input-field" placeholder="you@example.com" />
            </div>
          </div>
          <div>
            <label htmlFor="contact-subject" className="block text-sm font-medium text-gray-700 mb-1.5">Subject</label>
            <input id="contact-subject" type="text" required className="input-field" placeholder="How can we help?" />
          </div>
          <div>
            <label htmlFor="contact-message" className="block text-sm font-medium text-gray-700 mb-1.5">Message</label>
            <textarea id="contact-message" rows={5} required className="input-field resize-none" placeholder="Describe your issue or question…" />
          </div>
          <button type="submit" className="btn-primary w-full">Send Message</button>
        </form>
        {sent && (
          <div className="mt-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 flex items-center gap-2" role="status">
            <span aria-hidden="true">✓</span> Message sent! We'll get back to you within 24 hours.
          </div>
        )}
      </div>
    </StaticLayout>
  )
}

// ── Privacy Policy ────────────────────────────────────────────────────────────
export function PrivacyPage() {
  return (
    <StaticLayout title="Privacy Policy" description="How ShopZen collects, uses and protects your personal information.">
      <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
      <p className="text-sm text-gray-400 mb-8">Last updated: January 2025</p>

      <Prose>
        <p>ShopZen ("we", "our", "us") is committed to protecting your privacy. This policy explains what information we collect, how we use it, and your rights.</p>

        <SectionHeading>1. Information We Collect</SectionHeading>
        <p>We collect information you provide directly, such as your name, email address, phone number, and delivery addresses when you create an account or place an order. We also collect payment information (processed securely by Razorpay — we never store card details). We automatically collect browsing data, device information, and cookies to improve your experience.</p>

        <SectionHeading>2. How We Use Your Information</SectionHeading>
        <ul className="list-disc pl-5 space-y-2">
          <li>To process and deliver your orders</li>
          <li>To send order confirmations and shipping updates</li>
          <li>To personalise product recommendations</li>
          <li>To improve our platform and prevent fraud</li>
          <li>To comply with legal obligations</li>
        </ul>

        <SectionHeading>3. Sharing Your Information</SectionHeading>
        <p>We do not sell your personal data. We share data only with trusted service providers necessary to deliver our service (shipping partners, payment processors) and when required by law.</p>

        <SectionHeading>4. Data Security</SectionHeading>
        <p>We use industry-standard encryption (TLS/HTTPS) for all data in transit and store passwords using bcrypt hashing. We conduct regular security reviews.</p>

        <SectionHeading>5. Your Rights</SectionHeading>
        <p>You have the right to access, correct, or delete your personal data at any time. You can manage most of this from your Account page. For data deletion requests, email <a href="mailto:privacy@shopzen.com" className="text-primary-600 hover:underline">privacy@shopzen.com</a>.</p>

        <SectionHeading>6. Cookies</SectionHeading>
        <p>We use essential cookies for authentication and session management. We use analytics cookies to understand usage patterns. You can disable non-essential cookies in your browser settings.</p>

        <SectionHeading>7. Contact</SectionHeading>
        <p>For privacy concerns, contact us at <a href="mailto:privacy@shopzen.com" className="text-primary-600 hover:underline">privacy@shopzen.com</a>.</p>
      </Prose>
    </StaticLayout>
  )
}

// ── Terms of Service ──────────────────────────────────────────────────────────
export function TermsPage() {
  return (
    <StaticLayout title="Terms of Service" description="ShopZen's terms and conditions for using our platform.">
      <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
      <p className="text-sm text-gray-400 mb-8">Last updated: January 2025</p>

      <Prose>
        <p>By using ShopZen, you agree to these Terms of Service. Please read them carefully.</p>

        <SectionHeading>1. Use of Service</SectionHeading>
        <p>You must be at least 18 years old to create an account and make purchases. You agree to provide accurate information and keep your account credentials secure.</p>

        <SectionHeading>2. Orders and Payments</SectionHeading>
        <p>All prices are in Indian Rupees (INR) inclusive of applicable taxes. We reserve the right to refuse or cancel orders at our discretion. Payments are processed securely through Razorpay.</p>

        <SectionHeading>3. Shipping</SectionHeading>
        <p>Delivery timelines are estimates and may vary. Risk of loss passes to you upon delivery to the carrier. See our <Link to="/shipping" className="text-primary-600 hover:underline">Shipping Policy</Link> for full details.</p>

        <SectionHeading>4. Returns and Refunds</SectionHeading>
        <p>We offer a 30-day return window for most items. See our <Link to="/returns" className="text-primary-600 hover:underline">Returns Policy</Link> for eligibility and process details.</p>

        <SectionHeading>5. Intellectual Property</SectionHeading>
        <p>All content on ShopZen (logos, images, text, software) is owned by ShopZen or its licensors and may not be reproduced without written permission.</p>

        <SectionHeading>6. Limitation of Liability</SectionHeading>
        <p>To the maximum extent permitted by law, ShopZen shall not be liable for indirect, incidental, or consequential damages arising from your use of the service.</p>

        <SectionHeading>7. Governing Law</SectionHeading>
        <p>These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Bengaluru, Karnataka.</p>

        <SectionHeading>8. Contact</SectionHeading>
        <p>For legal queries, contact <a href="mailto:legal@shopzen.com" className="text-primary-600 hover:underline">legal@shopzen.com</a>.</p>
      </Prose>
    </StaticLayout>
  )
}

// ── Shipping Policy ───────────────────────────────────────────────────────────
export function ShippingPage() {
  return (
    <StaticLayout title="Shipping Policy" description="Delivery timelines, charges, and shipping information for ShopZen orders.">
      <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">Shipping Policy</h1>
      <p className="text-sm text-gray-400 mb-8">Last updated: January 2025</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
        {[
          { icon: Truck,   title: 'Free Shipping',  desc: 'On all orders above ₹500' },
          { icon: Clock,   title: 'Standard',        desc: '3–5 business days' },
          { icon: ArrowRight, title: 'Express',     desc: '1–2 business days (+ ₹99)' },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="card p-5 text-center">
            <Icon size={22} className="text-primary-500 mx-auto mb-2" aria-hidden="true" />
            <p className="font-semibold text-gray-900 text-sm">{title}</p>
            <p className="text-xs text-gray-400 mt-1">{desc}</p>
          </div>
        ))}
      </div>

      <Prose>
        <SectionHeading>Delivery Charges</SectionHeading>
        <p>Orders above ₹500 qualify for free standard shipping. Orders below ₹500 incur a flat ₹50 shipping fee. Express delivery is available for an additional ₹99.</p>

        <SectionHeading>Processing Time</SectionHeading>
        <p>Orders placed before 2 PM IST on business days are dispatched the same day. Orders placed after 2 PM or on weekends are dispatched the next business day.</p>

        <SectionHeading>Tracking</SectionHeading>
        <p>Once your order ships, you'll receive a tracking number via email and SMS. You can also view tracking from your <Link to="/orders" className="text-primary-600 hover:underline">Orders page</Link>.</p>

        <SectionHeading>Undeliverable Packages</SectionHeading>
        <p>If a package is returned as undeliverable due to an incorrect address, we will contact you to arrange re-delivery. Additional shipping charges may apply.</p>

        <SectionHeading>International Shipping</SectionHeading>
        <p>We currently ship within India only. International shipping is coming soon.</p>
      </Prose>
    </StaticLayout>
  )
}

// ── Returns Policy ────────────────────────────────────────────────────────────
export function ReturnsPage() {
  return (
    <StaticLayout title="Returns & Refunds" description="ShopZen's 30-day return policy and refund process.">
      <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">Returns & Refunds</h1>
      <p className="text-sm text-gray-400 mb-8">Last updated: January 2025</p>

      <div className="card p-6 bg-green-50 border-green-100 mb-8">
        <div className="flex items-center gap-3">
          <RotateCcw size={24} className="text-green-600 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-display font-bold text-green-900">30-Day Returns</p>
            <p className="text-sm text-green-700">No questions asked. Just initiate within 30 days of delivery.</p>
          </div>
        </div>
      </div>

      <Prose>
        <SectionHeading>Eligibility</SectionHeading>
        <p>Items are eligible for return if:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Returned within 30 days of the delivery date</li>
          <li>In original, unused condition with all tags and packaging</li>
          <li>Not in the non-returnable categories listed below</li>
        </ul>

        <SectionHeading>Non-Returnable Items</SectionHeading>
        <ul className="list-disc pl-5 space-y-2">
          <li>Perishable goods (food, flowers)</li>
          <li>Personal care and hygiene products (opened)</li>
          <li>Digital downloads and software</li>
          <li>Items marked as "Final Sale"</li>
        </ul>

        <SectionHeading>How to Return</SectionHeading>
        <ol className="list-decimal pl-5 space-y-2">
          <li>Go to <Link to="/orders" className="text-primary-600 hover:underline">My Orders</Link> and find the order</li>
          <li>Click "Request Return" and select your reason</li>
          <li>Schedule a free pickup or drop off at the nearest courier point</li>
          <li>Refund is processed within 5–7 business days of item receipt</li>
        </ol>

        <SectionHeading>Refund Method</SectionHeading>
        <p>Refunds are issued to the original payment method. UPI and card payments are refunded within 5–7 business days. Cash on Delivery orders are refunded via bank transfer — please ensure your bank details are saved in your account.</p>

        <SectionHeading>Damaged or Wrong Items</SectionHeading>
        <p>If you received a damaged or incorrect item, contact us at <a href="mailto:support@shopzen.com" className="text-primary-600 hover:underline">support@shopzen.com</a> with your order number and photos within 48 hours of delivery. We'll arrange an immediate replacement or full refund.</p>
      </Prose>
    </StaticLayout>
  )
}
