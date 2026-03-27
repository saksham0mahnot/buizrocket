import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from './store/authStore'
import { ProtectedRoute } from './components/ProtectedRoute'
import { DashboardLayout } from './components/layout/DashboardLayout'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { OrdersPage } from './pages/OrdersPage'
import { CatalogPage } from './pages/CatalogPage'
import { UsersPage } from './pages/UsersPage'
import { GrowthPage } from './pages/GrowthPage'
import { LearnPage } from './pages/LearnPage'
import { SupportPage } from './pages/SupportPage'
import { AccountsPage } from './pages/AccountsPage'

function App() {
  const { isDark } = useAuthStore()

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="catalog" element={<CatalogPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="growth" element={<GrowthPage />} />
          <Route path="learn" element={<LearnPage />} />
          <Route path="support" element={<SupportPage />} />
          <Route path="accounts" element={<AccountsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
