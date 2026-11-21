"use client"

import React, { useState, useEffect } from 'react'
import { ShieldAlert, Search, Phone, User, MapPin, AlertTriangle, CheckCircle2, XCircle, Activity, Truck } from 'lucide-react'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { KpiSkeleton } from '@/components/ui/Skeleton'
import { cn } from '@/lib/utils'

export default function FraudCheckPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(true) // Set to true for demo purposes

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSearching(true)
    setTimeout(() => {
      setIsSearching(false)
      setHasSearched(true)
    }, 1500)
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 pt-4 pb-6">
        <div className="mb-2 space-y-2">
          <div className="h-8 w-48 rounded-md bg-white/10 animate-pulse" />
          <div className="h-4 w-96 rounded-md bg-white/10 animate-pulse" />
        </div>
        <div className="glass-card rounded-3xl p-6 h-32 animate-pulse bg-white/5 mt-4" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2">
          <div className="lg:col-span-1 glass-card rounded-3xl p-6 h-[400px] animate-pulse bg-white/5" />
          <div className="lg:col-span-2 glass-card rounded-3xl p-6 h-[400px] animate-pulse bg-white/5" />
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
            <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-amber-500" />
              Fraud Checker
            </h1>
            <p className="text-white/60 text-sm">Verify customer phone numbers against nationwide courier databases to prevent fake orders and returns.</p>
          </div>
        </div>
      </ScrollReveal>

      {/* Search Bar Section */}
      <ScrollReveal delay={0.2}>
        <div className="glass-card rounded-3xl p-6 relative overflow-hidden">
          {/* Background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-[500px] bg-amber-500/10 blur-[80px] rounded-full pointer-events-none" />
          
          <form onSubmit={handleSearch} className="relative z-10 flex flex-col sm:flex-row items-center gap-4 max-w-2xl mx-auto">
            <div className="relative w-full">
              <Phone className="w-5 h-5 text-white/50 absolute left-4 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Enter customer phone number (e.g. 017XXXXXXXX)" 
                className="w-full h-14 pl-12 pr-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:bg-white/10 transition-all text-lg tracking-wider"
                defaultValue="01712345678"
              />
            </div>
            <button 
              type="submit" 
              disabled={isSearching}
              className="w-full sm:w-auto h-14 px-8 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-medium hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isSearching ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Check History
                </>
              )}
            </button>
          </form>
        </div>
      </ScrollReveal>

      {/* Results Section */}
      {hasSearched && !isSearching && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Trust Score & Customer Info */}
          <div className="lg:col-span-1 space-y-6">
            <ScrollReveal delay={0.3} direction="left">
              <div className="glass-card rounded-3xl p-6 flex flex-col items-center text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/20 rounded-full blur-[50px]" />
                
                <h3 className="text-sm font-medium text-white/70 mb-6 uppercase tracking-wider w-full text-left">Trust Analysis</h3>
                
                {/* Circular Score display (Simulated) */}
                <div className="relative w-40 h-40 flex items-center justify-center mb-6">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="80" cy="80" r="70" className="stroke-white/10" strokeWidth="12" fill="none" />
                    <circle 
                      cx="80" cy="80" r="70" 
                      className="stroke-red-500" 
                      strokeWidth="12" 
                      fill="none" 
                      strokeDasharray="440" 
                      strokeDashoffset="308" /* 30% score = 440 - (440 * 0.3) = 308 */
                      strokeLinecap="round" 
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold text-white">30<span className="text-xl text-white/50">%</span></span>
                    <span className="text-[10px] text-red-400 font-bold uppercase tracking-widest mt-1">High Risk</span>
                  </div>
                </div>

                <div className="w-full space-y-4 text-left">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">High Return Rate</p>
                      <p className="text-xs text-white/50">Customer frequently returns parcels.</p>
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-center">
                    <p className="text-sm text-red-300 font-medium">Recommendation: Require Advance Payment (Delivery Charge) before shipping.</p>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.4} direction="left">
              <div className="glass-card rounded-3xl p-6">
                <h3 className="text-sm font-medium text-white/70 mb-4 uppercase tracking-wider">Identified As</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-white/80">
                    <User className="w-4 h-4 text-white/40" />
                    Alex Johnson / Alex J.
                  </div>
                  <div className="flex items-center gap-3 text-sm text-white/80">
                    <Phone className="w-4 h-4 text-white/40" />
                    01712345678
                  </div>
                  <div className="flex items-start gap-3 text-sm text-white/80">
                    <MapPin className="w-4 h-4 text-white/40 mt-0.5" />
                    <span className="flex-1">House 12, Road 5, Block C, Banani, Dhaka</span>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Right Column: Detailed Metrics & Network History */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <ScrollReveal delay={0.35} direction="up">
                <div className="glass-card rounded-2xl p-4 flex flex-col justify-center text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 rounded-full blur-[20px]" />
                  <p className="text-xs text-white/50 mb-1">Total Parcels</p>
                  <p className="text-2xl font-bold text-white">45</p>
                </div>
              </ScrollReveal>
              <ScrollReveal delay={0.45} direction="up">
                <div className="glass-card rounded-2xl p-4 flex flex-col justify-center text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-full blur-[20px]" />
                  <p className="text-xs text-white/50 mb-1">Delivered</p>
                  <p className="text-2xl font-bold text-emerald-400">14</p>
                </div>
              </ScrollReveal>
              <ScrollReveal delay={0.55} direction="up">
                <div className="glass-card rounded-2xl p-4 flex flex-col justify-center text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/10 rounded-full blur-[20px]" />
                  <p className="text-xs text-white/50 mb-1">Returned</p>
                  <p className="text-2xl font-bold text-red-400">28</p>
                </div>
              </ScrollReveal>
              <ScrollReveal delay={0.65} direction="up">
                <div className="glass-card rounded-2xl p-4 flex flex-col justify-center text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/10 rounded-full blur-[20px]" />
                  <p className="text-xs text-white/50 mb-1">Cancelled</p>
                  <p className="text-2xl font-bold text-amber-400">3</p>
                </div>
              </ScrollReveal>
            </div>

            {/* Network History */}
            <ScrollReveal delay={0.5} direction="right">
              <div className="glass-card rounded-3xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-400" />
                    Recent Courier Activity
                  </h3>
                  <span className="text-xs text-white/40">Data aggregated from Courier APIs</span>
                </div>

                <div className="space-y-4">
                  {[
                    { courier: 'Steadfast Courier', date: '2 days ago', status: 'Returned', reason: 'Customer refused to pay', icon: XCircle, color: 'text-red-400' },
                    { courier: 'Pathao Courier', date: '1 week ago', status: 'Returned', reason: 'Customer was unreachable', icon: XCircle, color: 'text-red-400' },
                    { courier: 'RedX', date: '3 weeks ago', status: 'Delivered', reason: 'Successfully delivered', icon: CheckCircle2, color: 'text-emerald-400' },
                    { courier: 'Steadfast Courier', date: '1 month ago', status: 'Cancelled', reason: 'Order cancelled by sender due to suspicious activity', icon: AlertTriangle, color: 'text-amber-400' },
                    { courier: 'Paperfly', date: '2 months ago', status: 'Returned', reason: 'Wrong address provided', icon: XCircle, color: 'text-red-400' },
                  ].map((activity, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Truck className="w-5 h-5 text-white/50" />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                          <p className="text-sm font-medium text-white">{activity.courier}</p>
                          <span className="text-xs text-white/40">{activity.date}</span>
                        </div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <activity.icon className={cn("w-3.5 h-3.5", activity.color)} />
                          <span className={cn("text-xs font-bold uppercase tracking-wider", activity.color)}>{activity.status}</span>
                        </div>
                        <p className="text-sm text-white/60">{activity.reason}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      )}
    </div>
  )
}
