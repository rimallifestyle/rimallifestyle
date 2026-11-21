"use client"

import React from 'react'
import { ArrowLeft, Menu, ExternalLink, Globe, LayoutDashboard } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

export function StorefrontHeader({ onMenuClick, onExitBuilder }: { onMenuClick?: () => void, onExitBuilder?: () => void }) {
  const router = useRouter()

  return (
    <header className="h-16 px-4 md:px-6 flex items-center justify-between z-30 relative bg-[#050000]/80 backdrop-blur-2xl border-b border-white/[0.05]">
      {/* Decorative top glow */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C52A35]/50 to-transparent" />
      
      <div className="flex items-center gap-4 w-1/3">
        {onMenuClick && (
          <button 
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-xl hover:bg-white/10 transition-colors text-white/60 hover:text-white"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <button 
          onClick={onExitBuilder || (() => router.push('/admin'))}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10 transition-all text-white/60 hover:text-white group"
          title="Back to Admin"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Exit Builder</span>
        </button>
      </div>

      {/* Center Branding / Status */}
      <div className="hidden md:flex items-center justify-center gap-3 w-1/3">
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.02] border border-white/5">
          <LayoutDashboard className="w-4 h-4 text-[#C52A35]" />
          <span className="text-sm font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
            Storefront Manager
          </span>
          <div className="w-px h-4 bg-white/10 mx-1" />
          <div className="flex items-center gap-1.5">
            <motion.div 
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" 
            />
            <span className="text-xs font-medium text-white/50">Live</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 w-1/3">
        <a 
          href="/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="group flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          <Globe className="w-3.5 h-3.5 text-white/70 group-hover:text-white transition-colors" />
          View Live Store
          <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
        </a>
      </div>
    </header>
  )
}
