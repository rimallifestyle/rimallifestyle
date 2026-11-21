"use client"

import React from 'react'
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell
} from 'recharts'
import { ChevronDown } from 'lucide-react'

const data = [
  { date: 'May 16', visitors: 1200 },
  { date: 'May 17', visitors: 2800 },
  { date: 'May 18', visitors: 2100 },
  { date: 'May 19', visitors: 3500 },
  { date: 'May 20', visitors: 3100 },
  { date: 'May 21', visitors: 3800 },
  { date: 'May 22', visitors: 4200 },
]

export function VisitorsOverview() {
  return (
    <div className="glass-card rounded-3xl p-6 relative overflow-hidden flex flex-col h-[400px]">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-white/80 font-medium mb-1">Visitors Overview</h2>
          <div className="text-3xl font-bold text-white mb-1">
            18,756
          </div>
          <p className="text-white/40 text-sm">Total Visitors</p>
        </div>
        
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl glass-button text-sm text-white/80 hover:text-white transition-all">
          This Week
          <ChevronDown className="w-4 h-4 opacity-70" />
        </button>
      </div>

      <div className="flex-1 w-full relative z-10 -ml-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} 
              dy={10}
              interval={1}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
              tickFormatter={(value) => `${value / 1000}K`}
              dx={-10}
            />
            <Tooltip
              cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              contentStyle={{
                backgroundColor: 'rgba(18,0,0,0.8)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                backdropFilter: 'blur(10px)',
                color: '#fff'
              }}
              itemStyle={{ color: '#fff' }}
            />
            <Bar dataKey="visitors" radius={[4, 4, 0, 0]} maxBarSize={40}>
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={index === data.length - 1 ? '#C52A35' : 'rgba(197,42,53,0.5)'} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
