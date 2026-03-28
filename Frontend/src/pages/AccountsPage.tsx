import { useState, useMemo } from 'react'
import {
  Search, ShoppingCart, CreditCard, Package, Clock,
  CheckCircle2, XCircle, AlertCircle, ChevronRight,
  Filter, TrendingUp, Users, DollarSign, FileText,
  ArrowUpRight, X, Eye, RefreshCw, ChevronDown,
} from 'lucide-react'
import { TopNavbar } from '../components/layout/TopNavbar'
import { formatCurrency, getInitials } from '../utils/cn'
import { mockOrders } from '../services/mockData'

// ─── Types ────────────────────────────────────────────────────
type ActivityType = 'order' | 'payment' | 'request'
type FilterTab    = 'all' | 'orders' | 'payments' | 'requests'

interface ItemRequest {
  id: string
  clientName: string
  clientEmail: string
  productName: string
  qty: number
  notes: string
  status: 'Pending' | 'Approved' | 'Rejected'
  requestedAt: string
}

interface ClientPortfolio {
  name: string
  email: string
  totalSpent: number
  orderCount: number
  requestCount: number
  avgOrderValue: number
  isRegular: boolean
  lastActivity: string
  activities: { type: ActivityType; date: string; data: any }[]
}

// ─── Mock Item Requests ────────────────────────────────────────
const mockRequests: ItemRequest[] = [
  { id: 'req-1', clientName: 'Rahul Sharma',  clientEmail: 'rahul@example.com',  productName: 'Sony WH-1000XM5 Headphones', qty: 10, notes: 'Bulk order for corporate gifting', status: 'Pending',  requestedAt: '2024-02-01T09:00:00Z' },
  { id: 'req-2', clientName: 'Priya Patel',   clientEmail: 'priya@example.com',  productName: 'Apple iPhone 15 Pro (256GB)', qty: 5,  notes: 'Need by end of month. Best price?', status: 'Approved', requestedAt: '2024-01-28T14:30:00Z' },
  { id: 'req-3', clientName: 'Amit Kumar',    clientEmail: 'amit@example.com',   productName: 'Custom Embroidered T-Shirts', qty: 200, notes: 'Custom logo printing, multiple sizes', status: 'Pending',  requestedAt: '2024-01-27T11:00:00Z' },
  { id: 'req-4', clientName: 'Sneha Reddy',   clientEmail: 'sneha@example.com',  productName: 'Ergonomic Office Chair', qty: 20, notes: 'For new office setup in Hyderabad', status: 'Rejected', requestedAt: '2024-01-25T16:00:00Z' },
  { id: 'req-5', clientName: 'Meera Nair',    clientEmail: 'meera@example.com',  productName: 'L-Shaped Gaming Desk', qty: 3,  notes: 'Looking for white colour variant', status: 'Approved', requestedAt: '2024-01-24T10:00:00Z' },
  { id: 'req-6', clientName: 'Rahul Sharma',  clientEmail: 'rahul@example.com',  productName: 'Mechanical Keyboard RGB', qty: 15, notes: 'Need Cherry MX red switches', status: 'Pending',  requestedAt: '2024-01-20T08:00:00Z' },
]

// ─── Helpers ───────────────────────────────────────────────────
function timeSince(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  const h = Math.floor(m / 60)
  const d = Math.floor(h / 24)
  if (d > 0) return `${d}d ago`
  if (h > 0) return `${h}h ago`
  return `${m}m ago`
}

function fmtDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ─── Status badge component ───────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Delivered: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    Paid:      'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    Approved:  'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    Shipped:   'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    Pending:   'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
    Cancelled: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
    Failed:    'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
    Rejected:  'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
    Refunded:  'bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-widest ${map[status] ?? 'bg-gray-100 text-gray-500'}`}>
      {status}
    </span>
  )
}

// ─── Activity type badge ────────────────────────────────────────
function TypeBadge({ type }: { type: ActivityType }) {
  if (type === 'order')   return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#6E3DFB]/10 text-[#6E3DFB] text-[10px] font-bold uppercase tracking-wider"><ShoppingCart size={9}/> Order</span>
  if (type === 'payment') return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#00D1FF]/10 text-[#007a99] dark:text-[#37d4ff] text-[10px] font-bold uppercase tracking-wider"><CreditCard size={9}/> Payment</span>
  return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 text-[10px] font-bold uppercase tracking-wider"><Package size={9}/> Request</span>
}

// ─── Request status icon ───────────────────────────────────────
function ReqIcon({ status }: { status: string }) {
  if (status === 'Approved') return <CheckCircle2 size={14} className="text-emerald-500" />
  if (status === 'Rejected') return <XCircle size={14} className="text-rose-500" />
  return <Clock size={14} className="text-amber-500" />
}

// ─── Detail Drawer ─────────────────────────────────────────────
function DetailDrawer({ item, onClose }: { item: typeof mockOrders[0] | ItemRequest | null; onClose: () => void }) {
  if (!item) return null
  const isOrder = 'orderNo' in item
  const isReq   = 'requestedAt' in item && !isOrder

  return (
    <div className="fixed inset-0 z-[9998]">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white dark:bg-[#15171b] shadow-[0_0_80px_rgb(0,0,0,0.3)] flex flex-col animate-[slideInRight_0.3s_cubic-bezier(0.22,1,0.36,1)_both]">
        {/* Drawer header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#e6e8ee] dark:border-zinc-800">
          <div>
            <p className="text-[11px] font-bold text-[#9b9da1] uppercase tracking-widest mb-0.5">
              {isOrder ? 'Order Details' : isReq ? 'Item Request' : 'Activity'}
            </p>
            <h2 className="text-lg font-black text-[#2c2f33] dark:text-white">
              {isOrder ? (item as typeof mockOrders[0]).orderNo : isReq ? (item as ItemRequest).productName : ''}
            </h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#f5f6fb] dark:bg-zinc-800 flex items-center justify-center text-[#9b9da1] hover:text-rose-500 transition-colors">
            <X size={15} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
          {isOrder && (() => {
            const o = item as typeof mockOrders[0]
            return (
              <>
                {/* Client */}
                <div className="p-4 rounded-2xl bg-[#f5f6fb] dark:bg-zinc-800/50 border border-[#e6e8ee] dark:border-zinc-700/50">
                  <p className="text-[11px] font-bold text-[#9b9da1] uppercase tracking-widest mb-3">Client</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6E3DFB]/20 to-[#FF61BC]/20 flex items-center justify-center text-[#6E3DFB] font-black text-sm">
                      {getInitials(o.userName)}
                    </div>
                    <div>
                      <p className="text-sm font-extrabold text-[#2c2f33] dark:text-white">{o.userName}</p>
                      <p className="text-xs text-[#9b9da1] font-medium">{o.userEmail}</p>
                    </div>
                  </div>
                </div>

                {/* Order summary */}
                <div>
                  <p className="text-[11px] font-bold text-[#9b9da1] uppercase tracking-widest mb-3">Products</p>
                  <div className="space-y-2">
                    {o.products.map((p, i) => (
                      <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-[#f5f6fb] dark:bg-zinc-800/40 text-sm">
                        <span className="font-semibold text-[#2c2f33] dark:text-white">{p.name} <span className="text-[#9b9da1]">× {p.qty}</span></span>
                        <span className="font-bold text-[#2c2f33] dark:text-white">{formatCurrency(p.price * p.qty)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center px-3 pt-2 border-t border-[#e6e8ee] dark:border-zinc-800">
                      <span className="text-sm font-bold text-[#2c2f33] dark:text-white">Total</span>
                      <span className="text-base font-black text-[#6E3DFB]">{formatCurrency(o.amount)}</span>
                    </div>
                  </div>
                </div>

                {/* Payment */}
                <div>
                  <p className="text-[11px] font-bold text-[#9b9da1] uppercase tracking-widest mb-3">Payment</p>
                  <div className="p-4 rounded-2xl bg-[#f5f6fb] dark:bg-zinc-800/50 border border-[#e6e8ee] dark:border-zinc-700/50 space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-[#9b9da1] font-medium">Method</span><span className="font-bold text-[#2c2f33] dark:text-white">{o.payment.method}</span></div>
                    <div className="flex justify-between"><span className="text-[#9b9da1] font-medium">Status</span><StatusBadge status={o.payment.status} /></div>
                    <div className="flex justify-between"><span className="text-[#9b9da1] font-medium">Gateway</span><span className="font-bold text-[#2c2f33] dark:text-white">{o.payment.gateway}</span></div>
                    <div className="flex justify-between"><span className="text-[#9b9da1] font-medium">Txn ID</span><span className="font-mono text-[11px] text-[#595c60] dark:text-zinc-400">{o.payment.transactionId}</span></div>
                    {o.payment.paidAt && <div className="flex justify-between"><span className="text-[#9b9da1] font-medium">Paid at</span><span className="font-semibold text-[#2c2f33] dark:text-white">{fmtDate(o.payment.paidAt)}</span></div>}
                    {o.payment.refundedAt && <div className="flex justify-between"><span className="text-[#9b9da1] font-medium">Refunded</span><span className="font-semibold text-purple-600">{fmtDate(o.payment.refundedAt)}</span></div>}
                  </div>
                </div>

                {/* Shipping */}
                <div>
                  <p className="text-[11px] font-bold text-[#9b9da1] uppercase tracking-widest mb-3">Shipping</p>
                  <div className="p-4 rounded-2xl bg-[#f5f6fb] dark:bg-zinc-800/50 border border-[#e6e8ee] dark:border-zinc-700/50 text-sm space-y-1">
                    <p className="font-semibold text-[#2c2f33] dark:text-white">{o.shippingDetails.address}, {o.shippingDetails.city}</p>
                    <p className="text-[#9b9da1]">{o.shippingDetails.state} — {o.shippingDetails.pincode}</p>
                    <p className="text-[#9b9da1]">{o.shippingDetails.phone}</p>
                    {o.shippingDetails.trackingId && (
                      <div className="flex items-center gap-2 pt-2">
                        <span className="text-[#9b9da1]">Tracking:</span>
                        <span className="font-mono font-bold text-[#6E3DFB] text-xs">{o.shippingDetails.trackingId}</span>
                        <span className="text-[#9b9da1]">via {o.shippingDetails.carrier}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Timeline */}
                <div>
                  <p className="text-[11px] font-bold text-[#9b9da1] uppercase tracking-widest mb-3">Payment Timeline</p>
                  <div className="relative pl-4 space-y-3">
                    {o.payment.timeline.map((t, i) => (
                      <div key={i} className="relative pl-6">
                        <div className="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-[#6E3DFB]" />
                        {i < o.payment.timeline.length - 1 && <div className="absolute left-[3px] top-3 bottom-0 w-[2px] bg-[#e6e8ee] dark:bg-zinc-800" />}
                        <p className="text-sm font-semibold text-[#2c2f33] dark:text-white">{t.event}</p>
                        <p className="text-[11px] text-[#9b9da1] font-medium">{fmtDate(t.time)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )
          })()}

          {isReq && (() => {
            const r = item as ItemRequest
            return (
              <>
                <div className="p-4 rounded-2xl bg-[#f5f6fb] dark:bg-zinc-800/50 border border-[#e6e8ee] dark:border-zinc-700/50">
                  <p className="text-[11px] font-bold text-[#9b9da1] uppercase tracking-widest mb-3">Client</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400/20 to-orange-500/20 flex items-center justify-center text-amber-600 font-black text-sm">
                      {getInitials(r.clientName)}
                    </div>
                    <div>
                      <p className="text-sm font-extrabold text-[#2c2f33] dark:text-white">{r.clientName}</p>
                      <p className="text-xs text-[#9b9da1] font-medium">{r.clientEmail}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    { label: 'Product Requested', value: r.productName },
                    { label: 'Quantity',           value: `${r.qty} units` },
                    { label: 'Requested on',       value: fmtDate(r.requestedAt) },
                    { label: 'Status',             value: <StatusBadge status={r.status} /> },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between items-center p-3 rounded-xl bg-[#f5f6fb] dark:bg-zinc-800/40 text-sm">
                      <span className="text-[#9b9da1] font-medium">{label}</span>
                      <span className="font-bold text-[#2c2f33] dark:text-white">{value as React.ReactNode}</span>
                    </div>
                  ))}
                </div>

                {r.notes && (
                  <div>
                    <p className="text-[11px] font-bold text-[#9b9da1] uppercase tracking-widest mb-2">Notes</p>
                    <p className="text-sm text-[#595c60] dark:text-zinc-300 bg-[#f5f6fb] dark:bg-zinc-800/50 p-4 rounded-2xl border border-[#e6e8ee] dark:border-zinc-700/50 leading-relaxed">
                      "{r.notes}"
                    </p>
                  </div>
                )}

                {r.status === 'Pending' && (
                  <div className="flex gap-3 pt-2">
                    <button className="flex-1 py-2.5 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-400 shadow-lg hover:scale-105 transition-all">
                      Approve Request
                    </button>
                    <button className="flex-1 py-2.5 rounded-2xl text-sm font-bold border border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all">
                      Reject
                    </button>
                  </div>
                )}
              </>
            )
          })()}
        </div>
      </div>
    </div>
  )
}

// ─── Client Portfolio Drawer ───────────────────────────────────
function ClientPortfolioDrawer({ portfolio, onClose, onViewActivity }: { portfolio: ClientPortfolio | null; onClose: () => void; onViewActivity: (item: any) => void }) {
  if (!portfolio) return null

  return (
    <div className="fixed inset-0 z-[9999]">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-lg bg-white dark:bg-[#15171b] shadow-[0_0_80px_rgb(0,0,0,0.3)] flex flex-col animate-[slideInRight_0.3s_cubic-bezier(0.22,1,0.36,1)_both]">
        {/* Header */}
        <div className="px-6 py-6 border-b border-[#e6e8ee] dark:border-zinc-800 bg-gradient-to-r from-[#6E3DFB]/5 to-transparent">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6E3DFB] to-[#FF61BC] flex items-center justify-center text-white text-2xl font-black shadow-lg">
                {getInitials(portfolio.name)}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-black text-[#2c2f33] dark:text-white leading-none">{portfolio.name}</h2>
                  {portfolio.isRegular && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[9px] font-black uppercase tracking-wider">
                      <TrendingUp size={10} /> Regular
                    </span>
                  )}
                </div>
                <p className="text-sm font-medium text-[#9b9da1]">{portfolio.email}</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#f5f6fb] dark:bg-zinc-800 flex items-center justify-center text-[#9b9da1] hover:text-rose-500 transition-colors">
              <X size={15} />
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-[#e6e8ee] dark:border-zinc-800 shadow-sm">
              <p className="text-[10px] font-bold text-[#9b9da1] uppercase tracking-widest mb-1">Total Spent</p>
              <p className="text-sm font-black text-[#6E3DFB]">{formatCurrency(portfolio.totalSpent)}</p>
            </div>
            <div className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-[#e6e8ee] dark:border-zinc-800 shadow-sm">
              <p className="text-[10px] font-bold text-[#9b9da1] uppercase tracking-widest mb-1">Orders</p>
              <p className="text-sm font-black text-[#2c2f33] dark:text-white">{portfolio.orderCount}</p>
            </div>
            <div className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-[#e6e8ee] dark:border-zinc-800 shadow-sm">
              <p className="text-[10px] font-bold text-[#9b9da1] uppercase tracking-widest mb-1">Avg Order</p>
              <p className="text-sm font-black text-[#2c2f33] dark:text-white">{formatCurrency(portfolio.avgOrderValue)}</p>
            </div>
          </div>
        </div>

        {/* History timeline */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          <h3 className="text-[11px] font-bold text-[#9b9da1] uppercase tracking-widest mb-6 flex items-center gap-2">
            <Clock size={12} /> Full Activity History
          </h3>
          
          <div className="relative space-y-8 pl-4 border-l-2 border-[#eff1f6] dark:border-zinc-800/50 ml-2">
            {portfolio.activities.map((act, i) => {
              const item = act.data
              const isOrder = act.type === 'order'
              return (
                <div key={i} className="relative">
                  {/* Dot */}
                  <div className={`absolute -left-[23px] top-1 w-4 h-4 rounded-full border-4 border-white dark:border-[#15171b] shadow-sm ${
                    act.type === 'order' ? 'bg-[#6E3DFB]' : 'bg-amber-400'
                  }`} />
                  
                  <div 
                    className="p-4 rounded-2xl bg-[#f5f6fb] dark:bg-zinc-800/40 border border-[#e6e8ee] dark:border-zinc-700/50 hover:border-[#6E3DFB]/30 hover:shadow-md transition-all cursor-pointer group"
                    onClick={() => onViewActivity(item)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-[10px] font-bold text-[#9b9da1] uppercase tracking-widest mb-1">{fmtDate(act.date)}</p>
                        <h4 className="text-sm font-extrabold text-[#2c2f33] dark:text-white group-hover:text-[#6E3DFB] transition-colors">
                          {isOrder ? (item as typeof mockOrders[0]).orderNo : (item as ItemRequest).productName}
                        </h4>
                      </div>
                      <TypeBadge type={act.type} />
                    </div>
                    
                    <div className="flex justify-between items-center text-xs">
                      <p className="text-[#595c60] dark:text-zinc-400 font-medium">
                        {isOrder ? `${(item as typeof mockOrders[0]).products.length} products` : `${(item as ItemRequest).qty} units`}
                      </p>
                      <p className="font-bold text-[#2c2f33] dark:text-white">
                        {isOrder ? formatCurrency((item as typeof mockOrders[0]).amount) : <StatusBadge status={(item as ItemRequest).status} />}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#e6e8ee] dark:border-zinc-800">
          <button className="w-full py-3 rounded-2xl bg-[#6E3DFB] text-white font-bold text-sm shadow-[0_4px_14px_rgba(110,61,251,0.4)] hover:bg-[#5b32d6] transition-all">
            Send Message to Client
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────
export function AccountsPage() {
  const [search,      setSearch]    = useState('')
  const [tab,         setTab]       = useState<FilterTab>('all')
  const [orderFilter, setOFilter]   = useState('All')
  const [reqFilter,   setRFilter]   = useState('All')
  const [drawerItem,  setDrawerItem] = useState<typeof mockOrders[0] | ItemRequest | null>(null)
  const [selectedClientEmail, setSelectedClientEmail] = useState<string | null>(null)

  // Summary stats
  const stats = useMemo(() => {
    const totalRevenue = mockOrders.filter(o => o.payment.status === 'Paid').reduce((s, o) => s + o.amount, 0)
    const totalOrders  = mockOrders.length
    const pendingReqs  = mockRequests.filter(r => r.status === 'Pending').length
    const clients      = new Set([...mockOrders.map(o => o.userEmail), ...mockRequests.map(r => r.clientEmail)]).size
    return { totalRevenue, totalOrders, pendingReqs, clients }
  }, [])

  // Unified activities list
  const activities = useMemo(() => {
    const sq = search.toLowerCase()

    const orders = (tab === 'all' || tab === 'orders') && mockOrders
      .filter(o =>
        (orderFilter === 'All' || o.status === orderFilter) &&
        (o.userName.toLowerCase().includes(sq) || o.orderNo.toLowerCase().includes(sq) || o.userEmail.toLowerCase().includes(sq))
      )
      .map(o => ({ type: 'order' as ActivityType, date: o.createdAt, data: o }))

    const requests = (tab === 'all' || tab === 'requests') && mockRequests
      .filter(r =>
        (reqFilter === 'All' || r.status === reqFilter) &&
        (r.clientName.toLowerCase().includes(sq) || r.productName.toLowerCase().includes(sq) || r.clientEmail.toLowerCase().includes(sq))
      )
      .map(r => ({ type: 'request' as ActivityType, date: r.requestedAt, data: r }))

    return [
      ...(orders || []),
      ...(requests || []),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [search, tab, orderFilter, reqFilter])
  const tabCounts = useMemo(() => ({
    all:      mockOrders.length + mockRequests.length,
    orders:   mockOrders.length,
    payments: mockOrders.filter(o => o.payment.status === 'Paid').length,
    requests: mockRequests.length,
  }), [])

  // Derive client portfolio
  const clientPortfolio = useMemo(() => {
    if (!selectedClientEmail) return null
    
    const clientOrders = mockOrders.filter(o => o.userEmail === selectedClientEmail)
    const clientReqs   = mockRequests.filter(r => r.clientEmail === selectedClientEmail)
    
    if (clientOrders.length === 0 && clientReqs.length === 0) return null
    
    const name = clientOrders[0]?.userName || clientReqs[0]?.clientName
    const totalSpent = clientOrders.filter(o => o.payment.status === 'Paid').reduce((s, o) => s + o.amount, 0)
    
    const activities = [
      ...clientOrders.map(o => ({ type: 'order' as ActivityType, date: o.createdAt, data: o })),
      ...clientReqs.map(r => ({ type: 'request' as ActivityType, date: r.requestedAt, data: r }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return {
      name,
      email: selectedClientEmail,
      totalSpent,
      orderCount: clientOrders.length,
      requestCount: clientReqs.length,
      avgOrderValue: clientOrders.length ? totalSpent / clientOrders.length : 0,
      isRegular: clientOrders.length >= 3,
      lastActivity: activities[0]?.date,
      activities
    } as ClientPortfolio
  }, [selectedClientEmail])

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#f5f6fb] dark:bg-[#0c0e12]">
      <TopNavbar title="Manage Accounts" subtitle="Complete history of payments, orders & item requests" />

      <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin">
        <div className="max-w-[1600px] mx-auto space-y-8">

          {/* ─── KPI Cards ─────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[
              { label: 'Total Revenue',    value: formatCurrency(stats.totalRevenue), icon: DollarSign,  color: 'from-[#6E3DFB] to-[#FF61BC]', delay: 0   },
              { label: 'Total Orders',     value: stats.totalOrders,                  icon: ShoppingCart, color: 'from-[#00D1FF] to-[#6E3DFB]', delay: 0.1 },
              { label: 'Item Requests',    value: stats.pendingReqs + ' pending',     icon: Package,      color: 'from-[#FFB800] to-[#FF6B35]', delay: 0.2 },
              { label: 'Unique Clients',   value: stats.clients,                      icon: Users,        color: 'from-[#34d399] to-[#059669]', delay: 0.3 },
            ].map(s => (
              <div
                key={s.label}
                className="group relative bg-white/80 dark:bg-[#15171b]/80 backdrop-blur-2xl border border-white/40 dark:border-white/5 rounded-[2rem] p-6 shadow-[0_8px_40px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_40px_rgb(0,0,0,0.2)] hover:shadow-[0_12px_50px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_12px_50px_rgb(0,0,0,0.3)] transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                style={{ animation: `scaleIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) ${0.1 + s.delay}s both` }}
              >
                <div className={`w-12 h-12 rounded-[1rem] bg-gradient-to-br ${s.color} flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <s.icon size={20} strokeWidth={2.5} />
                </div>
                <p className="text-[12px] font-bold text-[#9b9da1] uppercase tracking-widest mb-1">{s.label}</p>
                <p className="text-2xl font-black text-[#2c2f33] dark:text-white tracking-tight">{s.value}</p>
                <div className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full blur-2xl pointer-events-none opacity-50 group-hover:scale-150 transition-transform duration-700" style={{ background: `linear-gradient(135deg, ${s.color.includes('6E3DFB') ? '#6E3DFB22' : '#00D1FF22'}, transparent)` }} />
              </div>
            ))}
          </div>

          {/* ─── Tabs + Filters ───────────────────── */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between" style={{ animation: 'fadeIn 0.5s ease-out 0.2s both' }}>
            {/* Tabs */}
            <div className="flex items-center gap-1 p-1 bg-white/80 dark:bg-[#15171b]/80 backdrop-blur-xl border border-white/40 dark:border-white/5 rounded-2xl shadow-sm w-fit">
              {([
                { key: 'all',      label: 'All Activity' },
                { key: 'orders',   label: 'Orders' },
                { key: 'requests', label: 'Requests' },
              ] as { key: FilterTab; label: string }[]).map(t => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                    tab === t.key
                      ? 'bg-gradient-to-r from-[#6E3DFB] to-[#8B5CF6] text-white shadow-[0_2px_12px_rgba(110,61,251,0.3)]'
                      : 'text-[#9b9da1] hover:text-[#2c2f33] dark:hover:text-white'
                  }`}
                >
                  {t.label}
                  <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${tab === t.key ? 'bg-white/20' : 'bg-[#f5f6fb] dark:bg-zinc-800 text-[#9b9da1]'}`}>
                    {tabCounts[t.key]}
                  </span>
                </button>
              ))}
            </div>

            {/* Search + Filters */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative group">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9b9da1] group-focus-within:text-[#6E3DFB] transition-colors" />
                <input
                  type="text"
                  placeholder="Search clients, orders…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-56 pl-9 pr-4 py-2.5 text-sm font-medium bg-white/80 dark:bg-[#15171b]/80 backdrop-blur-xl border border-white/40 dark:border-white/5 rounded-2xl text-[#2c2f33] dark:text-white placeholder-[#9b9da1] focus:outline-none focus:border-[#6E3DFB] focus:ring-4 focus:ring-[#6E3DFB]/10 shadow-sm transition-all"
                />
              </div>

              {(tab === 'all' || tab === 'orders') && (
                <div className="relative group">
                  <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9b9da1]" />
                  <select
                    value={orderFilter}
                    onChange={e => setOFilter(e.target.value)}
                    className="pl-8 pr-7 py-2.5 text-sm font-bold bg-white/80 dark:bg-[#15171b]/80 border border-white/40 dark:border-white/5 rounded-2xl text-[#2c2f33] dark:text-white focus:outline-none focus:border-[#6E3DFB] appearance-none shadow-sm cursor-pointer"
                  >
                    {['All', 'Delivered', 'Shipped', 'Pending', 'Cancelled'].map(v => <option key={v}>{v}</option>)}
                  </select>
                  <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9b9da1] pointer-events-none" />
                </div>
              )}

              {(tab === 'all' || tab === 'requests') && (
                <div className="relative group">
                  <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9b9da1]" />
                  <select
                    value={reqFilter}
                    onChange={e => setRFilter(e.target.value)}
                    className="pl-8 pr-7 py-2.5 text-sm font-bold bg-white/80 dark:bg-[#15171b]/80 border border-white/40 dark:border-white/5 rounded-2xl text-[#2c2f33] dark:text-white focus:outline-none focus:border-[#6E3DFB] appearance-none shadow-sm cursor-pointer"
                  >
                    {['All', 'Pending', 'Approved', 'Rejected'].map(v => <option key={v}>{v}</option>)}
                  </select>
                  <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9b9da1] pointer-events-none" />
                </div>
              )}
            </div>
          </div>

          {/* ─── Activity Feed ─────────────────────── */}
          <div
            className="bg-white/80 dark:bg-[#15171b]/80 backdrop-blur-2xl border border-white/40 dark:border-white/5 rounded-[2rem] shadow-[0_8px_40px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_40px_rgb(0,0,0,0.2)] overflow-hidden"
            style={{ animation: 'fadeIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.3s both' }}
          >
            {/* Table header */}
            <div className="hidden md:grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_auto] gap-4 px-6 py-3 border-b border-[#e6e8ee] dark:border-zinc-800/80">
              {['Client',  'Details', 'Type', 'Amount / Qty', 'Status', ''].map(h => (
                <p key={h} className="text-[11px] font-bold text-[#9b9da1] uppercase tracking-widest">{h}</p>
              ))}
            </div>

            {activities.length === 0 ? (
              <div className="flex flex-col items-center gap-4 py-20 text-center">
                <div className="w-16 h-16 rounded-[1.5rem] bg-[#f5f6fb] dark:bg-zinc-800 flex items-center justify-center">
                  <FileText size={28} className="text-[#9b9da1]" />
                </div>
                <p className="text-[#9b9da1] font-semibold text-sm">No activity found</p>
              </div>
            ) : (
              <div className="divide-y divide-[#eff1f6] dark:divide-zinc-800/50">
                {activities.map(({ type, data }, idx) => {
                  const isOrder = type === 'order'
                  const o = data as typeof mockOrders[0]
                  const r = data as ItemRequest

                  return (
                    <div
                      key={isOrder ? o.id : r.id}
                      className="grid grid-cols-1 md:grid-cols-[2fr_1.5fr_1fr_1fr_1fr_auto] gap-3 md:gap-4 items-center px-6 py-4 hover:bg-[#f5f6fb]/80 dark:hover:bg-zinc-800/40 transition-all duration-200 group cursor-pointer"
                      style={{ animation: `fadeIn 0.35s ease-out ${0.05 * idx}s both` }}
                      onClick={() => setDrawerItem(data as typeof mockOrders[0])}
                    >
                      {/* Client */}
                      <div 
                        className="flex items-center gap-3 min-w-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedClientEmail(isOrder ? o.userEmail : r.clientEmail)
                        }}
                      >
                        <div className={`w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center font-black text-xs shadow-sm group-hover:scale-110 transition-transform ${
                          isOrder
                            ? 'bg-gradient-to-br from-[#6E3DFB]/15 to-[#FF61BC]/15 text-[#6E3DFB]'
                            : 'bg-gradient-to-br from-amber-400/15 to-orange-500/15 text-amber-600'
                        }`}>
                          {getInitials(isOrder ? o.userName : r.clientName)}
                        </div>
                        <div className="min-w-0 group/name">
                          <div className="flex items-center gap-1.5">
                            <p className="text-[13px] font-extrabold text-[#2c2f33] dark:text-white truncate group-hover/name:text-[#6E3DFB] transition-colors">
                              {isOrder ? o.userName : r.clientName}
                            </p>
                            {((isOrder ? mockOrders.filter(mo => mo.userEmail === o.userEmail).length : mockOrders.filter(mo => mo.userEmail === r.clientEmail).length) >= 3) && (
                              <span title="Regular Customer" className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-[11px] text-[#9b9da1] font-medium truncate">
                            {isOrder ? o.userEmail : r.clientEmail}
                          </p>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="min-w-0">
                        <p className="text-[12px] font-bold text-[#2c2f33] dark:text-white truncate">
                          {isOrder ? o.orderNo : r.productName}
                        </p>
                        <p className="text-[11px] text-[#9b9da1] font-medium">
                          {isOrder
                            ? `${o.products.length} item${o.products.length > 1 ? 's' : ''} · ${timeSince(o.createdAt)}`
                            : `Qty ${r.qty} · ${timeSince(r.requestedAt)}`
                          }
                        </p>
                      </div>

                      {/* Type badge */}
                      <div><TypeBadge type={type} /></div>

                      {/* Amount / Qty */}
                      <div>
                        {isOrder ? (
                          <p className="text-[13px] font-black text-[#2c2f33] dark:text-white">{formatCurrency(o.amount)}</p>
                        ) : (
                          <p className="text-[13px] font-bold text-[#2c2f33] dark:text-white">{r.qty} <span className="text-[#9b9da1] font-medium">units</span></p>
                        )}
                      </div>

                      {/* Status */}
                      <div>
                        {isOrder ? (
                          <div className="flex flex-col gap-1">
                            <StatusBadge status={o.status} />
                            {o.payment.status !== 'Paid' && <StatusBadge status={o.payment.status} />}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <ReqIcon status={r.status} />
                            <StatusBadge status={r.status} />
                          </div>
                        )}
                      </div>

                      {/* View action */}
                      <button
                        className="w-8 h-8 rounded-xl bg-[#f5f6fb] dark:bg-zinc-800 flex items-center justify-center text-[#9b9da1] hover:text-[#6E3DFB] hover:bg-[#6E3DFB]/10 transition-all opacity-0 group-hover:opacity-100"
                        onClick={e => { e.stopPropagation(); setDrawerItem(data as typeof mockOrders[0]) }}
                      >
                        <Eye size={14} />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* ─── Requests Quick Summary panel ─────── */}
          {mockRequests.filter(r => r.status === 'Pending').length > 0 && (tab === 'all' || tab === 'requests') && (
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 border border-amber-200/60 dark:border-amber-800/30 rounded-[2rem] p-6" style={{ animation: 'fadeIn 0.5s ease-out 0.4s both' }}>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-lg">
                  <AlertCircle size={17} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#2c2f33] dark:text-white">Pending Item Requests</h3>
                  <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">These need your attention</p>
                </div>
                <span className="ml-auto px-2.5 py-1 rounded-full bg-amber-500 text-white text-[11px] font-black">
                  {mockRequests.filter(r => r.status === 'Pending').length} pending
                </span>
              </div>
              <div className="space-y-3">
                {mockRequests.filter(r => r.status === 'Pending').map(r => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between p-4 bg-white/70 dark:bg-[#15171b]/60 rounded-2xl border border-amber-200/50 dark:border-amber-800/20 cursor-pointer hover:shadow-md transition-all"
                    onClick={() => setDrawerItem(r)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 font-black text-xs">
                        {getInitials(r.clientName)}
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-[#2c2f33] dark:text-white">{r.productName}</p>
                        <p className="text-[11px] text-[#9b9da1]">{r.clientName} · {r.qty} units · {timeSince(r.requestedAt)}</p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-amber-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Detail Drawer */}
      {drawerItem && (
        <DetailDrawer item={drawerItem} onClose={() => setDrawerItem(null)} />
      )}

      {/* Client Portfolio Drawer */}
      <ClientPortfolioDrawer 
        portfolio={clientPortfolio} 
        onClose={() => setSelectedClientEmail(null)} 
        onViewActivity={setDrawerItem}
      />

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </div>
  )
}
