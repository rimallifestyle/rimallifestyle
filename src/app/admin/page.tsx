"use client"

import React, { useState, useEffect } from 'react'
import { Wallet, ShoppingBag, Users, UserCheck, TrendingUp } from 'lucide-react'
import { KpiCard } from '@/components/admin/dashboard/KpiCard'
import { SalesOverviewChart } from '@/components/admin/dashboard/SalesOverviewChart'
import { TopProducts } from '@/components/admin/dashboard/TopProducts'
import { VisitorsOverview } from '@/components/admin/dashboard/VisitorsOverview'
import { RecentOrders } from '@/components/admin/dashboard/RecentOrders'
import { OrderStatusChart } from '@/components/admin/dashboard/OrderStatusChart'
import { EarningsOverview } from '@/components/admin/dashboard/EarningsOverview'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { KpiSkeleton, ChartSkeleton, TableSkeleton } from '@/components/ui/Skeleton'

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true)

  // Simulate API data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500) // 1.5s simulated loading time
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 pt-4 pb-6">
        {/* Header Skeleton */}
        <div className="mb-2 space-y-2">
          <div className="h-8 w-48 rounded-md bg-white/10 animate-pulse" />
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

  return (
    <div className="flex flex-col gap-6 pt-4 pb-6">
      {/* Dashboard Header */}
      <ScrollReveal delay={0.1}>
        <div className="mb-2">
          <h1 className="text-2xl font-bold text-white mb-1">Dashboard</h1>
          <p className="text-white/60 text-sm">Welcome back, Mohim! Here's what's happening with your store today.</p>
        </div>
      </ScrollReveal>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <ScrollReveal delay={0.15}>
          <KpiCard title="Total Revenue" value="৳ 245,640" change="12.5%" isPositive={true} comparison="vs last 7 days" icon={<Wallet className="w-5 h-5" />} />
        </ScrollReveal>
        <ScrollReveal delay={0.25}>
          <KpiCard title="Total Orders" value="1,243" change="8.2%" isPositive={true} comparison="vs last 7 days" icon={<ShoppingBag className="w-5 h-5" />} />
        </ScrollReveal>
        <ScrollReveal delay={0.35}>
          <KpiCard title="Total Visitors" value="18,756" change="15.3%" isPositive={true} comparison="vs last 7 days" icon={<Users className="w-5 h-5" />} />
        </ScrollReveal>
        <ScrollReveal delay={0.45}>
          <KpiCard title="Total Customers" value="2,345" change="10.1%" isPositive={true} comparison="vs last 7 days" icon={<UserCheck className="w-5 h-5" />} />
        </ScrollReveal>
        <ScrollReveal delay={0.55}>
          <KpiCard title="Conversion Rate" value="6.63%" change="2.1%" isPositive={true} comparison="vs last 7 days" icon={<TrendingUp className="w-5 h-5" />} />
        </ScrollReveal>
      </div>

      {/* Main Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6">
          <ScrollReveal delay={0.2}>
            <SalesOverviewChart />
          </ScrollReveal>
        </div>
        <div className="lg:col-span-3">
          <ScrollReveal delay={0.3}>
            <TopProducts />
          </ScrollReveal>
        </div>
        <div className="lg:col-span-3">
          <ScrollReveal delay={0.4}>
            <VisitorsOverview />
          </ScrollReveal>
        </div>
      </div>

      {/* Second Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5">
          <ScrollReveal delay={0.2}>
            <RecentOrders />
          </ScrollReveal>
        </div>
        <div className="lg:col-span-4">
          <ScrollReveal delay={0.3}>
            <OrderStatusChart />
          </ScrollReveal>
        </div>
        <div className="lg:col-span-3">
          <ScrollReveal delay={0.4}>
            <EarningsOverview />
          </ScrollReveal>
        </div>
      </div>

    </div>
  )
}
