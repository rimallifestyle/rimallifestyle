"use client"

import React from 'react'
import { ChevronDown } from 'lucide-react'

export function EarningsOverview() {
  return (
    <div className="glass-card rounded-3xl p-6 flex flex-col relative overflow-hidden group min-h-full">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-lg font-medium text-white/90">Earnings Overview</h2>
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-button text-xs text-white/80 hover:text-white transition-all">
          This Month
          <ChevronDown className="w-3 h-3 opacity-70" />
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between flex-1 relative z-10 gap-6 sm:gap-4">
        <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
          <div className="text-3xl font-bold text-white mb-1 flex items-center gap-1 justify-center sm:justify-start">
            <span className="text-2xl">৳</span>245,640
          </div>
          <p className="text-white/40 text-sm mb-4 sm:mb-6">Total Earnings</p>
          
          <div className="flex flex-col gap-1.5 w-full items-center sm:items-start">
            <div className="h-1.5 w-full min-w-[160px] sm:w-40 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#C52A35] to-[#7A1111] w-[68%] rounded-full shadow-[0_0_10px_rgba(197,42,53,0.8)]" />
            </div>
            <p className="text-xs text-emerald-400 font-medium">
              ৳245,640 <span className="text-white/40 font-normal">of ৳360,000 Goal</span>
            </p>
          </div>
        </div>

        <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="8"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              stroke="#C52A35"
              strokeWidth="8"
              strokeDasharray={`${2 * Math.PI * 40}`}
              strokeDashoffset={`${2 * Math.PI * 40 * (1 - 0.68)}`}
              strokeLinecap="round"
              className="drop-shadow-[0_0_8px_rgba(197,42,53,0.8)] transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg sm:text-xl font-bold text-white leading-none">68%</span>
            <span className="text-[10px] text-white/50 text-center leading-tight mt-1 px-3">
              of goal
            </span>
          </div>
        </div>
      </div>
      
      {/* Background glow */}
      <div className="absolute bottom-[-20%] right-[-10%] w-40 h-40 bg-[#C52A35]/10 blur-3xl rounded-full pointer-events-none group-hover:bg-[#C52A35]/20 transition-colors duration-500" />
    </div>
  )
}
