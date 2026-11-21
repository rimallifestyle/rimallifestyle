"use client"

import React, { useState, useEffect } from 'react'
import { Blocks, Search, Filter, Plus, CheckCircle2, Settings, ExternalLink, ArrowRight, Zap, Smartphone, MessageCircle, BarChart, Mail, ShoppingBag } from 'lucide-react'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { cn } from '@/lib/utils'

const integrationsData = [
  {
    id: 'int-1',
    name: 'Meta Pixel',
    category: 'Marketing',
    description: 'Track conversions, optimize ads, and build targeted audiences on Facebook & Instagram.',
    status: 'Connected',
    icon: 'M',
    color: 'bg-blue-600',
    tags: ['Ads', 'Tracking']
  },
  {
    id: 'int-2',
    name: 'Google Analytics 4',
    category: 'Analytics',
    description: 'Get deep insights into your website traffic, user behavior, and sales performance.',
    status: 'Connected',
    icon: 'G',
    color: 'bg-amber-500',
    tags: ['Traffic', 'Data']
  },
  {
    id: 'int-3',
    name: 'WhatsApp Business',
    category: 'Customer Support',
    description: 'Engage with customers, send order updates, and provide support directly via WhatsApp.',
    status: 'Not Connected',
    icon: <MessageCircle className="w-5 h-5 text-white" />,
    color: 'bg-emerald-500',
    tags: ['Chat', 'Updates']
  },
  {
    id: 'int-4',
    name: 'Mailchimp',
    category: 'Marketing',
    description: 'Automate email marketing, send newsletters, and recover abandoned carts.',
    status: 'Not Connected',
    icon: <Mail className="w-5 h-5 text-black" />,
    color: 'bg-yellow-400',
    tags: ['Email', 'Automation']
  },
  {
    id: 'int-5',
    name: 'Steadfast Courier',
    category: 'Shipping',
    description: 'Automate parcel booking and track deliveries in real-time inside Bangladesh.',
    status: 'Connected',
    icon: <Zap className="w-5 h-5 text-white" />,
    color: 'bg-purple-600',
    tags: ['Logistics', 'Local']
  },
  {
    id: 'int-6',
    name: 'QuickBooks',
    category: 'Accounting',
    description: 'Sync your orders, taxes, and customer data automatically for seamless accounting.',
    status: 'Not Connected',
    icon: 'QB',
    color: 'bg-green-600',
    tags: ['Finance', 'Sync']
  },
  {
    id: 'int-7',
    name: 'WooCommerce Sync',
    category: 'E-Commerce',
    description: 'Sync products, inventory, and orders between your Rimal store and WooCommerce.',
    status: 'Update Available',
    icon: <ShoppingBag className="w-5 h-5 text-white" />,
    color: 'bg-indigo-500',
    tags: ['Core', 'Migration']
  },
  {
    id: 'int-8',
    name: 'Bulk SMS BD',
    category: 'Marketing',
    description: 'Send OTPs and order confirmation SMS to customers in Bangladesh.',
    status: 'Connected',
    icon: <Smartphone className="w-5 h-5 text-white" />,
    color: 'bg-teal-500',
    tags: ['SMS', 'Local']
  }
]

const categories = ['All', 'Marketing', 'Analytics', 'Customer Support', 'Shipping', 'Accounting', 'E-Commerce']

export default function IntegrationsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 pt-4 pb-6">
        <div className="mb-2 space-y-2">
          <div className="h-8 w-48 rounded-md bg-white/10 animate-pulse" />
          <div className="h-4 w-96 rounded-md bg-white/10 animate-pulse" />
        </div>
        <div className="flex gap-2 mt-4 overflow-hidden">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-8 w-24 rounded-lg bg-white/10 animate-pulse shrink-0" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="glass-card rounded-3xl p-6 h-[280px] animate-pulse bg-white/5" />
          ))}
        </div>
      </div>
    )
  }

  const filteredIntegrations = activeCategory === 'All' 
    ? integrationsData 
    : integrationsData.filter(i => i.category === activeCategory)

  return (
    <div className="flex flex-col gap-6 pt-4 pb-6">
      {/* Page Header */}
      <ScrollReveal delay={0.1}>
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
              <Blocks className="w-6 h-6 text-white/70" />
              App Integrations
            </h1>
            <p className="text-white/60 text-sm">Connect your store with third-party tools and services to expand functionality.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-white/40" />
              </div>
              <input 
                type="text" 
                placeholder="Search apps..." 
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-white/30 focus:bg-white/10 transition-colors"
              />
            </div>
            <button className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors">
              <Filter className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </ScrollReveal>

      {/* Categories Bar */}
      <ScrollReveal delay={0.2}>
        <div className="flex overflow-x-auto pb-2 custom-scrollbar gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={cn(
                "px-4 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
                activeCategory === category 
                  ? "bg-white text-black" 
                  : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/5"
              )}
            >
              {category}
            </button>
          ))}
        </div>
      </ScrollReveal>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredIntegrations.map((app, index) => (
          <ScrollReveal key={app.id} delay={0.15 + (index * 0.05)}>
            <div className="glass-card rounded-3xl p-6 h-full flex flex-col group border-white/5 hover:border-white/20 transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
              
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg", app.color, typeof app.icon === 'string' ? "text-white" : "")}>
                  {app.icon}
                </div>
                
                {app.status === 'Connected' ? (
                  <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full border border-emerald-400/20">
                    <CheckCircle2 className="w-3 h-3" />
                    Connected
                  </span>
                ) : app.status === 'Update Available' ? (
                  <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-amber-400 bg-amber-400/10 px-2 py-1 rounded-full border border-amber-400/20">
                    Update
                  </span>
                ) : (
                  <span className="text-[10px] uppercase tracking-wider font-bold text-white/40 bg-white/5 px-2 py-1 rounded-full border border-white/10">
                    Add App
                  </span>
                )}
              </div>
              
              {/* Info */}
              <h3 className="text-base font-bold text-white mb-1 group-hover:text-[#C52A35] transition-colors flex items-center justify-between">
                {app.name}
              </h3>
              <p className="text-xs font-medium text-white/40 mb-3">{app.category}</p>
              
              <div className="flex flex-wrap gap-1.5 mb-4">
                {app.tags.map(tag => (
                  <span key={tag} className="text-[10px] font-medium bg-white/5 text-white/60 px-2 py-0.5 rounded">
                    {tag}
                  </span>
                ))}
              </div>
              
              <p className="text-sm text-white/60 line-clamp-3 mb-6 flex-grow">
                {app.description}
              </p>
              
              {/* Actions */}
              <div className="mt-auto pt-4 border-t border-white/5">
                {app.status === 'Connected' ? (
                  <div className="flex items-center gap-2">
                    <button className="flex-1 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-medium text-white transition-colors flex items-center justify-center gap-2">
                      <Settings className="w-4 h-4" />
                      Settings
                    </button>
                    <button className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 hover:bg-red-500/10 hover:text-red-400 text-white/50 border border-white/10 transition-colors" title="Disconnect">
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button className="w-full h-9 rounded-xl bg-white text-black hover:bg-white/90 text-sm font-medium transition-colors flex items-center justify-center gap-2">
                    <Plus className="w-4 h-4" />
                    Install App
                  </button>
                )}
              </div>
              
            </div>
          </ScrollReveal>
        ))}

        {/* Developer / Request App Card */}
        <ScrollReveal delay={0.6}>
          <div className="glass-card rounded-3xl p-6 h-full flex flex-col items-center justify-center text-center border-dashed border-white/10 hover:border-white/30 transition-colors group cursor-pointer bg-gradient-to-b from-transparent to-[#550000]/10">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Blocks className="w-6 h-6 text-white/50 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Build an Integration</h3>
            <p className="text-sm text-white/50 mb-4 max-w-[200px]">
              Use our REST API to connect your own custom software or tools.
            </p>
            <button className="flex items-center gap-2 text-sm font-medium text-[#C52A35] hover:text-white transition-colors">
              View API Docs <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </ScrollReveal>
      </div>
    </div>
  )
}
