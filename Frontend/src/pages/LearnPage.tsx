import { ExternalLink, Video, FileText, BookOpen, Zap } from 'lucide-react'
import { TopNavbar } from '../components/layout/TopNavbar'

const resources = [
  {
    category: 'Getting Started',
    desc: 'Foundational steps to launch your business',
    icon: Zap,
    color: 'from-[#00D1FF] to-[#6E3DFB]',
    items: [
      { title: 'Setting Up Your Store', description: 'Complete guide to listing your first products', tag: 'Guide', time: '10 min' },
      { title: 'Order Fulfillment Basics', description: 'How to process and ship orders efficiently', tag: 'Guide', time: '8 min' },
      { title: 'Pricing Strategy 101', description: 'Learn to price competitively and profitably', tag: 'Article', time: '6 min' },
    ],
  },
  {
    category: 'Grow Your Sales',
    desc: 'Strategies to scale up your revenue',
    icon: BookOpen,
    color: 'from-[#FFB800] to-[#FF61BC]',
    items: [
      { title: 'SEO for Product Listings', description: 'Optimize your product pages for better visibility', tag: 'Video', time: '15 min' },
      { title: 'Photography Best Practices', description: 'Take compelling product photos that convert', tag: 'Guide', time: '12 min' },
      { title: 'Understanding Analytics', description: 'Make data-driven decisions for your store', tag: 'Article', time: '7 min' },
    ],
  },
  {
    category: 'Policies & Compliance',
    desc: 'Keep your business running smoothly',
    icon: FileText,
    color: 'from-[#6E3DFB] to-[#FF61BC]',
    items: [
      { title: 'GST Filing for Sellers', description: 'A step-by-step guide to GST compliance', tag: 'Guide', time: '20 min' },
      { title: 'Return & Refund Policy', description: 'Understand platform return policies', tag: 'Article', time: '5 min' },
      { title: 'Prohibited Items List', description: 'What you cannot sell on Buizrocket', tag: 'Article', time: '3 min' },
    ],
  },
]

const tagColors: Record<string, string> = {
  Guide: 'bg-[#6E3DFB]/10 text-[#6E3DFB]',
  Video: 'bg-[#FF61BC]/10 text-[#FF61BC]',
  Article: 'bg-[#00D1FF]/10 text-[#00647b] dark:text-[#37d4ff]',
}

export function LearnPage() {
  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#f5f6fb] dark:bg-[#0c0e12]">
      <TopNavbar title="Seller University" subtitle="Resources to help you grow on Buizrocket" />
      <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin">
        <div className="max-w-[1400px] mx-auto space-y-8">
          
          {/* Hero banner */}
          <div 
            className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-[#15171b] via-[#1a1c23] to-[#15171b] p-8 md:p-12 shadow-[0_20px_60px_rgb(0,0,0,0.3)]"
            style={{ animation: 'fadeIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.1s both' }}
          >
            <div className="absolute inset-0 z-0">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,#000_20%,transparent_100%)] opacity-30" />
              <div className="absolute -top-[150%] -left-[50%] w-[1000px] h-[1000px] bg-[radial-gradient(circle,rgba(110,61,251,0.15)_0%,transparent_60%)] animate-slow-spin mix-blend-screen" />
            </div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 mb-6">
                  <span className="w-2 h-2 rounded-full bg-[#00D1FF] animate-pulse" />
                  <span className="text-[11px] font-bold text-white uppercase tracking-widest">New Courses Added</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4 leading-tight">
                  Master the Art of <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D1FF] via-[#6E3DFB] to-[#FF61BC]">Selling Online</span>
                </h2>
                <p className="text-base font-medium text-[#9b9da1] max-w-md">Everything you need to succeed as a seller on Buizrocket. Explore guides, videos, and proven best practices.</p>
              </div>
              <div className="hidden lg:flex w-40 h-40 rounded-[2rem] bg-gradient-to-br from-[#6E3DFB] to-[#FF61BC] rotate-6 items-center justify-center shadow-[0_20px_40px_rgba(110,61,251,0.4)] relative">
                <div className="absolute inset-0 bg-white/20 backdrop-blur-md rounded-[2rem]" />
                <Video size={64} className="text-white relative z-10 drop-shadow-md" strokeWidth={1.5} />
              </div>
            </div>
          </div>

          {/* Resource sections */}
          <div className="space-y-12 pt-4">
            {resources.map((section, sectionIdx) => {
              const Icon = section.icon
              return (
                <div key={section.category} style={{ animation: `fadeIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${0.3 + (sectionIdx * 0.1)}s both` }}>
                  <div className="flex items-center gap-4 mb-6 px-2">
                    <div className={`w-12 h-12 rounded-[1rem] bg-gradient-to-br ${section.color} flex items-center justify-center text-white shadow-md`}>
                      <Icon size={20} strokeWidth={2.5} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-[#2c2f33] dark:text-white tracking-tight">{section.category}</h3>
                      <p className="text-sm font-medium text-[#9b9da1]">{section.desc}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {section.items.map((item, i) => (
                      <div
                        key={item.title}
                        className="group flex flex-col justify-between p-6 bg-white/80 dark:bg-[#15171b]/80 backdrop-blur-2xl border border-white/40 dark:border-white/5 rounded-[1.5rem] shadow-[0_8px_40px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_40px_rgb(0,0,0,0.2)] hover:shadow-[0_12px_50px_rgb(0,0,0,0.08)] dark:hover:shadow-[0_12px_50px_rgb(0,0,0,0.3)] hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                        style={{ animation: `scaleIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) ${0.4 + (sectionIdx * 0.1) + (i * 0.05)}s both` }}
                      >
                        <div>
                          <div className="flex items-start justify-between mb-4">
                            <span className={`text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-md ${tagColors[item.tag]}`}>{item.tag}</span>
                            <div className="w-8 h-8 rounded-lg bg-[#f5f6fb] dark:bg-zinc-800 flex items-center justify-center group-hover:bg-[#6E3DFB] group-hover:text-white text-[#9b9da1] transition-colors">
                              <ExternalLink size={14} strokeWidth={2.5} />
                            </div>
                          </div>
                          <h4 className="text-lg font-extrabold text-[#2c2f33] dark:text-white mb-2 leading-tight group-hover:text-[#6E3DFB] transition-colors">{item.title}</h4>
                          <p className="text-sm font-medium text-[#595c60] dark:text-[#9b9da1] mb-6 line-clamp-2">{item.description}</p>
                        </div>
                        <div className="flex items-center gap-2 pt-4 border-t border-[#e6e8ee] dark:border-zinc-800">
                          <div className="flex gap-1.5 opacity-50">
                            {[1,2,3].map(dot => <div key={dot} className={`w-1 h-1 rounded-full bg-current ${dot === 1 ? 'opacity-100' : dot === 2 ? 'opacity-50' : 'opacity-25'}`} />)}
                          </div>
                          <p className="text-[12px] font-bold text-[#9b9da1] uppercase tracking-widest">{item.time} read</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
          
        </div>
      </div>
    </div>
  )
}
