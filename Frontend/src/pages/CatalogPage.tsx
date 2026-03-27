import { useState, useMemo, useRef } from 'react'
import {
  Plus, Search, Filter, Edit2, Trash2, Info, Package, Image as ImageIcon,
  Star, X, ChevronDown, Upload, PlusCircle, CheckCircle2,
} from 'lucide-react'
import { TopNavbar } from '../components/layout/TopNavbar'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { Input, Select, Textarea } from '../components/ui/Input'
import { mockProducts, subcategoriesByCategory, categories as ALL_CATS } from '../services/mockData'
import { formatCurrency } from '../utils/cn'
import type { Product, PriceCategory, ProductPricing } from '../types'
import toast from 'react-hot-toast'

const PRICE_CATEGORY_LABELS: Record<PriceCategory, string> = {
  wholesaler: 'Wholesaler',
  retailer: 'Retailer',
  guest: 'Guest',
}

const PRICE_CATEGORY_COLORS: Record<PriceCategory, string> = {
  wholesaler: 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400 ring-1 ring-inset ring-violet-500/20',
  retailer: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 ring-1 ring-inset ring-emerald-600/20',
  guest: 'bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400 ring-1 ring-inset ring-sky-400/20',
}

const PRODUCT_CATS = ALL_CATS.filter(c => c !== 'All')

const defaultForm = (): Partial<Product> & { bulletPoints: string[]; images: string[]; pricing: ProductPricing } => ({
  name: '', brand: '', model: '', category: PRODUCT_CATS[0],
  subcategory: '', price: 0, mrp: undefined, tax: 18, quantity: 0,
  description: '', bulletPoints: [''], images: [],
  pricing: { wholesaler: undefined, retailer: undefined, guest: undefined },
  priceCategory: 'retailer', featured: false, featuredPosition: undefined,
})

export function CatalogPage() {
  const [products, setProducts] = useState<Product[]>(mockProducts as Product[])
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [form, setForm] = useState(defaultForm())
  const fileInputRef = useRef<HTMLInputElement>(null)
  // custom additions
  const [customCategories, setCustomCategories] = useState<string[]>([])
  const [customSubcategories, setCustomSubcategories] = useState<Record<string, string[]>>({})
  const [addingNewCat, setAddingNewCat] = useState(false)
  const [newCatInput, setNewCatInput] = useState('')
  const [addingNewSubcat, setAddingNewSubcat] = useState(false)
  const [newSubcatInput, setNewSubcatInput] = useState('')
  const newCatRef = useRef<HTMLInputElement>(null)
  const newSubcatRef = useRef<HTMLInputElement>(null)

  const displayCategories = ['All', ...Array.from(new Set(products.map(p => p.category)))]
  const allCategories = [...PRODUCT_CATS, ...customCategories]

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const s = search.toLowerCase()
      const matchSearch = p.name.toLowerCase().includes(s) ||
        p.brand.toLowerCase().includes(s) ||
        (p.model?.toLowerCase().includes(s) ?? false)
      const matchCategory = categoryFilter === 'All' || p.category === categoryFilter
      return matchSearch && matchCategory
    })
  }, [products, search, categoryFilter])

  const openAdd = () => {
    setForm(defaultForm())
    setEditingProduct(null)
    setAddingNewCat(false)
    setNewCatInput('')
    setAddingNewSubcat(false)
    setNewSubcatInput('')
    setIsAddModalOpen(true)
  }

  const openEdit = (product: Product) => {
    setForm({
      ...product,
      bulletPoints: product.bulletPoints.length > 0 ? [...product.bulletPoints] : [''],
      images: [...product.images],
      pricing: { ...product.pricing },
    })
    setEditingProduct(product)
    setIsAddModalOpen(true)
  }

  const closeModal = () => {
    setIsAddModalOpen(false)
    setEditingProduct(null)
    setForm(defaultForm())
    setAddingNewCat(false)
    setNewCatInput('')
    setAddingNewSubcat(false)
    setNewSubcatInput('')
  }

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm(prev => ({ ...prev, [key]: value }))

  const setPricing = (role: keyof ProductPricing, val: string) =>
    setForm(prev => ({ ...prev, pricing: { ...prev.pricing, [role]: val === '' ? undefined : Number(val) } }))

  const setBullet = (i: number, val: string) =>
    setForm(prev => {
      const bp = [...(prev.bulletPoints ?? [])]
      bp[i] = val
      return { ...prev, bulletPoints: bp }
    })

  const addBullet = () => setForm(prev => ({
    ...prev, bulletPoints: [...(prev.bulletPoints ?? []), '']
  }))

  const removeBullet = (i: number) => setForm(prev => ({
    ...prev, bulletPoints: (prev.bulletPoints ?? []).filter((_, idx) => idx !== i)
  }))

  const handleImageFiles = (files: FileList | null) => {
    if (!files) return
    const urls: string[] = []
    Array.from(files).forEach(f => {
      const url = URL.createObjectURL(f)
      urls.push(url)
    })
    setForm(prev => ({ ...prev, images: [...(prev.images ?? []), ...urls] }))
  }

  const removeImage = (i: number) => setForm(prev => ({
    ...prev, images: (prev.images ?? []).filter((_, idx) => idx !== i)
  }))

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      setProducts(prev => prev.filter(p => p.id !== id))
      toast.success('Product deleted successfully')
    }
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name?.trim()) return toast.error('Product name is required')
    if (!form.brand?.trim()) return toast.error('Brand is required')

    const cleanBullets = (form.bulletPoints ?? []).filter(b => b.trim() !== '')

    const pricing: ProductPricing = form.pricing ?? {}
    // derive the base price: use retailer price, or the first defined price, or 0
    const basePrice = pricing.retailer ?? pricing.wholesaler ?? pricing.guest ?? (Number(form.price) || 0)

    const saved: Product = {
      id: editingProduct?.id ?? String(Date.now()),
      name: form.name ?? '',
      brand: form.brand ?? '',
      model: form.model ?? '',
      category: form.category ?? PRODUCT_CATS[0],
      subcategory: form.subcategory ?? '',
      price: basePrice,
      pricing,
      mrp: form.mrp ? Number(form.mrp) : undefined,
      tax: Number(form.tax) || 18,
      quantity: Number(form.quantity) || 0,
      description: form.description ?? '',
      bulletPoints: cleanBullets,
      images: form.images ?? [],
      priceCategory: form.priceCategory ?? 'retailer',
      featured: form.featured ?? false,
      featuredPosition: form.featured ? (Number(form.featuredPosition) || undefined) : undefined,
      totalOrders: editingProduct?.totalOrders ?? 0,
      costUpdatedAt: new Date().toISOString(),
      createdAt: editingProduct?.createdAt ?? new Date().toISOString(),
    }

    if (editingProduct) {
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? saved : p))
      toast.success('Product updated successfully')
    } else {
      setProducts(prev => [saved, ...prev])
      toast.success('Product added successfully')
    }
    closeModal()
  }

  const builtInSubcats = subcategoriesByCategory[form.category ?? ''] ?? []
  const subcatOptions = [...builtInSubcats, ...(customSubcategories[form.category ?? ''] ?? [])]
  const featuredProducts = [...products].filter(p => p.featured).sort((a, b) =>
    (a.featuredPosition ?? 999) - (b.featuredPosition ?? 999)
  )

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#f5f6fb] dark:bg-[#0c0e12]">
      <TopNavbar title="Product Catalog" subtitle={`Manage your ${products.length} products`} />

      <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin">
        <div className="max-w-[1600px] mx-auto space-y-8">

          {/* Featured strip */}
          {featuredProducts.length > 0 && (
            <div className="space-y-3" style={{ animation: 'fadeIn 0.5s ease-out 0.05s both' }}>
              <p className="text-[11px] font-bold text-[#9b9da1] uppercase tracking-widest flex items-center gap-2">
                <Star size={12} className="text-amber-400 fill-amber-400" /> Featured Products
              </p>
              <div className="flex flex-wrap gap-3">
                {featuredProducts.map(p => (
                  <div key={p.id} className="flex items-center gap-3 px-4 py-2.5 bg-white/80 dark:bg-[#15171b]/80 border border-amber-200 dark:border-amber-500/20 rounded-2xl shadow-sm">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-400 text-white text-[11px] font-black flex-shrink-0">
                      {p.featuredPosition}
                    </span>
                    {p.images[0] && <img src={p.images[0]} alt={p.name} className="w-8 h-8 rounded-lg object-cover" />}
                    <div>
                      <p className="text-[13px] font-bold text-[#2c2f33] dark:text-white leading-tight">{p.name}</p>
                      <p className="text-[11px] text-[#9b9da1] font-medium">{p.brand}</p>
                    </div>
                    <Star size={12} className="text-amber-400 fill-amber-400 ml-1" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions & Filters */}
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center" style={{ animation: 'fadeIn 0.5s ease-out 0.1s both' }}>
            <div className="flex flex-1 w-full md:w-auto gap-4">
              <div className="relative flex-1 max-w-md group">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9b9da1] group-focus-within:text-[#6E3DFB] transition-colors" />
                <input
                  type="text"
                  placeholder="Search by name, brand, or model..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 text-sm font-medium bg-white/70 dark:bg-[#15171b]/80 backdrop-blur-md border border-white/40 dark:border-white/5 rounded-2xl text-[#2c2f33] dark:text-white placeholder-[#9b9da1] focus:outline-none focus:border-[#6E3DFB] focus:ring-4 focus:ring-[#6E3DFB]/10 shadow-sm transition-all"
                />
              </div>
              <div className="relative group min-w-[160px]">
                <Filter size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9b9da1] group-hover:text-[#6E3DFB] transition-colors z-10" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 text-sm font-bold bg-white/70 dark:bg-[#15171b]/80 backdrop-blur-md border border-white/40 dark:border-white/5 rounded-2xl text-[#595c60] dark:text-[#dadde4] focus:outline-none focus:border-[#6E3DFB] focus:ring-4 focus:ring-[#6E3DFB]/10 shadow-sm appearance-none transition-all cursor-pointer"
                >
                  {displayCategories.map(c => <option key={c} value={c} className="bg-white dark:bg-[#15171b]">{c}</option>)}
                </select>
                <ChevronDown size={13} className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#9b9da1]" />
              </div>
            </div>
            <Button onClick={openAdd} className="w-full md:w-auto rounded-2xl shadow-[0_4px_14px_0_rgb(110,61,251,0.39)] hover:shadow-[0_6px_20px_rgba(110,61,251,0.23)] hover:bg-[#5b32d6] px-6 py-2.5 font-bold transition-all flex items-center justify-center gap-2">
              <Plus size={18} strokeWidth={2.5} />
              Add Product
            </Button>
          </div>

          {/* Table */}
          <div
            className="bg-white/80 dark:bg-[#15171b]/80 backdrop-blur-2xl border border-white/40 dark:border-white/5 rounded-[2rem] shadow-[0_8px_40px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_40px_rgb(0,0,0,0.2)] overflow-hidden"
            style={{ animation: 'fadeIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.2s both' }}
          >
            <div className="overflow-x-auto p-2 md:p-4">
              <table className="w-full text-left border-collapse min-w-[1100px]">
                <thead>
                  <tr>
                    {['Product Info', 'Brand / Model', 'Category', 'Price', 'Stock', 'Featured', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-5 py-4 text-[11px] font-bold text-[#9b9da1] uppercase tracking-widest border-b border-[#e6e8ee] dark:border-zinc-800/80 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eff1f6] dark:divide-zinc-800/50">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-5 py-16 text-center text-[#9b9da1] font-medium text-sm">
                        <div className="flex flex-col items-center gap-3">
                          <Package size={32} className="text-[#e6e8ee] dark:text-zinc-800" />
                          No products found.
                        </div>
                      </td>
                    </tr>
                  ) : filteredProducts.map((product, idx) => (
                    <tr
                      key={product.id}
                      className="hover:bg-[#f5f6fb] dark:hover:bg-zinc-800/40 transition-all duration-300 group"
                      style={{ animation: `fadeIn 0.4s ease-out ${0.25 + idx * 0.05}s both` }}
                    >
                      {/* Product Info */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-4">
                          <div className="relative w-12 h-12 rounded-[14px] bg-[#eff1f6] dark:bg-[#15171b] flex items-center justify-center overflow-hidden ring-2 ring-white dark:ring-[#15171b] shadow-sm group-hover:scale-105 transition-transform duration-300 flex-shrink-0">
                            {product.images[0] ? (
                              <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon size={20} className="text-[#9b9da1]" />
                            )}
                            {product.featured && (
                              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center text-white text-[9px] font-black shadow">
                                {product.featuredPosition ?? '★'}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-[14px] font-extrabold text-[#2c2f33] dark:text-white tracking-tight">{product.name}</p>
                            {product.description && (
                              <p className="text-[12px] font-medium text-[#9b9da1] truncate max-w-[180px] mt-0.5">{product.description}</p>
                            )}
                            {product.bulletPoints.length > 0 && (
                              <p className="text-[11px] font-medium text-[#6E3DFB] mt-0.5">{product.bulletPoints.length} bullet point{product.bulletPoints.length !== 1 ? 's' : ''}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Brand / Model */}
                      <td className="px-5 py-4">
                        <p className="text-[13px] font-bold text-[#595c60] dark:text-[#dadde4]">{product.brand}</p>
                        {product.model && <p className="text-[11px] font-mono text-[#9b9da1]">{product.model}</p>}
                      </td>

                      {/* Category */}
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-widest bg-gray-100 dark:bg-zinc-800 text-[#595c60] dark:text-[#dadde4]">
                          {product.category}
                        </span>
                        {product.subcategory && (
                          <p className="text-[11px] font-medium text-[#9b9da1] mt-1">{product.subcategory}</p>
                        )}
                      </td>

                      {/* Prices */}
                      <td className="px-5 py-4">
                        <div className="space-y-1.5">
                          {product.pricing?.wholesaler != null && (
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] font-black text-violet-500 uppercase tracking-widest w-12">WS</span>
                              <span className="text-[12px] font-bold text-[#2c2f33] dark:text-white">{formatCurrency(product.pricing.wholesaler)}</span>
                            </div>
                          )}
                          {product.pricing?.retailer != null && (
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest w-12">Retail</span>
                              <span className="text-[12px] font-bold text-[#2c2f33] dark:text-white">{formatCurrency(product.pricing.retailer)}</span>
                            </div>
                          )}
                          {product.pricing?.guest != null && (
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] font-black text-sky-500 uppercase tracking-widest w-12">Guest</span>
                              <span className="text-[12px] font-bold text-[#2c2f33] dark:text-white">{formatCurrency(product.pricing.guest)}</span>
                            </div>
                          )}
                          {product.mrp && (
                            <p className="text-[10px] font-semibold text-[#9b9da1] line-through">MRP {formatCurrency(product.mrp)}</p>
                          )}
                        </div>
                      </td>


                      {/* Stock */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          {product.quantity < 10 && <span title="Low Stock"><Info size={14} className="text-rose-500" /></span>}
                          <span className={`text-[14px] font-extrabold ${product.quantity < 10 ? 'text-rose-600 dark:text-rose-400' : 'text-[#2c2f33] dark:text-[#dadde4]'}`}>
                            {product.quantity}
                          </span>
                        </div>
                      </td>

                      {/* Featured */}
                      <td className="px-5 py-4">
                        {product.featured ? (
                          <div className="flex items-center gap-1.5">
                            <Star size={14} className="text-amber-400 fill-amber-400" />
                            <span className="text-[12px] font-bold text-amber-600 dark:text-amber-400">#{product.featuredPosition}</span>
                          </div>
                        ) : (
                          <span className="text-[12px] text-[#9b9da1]">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest
                          ${product.quantity > 0 ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 ring-1 ring-inset ring-emerald-600/20' : 'bg-[#f5f6fb] text-[#595c60] dark:bg-zinc-800 dark:text-[#dadde4] ring-1 ring-inset ring-[#9b9da1]/20'}
                        `}>
                          {product.quantity > 0 ? 'ACTIVE' : 'DRAFT'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEdit(product)}
                            className="p-2 rounded-xl text-[#9b9da1] hover:text-[#6E3DFB] hover:bg-[#6E3DFB]/10 transition-all shadow-sm ring-1 ring-inset ring-[#e6e8ee] dark:ring-white/5 bg-white dark:bg-zinc-800"
                            title="Edit"
                          >
                            <Edit2 size={16} strokeWidth={2.5} />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="p-2 rounded-xl text-[#9b9da1] hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all shadow-sm ring-1 ring-inset ring-[#e6e8ee] dark:ring-white/5 bg-white dark:bg-zinc-800"
                            title="Delete"
                          >
                            <Trash2 size={16} strokeWidth={2.5} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Add / Edit Modal */}
      <Modal
        open={isAddModalOpen}
        onClose={closeModal}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
        size="lg"
      >
        <form onSubmit={handleSave} className="space-y-6 mt-1">

          {/* Basic Info */}
          <div>
            <p className="text-[10px] font-bold text-[#9b9da1] uppercase tracking-widest mb-3">Basic Info</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Product Name *"
                value={form.name ?? ''}
                onChange={e => set('name', e.target.value)}
                placeholder="e.g. Wireless Headphones"
                required
              />
              <Input
                label="Brand *"
                value={form.brand ?? ''}
                onChange={e => set('brand', e.target.value)}
                placeholder="e.g. Sony"
                required
              />
              <Input
                label="Model"
                value={form.model ?? ''}
                onChange={e => set('model', e.target.value)}
                placeholder="e.g. WH-1000XM5"
              />
              <Input
                label="Quantity *"
                type="number"
                value={String(form.quantity ?? 0)}
                onChange={e => set('quantity', Number(e.target.value))}
                min={0}
                required
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <p className="text-[10px] font-bold text-[#9b9da1] uppercase tracking-widest mb-3">Category</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Category selector + Add new */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">Category</label>
                <div className="relative">
                  <select
                    value={form.category ?? ''}
                    onChange={e => { set('category', e.target.value); set('subcategory', ''); setAddingNewSubcat(false) }}
                    className="w-full px-3 py-2.5 text-sm font-semibold bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700 rounded-lg text-gray-900 dark:text-zinc-100 focus:outline-none focus:border-[#6E3DFB] focus:ring-2 focus:ring-[#6E3DFB]/10 appearance-none transition-all"
                  >
                    {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <ChevronDown size={13} className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#9b9da1]" />
                </div>
                {!addingNewCat ? (
                  <button
                    type="button"
                    onClick={() => { setAddingNewCat(true); setTimeout(() => newCatRef.current?.focus(), 50) }}
                    className="mt-2 flex items-center gap-1.5 text-[12px] font-bold text-[#6E3DFB] hover:text-[#5b32d6] px-1 py-0.5 rounded-lg hover:bg-[#6E3DFB]/8 transition-all"
                  >
                    <PlusCircle size={13} /> Add new category
                  </button>
                ) : (
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      ref={newCatRef}
                      type="text"
                      value={newCatInput}
                      onChange={e => setNewCatInput(e.target.value)}
                      placeholder="New category name"
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          const val = newCatInput.trim()
                          if (val && !allCategories.includes(val)) setCustomCategories(prev => [...prev, val])
                          if (val) { set('category', val); set('subcategory', '') }
                          setAddingNewCat(false); setNewCatInput('')
                        } else if (e.key === 'Escape') { setAddingNewCat(false); setNewCatInput('') }
                      }}
                      className="flex-1 px-3 py-2 text-sm font-semibold bg-white dark:bg-zinc-800 border border-[#6E3DFB]/40 rounded-xl text-[#2c2f33] dark:text-white placeholder-[#9b9da1] focus:outline-none focus:border-[#6E3DFB] focus:ring-2 focus:ring-[#6E3DFB]/10"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const val = newCatInput.trim()
                        if (val && !allCategories.includes(val)) setCustomCategories(prev => [...prev, val])
                        if (val) { set('category', val); set('subcategory', '') }
                        setAddingNewCat(false); setNewCatInput('')
                      }}
                      className="w-8 h-8 rounded-xl bg-[#6E3DFB] text-white flex items-center justify-center hover:bg-[#5b32d6] transition-all shadow flex-shrink-0"
                    >
                      <CheckCircle2 size={15} strokeWidth={2.5} />
                    </button>
                    <button type="button" onClick={() => { setAddingNewCat(false); setNewCatInput('') }} className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-zinc-700 flex items-center justify-center text-[#9b9da1] hover:text-rose-500 transition-all flex-shrink-0">
                      <X size={14} strokeWidth={2.5} />
                    </button>
                  </div>
                )}
              </div>

              {/* Sub Category selector + Add new */}
              <div>
                <label className="block text-[12px] font-bold text-[#595c60] dark:text-[#9b9da1] mb-1.5 uppercase tracking-wide">Sub Category</label>
                {subcatOptions.length > 0 ? (
                  <div className="relative">
                    <select
                      value={form.subcategory ?? ''}
                      onChange={e => set('subcategory', e.target.value)}
                      className="w-full px-4 py-2.5 text-sm font-semibold bg-white/70 dark:bg-[#15171b]/80 border border-[#e6e8ee] dark:border-zinc-700 rounded-xl text-[#2c2f33] dark:text-white focus:outline-none focus:border-[#6E3DFB] focus:ring-4 focus:ring-[#6E3DFB]/10 appearance-none transition-all"
                    >
                      <option value="">Select subcategory</option>
                      {subcatOptions.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <ChevronDown size={13} className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#9b9da1]" />
                  </div>
                ) : (
                  <input
                    type="text"
                    value={form.subcategory ?? ''}
                    onChange={e => set('subcategory', e.target.value)}
                    placeholder="e.g. Audio"
                    className="w-full px-4 py-2.5 text-sm font-semibold bg-white/70 dark:bg-[#15171b]/80 border border-[#e6e8ee] dark:border-zinc-700 rounded-xl text-[#2c2f33] dark:text-white placeholder-[#9b9da1] focus:outline-none focus:border-[#6E3DFB] focus:ring-4 focus:ring-[#6E3DFB]/10 transition-all"
                  />
                )}
                {!addingNewSubcat ? (
                  <button
                    type="button"
                    onClick={() => { setAddingNewSubcat(true); setTimeout(() => newSubcatRef.current?.focus(), 50) }}
                    className="mt-2 flex items-center gap-1.5 text-[12px] font-bold text-[#6E3DFB] hover:text-[#5b32d6] px-1 py-0.5 rounded-lg hover:bg-[#6E3DFB]/8 transition-all"
                  >
                    <PlusCircle size={13} /> Add new sub category
                  </button>
                ) : (
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      ref={newSubcatRef}
                      type="text"
                      value={newSubcatInput}
                      onChange={e => setNewSubcatInput(e.target.value)}
                      placeholder="New sub category name"
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          const val = newSubcatInput.trim()
                          const cat = form.category ?? ''
                          if (val && !subcatOptions.includes(val)) setCustomSubcategories(prev => ({ ...prev, [cat]: [...(prev[cat] ?? []), val] }))
                          if (val) set('subcategory', val)
                          setAddingNewSubcat(false); setNewSubcatInput('')
                        } else if (e.key === 'Escape') { setAddingNewSubcat(false); setNewSubcatInput('') }
                      }}
                      className="flex-1 px-3 py-2 text-sm font-semibold bg-white dark:bg-zinc-800 border border-[#6E3DFB]/40 rounded-xl text-[#2c2f33] dark:text-white placeholder-[#9b9da1] focus:outline-none focus:border-[#6E3DFB] focus:ring-2 focus:ring-[#6E3DFB]/10"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const val = newSubcatInput.trim()
                        const cat = form.category ?? ''
                        if (val && !subcatOptions.includes(val)) setCustomSubcategories(prev => ({ ...prev, [cat]: [...(prev[cat] ?? []), val] }))
                        if (val) set('subcategory', val)
                        setAddingNewSubcat(false); setNewSubcatInput('')
                      }}
                      className="w-8 h-8 rounded-xl bg-[#6E3DFB] text-white flex items-center justify-center hover:bg-[#5b32d6] transition-all shadow flex-shrink-0"
                    >
                      <CheckCircle2 size={15} strokeWidth={2.5} />
                    </button>
                    <button type="button" onClick={() => { setAddingNewSubcat(false); setNewSubcatInput('') }} className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-zinc-700 flex items-center justify-center text-[#9b9da1] hover:text-rose-500 transition-all flex-shrink-0">
                      <X size={14} strokeWidth={2.5} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div>
            <p className="text-[10px] font-bold text-[#9b9da1] uppercase tracking-widest mb-3">Pricing</p>

            {/* 3 Role Prices */}
            <div className="rounded-2xl border border-[#e6e8ee] dark:border-zinc-700 overflow-hidden mb-4">
              {([
                { role: 'wholesaler' as const, label: 'Wholesaler Price', tag: 'WS', tagCls: 'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300' },
                { role: 'retailer' as const, label: 'Retailer Price', tag: 'Retail', tagCls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300' },
                { role: 'guest' as const, label: 'Guest / Public Price', tag: 'Guest', tagCls: 'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300' },
              ]).map(({ role, label, tag, tagCls }, i) => (
                <div key={role} className={`flex items-center gap-4 px-4 py-3.5 bg-white dark:bg-zinc-900 ${i < 2 ? 'border-b border-[#e6e8ee] dark:border-zinc-800' : ''}`}>
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md flex-shrink-0 w-14 text-center ${tagCls}`}>{tag}</span>
                  <label className="text-[13px] font-bold text-[#595c60] dark:text-[#dadde4] flex-1">{label}</label>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[13px] font-bold text-[#9b9da1]">₹</span>
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      value={form.pricing?.[role] ?? ''}
                      onChange={e => setPricing(role, e.target.value)}
                      placeholder="—"
                      className="w-32 px-3 py-2 text-sm font-black text-right bg-[#f5f6fb] dark:bg-zinc-800 border border-[#e6e8ee] dark:border-zinc-700 rounded-xl focus:outline-none focus:border-[#6E3DFB] focus:ring-2 focus:ring-[#6E3DFB]/10 text-[#2c2f33] dark:text-white transition-all"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* MRP + Default visible to */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="MRP (₹) — Optional"
                type="number"
                value={String(form.mrp ?? '')}
                onChange={e => set('mrp', e.target.value ? Number(e.target.value) : undefined)}
                min={0}
                step={0.01}
                placeholder="Max retail price"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1.5">Default Visible To</label>
                <div className="relative">
                  <select
                    value={form.priceCategory ?? 'retailer'}
                    onChange={e => set('priceCategory', e.target.value as PriceCategory)}
                    className="w-full px-3 py-2.5 text-sm font-bold bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700 rounded-lg text-gray-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 appearance-none transition-all"
                  >
                    <option value="wholesaler">Wholesaler accounts</option>
                    <option value="retailer">Retailer accounts</option>
                    <option value="guest">Guest / Public</option>
                  </select>
                  <ChevronDown size={13} className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#9b9da1]" />
                </div>
                <p className="text-[11px] text-[#9b9da1] mt-1.5">Price shown by default based on user account type.</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <p className="text-[10px] font-bold text-[#9b9da1] uppercase tracking-widest mb-3">Description</p>
            <Textarea
              label=""
              value={form.description ?? ''}
              onChange={e => set('description', e.target.value)}
              rows={3}
              placeholder="Describe your product..."
            />
          </div>

          {/* Bullet Points */}
          <div>
            <p className="text-[10px] font-bold text-[#9b9da1] uppercase tracking-widest mb-3">Bullet Points</p>
            <div className="space-y-2.5">
              {(form.bulletPoints ?? ['']).map((bp, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#6E3DFB]/10 text-[#6E3DFB] text-[10px] font-black flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </span>
                  <input
                    type="text"
                    value={bp}
                    onChange={e => setBullet(i, e.target.value)}
                    placeholder={`Bullet point ${i + 1}`}
                    className="flex-1 px-4 py-2.5 text-sm font-semibold bg-white/70 dark:bg-[#15171b]/80 border border-[#e6e8ee] dark:border-zinc-700 rounded-xl text-[#2c2f33] dark:text-white placeholder-[#9b9da1] focus:outline-none focus:border-[#6E3DFB] focus:ring-4 focus:ring-[#6E3DFB]/10 transition-all"
                  />
                  {(form.bulletPoints ?? []).length > 1 && (
                    <button type="button" onClick={() => removeBullet(i)} className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-all">
                      <X size={14} strokeWidth={2.5} />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addBullet}
                className="flex items-center gap-1.5 text-[12px] font-bold text-[#6E3DFB] hover:text-[#5b32d6] mt-1 px-2 py-1 rounded-lg hover:bg-[#6E3DFB]/8 transition-all"
              >
                <PlusCircle size={14} /> Add bullet point
              </button>
            </div>
          </div>

          {/* Product Images */}
          <div>
            <p className="text-[10px] font-bold text-[#9b9da1] uppercase tracking-widest mb-3">Product Images</p>
            <div
              className="border-2 border-dashed border-[#e6e8ee] dark:border-zinc-700 rounded-2xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[#6E3DFB]/50 hover:bg-[#6E3DFB]/4 transition-all"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={22} className="text-[#9b9da1]" />
              <p className="text-[13px] font-bold text-[#595c60] dark:text-[#dadde4]">Click to upload images</p>
              <p className="text-[11px] text-[#9b9da1]">PNG, JPG, WEBP up to 10MB each</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={e => handleImageFiles(e.target.files)}
              />
            </div>
            {(form.images ?? []).length > 0 && (
              <div className="flex flex-wrap gap-3 mt-4">
                {(form.images ?? []).map((img, i) => (
                  <div key={i} className="relative group">
                    <img
                      src={img}
                      alt={`Product image ${i + 1}`}
                      className="w-20 h-20 object-cover rounded-xl border border-[#e6e8ee] dark:border-zinc-700 shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow"
                    >
                      <X size={10} strokeWidth={3} />
                    </button>
                    {i === 0 && (
                      <span className="absolute bottom-1 left-1 text-[9px] font-black bg-[#6E3DFB] text-white px-1.5 py-0.5 rounded-md">MAIN</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Featured */}
          <div>
            <p className="text-[10px] font-bold text-[#9b9da1] uppercase tracking-widest mb-3">Featured</p>
            <div className="flex items-center gap-4 p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl">
              <div className="flex items-center gap-3 flex-1">
                <button
                  type="button"
                  onClick={() => set('featured', !form.featured)}
                  className={`w-12 h-6 rounded-full relative transition-all duration-300 flex-shrink-0 ${form.featured ? 'bg-amber-400' : 'bg-[#d5d7e0] dark:bg-zinc-700'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-300 ${form.featured ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
                <div>
                  <p className="text-[13px] font-extrabold text-[#2c2f33] dark:text-white flex items-center gap-1.5">
                    <Star size={14} className="text-amber-400 fill-amber-400" />
                    Mark as Featured
                  </p>
                  <p className="text-[11px] font-medium text-[#9b9da1]">Shows on homepage/featured section</p>
                </div>
              </div>
              {form.featured && (
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Position #</label>
                  <input
                    type="number"
                    min={1}
                    value={form.featuredPosition ?? ''}
                    onChange={e => set('featuredPosition', e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="1"
                    className="w-20 px-3 py-2 text-sm font-black text-center bg-white dark:bg-zinc-900 border border-amber-300 dark:border-amber-500/40 rounded-xl focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 text-amber-700 dark:text-amber-300"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 flex justify-end gap-3 border-t border-[#e6e8ee] dark:border-zinc-800">
            <Button type="button" variant="secondary" onClick={closeModal} className="rounded-2xl px-5">Cancel</Button>
            <Button type="submit" className="rounded-2xl px-6 font-bold shadow-[0_4px_14px_0_rgb(110,61,251,0.3)]">
              {editingProduct ? 'Update Product' : 'Add Product'}
            </Button>
          </div>

        </form>
      </Modal>
    </div>
  )
}
