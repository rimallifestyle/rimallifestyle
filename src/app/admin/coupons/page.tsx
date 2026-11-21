"use client"

import React, { useState, useEffect } from 'react'
import { Ticket, Plus, Search, Edit, Trash2, MoreHorizontal, Calendar, Percent, CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { cn } from '@/lib/utils'

const couponsData = [
  { id: 'CPN-01', code: 'SUMMER50', type: 'Percentage', amount: '50%', description: 'Summer clearance sale', usage: 45, limit: 100, expiry: 'Aug 30, 2026', status: 'Active' },
  { id: 'CPN-02', code: 'WELCOME20', type: 'Percentage', amount: '20%', description: 'New user registration', usage: 124, limit: '∞', expiry: 'Never', status: 'Active' },
  { id: 'CPN-03', code: 'FLAT500', type: 'Fixed Cart', amount: '৳ 500', description: 'Flat discount on orders over 5k', usage: 12, limit: 50, expiry: 'Sep 15, 2026', status: 'Active' },
  { id: 'CPN-04', code: 'WINTER30', type: 'Percentage', amount: '30%', description: 'Winter pre-sale', usage: 0, limit: 200, expiry: 'Nov 01, 2026', status: 'Scheduled' },
  { id: 'CPN-05', code: 'FLASH1000', type: 'Fixed Cart', amount: '৳ 1,000', description: 'Flash sale 1 hour', usage: 50, limit: 50, expiry: 'Aug 10, 2026', status: 'Expired' },
]

export default function CouponsPage() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  const getStatusConfig = (status: string) => {
    switch(status) {
      case 'Active': return { color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20', icon: CheckCircle2 }
      case 'Scheduled': return { color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20', icon: Clock }
      case 'Expired': return { color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20', icon: AlertCircle }
      default: return { color: 'text-white/70', bg: 'bg-white/10', border: 'border-white/20', icon: Clock }
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 pt-4 pb-6">
        <div className="mb-2 space-y-2">
          <div className="h-8 w-48 rounded-md bg-white/10 animate-pulse" />
          <div className="h-4 w-96 rounded-md bg-white/10 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4">
          <div className="lg:col-span-4">
            <div className="glass-card rounded-3xl p-6 h-[550px] animate-pulse bg-white/5" />
          </div>
          <div className="lg:col-span-8">
            <TableSkeleton />
          </div>
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
            <h1 className="text-2xl font-bold text-white mb-1">Coupons</h1>
            <p className="text-white/60 text-sm">Create and manage discount codes for your customers.</p>
          </div>
          
          <button className="flex items-center gap-2 h-10 px-6 rounded-full bg-white/5 text-sm font-medium text-white hover:bg-white/10 border border-white/10 transition-all sm:hidden">
            <Plus className="w-4 h-4" />
            Add New
          </button>
        </div>
      </ScrollReveal>

      {/* Main Content Grid: Split layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Add New Coupon Form */}
        <div className="lg:col-span-4">
          <ScrollReveal delay={0.2} direction="left">
            <div className="glass-card rounded-3xl p-6 sticky top-6">
              <h2 className="text-lg font-medium text-white mb-6 flex items-center gap-2">
                <Ticket className="w-5 h-5 text-[#C52A35]" />
                Add New Coupon
              </h2>

              <form className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-white/80">Coupon Code</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="e.g., SUMMER50" 
                      className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-[#C52A35]/50 focus:bg-white/10 transition-all uppercase"
                    />
                    <button type="button" className="px-4 h-11 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-medium border border-white/10 whitespace-nowrap transition-colors">
                      Generate
                    </button>
                  </div>
                  <p className="text-xs text-white/40">Customers will enter this code at checkout.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-white/80">Discount Type</label>
                  <select className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-[#C52A35]/50 focus:bg-white/10 transition-all appearance-none cursor-pointer">
                    <option value="percentage" className="bg-[#1a0505]">Percentage discount</option>
                    <option value="fixed_cart" className="bg-[#1a0505]">Fixed cart discount</option>
                    <option value="fixed_product" className="bg-[#1a0505]">Fixed product discount</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-white/80">Coupon Amount</label>
                  <div className="relative group">
                    <Percent className="w-4 h-4 text-white/50 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-white transition-colors" />
                    <input 
                      type="number" 
                      placeholder="e.g., 50" 
                      className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-[#C52A35]/50 focus:bg-white/10 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-white/80">Expiry Date</label>
                  <div className="relative group">
                    <Calendar className="w-4 h-4 text-white/50 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-white transition-colors" />
                    <input 
                      type="date" 
                      className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-[#C52A35]/50 focus:bg-white/10 transition-all [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-50 hover:[&::-webkit-calendar-picker-indicator]:opacity-100 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-white/80">Usage Limit</label>
                  <input 
                    type="number" 
                    placeholder="e.g., 100 (Leave blank for unlimited)" 
                    className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-[#C52A35]/50 focus:bg-white/10 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-white/80">Description</label>
                  <textarea 
                    rows={2}
                    placeholder="Internal note about this coupon..."
                    className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-[#C52A35]/50 focus:bg-white/10 transition-all custom-scrollbar resize-none"
                  ></textarea>
                </div>

                <button type="button" className="w-full flex items-center justify-center gap-2 h-11 mt-6 rounded-xl bg-gradient-to-r from-[#7A1111] to-[#550000] text-sm font-medium text-white hover:shadow-[0_0_20px_rgba(122,17,17,0.4)] transition-all">
                  <Plus className="w-4 h-4" />
                  Create Coupon
                </button>
              </form>
            </div>
          </ScrollReveal>
        </div>

        {/* Right Side: Coupons Table */}
        <div className="lg:col-span-8">
          <ScrollReveal delay={0.3} direction="right">
            <div className="glass-card rounded-3xl p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                <div className="relative group w-full sm:w-auto">
                  <Search className="w-4 h-4 text-white/50 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-white transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Search coupons..." 
                    className="w-full sm:w-72 h-10 pl-10 pr-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 focus:bg-white/10 transition-all"
                  />
                </div>
              </div>

              <div className="w-full overflow-x-auto custom-scrollbar">
                <table className="w-full text-left min-w-[850px] border-separate" style={{ borderSpacing: '0 4px' }}>
                  <thead>
                    <tr>
                      <th className="pb-3 text-sm font-medium text-white/50 pl-4 border-b border-white/10">Code</th>
                      <th className="pb-3 text-sm font-medium text-white/50 border-b border-white/10">Type & Amount</th>
                      <th className="pb-3 text-sm font-medium text-white/50 border-b border-white/10">Usage</th>
                      <th className="pb-3 text-sm font-medium text-white/50 border-b border-white/10">Expiry Date</th>
                      <th className="pb-3 text-sm font-medium text-white/50 border-b border-white/10">Status</th>
                      <th className="pb-3 text-sm font-medium text-white/50 text-right pr-4 border-b border-white/10">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {couponsData.map((coupon) => {
                      const statusConfig = getStatusConfig(coupon.status)
                      const StatusIcon = statusConfig.icon
                      
                      return (
                        <tr key={coupon.id} className="group cursor-pointer">
                          <td className="py-4 pl-4 rounded-l-2xl bg-transparent group-hover:bg-white/5 transition-colors border-b border-white/5 group-hover:border-transparent">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-[#C52A35]/10 border border-[#C52A35]/20 flex items-center justify-center flex-shrink-0 group-hover:bg-[#C52A35]/20 transition-colors relative overflow-hidden">
                                <Ticket className="w-5 h-5 text-[#C52A35]" />
                                {/* Jagged edges for ticket effect */}
                                <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#110505]" />
                                <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#110505]" />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-white group-hover:text-[#C52A35] transition-colors">{coupon.code}</p>
                                <p className="text-xs text-white/50 mt-0.5 truncate max-w-[150px]">{coupon.description}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 bg-transparent group-hover:bg-white/5 transition-colors border-b border-white/5 group-hover:border-transparent">
                            <p className="text-sm font-medium text-white">{coupon.amount}</p>
                            <p className="text-xs text-white/50">{coupon.type}</p>
                          </td>
                          <td className="py-4 bg-transparent group-hover:bg-white/5 transition-colors border-b border-white/5 group-hover:border-transparent">
                            <div className="flex flex-col gap-1">
                              <p className="text-sm text-white/70">{coupon.usage} / {coupon.limit}</p>
                              {coupon.limit !== '∞' && (
                                <div className="w-24 h-1.5 rounded-full bg-white/10 overflow-hidden">
                                  <div 
                                    className="h-full bg-gradient-to-r from-[#7A1111] to-[#C52A35]" 
                                    style={{ width: `${(coupon.usage / Number(coupon.limit)) * 100}%` }}
                                  />
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-4 text-sm text-white/70 bg-transparent group-hover:bg-white/5 transition-colors border-b border-white/5 group-hover:border-transparent">
                            {coupon.expiry}
                          </td>
                          <td className="py-4 bg-transparent group-hover:bg-white/5 transition-colors border-b border-white/5 group-hover:border-transparent">
                            <span className={cn(
                              "px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 w-fit border",
                              statusConfig.bg, statusConfig.color, statusConfig.border
                            )}>
                              <StatusIcon className="w-3.5 h-3.5" />
                              {coupon.status}
                            </span>
                          </td>
                          <td className="py-4 pr-4 rounded-r-2xl bg-transparent group-hover:bg-white/5 transition-colors border-b border-white/5 group-hover:border-transparent">
                            <div className="flex items-center justify-end gap-1">
                              <button className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-blue-400 transition-colors" title="Edit">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-red-400 transition-colors" title="Delete">
                                <Trash2 className="w-4 h-4" />
                              </button>
                              <button className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors">
                                <MoreHorizontal className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
                <p className="text-xs text-white/50">Showing 5 of 24 coupons</p>
                <div className="flex gap-1">
                  <button className="px-3 py-1 rounded-md bg-white/5 text-white/50 hover:bg-white/10 text-sm">Prev</button>
                  <button className="px-3 py-1 rounded-md bg-[#550000] text-white text-sm">1</button>
                  <button className="px-3 py-1 rounded-md bg-white/5 text-white/70 hover:bg-white/10 text-sm">2</button>
                  <button className="px-3 py-1 rounded-md bg-white/5 text-white/50 hover:bg-white/10 text-sm">Next</button>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </div>
  )
}
