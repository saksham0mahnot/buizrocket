import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, LineChart, Line, Legend,
} from 'recharts'
import { TopNavbar } from '../components/layout/TopNavbar'
import { mockChartData } from '../services/mockData'
import { formatCurrency } from '../utils/cn'

const conversionData = [
  { name: 'Aug', visitors: 1200, conversions: 87 },
  { name: 'Sep', visitors: 1450, conversions: 102 },
  { name: 'Oct', visitors: 1300, conversions: 94 },
  { name: 'Nov', visitors: 1800, conversions: 128 },
  { name: 'Dec', visitors: 2200, conversions: 156 },
  { name: 'Jan', visitors: 1950, conversions: 143 },
  { name: 'Feb', visitors: 2300, conversions: 168 },
  { name: 'Mar', visitors: 2600, conversions: 189 },
]

const topChannels = [
  { channel: 'Direct', orders: 312, revenue: 891000 },
  { channel: 'Search', orders: 245, revenue: 723000 },
  { channel: 'Social', orders: 178, revenue: 498000 },
  { channel: 'Referral', orders: 134, revenue: 387000 },
  { channel: 'Email', orders: 89, revenue: 254000 },
]

export function GrowthPage() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopNavbar title="Growth Analytics" subtitle="Track your store performance and trends" />
      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin animate-fade-in space-y-6">
        {/* KPI row */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            { label: 'Avg Order Value', value: '₹4,231', delta: '+5.2%', positive: true },
            { label: 'Conversion Rate', value: '7.3%', delta: '+1.1%', positive: true },
            { label: 'Repeat Buyers', value: '38%', delta: '+2.4%', positive: true },
            { label: 'Return Rate', value: '4.1%', delta: '-0.3%', positive: false },
          ].map((kpi) => (
            <div key={kpi.label} className="p-4 rounded-xl border border-gray-200 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/80">
              <p className="text-xs text-gray-400 dark:text-zinc-600 mb-2">{kpi.label}</p>
              <p className="text-xl font-bold text-gray-900 dark:text-zinc-100">{kpi.value}</p>
              <span className={`text-xs font-medium ${kpi.positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                {kpi.delta} <span className="text-gray-400 dark:text-zinc-600">vs last month</span>
              </span>
            </div>
          ))}
        </div>

        {/* Revenue vs conversion */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className="rounded-xl border border-gray-200 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/80 p-5">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-zinc-200 mb-1">Revenue Trend</h3>
            <p className="text-xs text-gray-400 dark:text-zinc-500 mb-5">Monthly revenue over 8 months</p>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={mockChartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 10, fontSize: 12, color: '#111827' }} formatter={(v: unknown) => [formatCurrency(v as number), 'Revenue']} />
                <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={2} fill="url(#revGrad2)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/80 p-5">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-zinc-200 mb-1">Visitors vs Conversions</h3>
            <p className="text-xs text-gray-400 dark:text-zinc-500 mb-5">Traffic quality over time</p>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={conversionData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 10, fontSize: 12, color: '#111827' }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: '#6b7280' }} />
                <Line type="monotone" dataKey="visitors" stroke="#06b6d4" strokeWidth={2} dot={false} name="Visitors" />
                <Line type="monotone" dataKey="conversions" stroke="#f59e0b" strokeWidth={2} dot={false} name="Conversions" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Channels */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className="rounded-xl border border-gray-200 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/80 p-5">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-zinc-200 mb-5">Sales by Channel</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={topChannels} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="channel" type="category" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} width={55} />
                <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 10, fontSize: 12, color: '#111827' }} />
                <Bar dataKey="orders" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Orders" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/80 p-5">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-zinc-200 mb-4">Channel Revenue</h3>
            <div className="space-y-3">
              {topChannels.map((channel, i) => {
                const maxRevenue = Math.max(...topChannels.map(c => c.revenue))
                const pct = (channel.revenue / maxRevenue) * 100
                const colors = ['#3b82f6', '#8b5cf6', '#06b6d4', '#f59e0b', '#34d399']
                return (
                  <div key={channel.channel}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-gray-500 dark:text-zinc-400">{channel.channel}</span>
                      <span className="text-xs font-semibold text-gray-800 dark:text-zinc-200">{formatCurrency(channel.revenue)}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: colors[i] }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
