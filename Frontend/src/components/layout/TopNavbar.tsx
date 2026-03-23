import { useState } from 'react'
import { Search, Bell, Sun, Moon, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { getInitials } from '../../utils/cn'

interface TopNavbarProps {
  title: string
  subtitle?: string
}

export function TopNavbar({ title, subtitle }: TopNavbarProps) {
  const { user, logout, isDark, toggleTheme } = useAuthStore()
  const navigate = useNavigate()
  const [searchFocused, setSearchFocused] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
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
        <div className={`relative flex items-center transition-all duration-300 ${searchFocused ? 'w-64' : 'w-44'}`}>
          <Search size={14} className="absolute left-3 text-gray-400 dark:text-zinc-500 pointer-events-none" />
          <input
            id="global-search"
            type="text"
            placeholder="Search..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-100 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700/60 rounded-lg text-gray-700 dark:text-zinc-300 placeholder-gray-400 dark:placeholder-zinc-600 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20 transition-all"
          />
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
        <button
          id="notifications-btn"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 dark:text-zinc-500 hover:text-gray-900 dark:hover:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all relative"
        >
          <Bell size={15} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-blue-500" />
        </button>

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
    </header>
  )
}
