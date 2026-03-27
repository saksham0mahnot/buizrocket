import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Sidebar_Bottom } from './Sidebar_Bottom'
import { Toaster } from 'react-hot-toast'

export function DashboardLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-zinc-950">
      <aside className="w-64 h-screen flex flex-col bg-white dark:bg-zinc-950 border-r border-gray-200 dark:border-zinc-800/60 flex-shrink-0">
        <Sidebar />
        <div className="h-px bg-gray-200 dark:bg-zinc-800/60 mx-4 my-2" />
        <Sidebar_Bottom />
      </aside>
      <main className="flex-1 flex flex-col overflow-hidden">
        <Outlet />
      </main>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#18181b',
            color: '#f4f4f5',
            border: '1px solid #27272a',
            borderRadius: '12px',
            fontSize: '13px',
          },
          success: { iconTheme: { primary: '#34d399', secondary: '#18181b' } },
          error: { iconTheme: { primary: '#f87171', secondary: '#18181b' } },
        }}
      />
    </div>
  )
}
