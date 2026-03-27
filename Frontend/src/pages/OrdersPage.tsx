import { useState, useMemo } from 'react'
import { Search, Eye, Pencil, ChevronUp, ChevronDown, Truck, Package, Phone } from 'lucide-react'
import { TopNavbar } from '../components/layout/TopNavbar'
import { Modal } from '../components/ui/Modal'
import { Select } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { mockOrders } from '../services/mockData'
import { formatCurrency, formatDate } from '../utils/cn'
import type { Order, OrderStatus } from '../types'
import toast from 'react-hot-toast'

type SortKey = 'orderNo' | 'userName' | 'amount' | 'status' | 'createdAt'
type SortDir = 'asc' | 'desc'

const STATUS_OPTIONS: { value: OrderStatus | 'All'; label: string }[] = [
  { value: 'All', label: 'All Statuses' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Shipped', label: 'Shipped' },
  { value: 'Delivered', label: 'Delivered' },
  { value: 'Cancelled', label: 'Cancelled' },
]

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(mockOrders)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'All'>('All')
  const [sortKey, setSortKey] = useState<SortKey>('createdAt')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [viewOrder, setViewOrder] = useState<Order | null>(null)
  const [editOrder, setEditOrder] = useState<Order | null>(null)
  const [newStatus, setNewStatus] = useState<OrderStatus>('Pending')

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

  const handleUpdateStatus = () => {
    if (!editOrder) return
    setOrders((prev) =>
      prev.map((o) => o.id === editOrder.id ? { ...o, status: newStatus, updatedAt: new Date().toISOString() } : o)
    )
    setEditOrder(null)
    toast.success(`Order ${editOrder.orderNo} updated to ${newStatus}`)
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

          {/* Filters & Actions */}
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
                  {STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value} className="bg-white dark:bg-[#15171b]">{o.label}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#9b9da1] group-hover:text-[#6E3DFB] transition-colors" />
              </div>
            </div>

            <div className="flex gap-2">
              <span className="px-4 py-2.5 text-sm font-bold bg-[#6E3DFB]/10 text-[#6E3DFB] rounded-2xl border border-[#6E3DFB]/20 shadow-sm hidden sm:block">
                Last 30 Days
              </span>
            </div>
          </div>

          {/* Table Container */}
          <div
            className="bg-white/80 dark:bg-[#15171b]/80 backdrop-blur-2xl border border-white/40 dark:border-white/5 rounded-[2rem] shadow-[0_8px_40px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_40px_rgb(0,0,0,0.2)] overflow-hidden"
            style={{ animation: 'fadeIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.2s both' }}
          >
            <div className="overflow-x-auto p-2 md:p-4">
              <table className="w-full text-left border-collapse min-w-[800px]">
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
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest
                            ${order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 ring-1 ring-inset ring-emerald-600/20' : ''}

                            ${order.status === 'Shipped' ? 'bg-[#00D1FF]/10 text-[#00647b] dark:text-[#37d4ff] ring-1 ring-inset ring-[#00D1FF]/20' : ''}
                            ${order.status === 'Pending' ? 'bg-[#f5f6fb] text-[#595c60] dark:bg-zinc-800 dark:text-[#dadde4] ring-1 ring-inset ring-[#9b9da1]/20' : ''}
                            ${order.status === 'Cancelled' ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 ring-1 ring-inset ring-rose-600/20' : ''}
                          `}>
                            {order.status === 'Pending' && <span className="w-1.5 h-1.5 rounded-full bg-[#595c60] dark:bg-[#dadde4] mr-2 animate-pulse" />}

                            {order.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-[13px] font-semibold text-[#9b9da1]">{formatDate(order.createdAt)}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              id={`view-order-${order.id}`}
                              onClick={() => setViewOrder(order)}
                              className="p-2 rounded-xl text-[#9b9da1] hover:text-[#00D1FF] hover:bg-[#00D1FF]/10 transition-all shadow-sm ring-1 ring-inset ring-[#e6e8ee] dark:ring-white/5 bg-white dark:bg-zinc-800"
                              title="View Details"
                            >
                              <Eye size={16} strokeWidth={2.5} />
                            </button>
                            <button
                              id={`edit-order-${order.id}`}
                              onClick={() => { setEditOrder(order); setNewStatus(order.status) }}
                              className="p-2 rounded-xl text-[#9b9da1] hover:text-[#6E3DFB] hover:bg-[#6E3DFB]/10 transition-all shadow-sm ring-1 ring-inset ring-[#e6e8ee] dark:ring-white/5 bg-white dark:bg-zinc-800"
                              title="Update Status"
                            >
                              <Pencil size={16} strokeWidth={2.5} />
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
      <Modal open={!!viewOrder} onClose={() => setViewOrder(null)} title={`Order ${viewOrder?.orderNo}`} description={`Placed on ${viewOrder ? formatDate(viewOrder.createdAt) : ''}`} size="lg">
        {viewOrder && (
          <div className="space-y-6">
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
                <div className="mt-2 self-start"><span className="px-3 py-1 bg-white dark:bg-black/40 rounded-full text-xs font-bold ring-1 ring-inset ring-[#e6e8ee] dark:ring-white/10 uppercase tracking-widest">{viewOrder.status}</span></div>
              </div>
            </div>
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
            <div className="p-5 rounded-2xl bg-gradient-to-br from-[#f5f6fb] to-white dark:from-zinc-900 dark:to-zinc-800/80 border border-[#e6e8ee] dark:border-zinc-700/50 shadow-sm">
              <div className="flex items-center gap-2.5 mb-4 border-b border-[#e6e8ee] dark:border-zinc-800 pb-3">
                <Truck size={16} className="text-[#00D1FF]" strokeWidth={2.5} />
                <p className="text-[12px] font-bold text-[#595c60] dark:text-[#9b9da1] uppercase tracking-widest">Shipping Details</p>
              </div>
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
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Status Modal */}
      <Modal open={!!editOrder} onClose={() => setEditOrder(null)} title="Update Order Status" description={editOrder?.orderNo} size="sm">
        {editOrder && (
          <div className="space-y-6">
            <Select
              label="New Status"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
              options={STATUS_OPTIONS.filter(o => o.value !== 'All').map(o => ({ value: o.value, label: o.label }))}
            />
            <div className="flex gap-3 justify-end pt-4 border-t border-[#e6e8ee] dark:border-zinc-800">
              <Button variant="secondary" onClick={() => setEditOrder(null)}>Cancel</Button>
              <Button onClick={handleUpdateStatus}>Update Status</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
