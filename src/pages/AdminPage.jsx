import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  LayoutDashboard, Package, ShoppingBag, Tag,
  TrendingUp, AlertTriangle, ChevronRight, Trash2, Edit2,
} from 'lucide-react'
import { productAPI, orderAPI, categoryAPI } from '../services/api'
import { formatCurrency, formatDate, ORDER_STATUS } from '../utils/helpers'
import { PageLoader } from '../components/common/Skeleton'
import { usePageMeta } from '../hooks/useMeta'
import ConfirmDialog from '../components/common/ConfirmDialog'
import toast from 'react-hot-toast'

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'orders', label: 'Orders', icon: ShoppingBag },
  { id: 'categories', label: 'Categories', icon: Tag },
]

export default function AdminPage() {
  usePageMeta({ title: 'Admin Panel' })

  const [activeTab, setActiveTab] = useState('dashboard')
  const [orderPage, setOrderPage] = useState(0)
  const [productPage, setProductPage] = useState(0)
  const [confirmDialog, setConfirmDialog] = useState(null)

  const { data: ordersData, isLoading: ordersLoading, refetch: refetchOrders } = useQuery({
    queryKey: ['admin-orders', orderPage],
    queryFn: () => orderAPI.adminGetAll({ page: orderPage, size: 15 }),
  })

  const { data: productsData, refetch: refetchProducts } = useQuery({
    queryKey: ['admin-products', productPage],
    queryFn: () => productAPI.getAll({ page: productPage, size: 15, sortBy: 'createdAt', sortDir: 'desc' }),
  })

  const { data: categoriesData, refetch: refetchCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryAPI.getAll(),
  })

  const orders = ordersData?.data?.data?.content || []
  const products = productsData?.data?.data?.content || []
  const categories = categoriesData?.data?.data || []
  const totalOrders = ordersData?.data?.data?.totalElements || 0
  const totalOrderPages = ordersData?.data?.data?.totalPages || 0
  const totalProducts = productsData?.data?.data?.totalElements || 0
  const totalProductPages = productsData?.data?.data?.totalPages || 0

  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)
  const pendingOrders = orders.filter((o) => o.status === 'PENDING').length

  const handleStatusUpdate = async (orderId, status) => {
    try {
      await orderAPI.adminUpdateStatus(orderId, { status })
      toast.success('Order status updated')
      refetchOrders()
    } catch {
      // Error toast handled by API interceptor
    }
  }

  const showDeactivateConfirm = useCallback((id, name) => {
    setConfirmDialog({
      type: 'product',
      id,
      title: 'Deactivate Product',
      message: `"${name}" will be hidden from the store. You can reactivate it later.`,
      confirmLabel: 'Deactivate',
      variant: 'warning',
    })
  }, [])

  const showDeleteCategoryConfirm = useCallback((id, name) => {
    setConfirmDialog({
      type: 'category',
      id,
      title: 'Delete Category',
      message: `Deleting "${name}" may affect products assigned to it. This cannot be undone.`,
      confirmLabel: 'Delete',
      variant: 'danger',
    })
  }, [])

  const handleConfirmAction = async () => {
    if (!confirmDialog) return
    const { type, id } = confirmDialog
    try {
      if (type === 'product') {
        await productAPI.delete(id)
        toast.success('Product deactivated')
        refetchProducts()
      } else if (type === 'category') {
        await categoryAPI.delete(id)
        toast.success('Category deleted')
        refetchCategories()
      }
    } catch {
      // Error toast handled by API interceptor
    } finally {
      setConfirmDialog(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 animate-fade-in">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-100 min-h-screen sticky top-16 hidden lg:block" aria-label="Admin navigation">
          <div className="p-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Admin Panel</p>
            <nav className="space-y-1">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  aria-current={activeTab === tab.id ? 'page' : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400 ${
                    activeTab === tab.id ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <tab.icon size={17} aria-hidden="true" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Mobile tabs */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 flex" aria-label="Admin navigation">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              aria-current={activeTab === tab.id ? 'page' : undefined}
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors focus:outline-none ${
                activeTab === tab.id ? 'text-primary-600' : 'text-gray-400'
              }`}
            >
              <tab.icon size={18} aria-hidden="true" />
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Main content */}
        <main className="flex-1 p-6 lg:p-8 pb-24 lg:pb-8">

          {/* Dashboard */}
          {activeTab === 'dashboard' && (
            <div className="animate-fade-in">
              <h1 className="section-title mb-8">Dashboard</h1>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                {[
                  { label: 'Total Orders', value: totalOrders, icon: ShoppingBag, color: 'bg-blue-50 text-blue-600', change: '+12%' },
                  { label: 'Total Revenue', value: formatCurrency(totalRevenue), icon: TrendingUp, color: 'bg-green-50 text-green-600', change: '+8.2%' },
                  { label: 'Total Products', value: totalProducts, icon: Package, color: 'bg-purple-50 text-purple-600', change: '+3' },
                  { label: 'Pending Orders', value: pendingOrders, icon: AlertTriangle, color: 'bg-orange-50 text-orange-600', change: '-2' },
                ].map(({ label, value, icon: Icon, color, change }) => (
                  <div key={label} className="card p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-medium text-gray-400 mb-1">{label}</p>
                        <p className="font-display text-2xl font-bold text-gray-900">{value}</p>
                        <p className={`text-xs font-medium mt-1 ${change.startsWith('+') ? 'text-green-600' : 'text-red-500'}`}>
                          {change} this week
                        </p>
                      </div>
                      <div className={`${color} p-2.5 rounded-xl`} aria-hidden="true"><Icon size={18} /></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent Orders */}
              <div className="card">
                <div className="flex items-center justify-between p-5 border-b border-gray-50">
                  <h2 className="font-display font-semibold text-gray-900">Recent Orders</h2>
                  <button onClick={() => setActiveTab('orders')} className="text-sm text-primary-600 font-medium flex items-center gap-1 hover:gap-2 transition-all">
                    View all <ChevronRight size={14} aria-hidden="true" />
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm" aria-label="Recent orders">
                    <thead className="bg-gray-50">
                      <tr>
                        {['Order', 'Date', 'Status', 'Total', 'Update'].map((h) => (
                          <th key={h} scope="col" className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {orders.slice(0, 7).map((order) => {
                        const s = ORDER_STATUS[order.status] || {}
                        return (
                          <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-5 py-3.5 font-medium text-gray-900">{order.orderNumber}</td>
                            <td className="px-5 py-3.5 text-gray-500">{formatDate(order.createdAt)}</td>
                            <td className="px-5 py-3.5">
                              <span className={`badge ${s.color}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${s.dot} mr-1.5`} aria-hidden="true" />
                                {s.label}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 font-semibold">{formatCurrency(order.totalAmount)}</td>
                            <td className="px-5 py-3.5">
                              <label htmlFor={`status-${order.id}`} className="sr-only">Update status for order {order.orderNumber}</label>
                              <select
                                id={`status-${order.id}`}
                                value={order.status}
                                onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                                className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary-300"
                              >
                                {Object.entries(ORDER_STATUS).map(([k, v]) => (
                                  <option key={k} value={k}>{v.label}</option>
                                ))}
                              </select>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <div className="animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <h1 className="section-title">Products</h1>
                <Link to="/admin/products/new" className="btn-primary !py-2 !px-4 !text-sm">+ Add Product</Link>
              </div>
              <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm" aria-label="Products list">
                    <thead className="bg-gray-50">
                      <tr>
                        {['Product', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map((h) => (
                          <th key={h} scope="col" className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {products.map((p) => (
                        <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <img
                                src={p.images?.[0]?.url || ''}
                                alt=""
                                className="w-10 h-10 rounded-lg object-cover bg-gray-100"
                                onError={(e) => { e.target.style.display = 'none' }}
                              />
                              <div>
                                <p className="font-medium text-gray-900 max-w-[200px] truncate">{p.name}</p>
                                <p className="text-xs text-gray-400">{p.sku}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-gray-500">{p.category?.name || '—'}</td>
                          <td className="px-5 py-3.5 font-semibold text-gray-900">{formatCurrency(p.price)}</td>
                          <td className="px-5 py-3.5">
                            <span className={`font-medium ${p.stockQuantity === 0 ? 'text-red-500' : p.stockQuantity <= 5 ? 'text-orange-500' : 'text-green-600'}`}>
                              {p.stockQuantity}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`badge ${p.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                              {p.active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <Link to={`/admin/products/edit/${p.id}`} className="text-blue-600 hover:text-blue-800 transition-colors" aria-label={`Edit ${p.name}`}>
                                <Edit2 size={14} />
                              </Link>
                              <button
                                onClick={() => showDeactivateConfirm(p.id, p.name)}
                                className="text-gray-400 hover:text-red-500 transition-colors focus:outline-none"
                                aria-label={`Deactivate ${p.name}`}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {totalProductPages > 1 && (
                  <div className="flex justify-center gap-2 p-4 border-t border-gray-50">
                    <button disabled={productPage === 0} onClick={() => setProductPage((p) => p - 1)} className="btn-secondary !py-1.5 !px-3 !text-xs disabled:opacity-40">Prev</button>
                    <span className="text-sm text-gray-500 self-center">Page {productPage + 1} / {totalProductPages}</span>
                    <button disabled={productPage >= totalProductPages - 1} onClick={() => setProductPage((p) => p + 1)} className="btn-secondary !py-1.5 !px-3 !text-xs disabled:opacity-40">Next</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="animate-fade-in">
              <h1 className="section-title mb-6">All Orders</h1>
              {ordersLoading ? <PageLoader /> : (
                <div className="card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm" aria-label="All orders">
                      <thead className="bg-gray-50">
                        <tr>
                          {['Order #', 'Date', 'Customer', 'Items', 'Status', 'Total', 'Update Status'].map((h) => (
                            <th key={h} scope="col" className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {orders.map((order) => {
                          const s = ORDER_STATUS[order.status] || {}
                          return (
                            <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-5 py-3.5 font-medium text-gray-900">{order.orderNumber}</td>
                              <td className="px-5 py-3.5 text-gray-500 whitespace-nowrap">{formatDate(order.createdAt)}</td>
                              <td className="px-5 py-3.5 text-gray-700">{order.shippingAddress?.fullName || '—'}</td>
                              <td className="px-5 py-3.5 text-gray-500">{order.items?.length}</td>
                              <td className="px-5 py-3.5">
                                <span className={`badge ${s.color}`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${s.dot} mr-1.5`} aria-hidden="true" />
                                  {s.label}
                                </span>
                              </td>
                              <td className="px-5 py-3.5 font-semibold">{formatCurrency(order.totalAmount)}</td>
                              <td className="px-5 py-3.5">
                                <label htmlFor={`order-status-${order.id}`} className="sr-only">Update status for {order.orderNumber}</label>
                                <select
                                  id={`order-status-${order.id}`}
                                  value={order.status}
                                  onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                                  className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary-300"
                                >
                                  {Object.entries(ORDER_STATUS).map(([k, v]) => (
                                    <option key={k} value={k}>{v.label}</option>
                                  ))}
                                </select>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                  {totalOrderPages > 1 && (
                    <div className="flex justify-center gap-2 p-4 border-t border-gray-50">
                      <button disabled={orderPage === 0} onClick={() => setOrderPage((p) => p - 1)} className="btn-secondary !py-1.5 !px-3 !text-xs disabled:opacity-40">Prev</button>
                      <span className="text-sm text-gray-500 self-center">Page {orderPage + 1} / {totalOrderPages}</span>
                      <button disabled={orderPage >= totalOrderPages - 1} onClick={() => setOrderPage((p) => p + 1)} className="btn-secondary !py-1.5 !px-3 !text-xs disabled:opacity-40">Next</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Categories Tab */}
          {activeTab === 'categories' && (
            <div className="animate-fade-in">
              <h1 className="section-title mb-6">Categories</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((cat) => (
                  <div key={cat.id} className="card p-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center text-lg overflow-hidden" aria-hidden="true">
                        {cat.imageUrl
                          ? <img src={cat.imageUrl} className="w-full h-full object-cover" alt="" />
                          : '📦'}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{cat.name}</p>
                        <p className="text-xs text-gray-400">{cat.slug}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`badge ${cat.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'} text-xs`}>
                        {cat.active ? 'Active' : 'Inactive'}
                      </span>
                      <button
                        onClick={() => showDeleteCategoryConfirm(cat.id, cat.name)}
                        className="text-gray-300 hover:text-red-400 transition-colors focus:outline-none"
                        aria-label={`Delete category ${cat.name}`}
                      >
                        <Trash2 size={15} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Confirm dialog */}
      <ConfirmDialog
        open={!!confirmDialog}
        title={confirmDialog?.title}
        message={confirmDialog?.message}
        confirmLabel={confirmDialog?.confirmLabel}
        variant={confirmDialog?.variant || 'danger'}
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmDialog(null)}
      />
    </div>
  )
}
