import { useState, useMemo } from 'react'
import { Search, Plus, Pencil, Trash2, Image, ChevronUp, ChevronDown } from 'lucide-react'
import { TopNavbar } from '../components/layout/TopNavbar'
import { Modal, ConfirmDialog } from '../components/ui/Modal'
import { Button } from '../components/ui/Button'
import { Input, Textarea, Select } from '../components/ui/Input'
import { mockProducts, categories, subcategoriesByCategory } from '../services/mockData'
import { formatCurrency, formatDate, generateId } from '../utils/cn'
import type { Product } from '../types'
import toast from 'react-hot-toast'

type SortKey = 'name' | 'price' | 'quantity' | 'totalOrders' | 'costUpdatedAt'
type SortDir = 'asc' | 'desc'

const TAX_OPTIONS = [
  { value: '0', label: '0% (Exempt)' },
  { value: '5', label: '5%' },
  { value: '12', label: '12%' },
  { value: '18', label: '18% (standard)' },
  { value: '28', label: '28%' },
]

const emptyProduct: Omit<Product, 'id' | 'totalOrders' | 'costUpdatedAt' | 'createdAt'> = {
  name: '', category: '', subcategory: '', brand: '', price: 0, mrp: undefined,
  tax: 18, quantity: 0, description: '', bulletPoints: [], images: [],
  otherAdditions: undefined, otherDeductions: undefined,
}

export function CatalogPage() {
  const [products, setProducts] = useState<Product[]>(mockProducts)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [brandFilter, setBrandFilter] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null)
  const [photoProduct, setPhotoProduct] = useState<Product | null>(null)
  const [form, setForm] = useState(emptyProduct)
  const [bulletInput, setBulletInput] = useState('')
  const [bullets, setBullets] = useState<string[]>([])

  const brands = useMemo(() => [...new Set(products.map((p) => p.brand))], [products])

  const filtered = useMemo(() => {
    let result = products.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase())
      const matchCat = !categoryFilter || p.category === categoryFilter
      const matchBrand = !brandFilter || p.brand === brandFilter
      return matchSearch && matchCat && matchBrand
    })
    result.sort((a, b) => {
      const av = a[sortKey] as string | number
      const bv = b[sortKey] as string | number
      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ? 1 : -1
      return 0
    })
    return result
  }, [products, search, categoryFilter, brandFilter, sortKey, sortDir])

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('asc') }
  }

  const openAdd = () => { setForm(emptyProduct); setBullets([]); setBulletInput(''); setEditProduct(null); setShowAddModal(true) }

  const openEdit = (p: Product) => {
    setForm({ name: p.name, category: p.category, subcategory: p.subcategory, brand: p.brand, price: p.price, mrp: p.mrp, tax: p.tax, quantity: p.quantity, description: p.description, bulletPoints: p.bulletPoints, images: p.images, otherAdditions: p.otherAdditions, otherDeductions: p.otherDeductions })
    setBullets(p.bulletPoints); setBulletInput(''); setEditProduct(p); setShowAddModal(true)
  }

  const handleSave = () => {
    if (!form.name || !form.category || !form.brand || !form.price) { toast.error('Please fill required fields'); return }
    const now = new Date().toISOString()
    if (editProduct) {
      setProducts((prev) => prev.map((p) => p.id === editProduct.id ? { ...p, ...form, bulletPoints: bullets, costUpdatedAt: now } : p))
      toast.success('Product updated!')
    } else {
      setProducts((prev) => [{ ...form, id: generateId(), bulletPoints: bullets, totalOrders: 0, costUpdatedAt: now, createdAt: now }, ...prev])
      toast.success('Product added!')
    }
    setShowAddModal(false)
  }

  const handleDelete = () => {
    if (!deleteProduct) return
    setProducts((prev) => prev.filter((p) => p.id !== deleteProduct.id))
    setDeleteProduct(null); toast.success('Product deleted')
  }

  const addBullet = () => { if (!bulletInput.trim()) return; setBullets((prev) => [...prev, bulletInput.trim()]); setBulletInput('') }

  const SortIcon = ({ k }: { k: SortKey }) => (
    <span className="inline-flex flex-col ml-1 opacity-40">
      <ChevronUp size={10} className={sortKey === k && sortDir === 'asc' ? 'opacity-100 text-blue-500' : ''} />
      <ChevronDown size={10} className={sortKey === k && sortDir === 'desc' ? 'opacity-100 text-blue-500' : ''} />
    </span>
  )

  const subcats = form.category ? (subcategoriesByCategory[form.category] || []) : []

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopNavbar title="Catalog" subtitle={`${products.length} products listed`} />
      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin animate-fade-in space-y-4">
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex flex-wrap gap-2 flex-1">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500" />
              <input id="catalog-search" type="text" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-3 py-2 text-sm bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700 rounded-lg text-gray-800 dark:text-zinc-200 placeholder-gray-400 dark:placeholder-zinc-600 focus:outline-none focus:border-blue-500 w-52 transition-all" />
            </div>
            <select id="catalog-category-filter" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 text-sm bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700 rounded-lg text-gray-700 dark:text-zinc-300 focus:outline-none focus:border-blue-500 appearance-none">
              <option value="">All Categories</option>
              {categories.map((c) => <option key={c} value={c} className="bg-white dark:bg-zinc-800">{c}</option>)}
            </select>
            <select id="catalog-brand-filter" value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)}
              className="px-3 py-2 text-sm bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700 rounded-lg text-gray-700 dark:text-zinc-300 focus:outline-none focus:border-blue-500 appearance-none">
              <option value="">All Brands</option>
              {brands.map((b) => <option key={b} value={b} className="bg-white dark:bg-zinc-800">{b}</option>)}
            </select>
          </div>
          <Button icon={<Plus size={14} />} onClick={openAdd} id="add-product-btn">Add Product</Button>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-gray-200 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-zinc-800">
                  {[
                    { key: 'name', label: 'Product' }, { key: null, label: 'Brand' }, { key: 'quantity', label: 'Qty' },
                    { key: 'price', label: 'Price' }, { key: 'costUpdatedAt', label: 'Updated' }, { key: null, label: 'Photos' },
                    { key: 'totalOrders', label: 'Orders' }, { key: null, label: 'Actions' },
                  ].map(({ key, label }) => (
                    <th key={label} onClick={() => key && handleSort(key as SortKey)}
                      className={`px-4 py-3.5 text-left text-xs font-medium text-gray-400 dark:text-zinc-500 uppercase tracking-wide whitespace-nowrap ${key ? 'cursor-pointer hover:text-gray-700 dark:hover:text-zinc-300 select-none' : ''}`}>
                      {label}{key && <SortIcon k={key as SortKey} />}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-zinc-800/50">
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-400 dark:text-zinc-600 text-sm">No products found</td></tr>
                ) : (
                  filtered.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img src={product.images[0]} alt={product.name} className="w-10 h-10 rounded-lg object-cover bg-gray-100 dark:bg-zinc-800 flex-shrink-0"
                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=40&h=40&fit=crop' }} />
                          <div className="min-w-0">
                            <p className="text-gray-800 dark:text-zinc-200 font-medium text-sm truncate max-w-[180px]">{product.name}</p>
                            <p className="text-gray-400 dark:text-zinc-600 text-xs">{product.category} / {product.subcategory}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-zinc-400 text-sm">{product.brand}</td>
                      <td className="px-4 py-3">
                        <span className={`text-sm font-semibold ${product.quantity < 20 ? 'text-amber-600 dark:text-amber-400' : 'text-gray-800 dark:text-zinc-200'}`}>{product.quantity}</span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-gray-800 dark:text-zinc-200 font-semibold text-sm">{formatCurrency(product.price)}</p>
                        {product.mrp && <p className="text-gray-400 dark:text-zinc-600 text-xs line-through">{formatCurrency(product.mrp)}</p>}
                      </td>
                      <td className="px-4 py-3 text-gray-400 dark:text-zinc-500 text-xs">{formatDate(product.costUpdatedAt)}</td>
                      <td className="px-4 py-3">
                        <button id={`photos-${product.id}`} onClick={() => setPhotoProduct(product)}
                          className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-zinc-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
                          <Image size={13} />{product.images.length} photo{product.images.length !== 1 ? 's' : ''}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-gray-700 dark:text-zinc-300 text-sm font-medium">{product.totalOrders}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button id={`edit-product-${product.id}`} onClick={() => openEdit(product)}
                            className="p-1.5 rounded-md text-gray-400 dark:text-zinc-600 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-400/10 transition-all"><Pencil size={14} /></button>
                          <button id={`delete-product-${product.id}`} onClick={() => setDeleteProduct(product)}
                            className="p-1.5 rounded-md text-gray-400 dark:text-zinc-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-400/10 transition-all"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title={editProduct ? 'Edit Product' : 'Add New Product'} description={editProduct ? `Editing: ${editProduct.name}` : 'Fill in product details below'} size="xl">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Input label="Item Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Wireless Bluetooth Headphones" />
            </div>
            <Select label="Category" required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value, subcategory: '' })} options={categories.map((c) => ({ value: c, label: c }))} placeholder="Select category" />
            <Select label="Subcategory" value={form.subcategory} onChange={(e) => setForm({ ...form, subcategory: e.target.value })} options={subcats.map((s) => ({ value: s, label: s }))} placeholder="Select subcategory" disabled={!form.category} />
            <Input label="Brand Name" required value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="e.g. Samsung" />
            <Input label="Selling Price (₹)" type="number" required value={form.price || ''} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} placeholder="0" />
            <Input label="MRP (₹)" type="number" value={form.mrp || ''} onChange={(e) => setForm({ ...form, mrp: e.target.value ? Number(e.target.value) : undefined })} placeholder="Optional" />
            <Select label="Tax %" value={String(form.tax)} onChange={(e) => setForm({ ...form, tax: Number(e.target.value) })} options={TAX_OPTIONS} />
            <Input label="Quantity" type="number" required value={form.quantity || ''} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} placeholder="0" />
            <Input label="Other Additions (₹)" type="number" value={form.otherAdditions || ''} onChange={(e) => setForm({ ...form, otherAdditions: e.target.value ? Number(e.target.value) : undefined })} placeholder="Optional" />
            <Input label="Other Deductions (₹)" type="number" value={form.otherDeductions || ''} onChange={(e) => setForm({ ...form, otherDeductions: e.target.value ? Number(e.target.value) : undefined })} placeholder="Optional" />
          </div>
          <Textarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the product..." />
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-zinc-300 block mb-1.5">Bullet Points</label>
            <div className="flex gap-2 mb-2">
              <input type="text" value={bulletInput} onChange={(e) => setBulletInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addBullet())} placeholder="Add feature point, press Enter"
                className="flex-1 px-3 py-2 text-sm bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700 rounded-lg text-gray-800 dark:text-zinc-200 placeholder-gray-400 dark:placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-all" />
              <Button variant="secondary" size="sm" onClick={addBullet}>Add</Button>
            </div>
            {bullets.length > 0 && (
              <ul className="space-y-1.5">
                {bullets.map((b, i) => (
                  <li key={i} className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 dark:bg-zinc-800/40 border border-gray-100 dark:border-zinc-700/40 text-sm text-gray-700 dark:text-zinc-300">
                    <span>• {b}</span>
                    <button onClick={() => setBullets((prev) => prev.filter((_, j) => j !== i))} className="text-gray-400 dark:text-zinc-600 hover:text-red-500 dark:hover:text-red-400 transition-colors ml-2">×</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-zinc-300 block mb-1.5">Image URL</label>
            <input type="text" placeholder="Paste image URL and press Enter..." onKeyDown={(e) => { if (e.key === 'Enter') { const url = (e.target as HTMLInputElement).value.trim(); if (url) { setForm((f) => ({ ...f, images: [...f.images, url] })); (e.target as HTMLInputElement).value = '' } } }}
              className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700 rounded-lg text-gray-800 dark:text-zinc-200 placeholder-gray-400 dark:placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-all" />
            {form.images.length > 0 && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {form.images.map((img, i) => (
                  <div key={i} className="relative group">
                    <img src={img} alt="" className="w-16 h-16 rounded-lg object-cover bg-gray-100 dark:bg-zinc-800" />
                    <button onClick={() => setForm((f) => ({ ...f, images: f.images.filter((_, j) => j !== i) }))}
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">×</button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-3 justify-end pt-2 border-t border-gray-100 dark:border-zinc-800">
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editProduct ? 'Save Changes' : 'Add Product'}</Button>
          </div>
        </div>
      </Modal>

      {/* Photos Modal */}
      <Modal open={!!photoProduct} onClose={() => setPhotoProduct(null)} title="Product Photos" size="md">
        {photoProduct && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {photoProduct.images.map((img, i) => (
              <img key={i} src={img} alt="" className="w-full aspect-square rounded-xl object-cover bg-gray-100 dark:bg-zinc-800" />
            ))}
            {photoProduct.images.length === 0 && <div className="col-span-3 py-12 text-center text-gray-400 dark:text-zinc-600 text-sm">No photos uploaded</div>}
          </div>
        )}
      </Modal>

      <ConfirmDialog open={!!deleteProduct} onClose={() => setDeleteProduct(null)} onConfirm={handleDelete}
        title="Delete Product?" message={`Are you sure you want to delete "${deleteProduct?.name}"? This action cannot be undone.`} confirmLabel="Delete" />
    </div>
  )
}
