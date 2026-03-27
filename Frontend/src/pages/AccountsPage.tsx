import { useState, useMemo } from 'react'
import { Search, Plus, CreditCard, DollarSign, Wallet, ArrowUpRight, ArrowDownRight, User, Users } from 'lucide-react'
import { TopNavbar } from '../components/layout/TopNavbar'
import { Modal } from '../components/ui/Modal'
import { Button } from '../components/ui/Button'
import { Input, Select } from '../components/ui/Input'
import { formatCurrency, formatDate, generateId, getInitials } from '../utils/cn'
import type { ClientBalance } from '../types'
import toast from 'react-hot-toast'

const mockClients: ClientBalance[] = [
  { id: '1', name: 'Acme Corp', email: 'billing@acmecorp.com', phone: '+91 98765 43210', balance: 50000, status: 'Active', lastUpdated: new Date(Date.now() - 86400000).toISOString() },
  { id: '2', name: 'Global Tech', email: 'finance@globaltech.in', phone: '+91 99887 76655', balance: -15000, status: 'Active', lastUpdated: new Date(Date.now() - 172800000).toISOString() },
  { id: '3', name: 'Nexus Solutions', email: 'accounts@nexus.io', phone: '+91 91234 56789', balance: 0, status: 'Inactive', lastUpdated: new Date(Date.now() - 259200000).toISOString() },
  { id: '4', name: 'Alpha Traders', email: 'hello@alphatraders.in', phone: '+91 98989 89898', balance: 125000, status: 'Active', lastUpdated: new Date().toISOString() },
]

type TransactionType = 'Credit' | 'Debit'

export function AccountsPage() {
  const [clients, setClients] = useState<ClientBalance[]>(mockClients)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [selectedClient, setSelectedClient] = useState<ClientBalance | null>(null)
  
  const [transactionType, setTransactionType] = useState<TransactionType>('Credit')
  const [amount, setAmount] = useState<string>('')
  const [notes, setNotes] = useState('')

  const counts = useMemo(() => {
    const totalBalance = clients.reduce((acc, c) => acc + c.balance, 0)
    const activeClients = clients.filter(c => c.status === 'Active').length
    const negativeBalances = clients.filter(c => c.balance < 0).length
    return { totalBalance, activeClients, negativeBalances, totalClients: clients.length }
  }, [clients])

  const filtered = useMemo(() => {
    return clients.filter(c => 
      c.name.toLowerCase().includes(search.toLowerCase()) || 
      c.email.toLowerCase().includes(search.toLowerCase())
    )
  }, [clients, search])

  const openUpdateModal = (client: ClientBalance) => {
    setSelectedClient(client)
    setTransactionType('Credit')
    setAmount('')
    setNotes('')
    setShowModal(true)
  }

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedClient || !amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    const value = Number(amount)
    const newBalance = transactionType === 'Credit' 
      ? selectedClient.balance + value
      : selectedClient.balance - value

    setClients(prev => prev.map(c => 
      c.id === selectedClient.id 
        ? { ...c, balance: newBalance, lastUpdated: new Date().toISOString() } 
        : c
    ))

    toast.success(`Successfully ${transactionType === 'Credit' ? 'credited' : 'debited'} ${formatCurrency(value)} from ${selectedClient.name}`)
    setShowModal(false)
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#f5f6fb] dark:bg-[#0c0e12]">
      <TopNavbar title="Manage Accounts" subtitle="Manage client balances and history" />
      
      <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin">
        <div className="max-w-[1600px] mx-auto space-y-8">
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[
              { label: 'Total Managed Balance', value: formatCurrency(counts.totalBalance), color: 'from-[#6E3DFB] to-[#FF61BC]', icon: Wallet, delay: 0 },
              { label: 'Active Clients', value: counts.activeClients, color: 'from-[#00D1FF] to-[#6E3DFB]', icon: User, delay: 0.1 },
              { label: 'Negative Balances', value: counts.negativeBalances, color: 'from-[#f87171] to-[#dc2626]', icon: DollarSign, delay: 0.2 },
              { label: 'Total Clients', value: counts.totalClients, color: 'from-[#34d399] to-[#059669]', icon: Users, delay: 0.3 },
            ].map((s) => (
              <div 
                key={s.label} 
                className="group relative bg-white/80 dark:bg-[#15171b]/80 backdrop-blur-2xl border border-white/40 dark:border-white/5 rounded-[2rem] p-6 shadow-[0_8px_40px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_40px_rgb(0,0,0,0.2)] hover:shadow-[0_12px_50px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_12px_50px_rgb(0,0,0,0.3)] transition-all duration-300 transform hover:-translate-y-1"
                style={{ animation: `scaleIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) ${0.1 + s.delay}s both` }}
              >
                <div className="flex flex-col">
                  <div className={`w-12 h-12 rounded-[1rem] bg-gradient-to-br ${s.color} flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <s.icon size={20} strokeWidth={2.5} />
                  </div>
                  <h3 className="text-[12px] font-bold text-[#9b9da1] uppercase tracking-widest mb-1">{s.label}</h3>
                  <p className="text-2xl md:text-3xl font-black text-[#2c2f33] dark:text-white tracking-tight">{s.value}</p>
                </div>
                {/* Decorative glow */}
                <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-gradient-to-br from-[#6E3DFB]/10 to-[#FF61BC]/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between" style={{ animation: 'fadeIn 0.5s ease-out 0.1s both' }}>
            <div className="relative w-full sm:w-80 group">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9b9da1] group-focus-within:text-[#6E3DFB] transition-colors" />
              <input 
                id="clients-search" 
                type="text" 
                placeholder="Search clients..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 text-sm font-medium bg-white/70 dark:bg-[#15171b]/80 backdrop-blur-md border border-white/40 dark:border-white/5 rounded-2xl text-[#2c2f33] dark:text-white placeholder-[#9b9da1] dark:placeholder-[#595c60] focus:outline-none focus:border-[#6E3DFB] focus:ring-4 focus:ring-[#6E3DFB]/10 shadow-sm transition-all" 
              />
            </div>
            
            <Button className="w-full sm:w-auto rounded-2xl shadow-[0_4px_14px_0_rgb(110,61,251,0.39)] hover:shadow-[0_6px_20px_rgba(110,61,251,0.23)] hover:bg-[#5b32d6] px-6 py-2.5 font-bold transition-all flex items-center justify-center gap-2">
              <Plus size={18} strokeWidth={2.5} />
              Add Client
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
                    <th className="px-5 py-4 text-[11px] font-bold text-[#9b9da1] uppercase tracking-widest border-b border-[#e6e8ee] dark:border-zinc-800/80">Client Info</th>
                    <th className="px-5 py-4 text-[11px] font-bold text-[#9b9da1] uppercase tracking-widest border-b border-[#e6e8ee] dark:border-zinc-800/80">Contact</th>
                    <th className="px-5 py-4 text-[11px] font-bold text-[#9b9da1] uppercase tracking-widest border-b border-[#e6e8ee] dark:border-zinc-800/80">Current Balance</th>
                    <th className="px-5 py-4 text-[11px] font-bold text-[#9b9da1] uppercase tracking-widest border-b border-[#e6e8ee] dark:border-zinc-800/80">Last Updated</th>
                    <th className="px-5 py-4 text-[11px] font-bold text-[#9b9da1] uppercase tracking-widest border-b border-[#e6e8ee] dark:border-zinc-800/80">Status</th>
                    <th className="px-5 py-4 text-[11px] font-bold text-[#9b9da1] uppercase tracking-widest border-b border-[#e6e8ee] dark:border-zinc-800/80 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eff1f6] dark:divide-zinc-800/50">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-16 text-center text-[#9b9da1] font-medium text-sm">
                        <div className="flex flex-col items-center gap-3">
                          <Users size={32} className="text-[#e6e8ee] dark:text-zinc-800" />
                          No clients found matching your search.
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((client, idx) => (
                      <tr key={client.id} className="hover:bg-[#f5f6fb] dark:hover:bg-zinc-800/40 transition-all duration-300 group" style={{ animation: `fadeIn 0.4s ease-out ${0.25 + (idx * 0.05)}s both` }}>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-[12px] bg-gradient-to-br from-[#6E3DFB]/10 to-[#FF61BC]/10 flex items-center justify-center text-[#6E3DFB] font-extrabold text-[14px] ring-2 ring-white dark:ring-[#15171b] shadow-sm transform group-hover:scale-105 transition-transform">
                              {getInitials(client.name)}
                            </div>
                            <div>
                              <p className="text-[14px] font-extrabold text-[#2c2f33] dark:text-white tracking-tight">{client.name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-[13px] font-semibold text-[#595c60] dark:text-[#dadde4]">{client.email}</p>
                          <p className="text-[11px] font-medium text-[#9b9da1] font-mono mt-0.5">{client.phone}</p>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-col">
                            <span className={`text-[15px] font-black tracking-tight ${client.balance < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-[#2c2f33] dark:text-white'}`}>
                              {formatCurrency(client.balance)}
                            </span>
                            {client.balance < 0 && (
                              <span className="text-[11px] font-bold text-rose-500 mt-0.5">Dues Pending</span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-[13px] font-semibold text-[#595c60] dark:text-[#9b9da1]">
                          {formatDate(client.lastUpdated)}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-widest
                            ${client.status === 'Active' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : ''}
                            ${client.status === 'Inactive' ? 'bg-[#f5f6fb] text-[#595c60] dark:bg-zinc-800 dark:text-[#dadde4]' : ''}
                            ${client.status === 'Suspended' ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400' : ''}
                          `}>
                            {client.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <Button 
                            variant="secondary" 
                            onClick={() => openUpdateModal(client)}
                            className="text-xs py-1.5 px-3 rounded-xl bg-white dark:bg-[#15171b] hover:bg-[#6E3DFB]/10 dark:hover:bg-[#6E3DFB]/10 hover:text-[#6E3DFB] border border-[#e6e8ee] dark:border-white/10"
                          >
                            Update Balance
                          </Button>
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

      {/* Update Balance Modal */}
      <Modal 
        open={showModal} 
        onClose={() => setShowModal(false)} 
        title="Update Account Balance" 
        description={`Manage funds for ${selectedClient?.name}`}
        size="md"
      >
        <form onSubmit={handleUpdate} className="space-y-6 mt-4">
          <div className="p-5 rounded-2xl bg-[#f5f6fb] dark:bg-zinc-800/50 border border-[#e6e8ee] dark:border-zinc-700/50 shadow-inner flex justify-between items-center">
            <div>
              <p className="text-[11px] font-bold text-[#9b9da1] uppercase tracking-widest mb-1">Current Balance</p>
              <p className={`text-2xl font-black tracking-tight ${selectedClient && selectedClient.balance < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-[#2c2f33] dark:text-white'}`}>
                {selectedClient ? formatCurrency(selectedClient.balance) : '0'}
              </p>
            </div>
            <div className="w-12 h-12 rounded-[1rem] bg-white dark:bg-zinc-900 flex items-center justify-center text-[#6E3DFB] shadow-sm">
              <Wallet size={20} />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-[#2c2f33] dark:text-white mb-2">Transaction Type</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTransactionType('Credit')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl font-bold text-sm transition-all border ${transactionType === 'Credit' ? 'bg-[#00D1FF]/10 border-[#00D1FF]/20 text-[#00647b] dark:text-[#37d4ff] shadow-sm' : 'bg-white dark:bg-[#15171b] border-[#e6e8ee] dark:border-white/5 text-[#9b9da1] hover:bg-gray-50 dark:hover:bg-zinc-800'}`}
                >
                  <ArrowUpRight size={16} /> Credit (Add Funds)
                </button>
                <button
                  type="button"
                  onClick={() => setTransactionType('Debit')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl font-bold text-sm transition-all border ${transactionType === 'Debit' ? 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400 shadow-sm' : 'bg-white dark:bg-[#15171b] border-[#e6e8ee] dark:border-white/5 text-[#9b9da1] hover:bg-gray-50 dark:hover:bg-zinc-800'}`}
                >
                  <ArrowDownRight size={16} /> Debit (Deduct)
                </button>
              </div>
            </div>
            <Input 
              label="Amount (₹)" 
              type="number" 
              required 
              min={1} 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)} 
              placeholder="Enter amount to update" 
            />
            <Input 
              label="Reference / Notes (Optional)" 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)} 
              placeholder="e.g. Payment received for invoice #1024" 
            />
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-[#e6e8ee] dark:border-zinc-800">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" className="shadow-[0_4px_14px_0_rgb(110,61,251,0.39)] hover:shadow-[0_6px_20px_rgba(110,61,251,0.23)] border-none">
              Confirm {transactionType}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
