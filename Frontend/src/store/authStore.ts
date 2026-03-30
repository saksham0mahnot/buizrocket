import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthUser } from '../types'

interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  isDark: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  toggleTheme: () => void
}

const MOCK_CREDENTIALS = [
  { email: import.meta.env.VITE_DEFAULT_EMAIL || 'admin@buizrocket.com', password: import.meta.env.VITE_DEFAULT_PASSWORD || 'admin123', role: 'admin' as const, name: 'Admin User', id: '1' },
  { email: 'bhaskar.mahnot@buizrocket.com', password: 'bhaskar123', role: 'seller' as const, name: 'Rajesh Verma', id: '2' },
]

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isDark: true,
      login: async (email: string, password: string): Promise<boolean> => {
        await new Promise((r) => setTimeout(r, 800))
        const emailMatch = MOCK_CREDENTIALS.find((c) => c.email === email)
        if (!emailMatch) throw new Error('Email ID not found')
        if (emailMatch.password !== password) throw new Error('Wrong password')
        
        set({
          user: { ...emailMatch, role: emailMatch.role as any },
          isAuthenticated: true,
        })
        return true
      },
      logout: () => set({ user: null, isAuthenticated: false }),
      toggleTheme: () => set((s) => ({ isDark: !s.isDark })),
    }),
    { name: 'buizrocket-auth' }
  )
)
