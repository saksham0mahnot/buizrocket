import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar,
} from 'recharts'
import { Package, ShoppingCart, TrendingUp, Users } from 'lucide-react'
import { StatCard } from '../components/ui/Card'
import { TopNavbar } from '../components/layout/TopNavbar'
import { StatusBadge } from '../components/ui/Badge'
import { mockStats, mockChartData, mockOrders, mockProducts } from '../services/mockData'
import { formatCurrency, formatShortDate } from '../utils/cn'

const COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#f59e0b']

const categoryData = [
  { name: 'Electronics', value: 54 },
  { name: 'Gaming', value: 22 },
  { name: 'Home', value: 14 },
  { name: 'Other', value: 10 },
]

export function DashboardPage() {
  const recentOrders = mockOrders.slice(0, 5)

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopNavbar title="Dashboard" subtitle="Welcome back! Here's what's happening." />
      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin space-y-6 animate-fade-in">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            title="Total Revenue"
            value={formatCurrency(mockStats.totalRevenue)}
            icon={<TrendingUp size={18} />}
            growth={mockStats.revenueGrowth}
            color="blue"
          />
          <StatCard
            title="Total Orders"
            value={mockStats.totalOrders.toLocaleString()}
            icon={<ShoppingCart size={18} />}
            growth={mockStats.orderGrowth}
            color="emerald"
          />
          <StatCard
            title="Products Listed"
            value={mockStats.totalProducts}
            icon={<Package size={18} />}
            growth={mockStats.productGrowth}
            color="violet"
          />
          <StatCard
            title="Active Sellers"
            value={mockStats.totalSellers}
            icon={<Users size={18} />}
            growth={mockStats.sellerGrowth}
            color="amber"
          />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Revenue area chart */}
          <div className="xl:col-span-2 rounded-xl border border-gray-200 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/80 p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-sm font-semibold text-gray-800 dark:text-zinc-200">Revenue Overview</h3>
                <p className="text-xs text-gray-400 dark:text-zinc-500 mt-0.5">Last 8 months performance</p>
              </div>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-400/10 border border-emerald-200 dark:border-emerald-400/20 px-2 py-1 rounded-lg">
                ↑ {mockStats.revenueGrowth}% MoM
              </span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={mockChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:[stroke:#27272a]" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 10, fontSize: 12, color: '#111827' }}
                  labelStyle={{ color: '#6b7280' }}
                  formatter={(v: unknown) => [formatCurrency(v as number), 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fill="url(#revenueGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Category pie chart */}
          <div className="rounded-xl border border-gray-200 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/80 p-5">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-zinc-200 mb-1">Category Split</h3>
            <p className="text-xs text-gray-400 dark:text-zinc-500 mb-4">Products by category</p>
            <div className="flex justify-center mb-4">
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value" strokeWidth={0}>
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              {categoryData.map((item, i) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: COLORS[i] }} />
                    <span className="text-gray-500 dark:text-zinc-400">{item.name}</span>
                  </div>
                  <span className="text-gray-700 dark:text-zinc-300 font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Orders bar chart + Top products */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2 rounded-xl border border-gray-200 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/80 p-5">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-zinc-200 mb-1">Monthly Orders</h3>
            <p className="text-xs text-gray-400 dark:text-zinc-500 mb-5">Order volume per month</p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={mockChartData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 10, fontSize: 12, color: '#111827' }}
                  labelStyle={{ color: '#6b7280' }}
                />
                <Bar dataKey="orders" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top products */}
          <div className="rounded-xl border border-gray-200 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/80 p-5">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-zinc-200 mb-4">Top Products</h3>
            <div className="space-y-3">
              {mockProducts.slice(0, 4).map((p) => (
                <div key={p.id} className="flex items-center gap-3">
                  <img
                    src={p.images[0]}
                    alt={p.name}
                    className="w-9 h-9 rounded-lg object-cover flex-shrink-0 bg-gray-100 dark:bg-zinc-800"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=40&h=40&fit=crop' }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 dark:text-zinc-200 truncate">{p.name}</p>
                    <p className="text-[10px] text-gray-400 dark:text-zinc-600">{p.totalOrders} orders</p>
                  </div>
                  <span className="text-xs font-semibold text-gray-700 dark:text-zinc-300">{formatCurrency(p.price)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="rounded-xl border border-gray-200 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/80 p-5">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-zinc-200 mb-4">Recent Orders</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100 dark:border-zinc-800">
                  {['Order No', 'Customer', 'Products', 'Amount', 'Status', 'Date'].map((h) => (
                    <th key={h} className="pb-3 text-left font-medium text-gray-400 dark:text-zinc-600 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-zinc-800/50">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="py-3 pr-4 font-mono font-medium text-gray-600 dark:text-zinc-300">{order.orderNo}</td>
                    <td className="py-3 pr-4 text-gray-700 dark:text-zinc-300">{order.userName}</td>
                    <td className="py-3 pr-4 text-gray-400 dark:text-zinc-500">{order.products.length} item{order.products.length > 1 ? 's' : ''}</td>
                    <td className="py-3 pr-4 font-semibold text-gray-800 dark:text-zinc-200">{formatCurrency(order.amount)}</td>
                    <td className="py-3 pr-4"><StatusBadge status={order.status} /></td>
                    <td className="py-3 text-gray-400 dark:text-zinc-500">{formatShortDate(order.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
