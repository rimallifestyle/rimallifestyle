"use client"

import React, { useState, useEffect } from 'react'
import { BarChart, Calendar, Download, TrendingUp, TrendingDown, Package, ShoppingCart, Users, DollarSign, Filter, MousePointerClick } from 'lucide-react'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { cn } from '@/lib/utils'

// Mock Data
const topProducts = [
  { id: '1', name: 'Premium Wireless Headphones', category: 'Electronics', sales: 145, revenue: '৳ 6,52,500', trend: '+12%' },
  { id: '2', name: 'Smart Watch Series 7', category: 'Accessories', sales: 98, revenue: '৳ 3,43,000', trend: '+5%' },
  { id: '3', name: 'Leather Wallet Classic', category: 'Fashion', sales: 85, revenue: '৳ 1,27,500', trend: '-2%' },
  { id: '4', name: 'Mechanical Keyboard X', category: 'Electronics', sales: 64, revenue: '৳ 2,56,000', trend: '+18%' },
  { id: '5', name: 'Running Shoes Ultralight', category: 'Footwear', sales: 42, revenue: '৳ 1,47,000', trend: '+8%' },
]

export default function ReportsPage() {
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
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
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-2 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Analytics & Reports</h1>
            <p className="text-white/60 text-sm">Detailed insights into your store's performance and growth.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1">
              {['Today', '7 Days', '30 Days', '12 Months'].map((range, i) => (
                <button 
                  key={range}
                  className={cn(
                    "px-4 py-1.5 text-sm font-medium rounded-lg transition-colors",
                    i === 2 ? "bg-white/10 text-white shadow-sm" : "text-white/50 hover:text-white hover:bg-white/5"
                  )}
                >
                  {range}
                </button>
              ))}
            </div>
            
            <button className="flex items-center gap-2 h-10 px-4 rounded-xl bg-white/5 text-sm font-medium text-white hover:bg-white/10 border border-white/10 transition-all">
              <Calendar className="w-4 h-4" />
              Custom
            </button>
            <button className="flex items-center gap-2 h-10 px-6 rounded-xl bg-gradient-to-r from-[#7A1111] to-[#550000] text-sm font-medium text-white hover:shadow-[0_0_20px_rgba(122,17,17,0.4)] transition-all">
              <Download className="w-4 h-4" />
              Export PDF
            </button>
          </div>
        </div>
      </ScrollReveal>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Total Revenue', value: '৳ 24,56,800', change: '+14.5%', isUp: true, icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { title: 'Total Orders', value: '1,245', change: '+8.2%', isUp: true, icon: ShoppingCart, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { title: 'Average Order Value', value: '৳ 1,973', change: '-2.4%', isUp: false, icon: Filter, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { title: 'Store Conversion Rate', value: '3.24%', change: '+1.1%', isUp: true, icon: MousePointerClick, color: 'text-purple-400', bg: 'bg-purple-500/10' }
        ].map((kpi, idx) => (
          <ScrollReveal key={idx} delay={0.15 + (idx * 0.1)}>
            <div className="glass-card rounded-3xl p-6 relative overflow-hidden group hover:border-white/20 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", kpi.bg)}>
                  <kpi.icon className={cn("w-5 h-5", kpi.color)} />
                </div>
                <span className={cn(
                  "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full border",
                  kpi.isUp ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" : "text-red-400 bg-red-400/10 border-red-400/20"
                )}>
                  {kpi.isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {kpi.change}
                </span>
              </div>
              <p className="text-sm font-medium text-white/50 mb-1">{kpi.title}</p>
              <h3 className="text-2xl font-bold text-white">{kpi.value}</h3>
            </div>
          </ScrollReveal>
        ))}
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sales Trend Chart (CSS Mockup) */}
        <div className="lg:col-span-2">
          <ScrollReveal delay={0.5} direction="left" className="h-full">
            <div className="glass-card rounded-3xl p-6 h-full flex flex-col relative overflow-hidden">
              {/* Background gradient for modern feel */}
              <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#550000]/20 rounded-full blur-[100px] pointer-events-none" />

              <div className="flex items-center justify-between mb-8 relative z-10">
                <div>
                  <h2 className="text-lg font-medium text-white mb-1">Sales Trend</h2>
                  <p className="text-sm text-white/50">Revenue performance over the last 30 days</p>
                </div>
              </div>

              {/* CSS Line Chart Area Simulation */}
              <div className="flex-1 min-h-[250px] relative w-full border-b border-l border-white/10 pb-2 pl-2">
                {/* Y-axis labels */}
                <div className="absolute left-[-40px] inset-y-0 flex flex-col justify-between text-[10px] text-white/40 pb-6 h-[calc(100%-24px)]">
                  <span>100k</span>
                  <span>75k</span>
                  <span>50k</span>
                  <span>25k</span>
                  <span>0</span>
                </div>
                
                {/* Horizontal Grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-6 h-[calc(100%-24px)] ml-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="w-full h-px bg-white/5" />
                  ))}
                </div>

                {/* Simulated Line (SVG) */}
                <svg className="absolute inset-0 w-full h-[calc(100%-30px)] ml-2 overflow-visible" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(197, 42, 53, 0.4)" />
                      <stop offset="100%" stopColor="rgba(197, 42, 53, 0)" />
                    </linearGradient>
                  </defs>
                  
                  {/* Filled area under line */}
                  <path 
                    d="M 0 200 L 10% 180 L 20% 120 L 30% 140 L 40% 90 L 50% 150 L 60% 100 L 70% 60 L 80% 80 L 90% 40 L 100% 20 L 100% 250 L 0 250 Z" 
                    fill="url(#lineGrad)" 
                  />
                  
                  {/* The Line */}
                  <path 
                    d="M 0 200 L 10% 180 L 20% 120 L 30% 140 L 40% 90 L 50% 150 L 60% 100 L 70% 60 L 80% 80 L 90% 40 L 100% 20" 
                    fill="none" 
                    stroke="#C52A35" 
                    strokeWidth="3" 
                    className="drop-shadow-[0_0_8px_rgba(197,42,53,0.8)]"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  
                  {/* Data points (dots) */}
                  {[
                    { x: "10%", y: 180 }, { x: "20%", y: 120 }, { x: "30%", y: 140 }, 
                    { x: "40%", y: 90 }, { x: "50%", y: 150 }, { x: "60%", y: 100 }, 
                    { x: "70%", y: 60 }, { x: "80%", y: 80 }, { x: "90%", y: 40 }, { x: "100%", y: 20 }
                  ].map((pt, i) => (
                    <circle key={i} cx={pt.x} cy={pt.y} r="4" fill="#fff" stroke="#C52A35" strokeWidth="2" className="hover:r-[6px] transition-all cursor-pointer" />
                  ))}
                </svg>

                {/* X-axis labels */}
                <div className="absolute bottom-[-20px] left-2 right-0 flex justify-between text-[10px] text-white/40">
                  <span>1 Aug</span>
                  <span>5 Aug</span>
                  <span>10 Aug</span>
                  <span>15 Aug</span>
                  <span>20 Aug</span>
                  <span>25 Aug</span>
                  <span>30 Aug</span>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Category Breakdown */}
        <div className="lg:col-span-1 space-y-6">
          <ScrollReveal delay={0.6} direction="right" className="h-full">
            <div className="glass-card rounded-3xl p-6 h-full">
              <h2 className="text-lg font-medium text-white mb-6">Sales by Category</h2>
              
              <div className="space-y-5">
                {[
                  { name: 'Electronics', percentage: 45, amount: '৳ 11,05,500', color: 'from-blue-500 to-indigo-500' },
                  { name: 'Fashion & Apparel', percentage: 28, amount: '৳ 6,87,900', color: 'from-pink-500 to-rose-500' },
                  { name: 'Accessories', percentage: 15, amount: '৳ 3,68,500', color: 'from-amber-500 to-orange-500' },
                  { name: 'Home & Living', percentage: 8, amount: '৳ 1,96,500', color: 'from-emerald-500 to-teal-500' },
                  { name: 'Others', percentage: 4, amount: '৳ 98,400', color: 'from-slate-400 to-slate-500' },
                ].map((cat, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-white/80">{cat.name}</span>
                      <span className="font-bold text-white">{cat.percentage}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                      <div 
                        className={cn("h-full bg-gradient-to-r rounded-full", cat.color)}
                        style={{ width: `${cat.percentage}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-white/40 text-right">{cat.amount}</p>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* Top Products Table */}
      <ScrollReveal delay={0.7} direction="up">
        <div className="glass-card rounded-3xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-medium text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-[#C52A35]" />
                Top Performing Products
              </h2>
              <p className="text-sm text-white/50 mt-1">Based on net revenue in the selected date range.</p>
            </div>
            <button className="text-sm font-medium text-[#C52A35] hover:text-white transition-colors">
              View Inventory
            </button>
          </div>

          <div className="w-full overflow-x-auto custom-scrollbar">
            <table className="w-full text-left min-w-[800px] border-separate" style={{ borderSpacing: '0 4px' }}>
              <thead>
                <tr>
                  <th className="pb-3 text-sm font-medium text-white/50 pl-4 border-b border-white/10">Product Details</th>
                  <th className="pb-3 text-sm font-medium text-white/50 border-b border-white/10">Category</th>
                  <th className="pb-3 text-sm font-medium text-white/50 border-b border-white/10 text-center">Items Sold</th>
                  <th className="pb-3 text-sm font-medium text-white/50 border-b border-white/10 text-right">Net Revenue</th>
                  <th className="pb-3 text-sm font-medium text-white/50 border-b border-white/10 text-right pr-4">Trend</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((product) => (
                  <tr key={product.id} className="group hover:bg-white/5 transition-colors cursor-pointer">
                    <td className="py-4 pl-4 rounded-l-2xl border-b border-white/5 group-hover:border-transparent">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-bold text-white/30 text-lg">
                          {product.id}
                        </div>
                        <p className="text-sm font-medium text-white group-hover:text-[#C52A35] transition-colors">{product.name}</p>
                      </div>
                    </td>
                    <td className="py-4 text-sm text-white/70 border-b border-white/5 group-hover:border-transparent">
                      {product.category}
                    </td>
                    <td className="py-4 text-sm font-medium text-white border-b border-white/5 group-hover:border-transparent text-center">
                      {product.sales}
                    </td>
                    <td className="py-4 text-sm font-bold text-white border-b border-white/5 group-hover:border-transparent text-right">
                      {product.revenue}
                    </td>
                    <td className="py-4 pr-4 rounded-r-2xl border-b border-white/5 group-hover:border-transparent text-right">
                      <span className={cn(
                        "text-xs font-medium px-2 py-1 rounded bg-white/5",
                        product.trend.startsWith('+') ? "text-emerald-400" : "text-red-400"
                      )}>
                        {product.trend}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </ScrollReveal>
    </div>
  )
}
