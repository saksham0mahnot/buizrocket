import React from 'react'
import { cn } from '../../utils/cn'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'secondary'
  className?: string
}

const variantStyles: Record<string, string> = {
  default: 'bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/25',
  success: 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/25',
  warning: 'bg-amber-50 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/25',
  danger: 'bg-red-50 dark:bg-red-500/15 text-red-600 dark:text-red-400 border-red-200 dark:border-red-500/25',
  info: 'bg-cyan-50 dark:bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-500/25',
  secondary: 'bg-gray-100 dark:bg-zinc-500/15 text-gray-600 dark:text-zinc-400 border-gray-200 dark:border-zinc-500/25',
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { variant: BadgeProps['variant']; dot: string }> = {
    Delivered: { variant: 'success', dot: 'bg-emerald-400' },
    Shipped: { variant: 'info', dot: 'bg-cyan-400' },
    Pending: { variant: 'warning', dot: 'bg-amber-400' },
    Cancelled: { variant: 'danger', dot: 'bg-red-400' },
    Approved: { variant: 'success', dot: 'bg-emerald-400' },
    Suspended: { variant: 'danger', dot: 'bg-red-400' },
  }
  const config = map[status] ?? { variant: 'secondary', dot: 'bg-zinc-400' }
  return (
    <Badge variant={config.variant}>
      <span className={cn('w-1.5 h-1.5 rounded-full', config.dot)} />
      {status}
    </Badge>
  )
}
