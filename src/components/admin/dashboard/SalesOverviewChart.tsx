"use client"

import React from 'react'
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts'
import { ChevronDown } from 'lucide-react'

const data = [
  { date: 'May 16', sales: 15000 },
  { date: 'May 17', sales: 22000 },
  { date: 'May 18', sales: 18000 },
  { date: 'May 19', sales: 28000 },
  { date: 'May 20', sales: 35000 },
  { date: 'May 21', sales: 42000 },
  { date: 'May 22', sales: 48000 },
]

export function SalesOverviewChart() {
  return (
    <div className="glass-card rounded-3xl p-6 relative overflow-hidden flex flex-col h-[400px]">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-white/80 font-medium mb-1">Sales Overview</h2>
          <div className="text-3xl font-bold text-white mb-1 flex items-center gap-1">
            <span className="text-2xl">৳</span>245,640
          </div>
          <p className="text-white/40 text-sm">Total Revenue</p>
        </div>
        
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl glass-button text-sm text-white/80 hover:text-white transition-all">
          This Week
          <ChevronDown className="w-4 h-4 opacity-70" />
        </button>
      </div>

      <div className="flex-1 w-full relative z-10 -ml-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#C52A35" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#C52A35" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
              tickFormatter={(value) => `${value / 1000}K`}
              dx={-10}
            />
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
            <Area
              type="monotone"
              dataKey="sales"
              stroke="#C52A35"
              strokeWidth={4}
              fillOpacity={1}
              fill="url(#colorSales)"
              activeDot={{ r: 6, fill: '#fff', stroke: '#C52A35', strokeWidth: 3 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
