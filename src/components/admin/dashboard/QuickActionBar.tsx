"use client"

import React from 'react'
import { PlusSquare, FolderPlus, Ticket, UserPlus, ImagePlus, Settings } from 'lucide-react'

const actions = [
  { icon: PlusSquare, label: 'Add Product' },
  { icon: FolderPlus, label: 'Add Category' },
  { icon: Ticket, label: 'Add Coupon' },
  { icon: UserPlus, label: 'Add User' },
  { icon: ImagePlus, label: 'Upload Banner' },
  { icon: Settings, label: 'Settings' },
]

export function QuickActionBar() {
  return (
    <div className="mt-8 flex justify-center w-full relative z-20 px-4">
      <div className="glass-card rounded-2xl p-2 flex items-center gap-2 max-w-full overflow-x-auto custom-scrollbar shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
        {actions.map((action, index) => (
          <button 
            key={index}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300 group"
          >
            <div className="w-8 h-8 rounded-lg glass-button flex items-center justify-center group-hover:bg-[#C52A35]/20 group-hover:border-[#C52A35]/50 group-hover:shadow-[0_0_15px_rgba(197,42,53,0.4)] transition-all">
              <action.icon className="w-4 h-4 group-hover:text-[#ff8a93] transition-colors" />
            </div>
            <span className="text-sm font-medium whitespace-nowrap">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
