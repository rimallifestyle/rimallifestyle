"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { Wallet, ShoppingBag, Users, UserCheck, TrendingUp, Package, RefreshCw, Sparkles } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { KpiCard } from '@/components/admin/dashboard/KpiCard'
import { SalesOverviewChart } from '@/components/admin/dashboard/SalesOverviewChart'
import { TopProducts } from '@/components/admin/dashboard/TopProducts'
import { VisitorsOverview } from '@/components/admin/dashboard/VisitorsOverview'
import { RecentOrders } from '@/components/admin/dashboard/RecentOrders'
import { OrderStatusChart } from '@/components/admin/dashboard/OrderStatusChart'
import { EarningsOverview } from '@/components/admin/dashboard/EarningsOverview'
import { QuickActionBar } from '@/components/admin/dashboard/QuickActionBar'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { KpiSkeleton, ChartSkeleton, TableSkeleton } from '@/components/ui/Skeleton'
import { toast } from 'sonner'

export default function DashboardPage() {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [data, setData] = useState<any>(null)
  const [lastUpdated, setLastUpdated] = useState<string>('')

  const fetchDashboardData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true)
    try {
      const res = await fetch('/api/admin/dashboard')
      if (res.ok) {
        const json = await res.json()
        setData(json)
        setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
        if (isManualRefresh) {
          toast.success('Dashboard data refreshed!')
        }
      } else {
        console.error('Failed to load dashboard data:', res.statusText)
        if (isManualRefresh) toast.error('Failed to refresh data')
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      if (isManualRefresh) toast.error('Error connecting to server')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  const adminName = session?.user?.name || (session?.user?.email ? session.user.email.split('@')[0] : 'Administrator')

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 pt-4 pb-6">
        {/* Header Skeleton */}
        <div className="mb-2 space-y-2">
          <div className="h-8 w-56 rounded-md bg-white/10 animate-pulse" />
          <div className="h-4 w-96 rounded-md bg-white/10 animate-pulse" />
        </div>

        {/* KPI Skeleton Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <KpiSkeleton />
          <KpiSkeleton />
          <KpiSkeleton />
          <KpiSkeleton />
          <KpiSkeleton />
        </div>

        {/* Charts Skeleton Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <ChartSkeleton className="lg:col-span-6 h-[400px]" />
          <ChartSkeleton className="lg:col-span-3 h-[400px]" />
          <ChartSkeleton className="lg:col-span-3 h-[400px]" />
        </div>

        {/* Tables Skeleton Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5"><TableSkeleton /></div>
          <ChartSkeleton className="lg:col-span-4 h-[400px]" />
          <ChartSkeleton className="lg:col-span-3 h-[400px]" />
        </div>
      </div>
    )
  }

  const kpis = data?.kpis || {}

  return (
    <div className="flex flex-col gap-6 pt-4 pb-6">
      {/* Dashboard Header with Refresh Control */}
      <ScrollReveal delay={0.1}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-white">Dashboard</h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Sync
              </span>
            </div>
            <p className="text-white/60 text-sm">
              Welcome back, <span className="text-white font-medium capitalize">{adminName}</span>! Here's your store's live performance.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {lastUpdated && (
              <span className="text-xs text-white/40 hidden md:inline-block">
                Updated at {lastUpdated}
              </span>
            )}
            <button
              onClick={() => fetchDashboardData(true)}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl glass-button text-xs font-medium text-white/80 hover:text-white transition-all disabled:opacity-50"
              title="Refresh dashboard stats"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#ff8a93]' : ''}`} />
              <span>{isRefreshing ? 'Syncing...' : 'Refresh'}</span>
            </button>
          </div>
        </div>
      </ScrollReveal>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <ScrollReveal delay={0.15}>
          <KpiCard 
            title="Total Revenue" 
            value={`৳ ${(kpis.totalRevenue || 0).toLocaleString()}`} 
            change={kpis.revenueChange || "0.0%"} 
            isPositive={Boolean(kpis.isRevenuePositive)} 
            comparison="vs last 7 days" 
            icon={<Wallet className="w-5 h-5" />} 
          />
        </ScrollReveal>
        <ScrollReveal delay={0.25}>
          <KpiCard 
            title="Total Orders" 
            value={(kpis.totalOrders || 0).toLocaleString()} 
            change={kpis.ordersChange || "0.0%"} 
            isPositive={Boolean(kpis.isOrdersPositive)} 
            comparison="vs last 7 days" 
            icon={<ShoppingBag className="w-5 h-5" />} 
          />
        </ScrollReveal>
        <ScrollReveal delay={0.35}>
          <KpiCard 
            title="Total Products" 
            value={(kpis.totalProducts || 0).toLocaleString()} 
            change="Active" 
            isPositive={true} 
            comparison="in catalog" 
            icon={<Package className="w-5 h-5" />} 
          />
        </ScrollReveal>
        <ScrollReveal delay={0.45}>
          <KpiCard 
            title="Total Customers" 
            value={(kpis.totalCustomers || 0).toLocaleString()} 
            change="Active" 
            isPositive={true} 
            comparison="registered & buyers" 
            icon={<UserCheck className="w-5 h-5" />} 
          />
        </ScrollReveal>
        <ScrollReveal delay={0.55}>
          <KpiCard 
            title="Conversion Rate" 
            value={kpis.conversionRate || "0.0%"} 
            change="Traffic" 
            isPositive={true} 
            comparison="orders vs visits" 
            icon={<TrendingUp className="w-5 h-5" />} 
          />
        </ScrollReveal>
      </div>

      {/* Main Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6">
          <ScrollReveal delay={0.2}>
            <SalesOverviewChart 
              sales7d={data?.salesOverview?.sales7d}
              sales30d={data?.salesOverview?.sales30d}
              totalRevenue={data?.salesOverview?.totalRevenue}
            />
          </ScrollReveal>
        </div>
        <div className="lg:col-span-3">
          <ScrollReveal delay={0.3}>
            <TopProducts products={data?.topProducts} />
          </ScrollReveal>
        </div>
        <div className="lg:col-span-3">
          <ScrollReveal delay={0.4}>
            <VisitorsOverview 
              visitors7d={data?.visitorsOverview?.visitors7d}
              totalVisitors={data?.visitorsOverview?.totalVisitors}
            />
          </ScrollReveal>
        </div>
      </div>

      {/* Second Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5">
          <ScrollReveal delay={0.2}>
            <RecentOrders orders={data?.recentOrders} />
          </ScrollReveal>
        </div>
        <div className="lg:col-span-4">
          <ScrollReveal delay={0.3}>
            <OrderStatusChart 
              data={data?.orderStatus?.data} 
              totalOrders={data?.orderStatus?.totalOrders} 
            />
          </ScrollReveal>
        </div>
        <div className="lg:col-span-3">
          <ScrollReveal delay={0.4}>
            <EarningsOverview 
              monthlyEarnings={data?.earningsOverview?.monthlyEarnings}
              monthlyGoal={data?.earningsOverview?.monthlyGoal}
              goalPercentage={data?.earningsOverview?.goalPercentage}
            />
          </ScrollReveal>
        </div>
      </div>

      {/* Quick Action Bar */}
      <ScrollReveal delay={0.5}>
        <QuickActionBar />
      </ScrollReveal>
    </div>
  )
}
