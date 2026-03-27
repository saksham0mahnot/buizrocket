import { useState, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Eye, ChevronUp, ChevronDown, Truck, Package, Phone, Download, Upload, Edit2, Save, X, CheckCircle2, CreditCard } from 'lucide-react'
import { TopNavbar } from '../components/layout/TopNavbar'
import { Modal } from '../components/ui/Modal'
import { Button } from '../components/ui/Button'
import { mockOrders } from '../services/mockData'
import { formatCurrency, formatDate } from '../utils/cn'
import type { Order, OrderStatus } from '../types'
import toast from 'react-hot-toast'

type SortKey = 'orderNo' | 'userName' | 'amount' | 'status' | 'createdAt'
type SortDir = 'asc' | 'desc'

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: 'Pending', label: 'Pending' },
  { value: 'Shipped', label: 'Shipped' },
  { value: 'Delivered', label: 'Delivered' },
  { value: 'Cancelled', label: 'Cancelled' },
]

const STATUS_FILTER_OPTIONS: { value: OrderStatus | 'All'; label: string }[] = [
  { value: 'All', label: 'All Statuses' },
  ...STATUS_OPTIONS,
]

const statusStyle: Record<OrderStatus, string> = {
  Pending: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 ring-1 ring-inset ring-amber-500/20',
  Shipped: 'bg-[#00D1FF]/10 text-[#00647b] dark:text-[#37d4ff] ring-1 ring-inset ring-[#00D1FF]/20',
  Delivered: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 ring-1 ring-inset ring-emerald-600/20',
  Cancelled: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 ring-1 ring-inset ring-rose-600/20',
}

function printOrderReceipt(order: Order) {
  const items = order.products
    .map(
      (p) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;">${p.name}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center;">×${p.qty}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;">₹${(p.price * p.qty).toLocaleString('en-IN')}</td>
      </tr>`
    )
    .join('')

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>Invoice – ${order.orderNo}</title>
  <style>
    body { font-family: 'Segoe UI', sans-serif; color:#1a1a2e; padding:40px; max-width:720px; margin:auto; }
    h1 { font-size:22px; font-weight:800; letter-spacing:-0.5px; margin:0; }
    .badge { display:inline-block; padding:4px 12px; border-radius:999px; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.05em; background:#f0ebff; color:#6E3DFB; }
    .divider { border:none; border-top:1px solid #eee; margin:20px 0; }
    table { width:100%; border-collapse:collapse; font-size:14px; }
    th { text-align:left; padding:8px 12px; font-size:11px; text-transform:uppercase; letter-spacing:.08em; color:#888; border-bottom:2px solid #eee; }
    th:last-child, td:last-child { text-align:right; }
    .total-row td { font-weight:800; font-size:16px; border-top:2px solid #eee; padding-top:12px; }
    .label { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.08em; color:#888; margin-bottom:4px; }
    .value { font-size:14px; font-weight:600; }
    .grid { display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:24px; }
    @media print { body { padding:24px; } }
  </style>
</head>
<body>
  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;">
    <div>
      <h1>TAX INVOICE</h1>
      <div style="margin-top:8px;" class="badge">${order.status}</div>
    </div>
    <div style="text-align:right;">
      <div class="label">Order No.</div>
      <div class="value" style="font-size:18px;font-weight:800;">${order.orderNo}</div>
      <div style="font-size:12px;color:#888;margin-top:4px;">${formatDate(order.createdAt)}</div>
    </div>
  </div>

  <hr class="divider"/>

  <div class="grid">
    <div>
      <div class="label">Bill To</div>
      <div class="value">${order.userName}</div>
      <div style="font-size:13px;color:#555;">${order.userEmail}</div>
    </div>
    <div>
      <div class="label">Ship To</div>
      <div class="value" style="font-size:13px;">${order.shippingDetails.address}</div>
      <div style="font-size:13px;color:#555;">${order.shippingDetails.city}, ${order.shippingDetails.state} – ${order.shippingDetails.pincode}</div>
      <div style="font-size:13px;color:#555;">${order.shippingDetails.phone}</div>
    </div>
  </div>

  ${order.shippingDetails.trackingId ? `
  <div style="margin-bottom:20px;padding:10px 14px;background:#e8f9ff;border-radius:8px;font-size:13px;">
    <strong>Tracking:</strong> ${order.shippingDetails.carrier ?? ''} – ${order.shippingDetails.trackingId}
  </div>` : ''}

  <table>
    <thead><tr>
      <th>Item</th>
      <th style="text-align:center;">Qty</th>
      <th style="text-align:right;">Amount</th>
    </tr></thead>
    <tbody>${items}</tbody>
    <tfoot>
      <tr class="total-row">
        <td colspan="2">Total Amount</td>
        <td>${formatCurrency(order.amount)}</td>
      </tr>
    </tfoot>
  </table>

  <hr class="divider"/>
  <p style="font-size:12px;color:#aaa;text-align:center;">Thank you for your order! — Buizrocket Seller Portal</p>
</body>
</html>`

  const win = window.open('', '_blank')
  if (!win) return
  win.document.write(html)
  win.document.close()
  win.focus()
  setTimeout(() => { win.print() }, 300)
}

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(mockOrders)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'All'>('All')
  const [sortKey, setSortKey] = useState<SortKey>('createdAt')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [viewOrder, setViewOrder] = useState<Order | null>(null)
  const navigate = useNavigate()

  // Invoice upload state: orderId -> filename
  const [invoiceFiles, setInvoiceFiles] = useState<Record<string, string>>({})
  const invoiceInputRef = useRef<HTMLInputElement>(null)

  // Shipping edit state
  const [editingShipping, setEditingShipping] = useState(false)
  const [shippingDraft, setShippingDraft] = useState<Order['shippingDetails'] | null>(null)

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('asc') }
  }

  const filtered = useMemo(() => {
    let result = orders.filter((o) => {
      const matchSearch =
        o.orderNo.toLowerCase().includes(search.toLowerCase()) ||
        o.userName.toLowerCase().includes(search.toLowerCase()) ||
        o.userEmail.toLowerCase().includes(search.toLowerCase())
      const matchStatus = statusFilter === 'All' || o.status === statusFilter
      return matchSearch && matchStatus
    })
    result.sort((a, b) => {
      const av = a[sortKey] as string | number
      const bv = b[sortKey] as string | number
      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ? 1 : -1
      return 0
    })
    return result
  }, [orders, search, statusFilter, sortKey, sortDir])

  const handleInlineStatusChange = (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => o.id === orderId ? { ...o, status: newStatus, updatedAt: new Date().toISOString() } : o)
    )
    // Keep viewOrder in sync if it's the same order
    setViewOrder((prev) => prev?.id === orderId ? { ...prev, status: newStatus } : prev)
    toast.success(`Status updated to ${newStatus}`)
  }

  const handleInvoiceUpload = (e: React.ChangeEvent<HTMLInputElement>, orderId: string) => {
    const file = e.target.files?.[0]
    if (file) {
      setInvoiceFiles((prev) => ({ ...prev, [orderId]: file.name }))
      toast.success(`Invoice "${file.name}" uploaded!`)
    }
  }

  const handleSaveShipping = () => {
    if (!viewOrder || !shippingDraft) return
    setOrders((prev) =>
      prev.map((o) => o.id === viewOrder.id ? { ...o, shippingDetails: shippingDraft, updatedAt: new Date().toISOString() } : o)
    )
    setViewOrder((prev) => prev ? { ...prev, shippingDetails: shippingDraft } : prev)
    setEditingShipping(false)
    setShippingDraft(null)
    toast.success('Shipping details updated!')
  }

  const openViewModal = (order: Order) => {
    setViewOrder(order)
    setEditingShipping(false)
    setShippingDraft(null)
  }

  const closeViewModal = () => {
    setViewOrder(null)
    setEditingShipping(false)
    setShippingDraft(null)
  }

  const SortIcon = ({ k }: { k: SortKey }) => (
    <span className="inline-flex flex-col ml-1 opacity-40">
      <ChevronUp size={10} className={sortKey === k && sortDir === 'asc' ? 'opacity-100 text-[#6E3DFB]' : ''} />
      <ChevronDown size={10} className={sortKey === k && sortDir === 'desc' ? 'opacity-100 text-[#6E3DFB]' : ''} />
    </span>
  )

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#f5f6fb] dark:bg-[#0c0e12]">
      <TopNavbar title="Orders" subtitle={`${orders.length} total orders processing`} />
      <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin">
        <div className="max-w-[1600px] mx-auto space-y-8">

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between" style={{ animation: 'fadeIn 0.5s ease-out 0.1s both' }}>
            <div className="flex gap-4 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-72 group">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9b9da1] group-focus-within:text-[#6E3DFB] transition-colors" />
                <input
                  id="orders-search"
                  type="text"
                  placeholder="Search order or customer..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 text-sm font-medium bg-white/70 dark:bg-[#15171b]/80 backdrop-blur-md border border-white/40 dark:border-white/5 rounded-2xl text-[#2c2f33] dark:text-white placeholder-[#9b9da1] dark:placeholder-[#595c60] focus:outline-none focus:border-[#6E3DFB] focus:ring-4 focus:ring-[#6E3DFB]/10 shadow-sm transition-all"
                />
              </div>
              <div className="relative group">
                <select
                  id="orders-status-filter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'All')}
                  className="pl-4 pr-10 py-2.5 text-sm font-bold bg-white/70 dark:bg-[#15171b]/80 backdrop-blur-md border border-white/40 dark:border-white/5 rounded-2xl text-[#595c60] dark:text-[#dadde4] focus:outline-none focus:border-[#6E3DFB] focus:ring-4 focus:ring-[#6E3DFB]/10 shadow-sm appearance-none transition-all cursor-pointer hover:text-[#2c2f33] dark:hover:text-white"
                >
                  {STATUS_FILTER_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value} className="bg-white dark:bg-[#15171b]">{o.label}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#9b9da1]" />
              </div>
            </div>
            <span className="px-4 py-2.5 text-sm font-bold bg-[#6E3DFB]/10 text-[#6E3DFB] rounded-2xl border border-[#6E3DFB]/20 shadow-sm hidden sm:block">
              Last 30 Days
            </span>
          </div>

          {/* Table */}
          <div
            className="bg-white/80 dark:bg-[#15171b]/80 backdrop-blur-2xl border border-white/40 dark:border-white/5 rounded-[2rem] shadow-[0_8px_40px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_40px_rgb(0,0,0,0.2)] overflow-hidden"
            style={{ animation: 'fadeIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.2s both' }}
          >
            <div className="overflow-x-auto p-2 md:p-4">
              <table className="w-full text-left border-collapse min-w-[860px]">
                <thead>
                  <tr>
                    {[
                      { key: 'orderNo', label: 'Order No' },
                      { key: 'userName', label: 'Customer' },
                      { key: null, label: 'Products' },
                      { key: 'amount', label: 'Amount' },
                      { key: 'status', label: 'Status' },
                      { key: 'createdAt', label: 'Date' },
                      { key: null, label: 'Actions' },
                    ].map(({ key, label }) => (
                      <th
                        key={label}
                        onClick={() => key && handleSort(key as SortKey)}
                        className={`px-5 py-4 text-[11px] font-bold text-[#9b9da1] uppercase tracking-widest border-b border-[#e6e8ee] dark:border-zinc-800/80 ${key ? 'cursor-pointer hover:text-[#6E3DFB] transition-colors select-none' : ''}`}
                      >
                        <div className="flex items-center gap-1">
                          {label}
                          {key && <SortIcon k={key as SortKey} />}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eff1f6] dark:divide-zinc-800/50">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-16 text-center text-[#9b9da1] font-medium text-sm">
                        <div className="flex flex-col items-center gap-3">
                          <Package size={32} className="text-[#e6e8ee] dark:text-zinc-800" />
                          No orders found matching your criteria.
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((order, idx) => (
                      <tr key={order.id} className="hover:bg-[#f5f6fb] dark:hover:bg-zinc-800/40 transition-all duration-300 group" style={{ animation: `fadeIn 0.4s ease-out ${0.25 + (idx * 0.05)}s both` }}>
                        <td className="px-5 py-4 font-mono text-[13px] font-bold text-[#595c60] dark:text-[#9b9da1] group-hover:text-[#6E3DFB] transition-colors">{order.orderNo}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-[12px] bg-gradient-to-br from-[#6E3DFB]/10 to-[#FF61BC]/10 flex items-center justify-center text-[#6E3DFB] font-extrabold text-[14px] ring-2 ring-white dark:ring-[#15171b] shadow-sm transform group-hover:scale-105 transition-transform">
                              {order.userName.charAt(0)}
                            </div>
                            <div>
                              <p className="text-[14px] font-extrabold text-[#2c2f33] dark:text-white tracking-tight">{order.userName}</p>
                              <p className="text-[12px] font-semibold text-[#9b9da1]">{order.userEmail}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-col gap-1">
                            {order.products.slice(0, 2).map((p, i) => (
                              <div key={i} className="text-[12px] font-semibold text-[#595c60] dark:text-[#dadde4] flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#00D1FF]" />
                                <span className="truncate max-w-[150px]">{p.name}</span>
                                <span className="text-[#9b9da1] font-mono">×{p.qty}</span>
                              </div>
                            ))}
                            {order.products.length > 2 && (
                              <div className="text-[11px] font-bold text-[#6E3DFB] mt-0.5 ml-3">+{order.products.length - 2} more items</div>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-[14px] font-black tracking-tight text-[#2c2f33] dark:text-white">{formatCurrency(order.amount)}</td>

                        {/* Inline Status Dropdown */}
                        <td className="px-5 py-4">
                          <select
                            value={order.status}
                            onChange={(e) => handleInlineStatusChange(order.id, e.target.value as OrderStatus)}
                            className={`text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border-0 outline-none cursor-pointer appearance-none transition-all focus:ring-2 focus:ring-[#6E3DFB]/30 ${statusStyle[order.status]}`}
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s.value} value={s.value} className="bg-white dark:bg-zinc-900 text-gray-800 dark:text-white normal-case font-semibold text-sm tracking-normal">
                                {s.label}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td className="px-5 py-4 text-[13px] font-semibold text-[#9b9da1]">{formatDate(order.createdAt)}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              id={`view-order-${order.id}`}
                              onClick={() => openViewModal(order)}
                              className="p-2 rounded-xl text-[#9b9da1] hover:text-[#00D1FF] hover:bg-[#00D1FF]/10 transition-all shadow-sm ring-1 ring-inset ring-[#e6e8ee] dark:ring-white/5 bg-white dark:bg-zinc-800"
                              title="View Details"
                            >
                              <Eye size={16} strokeWidth={2.5} />
                            </button>
                            <button
                              id={`payment-order-${order.id}`}
                              onClick={() => navigate('/payments')}
                              className="p-2 rounded-xl text-[#9b9da1] hover:text-[#6E3DFB] hover:bg-[#6E3DFB]/10 transition-all shadow-sm ring-1 ring-inset ring-[#e6e8ee] dark:ring-white/5 bg-white dark:bg-zinc-800"
                              title="View Payment"
                            >
                              <CreditCard size={16} strokeWidth={2.5} />
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

      {/* View Order Modal */}
      <Modal open={!!viewOrder} onClose={closeViewModal} title={`Order ${viewOrder?.orderNo}`} description={`Placed on ${viewOrder ? formatDate(viewOrder.createdAt) : ''}`} size="lg">
        {viewOrder && (
          <div className="space-y-5">

            {/* Customer + Amount */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-[#f5f6fb] dark:bg-zinc-800/50 border border-[#e6e8ee] dark:border-zinc-700/50 shadow-inner">
                <p className="text-[11px] font-bold text-[#9b9da1] uppercase tracking-widest mb-1.5">Customer</p>
                <p className="text-[15px] font-extrabold text-[#2c2f33] dark:text-white">{viewOrder.userName}</p>
                <p className="text-[13px] font-medium text-[#595c60] dark:text-[#9b9da1]">{viewOrder.userEmail}</p>
              </div>
              <div className="p-5 rounded-2xl bg-[#6E3DFB]/5 dark:bg-[#6E3DFB]/10 border border-[#6E3DFB]/20 shadow-inner flex flex-col justify-between">
                <div>
                  <p className="text-[11px] font-bold text-[#6E3DFB] uppercase tracking-widest mb-1">Total Amount</p>
                  <p className="text-2xl font-black text-[#6E3DFB] tracking-tight">{formatCurrency(viewOrder.amount)}</p>
                </div>
                {/* Status change inside view modal */}
                <div className="mt-3">
                  <p className="text-[10px] font-bold text-[#9b9da1] uppercase tracking-widest mb-1.5">Order Status</p>
                  <select
                    value={viewOrder.status}
                    onChange={(e) => handleInlineStatusChange(viewOrder.id, e.target.value as OrderStatus)}
                    className={`text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border-0 outline-none cursor-pointer appearance-none transition-all focus:ring-2 focus:ring-[#6E3DFB]/30 ${statusStyle[viewOrder.status]}`}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s.value} value={s.value} className="bg-white dark:bg-zinc-900 text-gray-800 dark:text-white normal-case font-semibold text-sm tracking-normal">
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Ordered Items */}
            <div>
              <p className="text-[11px] font-bold text-[#9b9da1] uppercase tracking-widest mb-3">Ordered Items</p>
              <div className="space-y-2">
                {viewOrder.products.map((p, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-zinc-900 border border-[#e6e8ee] dark:border-zinc-800 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#eff1f6] dark:bg-zinc-800 flex items-center justify-center">
                        <Package size={14} className="text-[#9b9da1]" />
                      </div>
                      <span className="text-[14px] font-bold text-[#2c2f33] dark:text-[#dadde4]">{p.name}</span>
                    </div>
                    <div className="flex items-center gap-5">
                      <span className="text-[13px] font-mono font-bold text-[#9b9da1]">×{p.qty}</span>
                      <span className="text-[15px] font-black text-[#2c2f33] dark:text-white min-w-[80px] text-right">{formatCurrency(p.price * p.qty)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Details */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-[#f5f6fb] to-white dark:from-zinc-900 dark:to-zinc-800/80 border border-[#e6e8ee] dark:border-zinc-700/50 shadow-sm">
              <div className="flex items-center justify-between mb-4 border-b border-[#e6e8ee] dark:border-zinc-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <Truck size={16} className="text-[#00D1FF]" strokeWidth={2.5} />
                  <p className="text-[12px] font-bold text-[#595c60] dark:text-[#9b9da1] uppercase tracking-widest">Shipping Details</p>
                </div>
                {!editingShipping ? (
                  <button
                    onClick={() => { setEditingShipping(true); setShippingDraft({ ...viewOrder.shippingDetails }) }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold text-[#6E3DFB] hover:bg-[#6E3DFB]/10 transition-all"
                  >
                    <Edit2 size={12} strokeWidth={2.5} /> Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveShipping}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-all"
                    >
                      <Save size={12} strokeWidth={2.5} /> Save
                    </button>
                    <button
                      onClick={() => { setEditingShipping(false); setShippingDraft(null) }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold text-[#9b9da1] hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all"
                    >
                      <X size={12} strokeWidth={2.5} /> Cancel
                    </button>
                  </div>
                )}
              </div>

              {!editingShipping ? (
                <div className="text-[14px] font-medium text-[#595c60] dark:text-[#dadde4] space-y-1.5 ml-1">
                  <p>{viewOrder.shippingDetails.address}</p>
                  <p>{viewOrder.shippingDetails.city}, {viewOrder.shippingDetails.state} — <span className="font-mono font-bold text-[#2c2f33] dark:text-white">{viewOrder.shippingDetails.pincode}</span></p>
                  <p className="text-[#9b9da1] flex items-center gap-2 mt-2">
                    <Phone size={12} /> {viewOrder.shippingDetails.phone}
                  </p>
                  {viewOrder.shippingDetails.trackingId && (
                    <div className="mt-4 inline-block bg-[#00D1FF]/10 border border-[#00D1FF]/20 px-3 py-1.5 rounded-lg">
                      <p className="text-[#00647b] dark:text-[#37d4ff] font-mono text-[12px] font-bold">
                        {viewOrder.shippingDetails.carrier}: {viewOrder.shippingDetails.trackingId}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                shippingDraft && (
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Address', key: 'address' as const, colSpan: true },
                      { label: 'City', key: 'city' as const },
                      { label: 'State', key: 'state' as const },
                      { label: 'Pincode', key: 'pincode' as const },
                      { label: 'Phone', key: 'phone' as const },
                      { label: 'Carrier', key: 'carrier' as const },
                      { label: 'Tracking ID', key: 'trackingId' as const },
                    ].map(({ label, key, colSpan }) => (
                      <div key={key} className={colSpan ? 'col-span-2' : ''}>
                        <label className="block text-[11px] font-bold text-[#9b9da1] uppercase tracking-widest mb-1.5">{label}</label>
                        <input
                          type="text"
                          value={(shippingDraft[key] as string) ?? ''}
                          onChange={(e) => setShippingDraft((d) => d ? { ...d, [key]: e.target.value } : d)}
                          className="w-full px-3 py-2 text-sm font-medium bg-white dark:bg-zinc-900 border border-[#e6e8ee] dark:border-zinc-700 rounded-xl text-[#2c2f33] dark:text-white focus:outline-none focus:border-[#6E3DFB] focus:ring-2 focus:ring-[#6E3DFB]/20 transition-all"
                          placeholder={label}
                        />
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>

            {/* Invoice Upload */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-[#f5f6fb] to-white dark:from-zinc-900 dark:to-zinc-800/80 border border-[#e6e8ee] dark:border-zinc-700/50 shadow-sm">
              <div className="flex items-center gap-2.5 mb-4 border-b border-[#e6e8ee] dark:border-zinc-800 pb-3">
                <Upload size={15} className="text-[#6E3DFB]" strokeWidth={2.5} />
                <p className="text-[12px] font-bold text-[#595c60] dark:text-[#9b9da1] uppercase tracking-widest">Invoice</p>
              </div>
              <input
                ref={invoiceInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={(e) => handleInvoiceUpload(e, viewOrder.id)}
              />
              {invoiceFiles[viewOrder.id] ? (
                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" strokeWidth={2.5} />
                    <span className="text-[13px] font-bold text-emerald-700 dark:text-emerald-400 truncate max-w-[260px]">{invoiceFiles[viewOrder.id]}</span>
                  </div>
                  <button
                    onClick={() => invoiceInputRef.current?.click()}
                    className="text-[11px] font-bold text-[#6E3DFB] hover:underline ml-4 flex-shrink-0"
                  >
                    Replace
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => invoiceInputRef.current?.click()}
                  className="w-full flex flex-col items-center justify-center gap-2 py-6 rounded-xl border-2 border-dashed border-[#d5d7e0] dark:border-zinc-700 hover:border-[#6E3DFB] hover:bg-[#6E3DFB]/5 transition-all group cursor-pointer"
                >
                  <Upload size={22} className="text-[#9b9da1] group-hover:text-[#6E3DFB] transition-colors" strokeWidth={1.5} />
                  <div className="text-center">
                    <p className="text-[13px] font-bold text-[#595c60] dark:text-[#dadde4] group-hover:text-[#6E3DFB] transition-colors">Click to upload invoice</p>
                    <p className="text-[11px] text-[#9b9da1] mt-0.5">PDF, JPG, or PNG supported</p>
                  </div>
                </button>
              )}
            </div>

            {/* Download PDF Button */}
            <div className="pt-2 border-t border-[#e6e8ee] dark:border-zinc-800 flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => { closeViewModal(); navigate('/payments') }}
                className="flex items-center gap-2 rounded-2xl px-5 text-[#6E3DFB] border-[#6E3DFB]/20 hover:bg-[#6E3DFB]/10"
              >
                <CreditCard size={15} strokeWidth={2.5} />
                View Payment
              </Button>
              <Button
                variant="secondary"
                onClick={() => printOrderReceipt(viewOrder)}
                className="flex items-center gap-2 rounded-2xl px-5"
              >
                <Download size={15} strokeWidth={2.5} />
                Download PDF
              </Button>
              <Button onClick={closeViewModal} className="rounded-2xl px-5">
                Close
              </Button>
            </div>

          </div>
        )}
      </Modal>
    </div>
  )
}
