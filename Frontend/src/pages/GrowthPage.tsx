import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, LineChart, Line, Legend,
} from 'recharts'
import { TrendingUp, TrendingDown } from 'lucide-react'
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
    <div className="flex flex-col h-full overflow-hidden bg-[#f5f6fb] dark:bg-[#0c0e12]">
      <TopNavbar title="Growth Analytics" subtitle="Track your store performance and trends" />
      <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin">
        <div className="max-w-[1600px] mx-auto space-y-8">
          
          {/* KPI row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[
              { label: 'Avg Order Value', value: '₹4,231', delta: '+5.2%', positive: true, delay: 0 },
              { label: 'Conversion Rate', value: '7.3%', delta: '+1.1%', positive: true, delay: 0.1 },
              { label: 'Repeat Buyers', value: '38%', delta: '+2.4%', positive: true, delay: 0.2 },
              { label: 'Return Rate', value: '4.1%', delta: '-0.3%', positive: false, delay: 0.3 },
            ].map((kpi, i) => (
              <div 
                key={kpi.label} 
                className="relative bg-white/80 dark:bg-[#15171b]/80 backdrop-blur-2xl border border-white/40 dark:border-white/5 rounded-[2rem] p-6 shadow-[0_8px_40px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_40px_rgb(0,0,0,0.2)] overflow-hidden group hover:shadow-[0_12px_50px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_12px_50px_rgb(0,0,0,0.3)] transition-all duration-300"
                style={{ animation: `scaleIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) ${0.1 + kpi.delay}s both` }}
              >
                <div className="relative z-10 flex flex-col h-full justify-between">
                  <p className="text-[13px] font-bold text-[#9b9da1] uppercase tracking-widest mb-4">{kpi.label}</p>
                  <div>
                    <p className="text-3xl font-black text-[#2c2f33] dark:text-white tracking-tight mb-2">{kpi.value}</p>
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-bold ${kpi.positive ? 'bg-[#00D1FF]/10 text-[#00647b] dark:text-[#37d4ff]' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'}`}>
                      {kpi.positive ? <TrendingUp size={14} strokeWidth={3} /> : <TrendingDown size={14} strokeWidth={3} />}
                      {kpi.delta} <span className="opacity-70 ml-1 font-semibold hidden xl:inline">vs last month</span>
                    </div>
                  </div>
                </div>
                {/* Decorative glow */}
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-gradient-to-br from-[#6E3DFB]/10 to-[#FF61BC]/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
              </div>
            ))}
          </div>

          {/* Revenue vs conversion */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div 
              className="bg-white/80 dark:bg-[#15171b]/80 backdrop-blur-2xl border border-white/40 dark:border-white/5 rounded-[2rem] shadow-[0_8px_40px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_40px_rgb(0,0,0,0.2)] p-6 md:p-8 hover:shadow-[0_12px_50px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_12px_50px_rgb(0,0,0,0.3)] transition-all duration-300"
              style={{ animation: 'fadeIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.4s both' }}
            >
              <h3 className="text-lg font-black text-[#2c2f33] dark:text-white tracking-tight mb-1">Revenue Trend</h3>
              <p className="text-sm font-medium text-[#9b9da1] mb-8">Monthly revenue over 8 months</p>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockChartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="growthRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00D1FF" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#00D1FF" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" stroke="#e6e8ee" dark:stroke="rgba(255,255,255,0.05)" vertical={false} opacity={0.5} />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#9b9da1', fontWeight: 600 }} axisLine={false} tickLine={false} dy={10} />
                    <YAxis tick={{ fontSize: 12, fill: '#9b9da1', fontWeight: 600 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} dx={-10} />
                    <Tooltip 
                      contentStyle={{ background: 'rgba(21, 23, 27, 0.9)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}
                      itemStyle={{ fontWeight: 800, fontSize: '14px' }}
                      labelStyle={{ color: '#9b9da1', fontWeight: 600, marginBottom: '4px' }}
                      formatter={(v: unknown) => [formatCurrency(v as number), 'Revenue']} 
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#00D1FF" strokeWidth={3} fill="url(#growthRev)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div 
              className="bg-white/80 dark:bg-[#15171b]/80 backdrop-blur-2xl border border-white/40 dark:border-white/5 rounded-[2rem] shadow-[0_8px_40px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_40px_rgb(0,0,0,0.2)] p-6 md:p-8 hover:shadow-[0_12px_50px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_12px_50px_rgb(0,0,0,0.3)] transition-all duration-300"
              style={{ animation: 'fadeIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.5s both' }}
            >
              <h3 className="text-lg font-black text-[#2c2f33] dark:text-white tracking-tight mb-1">Visitors vs Conversions</h3>
              <p className="text-sm font-medium text-[#9b9da1] mb-8">Traffic quality over time</p>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={conversionData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="4 4" stroke="#e6e8ee" dark:stroke="rgba(255,255,255,0.05)" vertical={false} opacity={0.5} />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#9b9da1', fontWeight: 600 }} axisLine={false} tickLine={false} dy={10} />
                    <YAxis yAxisId="left" tick={{ fontSize: 12, fill: '#9b9da1', fontWeight: 600 }} axisLine={false} tickLine={false} dx={-10} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: '#9b9da1', fontWeight: 600 }} axisLine={false} tickLine={false} dx={10} />
                    <Tooltip 
                      contentStyle={{ background: 'rgba(21, 23, 27, 0.9)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}
                      cursor={{ stroke: '#6E3DFB', strokeWidth: 1, strokeDasharray: '4 4' }}
                    />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, fontWeight: 700, paddingTop: '10px' }} />
                    <Line yAxisId="left" type="monotone" dataKey="visitors" stroke="#6E3DFB" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }} name="Visitors" />
                    <Line yAxisId="right" type="monotone" dataKey="conversions" stroke="#FF61BC" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }} name="Conversions" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Top Channels */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-10">
            <div 
              className="bg-white/80 dark:bg-[#15171b]/80 backdrop-blur-2xl border border-white/40 dark:border-white/5 rounded-[2rem] shadow-[0_8px_40px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_40px_rgb(0,0,0,0.2)] p-6 md:p-8 hover:shadow-[0_12px_50px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_12px_50px_rgb(0,0,0,0.3)] transition-all duration-300"
              style={{ animation: 'fadeIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.6s both' }}
            >
              <h3 className="text-lg font-black text-[#2c2f33] dark:text-white tracking-tight mb-8">Sales by Channel</h3>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topChannels} layout="vertical" margin={{ top: 0, right: 0, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="4 4" stroke="#e6e8ee" dark:stroke="rgba(255,255,255,0.05)" horizontal={false} opacity={0.5} />
                    <XAxis type="number" tick={{ fontSize: 12, fill: '#9b9da1', fontWeight: 600 }} axisLine={false} tickLine={false} dy={10} />
                    <YAxis dataKey="channel" type="category" tick={{ fontSize: 12, fill: '#595c60', fontWeight: 700 }} axisLine={false} tickLine={false} width={70} />
                    <Tooltip 
                      cursor={{ fill: 'rgba(110,61,251,0.05)' }}
                      contentStyle={{ background: 'rgba(21, 23, 27, 0.9)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff' }} 
                    />
                    <Bar dataKey="orders" fill="#6E3DFB" radius={[0, 8, 8, 0]} barSize={24} name="Total Orders" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div 
              className="bg-white/80 dark:bg-[#15171b]/80 backdrop-blur-2xl border border-white/40 dark:border-white/5 rounded-[2rem] shadow-[0_8px_40px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_40px_rgb(0,0,0,0.2)] p-6 md:p-8 hover:shadow-[0_12px_50px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_12px_50px_rgb(0,0,0,0.3)] transition-all duration-300"
              style={{ animation: 'fadeIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.7s both' }}
            >
              <h3 className="text-lg font-black text-[#2c2f33] dark:text-white tracking-tight mb-8">Channel Revenue Flow</h3>
              <div className="space-y-6">
                {topChannels.map((channel, i) => {
                  const maxRevenue = Math.max(...topChannels.map(c => c.revenue))
                  const pct = (channel.revenue / maxRevenue) * 100
                  const colors = ['linear-gradient(90deg, #6E3DFB 0%, #00D1FF 100%)', 'linear-gradient(90deg, #FF61BC 0%, #6E3DFB 100%)', '#00D1FF', '#FFB800', '#595c60']
                  return (
                    <div key={channel.channel} className="group">
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="text-[14px] font-bold text-[#595c60] dark:text-[#9b9da1] group-hover:text-[#2c2f33] dark:group-hover:text-white transition-colors">{channel.channel}</span>
                        <span className="text-[14px] font-black text-[#2c2f33] dark:text-white">{formatCurrency(channel.revenue)}</span>
                      </div>
                      <div className="h-2.5 bg-[#eff1f6] dark:bg-zinc-800/50 rounded-full overflow-hidden p-0.5 relative">
                        <div 
                          className="h-full rounded-full transition-all duration-1000 ease-out relative" 
                          style={{ width: `${pct}%`, background: colors[i] }} 
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
