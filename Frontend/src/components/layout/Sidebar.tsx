import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  BookOpen,
  MessageSquare,
  Zap,
  LogOut,
  ChevronRight,
} from 'lucide-react'
import { cn } from '../../utils/cn'
import { useAuthStore } from '../../store/authStore'
import { getInitials } from '../../utils/cn'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/orders', icon: ShoppingCart, label: 'Orders' },
  { to: '/catalog', icon: Package, label: 'Items' },
  { to: '/users', icon: Users, label: 'Manage IDs' },
  { to: '/growth', icon: TrendingUp, label: 'Growth' },
  { to: '/learn', icon: BookOpen, label: 'Learn' },
  { to: '/support', icon: MessageSquare, label: 'Support' },
]

export function Sidebar() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className="w-64 h-screen flex flex-col bg-white dark:bg-zinc-950 border-r border-gray-200 dark:border-zinc-800/60 flex-shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-200 dark:border-zinc-800/60">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
          <Zap size={16} className="text-white" />
        </div>
        <div>
          <span className="text-sm font-bold text-gray-900 dark:text-zinc-100 tracking-tight">Buizrocket</span>
          <p className="text-[10px] text-gray-400 dark:text-zinc-600 uppercase tracking-widest">Seller Portal</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto scrollbar-thin">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group relative',
                isActive
                  ? 'bg-blue-600/10 dark:bg-blue-600/15 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                  : 'text-gray-500 dark:text-zinc-500 hover:text-gray-900 dark:hover:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800/60'
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-blue-500 rounded-r-full" />
                )}
                <Icon size={16} className={cn('flex-shrink-0', isActive ? 'text-blue-500 dark:text-blue-400' : 'text-gray-400 dark:text-zinc-600 group-hover:text-gray-600 dark:group-hover:text-zinc-300')} />
                <span className="flex-1">{label}</span>
                {isActive && <ChevronRight size={14} className="text-blue-500/50" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User profile */}
      <div className="p-3 border-t border-gray-200 dark:border-zinc-800/60">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-100 dark:bg-zinc-800/40 hover:bg-gray-200 dark:hover:bg-zinc-800/70 transition-colors group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {user ? getInitials(user.name) : 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-800 dark:text-zinc-200 truncate">{user?.name}</p>
            <p className="text-[10px] text-gray-400 dark:text-zinc-600 truncate">{user?.role === 'admin' ? 'Administrator' : 'Seller'}</p>
          </div>
          <button
            id="sidebar-logout-btn"
            onClick={handleLogout}
            className="p-1.5 rounded-md text-gray-400 dark:text-zinc-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-400/10 transition-colors opacity-0 group-hover:opacity-100"
            title="Logout"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  )
}
