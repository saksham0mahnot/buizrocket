import { ExternalLink, Video, FileText, BookOpen, Zap } from 'lucide-react'
import { TopNavbar } from '../components/layout/TopNavbar'

const resources = [
  {
    category: 'Getting Started',
    icon: Zap,
    color: 'text-blue-500 bg-blue-50 dark:bg-blue-400/10',
    items: [
      { title: 'Setting Up Your Store', description: 'Complete guide to listing your first products', tag: 'Guide', time: '10 min' },
      { title: 'Order Fulfillment Basics', description: 'How to process and ship orders efficiently', tag: 'Guide', time: '8 min' },
      { title: 'Pricing Strategy 101', description: 'Learn to price competitively and profitably', tag: 'Article', time: '6 min' },
    ],
  },
  {
    category: 'Grow Your Sales',
    icon: BookOpen,
    color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-400/10',
    items: [
      { title: 'SEO for Product Listings', description: 'Optimize your product pages for better visibility', tag: 'Video', time: '15 min' },
      { title: 'Photography Best Practices', description: 'Take compelling product photos that convert', tag: 'Guide', time: '12 min' },
      { title: 'Understanding Analytics', description: 'Make data-driven decisions for your store', tag: 'Article', time: '7 min' },
    ],
  },
  {
    category: 'Policies & Compliance',
    icon: FileText,
    color: 'text-violet-500 bg-violet-50 dark:bg-violet-400/10',
    items: [
      { title: 'GST Filing for Sellers', description: 'A step-by-step guide to GST compliance', tag: 'Guide', time: '20 min' },
      { title: 'Return & Refund Policy', description: 'Understand platform return policies', tag: 'Article', time: '5 min' },
      { title: 'Prohibited Items List', description: 'What you cannot sell on Buizrocket', tag: 'Article', time: '3 min' },
    ],
  },
]

const tagColors: Record<string, string> = {
  Guide: 'bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400',
  Video: 'bg-red-50 dark:bg-red-500/15 text-red-600 dark:text-red-400',
  Article: 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
}

export function LearnPage() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopNavbar title="Learn" subtitle="Resources to help you grow on Buizrocket" />
      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin animate-fade-in space-y-6">
        {/* Hero banner */}
        <div className="rounded-2xl border border-blue-200 dark:border-blue-500/20 bg-gradient-to-r from-blue-50 dark:from-blue-600/10 to-violet-50 dark:to-violet-600/10 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100 mb-1">Seller University</h2>
            <p className="text-sm text-gray-500 dark:text-zinc-400 max-w-md">Everything you need to succeed as a seller on Buizrocket. Explore guides, videos, and best practices.</p>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <Video size={32} className="text-blue-400 opacity-60" />
          </div>
        </div>

        {/* Resource cards */}
        {resources.map((section) => {
          const Icon = section.icon
          return (
            <div key={section.category}>
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${section.color}`}>
                  <Icon size={14} />
                </div>
                <h3 className="text-sm font-semibold text-gray-800 dark:text-zinc-200">{section.category}</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {section.items.map((item) => (
                  <div
                    key={item.title}
                    className="p-4 rounded-xl border border-gray-200 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/80 hover:border-gray-300 dark:hover:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800/60 transition-all duration-200 cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${tagColors[item.tag]}`}>{item.tag}</span>
                      <ExternalLink size={13} className="text-gray-300 dark:text-zinc-700 group-hover:text-gray-500 dark:group-hover:text-zinc-400 transition-colors" />
                    </div>
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-zinc-200 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{item.title}</h4>
                    <p className="text-xs text-gray-400 dark:text-zinc-500 mb-3">{item.description}</p>
                    <p className="text-xs text-gray-300 dark:text-zinc-700">{item.time} read</p>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
