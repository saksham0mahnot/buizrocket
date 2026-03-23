import React from 'react'
import { cn } from '../../utils/cn'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
}

export function Card({ children, className, hover, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-xl border border-gray-200 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/80 backdrop-blur-sm',
        hover && 'hover:border-gray-300 dark:hover:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800/60 transition-all duration-200 cursor-pointer',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('p-5 pb-0', className)}>{children}</div>
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('p-5', className)}>{children}</div>
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h3 className={cn('text-sm font-medium text-gray-500 dark:text-zinc-400 tracking-wide uppercase', className)}>{children}</h3>
}

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  growth?: number
  subtitle?: string
  color?: 'blue' | 'emerald' | 'violet' | 'amber'
}

const colorMap = {
  blue: { icon: 'bg-blue-500/15 text-blue-500 dark:text-blue-400', glow: '' },
  emerald: { icon: 'bg-emerald-500/15 text-emerald-500 dark:text-emerald-400', glow: '' },
  violet: { icon: 'bg-violet-500/15 text-violet-500 dark:text-violet-400', glow: '' },
  amber: { icon: 'bg-amber-500/15 text-amber-500 dark:text-amber-400', glow: '' },
}

export function StatCard({ title, value, icon, growth, subtitle, color = 'blue' }: StatCardProps) {
  const colors = colorMap[color]
  return (
    <Card className={cn('p-5', colors.glow)}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-500 dark:text-zinc-500 uppercase tracking-widest mb-3">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-zinc-100 tabular-nums">{value}</p>
          {growth !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              <span className={cn(
                'text-xs font-medium',
                growth >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'
              )}>
                {growth >= 0 ? '↑' : '↓'} {Math.abs(growth)}%
              </span>
              <span className="text-xs text-gray-400 dark:text-zinc-600">vs last month</span>
            </div>
          )}
          {subtitle && <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">{subtitle}</p>}
        </div>
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', colors.icon)}>
          {icon}
        </div>
      </div>
    </Card>
  )
}
