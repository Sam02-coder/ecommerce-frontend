import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, CheckCircle, AlertCircle, Lock, Eye, EyeOff } from 'lucide-react'
import { usePageMeta } from '../hooks/useMeta'
import { authAPI } from '../services/api'

// ── Forgot Password ───────────────────────────────────────────────────────────
export function ForgotPasswordPage() {
  usePageMeta({ title: 'Forgot Password', description: 'Reset your ShopZen account password.' })

  const [email, setEmail]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [sent, setSent]         = useState(false)
  const [error, setError]       = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) { setError('Please enter your email address'); return }
    if (!/\S+@\S+\.\S+/.test(email)) { setError('Enter a valid email address'); return }

    setLoading(true)
    setError('')
    try {
      await authAPI.forgotPassword({ email: email.trim() })
      setSent(true)
    } catch {
      // Show success even on error — prevents email enumeration attacks
      setSent(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50/30 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md animate-scale-in">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6" aria-label="ShopZen home">
            <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center" aria-hidden="true">
              <span className="text-white font-display font-bold text-xl">S</span>
            </div>
            <span className="font-display text-2xl font-bold text-gray-900">ShopZen</span>
          </Link>
        </div>

        <div className="card p-8">
          {sent ? (
            /* Success state */
            <div className="text-center animate-fade-in">
              <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <CheckCircle size={30} className="text-green-500" aria-hidden="true" />
              </div>
              <h1 className="font-display text-2xl font-bold text-gray-900 mb-2">Check your inbox</h1>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                If an account exists for <strong className="text-gray-900">{email}</strong>, we've sent a password reset link. It expires in 30 minutes.
              </p>
              <p className="text-xs text-gray-400 mb-6">
                Didn't receive it? Check your spam folder or{' '}
                <button
                  onClick={() => { setSent(false) }}
                  className="text-primary-600 hover:underline focus:outline-none focus:underline"
                >
                  try again
                </button>.
              </p>
              <Link to="/login" className="btn-primary w-full flex items-center justify-center gap-2">
                <ArrowLeft size={16} aria-hidden="true" /> Back to Sign In
              </Link>
            </div>
          ) : (
            /* Form state */
            <>
              <h1 className="font-display text-2xl font-bold text-gray-900 mb-1">Forgot password?</h1>
              <p className="text-gray-500 text-sm mb-6">
                Enter the email address you registered with and we'll send you a reset link.
              </p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-5 flex items-center gap-2" role="alert" aria-live="assertive">
                  <AlertCircle size={15} aria-hidden="true" />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <div>
                  <label htmlFor="forgot-email" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
                    <input
                      id="forgot-email"
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError('') }}
                      placeholder="you@example.com"
                      className={`input-field pl-10 ${error ? 'border-red-300 focus:ring-red-400' : ''}`}
                      autoComplete="email"
                      autoFocus
                      required
                      aria-describedby={error ? 'forgot-error' : undefined}
                      aria-invalid={!!error}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  aria-busy={loading}
                  className="w-full btn-primary !py-3.5 flex items-center justify-center gap-2"
                >
                  {loading
                    ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true" /> Sending…</>
                    : 'Send Reset Link'
                  }
                </button>
              </form>
            </>
          )}
        </div>

        <div className="text-center mt-5">
          <Link
            to="/login"
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center justify-center gap-1 focus:outline-none focus:underline"
          >
            <ArrowLeft size={14} aria-hidden="true" /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}

// ── Reset Password (token from email link) ────────────────────────────────────
export function ResetPasswordPage() {
  usePageMeta({ title: 'Reset Password' })

  const [form, setForm]         = useState({ password: '', confirm: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [done, setDone]         = useState(false)
  const [errors, setErrors]     = useState({})

  // Extract token from URL: /reset-password?token=abc123
  const token = new URLSearchParams(window.location.search).get('token')

  const validate = () => {
    const e = {}
    if (form.password.length < 8)             e.password = 'Password must be at least 8 characters'
    if (form.password !== form.confirm)        e.confirm  = 'Passwords do not match'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    if (!token) { setErrors({ password: 'Invalid or expired reset link. Please request a new one.' }); return }

    setLoading(true)
    try {
      await authAPI.resetPassword({ token, newPassword: form.password })
      setDone(true)
    } catch {
      setErrors({ password: 'This reset link has expired or already been used. Please request a new one.' })
    } finally {
      setLoading(false)
    }
  }

  const update = (field) => (e) => {
    setForm((p) => ({ ...p, [field]: e.target.value }))
    if (errors[field]) setErrors((p) => ({ ...p, [field]: '' }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50/30 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md animate-scale-in">

        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6" aria-label="ShopZen home">
            <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center" aria-hidden="true">
              <span className="text-white font-display font-bold text-xl">S</span>
            </div>
            <span className="font-display text-2xl font-bold text-gray-900">ShopZen</span>
          </Link>
        </div>

        <div className="card p-8">
          {done ? (
            <div className="text-center animate-fade-in">
              <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <CheckCircle size={30} className="text-green-500" aria-hidden="true" />
              </div>
              <h1 className="font-display text-2xl font-bold text-gray-900 mb-2">Password updated!</h1>
              <p className="text-gray-500 text-sm mb-6">Your password has been reset. You can now sign in with your new password.</p>
              <Link to="/login" className="btn-primary w-full flex items-center justify-center gap-2">
                Sign In
              </Link>
            </div>
          ) : (
            <>
              <h1 className="font-display text-2xl font-bold text-gray-900 mb-1">Set new password</h1>
              <p className="text-gray-500 text-sm mb-6">Choose a strong password of at least 8 characters.</p>

              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                {[
                  { id: 'rp-password', field: 'password', label: 'New Password',      autocomplete: 'new-password' },
                  { id: 'rp-confirm',  field: 'confirm',  label: 'Confirm Password',   autocomplete: 'new-password' },
                ].map(({ id, field, label, autocomplete }) => (
                  <div key={id}>
                    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
                      <input
                        id={id}
                        type={showPass ? 'text' : 'password'}
                        value={form[field]}
                        onChange={update(field)}
                        className={`input-field pl-10 pr-10 ${errors[field] ? 'border-red-300 focus:ring-red-400' : ''}`}
                        placeholder="••••••••"
                        autoComplete={autocomplete}
                        required
                        minLength={8}
                        aria-describedby={errors[field] ? `${id}-error` : undefined}
                        aria-invalid={!!errors[field]}
                      />
                      {field === 'password' && (
                        <button
                          type="button"
                          onClick={() => setShowPass((s) => !s)}
                          aria-label={showPass ? 'Hide password' : 'Show password'}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                        >
                          {showPass ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
                        </button>
                      )}
                    </div>
                    {errors[field] && (
                      <p id={`${id}-error`} className="text-xs text-red-500 mt-1 flex items-center gap-1" role="alert">
                        <AlertCircle size={11} aria-hidden="true" /> {errors[field]}
                      </p>
                    )}
                  </div>
                ))}

                <button
                  type="submit"
                  disabled={loading}
                  aria-busy={loading}
                  className="w-full btn-primary !py-3.5 flex items-center justify-center gap-2"
                >
                  {loading
                    ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true" /> Updating…</>
                    : 'Set New Password'
                  }
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
