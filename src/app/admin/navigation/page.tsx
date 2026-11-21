"use client"

import React from 'react'
import NavigationSettings from '@/components/admin/storefront-settings/NavigationSettings'

export default function AdminNavigationPage() {
  return (
    <div className="w-full min-h-[calc(100vh-64px)] p-4 md:p-6 lg:p-8 space-y-6">
      <div className="w-full bg-gradient-to-br from-[#0a0000] via-background to-[#050000] border border-white/5 rounded-3xl p-4 md:p-8 shadow-[0_0_40px_rgba(0,0,0,0.5)] relative overflow-hidden min-h-[600px]">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#C52A35]/10 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/3" />
        <NavigationSettings />
      </div>
    </div>
  )
}
