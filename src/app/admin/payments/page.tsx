"use client"

import React, { useState, useEffect } from 'react'
import { CreditCard, Settings, Link as LinkIcon, Unlink, Plus, CheckCircle2, DollarSign, Wallet, ShieldCheck, Lock } from 'lucide-react'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { cn } from '@/lib/utils'

const paymentsData = [
  { 
    id: 'PAY-01', 
    name: 'Cash on Delivery (COD)', 
    description: 'Allow customers to pay in cash upon receiving their order.',
    status: 'Active', 
    color: 'from-emerald-500/20 to-teal-500/20',
    iconColor: 'text-emerald-500',
    border: 'border-emerald-500/20',
    icon: Wallet,
    badges: ['Default']
  },
  { 
    id: 'PAY-02', 
    name: 'bKash / Nagad', 
    description: 'Accept payments via popular mobile banking services in Bangladesh.',
    status: 'Coming Soon', 
    color: 'from-pink-500/20 to-rose-500/20',
    iconColor: 'text-pink-500',
    border: 'border-pink-500/20',
    icon: PhoneIcon, // Custom icon wrapper below
    badges: ['Automatic Payment']
  },
  { 
    id: 'PAY-03', 
    name: 'SSLCommerz', 
    description: 'Largest payment gateway in BD. Accept cards, MFS, and net banking.',
    status: 'Coming Soon', 
    color: 'from-blue-600/20 to-indigo-700/20',
    iconColor: 'text-blue-500',
    border: 'border-blue-500/20',
    icon: ShieldCheck,
    badges: ['Automatic Payment', 'Cards']
  },
  { 
    id: 'PAY-04', 
    name: 'Stripe', 
    description: 'Accept international credit and debit cards securely.',
    status: 'Coming Soon', 
    color: 'from-purple-500/20 to-indigo-500/20',
    iconColor: 'text-purple-500',
    border: 'border-purple-500/20',
    icon: CreditCard,
    badges: ['Automatic Payment', 'International']
  }
]

// Helper icon
function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/>
    </svg>
  )
}

export default function PaymentsPage() {
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-card rounded-3xl p-6 h-[250px] animate-pulse bg-white/5" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 pt-4 pb-6">
      {/* Page Header */}
      <ScrollReveal delay={0.1}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Payment Methods</h1>
            <p className="text-white/60 text-sm">Configure how you want to accept payments from your customers.</p>
          </div>
        </div>
      </ScrollReveal>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-2">
        {paymentsData.map((payment, index) => (
          <ScrollReveal key={payment.id} delay={0.15 + (index * 0.1)}>
            <div className={cn(
              "glass-card rounded-3xl p-6 relative overflow-hidden group transition-all h-full flex flex-col",
              payment.status === 'Active' ? "border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.05)]" : "border-white/5 opacity-80"
            )}>
              {/* Background gradient blur */}
              <div className={cn(
                "absolute top-0 right-0 w-32 h-32 bg-gradient-to-br rounded-full blur-[50px] opacity-20 transition-opacity",
                payment.status === 'Active' ? "opacity-30" : "group-hover:opacity-30",
                payment.color
              )} />

              <div className="relative z-10 flex flex-col h-full">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center border bg-white/5",
                    payment.border
                  )}>
                    <payment.icon className={cn("w-6 h-6", payment.iconColor)} />
                  </div>
                  
                  <span className={cn(
                    "px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider border flex items-center gap-1.5",
                    payment.status === 'Active' 
                      ? "text-emerald-400/90 border-emerald-400/20 bg-emerald-400/10" 
                      : "text-white/50 border-white/10 bg-white/5"
                  )}>
                    {payment.status === 'Active' ? <CheckCircle2 className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                    {payment.status}
                  </span>
                </div>

                {/* Details */}
                <h3 className="text-lg font-medium text-white mb-1 flex items-center gap-2">
                  {payment.name}
                </h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  {payment.badges.map((badge, i) => (
                    <span key={i} className="text-[10px] font-medium px-2 py-0.5 rounded bg-white/10 text-white/60">
                      {badge}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-white/50 line-clamp-2 mb-6 flex-grow">{payment.description}</p>

                {/* Actions */}
                <div className="flex items-center gap-3 mt-auto">
                  {payment.status === 'Active' ? (
                    <>
                      <button className="flex-1 flex items-center justify-center gap-2 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-medium text-white transition-colors">
                        <Settings className="w-4 h-4" />
                        Configure
                      </button>
                      <div className="h-10 px-4 flex items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 text-sm font-medium border border-emerald-500/20">
                        Enabled
                      </div>
                    </>
                  ) : (
                    <button disabled className="w-full flex items-center justify-center gap-2 h-10 rounded-xl bg-white/5 text-sm font-medium text-white/40 cursor-not-allowed border border-white/5">
                      <Settings className="w-4 h-4" />
                      Configure (Coming Soon)
                    </button>
                  )}
                </div>
              </div>
            </div>
          </ScrollReveal>
        ))}

        {/* Request Feature Card */}
        <ScrollReveal delay={0.55}>
          <div className="glass-card rounded-3xl p-6 border-dashed border-white/10 hover:border-white/30 transition-colors flex flex-col items-center justify-center text-center h-full min-h-[250px] group cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Plus className="w-5 h-5 text-white/50 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-base font-medium text-white mb-2">Need another Gateway?</h3>
            <p className="text-sm text-white/50 max-w-[200px]">Request integration for other local or international payment methods.</p>
          </div>
        </ScrollReveal>
      </div>
    </div>
  )
}
