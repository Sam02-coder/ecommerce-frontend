import { useState, useCallback } from 'react'
import { User, MapPin, Lock, Plus, Trash2, CheckCircle, Eye, EyeOff, Save } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '../store/authStore'
import { addressAPI } from '../services/api'
import { usePageMeta } from '../hooks/useMeta'
import ConfirmDialog from '../components/common/ConfirmDialog'
import toast from 'react-hot-toast'
import api from '../services/api'

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'addresses', label: 'Addresses', icon: MapPin },
  { id: 'security', label: 'Security', icon: Lock },
]

const EMPTY_ADDRESS = {
  fullName: '', phone: '', addressLine1: '', addressLine2: '',
  city: '', state: '', postalCode: '', country: 'India', defaultAddress: false,
}

export default function AccountPage() {
  usePageMeta({ title: 'My Account', description: 'Manage your ShopZen account, addresses, and security settings.' })

  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState('profile')

  // --- Address state ---
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [newAddress, setNewAddress] = useState(EMPTY_ADDRESS)
  const [addressLoading, setAddressLoading] = useState(false)

  // --- Confirm dialog state ---
  const [confirmDialog, setConfirmDialog] = useState(null) // { id, message }

  // --- Password state ---
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' })
  const [showPasswords, setShowPasswords] = useState({ current: false, newPass: false, confirm: false })
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordErrors, setPasswordErrors] = useState({})

  const { data, refetch } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => addressAPI.getAll(),
  })

  const addresses = data?.data?.data || []

  const handleSaveAddress = async (e) => {
    e.preventDefault()
    setAddressLoading(true)
    try {
      await addressAPI.create(newAddress)
      toast.success('Address saved!')
      refetch()
      setShowAddressForm(false)
      setNewAddress(EMPTY_ADDRESS)
    } catch {
      // Error toast handled by API interceptor
    } finally {
      setAddressLoading(false)
    }
  }

  const handleDeleteConfirm = useCallback((id) => {
    setConfirmDialog({ id, message: 'This address will be permanently removed from your account.' })
  }, [])

  const handleDeleteAddress = async () => {
    if (!confirmDialog?.id) return
    try {
      await addressAPI.delete(confirmDialog.id)
      toast.success('Address removed')
      refetch()
    } catch {
      // Error toast handled by API interceptor
    } finally {
      setConfirmDialog(null)
    }
  }

  const validatePasswords = () => {
    const errors = {}
    if (!passwords.current) errors.current = 'Current password is required'
    if (passwords.newPass.length < 8) errors.newPass = 'Must be at least 8 characters'
    if (passwords.newPass !== passwords.confirm) errors.confirm = 'Passwords do not match'
    return errors
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    const errors = validatePasswords()
    if (Object.keys(errors).length > 0) { setPasswordErrors(errors); return }

    setPasswordLoading(true)
    setPasswordErrors({})
    try {
      await api.put('/auth/change-password', {
        currentPassword: passwords.current,
        newPassword: passwords.newPass,
      })
      toast.success('Password updated successfully!')
      setPasswords({ current: '', newPass: '', confirm: '' })
    } catch {
      // Error toast handled by API interceptor
    } finally {
      setPasswordLoading(false)
    }
  }

  const updateAddr = useCallback((field) => (e) => {
    setNewAddress((prev) => ({ ...prev, [field]: e.target.value }))
  }, [])

  return (
    <div className="container-custom py-8 animate-fade-in max-w-4xl">
      <h1 className="section-title mb-8">My Account</h1>

      <div className="flex gap-6 flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="md:w-56 shrink-0" aria-label="Account sections">
          <div className="card p-4 space-y-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                aria-selected={activeTab === tab.id}
                role="tab"
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400 ${
                  activeTab === tab.id ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <tab.icon size={16} aria-hidden="true" /> {tab.label}
              </button>
            ))}
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1">

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="card p-6 animate-fade-in">
              <h2 className="font-display font-semibold text-gray-900 mb-5">Profile Information</h2>
              <div className="flex items-center gap-5 mb-6">
                <div
                  className="w-20 h-20 bg-primary-100 rounded-2xl flex items-center justify-center"
                  aria-hidden="true"
                >
                  <span className="font-display text-3xl font-bold text-primary-600">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </span>
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold text-gray-900">{user?.firstName} {user?.lastName}</h3>
                  <p className="text-gray-500 text-sm">{user?.email}</p>
                  <span className="badge bg-primary-100 text-primary-700 text-xs mt-1 capitalize">{user?.role?.toLowerCase()}</span>
                </div>
              </div>
              <dl className="grid grid-cols-2 gap-4 text-sm">
                {[
                  { label: 'First Name', value: user?.firstName },
                  { label: 'Last Name', value: user?.lastName },
                  { label: 'Email', value: user?.email },
                  { label: 'Phone', value: user?.phone },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-3">
                    <dt className="text-xs text-gray-400 mb-1">{label}</dt>
                    <dd className="font-medium text-gray-900">{value || '—'}</dd>
                  </div>
                ))}
              </dl>
              <p className="text-xs text-gray-400 mt-4">
                To update profile details, please contact support.
              </p>
            </div>
          )}

          {/* Addresses Tab */}
          {activeTab === 'addresses' && (
            <div className="animate-fade-in space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display font-semibold text-gray-900">Saved Addresses</h2>
                <button
                  onClick={() => setShowAddressForm(!showAddressForm)}
                  className="btn-primary !py-2 !px-4 !text-sm flex items-center gap-1"
                  aria-expanded={showAddressForm}
                >
                  <Plus size={15} aria-hidden="true" /> Add Address
                </button>
              </div>

              {showAddressForm && (
                <div className="card p-5 animate-slide-up">
                  <h3 className="font-semibold text-gray-900 text-sm mb-3">New Address</h3>
                  <form onSubmit={handleSaveAddress} className="space-y-3" noValidate>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="addr-name" className="sr-only">Full Name</label>
                        <input id="addr-name" className="input-field !text-sm" placeholder="Full Name" value={newAddress.fullName} onChange={updateAddr('fullName')} required />
                      </div>
                      <div>
                        <label htmlFor="addr-phone" className="sr-only">Phone</label>
                        <input id="addr-phone" className="input-field !text-sm" placeholder="Phone" type="tel" value={newAddress.phone} onChange={updateAddr('phone')} required />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="addr-line1" className="sr-only">Address Line 1</label>
                      <input id="addr-line1" className="input-field !text-sm" placeholder="Address Line 1" value={newAddress.addressLine1} onChange={updateAddr('addressLine1')} required />
                    </div>
                    <div>
                      <label htmlFor="addr-line2" className="sr-only">Address Line 2 (optional)</label>
                      <input id="addr-line2" className="input-field !text-sm" placeholder="Address Line 2 (optional)" value={newAddress.addressLine2} onChange={updateAddr('addressLine2')} />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label htmlFor="addr-city" className="sr-only">City</label>
                        <input id="addr-city" className="input-field !text-sm" placeholder="City" value={newAddress.city} onChange={updateAddr('city')} required />
                      </div>
                      <div>
                        <label htmlFor="addr-state" className="sr-only">State</label>
                        <input id="addr-state" className="input-field !text-sm" placeholder="State" value={newAddress.state} onChange={updateAddr('state')} required />
                      </div>
                      <div>
                        <label htmlFor="addr-pin" className="sr-only">Postal Code</label>
                        <input id="addr-pin" className="input-field !text-sm" placeholder="PIN Code" value={newAddress.postalCode} onChange={updateAddr('postalCode')} required pattern="\d{6}" />
                      </div>
                    </div>
                    <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newAddress.defaultAddress}
                        onChange={(e) => setNewAddress((p) => ({ ...p, defaultAddress: e.target.checked }))}
                        className="accent-primary-500"
                      />
                      Set as default address
                    </label>
                    <div className="flex gap-2">
                      <button type="submit" disabled={addressLoading} className="btn-primary !py-2 !px-5 !text-sm flex items-center gap-1">
                        <Save size={14} aria-hidden="true" /> {addressLoading ? 'Saving...' : 'Save'}
                      </button>
                      <button type="button" onClick={() => setShowAddressForm(false)} className="btn-secondary !py-2 !px-5 !text-sm">Cancel</button>
                    </div>
                  </form>
                </div>
              )}

              {addresses.length === 0 ? (
                <div className="card p-10 text-center">
                  <MapPin size={40} className="mx-auto text-gray-200 mb-3" aria-hidden="true" />
                  <p className="text-gray-500">No saved addresses yet</p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {addresses.map((addr) => (
                    <li key={addr.id} className="card p-5 flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 bg-primary-50 rounded-xl flex items-center justify-center shrink-0" aria-hidden="true">
                          <MapPin size={16} className="text-primary-500" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm text-gray-900">{addr.fullName}</span>
                            {addr.defaultAddress && (
                              <span className="badge bg-green-100 text-green-700 text-xs gap-1">
                                <CheckCircle size={10} aria-hidden="true" /> Default
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">{addr.phone}</p>
                          <p className="text-sm text-gray-600 mt-0.5">
                            {addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''}<br />
                            {addr.city}, {addr.state} — {addr.postalCode}, {addr.country}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteConfirm(addr.id)}
                        aria-label={`Remove ${addr.fullName}'s address`}
                        className="text-gray-300 hover:text-red-400 transition-colors focus:outline-none focus:text-red-400"
                      >
                        <Trash2 size={16} aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="card p-6 animate-fade-in">
              <h2 className="font-display font-semibold text-gray-900 mb-5">Change Password</h2>
              <form onSubmit={handleChangePassword} className="space-y-4 max-w-md" noValidate>
                {[
                  { id: 'current', label: 'Current Password', key: 'current' },
                  { id: 'newPass', label: 'New Password', key: 'newPass' },
                  { id: 'confirm', label: 'Confirm New Password', key: 'confirm' },
                ].map(({ id, label, key }) => (
                  <div key={id}>
                    <label htmlFor={`pwd-${id}`} className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
                    <div className="relative">
                      <input
                        id={`pwd-${id}`}
                        type={showPasswords[key] ? 'text' : 'password'}
                        value={passwords[key]}
                        onChange={(e) => setPasswords((p) => ({ ...p, [key]: e.target.value }))}
                        className={`input-field pr-10 ${passwordErrors[key] ? 'border-red-300 focus:ring-red-400' : ''}`}
                        placeholder="••••••••"
                        autoComplete={key === 'current' ? 'current-password' : 'new-password'}
                        aria-describedby={passwordErrors[key] ? `err-${key}` : undefined}
                        aria-invalid={!!passwordErrors[key]}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords((p) => ({ ...p, [key]: !p[key] }))}
                        aria-label={showPasswords[key] ? 'Hide password' : 'Show password'}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords[key] ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
                      </button>
                    </div>
                    {passwordErrors[key] && (
                      <p id={`err-${key}`} className="text-xs text-red-500 mt-1" role="alert">{passwordErrors[key]}</p>
                    )}
                  </div>
                ))}
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="btn-primary !text-sm flex items-center gap-2"
                >
                  <Save size={15} aria-hidden="true" />
                  {passwordLoading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Confirm delete dialog */}
      <ConfirmDialog
        open={!!confirmDialog}
        title="Remove Address"
        message={confirmDialog?.message}
        confirmLabel="Remove"
        variant="danger"
        onConfirm={handleDeleteAddress}
        onCancel={() => setConfirmDialog(null)}
      />
    </div>
  )
}
