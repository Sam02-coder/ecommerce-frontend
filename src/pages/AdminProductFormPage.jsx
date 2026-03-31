import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Save, Upload, X, Plus } from 'lucide-react'
import { productAPI, categoryAPI } from '../services/api'
import { usePageMeta } from '../hooks/useMeta'
import { PageLoader } from '../components/common/Skeleton'
import toast from 'react-hot-toast'

const EMPTY_PRODUCT = {
  name: '',
  slug: '',
  description: '',
  price: '',
  compareAtPrice: '',
  sku: '',
  brand: '',
  stockQuantity: '',
  categoryId: '',
  featured: false,
  active: true,
  attributes: [],
}

const slugify = (text) =>
  text.toLowerCase().trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')

export default function AdminProductFormPage() {
  const { id } = useParams() // undefined = create, defined = edit
  const isEdit = Boolean(id)
  const navigate = useNavigate()

  usePageMeta({ title: isEdit ? 'Edit Product' : 'New Product' })

  const [form, setForm] = useState(EMPTY_PRODUCT)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [slugManual, setSlugManual] = useState(false)
  const [newAttrKey, setNewAttrKey] = useState('')
  const [newAttrVal, setNewAttrVal] = useState('')

  // Fetch existing product if editing
  const { data: productData, isLoading: productLoading } = useQuery({
    queryKey: ['admin-product', id],
    queryFn: () => productAPI.getBySlug(id),
    enabled: isEdit,
  })

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryAPI.getAll(),
  })

  const categories = categoriesData?.data?.data || []

  // Pre-fill form on edit
  useEffect(() => {
    if (productData?.data?.data) {
      const p = productData.data.data
      setForm({
        name:           p.name           || '',
        slug:           p.slug           || '',
        description:    p.description    || '',
        price:          p.price          ?? '',
        compareAtPrice: p.compareAtPrice ?? '',
        sku:            p.sku            || '',
        brand:          p.brand          || '',
        stockQuantity:  p.stockQuantity  ?? '',
        categoryId:     p.category?.id   || '',
        featured:       p.featured       || false,
        active:         p.active         ?? true,
        attributes:     p.attributes     || [],
      })
      setSlugManual(true) // Don't auto-update slug on edit
    }
  }, [productData])

  const update = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((prev) => {
      const next = { ...prev, [field]: value }
      // Auto-generate slug from name unless user has manually edited it
      if (field === 'name' && !slugManual) {
        next.slug = slugify(value)
      }
      return next
    })
    if (errors[field]) setErrors((p) => ({ ...p, [field]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim())        e.name         = 'Product name is required'
    if (!form.slug.trim())        e.slug         = 'Slug is required'
    if (!form.price)              e.price        = 'Price is required'
    if (isNaN(Number(form.price)) || Number(form.price) < 0)
                                  e.price        = 'Enter a valid price'
    if (!form.stockQuantity && form.stockQuantity !== 0)
                                  e.stockQuantity = 'Stock quantity is required'
    if (!form.categoryId)         e.categoryId   = 'Select a category'
    if (!form.sku.trim())         e.sku          = 'SKU is required'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      // Scroll to first error
      document.querySelector('[aria-invalid="true"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    setSaving(true)
    try {
      const payload = {
        ...form,
        price:          Number(form.price),
        compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : null,
        stockQuantity:  Number(form.stockQuantity),
        categoryId:     Number(form.categoryId),
      }

      if (isEdit) {
        await productAPI.update(id, payload)
        toast.success('Product updated!')
      } else {
        await productAPI.create(payload)
        toast.success('Product created!')
      }
      navigate('/admin')
    } catch {
      // Error toast shown by API interceptor
    } finally {
      setSaving(false)
    }
  }

  const addAttribute = () => {
    if (!newAttrKey.trim() || !newAttrVal.trim()) return
    setForm((p) => ({
      ...p,
      attributes: [...p.attributes, { name: newAttrKey.trim(), value: newAttrVal.trim() }],
    }))
    setNewAttrKey('')
    setNewAttrVal('')
  }

  const removeAttribute = (idx) => {
    setForm((p) => ({
      ...p,
      attributes: p.attributes.filter((_, i) => i !== idx),
    }))
  }

  if (isEdit && productLoading) return <PageLoader />

  const field = (id, label, required = false) => ({
    id,
    'aria-invalid': !!errors[id],
    'aria-describedby': errors[id] ? `err-${id}` : undefined,
    className: `input-field ${errors[id] ? 'border-red-300 focus:ring-red-400' : ''}`,
  })

  return (
    <div className="container-custom py-8 animate-fade-in max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          to="/admin"
          className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-400"
          aria-label="Back to admin panel"
        >
          <ArrowLeft size={20} aria-hidden="true" />
        </Link>
        <div>
          <h1 className="section-title">{isEdit ? 'Edit Product' : 'New Product'}</h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {isEdit ? `Editing: ${form.name}` : 'Fill in the details below to create a new product'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-8">

        {/* Basic Info */}
        <section className="card p-6 space-y-5">
          <h2 className="font-display font-semibold text-gray-900">Basic Information</h2>

          <div>
            <label htmlFor="pf-name" className="block text-sm font-medium text-gray-700 mb-1.5">
              Product Name <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <input
              id="pf-name"
              type="text"
              placeholder="e.g. Premium Wireless Headphones"
              value={form.name}
              onChange={update('name')}
              required
              {...field('name')}
            />
            {errors.name && <p id="err-name" className="text-xs text-red-500 mt-1" role="alert">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="pf-slug" className="block text-sm font-medium text-gray-700 mb-1.5">
              URL Slug <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 shrink-0">/products/</span>
              <input
                id="pf-slug"
                type="text"
                placeholder="premium-wireless-headphones"
                value={form.slug}
                onChange={(e) => { setSlugManual(true); update('slug')(e) }}
                required
                {...field('slug')}
              />
            </div>
            {errors.slug && <p id="err-slug" className="text-xs text-red-500 mt-1" role="alert">{errors.slug}</p>}
          </div>

          <div>
            <label htmlFor="pf-desc" className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea
              id="pf-desc"
              rows={5}
              placeholder="Describe the product in detail…"
              value={form.description}
              onChange={update('description')}
              className="input-field resize-none"
            />
          </div>

          <div>
            <label htmlFor="pf-brand" className="block text-sm font-medium text-gray-700 mb-1.5">Brand</label>
            <input
              id="pf-brand"
              type="text"
              placeholder="e.g. Sony, Nike, Apple"
              value={form.brand}
              onChange={update('brand')}
              className="input-field"
            />
          </div>
        </section>

        {/* Pricing & Inventory */}
        <section className="card p-6 space-y-5">
          <h2 className="font-display font-semibold text-gray-900">Pricing & Inventory</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="pf-price" className="block text-sm font-medium text-gray-700 mb-1.5">
                Price (₹) <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              <input
                id="pf-price"
                type="number"
                placeholder="0"
                min="0"
                step="0.01"
                value={form.price}
                onChange={update('price')}
                required
                {...field('price')}
              />
              {errors.price && <p id="err-price" className="text-xs text-red-500 mt-1" role="alert">{errors.price}</p>}
            </div>
            <div>
              <label htmlFor="pf-compare" className="block text-sm font-medium text-gray-700 mb-1.5">
                Compare-at Price (₹)
                <span className="text-xs text-gray-400 ml-1">(shows strikethrough)</span>
              </label>
              <input
                id="pf-compare"
                type="number"
                placeholder="0"
                min="0"
                step="0.01"
                value={form.compareAtPrice}
                onChange={update('compareAtPrice')}
                className="input-field"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="pf-sku" className="block text-sm font-medium text-gray-700 mb-1.5">
                SKU <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              <input
                id="pf-sku"
                type="text"
                placeholder="e.g. SKU-12345"
                value={form.sku}
                onChange={update('sku')}
                required
                {...field('sku')}
              />
              {errors.sku && <p id="err-sku" className="text-xs text-red-500 mt-1" role="alert">{errors.sku}</p>}
            </div>
            <div>
              <label htmlFor="pf-stock" className="block text-sm font-medium text-gray-700 mb-1.5">
                Stock Quantity <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              <input
                id="pf-stock"
                type="number"
                placeholder="0"
                min="0"
                value={form.stockQuantity}
                onChange={update('stockQuantity')}
                required
                {...field('stockQuantity')}
              />
              {errors.stockQuantity && <p id="err-stockQuantity" className="text-xs text-red-500 mt-1" role="alert">{errors.stockQuantity}</p>}
            </div>
          </div>
        </section>

        {/* Category & Visibility */}
        <section className="card p-6 space-y-5">
          <h2 className="font-display font-semibold text-gray-900">Category & Visibility</h2>

          <div>
            <label htmlFor="pf-category" className="block text-sm font-medium text-gray-700 mb-1.5">
              Category <span className="text-red-500" aria-hidden="true">*</span>
            </label>
            <select
              id="pf-category"
              value={form.categoryId}
              onChange={update('categoryId')}
              required
              {...field('categoryId')}
            >
              <option value="">Select a category…</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            {errors.categoryId && <p id="err-categoryId" className="text-xs text-red-500 mt-1" role="alert">{errors.categoryId}</p>}
          </div>

          <div className="flex flex-col gap-3">
            {[
              { id: 'pf-active',   field: 'active',   label: 'Active',   desc: 'Visible to customers in the store' },
              { id: 'pf-featured', field: 'featured', label: 'Featured', desc: 'Shown in the Featured Products section on the homepage' },
            ].map(({ id, field: f, label, desc }) => (
              <label key={id} htmlFor={id} className="flex items-start gap-3 cursor-pointer group">
                <input
                  id={id}
                  type="checkbox"
                  checked={form[f]}
                  onChange={update(f)}
                  className="mt-0.5 w-4 h-4 accent-primary-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900 group-hover:text-primary-700 transition-colors">{label}</span>
                  <p className="text-xs text-gray-400">{desc}</p>
                </div>
              </label>
            ))}
          </div>
        </section>

        {/* Attributes / Specifications */}
        <section className="card p-6 space-y-4">
          <h2 className="font-display font-semibold text-gray-900">Specifications</h2>
          <p className="text-sm text-gray-400">Add key-value pairs shown on the product detail page (e.g. Colour → Black).</p>

          {form.attributes.length > 0 && (
            <ul className="space-y-2">
              {form.attributes.map((attr, idx) => (
                <li key={idx} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-2.5">
                  <span className="text-sm font-medium text-gray-700 min-w-[120px]">{attr.name}</span>
                  <span className="text-sm text-gray-500 flex-1">{attr.value}</span>
                  <button
                    type="button"
                    onClick={() => removeAttribute(idx)}
                    aria-label={`Remove ${attr.name} attribute`}
                    className="text-gray-300 hover:text-red-400 transition-colors focus:outline-none"
                  >
                    <X size={14} aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="flex gap-2">
            <div className="flex-1">
              <label htmlFor="attr-key" className="sr-only">Attribute name</label>
              <input
                id="attr-key"
                type="text"
                placeholder="e.g. Colour"
                value={newAttrKey}
                onChange={(e) => setNewAttrKey(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAttribute())}
                className="input-field !text-sm"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="attr-val" className="sr-only">Attribute value</label>
              <input
                id="attr-val"
                type="text"
                placeholder="e.g. Midnight Black"
                value={newAttrVal}
                onChange={(e) => setNewAttrVal(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAttribute())}
                className="input-field !text-sm"
              />
            </div>
            <button
              type="button"
              onClick={addAttribute}
              disabled={!newAttrKey.trim() || !newAttrVal.trim()}
              className="btn-secondary !py-2 !px-4 !text-sm flex items-center gap-1 disabled:opacity-40"
              aria-label="Add attribute"
            >
              <Plus size={15} aria-hidden="true" /> Add
            </button>
          </div>
        </section>

        {/* Submit */}
        <div className="flex gap-3 justify-end">
          <Link to="/admin" className="btn-secondary">Cancel</Link>
          <button
            type="submit"
            disabled={saving}
            aria-busy={saving}
            className="btn-primary flex items-center gap-2"
          >
            {saving
              ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true" /> Saving…</>
              : <><Save size={16} aria-hidden="true" /> {isEdit ? 'Save Changes' : 'Create Product'}</>
            }
          </button>
        </div>
      </form>
    </div>
  )
}
