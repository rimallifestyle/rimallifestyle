"use client"

import React, { useState, useEffect } from 'react'
import { Truck, Search, Filter, Settings, Link as LinkIcon, Unlink, ExternalLink, Key, Plus, CheckCircle2 } from 'lucide-react'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { cn } from '@/lib/utils'

const couriersData = [
  { 
    id: 'COUR-01', 
    name: 'Pathao Courier', 
    description: 'Fastest delivery service in Bangladesh with extensive API support.',
    status: 'Connected', 
    color: 'from-red-500/20 to-rose-500/20',
    iconColor: 'text-rose-500',
    border: 'border-rose-500/20',
    stats: { deliveries: 145, successRate: '98%' }
  },
  { 
    id: 'COUR-02', 
    name: 'Steadfast Courier', 
    description: 'Reliable and cost-effective eCommerce delivery partner.',
    status: 'Connected', 
    color: 'from-emerald-500/20 to-teal-500/20',
    iconColor: 'text-emerald-500',
    border: 'border-emerald-500/20',
    stats: { deliveries: 320, successRate: '95%' }
  },
  { 
    id: 'COUR-03', 
    name: 'RedX', 
    description: 'Tech-first logistics company for hassle-free parcel delivery.',
    status: 'Disconnected', 
    color: 'from-red-600/20 to-red-700/20',
    iconColor: 'text-red-500',
    border: 'border-red-500/20'
  },
  { 
    id: 'COUR-04', 
    name: 'eCourier', 
    description: '360 degree logistics support with realtime tracking.',
    status: 'Disconnected', 
    color: 'from-blue-500/20 to-cyan-500/20',
    iconColor: 'text-blue-500',
    border: 'border-blue-500/20'
  },
  { 
    id: 'COUR-05', 
    name: 'Paperfly', 
    description: 'Strongest delivery network reaching any doorstep in BD.',
    status: 'Disconnected', 
    color: 'from-amber-500/20 to-yellow-500/20',
    iconColor: 'text-amber-500',
    border: 'border-amber-500/20'
  },
]

export default function CouriersPage() {
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
          {[1, 2, 3, 4, 5].map((i) => (
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
            <h1 className="text-2xl font-bold text-white mb-1">Couriers & API Integrations</h1>
            <p className="text-white/60 text-sm">Connect and manage BD courier APIs for automated shipping and tracking.</p>
          </div>
          
          <button className="flex items-center gap-2 h-10 px-6 rounded-full bg-white/5 text-sm font-medium text-white hover:bg-white/10 border border-white/10 transition-all">
            <Plus className="w-4 h-4" />
            Request New Courier
          </button>
        </div>
      </ScrollReveal>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-2">
        {couriersData.map((courier, index) => (
          <ScrollReveal key={courier.id} delay={0.15 + (index * 0.1)}>
            <div className={cn(
              "glass-card rounded-3xl p-6 relative overflow-hidden group hover:border-white/20 transition-all",
              courier.status === 'Connected' ? "border-white/10" : "border-white/5"
            )}>
              {/* Background gradient blur */}
              <div className={cn(
                "absolute top-0 right-0 w-32 h-32 bg-gradient-to-br rounded-full blur-[50px] opacity-20 group-hover:opacity-40 transition-opacity",
                courier.color
              )} />

              <div className="relative z-10 flex flex-col h-full">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center border bg-white/5",
                    courier.border
                  )}>
                    <Truck className={cn("w-6 h-6", courier.iconColor)} />
                  </div>
                  
                  <span className={cn(
                    "px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider border flex items-center gap-1.5",
                    courier.status === 'Connected' 
                      ? "text-emerald-400/90 border-emerald-400/20 bg-emerald-400/10" 
                      : "text-white/50 border-white/10 bg-white/5"
                  )}>
                    {courier.status === 'Connected' ? <LinkIcon className="w-3 h-3" /> : <Unlink className="w-3 h-3" />}
                    {courier.status}
                  </span>
                </div>

                {/* Details */}
                <h3 className="text-lg font-medium text-white mb-1">{courier.name}</h3>
                <p className="text-sm text-white/50 line-clamp-2 mb-6 flex-grow">{courier.description}</p>

                {/* Connected Stats */}
                {courier.status === 'Connected' && courier.stats && (
                  <div className="grid grid-cols-2 gap-2 mb-6 p-3 rounded-xl bg-white/5 border border-white/5">
                    <div>
                      <p className="text-xs text-white/40 mb-0.5">This Month</p>
                      <p className="text-sm font-medium text-white">{courier.stats.deliveries} Orders</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/40 mb-0.5">Success Rate</p>
                      <p className="text-sm font-medium text-emerald-400">{courier.stats.successRate}</p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-3 mt-auto">
                  {courier.status === 'Connected' ? (
                    <>
                      <button className="flex-1 flex items-center justify-center gap-2 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-medium text-white transition-colors">
                        <Settings className="w-4 h-4" />
                        Configure
                      </button>
                      <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors" title="Disconnect API">
                        <Unlink className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <button className="w-full flex items-center justify-center gap-2 h-10 rounded-xl bg-gradient-to-r from-[#7A1111] to-[#550000] text-sm font-medium text-white hover:shadow-[0_0_20px_rgba(122,17,17,0.4)] transition-all">
                      <Key className="w-4 h-4" />
                      Connect API
                    </button>
                  )}
                </div>
              </div>
            </div>
          </ScrollReveal>
        ))}

        {/* Setup Guide Card */}
        <ScrollReveal delay={0.65}>
          <div className="glass-card rounded-3xl p-6 border-dashed border-white/20 hover:border-white/40 transition-colors flex flex-col items-center justify-center text-center h-full min-h-[250px] group cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <ExternalLink className="w-5 h-5 text-white/50 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-base font-medium text-white mb-2">How to get API Keys?</h3>
            <p className="text-sm text-white/50 max-w-[200px]">Read our documentation on how to collect API keys from BD couriers.</p>
          </div>
        </ScrollReveal>
      </div>
    </div>
  )
}
