import { NavLink } from 'react-router-dom'
import { ChevronRight, Wallet } from 'lucide-react'
import { cn } from '../../utils/cn'

const navItems = [
    { to: '/accounts', icon: Wallet, label: 'Manage Accounts' },
]

export function Sidebar_Bottom() {

    return (
        <div className="flex flex-col bg-white dark:bg-zinc-950 pb-4">
            {/* Navigation */}
            <nav className="px-3 py-2 space-y-0.5">
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
        </div>
    )
}
