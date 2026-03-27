import { useState, useEffect } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Package, ShoppingCart, TrendingUp, Users, ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react'
import { TopNavbar } from '../components/layout/TopNavbar'
import { mockStats, mockChartData, mockOrders, mockProducts } from '../services/mockData'
import { formatCurrency } from '../utils/cn'

const COLORS = ['#6E3DFB', '#00D1FF', '#FF61BC', '#f59e0b']

// Components
const GlassCard = ({ children, className = '', delay = 0 }: any) => (
  <div
    className={`bg-white/80 dark:bg-[#15171b]/80 backdrop-blur-2xl border border-white/40 dark:border-white/5 rounded-[2rem] shadow-[0_8px_40px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_40px_rgb(0,0,0,0.2)] transition-all duration-300 hover:shadow-[0_12px_50px_rgb(0,0,0,0.08)] ${className}`}
    style={{ animation: `fadeIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s both` }}
  >
    {children}
  </div>
)

const StatCard = ({ title, value, icon, growth, color, delay, gradientBase }: any) => {
  const isPositive = growth > 0
  return (
    <GlassCard delay={delay} className="p-7 relative overflow-hidden group hover:-translate-y-1">
      <div
        className="absolute -right-8 -top-8 w-32 h-32 rounded-full blur-[40px] opacity-20 group-hover:opacity-40 transition-opacity duration-700"
        style={{ background: gradientBase }}
      />
      <div className="flex justify-between items-start mb-6">
        <div
          className="p-3.5 rounded-2xl flex items-center justify-center ring-1 ring-inset ring-white/20 dark:ring-white/5 shadow-sm"
          style={{ background: `linear-gradient(135deg, ${gradientBase}20, ${gradientBase}10)`, color: gradientBase }}
        >
          {icon}
        </div>
        <div className={`flex items-center gap-1.5 text-[13px] font-bold px-3 py-1.5 rounded-full ${isPositive ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'}`}>
          {isPositive ? <ArrowUpRight size={14} strokeWidth={3} /> : <ArrowDownRight size={14} strokeWidth={3} />}
          {Math.abs(growth)}%
        </div>
      </div>
      <div className="relative z-10">
        <h3 className="text-[#595c60] dark:text-[#9b9da1] text-[13px] uppercase tracking-wider font-semibold mb-2">{title}</h3>
        <p className="text-[28px] font-extrabold text-[#2c2f33] dark:text-white tracking-tight">{value}</p>
      </div>
    </GlassCard>
  )
}

export function DashboardPage() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#f5f6fb] dark:bg-[#0c0e12]">
      <TopNavbar title="Overview" subtitle="Welcome to the Lumina workspace." />

      <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin">
        <div className="max-w-[1600px] mx-auto space-y-8">

          {/* Top Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total Revenue" value={formatCurrency(mockStats.totalRevenue)} icon={<TrendingUp size={22} />} growth={mockStats.revenueGrowth} gradientBase="#6E3DFB" delay={0.05} />
            <StatCard title="Total Orders" value={mockStats.totalOrders.toLocaleString()} icon={<ShoppingCart size={22} />} growth={mockStats.orderGrowth} gradientBase="#00D1FF" delay={0.15} />
            <StatCard title="Products" value={mockStats.totalProducts} icon={<Package size={22} />} growth={mockStats.productGrowth} gradientBase="#FF61BC" delay={0.25} />
            <StatCard title="Active Sellers" value={mockStats.totalSellers} icon={<Users size={22} />} growth={mockStats.sellerGrowth} gradientBase="#f59e0b" delay={0.35} />
          </div>

          {/* Charts Area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <GlassCard delay={0.45} className="lg:col-span-2 p-6 md:p-8 relative overflow-hidden">
              {/* Ambient Glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-32 bg-[#6E3DFB]/10 blur-[80px] rounded-full pointer-events-none" />

              <div className="flex justify-between items-center mb-10 relative z-10">
                <div>
                  <h2 className="text-xl font-extrabold text-[#2c2f33] dark:text-white tracking-tight">Revenue Performance</h2>
                  <p className="text-sm text-[#595c60] dark:text-[#9b9da1] font-medium mt-1.5">Monthly recurring revenue over time</p>
                </div>
                <div className="flex gap-2 bg-[#eff1f6] dark:bg-[#1a1c22] p-1 rounded-xl">
                  {['1M', '3M', '6M', '1Y'].map((t, i) => (
                    <button key={t} className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${i === 3 ? 'bg-white dark:bg-zinc-800 text-[#2c2f33] dark:text-white shadow-sm' : 'text-[#595c60] dark:text-[#9b9da1] hover:text-[#2c2f33] dark:hover:text-white'}`}>
                      {t}
                    </button>))}
                </div>
              </div>
              <div className="h-[320px] w-full relative z-10 -ml-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockChartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6E3DFB" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#6E3DFB" stopOpacity={0.01} />
                      </linearGradient>
                      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#6E3DFB" floodOpacity="0.2" />
                      </filter>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e6e8ee" className="dark:stroke-zinc-800" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9b9da1', fontWeight: 600 }} dy={15} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9b9da1', fontWeight: 600 }} tickFormatter={(v) => `₹${(v / 1000)}k`} dx={-10} />
                    <Tooltip
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', padding: '12px 20px', fontWeight: 'bold' }}
                      cursor={{ stroke: '#6E3DFB', strokeWidth: 1.5, strokeDasharray: '4 4' }}
                      formatter={(v: unknown) => [formatCurrency(v as number), 'Revenue']}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#6E3DFB" strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" style={{ filter: 'url(#shadow)' }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>

            <GlassCard delay={0.55} className="p-6 md:p-8 flex flex-col">
              <h2 className="text-xl font-extrabold text-[#2c2f33] dark:text-white tracking-tight mb-2">Category Split</h2>
              <p className="text-sm text-[#595c60] dark:text-[#9b9da1] font-medium mb-8">Sales by product division</p>

              <div className="flex-1 flex flex-col justify-center relative">
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={[{ name: 'Electronics', value: 54 }, { name: 'Fashion', value: 24 }, { name: 'Home', value: 14 }, { name: 'Other', value: 8 }]}
                        cx="50%" cy="50%" innerRadius={65} outerRadius={85} paddingAngle={4} dataKey="value" stroke="transparent">
                        {[COLORS[0], COLORS[1], COLORS[2], COLORS[3]].map((color, i) => <Cell key={`cell-${i}`} fill={color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', padding: '12px', fontWeight: 'bold' }} itemStyle={{ color: '#2c2f33' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-8 space-y-3">
                  {[{ name: 'Electronics', v: '54%', c: COLORS[0] }, { name: 'Fashion', v: '24%', c: COLORS[1] }, { name: 'Home & Kitchen', v: '14%', c: COLORS[2] }, { name: 'Others', v: '8%', c: COLORS[3] }].map(item => (
                    <div key={item.name} className="flex justify-between items-center px-4 py-3 hover:bg-[#eff1f6] dark:hover:bg-zinc-800/40 rounded-2xl transition-all cursor-pointer group">
                      <div className="flex items-center gap-3.5">
                        <div className="w-3 h-3 rounded-full shadow-inner ring-4 ring-white dark:ring-zinc-900 group-hover:scale-110 transition-transform" style={{ backgroundColor: item.c }} />
                        <span className="text-sm font-semibold text-[#595c60] dark:text-[#dadde4] group-hover:text-[#2c2f33] dark:group-hover:text-white transition-colors">{item.name}</span>
                      </div>
                      <span className="text-sm font-extrabold text-[#2c2f33] dark:text-white">{item.v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <GlassCard delay={0.65} className="lg:col-span-2 p-3 md:p-6 overflow-hidden">
              <div className="flex justify-between items-center mb-6 px-4 pt-2">
                <h2 className="text-xl font-extrabold text-[#2c2f33] dark:text-white tracking-tight">Recent Transactions</h2>
                <button className="text-[13px] font-bold text-[#6E3DFB] hover:text-[#5511e3] transition-colors py-1 px-3 rounded-lg hover:bg-[#6E3DFB]/10">View All</button>
              </div>
              <div className="overflow-x-auto px-1">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr>
                      <th className="px-5 py-4 text-[11px] font-bold text-[#9b9da1] uppercase tracking-widest border-b border-[#e6e8ee] dark:border-zinc-800/80">Order ID</th>
                      <th className="px-5 py-4 text-[11px] font-bold text-[#9b9da1] uppercase tracking-widest border-b border-[#e6e8ee] dark:border-zinc-800/80">Customer</th>
                      <th className="px-5 py-4 text-[11px] font-bold text-[#9b9da1] uppercase tracking-widest border-b border-[#e6e8ee] dark:border-zinc-800/80">Amount</th>
                      <th className="px-5 py-4 text-[11px] font-bold text-[#9b9da1] uppercase tracking-widest border-b border-[#e6e8ee] dark:border-zinc-800/80">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eff1f6] dark:divide-zinc-800/50">
                    {mockOrders.slice(0, 5).map((order) => (
                      <tr key={order.id} className="hover:bg-[#f5f6fb] dark:hover:bg-zinc-800/30 transition-colors group">
                        <td className="px-5 py-5 font-mono text-[13px] font-medium text-[#595c60] dark:text-zinc-400 group-hover:text-[#6E3DFB] transition-colors">{order.orderNo}</td>
                        <td className="px-5 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#6E3DFB]/10 to-[#FF61BC]/10 flex items-center justify-center text-[#6E3DFB] font-bold text-[13px] ring-2 ring-white dark:ring-zinc-900 shadow-sm">
                              {order.userName.charAt(0)}
                            </div>
                            <span className="text-[14px] font-bold text-[#2c2f33] dark:text-white">{order.userName}</span>
                          </div>
                        </td>
                        <td className="px-5 py-5 text-[14px] font-black text-[#2c2f33] dark:text-white tracking-tight">{formatCurrency(order.amount)}</td>
                        <td className="px-5 py-5">
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wide
                            ${order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : ''}
                            ${order.status === 'Pending' ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400' : ''}
                            ${order.status === 'Shipped' ? 'bg-[#00D1FF]/10 text-[#00647b] dark:text-[#37d4ff]' : ''}
                          `}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>

            <GlassCard delay={0.75} className="p-6 md:p-8">
              <h2 className="text-xl font-extrabold text-[#2c2f33] dark:text-white tracking-tight mb-8">Trending Products</h2>
              <div className="space-y-5">
                {mockProducts.slice(0, 4).map((p) => (
                  <div key={p.id} className="flex items-center gap-4 group cursor-pointer group rounded-2xl p-2 -mx-2 hover:bg-[#eff1f6] dark:hover:bg-zinc-800/40 transition-all">
                    <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-[#e0e2e9] dark:bg-zinc-800 flex-shrink-0 shadow-sm">
                      <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                        onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=80&h=80&fit=crop' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[14px] font-bold text-[#2c2f33] dark:text-white truncate group-hover:text-[#6E3DFB] transition-colors">{p.name}</h4>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <Clock size={12} className="text-[#9b9da1]" strokeWidth={2.5} />
                        <span className="text-[12px] font-semibold text-[#75777b]">{p.totalOrders} ordered</span>
                      </div>
                    </div>
                    <div className="text-[15px] font-black tracking-tight text-[#2c2f33] dark:text-white self-center bg-white dark:bg-zinc-800/80 px-2.5 py-1.5 rounded-lg shadow-sm border border-[#e6e8ee] dark:border-zinc-700">
                      {formatCurrency(p.price)}
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  )
}
