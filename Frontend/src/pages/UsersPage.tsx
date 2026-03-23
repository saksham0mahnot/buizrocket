import { useState, useMemo } from 'react'
import { Search, Plus, Pencil, Trash2, CheckCircle, XCircle, ChevronUp, ChevronDown } from 'lucide-react'
import { TopNavbar } from '../components/layout/TopNavbar'
import { Modal, ConfirmDialog } from '../components/ui/Modal'
import { Button } from '../components/ui/Button'
import { Input, Select } from '../components/ui/Input'
import { StatusBadge } from '../components/ui/Badge'
import { mockUsers } from '../services/mockData'
import { formatDate, generateId, getInitials } from '../utils/cn'
import type { SellerUser, UserRole, UserStatus } from '../types'
import toast from 'react-hot-toast'

const ROLE_OPTIONS = [
  { value: 'seller', label: 'Seller' },
  { value: 'admin', label: 'Admin' },
]

const STATUS_FILTER_OPTIONS = [
  { value: 'All', label: 'All Status' },
  { value: 'Approved', label: 'Approved' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Suspended', label: 'Suspended' },
]

const STATUS_OPTIONS = [
  { value: 'Pending', label: 'Pending' },
  { value: 'Approved', label: 'Approved' },
  { value: 'Suspended', label: 'Suspended' },
]

type SortKey = 'fullName' | 'status' | 'role' | 'createdAt'
type SortDir = 'asc' | 'desc'

const emptyUser: Omit<SellerUser, 'id' | 'createdAt'> = {
  fullName: '', userId: '', email: '', phone: '', address: '', gst: '',
  role: 'seller', status: 'Pending', password: '',
}

export function UsersPage() {
  const [users, setUsers] = useState<SellerUser[]>(mockUsers)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'All'>('All')
  const [sortKey, setSortKey] = useState<SortKey>('createdAt')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [showModal, setShowModal] = useState(false)
  const [editUser, setEditUser] = useState<SellerUser | null>(null)
  const [deleteUser, setDeleteUser] = useState<SellerUser | null>(null)
  const [form, setForm] = useState(emptyUser)
  const [showPassword, setShowPassword] = useState(false)

  const counts = useMemo(() => ({
    total: users.length,
    approved: users.filter(u => u.status === 'Approved').length,
    pending: users.filter(u => u.status === 'Pending').length,
    suspended: users.filter(u => u.status === 'Suspended').length,
  }), [users])

  const filtered = useMemo(() => {
    let result = users.filter((u) => {
      const matchSearch =
        u.fullName.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.gst.toLowerCase().includes(search.toLowerCase()) ||
        u.userId.toLowerCase().includes(search.toLowerCase())
      const matchStatus = statusFilter === 'All' || u.status === statusFilter
      return matchSearch && matchStatus
    })
    result.sort((a, b) => {
      const av = a[sortKey] as string
      const bv = b[sortKey] as string
      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ? 1 : -1
      return 0
    })
    return result
  }, [users, search, statusFilter, sortKey, sortDir])

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('asc') }
  }

  const openAdd = () => { setForm(emptyUser); setEditUser(null); setShowModal(true) }
  const openEdit = (u: SellerUser) => {
    setForm({ fullName: u.fullName, userId: u.userId, email: u.email, phone: u.phone, address: u.address, gst: u.gst, role: u.role, status: u.status, password: u.password })
    setEditUser(u); setShowModal(true)
  }

  const handleSave = () => {
    if (!form.fullName || !form.email || !form.phone) { toast.error('Fill required fields'); return }
    const now = new Date().toISOString()
    if (editUser) {
      setUsers(prev => prev.map(u => u.id === editUser.id ? { ...u, ...form } : u))
      toast.success('User updated!')
    } else {
      setUsers(prev => [{ ...form, id: generateId(), userId: `USR-${Date.now().toString().slice(-5)}`, createdAt: now }, ...prev])
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

  const SortIcon = ({ k }: { k: SortKey }) => (
    <span className="inline-flex flex-col ml-1 opacity-40">
      <ChevronUp size={10} className={sortKey === k && sortDir === 'asc' ? 'opacity-100 text-blue-500' : ''} />
      <ChevronDown size={10} className={sortKey === k && sortDir === 'desc' ? 'opacity-100 text-blue-500' : ''} />
    </span>
  )

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopNavbar title="Manage IDs & Passwords" subtitle="Seller accounts and access control" />
      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin animate-fade-in space-y-4">
        {/* Summary cards */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
          {[
            { label: 'Total Users', value: counts.total, color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-400/10' },
            { label: 'Approved', value: counts.approved, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-400/10' },
            { label: 'Pending', value: counts.pending, color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-400/10' },
            { label: 'Suspended', value: counts.suspended, color: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-400/10' },
          ].map((s) => (
            <div key={s.label} className="p-4 rounded-xl border border-gray-200 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/80 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg font-bold flex-shrink-0 ${s.color}`}>{s.value}</div>
              <span className="text-sm text-gray-500 dark:text-zinc-400">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500" />
              <input id="users-search" type="text" placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-3 py-2 text-sm bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700 rounded-lg text-gray-800 dark:text-zinc-200 placeholder-gray-400 dark:placeholder-zinc-600 focus:outline-none focus:border-blue-500 w-52 transition-all" />
            </div>
            <select id="users-status-filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as UserStatus | 'All')}
              className="px-3 py-2 text-sm bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-zinc-700 rounded-lg text-gray-700 dark:text-zinc-300 focus:outline-none focus:border-blue-500 appearance-none">
              {STATUS_FILTER_OPTIONS.map(o => <option key={o.value} value={o.value} className="bg-white dark:bg-zinc-800">{o.label}</option>)}
            </select>
          </div>
          <Button icon={<Plus size={14} />} onClick={openAdd} id="add-user-btn">Add User</Button>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-gray-200 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-zinc-800">
                  {[
                    { key: 'fullName', label: 'User' }, { key: null, label: 'Phone' }, { key: null, label: 'GST No.' },
                    { key: 'role', label: 'Role' }, { key: 'status', label: 'Status' }, { key: 'createdAt', label: 'Joined' }, { key: null, label: 'Actions' },
                  ].map(({ key, label }) => (
                    <th key={label} onClick={() => key && handleSort(key as SortKey)}
                      className={`px-4 py-3.5 text-left text-xs font-medium text-gray-400 dark:text-zinc-500 uppercase tracking-wide ${key ? 'cursor-pointer hover:text-gray-700 dark:hover:text-zinc-300 select-none' : ''}`}>
                      {label}{key && <SortIcon k={key as SortKey} />}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-zinc-800/50">
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400 dark:text-zinc-600 text-sm">No users found</td></tr>
                ) : (
                  filtered.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {getInitials(user.fullName)}
                          </div>
                          <div>
                            <p className="text-gray-800 dark:text-zinc-200 font-medium text-sm">{user.fullName}</p>
                            <p className="text-gray-400 dark:text-zinc-600 text-xs">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500 dark:text-zinc-400 text-sm">{user.phone}</td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-500 dark:text-zinc-500">{user.gst}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs capitalize px-2 py-1 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 border border-gray-200 dark:border-zinc-700">{user.role}</span>
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={user.status} /></td>
                      <td className="px-4 py-3 text-gray-400 dark:text-zinc-500 text-xs">{formatDate(user.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button id={`toggle-status-${user.id}`} onClick={() => toggleStatus(user)}
                            className={`p-1.5 rounded-md transition-all ${user.status === 'Approved' ? 'text-gray-400 dark:text-zinc-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-400/10' : 'text-gray-400 dark:text-zinc-600 hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-400/10'}`}
                            title={user.status === 'Approved' ? 'Suspend' : 'Approve'}>
                            {user.status === 'Approved' ? <XCircle size={14} /> : <CheckCircle size={14} />}
                          </button>
                          <button id={`edit-user-${user.id}`} onClick={() => openEdit(user)}
                            className="p-1.5 rounded-md text-gray-400 dark:text-zinc-600 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-400/10 transition-all"><Pencil size={14} /></button>
                          <button id={`delete-user-${user.id}`} onClick={() => setDeleteUser(user)}
                            className="p-1.5 rounded-md text-gray-400 dark:text-zinc-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-400/10 transition-all"><Trash2 size={14} /></button>
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

      {/* Add/Edit Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editUser ? 'Edit User' : 'Add New User'} size="md">
        <div className="space-y-4">
          <Input label="Full Name" required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="e.g. Rajesh Kumar" />
          <Input label="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="seller@company.com" />
          <Input label="Phone" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" />
          <Input label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Business address" />
          <Input label="GST Number" value={form.gst} onChange={(e) => setForm({ ...form, gst: e.target.value })} placeholder="22AAAAA0000A1Z5" />
          <Select label="Role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })} options={ROLE_OPTIONS} />
          <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as UserStatus })} options={STATUS_OPTIONS} />
          <div className="relative">
            <Input label="Password" type={showPassword ? 'text' : 'password'} value={form.password ?? ''} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Min 6 characters" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 bottom-2.5 text-xs text-gray-400 dark:text-zinc-600 hover:text-gray-700 dark:hover:text-zinc-300">
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          <div className="flex gap-3 justify-end pt-2 border-t border-gray-100 dark:border-zinc-800">
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editUser ? 'Save Changes' : 'Add User'}</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteUser} onClose={() => setDeleteUser(null)} onConfirm={handleDelete}
        title="Delete User?" message={`Delete "${deleteUser?.fullName}"? This cannot be undone.`} confirmLabel="Delete" />
    </div>
  )
}
