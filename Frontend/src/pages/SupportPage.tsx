import { Mail, MessageSquare, Phone, FileText, ExternalLink, Send } from 'lucide-react'
import { TopNavbar } from '../components/layout/TopNavbar'
import { Button } from '../components/ui/Button'
import { Input, Textarea } from '../components/ui/Input'
import toast from 'react-hot-toast'

export function SupportPage() {
  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success('Your ticket has been submitted. We will get back to you soon.')
      ; (e.target as HTMLFormElement).reset()
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#f5f6fb] dark:bg-[#0c0e12]">
      <TopNavbar title="Help & Support" subtitle="We're here to help you succeed" />

      <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin">
        <div className="max-w-[1200px] mx-auto space-y-8">

          {/* Support Channels */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6" style={{ animation: 'fadeIn 0.5s ease-out 0.1s both' }}>
            {[
              {
                icon: Mail,
                title: 'Email Support',
                desc: 'Get support via email within 24 hours.',
                action: 'support@buizrocket.com',
                color: 'from-[#6E3DFB] to-[#FF61BC]'
              },
              {
                icon: MessageSquare,
                title: 'Chat',
                desc: 'Chat with our support team in real-time.',
                action: 'Start Chat',
                color: 'from-[#00D1FF] to-[#6E3DFB]'
              },
              {
                icon: Phone,
                title: 'Phone Support',
                desc: 'Call us directly for urgent matters.',
                action: '+91 1800-123-4567',
                color: 'from-[#FFB800] to-[#FF61BC]'
              }
            ].map((method, i) => (
              <div
                key={method.title}
                className="group relative bg-white/80 dark:bg-[#15171b]/80 backdrop-blur-2xl border border-white/40 dark:border-white/5 rounded-[2rem] p-6 shadow-[0_8px_40px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_40px_rgb(0,0,0,0.2)] hover:shadow-[0_12px_50px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_12px_50px_rgb(0,0,0,0.3)] transition-all duration-300 transform hover:-translate-y-1"
                style={{ animation: `scaleIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) ${0.15 + (i * 0.1)}s both` }}
              >
                <div className={`w-14 h-14 rounded-[1.25rem] bg-gradient-to-br ${method.color} flex items-center justify-center text-white mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <method.icon size={24} strokeWidth={2.5} />
                </div>
                <h3 className="text-lg font-extrabold text-[#2c2f33] dark:text-white mb-2">{method.title}</h3>
                <p className="text-sm font-medium text-[#595c60] dark:text-[#9b9da1] mb-6">{method.desc}</p>
                <div className="pt-4 border-t border-[#e6e8ee] dark:border-zinc-800/80">
                  <span className="text-sm font-bold text-[#6E3DFB] dark:text-[#a78bfa] hover:text-[#5b32d6] transition-colors cursor-pointer">{method.action}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" style={{ animation: 'fadeIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.4s both' }}>

            {/* Submit Ticket Form */}
            <div className="lg:col-span-2 bg-white/80 dark:bg-[#15171b]/80 backdrop-blur-2xl border border-white/40 dark:border-white/5 rounded-[2rem] shadow-[0_8px_40px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_40px_rgb(0,0,0,0.2)] p-6 md:p-8 hover:shadow-[0_12px_50px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_12px_50px_rgb(0,0,0,0.3)] transition-all duration-300">
              <div className="mb-6">
                <h2 className="text-xl font-black text-[#2c2f33] dark:text-white tracking-tight mb-2">Submit a Ticket</h2>
                <p className="text-sm font-medium text-[#9b9da1]">Describe your issue and our team will resolve it as quickly as possible.</p>
              </div>
              <form onSubmit={handleTicketSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Input label="Your Name" placeholder="John Doe" required />
                  <Input label="Email Address" type="email" placeholder="john@example.com" required />
                </div>
                <Input label="Subject" placeholder="Briefly describe your issue" required />
                <Textarea label="Message" placeholder="Provide as much detail as possible..." rows={5} required />
                <div className="pt-2">
                  <Button type="submit" className="w-full md:w-auto px-8 py-3 rounded-2xl shadow-[0_4px_14px_0_rgb(110,61,251,0.39)] hover:shadow-[0_6px_20px_rgba(110,61,251,0.23)] hover:bg-[#5b32d6] font-bold text-[15px] flex items-center justify-center gap-2 transition-all">
                    <Send size={18} strokeWidth={2.5} />
                    Submit Request
                  </Button>
                </div>
              </form>
            </div>

            {/* FAQs / Quick Links */}
            <div className="bg-white/80 dark:bg-[#15171b]/80 backdrop-blur-2xl border border-white/40 dark:border-white/5 rounded-[2rem] shadow-[0_8px_40px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_40px_rgb(0,0,0,0.2)] p-6 md:p-8 flex flex-col hover:shadow-[0_12px_50px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_12px_50px_rgb(0,0,0,0.3)] transition-all duration-300">
              <div className="mb-6">
                <h2 className="text-xl font-black text-[#2c2f33] dark:text-white tracking-tight mb-2">Quick Resources</h2>
                <p className="text-sm font-medium text-[#9b9da1]">Common answers at your fingertips.</p>
              </div>

              <div className="space-y-4 flex-1">
                {[
                  'How to configure payment gateway?',
                  'Understanding your payout cycle',
                  'How to manage bulk inventory?',
                  'Step-by-step shipping guide',
                  'Customizing your storefront'
                ].map((faq, i) => (
                  <a
                    href="#faq"
                    key={i}
                    className="flex justify-between items-center p-4 rounded-xl border border-[#e6e8ee] dark:border-zinc-800 bg-[#f5f6fb] dark:bg-zinc-900/50 hover:border-[#6E3DFB]/30 hover:bg-[#6E3DFB]/5 transition-all group"
                  >
                    <span className="text-sm font-bold text-[#595c60] dark:text-[#dadde4] group-hover:text-[#6E3DFB] transition-colors">{faq}</span>
                    <ExternalLink size={14} className="text-[#9b9da1] group-hover:text-[#6E3DFB] transition-colors" />
                  </a>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-[#e6e8ee] dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[12px] bg-[#00D1FF]/10 flex items-center justify-center">
                    <FileText size={18} className="text-[#00D1FF]" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#2c2f33] dark:text-white">Visit Help Center</h4>
                    <p className="text-[12px] font-medium text-[#9b9da1]">Browse all articles</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
