"use client"

import React, { useState, useEffect } from 'react'
import { Percent, Sparkles, RefreshCw, CheckCircle2, AlertTriangle, ArrowRight, Tag, ShieldAlert } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface StoreWideSaleCardProps {
  onSuccess?: () => void;
  className?: string;
}

export function StoreWideSaleCard({ onSuccess, className }: StoreWideSaleCardProps) {
  const [percentage, setPercentage] = useState<string>('15')
  const [isLoading, setIsLoading] = useState(false)
  const [statusLoading, setStatusLoading] = useState(true)
  const [saleStatus, setSaleStatus] = useState<{
    active: boolean;
    percentage: number;
    appliedAt?: string;
  } | null>(null)
  const [stats, setStats] = useState<{ totalProducts: number; onSaleCount: number }>({
    totalProducts: 0,
    onSaleCount: 0,
  })
  const [showConfirm, setShowConfirm] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  const quickPresets = ['5', '10', '15', '20', '25', '30', '50']

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/admin/products/bulk-discount')
      if (res.ok) {
        const data = await res.json()
        if (data.success) {
          setStats({
            totalProducts: data.totalProducts || 0,
            onSaleCount: data.onSaleCount || 0,
          })
          if (data.siteSale && data.siteSale.active) {
            setSaleStatus(data.siteSale)
            setPercentage(data.siteSale.percentage?.toString() || '15')
          } else {
            setSaleStatus(null)
          }
        }
      }
    } catch (err) {
      console.error('Error fetching site-wide sale status:', err)
    } finally {
      setStatusLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
  }, [])

  const handleApplyDiscount = async () => {
    const num = Number(percentage)
    if (isNaN(num) || num <= 0 || num >= 100) {
      toast.error('Please enter a valid discount percentage between 1 and 99')
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch('/api/admin/products/bulk-discount', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'apply', percentage: num }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        toast.success(data.message || `Successfully applied ${num}% sale discount to all products!`)
        setShowConfirm(false)
        await fetchStatus()
        if (onSuccess) onSuccess()
      } else {
        toast.error(data.message || 'Failed to apply discount')
      }
    } catch (err) {
      console.error('Error applying discount:', err)
      toast.error('Network error while applying discount')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetDiscount = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/admin/products/bulk-discount', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset' }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        toast.success(data.message || 'Store-wide sale reset. All sale prices removed.')
        setShowResetConfirm(false)
        await fetchStatus()
        if (onSuccess) onSuccess()
      } else {
        toast.error(data.message || 'Failed to reset sale prices')
      }
    } catch (err) {
      console.error('Error resetting discount:', err)
      toast.error('Network error while resetting discount')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("glass-card rounded-3xl p-6 relative overflow-hidden border border-white/10", className)}>
      {/* Background Accent Glow */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-gradient-to-br from-[#7A1111]/30 to-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
        
        {/* Left: Info & Status */}
        <div className="flex-1">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7A1111] to-amber-600/40 flex items-center justify-center text-white shadow-lg shadow-[#7A1111]/30">
              <Percent className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Store-Wide Sale Discount</h2>
                {saleStatus?.active ? (
                  <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {saleStatus.percentage}% OFF ACTIVE
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white/10 text-white/50">
                    Standard Pricing
                  </span>
                )}
              </div>
              <p className="text-xs text-white/60">
                Apply a uniform sale discount percentage across all products in your store instantly.
              </p>
            </div>
          </div>

          {/* Quick stats */}
          <div className="flex items-center gap-4 text-xs text-white/50 mt-3 pt-3 border-t border-white/5">
            <span>Catalog: <strong className="text-white font-medium">{stats.totalProducts}</strong> products</span>
            <span>•</span>
            <span>Currently on Sale: <strong className={cn("font-medium", stats.onSaleCount > 0 ? "text-amber-400" : "text-white")}>{stats.onSaleCount}</strong></span>
            {saleStatus?.appliedAt && (
              <>
                <span>•</span>
                <span>Last updated: {new Date(saleStatus.appliedAt).toLocaleDateString()}</span>
              </>
            )}
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Quick Presets */}
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
            {quickPresets.map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => setPercentage(pct)}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                  percentage === pct 
                    ? "bg-[#7A1111] text-white shadow-sm" 
                    : "text-white/60 hover:text-white hover:bg-white/5"
                )}
              >
                {pct}%
              </button>
            ))}
          </div>

          {/* Custom Input */}
          <div className="relative w-28">
            <input
              type="number"
              min="1"
              max="99"
              value={percentage}
              onChange={(e) => setPercentage(e.target.value)}
              placeholder="15"
              className="w-full h-10 pl-3 pr-7 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-white focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 text-center"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-white/40 pointer-events-none">%</span>
          </div>

          {/* Apply Button */}
          <button
            type="button"
            onClick={() => setShowConfirm(true)}
            disabled={isLoading || statusLoading}
            className="h-10 px-5 rounded-xl bg-gradient-to-r from-[#7A1111] to-[#550000] hover:from-[#8B1414] hover:to-[#660000] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-[0_0_15px_rgba(122,17,17,0.4)] disabled:opacity-50 cursor-pointer shrink-0"
          >
            {isLoading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-gold" />
            )}
            <span>Apply {percentage}% to All</span>
          </button>

          {/* Reset Button */}
          {(saleStatus?.active || stats.onSaleCount > 0) && (
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              disabled={isLoading}
              className="h-10 px-3.5 rounded-xl bg-white/5 hover:bg-red-500/10 text-white/60 hover:text-red-400 border border-white/10 hover:border-red-500/20 text-xs font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer shrink-0"
              title="Reset all sale prices to regular price"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Confirmation Modal: Apply Sale */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#1a0505] border border-white/15 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
                <Tag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Apply {percentage}% Store-Wide Sale</h3>
                <p className="text-xs text-white/50">This will update pricing for {stats.totalProducts} products</p>
              </div>
            </div>
            
            <p className="text-sm text-white/70 mb-6 leading-relaxed">
              Are you sure you want to set a <strong className="text-white font-semibold">{percentage}% discount</strong> on all products? Every product&apos;s sale price will automatically be calculated based on its regular price (e.g. ৳1,000 becomes ৳{Math.round(1000 * (1 - Number(percentage)/100))}).
            </p>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                disabled={isLoading}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyDiscount}
                disabled={isLoading}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#7A1111] to-[#550000] text-white text-sm font-semibold hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Applying...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-gold" />
                    <span>Confirm & Apply</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Reset Sale */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#1a0505] border border-white/15 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/15 text-red-400 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Reset All Sale Prices</h3>
                <p className="text-xs text-white/50">Remove active discounts</p>
              </div>
            </div>
            
            <p className="text-sm text-white/70 mb-6 leading-relaxed">
              Are you sure you want to remove all sale prices from your catalog? Products will return to their regular prices across the whole website.
            </p>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                disabled={isLoading}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetDiscount}
                disabled={isLoading}
                className="px-5 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Resetting...</span>
                  </>
                ) : (
                  <span>Yes, Remove All Sale Prices</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
