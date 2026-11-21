"use client"

import React, { useState } from 'react'
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts'
import { Calendar } from 'lucide-react'

interface DataPoint {
  date: string
  sales: number
}

interface SalesOverviewChartProps {
  sales7d?: DataPoint[]
  sales30d?: DataPoint[]
  totalRevenue?: number
}

export function SalesOverviewChart({ 
  sales7d = [], 
  sales30d = [], 
  totalRevenue = 0 
}: SalesOverviewChartProps) {
  const [timeframe, setTimeframe] = useState<'7d' | '30d'>('7d')

  const currentData = timeframe === '7d' ? sales7d : sales30d
  const currentTotal = currentData.reduce((acc, curr) => acc + (curr.sales || 0), 0)

  return (
    <div className="glass-card rounded-3xl p-6 relative overflow-hidden flex flex-col h-[400px]">
      <div className="flex justify-between items-start mb-6 z-20 relative">
        <div>
          <h2 className="text-white/80 font-medium mb-1">Sales Overview</h2>
          <div className="text-3xl font-bold text-white mb-1 flex items-center gap-1">
            <span className="text-2xl">৳</span>{currentTotal.toLocaleString()}
          </div>
          <p className="text-white/40 text-xs">
            {timeframe === '7d' ? 'Last 7 Days Revenue' : 'Last 30 Days Revenue'} 
            {totalRevenue > 0 && <span className="ml-2 text-white/50">(All-time: ৳{totalRevenue.toLocaleString()})</span>}
          </p>
        </div>
        
        {/* Functional Timeframe Selector */}
        <div className="flex items-center gap-1 p-1 bg-white/5 border border-white/10 rounded-xl">
          <button
            onClick={() => setTimeframe('7d')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              timeframe === '7d'
                ? 'bg-[#C52A35] text-white shadow-[0_0_12px_rgba(197,42,53,0.5)]'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            7 Days
          </button>
          <button
            onClick={() => setTimeframe('30d')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              timeframe === '30d'
                ? 'bg-[#C52A35] text-white shadow-[0_0_12px_rgba(197,42,53,0.5)]'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            30 Days
          </button>
        </div>
      </div>

      <div className="flex-1 w-full relative z-10 -ml-4">
        {currentData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-white/40 text-sm">
            No sales recorded in this period.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={currentData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C52A35" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#C52A35" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} 
                dy={8}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(0)}K` : `${val}`}
                dx={-8}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(18,0,0,0.9)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '12px',
                  backdropFilter: 'blur(10px)',
                  color: '#fff',
                  fontSize: '12px'
                }}
                formatter={(value: any) => [`৳ ${(value || 0).toLocaleString()}`, 'Revenue']}
                labelStyle={{ color: 'rgba(255,255,255,0.6)', marginBottom: '4px' }}
              />
              <Area
                type="monotone"
                dataKey="sales"
                stroke="#C52A35"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorSales)"
                activeDot={{ r: 6, fill: '#fff', stroke: '#C52A35', strokeWidth: 3 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
