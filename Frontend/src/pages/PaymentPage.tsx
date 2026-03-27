import { useState, useMemo } from 'react'
import { Search, Filter, Eye, CreditCard, Smartphone, Building2, Wallet, Truck,
  ChevronDown, ChevronUp, CheckCircle2, Clock, XCircle, RotateCcw, Package,
  TrendingUp, AlertCircle, Phone, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { TopNavbar } from '../components/layout/TopNavbar'
import { Modal } from '../components/ui/Modal'
import { Button } from '../components/ui/Button'
import { mockOrders } from '../services/mockData'
import { formatCurrency, formatDate } from '../utils/cn'
import type { PaymentMethod, PaymentStatus } from '../types'

type SortKey = 'orderNo' | 'userName' | 'amount' | 'paidAt' | 'method' | 'status'
type SortDir = 'asc' | 'desc'

const METHOD_ICONS: Record<PaymentMethod, React.ReactNode> = {
  'UPI': <Smartphone size={14} strokeWidth={2.5} />,
  'Net Banking': <Building2 size={14} strokeWidth={2.5} />,
  'Credit Card': <CreditCard size={14} strokeWidth={2.5} />,
  'Debit Card': <CreditCard size={14} strokeWidth={2.5} />,
  'Cash on Delivery': <Truck size={14} strokeWidth={2.5} />,
  'Wallet': <Wallet size={14} strokeWidth={2.5} />,
}

const METHOD_COLOR: Record<PaymentMethod, string> = {
  'UPI': 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400 ring-1 ring-inset ring-violet-500/20',
  'Net Banking': 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 ring-1 ring-inset ring-blue-500/20',
  'Credit Card': 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 ring-1 ring-inset ring-rose-500/20',
  'Debit Card': 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 ring-1 ring-inset ring-amber-500/20',
  'Cash on Delivery': 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 ring-1 ring-inset ring-emerald-500/20',
  'Wallet': 'bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-500/10 dark:text-fuchsia-400 ring-1 ring-inset ring-fuchsia-500/20',
}

const STATUS_CONFIG: Record<PaymentStatus, { icon: React.ReactNode; cls: string }> = {
  Paid: { icon: <CheckCircle2 size={12} strokeWidth={2.5} />, cls: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 ring-1 ring-inset ring-emerald-600/20' },
  Pending: { icon: <Clock size={12} strokeWidth={2.5} />, cls: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 ring-1 ring-inset ring-amber-500/20' },
  Failed: { icon: <XCircle size={12} strokeWidth={2.5} />, cls: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 ring-1 ring-inset ring-rose-600/20' },
  Refunded: { icon: <RotateCcw size={12} strokeWidth={2.5} />, cls: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 ring-1 ring-inset ring-blue-500/20' },
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  })
}

const ALL_METHODS: (PaymentMethod | 'All')[] = ['All', 'UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Wallet', 'Cash on Delivery']
const ALL_STATUSES: (PaymentStatus | 'All')[] = ['All', 'Paid', 'Pending', 'Refunded', 'Failed']

export function PaymentPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [methodFilter, setMethodFilter] = useState<PaymentMethod | 'All'>('All')
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'All'>('All')
  const [sortKey, setSortKey] = useState<SortKey>('paidAt')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [viewOrderId, setViewOrderId] = useState<string | null>(null)

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  // Compute stats
  const stats = useMemo(() => {
    const allPayments = mockOrders.map(o => o.payment)
    const totalCollected = mockOrders.filter(o => o.payment.status === 'Paid').reduce((s, o) => s + o.amount, 0)
    const totalRefunded = mockOrders.filter(o => o.payment.status === 'Refunded').reduce((s, o) => s + o.amount, 0)
    const pendingCount = allPayments.filter(p => p.status === 'Pending').length
    const paidCount = allPayments.filter(p => p.status === 'Paid').length
    return { totalCollected, totalRefunded, pendingCount, paidCount, total: mockOrders.length }
  }, [])

  const filtered = useMemo(() => {
    let rows = mockOrders.filter(o => {
      const s = search.toLowerCase()
      const matchSearch = o.orderNo.toLowerCase().includes(s) ||
        o.userName.toLowerCase().includes(s) ||
        o.payment.transactionId.toLowerCase().includes(s) ||
        o.payment.gateway.toLowerCase().includes(s)
      const matchMethod = methodFilter === 'All' || o.payment.method === methodFilter
      const matchStatus = statusFilter === 'All' || o.payment.status === statusFilter
      return matchSearch && matchMethod && matchStatus
    })

    rows.sort((a, b) => {
      let av: string | number = '', bv: string | number = ''
      if (sortKey === 'orderNo') { av = a.orderNo; bv = b.orderNo }
      else if (sortKey === 'userName') { av = a.userName; bv = b.userName }
      else if (sortKey === 'amount') { av = a.amount; bv = b.amount }
      else if (sortKey === 'method') { av = a.payment.method; bv = b.payment.method }
      else if (sortKey === 'status') { av = a.payment.status; bv = b.payment.status }
      else if (sortKey === 'paidAt') { av = a.payment.paidAt ?? a.createdAt; bv = b.payment.paidAt ?? b.createdAt }
      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ? 1 : -1
      return 0
    })
    return rows
  }, [search, methodFilter, statusFilter, sortKey, sortDir])

  const viewOrder = mockOrders.find(o => o.id === viewOrderId) ?? null

  const SortIcon = ({ k }: { k: SortKey }) => (
    <span className="inline-flex flex-col ml-1 opacity-40">
      <ChevronUp size={10} className={sortKey === k && sortDir === 'asc' ? 'opacity-100 text-[#6E3DFB]' : ''} />
      <ChevronDown size={10} className={sortKey === k && sortDir === 'desc' ? 'opacity-100 text-[#6E3DFB]' : ''} />
    </span>
  )

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#f5f6fb] dark:bg-[#0c0e12]">
      <TopNavbar title="Payments" subtitle={`${mockOrders.length} total payment records`} />

      <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin">
        <div className="max-w-[1600px] mx-auto space-y-8">

          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6" style={{ animation: 'fadeIn 0.5s ease-out 0.05s both' }}>
            {[
              {
                label: 'Total Collected', value: formatCurrency(stats.totalCollected),
                icon: <TrendingUp size={20} strokeWidth={2.5} />,
                gradient: 'from-[#6E3DFB] to-[#FF61BC]', delay: 0,
              },
              {
                label: 'Successful Payments', value: `${stats.paidCount} orders`,
                icon: <CheckCircle2 size={20} strokeWidth={2.5} />,
                gradient: 'from-emerald-400 to-teal-500', delay: 0.07,
              },
              {
                label: 'Pending Payments', value: `${stats.pendingCount} orders`,
                icon: <AlertCircle size={20} strokeWidth={2.5} />,
                gradient: 'from-amber-400 to-orange-500', delay: 0.14,
              },
              {
                label: 'Total Refunded', value: formatCurrency(stats.totalRefunded),
                icon: <RotateCcw size={20} strokeWidth={2.5} />,
                gradient: 'from-blue-400 to-cyan-500', delay: 0.21,
              },
            ].map((s) => (
              <div
                key={s.label}
                className="group relative bg-white/80 dark:bg-[#15171b]/80 backdrop-blur-2xl border border-white/40 dark:border-white/5 rounded-[2rem] p-6 shadow-[0_8px_40px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_40px_rgb(0,0,0,0.2)] hover:shadow-[0_12px_50px_rgb(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                style={{ animation: `scaleIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) ${0.08 + s.delay}s both` }}
              >
                <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full blur-[40px] opacity-20 group-hover:opacity-40 transition-opacity duration-700" style={{ background: `linear-gradient(135deg, ${s.gradient.includes('#') ? '' : ''})` }} />
                <div className={`w-11 h-11 rounded-[14px] bg-gradient-to-br ${s.gradient} flex items-center justify-center text-white mb-4 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                  {s.icon}
                </div>
                <p className="text-[11px] font-bold text-[#9b9da1] uppercase tracking-widest mb-1">{s.label}</p>
                <p className="text-[22px] font-black text-[#2c2f33] dark:text-white tracking-tight">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between" style={{ animation: 'fadeIn 0.5s ease-out 0.15s both' }}>
            <div className="flex flex-wrap gap-3 w-full sm:w-auto">
              {/* Search */}
              <div className="relative flex-1 sm:w-72 group">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9b9da1] group-focus-within:text-[#6E3DFB] transition-colors" />
                <input
                  id="payments-search"
                  type="text"
                  placeholder="Search order, customer, txn ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 text-sm font-medium bg-white/70 dark:bg-[#15171b]/80 backdrop-blur-md border border-white/40 dark:border-white/5 rounded-2xl text-[#2c2f33] dark:text-white placeholder-[#9b9da1] dark:placeholder-[#595c60] focus:outline-none focus:border-[#6E3DFB] focus:ring-4 focus:ring-[#6E3DFB]/10 shadow-sm transition-all"
                />
              </div>
              {/* Method Filter */}
              <div className="relative group">
                <Filter size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9b9da1] group-hover:text-[#6E3DFB] transition-colors z-10" />
                <select
                  value={methodFilter}
                  onChange={(e) => setMethodFilter(e.target.value as PaymentMethod | 'All')}
                  className="pl-9 pr-10 py-2.5 text-sm font-bold bg-white/70 dark:bg-[#15171b]/80 backdrop-blur-md border border-white/40 dark:border-white/5 rounded-2xl text-[#595c60] dark:text-[#dadde4] focus:outline-none focus:border-[#6E3DFB] focus:ring-4 focus:ring-[#6E3DFB]/10 shadow-sm appearance-none transition-all cursor-pointer"
                >
                  {ALL_METHODS.map(m => <option key={m} value={m} className="bg-white dark:bg-[#15171b]">{m === 'All' ? 'All Methods' : m}</option>)}
                </select>
                <ChevronDown size={13} className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#9b9da1]" />
              </div>
              {/* Status Filter */}
              <div className="relative group">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as PaymentStatus | 'All')}
                  className="pl-4 pr-10 py-2.5 text-sm font-bold bg-white/70 dark:bg-[#15171b]/80 backdrop-blur-md border border-white/40 dark:border-white/5 rounded-2xl text-[#595c60] dark:text-[#dadde4] focus:outline-none focus:border-[#6E3DFB] focus:ring-4 focus:ring-[#6E3DFB]/10 shadow-sm appearance-none transition-all cursor-pointer"
                >
                  {ALL_STATUSES.map(s => <option key={s} value={s} className="bg-white dark:bg-[#15171b]">{s === 'All' ? 'All Statuses' : s}</option>)}
                </select>
                <ChevronDown size={13} className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#9b9da1]" />
              </div>
            </div>
            <button
              onClick={() => navigate('/orders')}
              className="flex items-center gap-2 px-4 py-2.5 text-[13px] font-bold text-[#6E3DFB] bg-[#6E3DFB]/8 hover:bg-[#6E3DFB]/15 border border-[#6E3DFB]/20 rounded-2xl transition-all hidden sm:flex"
            >
              <ArrowLeft size={14} strokeWidth={2.5} /> Back to Orders
            </button>
          </div>

          {/* Table */}
          <div
            className="bg-white/80 dark:bg-[#15171b]/80 backdrop-blur-2xl border border-white/40 dark:border-white/5 rounded-[2rem] shadow-[0_8px_40px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_40px_rgb(0,0,0,0.2)] overflow-hidden"
            style={{ animation: 'fadeIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.2s both' }}
          >
            <div className="overflow-x-auto p-2 md:p-4">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr>
                    {[
                      { key: 'orderNo', label: 'Order No' },
                      { key: 'userName', label: 'Customer' },
                      { key: 'method', label: 'Method' },
                      { key: 'amount', label: 'Amount' },
                      { key: null, label: 'Gateway' },
                      { key: 'status', label: 'Status' },
                      { key: 'paidAt', label: 'Paid On' },
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
                      <td colSpan={8} className="px-5 py-16 text-center text-[#9b9da1] font-medium text-sm">
                        <div className="flex flex-col items-center gap-3">
                          <Package size={32} className="text-[#e6e8ee] dark:text-zinc-800" />
                          No payments found.
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((order, idx) => {
                      const p = order.payment
                      const sc = STATUS_CONFIG[p.status]
                      return (
                        <tr
                          key={order.id}
                          className="hover:bg-[#f5f6fb] dark:hover:bg-zinc-800/40 transition-all duration-300 group"
                          style={{ animation: `fadeIn 0.4s ease-out ${0.25 + idx * 0.05}s both` }}
                        >
                          {/* Order No */}
                          <td className="px-5 py-4 font-mono text-[13px] font-bold text-[#595c60] dark:text-[#9b9da1] group-hover:text-[#6E3DFB] transition-colors">
                            {order.orderNo}
                          </td>

                          {/* Customer */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-[#6E3DFB]/10 to-[#FF61BC]/10 flex items-center justify-center text-[#6E3DFB] font-extrabold text-[13px] ring-2 ring-white dark:ring-[#15171b] shadow-sm flex-shrink-0 group-hover:scale-105 transition-transform">
                                {order.userName.charAt(0)}
                              </div>
                              <div>
                                <p className="text-[13px] font-extrabold text-[#2c2f33] dark:text-white tracking-tight leading-tight">{order.userName}</p>
                                <p className="text-[11px] font-medium text-[#9b9da1]">{order.userEmail}</p>
                              </div>
                            </div>
                          </td>

                          {/* Method */}
                          <td className="px-5 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold ${METHOD_COLOR[p.method]}`}>
                              {METHOD_ICONS[p.method]}
                              {p.method}
                            </span>
                          </td>

                          {/* Amount */}
                          <td className="px-5 py-4 text-[14px] font-black tracking-tight text-[#2c2f33] dark:text-white">
                            {formatCurrency(order.amount)}
                          </td>

                          {/* Gateway */}
                          <td className="px-5 py-4">
                            <span className="text-[12px] font-bold text-[#595c60] dark:text-[#dadde4] bg-[#f5f6fb] dark:bg-zinc-800/60 px-2.5 py-1 rounded-lg">
                              {p.gateway}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="px-5 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest ${sc.cls}`}>
                              {sc.icon}
                              {p.status}
                            </span>
                          </td>

                          {/* Paid On */}
                          <td className="px-5 py-4 text-[12px] font-semibold text-[#9b9da1]">
                            {p.paidAt ? formatDate(p.paidAt) : <span className="text-amber-500 font-bold">—</span>}
                          </td>

                          {/* Actions */}
                          <td className="px-5 py-4">
                            <button
                              id={`view-payment-${order.id}`}
                              onClick={() => setViewOrderId(order.id)}
                              className="p-2 rounded-xl text-[#9b9da1] hover:text-[#6E3DFB] hover:bg-[#6E3DFB]/10 transition-all shadow-sm ring-1 ring-inset ring-[#e6e8ee] dark:ring-white/5 bg-white dark:bg-zinc-800"
                              title="View Details"
                            >
                              <Eye size={15} strokeWidth={2.5} />
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>

      {/* Payment Detail Modal */}
      <Modal
        open={!!viewOrder}
        onClose={() => setViewOrderId(null)}
        title={`Payment — ${viewOrder?.orderNo}`}
        description={viewOrder ? `${viewOrder.userName} · ${viewOrder.userEmail}` : ''}
        size="lg"
      >
        {viewOrder && (() => {
          const p = viewOrder.payment
          const sc = STATUS_CONFIG[p.status]
          return (
            <div className="space-y-5 mt-1">

              {/* Status Hero */}
              <div className={`flex items-center justify-between p-4 rounded-2xl border ${sc.cls}`}>
                <div className="flex items-center gap-3">
                  <div className="scale-125">{sc.icon}</div>
                  <div>
                    <p className="text-[14px] font-extrabold capitalize">{p.status}</p>
                    {p.paidAt && <p className="text-[11px] font-medium opacity-70">{formatTime(p.paidAt)}</p>}
                  </div>
                </div>
                <p className="text-[22px] font-black tracking-tight">{formatCurrency(viewOrder.amount)}</p>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* Method */}
                <div className="p-4 rounded-2xl bg-[#f5f6fb] dark:bg-zinc-800/50 border border-[#e6e8ee] dark:border-zinc-700/50 space-y-3">
                  <p className="text-[10px] font-bold text-[#9b9da1] uppercase tracking-widest">Payment Method</p>
                  <div className="flex items-center gap-2.5">
                    <span className={`p-1.5 rounded-lg ${METHOD_COLOR[p.method]}`}>{METHOD_ICONS[p.method]}</span>
                    <span className="text-[15px] font-extrabold text-[#2c2f33] dark:text-white">{p.method}</span>
                  </div>
                  {p.bank && <p className="text-[12px] font-bold text-[#595c60] dark:text-[#9b9da1]">🏦 {p.bank}</p>}
                  {p.upiId && <p className="text-[12px] font-mono font-bold text-[#595c60] dark:text-[#9b9da1]">📱 {p.upiId}</p>}
                  {p.cardLast4 && <p className="text-[12px] font-mono font-bold text-[#595c60] dark:text-[#9b9da1]">💳 •••• {p.cardLast4}</p>}
                </div>

                {/* Transaction */}
                <div className="p-4 rounded-2xl bg-[#f5f6fb] dark:bg-zinc-800/50 border border-[#e6e8ee] dark:border-zinc-700/50 space-y-2.5">
                  <p className="text-[10px] font-bold text-[#9b9da1] uppercase tracking-widest">Transaction</p>
                  <div>
                    <p className="text-[10px] font-bold text-[#9b9da1] uppercase tracking-wider mb-0.5">Txn ID</p>
                    <p className="text-[11px] font-mono font-bold text-[#2c2f33] dark:text-white break-all">{p.transactionId}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#9b9da1] uppercase tracking-wider mb-0.5">Gateway</p>
                    <p className="text-[13px] font-bold text-[#2c2f33] dark:text-white">{p.gateway}</p>
                  </div>
                </div>
              </div>

              {/* Refund */}
              {p.status === 'Refunded' && p.refundReason && (
                <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20">
                  <p className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-widest mb-1.5">Refund Reason</p>
                  <p className="text-[13px] font-semibold text-blue-800 dark:text-blue-300">{p.refundReason}</p>
                  {p.refundedAt && <p className="text-[11px] text-blue-500 mt-1">Refunded: {formatTime(p.refundedAt)}</p>}
                </div>
              )}

              {/* Ordered Items */}
              <div>
                <p className="text-[10px] font-bold text-[#9b9da1] uppercase tracking-widest mb-3">Ordered Items</p>
                <div className="space-y-2">
                  {viewOrder.products.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-zinc-900 border border-[#e6e8ee] dark:border-zinc-800 shadow-sm">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-[#eff1f6] dark:bg-zinc-800 flex items-center justify-center">
                          <Package size={12} className="text-[#9b9da1]" />
                        </div>
                        <span className="text-[13px] font-bold text-[#2c2f33] dark:text-[#dadde4]">{item.name}</span>
                        <span className="text-[12px] font-mono text-[#9b9da1]">×{item.qty}</span>
                      </div>
                      <span className="text-[13px] font-black text-[#2c2f33] dark:text-white">{formatCurrency(item.price * item.qty)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center px-3 pt-2 border-t border-[#e6e8ee] dark:border-zinc-800">
                    <span className="text-[12px] font-bold text-[#9b9da1] uppercase tracking-wider">Total</span>
                    <span className="text-[16px] font-black text-[#6E3DFB]">{formatCurrency(viewOrder.amount)}</span>
                  </div>
                </div>
              </div>

              {/* Shipping */}
              <div className="p-4 rounded-2xl bg-[#f5f6fb] dark:bg-zinc-800/50 border border-[#e6e8ee] dark:border-zinc-700/50">
                <p className="text-[10px] font-bold text-[#9b9da1] uppercase tracking-widest mb-3">Delivery Address</p>
                <p className="text-[13px] font-semibold text-[#595c60] dark:text-[#dadde4]">{viewOrder.shippingDetails.address}</p>
                <p className="text-[13px] font-semibold text-[#595c60] dark:text-[#dadde4]">
                  {viewOrder.shippingDetails.city}, {viewOrder.shippingDetails.state} — {viewOrder.shippingDetails.pincode}
                </p>
                <p className="flex items-center gap-1.5 text-[12px] font-medium text-[#9b9da1] mt-1.5">
                  <Phone size={11} /> {viewOrder.shippingDetails.phone}
                </p>
              </div>

              {/* Timeline */}
              <div>
                <p className="text-[10px] font-bold text-[#9b9da1] uppercase tracking-widest mb-4">Payment Timeline</p>
                <div className="relative pl-5">
                  <div className="absolute left-1.5 top-1 bottom-1 w-px bg-[#e6e8ee] dark:bg-zinc-800" />
                  <div className="space-y-4">
                    {p.timeline.map((step, i) => (
                      <div key={i} className="relative flex items-start gap-3">
                        <div className={`absolute -left-3.5 top-1 w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-[#15171b] ${i === 0 ? (p.status === 'Paid' ? 'bg-emerald-500' : p.status === 'Refunded' ? 'bg-blue-500' : p.status === 'Failed' ? 'bg-rose-500' : 'bg-amber-400') : 'bg-[#d5d7e0] dark:bg-zinc-700'}`} />
                        <div>
                          <p className={`text-[13px] font-bold ${i === 0 ? 'text-[#2c2f33] dark:text-white' : 'text-[#595c60] dark:text-[#9b9da1]'}`}>{step.event}</p>
                          <p className="text-[11px] font-medium text-[#9b9da1]">{formatTime(step.time)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#e6e8ee] dark:border-zinc-800 flex justify-between items-center">
                <button
                  onClick={() => { setViewOrderId(null); navigate('/orders') }}
                  className="text-[12px] font-bold text-[#6E3DFB] hover:underline flex items-center gap-1"
                >
                  <ArrowLeft size={12} /> Go to Orders
                </button>
                <Button onClick={() => setViewOrderId(null)} className="rounded-2xl px-6">Close</Button>
              </div>

            </div>
          )
        })()}
      </Modal>
    </div>
  )
}
