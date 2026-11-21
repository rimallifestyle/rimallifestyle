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
import { Users } from 'lucide-react'

interface VisitorPoint {
  date: string
  visitors: number
}

interface VisitorsOverviewProps {
  visitors7d?: VisitorPoint[]
  totalVisitors?: number
}

export function VisitorsOverview({ 
  visitors7d = [], 
  totalVisitors = 0 
}: VisitorsOverviewProps) {
  return (
    <div className="glass-card rounded-3xl p-6 relative overflow-hidden flex flex-col h-[400px]">
      <div className="flex justify-between items-start mb-6 z-20 relative">
        <div>
          <h2 className="text-white/80 font-medium mb-1">Visitors Overview</h2>
          <div className="text-3xl font-bold text-white mb-1">
            {totalVisitors.toLocaleString()}
          </div>
          <p className="text-white/40 text-xs">Total Traffic (7 Days)</p>
        </div>
        
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-button text-xs text-white/70">
          <Users className="w-3.5 h-3.5 text-blue-400" />
          <span>Live Audience</span>
        </div>
      </div>

      <div className="flex-1 w-full relative z-10 -ml-4">
        {visitors7d.length === 0 ? (
          <div className="h-full flex items-center justify-center text-white/40 text-sm">
            No visitor logs found.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={visitors7d} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
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
                dx={-8}
              />
              <Tooltip
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                contentStyle={{
                  backgroundColor: 'rgba(18,0,0,0.9)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '12px',
                  backdropFilter: 'blur(10px)',
                  color: '#fff',
                  fontSize: '12px'
                }}
                formatter={(val: any) => [`${val} visitors`, 'Sessions']}
                itemStyle={{ color: '#fff' }}
              />
              <Bar dataKey="visitors" radius={[6, 6, 0, 0]} maxBarSize={36}>
                {visitors7d.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={index === visitors7d.length - 1 ? '#C52A35' : 'rgba(197,42,53,0.5)'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
