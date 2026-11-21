"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ShoppingCart, Search, Filter, MoreHorizontal, Eye, Download, CreditCard, Banknote, Clock, CheckCircle2, AlertCircle, XCircle } from 'lucide-react'
import { KpiCard } from '@/components/admin/dashboard/KpiCard'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { KpiSkeleton, TableSkeleton } from '@/components/ui/Skeleton'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

export default function OrdersPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [orders, setOrders] = useState<any[]>([])

  useEffect(() => {
    async function loadOrders() {
      try {
        const res = await fetch('/api/admin/orders')
        if (res.ok) {
          const data = await res.json()
          setOrders(data)
        }
      } catch (err) {
        console.error("Failed to load orders", err)
      } finally {
        setIsLoading(false)
      }
    }
    loadOrders()
  }, [])

  const getStatusConfig = (status: string) => {
    const s = status?.toLowerCase() || '';
    switch(s) {
      case 'delivered': 
      case 'completed': return { color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20', icon: CheckCircle2 }
      case 'processing': return { color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20', icon: Clock }
      case 'pending':
      case 'on hold': return { color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20', icon: AlertCircle }
      case 'cancelled': return { color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20', icon: XCircle }
      default: return { color: 'text-white/70', bg: 'bg-white/10', border: 'border-white/20', icon: Clock }
    }
  }

  const getPaymentIcon = (method: string) => {
    if (!method) return <Banknote className="w-3.5 h-3.5" />
    if (method.toLowerCase().includes('card')) return <CreditCard className="w-3.5 h-3.5" />
    if (method.toLowerCase().includes('cash')) return <Banknote className="w-3.5 h-3.5" />
    return <div className="w-3.5 h-3.5 rounded-full border border-current flex items-center justify-center text-[8px] font-bold">৳</div>
  }

  // Calculate KPIs
  const totalOrders = orders.length;
  const processingCount = orders.filter(o => o.status === 'processing' || o.status === 'pending').length;
  const completedCount = orders.filter(o => o.status === 'delivered' || o.status === 'completed').length;
  const revenue = orders.reduce((acc, curr) => curr.status !== 'cancelled' ? acc + (curr.total || 0) : acc, 0);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 pt-4 pb-6">
        <div className="mb-2 space-y-2">
          <div className="h-8 w-48 rounded-md bg-white/10 animate-pulse" />
          <div className="h-4 w-96 rounded-md bg-white/10 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiSkeleton />
          <KpiSkeleton />
          <KpiSkeleton />
          <KpiSkeleton />
        </div>
        <TableSkeleton />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 pt-4 pb-6">
      {/* Page Header */}
      <ScrollReveal delay={0.1}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Orders</h1>
            <p className="text-white/60 text-sm">Manage and track all customer orders in one place.</p>
          </div>
          
          <button className="flex items-center gap-2 h-10 px-6 rounded-full bg-white/5 text-sm font-medium text-white hover:bg-white/10 border border-white/10 transition-all">
            <Download className="w-4 h-4" />
            Export Orders
          </button>
        </div>
      </ScrollReveal>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ScrollReveal delay={0.15}>
          <KpiCard title="Total Orders" value={totalOrders.toString()} change="All time" isPositive={true} comparison="" icon={<ShoppingCart className="w-5 h-5" />} />
        </ScrollReveal>
        <ScrollReveal delay={0.25}>
          <KpiCard title="Pending" value={processingCount.toString()} change="Action needed" isPositive={false} comparison="in queue" icon={<Clock className="w-5 h-5" />} />
        </ScrollReveal>
        <ScrollReveal delay={0.35}>
          <KpiCard title="Completed" value={completedCount.toString()} change={`${totalOrders > 0 ? Math.round((completedCount/totalOrders)*100) : 0}%`} isPositive={true} comparison="completion rate" icon={<CheckCircle2 className="w-5 h-5" />} />
        </ScrollReveal>
        <ScrollReveal delay={0.45}>
          <KpiCard title="Revenue" value={`৳${revenue.toLocaleString()}`} change="All time" isPositive={true} comparison="total gross" icon={<Banknote className="w-5 h-5" />} />
        </ScrollReveal>
      </div>

      {/* Orders Table */}
      <ScrollReveal delay={0.2}>
        <div className="glass-card rounded-3xl p-6 mt-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            <h2 className="text-lg font-medium text-white">Recent Orders</h2>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input 
                  type="text" 
                  placeholder="Search orders..." 
                  className="h-10 pl-9 pr-4 rounded-full bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/40 focus:outline-none focus:bg-white/10 transition-all w-full lg:w-64"
                />
              </div>
              <button className="flex items-center gap-2 h-10 px-4 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-sm text-white transition-all whitespace-nowrap">
                <Filter className="w-4 h-4" />
                Filter
              </button>
            </div>
          </div>

          <div className="w-full overflow-x-auto custom-scrollbar">
            <table className="w-full text-left min-w-[950px] border-separate" style={{ borderSpacing: '0 4px' }}>
              <thead>
                <tr>
                  <th className="pb-3 text-sm font-medium text-white/50 pl-4 border-b border-white/10">Order & Customer</th>
                  <th className="pb-3 text-sm font-medium text-white/50 border-b border-white/10">Date</th>
                  <th className="pb-3 text-sm font-medium text-white/50 border-b border-white/10">Status</th>
                  <th className="pb-3 text-sm font-medium text-white/50 border-b border-white/10">Total</th>
                  <th className="pb-3 text-sm font-medium text-white/50 border-b border-white/10">Payment</th>
                  <th className="pb-3 text-sm font-medium text-white/50 text-right pr-4 border-b border-white/10">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-white/50">No orders found.</td>
                  </tr>
                ) : (
                  orders.map((order) => {
                  const statusConfig = getStatusConfig(order.status)
                  const StatusIcon = statusConfig.icon
                  
                  return (
                    <tr 
                      key={order._id} 
                      className="group cursor-pointer"
                      onClick={() => router.push(`/admin/orders/details?id=${order._id}`)}
                    >
                      <td className="py-4 pl-4 rounded-l-2xl bg-transparent group-hover:bg-white/5 transition-colors border-b border-white/5 group-hover:border-transparent">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10 border border-white/10 group-hover:border-white/20 transition-colors bg-white/5">
                            {order.customerAvatar && <AvatarImage src={order.customerAvatar} alt={order.userProfileName || order.customerName} />}
                            <AvatarFallback className="bg-transparent text-white/70 text-xs font-medium">{(order.userProfileName || order.customerName)?.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70 group-hover:from-white group-hover:to-white transition-all">
                              {order.orderId}
                            </p>
                            <p className="text-xs text-white/50 mt-0.5">{order.userProfileName || order.customerName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-sm text-white/70 bg-transparent group-hover:bg-white/5 transition-colors border-b border-white/5 group-hover:border-transparent">
                        <p className="text-sm text-white/80">{format(new Date(order.createdAt), 'MMM d, yyyy')}</p>
                        <p className="text-xs text-white/40 mt-1">{format(new Date(order.createdAt), 'h:mm a')}</p>
                      </td>
                      <td className="py-4 bg-transparent group-hover:bg-white/5 transition-colors border-b border-white/5 group-hover:border-transparent">
                        <span className={cn(
                          "px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 w-fit border capitalize",
                          statusConfig.bg, statusConfig.color, statusConfig.border
                        )}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {order.status}
                        </span>
                      </td>
                      <td className="py-4 bg-transparent group-hover:bg-white/5 transition-colors border-b border-white/5 group-hover:border-transparent">
                        <p className="font-medium text-white">৳{order.total?.toLocaleString()}</p>
                        <p className="text-[10px] text-white/40">{order.cart?.length || 0} {order.cart?.length === 1 ? 'item' : 'items'}</p>
                      </td>
                      <td className="py-4 bg-transparent group-hover:bg-white/5 transition-colors border-b border-white/5 group-hover:border-transparent">
                        <div className="flex items-center gap-2 text-sm text-white/70">
                          <span className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/50">
                            {getPaymentIcon(order.paymentMethod)}
                          </span>
                          {order.paymentMethod}
                        </div>
                      </td>
                      <td className="py-4 pr-4 rounded-r-2xl bg-transparent group-hover:bg-white/5 transition-colors border-b border-white/5 group-hover:border-transparent">
                        <div className="flex items-center justify-end gap-2">
                          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors text-xs font-medium border border-white/10">
                            <Eye className="w-3.5 h-3.5" />
                            View
                          </button>
                          <button className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
            <p className="text-xs text-white/50">Showing 1 to 6 of 1,243 orders</p>
            <div className="flex gap-1">
              <button className="px-3 py-1 rounded-md bg-white/5 text-white/50 hover:bg-white/10 text-sm">Prev</button>
              <button className="px-3 py-1 rounded-md bg-[#550000] text-white text-sm">1</button>
              <button className="px-3 py-1 rounded-md bg-white/5 text-white/70 hover:bg-white/10 text-sm">2</button>
              <button className="px-3 py-1 rounded-md bg-white/5 text-white/70 hover:bg-white/10 text-sm">3</button>
              <span className="px-2 text-white/50">...</span>
              <button className="px-3 py-1 rounded-md bg-white/5 text-white/50 hover:bg-white/10 text-sm">Next</button>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </div>
  )
}
