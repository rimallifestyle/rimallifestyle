"use client"

import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ShoppingBag, ArrowUpRight } from 'lucide-react'

interface RecentOrder {
  id: string
  orderId: string
  name: string
  date: string
  status: string
  total: number
  avatar?: string
}

interface RecentOrdersProps {
  orders?: RecentOrder[]
}

export function RecentOrders({ orders = [] }: RecentOrdersProps) {
  const router = useRouter()

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
      case 'completed':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
      case 'processing':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/20'
      case 'pending':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20'
      case 'cancelled':
        return 'text-red-400 bg-red-500/10 border-red-500/20'
      case 'shipped':
        return 'text-purple-400 bg-purple-500/10 border-purple-500/20'
      default:
        return 'text-white/60 bg-white/5 border-white/10'
    }
  }

  return (
    <div className="glass-card rounded-3xl p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-medium text-white/90">Recent Orders</h2>
          <p className="text-xs text-white/50 mt-0.5">Real-time incoming orders</p>
        </div>
        <Link 
          href="/admin/orders" 
          className="px-4 py-1.5 rounded-full glass-button text-xs font-medium text-white/80 hover:text-white transition-all flex items-center gap-1"
        >
          View All
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar pr-2 space-y-3">
        {orders.length === 0 ? (
          <div className="h-full min-h-[220px] flex flex-col items-center justify-center text-center p-6 border border-dashed border-white/10 rounded-2xl">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/30 mb-3">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-white/80">No orders placed yet</p>
            <p className="text-xs text-white/40 mt-1 max-w-[200px]">New customer orders will appear here automatically in real time.</p>
          </div>
        ) : (
          orders.map((order) => (
            <div 
              key={order.id} 
              onClick={() => router.push(`/admin/orders/details?id=${order.id}`)}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Avatar className="w-10 h-10 border border-white/10 shrink-0">
                  <AvatarImage src={order.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(order.name)}&background=220000&color=fff`} />
                  <AvatarFallback>{order.name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white group-hover:text-[#ff8a93] transition-colors truncate">{order.orderId}</p>
                  <p className="text-xs text-white/60 truncate">{order.name}</p>
                </div>
              </div>
              
              <div className="text-right flex items-center gap-4 shrink-0">
                <div className="text-right">
                  <p className="text-sm font-bold text-white">৳{(order.total || 0).toLocaleString()}</p>
                  <p className="text-[11px] text-white/40">{order.date}</p>
                </div>
                <span 
                  className={cn(
                    "text-[11px] font-semibold px-2.5 py-1 rounded-full border uppercase tracking-wider",
                    getStatusColor(order.status)
                  )}
                >
                  {order.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
