import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Zap, Lock, Mail, ArrowRight } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

export function LoginPage() {
  // const [email, setEmail] = useState(import.meta.env.VITE_DEFAULT_EMAIL || '')
  // const [password, setPassword] = useState(import.meta.env.VITE_DEFAULT_PASSWORD || '')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email) return setError('Please enter your email id')
    if (!password) return setError('Please enter your password')

    setLoading(true)
    try {
      await login(email, password)
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f6fb] dark:bg-[#0c0e12] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Premium background mesh glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden h-full w-full">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#6E3DFB]/20 dark:bg-[#6E3DFB]/10 blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#00D1FF]/20 dark:bg-[#00D1FF]/10 blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
        <div className="absolute top-[20%] right-[10%] w-[30vw] h-[30vw] rounded-full bg-[#FF61BC]/20 dark:bg-[#FF61BC]/10 blur-[100px] mix-blend-multiply dark:mix-blend-screen animate-pulse" style={{ animationDuration: '9s', animationDelay: '1s' }} />
      </div>

      <div className="w-full max-w-md relative z-10" style={{ animation: 'fadeIn 0.8s cubic-bezier(0.22, 1, 0.36, 1) both' }}>
        {/* Logo and Greeting */}
        <div className="flex flex-col items-center mb-10" style={{ animation: 'slideIn 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.1s both' }}>
          <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-[#6E3DFB] to-[#FF61BC] flex items-center justify-center shadow-[0_8px_32px_rgba(110,61,251,0.4)] dark:shadow-[0_8px_32px_rgba(110,61,251,0.2)] mb-6 ring-4 ring-white/50 dark:ring-white/10">
            <Zap size={28} className="text-white drop-shadow-md" strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-extrabold text-[#2c2f33] dark:text-white tracking-tight text-center">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6E3DFB] to-[#00D1FF]">Buizrocket</span>
          </h1>
          <p className="text-sm font-medium text-[#595c60] dark:text-[#9b9da1] mt-2 text-center max-w-[280px]">
            Sign in to access your premium seller dashboard
          </p>
        </div>

        {/* Glassmorphic Login Card */}
        <div
          className="rounded-[2.5rem] border border-white/40 dark:border-white/5 bg-white/70 dark:bg-[#15171b]/80 backdrop-blur-2xl p-8 sm:p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] relative overflow-hidden"
          style={{ animation: 'slideIn 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.2s both' }}
        >
          {/* Subtle inner top highlight */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/50 dark:via-white/10 to-transparent" />

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div className="space-y-1.5" style={{ animation: 'fadeIn 0.8s ease-out 0.3s both' }}>
              <label htmlFor="login-email" className="block text-[13px] font-bold text-[#595c60] dark:text-[#9b9da1] ml-1">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail size={18} className="text-[#9b9da1] group-focus-within:text-[#6E3DFB] transition-colors" />
                </div>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@buizrocket.com"
                  autoComplete="email"
                  className="w-full pl-11 pr-4 py-3.5 text-sm bg-white/50 dark:bg-[#0c0e12]/50 border border-[#e6e8ee] dark:border-zinc-800 rounded-2xl text-[#2c2f33] dark:text-white placeholder-[#9b9da1] dark:placeholder-[#595c60] focus:outline-none focus:border-[#6E3DFB] focus:ring-4 focus:ring-[#6E3DFB]/10 transition-all font-medium shadow-inner"
                />
              </div>
            </div>

            <div className="space-y-1.5" style={{ animation: 'fadeIn 0.8s ease-out 0.4s both' }}>
              <div className="flex justify-between items-center ml-1">
                <label htmlFor="login-password" className="block text-[13px] font-bold text-[#595c60] dark:text-[#9b9da1]">
                  Password
                </label>
                <a href="#" className="text-[12px] font-bold text-[#6E3DFB] hover:text-[#FF61BC] transition-colors">Forgot?</a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={18} className="text-[#9b9da1] group-focus-within:text-[#6E3DFB] transition-colors" />
                </div>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full pl-11 pr-12 py-3.5 text-sm bg-white/50 dark:bg-[#0c0e12]/50 border border-[#e6e8ee] dark:border-zinc-800 rounded-2xl text-[#2c2f33] dark:text-white placeholder-[#9b9da1] dark:placeholder-[#595c60] focus:outline-none focus:border-[#6E3DFB] focus:ring-4 focus:ring-[#6E3DFB]/10 transition-all font-medium shadow-inner"
                />
                <button
                  type="button"
                  id="toggle-password-visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#9b9da1] hover:text-[#595c60] dark:hover:text-[#dadde4] transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              style={{ animation: 'scaleIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.5s both' }}
              className="group relative w-full py-4 text-sm font-bold text-white bg-[#6E3DFB] hover:bg-[#5511e3] rounded-2xl transition-all duration-300 shadow-[0_10px_25px_rgba(110,61,251,0.3)] disabled:opacity-70 disabled:cursor-not-allowed hover:shadow-[0_15px_35px_rgba(110,61,251,0.4)] hover:-translate-y-0.5 mt-4 overflow-hidden"
            >
              {/* Shine effect */}
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-all duration-[1.5s]" />

              <span className="relative flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Authenticating...
                  </>
                ) : (
                  <>
                    Sign in to Workspace
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </button>
          </form>

          {/* Error Message */}
          {error && (
            <div
              className="mt-6 p-4 rounded-xl border relative overflow-hidden group border-red-500/20 bg-red-500/10 dark:bg-red-500/5 text-center"
              style={{ animation: 'fadeIn 0.4s ease-out both' }}
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-500/30 to-transparent" />
              <p className="text-[13px] font-semibold text-red-600 dark:text-red-400 relative z-10 flex items-center justify-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                {error}
              </p>
            </div>
          )}

        </div>

        <p className="text-center text-[12px] font-semibold text-[#9b9da1] mt-8" style={{ animation: 'fadeIn 0.8s ease-out 0.7s both' }}>
          © {new Date().getFullYear()} Buizrocket Atelier. All rights reserved.
        </p>
      </div>
    </div>
  )
}
