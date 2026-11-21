"use client"

import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

const data = [
  { name: 'Completed', value: 842, color: '#C52A35' },
  { name: 'Processing', value: 256, color: '#9B1C1C' },
  { name: 'Pending', value: 98, color: '#7A1111' },
  { name: 'Cancelled', value: 47, color: '#550000' },
]

export function OrderStatusChart() {
  return (
    <div className="glass-card rounded-3xl p-6 h-full flex flex-col relative overflow-hidden">
      <h2 className="text-lg font-medium text-white/90 mb-6">Order Status</h2>

      <div className="flex-1 flex items-center justify-between relative z-10">
        <div className="w-[160px] h-[160px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(18,0,0,0.8)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  backdropFilter: 'blur(10px)',
                  color: '#fff'
                }}
                itemStyle={{ color: '#fff' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-bold text-white">1,243</span>
            <span className="text-[10px] text-white/50">Total Orders</span>
          </div>
        </div>

        <div className="flex-1 ml-6 space-y-3">
          {data.map((item) => (
            <div key={item.name} className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }} />
              <div className="flex-1">
                <p className="text-sm text-white/80">{item.name}</p>
                <p className="text-xs text-white/40">{item.value} ({((item.value / 1243) * 100).toFixed(1)}%)</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
