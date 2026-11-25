"use client"

import React, { useState } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { StorefrontSidebar } from './StorefrontSidebar'
import { StorefrontHeader } from './StorefrontHeader'
import { NotificationDrawer } from './NotificationDrawer'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'
import { LoginScreen } from '../auth/LoginScreen'
import { LayoutDashboard, ArrowLeft } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useAdminTheme } from '@/context/AdminThemeContext'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isLight } = useAdminTheme()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [isSwitchingToStorefront, setIsSwitchingToStorefront] = useState(false)
  const [isSwitchingToAdmin, setIsSwitchingToAdmin] = useState(false)
  const [manuallyAuthenticated, setManuallyAuthenticated] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, status } = useSession()

  const isStorefront = pathname.startsWith('/admin/storefront')

  const isCheckingAuth = status === "loading"
  const isAdmin = (session?.user as any)?.role?.toLowerCase() === "admin"
  const isAuthenticated = (status === "authenticated" && isAdmin) || manuallyAuthenticated

  const handleSwitchStorefront = () => {
    setIsSwitchingToStorefront(true)
    setTimeout(() => {
      router.push('/admin/storefront')
      setTimeout(() => setIsSwitchingToStorefront(false), 500)
    }, 1500)
  }

  const handleSwitchAdmin = () => {
    setIsSwitchingToAdmin(true)
    setTimeout(() => {
      router.push('/admin')
      setTimeout(() => setIsSwitchingToAdmin(false), 500)
    }, 1500)
  }

  const handleLoginSuccess = () => {
    setManuallyAuthenticated(true)
  }

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#050000] flex items-center justify-center text-white">
        <div className="w-8 h-8 border-4 border-white/20 border-t-[#C52A35] rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#050000] text-foreground overflow-hidden relative">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#7A1111]/20 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#550000]/30 blur-[120px] pointer-events-none" />
        <LoginScreen onSuccess={handleLoginSuccess} />
      </div>
    )
  }

  return (
    <div className={`min-h-screen flex overflow-hidden admin-smooth-transition ${isLight ? 'admin-light bg-[#f6f7fb] text-slate-900' : 'bg-background text-foreground'}`}>
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar Wrapper */}
      {!isStorefront && (
        <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:block ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <Sidebar onClose={() => setIsSidebarOpen(false)} onSwitchStorefront={handleSwitchStorefront} />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative w-full admin-smooth-transition">
        {/* Subtle background glow effect behind content */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#7A1111]/20 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#550000]/30 blur-[120px] pointer-events-none" />
        
        {!isStorefront ? (
          <Header 
            onMenuClick={() => setIsSidebarOpen(true)} 
            onNotificationClick={() => setIsNotificationOpen(true)} 
          />
        ) : (
          <StorefrontHeader onMenuClick={() => setIsSidebarOpen(true)} onExitBuilder={handleSwitchAdmin} />
        )}
        
        <main 
          className="flex-1 overflow-y-auto z-10 custom-scrollbar transform-gpu" 
          style={{ willChange: 'scroll-position', scrollBehavior: 'smooth' }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="h-full min-h-full px-4 md:px-6 lg:px-8"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Full screen loading overlay for storefront/admin transition */}
      <AnimatePresence>
        {(isSwitchingToStorefront || isSwitchingToAdmin) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.5, ease: 'easeInOut' } }}
            className="fixed inset-0 z-[100] bg-[#050000] flex flex-col items-center justify-center text-white overflow-hidden"
          >
            {/* Background Glow */}
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1.5, opacity: 0.15 }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
              className="absolute w-[600px] h-[600px] bg-[#C52A35] rounded-full blur-[150px] pointer-events-none"
            />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 20 }}
              className="flex flex-col items-center relative z-10"
            >
              {/* Modern Loader */}
              <div className="relative w-24 h-24 mb-10 flex items-center justify-center">
                {/* Outer rotating ring */}
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full border border-white/5 border-t-[#C52A35]/80 shadow-[0_0_30px_rgba(197,42,53,0.3)]"
                />
                {/* Inner counter-rotating ring */}
                <motion.div 
                  animate={{ rotate: -360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-2 rounded-full border border-white/5 border-b-white/80"
                />
                {/* Icon */}
                <LayoutDashboard className="w-8 h-8 text-white/90" />
              </div>

              <h2 className="text-3xl font-extrabold tracking-tight mb-3 bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">
                {isSwitchingToAdmin ? 'Admin Dashboard' : 'Storefront Builder'}
              </h2>
              
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-3"
              >
                <div className="flex gap-1">
                  <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0 }} className="w-1.5 h-1.5 rounded-full bg-[#C52A35]" />
                  <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-[#C52A35]" />
                  <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-[#C52A35]" />
                </div>
                <p className="text-sm text-white/60 font-medium uppercase tracking-widest">
                  {isSwitchingToAdmin ? 'Loading Sales Overview' : 'Initializing Workspace'}
                </p>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Right-side Slide-over Notification Panel */}
      <NotificationDrawer 
        isOpen={isNotificationOpen} 
        onClose={() => setIsNotificationOpen(false)} 
      />
    </div>
  )
}
