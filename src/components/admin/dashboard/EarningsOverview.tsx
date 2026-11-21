"use client"

import React from 'react'
import { Target, TrendingUp } from 'lucide-react'

interface EarningsOverviewProps {
  monthlyEarnings?: number
  monthlyGoal?: number
  goalPercentage?: number
}

export function EarningsOverview({ 
  monthlyEarnings = 0, 
  monthlyGoal = 100000, 
  goalPercentage = 0 
}: EarningsOverviewProps) {
  const currentGoal = monthlyGoal || 100000
  const pct = Math.min(100, Math.max(0, goalPercentage || Math.round((monthlyEarnings / currentGoal) * 100)))

  return (
    <div className="glass-card rounded-3xl p-6 flex flex-col relative overflow-hidden group min-h-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-lg font-medium text-white/90">Earnings Goal</h2>
          <p className="text-xs text-white/50 mt-0.5">This Month Target</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/70">
          <Target className="w-3.5 h-3.5 text-[#C52A35]" />
          <span>Target</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between flex-1 relative z-10 gap-6 sm:gap-4">
        <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
          <div className="text-3xl font-bold text-white mb-1 flex items-center gap-1 justify-center sm:justify-start">
            <span className="text-2xl">৳</span>{monthlyEarnings.toLocaleString()}
          </div>
          <p className="text-white/40 text-sm mb-4 sm:mb-6">This Month's Sales</p>
          
          <div className="flex flex-col gap-1.5 w-full items-center sm:items-start">
            <div className="h-2 w-full min-w-[160px] sm:w-44 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#C52A35] to-[#ff5263] rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(197,42,53,0.8)]"
                style={{ width: `${pct}%` }} 
              />
            </div>
            <p className="text-xs text-emerald-400 font-medium mt-1">
              ৳{monthlyEarnings.toLocaleString()} <span className="text-white/40 font-normal">of ৳{currentGoal.toLocaleString()}</span>
            </p>
          </div>
        </div>

        <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="transparent"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="7"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="transparent"
              stroke="#C52A35"
              strokeWidth="7"
              strokeDasharray={`${2 * Math.PI * 38}`}
              strokeDashoffset={`${2 * Math.PI * 38 * (1 - pct / 100)}`}
              strokeLinecap="round"
              className="drop-shadow-[0_0_8px_rgba(197,42,53,0.8)] transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg sm:text-xl font-bold text-white leading-none">{pct}%</span>
            <span className="text-[10px] text-white/50 text-center leading-tight mt-1 px-2">
              achieved
            </span>
          </div>
        </div>
      </div>
      
      {/* Background glow */}
      <div className="absolute bottom-[-20%] right-[-10%] w-40 h-40 bg-[#C52A35]/10 blur-3xl rounded-full pointer-events-none group-hover:bg-[#C52A35]/20 transition-colors duration-500" />
    </div>
  )
}
