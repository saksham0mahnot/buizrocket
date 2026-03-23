import { useState, useMemo } from 'react'
import { Search, Eye, Pencil, ChevronUp, ChevronDown, Truck } from 'lucide-react'
import { TopNavbar } from '../components/layout/TopNavbar'
import { StatusBadge } from '../components/ui/Badge'
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
      <ChevronUp size={10} className={sortKey === k && sortDir === 'asc' ? 'opacity-100 text-blue-500' : ''} />
      <ChevronDown size={10} className={sortKey === k && sortDir === 'desc' ? 'opacity-100 text-blue-500' : ''} />
    </span>
  )

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopNavbar title="Orders" subtitle={`${orders.length} total orders`} />
      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin animate-fade-in space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500" />
            <input
              id="orders-search"
              type="text"
              placeholder="Search order or customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700 rounded-lg text-gray-800 dark:text-zinc-200 placeholder-gray-400 dark:placeholder-zinc-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all"
            />
          </div>
          <select
            id="orders-status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'All')}
            className="px-3 py-2 text-sm bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700 rounded-lg text-gray-800 dark:text-zinc-200 focus:outline-none focus:border-blue-500 appearance-none"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value} className="bg-white dark:bg-zinc-800">{o.label}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-gray-200 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-zinc-800">
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
                      className={`px-4 py-3.5 text-left text-xs font-medium text-gray-400 dark:text-zinc-500 uppercase tracking-wide ${key ? 'cursor-pointer hover:text-gray-700 dark:hover:text-zinc-300 select-none' : ''}`}
                    >
                      {label}
                      {key && <SortIcon k={key as SortKey} />}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-zinc-800/50">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-gray-400 dark:text-zinc-600 text-sm">
                      No orders found
                    </td>
                  </tr>
                ) : (
                  filtered.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/30 transition-colors">
                      <td className="px-4 py-3.5 font-mono text-xs font-semibold text-gray-600 dark:text-zinc-300">{order.orderNo}</td>
                      <td className="px-4 py-3.5">
                        <p className="text-gray-800 dark:text-zinc-200 font-medium text-sm">{order.userName}</p>
                        <p className="text-gray-400 dark:text-zinc-600 text-xs">{order.userEmail}</p>
                      </td>
                      <td className="px-4 py-3.5 text-gray-500 dark:text-zinc-400 text-xs">
                        {order.products.slice(0, 2).map((p, i) => (
                          <div key={i}>{p.name} ×{p.qty}</div>
                        ))}
                        {order.products.length > 2 && (
                          <div className="text-gray-400 dark:text-zinc-600">+{order.products.length - 2} more</div>
                        )}
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-gray-800 dark:text-zinc-200">{formatCurrency(order.amount)}</td>
                      <td className="px-4 py-3.5"><StatusBadge status={order.status} /></td>
                      <td className="px-4 py-3.5 text-gray-400 dark:text-zinc-500 text-xs">{formatDate(order.createdAt)}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <button
                            id={`view-order-${order.id}`}
                            onClick={() => setViewOrder(order)}
                            className="p-1.5 rounded-md text-gray-400 dark:text-zinc-600 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-400/10 transition-all"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            id={`edit-order-${order.id}`}
                            onClick={() => { setEditOrder(order); setNewStatus(order.status) }}
                            className="p-1.5 rounded-md text-gray-400 dark:text-zinc-600 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-400/10 transition-all"
                          >
                            <Pencil size={14} />
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

      {/* View Order Modal */}
      <Modal open={!!viewOrder} onClose={() => setViewOrder(null)} title={`Order ${viewOrder?.orderNo}`} description={`Placed on ${viewOrder ? formatDate(viewOrder.createdAt) : ''}`} size="lg">
        {viewOrder && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-700/50">
                <p className="text-xs text-gray-400 dark:text-zinc-600 mb-1">Customer</p>
                <p className="text-sm font-medium text-gray-800 dark:text-zinc-200">{viewOrder.userName}</p>
                <p className="text-xs text-gray-500 dark:text-zinc-500">{viewOrder.userEmail}</p>
              </div>
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-700/50">
                <p className="text-xs text-gray-400 dark:text-zinc-600 mb-1">Total Amount</p>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{formatCurrency(viewOrder.amount)}</p>
                <StatusBadge status={viewOrder.status} />
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 dark:text-zinc-500 uppercase tracking-wide mb-3">Ordered Items</p>
              <div className="space-y-2">
                {viewOrder.products.map((p, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-zinc-800/40 border border-gray-100 dark:border-zinc-700/40">
                    <span className="text-sm text-gray-700 dark:text-zinc-300">{p.name}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-gray-400 dark:text-zinc-600">×{p.qty}</span>
                      <span className="text-sm font-semibold text-gray-800 dark:text-zinc-200">{formatCurrency(p.price * p.qty)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-700/50">
              <div className="flex items-center gap-2 mb-3">
                <Truck size={14} className="text-gray-400 dark:text-zinc-500" />
                <p className="text-xs font-medium text-gray-400 dark:text-zinc-500 uppercase tracking-wide">Shipping Details</p>
              </div>
              <div className="text-sm text-gray-700 dark:text-zinc-300 space-y-1">
                <p>{viewOrder.shippingDetails.address}</p>
                <p>{viewOrder.shippingDetails.city}, {viewOrder.shippingDetails.state} — {viewOrder.shippingDetails.pincode}</p>
                <p className="text-gray-400 dark:text-zinc-500">{viewOrder.shippingDetails.phone}</p>
                {viewOrder.shippingDetails.trackingId && (
                  <p className="text-blue-600 dark:text-blue-400 font-mono text-xs mt-2">
                    {viewOrder.shippingDetails.carrier}: {viewOrder.shippingDetails.trackingId}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Status Modal */}
      <Modal open={!!editOrder} onClose={() => setEditOrder(null)} title="Update Order Status" description={editOrder?.orderNo} size="sm">
        {editOrder && (
          <div className="space-y-5">
            <Select
              label="New Status"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
              options={STATUS_OPTIONS.filter(o => o.value !== 'All').map(o => ({ value: o.value, label: o.label }))}
            />
            <div className="flex gap-3 justify-end pt-2">
              <Button variant="secondary" onClick={() => setEditOrder(null)}>Cancel</Button>
              <Button onClick={handleUpdateStatus}>Update Status</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
