"use client"

import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

interface StatusItem {
  name: string
  value: number
  color: string
}

interface OrderStatusChartProps {
  data?: StatusItem[]
  totalOrders?: number
}

const defaultData: StatusItem[] = [
  { name: 'Completed', value: 0, color: '#10B981' },
  { name: 'Processing', value: 0, color: '#3B82F6' },
  { name: 'Pending', value: 0, color: '#F59E0B' },
  { name: 'Cancelled', value: 0, color: '#EF4444' },
]

export function OrderStatusChart({ data = defaultData, totalOrders = 0 }: OrderStatusChartProps) {
  // If all values are 0, supply dummy slice with opacity for visual rendering
  const hasData = totalOrders > 0 && data.some(d => d.value > 0)
  const chartData = hasData ? data : [{ name: 'No Orders', value: 1, color: 'rgba(255,255,255,0.1)' }]

  return (
    <div className="glass-card rounded-3xl p-6 h-full flex flex-col relative overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-medium text-white/90">Order Status</h2>
          <p className="text-xs text-white/50 mt-0.5">Fulfillment pipeline</p>
        </div>
        <Link 
          href="/admin/orders" 
          className="px-4 py-1.5 rounded-full glass-button text-xs font-medium text-white/80 hover:text-white transition-all flex items-center gap-1"
        >
          Orders
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="flex-1 flex flex-col sm:flex-row items-center justify-between relative z-10 gap-6">
        <div className="w-[160px] h-[160px] relative shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={78}
                paddingAngle={hasData ? 3 : 0}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              {hasData && (
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(18,0,0,0.9)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '12px',
                    backdropFilter: 'blur(10px)',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(val: any) => [`${val} orders`, 'Count']}
                />
              )}
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-bold text-white">{totalOrders.toLocaleString()}</span>
            <span className="text-[10px] text-white/50 tracking-wider uppercase font-medium">Orders</span>
          </div>
        </div>

        <div className="flex-1 w-full space-y-2.5">
          {data.map((item) => {
            const pct = totalOrders > 0 ? ((item.value / totalOrders) * 100).toFixed(1) : "0.0"
            return (
              <div key={item.name} className="flex items-center justify-between p-1.5 rounded-lg hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-xs font-medium text-white/80">{item.name}</span>
                </div>
                <div className="text-right flex items-center gap-2">
                  <span className="text-xs font-bold text-white">{item.value}</span>
                  <span className="text-[11px] text-white/40 font-mono w-12 text-right">({pct}%)</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
