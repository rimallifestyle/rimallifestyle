"use client"

import React, { useEffect, useState } from 'react'
import { Search, Bell, ChevronDown, Menu } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

import { useUserSync } from "@/context/UserSync"
import { useAdminNotifications } from "@/hooks/useAdminNotifications"

export function Header({ 
  onMenuClick, 
  onNotificationClick 
}: { 
  onMenuClick?: () => void; 
  onNotificationClick?: () => void; 
}) {
  const { userProfile } = useUserSync()
  const { unreadCount } = useAdminNotifications()

  const getInitials = (name: string) => {
    if (!name) return 'AD'
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2)
  }

  const getAvatarUrl = (name: string) => {
    if (userProfile?.avatar) return userProfile.avatar;
    const displayName = name || 'Admin'
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=550000&color=fff`
  }

  const displayName = userProfile?.name || (userProfile?.email ? userProfile.email.split('@')[0] : 'Administrator')
  const displayRole = userProfile?.role === 'admin' ? 'Admin' : (userProfile?.role || 'Store Owner')

  return (
    <header className="h-24 px-4 md:px-8 flex items-center justify-between z-30 relative">
      {/* Left side */}
      <div className="flex items-center gap-4">
        {onMenuClick && (
          <button 
            onClick={onMenuClick}
            className="lg:hidden p-2 -ml-2 text-white/70 hover:text-white transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        )}
        
        {/* Search */}
        <div className="relative group hidden sm:block">
          <Search className="w-4 h-4 text-white/50 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-white transition-colors" />
          <input 
            type="text" 
            placeholder="Search anything..." 
            className="w-48 lg:w-80 h-10 pl-10 pr-4 rounded-full bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 focus:bg-white/10 transition-all"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Date Selector */}
        <button className="hidden md:flex items-center gap-2 h-10 px-4 rounded-full glass-button text-sm text-white/80 hover:text-white">
          May 16 - May 22, 2025
          <ChevronDown className="w-4 h-4 opacity-70" />
        </button>

        {/* Notifications */}
        <button 
          onClick={onNotificationClick}
          className="relative w-10 h-10 rounded-full glass-button flex items-center justify-center hover:text-white text-white/80 hover:bg-white/10 transition-all cursor-pointer group"
          title="Notifications"
          type="button"
        >
          <Bell className="w-4 h-4 transition-transform group-hover:scale-110" />
          {unreadCount > 0 ? (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-[#C52A35] text-[10px] font-bold text-white shadow-[0_0_10px_rgba(197,42,53,0.8)] border border-[#0c0404]">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : (
            <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-white/30" />
          )}
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-1 pr-3 py-1 rounded-full bg-white/5 border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.02)] cursor-pointer hover:bg-white/10 transition-colors backdrop-blur-md ml-2 group">
          <Avatar className="w-8 h-8 border border-white/20 shadow-[0_0_10px_rgba(255,255,255,0.1)] group-hover:scale-105 transition-transform bg-[#550000]">
            <AvatarImage src={getAvatarUrl(displayName)} className="object-cover" />
            <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
          </Avatar>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-bold text-white leading-tight capitalize">
              {displayName}
            </p>
            <p className="text-[10px] text-white/50 leading-tight capitalize">
              {displayRole}
            </p>
          </div>
          <ChevronDown className="w-4 h-4 text-white/40 ml-1 hidden sm:block group-hover:text-white transition-colors" />
        </div>
      </div>
    </header>
  )
}

