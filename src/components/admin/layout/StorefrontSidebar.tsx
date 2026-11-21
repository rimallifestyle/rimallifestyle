"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  Image as ImageIcon, 
  Type, 
  Palette, 
  Layers, 
  Sliders, 
  Globe,
  Settings,
  MonitorPlay,
  ChevronRight,
  MousePointerClick
} from 'lucide-react'
import { cn } from '@/lib/utils'

export const builderSections = [
  { id: 'hero', title: 'Hero Slider', icon: ImageIcon },
  { id: 'marquee', title: 'Announcement Bar', icon: Type },
  { id: 'typography', title: 'Typography', icon: Type },
  { id: 'colors', title: 'Theme Colors', icon: Palette },
  { id: 'navigation', title: 'Navigation', icon: Layers },
  { id: 'footer', title: 'Footer Settings', icon: Layers },
  { id: 'seo', title: 'SEO Settings', icon: Globe },
  { id: 'new', title: 'New Arrivals', icon: Sliders },
  { id: 'shirts', title: 'Shirts Section', icon: Sliders },
  { id: 'tshirts', title: 'T-Shirts Section', icon: Sliders },
  { id: 'polos', title: 'Polos Section', icon: Sliders },
  { id: 'pants', title: 'Trousers Section', icon: Sliders },
  { id: 'jackets', title: 'Outerwear Section', icon: Sliders },
  { id: 'hats', title: 'Headwear Section', icon: Sliders },
  { id: 'panjabi', title: 'Panjabi Edit', icon: Sliders },
]

export const pages = [
  { path: '', title: 'Home Page' },
  { path: 'shop', title: 'Shop' },
  { path: 'cart', title: 'Cart' },
  { path: 'checkout', title: 'Checkout' },
]

export function StorefrontSidebar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeSection = searchParams.get('section') || 'hero'

  return (
    <aside className="w-[280px] h-screen flex flex-col border-r border-white/10 bg-[#0a0000]/95 backdrop-blur-3xl z-40 relative shadow-[5px_0_30px_rgba(0,0,0,0.5)]">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7A1111] to-[#550000] flex items-center justify-center shadow-[0_0_15px_rgba(197,42,53,0.3)] border border-[#C52A35]/30">
            <MonitorPlay className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold text-white tracking-wide">Builder</span>
        </div>
      </div>

      <div className="p-4 border-b border-white/5">
        <p className="text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-3 pl-2">
          Pages
        </p>
        <div className="space-y-1">
          <select 
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#ff8a93] cursor-pointer"
            onChange={(e) => {
              const url = new URL(window.location.href)
              url.searchParams.set('path', e.target.value)
              url.searchParams.delete('section') // close open forms when changing page
              router.push(url.pathname + url.search)
            }}
            value={searchParams.get('path') || ''}
          >
            {pages.map((p) => (
              <option key={p.path} value={p.path} className="bg-[#0a0000]">{p.title}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="p-4">
        <p className="text-[11px] font-semibold text-white/40 uppercase tracking-wider mb-4 pl-2">
          Page Elements
        </p>
        <div className="space-y-1.5">
          {builderSections.map((section) => {
            const Icon = section.icon
            const isActive = activeSection === section.id
            return (
              <button
                key={section.id}
                onClick={() => {
                  const url = new URL(window.location.href)
                  url.searchParams.set('section', section.id)
                  router.push(url.pathname + url.search)
                }}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-300 group",
                  isActive 
                    ? "bg-[#C52A35]/10 border border-[#C52A35]/20 text-[#ff8a93] shadow-[0_0_15px_rgba(197,42,53,0.1)]" 
                    : "text-white/70 hover:bg-white/5 hover:text-white border border-transparent"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className={cn("w-4 h-4", isActive ? "text-[#ff8a93]" : "text-white/50 group-hover:text-white/80")} />
                  <span className="text-sm font-medium">{section.title}</span>
                </div>
                {isActive && (
                  <motion.div layoutId="activeIndicator">
                    <ChevronRight className="w-4 h-4 opacity-50" />
                  </motion.div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-auto p-4 border-t border-white/5">
        <button className="w-full flex items-center justify-between px-4 py-3 rounded-xl glass-button border border-white/5 text-sm font-medium text-white/80 transition-all hover:bg-white/10 hover:text-white group">
          <div className="flex items-center gap-3">
            <Settings className="w-4 h-4 text-white/50 group-hover:text-white/80" />
            Advanced Settings
          </div>
        </button>
      </div>
    </aside>
  )
}
