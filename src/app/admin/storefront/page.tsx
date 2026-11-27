"use client"

import React, { useState, useEffect, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSearchParams } from 'next/navigation'
import { LayoutGrid, Image as ImageIcon, Megaphone, Layout as LayoutIcon, Navigation, Sliders, Info, Phone, ArrowLeft, ChevronRight, Loader2, Sparkles } from 'lucide-react'

// Import all settings components
import LayoutSettings from '@/components/admin/storefront-settings/LayoutSettings'
import HeroSettings from '@/components/admin/storefront-settings/HeroSettings'
import MarqueeSettings from '@/components/admin/storefront-settings/MarqueeSettings'
import FooterSettings from '@/components/admin/storefront-settings/FooterSettings'
import NavigationSettings from '@/components/admin/storefront-settings/NavigationSettings'
import SectionsSettings from '@/components/admin/storefront-settings/SectionsSettings'
import AboutSettings from '@/components/admin/storefront-settings/AboutSettings'
import ContactSettings from '@/components/admin/storefront-settings/ContactSettings'
import SiteIdentitySettings from '@/components/admin/storefront-settings/SiteIdentitySettings'
import FeatureStripSettings from '@/components/admin/storefront-settings/FeatureStripSettings'

const DASHBOARD_CARDS = [
  {
    category: 'Pages',
    items: [
      { id: 'layout', title: 'Home Page Layout', desc: 'Rearrange and manage sections', icon: LayoutGrid, component: LayoutSettings, color: 'from-blue-500/20 to-blue-500/5', border: 'border-blue-500/30' },
      { id: 'hero', title: 'Hero Slider', desc: 'Manage top banners', icon: ImageIcon, component: HeroSettings, color: 'from-purple-500/20 to-purple-500/5', border: 'border-purple-500/30' },
      { id: 'sections', title: 'Product Sections', desc: 'Home page product blocks', icon: Sliders, component: SectionsSettings, color: 'from-pink-500/20 to-pink-500/5', border: 'border-pink-500/30' },
      { id: 'about', title: 'About Us', desc: 'Company story and info', icon: Info, component: AboutSettings, color: 'from-green-500/20 to-green-500/5', border: 'border-green-500/30' },
      { id: 'contact', title: 'Contact Us', desc: 'Location and details', icon: Phone, component: ContactSettings, color: 'from-yellow-500/20 to-yellow-500/5', border: 'border-yellow-500/30' },
    ]
  },
  {
    category: 'Global Theme',
    items: [
      { id: 'identity', title: 'Site Identity', desc: 'Manage store logo and name', icon: ImageIcon, component: SiteIdentitySettings, color: 'from-emerald-500/20 to-emerald-500/5', border: 'border-emerald-500/30' },
      { id: 'features', title: 'Feature Strip', desc: 'Free shipping, returns & checkout badges', icon: Sparkles, component: FeatureStripSettings, color: 'from-amber-500/20 to-amber-500/5', border: 'border-amber-500/30' },
      { id: 'navigation', title: 'Navigation', desc: 'Header menus and links', icon: Navigation, component: NavigationSettings, color: 'from-cyan-500/20 to-cyan-500/5', border: 'border-cyan-500/30' },
      { id: 'marquee', title: 'Announcement', desc: 'Top scrolling text', icon: Megaphone, component: MarqueeSettings, color: 'from-orange-500/20 to-orange-500/5', border: 'border-orange-500/30' },
      { id: 'footer', title: 'Footer', desc: 'Bottom links and newsletter', icon: LayoutIcon, component: FooterSettings, color: 'from-red-500/20 to-red-500/5', border: 'border-red-500/30' },
    ]
  }
]

function StorefrontContent() {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab')
  const [activeSetting, setActiveSetting] = useState<string | null>(tabParam || null)

  useEffect(() => {
    if (tabParam) {
      setActiveSetting(tabParam)
    }
  }, [tabParam])

  const findComponent = (id: string) => {
    for (const group of DASHBOARD_CARDS) {
      const found = group.items.find(t => t.id === id)
      if (found) return found
    }
    return null
  }

  const activeData = activeSetting ? findComponent(activeSetting) : null
  const ActiveComponent = activeData?.component

  if (activeSetting && ActiveComponent) {
    return (
      <div className="w-full min-h-[calc(100vh-64px)] p-4 md:p-6 lg:p-8 space-y-6">
        <button 
          onClick={() => setActiveSetting(null)}
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors group"
        >
          <div className="p-1.5 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span className="text-sm font-medium">Back to Storefront Dashboard</span>
        </button>

        <div className="w-full bg-gradient-to-br from-[#0a0000] via-background to-[#050000] border border-white/5 rounded-3xl p-4 md:p-8 shadow-[0_0_40px_rgba(0,0,0,0.5)] relative overflow-hidden min-h-[600px]">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#C52A35]/10 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/3" />
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSetting}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <ActiveComponent />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-[calc(100vh-64px)] p-6 md:p-8 space-y-10">
      <div className="relative z-10">
        <h1 className="text-3xl font-bold text-white tracking-tight">Storefront Overview</h1>
        <p className="text-white/50 text-sm mt-2 max-w-2xl">
          Welcome to your storefront builder. Manage your website's pages, themes, and content from this centralized dashboard.
        </p>
      </div>

      <div className="space-y-12 relative z-10">
        {DASHBOARD_CARDS.map((group, idx) => (
          <div key={idx} className="space-y-6">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#C52A35]" />
              {group.category}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {group.items.map((card) => (
                <button
                  key={card.id}
                  onClick={() => setActiveSetting(card.id)}
                  className={`
                    relative overflow-hidden group text-left
                    bg-white/[0.02] hover:bg-white/[0.04] backdrop-blur-xl border border-white/5 hover:border-white/10
                    rounded-2xl p-6 transition-all duration-300
                    hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:-translate-y-1
                  `}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  
                  <div className="relative z-10 flex items-start justify-between">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${card.color} border ${card.border}`}>
                      <card.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                      <ChevronRight className="w-4 h-4 text-white" />
                    </div>
                  </div>

                  <div className="relative z-10 mt-6">
                    <h3 className="text-lg font-bold text-white mb-1">{card.title}</h3>
                    <p className="text-sm text-white/50 line-clamp-2">{card.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function StorefrontManager() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[#C52A35] animate-spin" />
      </div>
    }>
      <StorefrontContent />
    </Suspense>
  )
}
