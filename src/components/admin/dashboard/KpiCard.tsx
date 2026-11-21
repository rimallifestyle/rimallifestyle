import React from 'react'
import { ArrowUp, ArrowDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface KpiCardProps {
  title: string
  value: string
  change: string
  isPositive: boolean
  comparison: string
  icon: React.ReactNode
}

export function KpiCard({ title, value, change, isPositive, comparison, icon }: KpiCardProps) {
  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden group">
      {/* Subtle background glow */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#7A1111]/20 rounded-full blur-3xl group-hover:bg-[#C52A35]/20 transition-colors duration-500" />
      
      <div className="flex items-start justify-between">
        <div className="flex flex-col">
          <span className="text-white/60 text-sm font-medium mb-1">{title}</span>
          <span className="text-2xl font-bold text-white mb-2">{value}</span>
          
          <div className="flex items-center gap-1.5 mt-1">
            <span 
              className={cn(
                "flex items-center text-xs font-medium",
                isPositive ? "text-emerald-400" : "text-rose-400"
              )}
            >
              {isPositive ? <ArrowUp className="w-3 h-3 mr-0.5" /> : <ArrowDown className="w-3 h-3 mr-0.5" />}
              {change}
            </span>
            <span className="text-white/40 text-xs">{comparison}</span>
          </div>
        </div>

        <div className="w-12 h-12 rounded-full glass-button flex items-center justify-center shadow-[0_0_15px_rgba(85,0,0,0.5)] border border-white/10 group-hover:shadow-[0_0_20px_rgba(197,42,53,0.5)] transition-all">
          <div className="text-[#C52A35] group-hover:text-white transition-colors">
            {icon}
          </div>
        </div>
      </div>
    </div>
  )
}
