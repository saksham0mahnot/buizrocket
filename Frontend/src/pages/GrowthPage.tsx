import { useState, useEffect } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts'
import {
  TrendingUp, TrendingDown, Plus, X, BarChart2, PieChart as PieIcon,
  LineChart as LineIcon, LayoutGrid, MessageSquare, Users, ShoppingBag,
  Package, Percent, DollarSign, ChevronDown, Sparkles,
} from 'lucide-react'
import { createPortal } from 'react-dom'
import { TopNavbar } from '../components/layout/TopNavbar'
import { mockChartData } from '../services/mockData'
import { formatCurrency } from '../utils/cn'

// ─── Data sources ────────────────────────────────────
const conversionData = [
  { name: 'Aug', visitors: 1200, conversions: 87, users: 540, orders: 87, products: 23 },
  { name: 'Sep', visitors: 1450, conversions: 102, users: 612, orders: 102, products: 28 },
  { name: 'Oct', visitors: 1300, conversions: 94, users: 580, orders: 94, products: 25 },
  { name: 'Nov', visitors: 1800, conversions: 128, users: 760, orders: 128, products: 31 },
  { name: 'Dec', visitors: 2200, conversions: 156, users: 890, orders: 156, products: 38 },
  { name: 'Jan', visitors: 1950, conversions: 143, users: 820, orders: 143, products: 35 },
  { name: 'Feb', visitors: 2300, conversions: 168, users: 940, orders: 168, products: 42 },
  { name: 'Mar', visitors: 2600, conversions: 189, users: 1050, orders: 189, products: 47 },
]

const activityFeed = [
  { time: '2 min ago',  text: 'New order #ORD-1247 placed',       color: '#6E3DFB' },
  { time: '8 min ago',  text: 'User Priya Patel registered',       color: '#00D1FF' },
  { time: '14 min ago', text: 'Product "Smart Watch Pro" updated', color: '#FF61BC' },
  { time: '22 min ago', text: 'Payment ₹8,999 received',           color: '#34d399' },
  { time: '31 min ago', text: 'Order #ORD-1246 shipped',           color: '#fbbf24' },
  { time: '45 min ago', text: 'New user Amit Kumar registered',    color: '#6E3DFB' },
  { time: '1 hr ago',   text: 'Catalog updated — 3 new products',  color: '#00D1FF' },
]

// ─── Widget catalogue ─────────────────────────────────
type ChartType = 'area' | 'bar' | 'line' | 'donut' | 'stat' | 'activity'
type DataTopic = 'revenue' | 'orders' | 'users' | 'products' | 'conversion'

interface WidgetDef {
  id: string
  chartType: ChartType
  topic: DataTopic
}

const CHART_TYPES: { type: ChartType; label: string; icon: React.ReactNode; desc: string }[] = [
  { type: 'area',     label: 'Area Chart',    icon: <TrendingUp size={18} />,     desc: 'Smooth area trend' },
  { type: 'bar',      label: 'Bar Chart',     icon: <BarChart2 size={18} />,       desc: 'Column comparison' },
  { type: 'line',     label: 'Line Chart',    icon: <LineIcon size={18} />,        desc: 'Precise line trend' },
  { type: 'donut',    label: 'Donut Chart',   icon: <PieIcon size={18} />,         desc: 'Proportion view' },
  { type: 'stat',     label: 'Stat Card',     icon: <LayoutGrid size={18} />,      desc: 'Single KPI snapshot' },
  { type: 'activity', label: 'Activity Feed', icon: <MessageSquare size={18} />,   desc: 'Live event stream' },
]

const DATA_TOPICS: { topic: DataTopic; label: string; icon: React.ReactNode; color: string; gradFrom: string; gradTo: string }[] = [
  { topic: 'revenue',    label: 'Revenue',         icon: <DollarSign size={15} />,  color: '#00D1FF', gradFrom: '#00D1FF', gradTo: '#6E3DFB' },
  { topic: 'orders',     label: 'Orders',          icon: <ShoppingBag size={15} />, color: '#6E3DFB', gradFrom: '#6E3DFB', gradTo: '#FF61BC' },
  { topic: 'users',      label: 'Users',           icon: <Users size={15} />,       color: '#FF61BC', gradFrom: '#FF61BC', gradTo: '#fbbf24' },
  { topic: 'products',   label: 'Products',        icon: <Package size={15} />,     color: '#34d399', gradFrom: '#34d399', gradTo: '#00D1FF' },
  { topic: 'conversion', label: 'Conversion Rate', icon: <Percent size={15} />,     color: '#fbbf24', gradFrom: '#fbbf24', gradTo: '#f59e0b' },
]

const TOPIC_STAT: Record<DataTopic, { value: string; delta: string; positive: boolean }> = {
  revenue:    { value: '₹28.5L', delta: '+18.5%', positive: true },
  orders:     { value: '1,247',  delta: '+12.3%', positive: true },
  users:      { value: '1,050',  delta: '+9.1%',  positive: true },
  products:   { value: '47',     delta: '+7.2%',  positive: true },
  conversion: { value: '7.3%',   delta: '+1.1%',  positive: true },
}

// Unified chart row type that covers both data sets
type ChartRow = { name: string; revenue?: number; orders?: number; users?: number; products?: number; conversions?: number; visitors?: number }

function getDataKey(topic: DataTopic): keyof ChartRow {
  if (topic === 'revenue')    return 'revenue'
  if (topic === 'orders')     return 'orders'
  if (topic === 'users')      return 'users'
  if (topic === 'products')   return 'products'
  return 'conversions'
}

function getChartData(topic: DataTopic): ChartRow[] {
  if (topic === 'revenue') return mockChartData as ChartRow[]
  return conversionData as ChartRow[]
}

let uidCounter = 100
function uid() { return `w-${++uidCounter}` }

// ─── Donut data ───────────────────────────────────────
const DONUT_DATA: Record<DataTopic, { name: string; value: number }[]> = {
  revenue:    [{ name: 'Direct', value: 891 }, { name: 'Search', value: 723 }, { name: 'Social', value: 498 }, { name: 'Email', value: 254 }],
  orders:     [{ name: 'Direct', value: 312 }, { name: 'Search', value: 245 }, { name: 'Social', value: 178 }, { name: 'Email', value: 89 }],
  users:      [{ name: 'Approved', value: 430 }, { name: 'Pending', value: 320 }, { name: 'Suspended', value: 300 }],
  products:   [{ name: 'Electronics', value: 20 }, { name: 'Gaming', value: 12 }, { name: 'Fashion', value: 8 }, { name: 'Others', value: 7 }],
  conversion: [{ name: 'Converted', value: 73 }, { name: 'Bounced', value: 27 }],
}
const DONUT_COLORS = ['#6E3DFB', '#00D1FF', '#FF61BC', '#34d399', '#fbbf24']

const tooltipStyle = {
  contentStyle: { background: 'rgba(21,23,27,0.92)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' },
  itemStyle: { fontWeight: 800, fontSize: '13px' },
  labelStyle: { color: '#9b9da1', fontWeight: 600, marginBottom: '4px' },
}

// ─── Individual Widget renderer ───────────────────────
function Widget({ def, onRemove }: { def: WidgetDef; onRemove: () => void }) {
  const topicMeta  = DATA_TOPICS.find(t => t.topic === def.topic)!
  const chartMeta  = CHART_TYPES.find(c => c.type === def.chartType)!
  const data       = getChartData(def.topic)
  const dataKey    = getDataKey(def.topic)
  const stat       = TOPIC_STAT[def.topic]
  const gradId     = `grad-${def.id}`

  const isActivity = def.chartType === 'activity'
  const isStat     = def.chartType === 'stat'

  return (
    <div className="group relative bg-white/80 dark:bg-[#15171b]/80 backdrop-blur-2xl border border-white/40 dark:border-white/5 rounded-[2rem] shadow-[0_8px_40px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_40px_rgb(0,0,0,0.2)] p-6 hover:shadow-[0_12px_50px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_12px_50px_rgb(0,0,0,0.3)] transition-all duration-300 overflow-hidden">
      {/* Remove button */}
      <button
        onClick={onRemove}
        className="absolute top-4 right-4 z-20 w-7 h-7 rounded-full bg-[#f5f6fb] dark:bg-zinc-700/60 flex items-center justify-center text-[#9b9da1] hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100"
        title="Remove widget"
      >
        <X size={13} strokeWidth={2.5} />
      </button>

      {/* Header */}
      <div className="flex items-start gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `linear-gradient(135deg, ${topicMeta.gradFrom}22, ${topicMeta.gradTo}22)`, color: topicMeta.color }}>
          {topicMeta.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[14px] font-black text-[#2c2f33] dark:text-white tracking-tight leading-tight">{topicMeta.label}</h3>
          <p className="text-[11px] font-semibold text-[#9b9da1] mt-0.5">{chartMeta.label}</p>
        </div>
      </div>

      {/* Stat Card */}
      {isStat && (
        <div>
          <p className="text-4xl font-black text-[#2c2f33] dark:text-white tracking-tight mb-3">{stat.value}</p>
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-bold ${stat.positive ? 'bg-[#00D1FF]/10 text-[#00647b] dark:text-[#37d4ff]' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'}`}>
            {stat.positive ? <TrendingUp size={13} strokeWidth={3} /> : <TrendingDown size={13} strokeWidth={3} />}
            {stat.delta} <span className="opacity-70 ml-1 font-semibold hidden xl:inline">vs last month</span>
          </div>
        </div>
      )}

      {/* Activity Feed */}
      {isActivity && (
        <div className="space-y-3 max-h-[220px] overflow-y-auto scrollbar-thin pr-1">
          {activityFeed.map((ev, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: ev.color }} />
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-[#2c2f33] dark:text-white truncate">{ev.text}</p>
                <p className="text-[10px] text-[#9b9da1] mt-0.5">{ev.time}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Charts */}
      {!isStat && !isActivity && (
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {def.chartType === 'area' ? (
              <AreaChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={topicMeta.color} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={topicMeta.color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="#e6e8ee" vertical={false} opacity={0.5} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9b9da1', fontWeight: 600 }} axisLine={false} tickLine={false} dy={8} />
                <YAxis tick={{ fontSize: 11, fill: '#9b9da1', fontWeight: 600 }} axisLine={false} tickLine={false} dx={-8}
                  tickFormatter={def.topic === 'revenue' ? (v) => `₹${(v / 1000).toFixed(0)}k` : undefined} />
                <Tooltip {...tooltipStyle} formatter={(v) => def.topic === 'revenue' ? formatCurrency(Number(v)) : String(v ?? '')} />
                <Area type="monotone" dataKey={dataKey} stroke={topicMeta.color} strokeWidth={2.5} fill={`url(#${gradId})`} />
              </AreaChart>
            ) : def.chartType === 'bar' ? (
              <BarChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="#e6e8ee" vertical={false} opacity={0.5} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9b9da1', fontWeight: 600 }} axisLine={false} tickLine={false} dy={8} />
                <YAxis tick={{ fontSize: 11, fill: '#9b9da1', fontWeight: 600 }} axisLine={false} tickLine={false} dx={-8}
                  tickFormatter={def.topic === 'revenue' ? (v) => `₹${(v / 1000).toFixed(0)}k` : undefined} />
                <Tooltip {...tooltipStyle} cursor={{ fill: 'rgba(110,61,251,0.05)' }} formatter={(v) => def.topic === 'revenue' ? formatCurrency(Number(v)) : String(v ?? '')} />
                <Bar dataKey={dataKey} fill={topicMeta.color} radius={[6, 6, 0, 0]} barSize={20} name={topicMeta.label} />
              </BarChart>
            ) : def.chartType === 'line' ? (
              <LineChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="#e6e8ee" vertical={false} opacity={0.5} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9b9da1', fontWeight: 600 }} axisLine={false} tickLine={false} dy={8} />
                <YAxis tick={{ fontSize: 11, fill: '#9b9da1', fontWeight: 600 }} axisLine={false} tickLine={false} dx={-8}
                  tickFormatter={def.topic === 'revenue' ? (v) => `₹${(v / 1000).toFixed(0)}k` : undefined} />
                <Tooltip {...tooltipStyle} formatter={(v) => def.topic === 'revenue' ? formatCurrency(Number(v)) : String(v ?? '')} />
                <Line type="monotone" dataKey={dataKey} stroke={topicMeta.color} strokeWidth={2.5} dot={{ r: 3, strokeWidth: 2 }} activeDot={{ r: 5, stroke: '#fff', strokeWidth: 2 }} name={topicMeta.label} />
              </LineChart>
            ) : (
              /* donut */
              <PieChart>
                <Pie data={DONUT_DATA[def.topic]} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                  {DONUT_DATA[def.topic].map((_, i) => (
                    <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip {...tooltipStyle} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, fontWeight: 700 }} />
              </PieChart>
            )}
          </ResponsiveContainer>
        </div>
      )}

      {/* Decorative glow */}
      <div className="absolute -bottom-8 -right-8 w-28 h-28 rounded-full blur-2xl pointer-events-none transition-transform duration-700 group-hover:scale-150" style={{ background: `radial-gradient(circle, ${topicMeta.color}18 0%, transparent 70%)` }} />
    </div>
  )
}

// ─── Add Widget Panel ─────────────────────────────────
function AddWidgetPanel({ onAdd }: { onAdd: (w: WidgetDef) => void }) {
  const [open, setOpen]           = useState(false)
  const [chartType, setChartType] = useState<ChartType>('area')
  const [topic, setTopic]         = useState<DataTopic>('revenue')
  const [mounted, setMounted]     = useState(false)

  // Ensure portal target is available after mount
  useEffect(() => { setMounted(true) }, [])

  // Lock body scroll when modal is open
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const handleAdd = () => {
    onAdd({ id: uid(), chartType, topic })
    setOpen(false)
  }

  const modalRoot = mounted ? document.getElementById('modal-root') : null

  const modal = open ? (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
    >
      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}
      />

      {/* Panel */}
      <div className="relative w-full max-w-lg bg-white dark:bg-[#15171b] rounded-[2rem] shadow-[0_24px_80px_rgb(0,0,0,0.3)] dark:shadow-[0_24px_80px_rgb(0,0,0,0.6)] border border-white/40 dark:border-white/5 flex flex-col animate-[scaleIn_0.25s_cubic-bezier(0.22,1,0.36,1)_both]" style={{ maxHeight: '90vh', position: 'relative', zIndex: 1 }}>
        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 p-6 scrollbar-thin">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6E3DFB]/20 to-[#00D1FF]/20 flex items-center justify-center text-[#6E3DFB]">
                <Sparkles size={18} />
              </div>
              <div>
                <h2 className="text-[16px] font-black text-[#2c2f33] dark:text-white">Add a Widget</h2>
                <p className="text-[11px] text-[#9b9da1] font-medium">Choose chart type and data source</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-full bg-[#f5f6fb] dark:bg-zinc-800 flex items-center justify-center text-[#9b9da1] hover:text-rose-500 transition-colors">
              <X size={15} strokeWidth={2.5} />
            </button>
          </div>

          {/* Chart type picker */}
          <p className="text-[11px] font-bold text-[#9b9da1] uppercase tracking-widest mb-3">Chart Type</p>
          <div className="grid grid-cols-3 gap-2 mb-6">
            {CHART_TYPES.map(c => (
              <button
                key={c.type}
                onClick={() => setChartType(c.type)}
                className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all text-center ${
                  chartType === c.type
                    ? 'border-[#6E3DFB] bg-[#6E3DFB]/5 dark:bg-[#6E3DFB]/10 text-[#6E3DFB]'
                    : 'border-[#e6e8ee] dark:border-zinc-700/60 text-[#9b9da1] hover:border-[#6E3DFB]/40 hover:text-[#6E3DFB] bg-[#f5f6fb]/60 dark:bg-zinc-800/40'
                }`}
              >
                <span>{c.icon}</span>
                <span className="text-[11px] font-bold leading-tight">{c.label}</span>
              </button>
            ))}
          </div>

          {/* Data topic picker — hidden for Activity Feed */}
          {chartType !== 'activity' && (
            <>
              <p className="text-[11px] font-bold text-[#9b9da1] uppercase tracking-widest mb-3">Data Source</p>
              <div className="grid grid-cols-1 gap-2 mb-2">
                {DATA_TOPICS.map(t => (
                  <button
                    key={t.topic}
                    onClick={() => setTopic(t.topic)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all text-left ${
                      topic === t.topic ? 'border-transparent' : 'border-[#e6e8ee] dark:border-zinc-700/60 bg-[#f5f6fb]/60 dark:bg-zinc-800/40'
                    }`}
                    style={
                      topic === t.topic
                        ? { borderColor: t.color, background: `${t.color}12`, boxShadow: `0 0 0 2px ${t.color}40 inset` }
                        : {}
                    }
                  >
                    <span className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${t.color}22`, color: t.color }}>
                      {t.icon}
                    </span>
                    <span
                      className={`text-[13px] font-bold ${topic === t.topic ? '' : 'text-[#595c60] dark:text-[#9b9da1]'}`}
                      style={topic === t.topic ? { color: t.color } : {}}
                    >
                      {t.label}
                    </span>
                    {topic === t.topic && (
                      <ChevronDown size={14} style={{ color: t.color }} className="ml-auto rotate-[-90deg]" />
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Sticky footer */}
        <div className="flex gap-3 justify-end px-6 py-4 border-t border-[#e6e8ee] dark:border-zinc-800 bg-white dark:bg-[#15171b] rounded-b-[2rem] flex-shrink-0">
          <button
            onClick={() => setOpen(false)}
            className="px-5 py-2.5 rounded-2xl text-sm font-bold text-[#9b9da1] border border-[#e6e8ee] dark:border-zinc-700 hover:text-[#2c2f33] dark:hover:text-white transition-colors bg-[#f5f6fb]/60 dark:bg-zinc-800/40"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            className="px-6 py-2.5 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-[#6E3DFB] to-[#00D1FF] shadow-[0_4px_14px_0_rgb(110,61,251,0.39)] hover:scale-105 hover:shadow-[0_6px_20px_rgba(110,61,251,0.5)] transition-all"
          >
            Add Widget
          </button>
        </div>
      </div>
    </div>
  ) : null

  return (
    <>
      <button
        id="add-widget-btn"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#6E3DFB] to-[#00D1FF] text-white text-sm font-bold shadow-[0_4px_14px_0_rgb(110,61,251,0.39)] hover:shadow-[0_6px_20px_rgba(110,61,251,0.5)] hover:scale-105 transition-all duration-200"
      >
        <Plus size={16} strokeWidth={2.5} />
        Add Widget
      </button>
      {modalRoot && createPortal(modal, modalRoot)}
    </>
  )
}

// ─── Main page ────────────────────────────────────────
const DEFAULT_WIDGETS: WidgetDef[] = [
  { id: 'w-1', chartType: 'area',  topic: 'revenue' },
  { id: 'w-2', chartType: 'line',  topic: 'orders'  },
]

export function GrowthPage() {
  const [widgets, setWidgets] = useState<WidgetDef[]>(DEFAULT_WIDGETS)

  const addWidget  = (w: WidgetDef) => setWidgets(prev => [...prev, w])
  const removeWidget = (id: string) => setWidgets(prev => prev.filter(w => w.id !== id))

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#f5f6fb] dark:bg-[#0c0e12]">
      <TopNavbar title="Growth Analytics" subtitle="Track your store performance and trends" />
      <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin">
        <div className="max-w-[1600px] mx-auto space-y-8">

          {/* KPI row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[
              { label: 'Avg Order Value', value: '₹4,231', delta: '+5.2%', positive: true,  delay: 0   },
              { label: 'Conversion Rate', value: '7.3%',   delta: '+1.1%', positive: true,  delay: 0.1 },
              { label: 'Repeat Buyers',   value: '38%',    delta: '+2.4%', positive: true,  delay: 0.2 },
              { label: 'Return Rate',     value: '4.1%',   delta: '-0.3%', positive: false, delay: 0.3 },
            ].map((kpi) => (
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
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-gradient-to-br from-[#6E3DFB]/10 to-[#FF61BC]/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
              </div>
            ))}
          </div>

          {/* Widget board header */}
          <div className="flex items-center justify-between" style={{ animation: 'fadeIn 0.5s ease-out 0.3s both' }}>
            <div>
              <h2 className="text-[18px] font-black text-[#2c2f33] dark:text-white tracking-tight">Your Dashboard</h2>
              <p className="text-[13px] text-[#9b9da1] font-medium mt-0.5">Add and arrange the insights you care about most</p>
            </div>
            <AddWidgetPanel onAdd={addWidget} />
          </div>

          {/* Widget grid */}
          {widgets.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-20 bg-white/60 dark:bg-[#15171b]/60 backdrop-blur-xl border border-dashed border-[#d1d4db] dark:border-zinc-700/50 rounded-[2rem] text-center"
              style={{ animation: 'fadeIn 0.4s ease-out 0.4s both' }}
            >
              <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-[#6E3DFB]/10 to-[#00D1FF]/10 flex items-center justify-center text-[#6E3DFB] mb-4">
                <LayoutGrid size={28} />
              </div>
              <p className="text-[16px] font-black text-[#2c2f33] dark:text-white mb-1">No widgets yet</p>
              <p className="text-[13px] text-[#9b9da1] font-medium mb-6">Click "Add Widget" to build your custom analytics dashboard</p>
              <AddWidgetPanel onAdd={addWidget} />
            </div>
          ) : (
            <div
              className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 pb-10"
              style={{ animation: 'fadeIn 0.5s ease-out 0.4s both' }}
            >
              {widgets.map((w) => (
                <Widget key={w.id} def={w} onRemove={() => removeWidget(w.id)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
