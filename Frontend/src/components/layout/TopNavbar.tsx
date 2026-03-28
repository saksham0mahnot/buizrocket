import { useState, useRef, useEffect, useMemo } from 'react'
import { Search, Bell, Sun, Moon, LogOut, X, ShoppingBag, User, Package, ExternalLink, Clock, Check, ChevronRight, AlertCircle } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { getInitials } from '../../utils/cn'
import toast from 'react-hot-toast'

interface Notification {
  id: string
  title: string
  desc: string
  time: string
  type: 'order' | 'user' | 'alert' | 'system'
  read: boolean
}

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: '1', title: 'New Order #ORD-8822', desc: 'Rahul Sharma just placed an order for ₹5,397', time: '2 min ago', type: 'order', read: false },
  { id: '2', title: 'Low Stock Alert', desc: 'Sony WH-1000XM5 is below safe threshold (2 items)', time: '1 hour ago', type: 'alert', read: false },
  { id: '3', title: 'New Seller Request', desc: 'Global Tech applied for a Wholesaler account', time: '3 hours ago', type: 'user', read: true },
  { id: '4', title: 'System Update', desc: 'Buizrocket Admin v2.1 is now live with Growth Analytics', time: '1 day ago', type: 'system', read: true },
]

interface TopNavbarProps {
  title: string
  subtitle?: string
}

export function TopNavbar({ title, subtitle }: TopNavbarProps) {
  const { user, logout, isDark, toggleTheme } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  
  const [searchFocused, setSearchFocused] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS)
  
  const searchRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter(n => !n.read).length

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false)
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    toast.success('All notifications marked as read')
  }

  const clearNotifications = () => {
    setNotifications([])
    setShowNotifications(false)
  }

  // Quick navigation search results
  const searchResults = useMemo(() => {
    if (!searchQuery) return []
    const q = searchQuery.toLowerCase()
    
    const pages = [
      { id: 'p1', title: 'Dashboard', type: 'Page', path: '/' },
      { id: 'p2', title: 'Manage Users', type: 'Page', path: '/users' },
      { id: 'p3', title: 'Catalog', type: 'Product Catalog', path: '/catalog' },
      { id: 'p4', title: 'Orders', type: 'Order History', path: '/orders' },
      { id: 'p5', title: 'Growth Analytics', type: 'Insights', path: '/growth' },
      { id: 'p6', title: 'Manage Accounts', type: 'Accounting', path: '/accounts' },
    ].filter(p => p.title.toLowerCase().includes(q))

    const mockResults = [
      { id: 'o1', title: 'Order #ORD-771', type: 'Order', path: '/orders' },
      { id: 'u1', title: 'Vikram Singh', type: 'User', path: '/users' },
      { id: 'pr1', title: 'Wireless Earbuds', type: 'Product', path: '/catalog' },
    ].filter(r => r.title.toLowerCase().includes(q))

    return [...pages, ...mockResults]
  }, [searchQuery])

  const handleSearchItemClick = (path: string) => {
    setSearchQuery('')
    setSearchFocused(false)
    navigate(path)
  }

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-gray-200 dark:border-zinc-800/60 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md flex-shrink-0 sticky top-0 z-20">
      {/* Page title */}
      <div>
        <h1 className="text-base font-semibold text-gray-900 dark:text-zinc-100">{title}</h1>
        {subtitle && <p className="text-xs text-gray-400 dark:text-zinc-500">{subtitle}</p>}
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div ref={searchRef} className={`relative flex flex-col transition-all duration-300 ${searchFocused ? 'w-80' : 'w-44'}`}>
          <div className="relative flex items-center">
            <Search size={14} className={`absolute left-3 transition-colors ${searchFocused ? 'text-blue-500' : 'text-gray-400 dark:text-zinc-500'}`} />
            <input
              id="global-search"
              type="text"
              placeholder="Quick search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              className="w-full pl-8 pr-10 py-1.5 text-xs bg-gray-100 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700/60 rounded-lg text-gray-700 dark:text-zinc-300 placeholder-gray-400 dark:placeholder-zinc-600 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20 transition-all shadow-sm"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 p-0.5 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-400"
              >
                <X size={10} />
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {searchFocused && (searchQuery || searchResults.length > 0) && (
            <div className={`absolute top-full right-0 mt-2 w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden animate-[scaleIn_0.2s_ease-out]`}>
              <div className="p-2">
                <p className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Results</p>
                {searchResults.length === 0 ? (
                  <div className="px-3 py-4 text-center text-xs text-gray-500 dark:text-zinc-500">
                    No matching results for "{searchQuery}"
                  </div>
                ) : (
                  <div className="space-y-0.5">
                    {searchResults.map((res: any) => (
                      <button
                        key={res.id}
                        onClick={() => handleSearchItemClick(res.path)}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left hover:bg-gray-50 dark:hover:bg-zinc-800/80 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-gray-500 group-hover:text-blue-500 transition-colors">
                            {res.type === 'Page' ? <ExternalLink size={14} /> : res.type === 'Order' ? <ShoppingBag size={14} /> : res.type === 'User' ? <User size={14} /> : <Package size={14} />}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-700 dark:text-zinc-300">{res.title}</p>
                            <p className="text-[10px] text-gray-400 dark:text-zinc-500 font-medium">{res.type}</p>
                          </div>
                        </div>
                        <ChevronRight size={12} className="text-gray-300 group-hover:text-blue-500 transform translate-x-0 group-hover:translate-x-1 transition-all" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Theme toggle */}
        <button
          id="theme-toggle-btn"
          onClick={toggleTheme}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 dark:text-zinc-500 hover:text-gray-900 dark:hover:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all"
          title="Toggle theme"
        >
          {isDark ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            id="notifications-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all relative ${
              showNotifications ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400' : 'text-gray-500 dark:text-zinc-500 hover:text-gray-900 dark:hover:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800'
            }`}
          >
            <Bell size={15} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)] animate-pulse" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-[scaleIn_0.2s_ease-out] z-50">
              <div className="px-4 py-3 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between bg-gray-50/50 dark:bg-zinc-800/30">
                <h3 className="text-xs font-black text-gray-900 dark:text-zinc-100">Notifications</h3>
                <div className="flex gap-2">
                  <button onClick={markAllAsRead} className="text-[10px] font-bold text-blue-500 hover:underline">Read All</button>
                  <button onClick={clearNotifications} className="text-[10px] font-bold text-gray-400 hover:text-rose-500">Clear</button>
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto p-1 scrollbar-thin">
                {notifications.length === 0 ? (
                  <div className="py-12 flex flex-col items-center justify-center text-center px-4">
                    <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-zinc-800 flex items-center justify-center text-gray-300 dark:text-zinc-600 mb-3">
                      <Bell size={24} />
                    </div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-zinc-100 mb-1">No notifications</p>
                    <p className="text-xs text-gray-500 dark:text-zinc-500">We'll alert you when something important happens.</p>
                  </div>
                ) : (
                  <div className="space-y-0.5">
                    {notifications.map(notif => (
                      <div
                        key={notif.id}
                        className={`relative p-3 rounded-xl transition-all cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800/80 group ${!notif.read ? 'bg-blue-50/30 dark:bg-blue-500/5' : ''}`}
                      >
                        <div className="flex gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            notif.type === 'order' ? 'bg-emerald-100 text-emerald-600' :
                            notif.type === 'alert' ? 'bg-rose-100 text-rose-600' :
                            notif.type === 'user' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {notif.type === 'order' ? <ShoppingBag size={14} /> : notif.type === 'alert' ? <AlertCircle size={14} /> : notif.type === 'user' ? <User size={14} /> : <Bell size={14} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-0.5">
                              <p className={`text-[12px] font-bold truncate ${!notif.read ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-zinc-300'}`}>
                                {notif.title}
                              </p>
                              <div className="flex items-center gap-1.5">
                                {!notif.read && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                                {notif.read && <Check size={10} className="text-gray-400" />}
                              </div>
                            </div>
                            <p className="text-[11px] text-gray-500 dark:text-zinc-500 line-clamp-2 leading-relaxed mb-1.5">
                              {notif.desc}
                            </p>
                            <div className="flex items-center gap-1 text-[10px] text-gray-400 font-medium">
                              <Clock size={10} />
                              {notif.time}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {notifications.length > 0 && (
                <div className="p-2 border-t border-gray-100 dark:border-zinc-800 bg-gray-50/30 dark:bg-zinc-800/20">
                  <button className="w-full py-2 rounded-lg text-[11px] font-bold text-gray-500 hover:text-blue-500 transition-colors">
                    View All Notifications
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-gray-200 dark:bg-zinc-800 mx-1" />

        {/* User avatar */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold">
            {user ? getInitials(user.name) : 'U'}
          </div>
          <div className="hidden md:block">
            <p className="text-xs font-medium text-gray-800 dark:text-zinc-200 leading-none">{user?.name}</p>
            <p className="text-[10px] text-gray-400 dark:text-zinc-600 mt-0.5 capitalize">{user?.role}</p>
          </div>
        </div>

        {/* Logout */}
        <button
          id="topnav-logout-btn"
          onClick={handleLogout}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 dark:text-zinc-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-400/10 transition-all"
          title="Logout"
        >
          <LogOut size={14} />
        </button>
      </div>
      <style>{`
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95) translateY(-10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </header>
  )
}
