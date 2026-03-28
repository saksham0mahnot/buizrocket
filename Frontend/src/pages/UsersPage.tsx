import { useState, useMemo } from 'react'
import { Search, Plus, Pencil, Trash2, CheckCircle, XCircle, ChevronUp, ChevronDown, Users, Shield, ShieldCheck } from 'lucide-react'
import { TopNavbar } from '../components/layout/TopNavbar'
import { Modal, ConfirmDialog } from '../components/ui/Modal'
import { Button } from '../components/ui/Button'
import { Input, Select } from '../components/ui/Input'
import { mockUsers } from '../services/mockData'
import { formatDate, generateId, getInitials } from '../utils/cn'
import type { SellerUser, UserRole, UserStatus, AdminPermission } from '../types'
import toast from 'react-hot-toast'

const ROLE_OPTIONS = [
  { value: 'wholeseller', label: 'Wholeseller' },
  { value: 'retailer',    label: 'Retailer' },
  { value: 'guest',       label: 'Guest' },
  { value: 'sub-admin',   label: 'Sub-Admin' },
  { value: 'admin',       label: 'Admin' },
]

const ROLE_FILTER_OPTIONS = [
  { value: 'All',        label: 'All Roles' },
  { value: 'wholeseller',label: 'Wholeseller' },
  { value: 'retailer',   label: 'Retailer' },
  { value: 'guest',      label: 'Guest' },
  { value: 'sub-admin',  label: 'Sub-Admin' },
  { value: 'admin',      label: 'Admin' },
]

const STATUS_FILTER_OPTIONS = [
  { value: 'All',       label: 'All Status' },
  { value: 'Approved',  label: 'Approved' },
  { value: 'Pending',   label: 'Pending' },
  { value: 'Suspended', label: 'Suspended' },
]

const STATUS_OPTIONS = [
  { value: 'Pending',   label: 'Pending' },
  { value: 'Approved',  label: 'Approved' },
  { value: 'Suspended', label: 'Suspended' },
]

const ALL_PERMISSIONS: { key: AdminPermission; label: string; desc: string }[] = [
  { key: 'manage_users',    label: 'Manage Users',    desc: 'Add, edit, delete users' },
  { key: 'manage_catalog',  label: 'Manage Catalog',  desc: 'Add & edit products' },
  { key: 'manage_orders',   label: 'Manage Orders',   desc: 'View & update orders' },
  { key: 'manage_accounts', label: 'Manage Accounts', desc: 'Client balance control' },
  { key: 'manage_settings', label: 'Manage Settings', desc: 'System configuration' },
  { key: 'view_reports',    label: 'View Reports',    desc: 'Dashboard analytics' },
]

const ROLE_COLORS: Record<UserRole, string> = {
  admin:       'bg-[#FF61BC]/10 text-[#FF61BC] ring-[#FF61BC]/20',
  'sub-admin': 'bg-violet-100 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400 ring-violet-500/20',
  wholeseller: 'bg-sky-100 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400 ring-sky-500/20',
  retailer:    'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 ring-emerald-500/20',
  guest:       'bg-gray-100 text-gray-500 dark:bg-zinc-800 dark:text-zinc-400 ring-gray-300/30 dark:ring-white/5',
}

type SortKey = 'fullName' | 'status' | 'role' | 'createdAt'
type SortDir = 'asc' | 'desc'

const emptyUser: Omit<SellerUser, 'id' | 'createdAt'> = {
  fullName: '', userId: '', email: '', phone: '', address: '', gst: '',
  role: 'retailer', status: 'Pending', password: '', permissions: [],
}

/** roles that use GST + address (business accounts) */
const BUSINESS_ROLES: UserRole[] = ['wholeseller', 'retailer']

export function UsersPage() {
  const [users, setUsers] = useState<SellerUser[]>(mockUsers)
  const [search, setSearch]             = useState('')
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'All'>('All')
  const [roleFilter, setRoleFilter]     = useState<UserRole | 'All'>('All')
  const [sortKey, setSortKey]           = useState<SortKey>('createdAt')
  const [sortDir, setSortDir]           = useState<SortDir>('desc')
  const [showModal, setShowModal]       = useState(false)
  const [editUser, setEditUser]         = useState<SellerUser | null>(null)
  const [deleteUser, setDeleteUser]     = useState<SellerUser | null>(null)
  const [form, setForm]                 = useState(emptyUser)
  const [showPassword, setShowPassword] = useState(false)

  const isSubAdmin   = form.role === 'sub-admin'
  const isBusiness   = BUSINESS_ROLES.includes(form.role)

  const counts = useMemo(() => ({
    total:     users.length,
    approved:  users.filter(u => u.status === 'Approved').length,
    pending:   users.filter(u => u.status === 'Pending').length,
    suspended: users.filter(u => u.status === 'Suspended').length,
  }), [users])

  const filtered = useMemo(() => {
    let result = users.filter((u) => {
      const matchSearch =
        u.fullName.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        (u.gst ?? '').toLowerCase().includes(search.toLowerCase()) ||
        u.userId.toLowerCase().includes(search.toLowerCase())
      const matchStatus = statusFilter === 'All' || u.status === statusFilter
      const matchRole   = roleFilter   === 'All' || u.role   === roleFilter
      return matchSearch && matchStatus && matchRole
    })
    result.sort((a, b) => {
      const av = a[sortKey] as string
      const bv = b[sortKey] as string
      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ? 1 : -1
      return 0
    })
    return result
  }, [users, search, statusFilter, roleFilter, sortKey, sortDir])

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('asc') }
  }

  const openAdd = () => { setForm(emptyUser); setEditUser(null); setShowModal(true) }
  const openEdit = (u: SellerUser) => {
    setForm({
      fullName: u.fullName, userId: u.userId, email: u.email, phone: u.phone,
      address: u.address ?? '', gst: u.gst ?? '', role: u.role, status: u.status,
      password: u.password ?? '', permissions: u.permissions ?? [],
    })
    setEditUser(u); setShowModal(true)
  }

  const handleSave = () => {
    if (!form.fullName || !form.email || !form.phone) { toast.error('Fill required fields'); return }
    const now = new Date().toISOString()
    const payload: Omit<SellerUser, 'id' | 'userId' | 'createdAt'> & { gst?: string; address?: string } = {
      ...form,
      gst:     isBusiness ? form.gst     : undefined,
      address: isBusiness ? form.address : undefined,
      permissions: isSubAdmin ? (form.permissions ?? []) : undefined,
    }
    if (editUser) {
      setUsers(prev => prev.map(u => u.id === editUser.id ? { ...u, ...payload } : u))
      toast.success('User updated!')
    } else {
      setUsers(prev => [{
        ...payload,
        id: generateId(),
        userId: `USR-${Date.now().toString().slice(-5)}`,
        createdAt: now,
      } as SellerUser, ...prev])
      toast.success('User added!')
    }
    setShowModal(false)
  }

  const toggleStatus = (user: SellerUser) => {
    const newStatus: UserStatus = user.status === 'Approved' ? 'Suspended' : 'Approved'
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: newStatus } : u))
    toast.success(`${user.fullName} ${newStatus}`)
  }

  const handleDelete = () => {
    if (!deleteUser) return
    setUsers(prev => prev.filter(u => u.id !== deleteUser.id))
    setDeleteUser(null)
    toast.success('User deleted')
  }

  const togglePermission = (perm: AdminPermission) => {
    const current = form.permissions ?? []
    setForm({
      ...form,
      permissions: current.includes(perm) ? current.filter(p => p !== perm) : [...current, perm],
    })
  }

  const SortIcon = ({ k }: { k: SortKey }) => (
    <span className="inline-flex flex-col ml-1 opacity-40">
      <ChevronUp size={10} className={sortKey === k && sortDir === 'asc' ? 'opacity-100 text-[#6E3DFB]' : ''} />
      <ChevronDown size={10} className={sortKey === k && sortDir === 'desc' ? 'opacity-100 text-[#6E3DFB]' : ''} />
    </span>
  )

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#f5f6fb] dark:bg-[#0c0e12]">
      <TopNavbar title="Manage Users" subtitle="User accounts and role-based access control" />
      <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin">
        <div className="max-w-[1600px] mx-auto space-y-8">
          
          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[
              { label: 'Total Users', value: counts.total,     color: 'from-[#00D1FF] to-[#6E3DFB]', delay: 0 },
              { label: 'Approved',    value: counts.approved,  color: 'from-[#34d399] to-[#059669]',  delay: 0.1 },
              { label: 'Pending',     value: counts.pending,   color: 'from-[#fbbf24] to-[#f59e0b]',  delay: 0.2 },
              { label: 'Suspended',   value: counts.suspended, color: 'from-[#f87171] to-[#dc2626]',  delay: 0.3 },
            ].map((s) => (
              <div
                key={s.label}
                className="group relative bg-white/80 dark:bg-[#15171b]/80 backdrop-blur-2xl border border-white/40 dark:border-white/5 rounded-[2rem] p-6 shadow-[0_8px_40px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_40px_rgb(0,0,0,0.2)] hover:shadow-[0_12px_50px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_12px_50px_rgb(0,0,0,0.3)] transition-all duration-300"
                style={{ animation: `scaleIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) ${0.1 + s.delay}s both` }}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-[1.25rem] bg-gradient-to-br ${s.color} flex items-center justify-center text-white text-xl font-black shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    {s.value}
                  </div>
                  <div>
                    <h3 className="text-[13px] font-bold text-[#9b9da1] uppercase tracking-widest">{s.label}</h3>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Filters & Actions */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between" style={{ animation: 'fadeIn 0.5s ease-out 0.1s both' }}>
            <div className="flex flex-wrap gap-3 w-full sm:w-auto">
              {/* Search */}
              <div className="relative flex-1 sm:w-64 group">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9b9da1] group-focus-within:text-[#6E3DFB] transition-colors" />
                <input
                  id="users-search"
                  type="text"
                  placeholder="Search users..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 text-sm font-medium bg-white/70 dark:bg-[#15171b]/80 backdrop-blur-md border border-white/40 dark:border-white/5 rounded-2xl text-[#2c2f33] dark:text-white placeholder-[#9b9da1] dark:placeholder-[#595c60] focus:outline-none focus:border-[#6E3DFB] focus:ring-4 focus:ring-[#6E3DFB]/10 shadow-sm transition-all"
                />
              </div>
              {/* Status filter */}
              <div className="relative group">
                <select
                  id="users-status-filter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as UserStatus | 'All')}
                  className="pl-4 pr-10 py-2.5 text-sm font-bold bg-white/70 dark:bg-[#15171b]/80 backdrop-blur-md border border-white/40 dark:border-white/5 rounded-2xl text-[#595c60] dark:text-[#dadde4] focus:outline-none focus:border-[#6E3DFB] focus:ring-4 focus:ring-[#6E3DFB]/10 shadow-sm appearance-none transition-all cursor-pointer hover:text-[#2c2f33] dark:hover:text-white"
                >
                  {STATUS_FILTER_OPTIONS.map(o => <option key={o.value} value={o.value} className="bg-white dark:bg-[#15171b]">{o.label}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#9b9da1]" />
              </div>
              {/* Role filter */}
              <div className="relative group">
                <select
                  id="users-role-filter"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as UserRole | 'All')}
                  className="pl-4 pr-10 py-2.5 text-sm font-bold bg-white/70 dark:bg-[#15171b]/80 backdrop-blur-md border border-white/40 dark:border-white/5 rounded-2xl text-[#595c60] dark:text-[#dadde4] focus:outline-none focus:border-[#6E3DFB] focus:ring-4 focus:ring-[#6E3DFB]/10 shadow-sm appearance-none transition-all cursor-pointer hover:text-[#2c2f33] dark:hover:text-white"
                >
                  {ROLE_FILTER_OPTIONS.map(o => <option key={o.value} value={o.value} className="bg-white dark:bg-[#15171b]">{o.label}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#9b9da1]" />
              </div>
            </div>

            <Button onClick={openAdd} id="add-user-btn" className="w-full sm:w-auto rounded-2xl shadow-[0_4px_14px_0_rgb(110,61,251,0.39)] hover:shadow-[0_6px_20px_rgba(110,61,251,0.23)] hover:bg-[#5b32d6] px-6 py-2.5 font-bold transition-all flex items-center justify-center gap-2">
              <Plus size={18} strokeWidth={2.5} />
              Add User
            </Button>
          </div>

          {/* Table Container */}
          <div
            className="bg-white/80 dark:bg-[#15171b]/80 backdrop-blur-2xl border border-white/40 dark:border-white/5 rounded-[2rem] shadow-[0_8px_40px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_40px_rgb(0,0,0,0.2)] overflow-hidden"
            style={{ animation: 'fadeIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.2s both' }}
          >
            <div className="overflow-x-auto p-2 md:p-4">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr>
                    {[
                      { key: 'fullName', label: 'User Details' },
                      { key: null,       label: 'Contact Info' },
                      { key: null,       label: 'Business / Access' },
                      { key: 'role',     label: 'Role' },
                      { key: 'status',   label: 'Status' },
                      { key: 'createdAt',label: 'Date Joined' },
                      { key: null,       label: 'Actions' },
                    ].map(({ key, label }) => (
                      <th
                        key={label}
                        onClick={() => key && handleSort(key as SortKey)}
                        className={`px-5 py-4 text-[11px] font-bold text-[#9b9da1] uppercase tracking-widest border-b border-[#e6e8ee] dark:border-zinc-800/80 ${key ? 'cursor-pointer hover:text-[#6E3DFB] transition-colors select-none' : ''}`}
                      >
                        <div className="flex items-center gap-1">
                          {label}
                          {key && <SortIcon k={key as SortKey} />}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eff1f6] dark:divide-zinc-800/50">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-16 text-center text-[#9b9da1] font-medium text-sm">
                        <div className="flex flex-col items-center gap-3">
                          <Users size={32} className="text-[#e6e8ee] dark:text-zinc-800" />
                          No users found matching your criteria.
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((user, idx) => (
                      <tr key={user.id} className="hover:bg-[#f5f6fb] dark:hover:bg-zinc-800/40 transition-all duration-300 group" style={{ animation: `fadeIn 0.4s ease-out ${0.25 + (idx * 0.05)}s both` }}>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-[12px] bg-gradient-to-br from-[#6E3DFB]/10 to-[#FF61BC]/10 flex items-center justify-center text-[#6E3DFB] font-extrabold text-[14px] ring-2 ring-white dark:ring-[#15171b] shadow-sm transform group-hover:scale-105 transition-transform">
                              {getInitials(user.fullName)}
                            </div>
                            <div>
                              <p className="text-[14px] font-extrabold text-[#2c2f33] dark:text-white tracking-tight">{user.fullName}</p>
                              <p className="text-[12px] font-semibold text-[#9b9da1] mt-0.5">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-[13px] font-semibold text-[#595c60] dark:text-[#dadde4]">{user.phone}</td>
                        <td className="px-5 py-4">
                          {user.role === 'sub-admin' ? (
                            <div className="flex flex-wrap gap-1 max-w-[220px]">
                              {(user.permissions ?? []).length === 0 ? (
                                <span className="text-[11px] text-[#9b9da1] italic">No permissions set</span>
                              ) : (user.permissions ?? []).map(p => (
                                <span key={p} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-violet-100 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400">
                                  <ShieldCheck size={9} />
                                  {ALL_PERMISSIONS.find(a => a.key === p)?.label ?? p}
                                </span>
                              ))}
                            </div>
                          ) : BUSINESS_ROLES.includes(user.role) ? (
                            <>
                              <p className="text-[13px] font-bold font-mono text-[#595c60] dark:text-[#9b9da1]">{user.gst || '—'}</p>
                              <p className="text-[11px] font-medium text-[#9b9da1] truncate max-w-[180px] mt-0.5" title={user.address}>{user.address || '—'}</p>
                            </>
                          ) : (
                            <span className="text-[12px] text-[#9b9da1] italic">—</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-widest ring-1 ring-inset ${ROLE_COLORS[user.role]}`}>
                            {(user.role === 'admin' || user.role === 'sub-admin') && <Shield size={10} />}
                            {user.role}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest
                            ${user.status === 'Approved'  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 ring-1 ring-inset ring-emerald-600/20' : ''}
                            ${user.status === 'Pending'   ? 'bg-[#f5f6fb] text-[#595c60] dark:bg-zinc-800 dark:text-[#dadde4] ring-1 ring-inset ring-[#9b9da1]/20' : ''}
                            ${user.status === 'Suspended' ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 ring-1 ring-inset ring-rose-600/20' : ''}
                          `}>
                            {user.status === 'Pending' && <span className="w-1.5 h-1.5 rounded-full bg-[#595c60] dark:bg-[#dadde4] mr-2 animate-pulse" />}
                            {user.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-[13px] font-semibold text-[#9b9da1]">{formatDate(user.createdAt)}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              id={`toggle-status-${user.id}`}
                              onClick={() => toggleStatus(user)}
                              className={`p-2 rounded-xl transition-all shadow-sm ring-1 ring-inset ${user.status === 'Approved' ? 'text-[#9b9da1] ring-[#e6e8ee] dark:ring-white/5 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10' : 'text-emerald-500 ring-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20'}`}
                              title={user.status === 'Approved' ? 'Suspend' : 'Approve'}
                            >
                              {user.status === 'Approved' ? <XCircle size={16} strokeWidth={2.5} /> : <CheckCircle size={16} strokeWidth={2.5} />}
                            </button>
                            <button
                              id={`edit-user-${user.id}`}
                              onClick={() => openEdit(user)}
                              className="p-2 rounded-xl text-[#9b9da1] hover:text-[#6E3DFB] hover:bg-[#6E3DFB]/10 transition-all shadow-sm ring-1 ring-inset ring-[#e6e8ee] dark:ring-white/5 bg-white dark:bg-zinc-800"
                              title="Edit"
                            >
                              <Pencil size={16} strokeWidth={2.5} />
                            </button>
                            <button
                              id={`delete-user-${user.id}`}
                              onClick={() => setDeleteUser(user)}
                              className="p-2 rounded-xl text-[#9b9da1] hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all shadow-sm ring-1 ring-inset ring-[#e6e8ee] dark:ring-white/5 bg-white dark:bg-zinc-800"
                              title="Delete"
                            >
                              <Trash2 size={16} strokeWidth={2.5} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editUser ? 'Edit User' : 'Add New User'} size="md">
        <div className="space-y-5 mt-2">
          <Input label="Full Name" required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="e.g. Rajesh Kumar" />
          <Input label="Email Address" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="user@company.com" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Phone Number" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" />
            <div className="grid grid-cols-2 gap-4 col-span-2 sm:col-span-1">
              <Select
                label="User Role"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value as UserRole, permissions: [] })}
                options={ROLE_OPTIONS}
              />
              <Select label="Account Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as UserStatus })} options={STATUS_OPTIONS} />
            </div>
          </div>

          {/* Business fields: only for wholeseller / retailer */}
          {isBusiness && (
            <div className="grid grid-cols-2 gap-4">
              <Input label="GST Number" value={form.gst ?? ''} onChange={(e) => setForm({ ...form, gst: e.target.value })} placeholder="22AAAAA0000A1Z5" />
              <Input label="Business Address" value={form.address ?? ''} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="123 Business Park..." />
            </div>
          )}

          {/* Sub-admin permission controls */}
          {isSubAdmin && (
            <div className="rounded-2xl border border-violet-200 dark:border-violet-500/20 bg-violet-50/60 dark:bg-violet-500/5 p-4 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <Shield size={15} className="text-violet-500" />
                <span className="text-[13px] font-bold text-violet-700 dark:text-violet-400 uppercase tracking-wider">Role-Based Access Control</span>
              </div>
              <p className="text-[11px] text-[#9b9da1] -mt-1">Choose which modules this Sub-Admin can access.</p>
              <div className="grid grid-cols-2 gap-2">
                {ALL_PERMISSIONS.map(({ key, label, desc }) => {
                  const active = (form.permissions ?? []).includes(key)
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => togglePermission(key)}
                      className={`flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all ${
                        active
                          ? 'border-violet-400 bg-violet-100 dark:bg-violet-500/10 dark:border-violet-500/40'
                          : 'border-[#e6e8ee] dark:border-zinc-700 bg-white dark:bg-zinc-800/60 hover:border-violet-300 dark:hover:border-violet-500/30'
                      }`}
                    >
                      <div className={`mt-0.5 w-4 h-4 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${active ? 'bg-violet-500 border-violet-500' : 'border-[#9b9da1] dark:border-zinc-600'}`}>
                        {active && (
                          <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                            <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className={`text-[12px] font-bold leading-tight ${active ? 'text-violet-700 dark:text-violet-300' : 'text-[#2c2f33] dark:text-white'}`}>{label}</p>
                        <p className="text-[10px] text-[#9b9da1] mt-0.5">{desc}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <div className="relative">
            <Input label="Account Password" type={showPassword ? 'text' : 'password'} value={form.password ?? ''} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Min 6 characters" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 bottom-0 top-[30px] flex items-center text-xs font-bold text-[#9b9da1] hover:text-[#6E3DFB] transition-colors">
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          <div className="flex gap-3 justify-end pt-4 border-t border-[#e6e8ee] dark:border-zinc-800">
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editUser ? 'Save Changes' : 'Create User'}</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteUser}
        onClose={() => setDeleteUser(null)}
        onConfirm={handleDelete}
        title="Delete User Account?"
        message={`Are you sure you want to delete "${deleteUser?.fullName}"? This action cannot be undone.`}
        confirmLabel="Confirm Delete"
      />
    </div>
  )
}
