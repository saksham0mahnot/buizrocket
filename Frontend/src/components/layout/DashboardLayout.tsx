import { useState, useCallback, useRef, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Sidebar_Bottom } from './Sidebar_Bottom'
import { Toaster } from 'react-hot-toast'

const MIN_WIDTH = 180
const MAX_WIDTH = 400
const DEFAULT_WIDTH = 256 // 16rem / w-64

export function DashboardLayout() {
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_WIDTH)
  const [isDragging, setIsDragging] = useState(false)
  const startX = useRef(0)
  const startWidth = useRef(DEFAULT_WIDTH)

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    startX.current = e.clientX
    startWidth.current = sidebarWidth
    setIsDragging(true)
  }, [sidebarWidth])

  useEffect(() => {
    if (!isDragging) return

    const onMouseMove = (e: MouseEvent) => {
      const delta = e.clientX - startX.current
      const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidth.current + delta))
      setSidebarWidth(newWidth)
    }

    const onMouseUp = () => setIsDragging(false)

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }
  }, [isDragging])

  return (
    <div
      className="flex h-screen overflow-hidden bg-gray-50 dark:bg-zinc-950"
      style={{ cursor: isDragging ? 'col-resize' : 'auto', userSelect: isDragging ? 'none' : 'auto' }}
    >
      {/* Sidebar */}
      <aside
        className="h-screen flex flex-col bg-white dark:bg-zinc-950 border-r border-gray-200 dark:border-zinc-800/60 flex-shrink-0 relative"
        style={{ width: sidebarWidth }}
      >
        <Sidebar width={sidebarWidth} />
        <div className="h-px bg-gray-200 dark:bg-zinc-800/60 mx-4 my-2" />
        <Sidebar_Bottom width={sidebarWidth} />

        {/* Resize Handle */}
        <div
          onMouseDown={onMouseDown}
          className="absolute top-0 right-0 w-1 h-full cursor-col-resize group z-50 select-none"
          title="Drag to resize"
        >
          {/* Visible indicator strip */}
          <div className={`
            absolute top-0 right-0 w-1 h-full transition-all duration-150
            ${isDragging
              ? 'bg-blue-500 opacity-100 w-[3px]'
              : 'bg-transparent group-hover:bg-blue-400/60 group-hover:w-[3px]'
            }
          `} />
          {/* Centered grip dots */}
          <div className={`
            absolute top-1/2 right-[-4px] -translate-y-1/2
            flex flex-col gap-1 transition-opacity duration-150
            ${isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
          `}>
            {[0, 1, 2, 3, 4].map(i => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-sm" />
            ))}
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
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
