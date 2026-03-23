import { useState } from 'react'
import { MessageSquare, Send, Mail, Phone, Clock, CheckCircle } from 'lucide-react'
import { TopNavbar } from '../components/layout/TopNavbar'
import { Button } from '../components/ui/Button'
import { Input, Textarea, Select } from '../components/ui/Input'
import toast from 'react-hot-toast'

const faqs = [
  { q: 'How do I update my product price?', a: 'Go to Items → find the product → click the edit (pencil) icon → update the price field → Save Changes.' },
  { q: 'How long does order processing take?', a: 'Orders should be confirmed and dispatched within 2 business days of placement.' },
  { q: 'How do I get my GST approved?', a: 'Submit your GSTIN during registration. Our compliance team reviews and approves within 24-48 hours.' },
  { q: 'Can I bulk upload products?', a: 'Bulk upload via CSV is coming soon. Currently, products can be added one at a time via the Items page.' },
  { q: 'How are payouts processed?', a: 'Payouts are processed every 7 days to your registered bank account after order delivery confirmation.' },
]

const categoryOptions = [
  { value: 'orders', label: 'Orders & Shipping' },
  { value: 'products', label: 'Products & Catalog' },
  { value: 'payments', label: 'Payments & Payouts' },
  { value: 'technical', label: 'Technical Issue' },
  { value: 'other', label: 'Other' },
]

export function SupportPage() {
  const [form, setForm] = useState({ subject: '', category: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.subject || !form.category || !form.message) {
      toast.error('Please fill all fields'); return
    }
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1200))
    setLoading(false); setSubmitted(true)
    toast.success('Ticket submitted! We\'ll respond within 24 hours.')
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopNavbar title="Support & Feedback" subtitle="We're here to help you succeed" />
      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin animate-fade-in space-y-6">
        {/* Contact options */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Mail, label: 'Email Support', value: 'support@buizrocket.com', color: 'text-blue-500 bg-blue-50 dark:bg-blue-400/10' },
            { icon: Phone, label: 'Phone Support', value: '+91 1800-123-4567', color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-400/10' },
            { icon: Clock, label: 'Response Time', value: 'Within 24 hours', color: 'text-amber-500 bg-amber-50 dark:bg-amber-400/10' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/80">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                <Icon size={16} />
              </div>
              <div>
                <p className="text-xs text-gray-400 dark:text-zinc-600">{label}</p>
                <p className="text-sm font-medium text-gray-800 dark:text-zinc-200">{value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Ticket form */}
          <div className="rounded-xl border border-gray-200 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/80 p-5">
            <div className="flex items-center gap-2 mb-5">
              <MessageSquare size={16} className="text-blue-500" />
              <h3 className="text-sm font-semibold text-gray-800 dark:text-zinc-200">Submit a Support Ticket</h3>
            </div>

            {submitted ? (
              <div className="flex flex-col items-center py-10 text-center">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-400/10 flex items-center justify-center mb-4">
                  <CheckCircle size={28} className="text-emerald-500 dark:text-emerald-400" />
                </div>
                <h4 className="text-base font-semibold text-gray-800 dark:text-zinc-200 mb-2">Ticket Submitted!</h4>
                <p className="text-sm text-gray-400 dark:text-zinc-500 mb-5 max-w-xs">Our support team will get back to you within 24 hours on your registered email.</p>
                <Button variant="secondary" onClick={() => { setSubmitted(false); setForm({ subject: '', category: '', message: '' }) }}>
                  Submit Another
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="Subject" required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Brief description of your issue" />
                <Select label="Category" required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} options={categoryOptions} placeholder="Select category" />
                <Textarea label="Message" required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Describe your issue in detail..." />
                <Button type="submit" loading={loading} icon={<Send size={14} />} className="w-full justify-center">
                  Send Ticket
                </Button>
              </form>
            )}
          </div>

          {/* FAQs */}
          <div className="rounded-xl border border-gray-200 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/80 p-5">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-zinc-200 mb-4">Frequently Asked Questions</h3>
            <div className="space-y-2">
              {faqs.map((faq, i) => (
                <div key={i} className="border border-gray-100 dark:border-zinc-800/60 rounded-xl overflow-hidden">
                  <button
                    id={`faq-${i}`}
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-4 py-3 text-sm text-gray-700 dark:text-zinc-300 hover:text-gray-900 dark:hover:text-zinc-100 hover:bg-gray-50 dark:hover:bg-zinc-800/30 transition-all text-left"
                  >
                    <span className="font-medium">{faq.q}</span>
                    <span className={`text-gray-400 dark:text-zinc-600 transition-transform duration-200 flex-shrink-0 ml-3 ${openFaq === i ? 'rotate-180' : ''}`}>▾</span>
                  </button>
                  {openFaq === i && (
                    <div className="px-4 pb-4 pt-1 border-t border-gray-50 dark:border-zinc-800/40">
                      <p className="text-xs text-gray-400 dark:text-zinc-500 leading-relaxed">{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
