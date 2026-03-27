import { useState, useMemo } from 'react'
import { Plus, Search, Filter, Edit2, Trash2, Info, Package, Image as ImageIcon } from 'lucide-react'
import { TopNavbar } from '../components/layout/TopNavbar'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { Input, Select, Textarea } from '../components/ui/Input'
import { mockProducts } from '../services/mockData'
import { formatCurrency } from '../utils/cn'
import type { Product } from '../types'
import toast from 'react-hot-toast'

export function CatalogPage() {
  const [products, setProducts] = useState<Product[]>(mockProducts)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))]

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.brand.toLowerCase().includes(search.toLowerCase())
      const matchCategory = categoryFilter === 'All' || p.category === categoryFilter
      return matchSearch && matchCategory
    })
  }, [products, search, categoryFilter])

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      setProducts(products.filter(p => p.id !== id))
      toast.success('Product deleted successfully')
    }
  }

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    toast.success(editingProduct ? 'Product updated' : 'Product added')
    setIsAddModalOpen(false)
    setEditingProduct(null)
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#f5f6fb] dark:bg-[#0c0e12]">
      <TopNavbar title="Product Catalog" subtitle={`Manage your ${products.length} products`} />

      <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin">
        <div className="max-w-[1600px] mx-auto space-y-8">

          {/* Actions & Filters */}
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center" style={{ animation: 'fadeIn 0.5s ease-out 0.1s both' }}>
            <div className="flex flex-1 w-full md:w-auto gap-4">
              <div className="relative flex-1 max-w-md group">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9b9da1] group-focus-within:text-[#6E3DFB] transition-colors" />
                <input
                  type="text"
                  placeholder="Search products by name or Brand..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 text-sm font-medium bg-white/70 dark:bg-[#15171b]/80 backdrop-blur-md border border-white/40 dark:border-white/5 rounded-2xl text-[#2c2f33] dark:text-white placeholder-[#9b9da1] dark:placeholder-[#595c60] focus:outline-none focus:border-[#6E3DFB] focus:ring-4 focus:ring-[#6E3DFB]/10 shadow-sm transition-all"
                />
              </div>
              <div className="relative group min-w-[160px]">
                <Filter size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9b9da1] group-hover:text-[#6E3DFB] transition-colors z-10" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 text-sm font-bold bg-white/70 dark:bg-[#15171b]/80 backdrop-blur-md border border-white/40 dark:border-white/5 rounded-2xl text-[#595c60] dark:text-[#dadde4] focus:outline-none focus:border-[#6E3DFB] focus:ring-4 focus:ring-[#6E3DFB]/10 shadow-sm appearance-none transition-all cursor-pointer hover:text-[#2c2f33] dark:hover:text-white"
                >
                  {categories.map(c => <option key={c} value={c} className="bg-white dark:bg-[#15171b]">{c}</option>)}
                </select>
              </div>
            </div>
            <Button onClick={() => setIsAddModalOpen(true)} className="w-full md:w-auto rounded-2xl shadow-[0_4px_14px_0_rgb(110,61,251,0.39)] hover:shadow-[0_6px_20px_rgba(110,61,251,0.23)] hover:bg-[#5b32d6] px-6 py-2.5 font-bold transition-all flex items-center justify-center gap-2">
              <Plus size={18} strokeWidth={2.5} />
              Add Product
            </Button>
          </div>

          {/* Table Container */}
          <div
            className="bg-white/80 dark:bg-[#15171b]/80 backdrop-blur-2xl border border-white/40 dark:border-white/5 rounded-[2rem] shadow-[0_8px_40px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_40px_rgb(0,0,0,0.2)] overflow-hidden"
            style={{ animation: 'fadeIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.2s both' }}
          >
            <div className="overflow-x-auto p-2 md:p-4">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr>
                    <th className="px-5 py-4 text-[11px] font-bold text-[#9b9da1] uppercase tracking-widest border-b border-[#e6e8ee] dark:border-zinc-800/80">Product Info</th>
                    <th className="px-5 py-4 text-[11px] font-bold text-[#9b9da1] uppercase tracking-widest border-b border-[#e6e8ee] dark:border-zinc-800/80">Brand</th>
                    <th className="px-5 py-4 text-[11px] font-bold text-[#9b9da1] uppercase tracking-widest border-b border-[#e6e8ee] dark:border-zinc-800/80">Category</th>
                    <th className="px-5 py-4 text-[11px] font-bold text-[#9b9da1] uppercase tracking-widest border-b border-[#e6e8ee] dark:border-zinc-800/80 text-right">Price</th>
                    <th className="px-5 py-4 text-[11px] font-bold text-[#9b9da1] uppercase tracking-widest border-b border-[#e6e8ee] dark:border-zinc-800/80 text-right">Stock</th>
                    <th className="px-5 py-4 text-[11px] font-bold text-[#9b9da1] uppercase tracking-widest border-b border-[#e6e8ee] dark:border-zinc-800/80 text-center">Status</th>
                    <th className="px-5 py-4 text-[11px] font-bold text-[#9b9da1] uppercase tracking-widest border-b border-[#e6e8ee] dark:border-zinc-800/80 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eff1f6] dark:divide-zinc-800/50">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-16 text-center text-[#9b9da1] font-medium text-sm">
                        <div className="flex flex-col items-center gap-3">
                          <Package size={32} className="text-[#e6e8ee] dark:text-zinc-800" />
                          No products found matching your search.
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product, idx) => (
                      <tr key={product.id} className="hover:bg-[#f5f6fb] dark:hover:bg-zinc-800/40 transition-all duration-300 group" style={{ animation: `fadeIn 0.4s ease-out ${0.25 + (idx * 0.05)}s both` }}>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-[14px] bg-[#eff1f6] dark:bg-[#15171b] flex items-center justify-center overflow-hidden ring-2 ring-white dark:ring-[#15171b] shadow-sm relative group-hover:scale-105 transition-transform duration-300">
                              {product.images[0] ? (
                                <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                              ) : (
                                <ImageIcon size={20} className="text-[#9b9da1]" />
                              )}
                            </div>
                            <div>
                              <p className="text-[14px] font-extrabold text-[#2c2f33] dark:text-white tracking-tight">{product.name}</p>
                              {product.description && (
                                <p className="text-[12px] font-medium text-[#9b9da1] truncate max-w-[200px] mt-0.5">{product.description}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 font-mono text-[12px] font-bold text-[#595c60] dark:text-[#9b9da1] group-hover:text-[#6E3DFB] transition-colors">{product.brand}</td>
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-widest bg-gray-100 dark:bg-zinc-800 text-[#595c60] dark:text-[#dadde4]">
                            {product.category}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <p className="text-[14px] font-black tracking-tight text-[#2c2f33] dark:text-white">{formatCurrency(product.price)}</p>
                          {product.mrp && product.mrp > product.price && (
                            <p className="text-[11px] font-semibold text-[#9b9da1] line-through">{formatCurrency(product.mrp)}</p>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {product.quantity < 10 && <span title="Low Stock" className="flex"><Info size={14} className="text-rose-500" /></span>}
                            <span className={`text-[14px] font-extrabold ${product.quantity < 10 ? 'text-rose-600 dark:text-rose-400' : 'text-[#2c2f33] dark:text-[#dadde4]'}`}>
                              {product.quantity}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest
                            ${product.quantity > 0 ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 ring-1 ring-inset ring-emerald-600/20' : 'bg-[#f5f6fb] text-[#595c60] dark:bg-zinc-800 dark:text-[#dadde4] ring-1 ring-inset ring-[#9b9da1]/20'}
                          `}>
                            {product.quantity > 0 ? 'ACTIVE' : 'DRAFT'}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setEditingProduct(product)}
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
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        open={isAddModalOpen || !!editingProduct}
        onClose={() => { setIsAddModalOpen(false); setEditingProduct(null) }}
        title={editingProduct ? "Edit Product" : "Add New Product"}
        size="lg"
      >
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input label="Product Name" defaultValue={editingProduct?.name} placeholder="e.g. Wireless Headphones" required />
            <Input label="Brand" defaultValue={editingProduct?.brand} placeholder="e.g. Sony" required />
            <Input label="Price (₹)" type="number" defaultValue={editingProduct?.price} min={0} step={0.01} required />
            <Input label="MRP (Optional)" type="number" defaultValue={editingProduct?.mrp} min={0} step={0.01} />
            <Select label="Category" defaultValue={editingProduct?.category || categories[1] || ''} options={categories.filter(c => c !== 'All').map(c => ({ value: c, label: c }))} />
            <Input label="Quantity" type="number" defaultValue={editingProduct?.quantity ?? 10} min={0} required />
          </div>
          <Textarea label="Description" defaultValue={editingProduct?.description} rows={3} placeholder="Describe your product..." />
          <div className="pt-4 flex justify-end gap-3 border-t border-[#e6e8ee] dark:border-zinc-800">
            <Button type="button" variant="secondary" onClick={() => { setIsAddModalOpen(false); setEditingProduct(null) }}>Cancel</Button>
            <Button type="submit">Save Product</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
