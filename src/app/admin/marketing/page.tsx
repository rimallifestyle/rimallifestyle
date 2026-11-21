"use client"

import React, { useState, useEffect } from 'react'
import { Megaphone, Mail, MessageSquare, Zap, ArrowUpRight, Plus, Play, Pause, BarChart3, Users, DollarSign, ExternalLink } from 'lucide-react'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { cn } from '@/lib/utils'

const campaignsData = [
  { id: 1, name: 'Eid Mega Sale 2026', type: 'Flash Sale', status: 'Active', budget: '৳ 50,000', spent: '৳ 12,450', conversions: 342, roi: '+240%', icon: Zap, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' },
  { id: 2, name: 'Welcome Email Series', type: 'Email Automation', status: 'Active', budget: 'Automated', spent: '৳ 0', conversions: 89, roi: 'N/A', icon: Mail, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
  { id: 3, name: 'Cart Abandonment SMS', type: 'SMS Retargeting', status: 'Paused', budget: '৳ 5,000/mo', spent: '৳ 1,200', conversions: 45, roi: '+180%', icon: MessageSquare, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' },
  { id: 4, name: 'Winter Collection Promo', type: 'Social Media', status: 'Draft', budget: '৳ 20,000', spent: '৳ 0', conversions: 0, roi: '-', icon: Megaphone, color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20' },
]

export default function MarketingPage() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 pt-4 pb-6">
        <div className="mb-2 space-y-2">
          <div className="h-8 w-48 rounded-md bg-white/10 animate-pulse" />
          <div className="h-4 w-96 rounded-md bg-white/10 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-card rounded-3xl p-6 h-[140px] animate-pulse bg-white/5" />
          ))}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="glass-card rounded-3xl p-6 h-[180px] animate-pulse bg-white/5" />
            ))}
          </div>
          <div className="xl:col-span-1 glass-card rounded-3xl p-6 h-[400px] animate-pulse bg-white/5" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 pt-4 pb-6">
      {/* Page Header */}
      <ScrollReveal delay={0.1}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Marketing Campaigns</h1>
            <p className="text-white/60 text-sm">Manage promotions, emails, SMS, and track your advertising ROI.</p>
          </div>
          
          <button className="flex items-center gap-2 h-10 px-6 rounded-xl bg-gradient-to-r from-[#7A1111] to-[#550000] text-sm font-medium text-white hover:shadow-[0_0_20px_rgba(122,17,17,0.4)] transition-all">
            <Plus className="w-4 h-4" />
            Create Campaign
          </button>
        </div>
      </ScrollReveal>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Total Ad Spend', value: '৳ 14,500', subtext: 'This month', icon: DollarSign, color: 'text-red-400', bg: 'bg-red-500/10' },
          { title: 'Marketing Revenue', value: '৳ 85,200', subtext: 'Attributed to campaigns', icon: BarChart3, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { title: 'Avg. ROAS', value: '5.8x', subtext: 'Return on Ad Spend', icon: ArrowUpRight, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { title: 'Total Leads Generated', value: '1,240', subtext: 'Emails & Phone numbers', icon: Users, color: 'text-amber-400', bg: 'bg-amber-500/10' }
        ].map((metric, i) => (
          <ScrollReveal key={i} delay={0.15 + (i * 0.1)}>
            <div className="glass-card rounded-3xl p-6 relative overflow-hidden group">
              {/* Background Glow */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-[30px] group-hover:bg-white/10 transition-colors pointer-events-none" />
              
              <div className="flex justify-between items-start mb-4">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", metric.bg)}>
                  <metric.icon className={cn("w-5 h-5", metric.color)} />
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-1">{metric.value}</h3>
              <p className="text-sm font-medium text-white/70">{metric.title}</p>
              <p className="text-xs text-white/40 mt-1">{metric.subtext}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Column: Campaigns List */}
        <div className="xl:col-span-2 space-y-6">
          <ScrollReveal delay={0.5} direction="up">
            <h2 className="text-lg font-medium text-white mb-2">Active & Recent Campaigns</h2>
            <div className="space-y-4">
              {campaignsData.map((campaign) => (
                <div key={campaign.id} className="glass-card rounded-3xl p-6 hover:bg-white/5 transition-colors border border-white/5 hover:border-white/10 group">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    
                    {/* Left: Info */}
                    <div className="flex items-start gap-4 flex-1">
                      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center border flex-shrink-0", campaign.bg, campaign.border)}>
                        <campaign.icon className={cn("w-5 h-5", campaign.color)} />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-base font-bold text-white group-hover:text-[#C52A35] transition-colors">{campaign.name}</h3>
                          <span className={cn(
                            "px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider",
                            campaign.status === 'Active' ? "bg-emerald-400/10 text-emerald-400" :
                            campaign.status === 'Paused' ? "bg-amber-400/10 text-amber-400" : "bg-white/10 text-white/50"
                          )}>
                            {campaign.status}
                          </span>
                        </div>
                        <p className="text-sm text-white/50">{campaign.type}</p>
                      </div>
                    </div>

                    {/* Middle: Stats */}
                    <div className="flex items-center gap-8 flex-1 lg:justify-end">
                      <div>
                        <p className="text-xs text-white/40 mb-1">Spent / Budget</p>
                        <p className="text-sm font-medium text-white">{campaign.spent} <span className="text-white/30">/ {campaign.budget}</span></p>
                      </div>
                      <div>
                        <p className="text-xs text-white/40 mb-1">Conversions</p>
                        <p className="text-sm font-bold text-emerald-400">{campaign.conversions}</p>
                      </div>
                      <div>
                        <p className="text-xs text-white/40 mb-1">ROI</p>
                        <p className={cn("text-sm font-bold", campaign.roi.startsWith('+') ? "text-emerald-400" : "text-white/50")}>
                          {campaign.roi}
                        </p>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2">
                      {campaign.status === 'Active' ? (
                        <button className="w-10 h-10 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 flex items-center justify-center transition-colors border border-amber-500/20" title="Pause Campaign">
                          <Pause className="w-4 h-4" />
                        </button>
                      ) : (
                        <button className="w-10 h-10 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 flex items-center justify-center transition-colors border border-emerald-500/20" title="Start Campaign">
                          <Play className="w-4 h-4" />
                        </button>
                      )}
                      <button className="h-10 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-colors border border-white/10">
                        View Report
                      </button>
                    </div>

                  </div>
                </div>
              ))}
            </div>
            
            <button className="w-full mt-4 py-3 rounded-2xl border border-dashed border-white/10 text-white/50 hover:text-white hover:bg-white/5 hover:border-white/30 transition-all text-sm font-medium">
              View All Campaigns
            </button>
          </ScrollReveal>
        </div>

        {/* Right Column: Quick Actions & Integrations */}
        <div className="xl:col-span-1 space-y-6">
          
          <ScrollReveal delay={0.6} direction="right">
            <div className="glass-card rounded-3xl p-6">
              <h2 className="text-lg font-medium text-white mb-4">Quick Tools</h2>
              <div className="grid grid-cols-2 gap-3">
                <button className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all flex flex-col items-center justify-center gap-3 text-center group">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Mail className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium text-white/70 group-hover:text-white transition-colors">Broadcast Email</span>
                </button>
                <button className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all flex flex-col items-center justify-center gap-3 text-center group">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium text-white/70 group-hover:text-white transition-colors">Send Bulk SMS</span>
                </button>
                <button className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all flex flex-col items-center justify-center gap-3 text-center group col-span-2">
                  <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Zap className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium text-white/70 group-hover:text-white transition-colors">Schedule Flash Sale</span>
                </button>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.7} direction="right">
            <div className="glass-card rounded-3xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-medium text-white">Integrations</h2>
                <button className="text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1">
                  Manage <ExternalLink className="w-3 h-3" />
                </button>
              </div>
              
              <div className="space-y-4">
                {[
                  { name: 'Meta Pixel (Facebook)', status: 'Connected', icon: 'M', color: 'bg-blue-600' },
                  { name: 'Google Analytics 4', status: 'Connected', icon: 'G', color: 'bg-amber-500' },
                  { name: 'Mailchimp', status: 'Disconnected', icon: 'MC', color: 'bg-yellow-400 text-black' },
                  { name: 'Bulk SMS BD', status: 'Connected', icon: 'S', color: 'bg-emerald-500' },
                ].map((integration, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white", integration.color)}>
                        {integration.icon}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{integration.name}</p>
                        <p className={cn(
                          "text-[10px] font-bold uppercase tracking-wider",
                          integration.status === 'Connected' ? "text-emerald-400" : "text-white/40"
                        )}>
                          {integration.status}
                        </p>
                      </div>
                    </div>
                    {integration.status === 'Connected' ? (
                      <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                    ) : (
                      <button className="text-xs font-medium text-white/50 hover:text-white bg-white/10 px-2 py-1 rounded transition-colors">
                        Connect
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </div>
  )
}
