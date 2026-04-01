import { usePageMeta } from '../hooks/useMeta'
import { Link } from 'react-router-dom'
import { ArrowRight, Clock, User } from 'lucide-react'

// Static blog posts — replace with API call when your backend supports it
const POSTS = [
  {
    id: 1,
    slug: 'top-10-gadgets-2025',
    category: 'Electronics',
    title: 'Top 10 Gadgets You Need in 2025',
    excerpt: 'From AI-powered earbuds to foldable phones, we break down the must-have tech of the year.',
    author: 'Priya Sharma',
    date: '2025-01-15',
    readTime: '5 min read',
    emoji: '📱',
    color: 'from-blue-500 to-indigo-600',
  },
  {
    id: 2,
    slug: 'home-decor-trends',
    category: 'Home & Living',
    title: 'Home Décor Trends Dominating 2025',
    excerpt: 'Japandi aesthetics, biophilic design, and multifunctional furniture — transform your space.',
    author: 'Arjun Mehta',
    date: '2025-01-10',
    readTime: '4 min read',
    emoji: '🏠',
    color: 'from-green-500 to-emerald-600',
  },
  {
    id: 3,
    slug: 'sustainable-fashion-guide',
    category: 'Fashion',
    title: 'Your Guide to Sustainable Fashion Shopping',
    excerpt: 'How to build a wardrobe that looks great and doesn\'t cost the earth — literally.',
    author: 'Kavya Reddy',
    date: '2025-01-05',
    readTime: '6 min read',
    emoji: '👗',
    color: 'from-pink-500 to-rose-600',
  },
  {
    id: 4,
    slug: 'kitchen-essentials',
    category: 'Kitchen',
    title: '15 Kitchen Essentials Every Home Cook Needs',
    excerpt: 'Upgrade your cooking game with these chef-approved tools that won\'t break the bank.',
    author: 'Rohan Patel',
    date: '2024-12-28',
    readTime: '7 min read',
    emoji: '🍳',
    color: 'from-orange-500 to-amber-600',
  },
  {
    id: 5,
    slug: 'fitness-gear-2025',
    category: 'Sports & Fitness',
    title: 'Best Fitness Gear for Your Home Gym in 2025',
    excerpt: 'Skip the expensive gym membership — here\'s how to build an effective home gym on any budget.',
    author: 'Sneha Iyer',
    date: '2024-12-20',
    readTime: '5 min read',
    emoji: '⚽',
    color: 'from-purple-500 to-violet-600',
  },
  {
    id: 6,
    slug: 'smart-shopping-tips',
    category: 'Shopping Tips',
    title: 'How to Get the Best Deals Online Every Time',
    excerpt: 'Coupon stacking, price tracking, and timing your purchases — the insider\'s guide to smart shopping.',
    author: 'Vikram Das',
    date: '2024-12-15',
    readTime: '8 min read',
    emoji: '🛍️',
    color: 'from-cyan-500 to-teal-600',
  },
]

function PostCard({ post }) {
  return (
    <article className="card group hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden">
      {/* Header image/gradient */}
      <div className={`h-40 bg-gradient-to-br ${post.color} flex items-center justify-center`} aria-hidden="true">
        <span className="text-5xl select-none">{post.emoji}</span>
      </div>

      <div className="p-6">
        <span className="badge bg-primary-100 text-primary-700 text-xs mb-3 inline-flex">
          {post.category}
        </span>

        <h2 className="font-display font-bold text-gray-900 text-lg leading-snug line-clamp-2 group-hover:text-primary-600 transition-colors mb-2">
          {post.title}
        </h2>

        <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed mb-4">
          {post.excerpt}
        </p>

        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <User size={11} aria-hidden="true" /> {post.author}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={11} aria-hidden="true" /> {post.readTime}
            </span>
          </div>
          <time dateTime={post.date}>
            {new Date(post.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </time>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-50">
          {/* 
            When you add a real blog backend, replace this with:
            <Link to={`/blog/${post.slug}`} className="...">Read article</Link>
          */}
          <span className="text-sm font-semibold text-primary-600 flex items-center gap-1 group-hover:gap-2 transition-all">
            Read article <ArrowRight size={14} aria-hidden="true" />
          </span>
        </div>
      </div>
    </article>
  )
}

export default function BlogPage() {
  usePageMeta({
    title: 'Blog',
    description: 'Shopping guides, product reviews, and lifestyle tips from the ShopZen team.',
  })

  const featured = POSTS[0]
  const rest = POSTS.slice(1)

  return (
    <div className="container-custom py-12 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-12">
        <p className="text-sm font-semibold text-primary-500 uppercase tracking-widest mb-2">ShopZen Blog</p>
        <h1 className="font-display text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
          Stories & Guides
        </h1>
        <p className="text-gray-500 max-w-lg mx-auto leading-relaxed">
          Shopping tips, product deep-dives, and lifestyle inspiration from our team.
        </p>
      </div>

      {/* Featured post */}
      <article className="card group overflow-hidden mb-10 hover:shadow-xl transition-all duration-300">
        <div className={`relative h-56 lg:h-72 bg-gradient-to-br ${featured.color} flex items-center justify-center`} aria-hidden="true">
          <span className="text-8xl select-none">{featured.emoji}</span>
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute bottom-6 left-6">
            <span className="badge bg-white text-gray-900 text-xs font-semibold">{featured.category}</span>
          </div>
        </div>
        <div className="p-8">
          <h2 className="font-display text-2xl lg:text-3xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
            {featured.title}
          </h2>
          <p className="text-gray-500 leading-relaxed mb-5 max-w-2xl">{featured.excerpt}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-1.5"><User size={13} aria-hidden="true" /> {featured.author}</span>
              <span className="flex items-center gap-1.5"><Clock size={13} aria-hidden="true" /> {featured.readTime}</span>
              <time dateTime={featured.date}>
                {new Date(featured.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </time>
            </div>
            <span className="btn-primary !py-2 !px-5 !text-sm flex items-center gap-2">
              Read now <ArrowRight size={14} aria-hidden="true" />
            </span>
          </div>
        </div>
      </article>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {rest.map((post) => <PostCard key={post.id} post={post} />)}
      </div>

      {/* Newsletter CTA */}
      <div className="card p-8 lg:p-12 bg-gradient-to-r from-primary-500 to-orange-500 text-white text-center">
        <h2 className="font-display text-2xl lg:text-3xl font-bold mb-3">
          Stay in the loop
        </h2>
        <p className="text-white/80 mb-6 max-w-md mx-auto">
          Get the latest shopping guides and exclusive deals delivered to your inbox every week.
        </p>
        <form
          onSubmit={(e) => { e.preventDefault(); e.target.reset() }}
          className="flex gap-3 max-w-sm mx-auto"
          aria-label="Newsletter signup"
        >
          <label htmlFor="newsletter-email" className="sr-only">Email address</label>
          <input
            id="newsletter-email"
            type="email"
            placeholder="your@email.com"
            required
            className="flex-1 px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
          />
          <button type="submit" className="bg-white text-primary-600 font-semibold px-5 py-3 rounded-xl hover:bg-gray-50 transition-colors whitespace-nowrap">
            Subscribe
          </button>
        </form>
        <p className="text-white/60 text-xs mt-3">No spam. Unsubscribe anytime.</p>
      </div>
    </div>
  )
}
