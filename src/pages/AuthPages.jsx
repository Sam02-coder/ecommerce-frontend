import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, AlertCircle } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { usePageMeta } from '../hooks/useMeta'

// Shared input with icon
function InputWithIcon({ icon: Icon, label, id, error, ...props }) {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <Icon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
        <input
          id={id}
          {...props}
          className={`input-field pl-10 ${props.className || ''} ${error ? 'border-red-300 focus:ring-red-400' : ''}`}
          aria-describedby={error ? `${id}-error` : undefined}
          aria-invalid={!!error}
        />
      </div>
      {error && (
        <p id={`${id}-error`} className="text-xs text-red-500 mt-1 flex items-center gap-1" role="alert">
          <AlertCircle size={11} aria-hidden="true" /> {error}
        </p>
      )}
    </div>
  )
}

// Shared error banner
function ErrorBanner({ message }) {
  if (!message) return null
  return (
    <div
      className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-5 flex items-start gap-2"
      role="alert"
      aria-live="assertive"
    >
      <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </div>
  )
}

// Shared logo / page header
function AuthHeader({ title, subtitle }) {
  return (
    <div className="text-center mb-8">
      <Link to="/" className="inline-flex items-center gap-2 mb-6" aria-label="ShopZen — go to homepage">
        <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center" aria-hidden="true">
          <span className="text-white font-display font-bold text-xl">S</span>
        </div>
        <span className="font-display text-2xl font-bold text-gray-900">ShopZen</span>
      </Link>
      <h1 className="font-display text-3xl font-bold text-gray-900">{title}</h1>
      <p className="text-gray-500 mt-2">{subtitle}</p>
    </div>
  )
}

// ─── Login ────────────────────────────────────────────────────────────────────
export function LoginPage() {
  usePageMeta({ title: 'Sign In', description: 'Sign in to your ShopZen account.' })

  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuthStore()

  const [form, setForm] = useState({ email: '', password: '' })
  const [fieldErrors, setFieldErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const from = location.state?.from?.pathname || '/'

  const validate = () => {
    const errors = {}
    if (!form.email.trim()) errors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) errors.email = 'Enter a valid email address'
    if (!form.password) errors.password = 'Password is required'
    return errors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errors = validate()
    if (Object.keys(errors).length > 0) { setFieldErrors(errors); return }
    setFieldErrors({})
    setLoading(true)
    setError('')
    try {
      await login(form)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const update = (field) => (e) => {
    setForm((p) => ({ ...p, [field]: e.target.value }))
    if (fieldErrors[field]) setFieldErrors((p) => ({ ...p, [field]: '' }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50/30 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md animate-scale-in">
        <AuthHeader title="Welcome back" subtitle="Sign in to your account to continue" />

        <div className="card p-8">
          <ErrorBanner message={error} />

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <InputWithIcon
              icon={Mail}
              id="login-email"
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={update('email')}
              error={fieldErrors.email}
              autoComplete="email"
              required
            />

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="login-password" className="text-sm font-medium text-gray-700">Password</label>
                <Link to="/forgot-password" className="text-sm text-primary-600 hover:underline focus:outline-none focus:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={update('password')}
                  className={`input-field pl-10 pr-10 ${fieldErrors.password ? 'border-red-300 focus:ring-red-400' : ''}`}
                  autoComplete="current-password"
                  required
                  aria-describedby={fieldErrors.password ? 'login-password-error' : undefined}
                  aria-invalid={!!fieldErrors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p id="login-password-error" className="text-xs text-red-500 mt-1 flex items-center gap-1" role="alert">
                  <AlertCircle size={11} aria-hidden="true" /> {fieldErrors.password}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              aria-busy={loading}
              className="w-full btn-primary flex items-center justify-center gap-2 !py-3.5"
            >
              {loading
                ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true" /> Signing in…</>
                : <><span>Sign In</span><ArrowRight size={16} aria-hidden="true" /></>
              }
            </button>
          </form>

        </div>

        <p className="text-center text-sm text-gray-500 mt-5">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-600 font-semibold hover:underline focus:outline-none focus:underline">
            Sign up for free
          </Link>
        </p>
      </div>
    </div>
  )
}

// ─── Register ─────────────────────────────────────────────────────────────────
export function RegisterPage() {
  usePageMeta({ title: 'Create Account', description: 'Create your free ShopZen account and start shopping.' })

  const navigate = useNavigate()
  const { register } = useAuthStore()

  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', phone: '' })
  const [fieldErrors, setFieldErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [passwordStrength, setPasswordStrength] = useState(0) // 0–4

  const getPasswordStrength = (pwd) => {
    let score = 0
    if (pwd.length >= 8) score++
    if (/[A-Z]/.test(pwd)) score++
    if (/[0-9]/.test(pwd)) score++
    if (/[^A-Za-z0-9]/.test(pwd)) score++
    return score
  }

  const validate = () => {
    const errors = {}
    if (!form.firstName.trim()) errors.firstName = 'First name is required'
    if (!form.lastName.trim()) errors.lastName = 'Last name is required'
    if (!form.email.trim()) errors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) errors.email = 'Enter a valid email address'
    if (!form.phone.trim()) errors.phone = 'Phone number is required'
    else if (!/^\d{10}$/.test(form.phone.replace(/\s/g, ''))) errors.phone = 'Enter a valid 10-digit number'
    if (form.password.length < 8) errors.password = 'Password must be at least 8 characters'
    return errors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errors = validate()
    if (Object.keys(errors).length > 0) { setFieldErrors(errors); return }
    setFieldErrors({})
    setLoading(true)
    setError('')
    try {
      await register(form)
      navigate('/')
    } catch (err) {
      const errData = err.response?.data?.data
      if (errData && typeof errData === 'object') {
        setFieldErrors(errData)
      } else {
        setError(err.response?.data?.message || 'Registration failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const update = (field) => (e) => {
    const value = e.target.value
    setForm((p) => ({ ...p, [field]: value }))
    if (field === 'password') setPasswordStrength(getPasswordStrength(value))
    if (fieldErrors[field]) setFieldErrors((p) => ({ ...p, [field]: '' }))
  }

  const strengthColors = ['bg-gray-200', 'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-500']
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong']

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50/30 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md animate-scale-in">
        <AuthHeader title="Create account" subtitle="Join thousands of happy shoppers" />

        <div className="card p-8">
          <ErrorBanner message={error} />

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="grid grid-cols-2 gap-3">
              <InputWithIcon
                icon={User}
                id="reg-firstName"
                label="First Name"
                type="text"
                placeholder="John"
                value={form.firstName}
                onChange={update('firstName')}
                error={fieldErrors.firstName}
                autoComplete="given-name"
                required
              />
              <InputWithIcon
                icon={User}
                id="reg-lastName"
                label="Last Name"
                type="text"
                placeholder="Doe"
                value={form.lastName}
                onChange={update('lastName')}
                error={fieldErrors.lastName}
                autoComplete="family-name"
                required
              />
            </div>

            <InputWithIcon
              icon={Mail}
              id="reg-email"
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={update('email')}
              error={fieldErrors.email}
              autoComplete="email"
              required
            />

            <InputWithIcon
              icon={Phone}
              id="reg-phone"
              label="Phone Number"
              type="tel"
              placeholder="10-digit mobile number"
              value={form.phone}
              onChange={update('phone')}
              error={fieldErrors.phone}
              autoComplete="tel"
              required
            />

            <div>
              <label htmlFor="reg-password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimum 8 characters"
                  value={form.password}
                  onChange={update('password')}
                  className={`input-field pl-10 pr-10 ${fieldErrors.password ? 'border-red-300 focus:ring-red-400' : ''}`}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  aria-describedby="password-strength reg-password-error"
                  aria-invalid={!!fieldErrors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
                </button>
              </div>

              {/* Password strength meter */}
              {form.password && (
                <div className="mt-2" id="password-strength" aria-live="polite" aria-label={`Password strength: ${strengthLabels[passwordStrength]}`}>
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${i <= passwordStrength ? strengthColors[passwordStrength] : 'bg-gray-200'}`}
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-400" aria-hidden="true">
                    Strength: <span className="font-medium">{strengthLabels[passwordStrength] || 'Too short'}</span>
                  </p>
                </div>
              )}

              {fieldErrors.password && (
                <p id="reg-password-error" className="text-xs text-red-500 mt-1 flex items-center gap-1" role="alert">
                  <AlertCircle size={11} aria-hidden="true" /> {fieldErrors.password}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              aria-busy={loading}
              className="w-full btn-primary !py-3.5 flex items-center justify-center gap-2"
            >
              {loading
                ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true" /> Creating account…</>
                : <><span>Create Account</span><ArrowRight size={16} aria-hidden="true" /></>
              }
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 font-semibold hover:underline focus:outline-none focus:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
