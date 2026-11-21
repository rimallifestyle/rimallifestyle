"use client"

import React, { useState, useEffect } from 'react'
import { 
  Settings as SettingsIcon, 
  Store, 
  Users, 
  Bell, 
  CreditCard, 
  Truck, 
  Calculator, 
  FileText, 
  ShieldCheck, 
  Globe, 
  Database,
  ChevronRight,
  Search
} from 'lucide-react'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { cn } from '@/lib/utils'
import Link from 'next/link'

const settingsCategories = [
  { 
    id: 'appearance', 
    name: 'Appearance', 
    description: 'Manage store logo, favicon, and basic branding.', 
    icon: Globe, 
    color: 'text-rose-400', 
    bg: 'bg-rose-500/10',
    href: '/admin/settings/appearance'
  },
  { 
    id: 'store-details', 
    name: 'Store Details', 
    description: 'Manage your store profile, address, and contact information.', 
    icon: Store, 
    color: 'text-blue-400', 
    bg: 'bg-blue-500/10' 
  },
  { 
    id: 'users-permissions', 
    name: 'Users & Permissions', 
    description: 'Manage what staff members can see or do in your store.', 
    icon: Users, 
    color: 'text-emerald-400', 
    bg: 'bg-emerald-500/10' 
  },
  { 
    id: 'notifications', 
    name: 'Notifications', 
    description: 'Manage email and SMS notifications sent to you and your customers.', 
    icon: Bell, 
    color: 'text-amber-400', 
    bg: 'bg-amber-500/10',
    href: '/admin/settings/notifications'
  },
  { 
    id: 'checkout', 
    name: 'Checkout', 
    description: 'Customize your online checkout process and customer accounts.', 
    icon: CreditCard, 
    color: 'text-purple-400', 
    bg: 'bg-purple-500/10' 
  },
  { 
    id: 'shipping', 
    name: 'Shipping & Delivery', 
    description: 'Manage where you ship, how much you charge, and local delivery.', 
    icon: Truck, 
    color: 'text-orange-400', 
    bg: 'bg-orange-500/10' 
  },
  { 
    id: 'taxes', 
    name: 'Taxes & Duties', 
    description: 'Manage how your store charges taxes for sales and shipments.', 
    icon: Calculator, 
    color: 'text-red-400', 
    bg: 'bg-red-500/10' 
  },
  { 
    id: 'policies', 
    name: 'Legal & Policies', 
    description: 'Set up your refund policy, privacy policy, and terms of service.', 
    icon: FileText, 
    color: 'text-slate-400', 
    bg: 'bg-slate-500/10' 
  },
  { 
    id: 'security', 
    name: 'Security & Privacy', 
    description: 'Manage customer data privacy, GDPR compliance, and store security.', 
    icon: ShieldCheck, 
    color: 'text-teal-400', 
    bg: 'bg-teal-500/10' 
  },
  { 
    id: 'domains', 
    name: 'Domains', 
    description: 'Connect and manage your custom domain names (e.g., yourstore.com).', 
    icon: Globe, 
    color: 'text-pink-400', 
    bg: 'bg-pink-500/10' 
  },
  { 
    id: 'advanced', 
    name: 'Advanced Settings', 
    description: 'Manage API keys, webhooks, and database optimization tools.', 
    icon: Database, 
    color: 'text-indigo-400', 
    bg: 'bg-indigo-500/10' 
  }
]

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true)

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="glass-card rounded-3xl p-6 h-[160px] animate-pulse bg-white/5" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 pt-4 pb-6">
      {/* Page Header */}
      <ScrollReveal delay={0.1}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
              <SettingsIcon className="w-6 h-6 text-white/70" />
              Store Settings
            </h1>
            <p className="text-white/60 text-sm">Configure your store's core functionality, policies, and operations.</p>
          </div>
          
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-white/40" />
            </div>
            <input 
              type="text" 
              placeholder="Search settings..." 
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-white/30 focus:bg-white/10 transition-colors"
            />
          </div>
        </div>
      </ScrollReveal>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {settingsCategories.map((category, index) => (
          <ScrollReveal key={category.id} delay={0.15 + (index * 0.05)}>
            {category.href ? (
              <Link href={category.href} className="block h-full">
                <div className="glass-card rounded-3xl p-5 h-full flex flex-col hover:bg-white/5 border border-white/5 hover:border-white/20 transition-all cursor-pointer group">
                  <div className="flex items-start justify-between mb-4">
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", category.bg)}>
                      <category.icon className={cn("w-6 h-6", category.color)} />
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                      <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-white mb-1 group-hover:text-[#C52A35] transition-colors">{category.name}</h3>
                  <p className="text-sm text-white/50 line-clamp-2 mt-auto">{category.description}</p>
                </div>
              </Link>
            ) : (
              <div className="glass-card rounded-3xl p-5 h-full flex flex-col hover:bg-white/5 border border-white/5 hover:border-white/20 transition-all cursor-pointer group">
                <div className="flex items-start justify-between mb-4">
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", category.bg)}>
                    <category.icon className={cn("w-6 h-6", category.color)} />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                    <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
                  </div>
                </div>
                <h3 className="text-base font-bold text-white mb-1 group-hover:text-[#C52A35] transition-colors">{category.name}</h3>
                <p className="text-sm text-white/50 line-clamp-2 mt-auto">{category.description}</p>
              </div>
            )}
          </ScrollReveal>
        ))}

        {/* Quick Links / Help */}
        <ScrollReveal delay={0.65} className="md:col-span-2 lg:col-span-3 xl:col-span-2">
          <div className="glass-card rounded-3xl p-6 border-dashed border-white/10 h-full flex flex-col justify-center bg-gradient-to-br from-[#7A1111]/10 to-transparent">
            <h3 className="text-lg font-medium text-white mb-2">Need Help Finding Something?</h3>
            <p className="text-sm text-white/60 max-w-md mb-4">
              Can't find the setting you're looking for? Check out our documentation or contact Rimal Support for assistance.
            </p>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 rounded-xl bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-colors">
                View Documentation
              </button>
              <button className="px-4 py-2 rounded-xl text-white/70 text-sm font-medium hover:text-white transition-colors">
                Contact Support
              </button>
            </div>
          </div>
        </ScrollReveal>

      </div>
    </div>
  )
}
