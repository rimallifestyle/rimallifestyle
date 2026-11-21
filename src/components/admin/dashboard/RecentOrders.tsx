import React from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

const orders = [
  { id: '#ORD-1243', name: 'John Doe', date: 'May 22, 2025', status: 'Completed', avatar: '1' },
  { id: '#ORD-1242', name: 'Sarah Johnson', date: 'May 22, 2025', status: 'Completed', avatar: '2' },
  { id: '#ORD-1241', name: 'Michael Brown', date: 'May 21, 2025', status: 'Processing', avatar: '3' },
  { id: '#ORD-1240', name: 'Emily Davis', date: 'May 21, 2025', status: 'Completed', avatar: '4' },
  { id: '#ORD-1239', name: 'David Wilson', date: 'May 20, 2025', status: 'Completed', avatar: '5' },
]

export function RecentOrders() {
  return (
    <div className="glass-card rounded-3xl p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium text-white/90">Recent Orders</h2>
        <button className="px-4 py-1.5 rounded-full glass-button text-xs font-medium text-white/80 hover:text-white transition-all">
          View All
        </button>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar pr-2 space-y-4">
        {orders.map((order, i) => (
          <div key={order.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10 border border-white/10">
                <AvatarImage src={`https://i.pravatar.cc/150?img=${order.avatar}`} />
                <AvatarFallback>{order.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-white group-hover:text-[#C52A35] transition-colors">{order.id}</p>
                <p className="text-xs text-white/60">{order.name}</p>
              </div>
            </div>
            
            <div className="text-right flex items-center gap-6">
              <span className="text-xs text-white/40">{order.date}</span>
              <span 
                className={cn(
                  "text-xs font-medium w-20 text-right",
                  order.status === 'Completed' ? "text-emerald-400" : "text-amber-400"
                )}
              >
                {order.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
