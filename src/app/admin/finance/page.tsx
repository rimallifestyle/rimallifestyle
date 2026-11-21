"use client"

import React, { useState, useEffect } from 'react'
import { LineChart, DollarSign, ArrowUpRight, ArrowDownRight, CreditCard, Download, Filter, Wallet, FileText, Activity, TrendingUp, Plus, Phone } from 'lucide-react'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { KpiCard } from '@/components/admin/dashboard/KpiCard'
import { cn } from '@/lib/utils'

// Mock data for transactions
const transactionsData = [
  { id: 'TRX-9823', date: 'Today, 2:45 PM', type: 'Payment Received', orderId: 'ORD-7829', amount: '+ ৳ 12,500', status: 'Completed', method: 'Credit Card' },
  { id: 'TRX-9822', date: 'Today, 11:30 AM', type: 'Payment Received', orderId: 'ORD-7828', amount: '+ ৳ 4,200', status: 'Completed', method: 'bKash' },
  { id: 'TRX-9821', date: 'Yesterday', type: 'Refund Issued', orderId: 'ORD-7815', amount: '- ৳ 2,100', status: 'Processed', method: 'Nagad' },
  { id: 'TRX-9820', date: 'Aug 20, 2026', type: 'Courier Charge', orderId: 'Multiple', amount: '- ৳ 850', status: 'Deducted', method: 'Wallet' },
  { id: 'TRX-9819', date: 'Aug 19, 2026', type: 'Payout to Bank', orderId: 'Withdrawal', amount: '- ৳ 45,000', status: 'Pending', method: 'Bank Transfer' },
]

export default function FinancePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 pt-4 pb-6">
        <div className="mb-2 space-y-2">
          <div className="h-8 w-48 rounded-md bg-white/10 animate-pulse" />
          <div className="h-4 w-96 rounded-md bg-white/10 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-card rounded-3xl p-6 h-[120px] animate-pulse bg-white/5" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-card rounded-3xl p-6 h-[400px] animate-pulse bg-white/5" />
          <div className="lg:col-span-1 glass-card rounded-3xl p-6 h-[400px] animate-pulse bg-white/5" />
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
            <h1 className="text-2xl font-bold text-white mb-1">Financial Overview</h1>
            <p className="text-white/60 text-sm">Monitor your revenue, payouts, and transaction history.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 h-10 px-4 rounded-xl bg-white/5 text-sm font-medium text-white hover:bg-white/10 border border-white/10 transition-all">
              <Download className="w-4 h-4" />
              Export Report
            </button>
            <button className="flex items-center gap-2 h-10 px-6 rounded-xl bg-gradient-to-r from-[#7A1111] to-[#550000] text-sm font-medium text-white hover:shadow-[0_0_20px_rgba(122,17,17,0.4)] transition-all">
              <Wallet className="w-4 h-4" />
              Request Payout
            </button>
          </div>
        </div>
      </ScrollReveal>

      {/* Main KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ScrollReveal delay={0.15}>
          <div className="glass-card rounded-3xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-[30px] group-hover:bg-blue-500/20 transition-colors" />
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-blue-400" />
              </div>
              <span className="flex items-center gap-1 text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full border border-emerald-400/20">
                <ArrowUpRight className="w-3 h-3" />
                +12.5%
              </span>
            </div>
            <p className="text-sm font-medium text-white/50 mb-1 relative z-10">Available Balance</p>
            <h3 className="text-2xl font-bold text-white relative z-10">৳ 1,45,200</h3>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.25}>
          <div className="glass-card rounded-3xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-[30px] group-hover:bg-emerald-500/20 transition-colors" />
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="flex items-center gap-1 text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full border border-emerald-400/20">
                <ArrowUpRight className="w-3 h-3" />
                +8.2%
              </span>
            </div>
            <p className="text-sm font-medium text-white/50 mb-1 relative z-10">Gross Sales (This Month)</p>
            <h3 className="text-2xl font-bold text-white relative z-10">৳ 4,82,500</h3>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.35}>
          <div className="glass-card rounded-3xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-full blur-[30px] group-hover:bg-red-500/20 transition-colors" />
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                <ArrowDownRight className="w-5 h-5 text-red-400" />
              </div>
              <span className="flex items-center gap-1 text-xs font-medium text-red-400 bg-red-400/10 px-2 py-1 rounded-full border border-red-400/20">
                <ArrowUpRight className="w-3 h-3" />
                +2.4%
              </span>
            </div>
            <p className="text-sm font-medium text-white/50 mb-1 relative z-10">Total Refunds</p>
            <h3 className="text-2xl font-bold text-white relative z-10">৳ 12,400</h3>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.45}>
          <div className="glass-card rounded-3xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-[30px] group-hover:bg-amber-500/20 transition-colors" />
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Activity className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <p className="text-sm font-medium text-white/50 mb-1 relative z-10">Pending Payouts</p>
            <h3 className="text-2xl font-bold text-white relative z-10">৳ 45,000</h3>
          </div>
        </ScrollReveal>
      </div>

      {/* Charts & Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Revenue Chart (CSS Mockup) */}
        <div className="lg:col-span-2">
          <ScrollReveal delay={0.5} direction="left" className="h-full">
            <div className="glass-card rounded-3xl p-6 h-full flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-lg font-medium text-white mb-1">Revenue Analytics</h2>
                  <p className="text-sm text-white/50">Sales vs Refunds over the last 7 days</p>
                </div>
                <select className="h-9 px-3 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:bg-white/10">
                  <option className="bg-[#1a0505]">Last 7 Days</option>
                  <option className="bg-[#1a0505]">This Month</option>
                  <option className="bg-[#1a0505]">Last Month</option>
                </select>
              </div>

              {/* CSS Bar Chart Simulation */}
              <div className="flex-1 flex items-end justify-between gap-2 pt-10 pb-4 border-b border-white/10 relative">
                {/* Horizontal grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-full h-px bg-white/5" />
                  ))}
                </div>

                {/* Bars */}
                {[
                  { label: 'Mon', sales: 60, refund: 5 },
                  { label: 'Tue', sales: 80, refund: 10 },
                  { label: 'Wed', sales: 40, refund: 0 },
                  { label: 'Thu', sales: 100, refund: 15 },
                  { label: 'Fri', sales: 75, refund: 5 },
                  { label: 'Sat', sales: 110, refund: 20 },
                  { label: 'Sun', sales: 90, refund: 10 },
                ].map((day, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group z-10">
                    <div className="w-full max-w-[40px] flex justify-center items-end gap-1 h-48 relative">
                      {/* Tooltip */}
                      <div className="absolute -top-10 bg-[#550000] text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                        Sales: {day.sales}k<br/>Refunds: {day.refund}k
                      </div>
                      
                      {/* Sales Bar */}
                      <div 
                        className="w-1/2 bg-gradient-to-t from-[#550000] to-[#C52A35] rounded-t-sm group-hover:brightness-125 transition-all" 
                        style={{ height: `${day.sales}%` }}
                      />
                      {/* Refund Bar */}
                      <div 
                        className="w-1/2 bg-gradient-to-t from-white/10 to-white/30 rounded-t-sm group-hover:brightness-125 transition-all" 
                        style={{ height: `${day.refund}%` }}
                      />
                    </div>
                    <span className="text-xs text-white/50">{day.label}</span>
                  </div>
                ))}
              </div>
              
              {/* Legend */}
              <div className="flex items-center justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#C52A35]" />
                  <span className="text-sm text-white/70">Gross Sales</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-white/30" />
                  <span className="text-sm text-white/70">Refunds</span>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Payout Details & Quick Transfer */}
        <div className="lg:col-span-1 space-y-6">
          <ScrollReveal delay={0.6} direction="right">
            <div className="glass-card rounded-3xl p-6">
              <h2 className="text-lg font-medium text-white mb-6">Payment Methods</h2>
              
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-gradient-to-br from-blue-900/40 to-blue-600/20 border border-blue-500/20 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/20 rounded-full blur-[20px]" />
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div>
                      <p className="text-xs text-white/60 mb-1">Primary Bank</p>
                      <p className="text-sm font-medium text-white">Dutch-Bangla Bank</p>
                    </div>
                    <CreditCard className="w-5 h-5 text-blue-400" />
                  </div>
                  <p className="text-lg font-mono tracking-widest text-white/90 relative z-10">**** **** 4242</p>
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-br from-pink-900/40 to-pink-600/20 border border-pink-500/20 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-pink-500/20 rounded-full blur-[20px]" />
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div>
                      <p className="text-xs text-white/60 mb-1">Mobile Banking</p>
                      <p className="text-sm font-medium text-white">bKash Merchant</p>
                    </div>
                    <Phone className="w-5 h-5 text-pink-400" />
                  </div>
                  <p className="text-lg font-mono tracking-widest text-white/90 relative z-10">+880 1712-***456</p>
                </div>
                
                <button className="w-full py-3 rounded-xl border border-dashed border-white/20 text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 hover:border-white/40 transition-all flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add New Method
                </button>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <ScrollReveal delay={0.7} direction="up">
        <div className="glass-card rounded-3xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-lg font-medium text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#C52A35]" />
              Recent Transactions
            </h2>
            
            <div className="flex gap-2">
              <button className="flex items-center gap-2 h-9 px-4 rounded-lg bg-white/5 border border-white/10 text-sm text-white hover:bg-white/10 transition-colors">
                <Filter className="w-4 h-4" /> Filter
              </button>
            </div>
          </div>

          <div className="w-full overflow-x-auto custom-scrollbar">
            <table className="w-full text-left min-w-[800px] border-separate" style={{ borderSpacing: '0 4px' }}>
              <thead>
                <tr>
                  <th className="pb-3 text-sm font-medium text-white/50 pl-4 border-b border-white/10">Transaction ID</th>
                  <th className="pb-3 text-sm font-medium text-white/50 border-b border-white/10">Date</th>
                  <th className="pb-3 text-sm font-medium text-white/50 border-b border-white/10">Type & Order</th>
                  <th className="pb-3 text-sm font-medium text-white/50 border-b border-white/10">Method</th>
                  <th className="pb-3 text-sm font-medium text-white/50 border-b border-white/10 text-right pr-4">Amount</th>
                </tr>
              </thead>
              <tbody>
                {transactionsData.map((trx) => (
                  <tr key={trx.id} className="group cursor-pointer">
                    <td className="py-4 pl-4 rounded-l-2xl bg-transparent group-hover:bg-white/5 transition-colors border-b border-white/5 group-hover:border-transparent">
                      <p className="text-sm font-medium text-white group-hover:text-[#C52A35] transition-colors">{trx.id}</p>
                      <span className={cn(
                        "mt-1 px-2 py-0.5 rounded text-[10px] font-medium inline-block",
                        trx.status === 'Completed' || trx.status === 'Processed' ? "bg-emerald-400/10 text-emerald-400" :
                        trx.status === 'Pending' ? "bg-amber-400/10 text-amber-400" : "bg-red-400/10 text-red-400"
                      )}>
                        {trx.status}
                      </span>
                    </td>
                    <td className="py-4 text-sm text-white/70 bg-transparent group-hover:bg-white/5 transition-colors border-b border-white/5 group-hover:border-transparent">
                      {trx.date}
                    </td>
                    <td className="py-4 bg-transparent group-hover:bg-white/5 transition-colors border-b border-white/5 group-hover:border-transparent">
                      <p className="text-sm font-medium text-white">{trx.type}</p>
                      <p className="text-xs text-white/50">{trx.orderId}</p>
                    </td>
                    <td className="py-4 text-sm text-white/70 bg-transparent group-hover:bg-white/5 transition-colors border-b border-white/5 group-hover:border-transparent">
                      {trx.method}
                    </td>
                    <td className="py-4 pr-4 rounded-r-2xl bg-transparent group-hover:bg-white/5 transition-colors border-b border-white/5 group-hover:border-transparent text-right">
                      <p className={cn(
                        "text-sm font-bold",
                        trx.amount.startsWith('+') ? "text-emerald-400" : "text-white"
                      )}>
                        {trx.amount}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="flex items-center justify-center mt-4 pt-4 border-t border-white/10">
            <button className="text-sm font-medium text-white/50 hover:text-white transition-colors">
              View All Transactions
            </button>
          </div>
        </div>
      </ScrollReveal>
    </div>
  )
}
