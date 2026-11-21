"use client"

import React from 'react'
import { Users, UserPlus, ArrowLeftRight, Clock, Activity, Globe, MonitorSmartphone, ChevronDown } from 'lucide-react'
import { KpiCard } from '@/components/admin/dashboard/KpiCard'
import { VisitorsOverview } from '@/components/admin/dashboard/VisitorsOverview'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Bar, BarChart, Cell } from 'recharts'

const trafficSourcesData = [
  { name: 'Organic Search', value: 45 },
  { name: 'Direct', value: 25 },
  { name: 'Social Media', value: 20 },
  { name: 'Referral', value: 10 },
]

const topPagesData = [
  { path: '/shop/mens-collection', views: '12,450', bounce: '42%' },
  { path: '/product/premium-watch', views: '8,230', bounce: '35%' },
  { path: '/checkout', views: '6,100', bounce: '12%' },
  { path: '/blog/summer-trends', views: '4,500', bounce: '65%' },
  { path: '/about-us', views: '3,200', bounce: '40%' },
]

const deviceData = [
  { name: 'Mobile', visitors: 12500, color: '#C52A35' },
  { name: 'Desktop', visitors: 8200, color: '#7A1111' },
  { name: 'Tablet', visitors: 1500, color: '#330000' },
]

export default function VisitorsPage() {
  return (
    <div className="flex flex-col gap-6 pt-4 pb-6">
      {/* Header Area */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Visitor Analytics</h1>
          <p className="text-white/60 text-sm">Detailed breakdown of your store traffic and audience.</p>
        </div>
        
        <button className="flex items-center gap-2 h-10 px-4 rounded-full glass-button text-sm text-white/80 hover:text-white">
          Last 30 Days
          <ChevronDown className="w-4 h-4 opacity-70" />
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Sessions"
          value="45,231"
          change="12.5%"
          isPositive={true}
          comparison="vs last 30 days"
          icon={<Globe className="w-5 h-5" />}
        />
        <KpiCard
          title="Unique Visitors"
          value="38,112"
          change="15.3%"
          isPositive={true}
          comparison="vs last 30 days"
          icon={<UserPlus className="w-5 h-5" />}
        />
        <KpiCard
          title="Avg. Session Duration"
          value="04m 12s"
          change="5.2%"
          isPositive={true}
          comparison="vs last 30 days"
          icon={<Clock className="w-5 h-5" />}
        />
        <KpiCard
          title="Bounce Rate"
          value="42.3%"
          change="2.1%"
          isPositive={false}
          comparison="vs last 30 days"
          icon={<Activity className="w-5 h-5" />}
        />
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Re-using the VisitorsOverview component but styling it larger for this page */}
          <VisitorsOverview />
        </div>
        
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* Traffic Sources */}
          <div className="glass-card rounded-3xl p-6 flex-1 flex flex-col">
            <h2 className="text-lg font-medium text-white/90 mb-6">Traffic Sources</h2>
            <div className="flex-1 space-y-6">
              {trafficSourcesData.map((source, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-white/80">{source.name}</span>
                    <span className="text-white font-medium">{source.value}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#C52A35] to-[#7A1111] rounded-full shadow-[0_0_10px_rgba(197,42,53,0.8)]"
                      style={{ width: `${source.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Pages Table */}
        <div className="lg:col-span-2 glass-card rounded-3xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-white/90">Top Pages</h2>
            <button className="text-xs font-medium text-white/60 hover:text-white transition-colors">View All Report</button>
          </div>
          
          <div className="w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="pb-3 text-sm font-medium text-white/50">Page Path</th>
                  <th className="pb-3 text-sm font-medium text-white/50 text-right">Pageviews</th>
                  <th className="pb-3 text-sm font-medium text-white/50 text-right">Bounce Rate</th>
                </tr>
              </thead>
              <tbody>
                {topPagesData.map((page, i) => (
                  <tr key={i} className="group hover:bg-white/5 transition-colors border-b border-white/5 last:border-0">
                    <td className="py-4 text-sm text-white/90 font-medium group-hover:text-[#C52A35] transition-colors">{page.path}</td>
                    <td className="py-4 text-sm text-white/80 text-right">{page.views}</td>
                    <td className="py-4 text-sm text-white/80 text-right">{page.bounce}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Devices Overview */}
        <div className="lg:col-span-1 glass-card rounded-3xl p-6 flex flex-col relative overflow-hidden">
          <h2 className="text-lg font-medium text-white/90 mb-6">Devices</h2>
          
          <div className="flex-1 w-full relative z-10 -ml-4">
             <ResponsiveContainer width="100%" height={200}>
                <BarChart layout="vertical" data={deviceData} margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 13 }} width={70} />
                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{
                      backgroundColor: 'rgba(18,0,0,0.8)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      backdropFilter: 'blur(10px)',
                      color: '#fff'
                    }}
                  />
                  <Bar dataKey="visitors" radius={[0, 4, 4, 0]} barSize={24}>
                    {deviceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
             </ResponsiveContainer>
          </div>
          
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-[#550000]/30 rounded-full blur-3xl pointer-events-none" />
        </div>
      </div>
    </div>
  )
}
