"use client"

import React, { useState, useEffect } from 'react'
import { LifeBuoy, MessageSquare, Clock, CheckCircle2, AlertCircle, Search, Filter, Plus, User, MoreVertical, Paperclip, Send } from 'lucide-react'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { cn } from '@/lib/utils'

const ticketsData = [
  { id: 'TIC-1042', customer: 'Ahmed Hasan', email: 'ahmed@example.com', subject: 'Order not received yet', status: 'Open', priority: 'High', date: '10 mins ago', avatar: 'AH' },
  { id: 'TIC-1041', customer: 'Sadia Islam', email: 'sadia@example.com', subject: 'How to claim warranty?', status: 'Pending', priority: 'Medium', date: '2 hours ago', avatar: 'SI' },
  { id: 'TIC-1040', customer: 'Rahim Uddin', email: 'rahim@example.com', subject: 'Wrong item delivered', status: 'Open', priority: 'High', date: '5 hours ago', avatar: 'RU' },
  { id: 'TIC-1039', customer: 'Nusrat Jahan', email: 'nusrat@example.com', subject: 'Refund status', status: 'Resolved', priority: 'Low', date: '1 day ago', avatar: 'NJ' },
  { id: 'TIC-1038', customer: 'Kamrul Islam', email: 'kamrul@example.com', subject: 'Discount code not working', status: 'Resolved', priority: 'Medium', date: '2 days ago', avatar: 'KI' },
]

export default function SupportPage() {
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
            <div key={i} className="glass-card rounded-3xl p-6 h-[120px] animate-pulse bg-white/5" />
          ))}
        </div>
        <div className="glass-card rounded-3xl p-6 h-[500px] animate-pulse bg-white/5 mt-2" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 pt-4 pb-6">
      {/* Page Header */}
      <ScrollReveal delay={0.1}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
              <LifeBuoy className="w-6 h-6 text-white/70" />
              Customer Support
            </h1>
            <p className="text-white/60 text-sm">Manage customer inquiries, tickets, and provide fast assistance.</p>
          </div>
          
          <button className="flex items-center gap-2 h-10 px-6 rounded-xl bg-gradient-to-r from-[#7A1111] to-[#550000] text-sm font-medium text-white hover:shadow-[0_0_20px_rgba(122,17,17,0.4)] transition-all">
            <Plus className="w-4 h-4" />
            New Ticket
          </button>
        </div>
      </ScrollReveal>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Open Tickets', value: '12', icon: AlertCircle, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { title: 'Pending Response', value: '5', icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { title: 'Resolved (Today)', value: '28', icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { title: 'Avg Response Time', value: '1h 15m', icon: MessageSquare, color: 'text-purple-400', bg: 'bg-purple-500/10' }
        ].map((metric, i) => (
          <ScrollReveal key={i} delay={0.15 + (i * 0.1)}>
            <div className="glass-card rounded-3xl p-6 relative overflow-hidden group hover:border-white/20 transition-all">
              <div className="flex justify-between items-start mb-2">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", metric.bg)}>
                  <metric.icon className={cn("w-5 h-5", metric.color)} />
                </div>
                <h3 className="text-2xl font-bold text-white">{metric.value}</h3>
              </div>
              <p className="text-sm font-medium text-white/50">{metric.title}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>

      {/* Main Ticket Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Ticket List */}
        <div className="lg:col-span-2">
          <ScrollReveal delay={0.5} direction="left" className="h-full">
            <div className="glass-card rounded-3xl p-6 h-full flex flex-col">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <h2 className="text-lg font-medium text-white">Recent Tickets</h2>
                
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text" 
                      placeholder="Search tickets..." 
                      className="w-full sm:w-48 pl-9 pr-4 h-9 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-white/30 focus:bg-white/10 transition-colors"
                    />
                  </div>
                  <button className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors">
                    <Filter className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>

              <div className="w-full overflow-x-auto custom-scrollbar">
                <table className="w-full text-left min-w-[600px] border-separate" style={{ borderSpacing: '0 4px' }}>
                  <thead>
                    <tr>
                      <th className="pb-3 text-sm font-medium text-white/50 pl-4 border-b border-white/10">Customer / Subject</th>
                      <th className="pb-3 text-sm font-medium text-white/50 border-b border-white/10">Status</th>
                      <th className="pb-3 text-sm font-medium text-white/50 border-b border-white/10">Priority</th>
                      <th className="pb-3 text-sm font-medium text-white/50 border-b border-white/10 text-right pr-4">Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ticketsData.map((ticket, index) => (
                      <tr key={ticket.id} className={cn(
                        "group cursor-pointer transition-colors",
                        index === 0 ? "bg-white/5" : "hover:bg-white/5" // First item selected state
                      )}>
                        <td className="py-4 pl-4 rounded-l-2xl border-b border-white/5 group-hover:border-transparent">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7A1111]/40 to-[#550000]/40 flex items-center justify-center border border-[#7A1111]/20 font-bold text-white/80 text-xs">
                              {ticket.avatar}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white mb-0.5 group-hover:text-[#C52A35] transition-colors">{ticket.subject}</p>
                              <p className="text-xs text-white/50">{ticket.customer} • {ticket.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 border-b border-white/5 group-hover:border-transparent">
                          <span className={cn(
                            "px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider",
                            ticket.status === 'Open' ? "bg-amber-400/10 text-amber-400 border border-amber-400/20" :
                            ticket.status === 'Pending' ? "bg-blue-400/10 text-blue-400 border border-blue-400/20" :
                            "bg-emerald-400/10 text-emerald-400 border border-emerald-400/20"
                          )}>
                            {ticket.status}
                          </span>
                        </td>
                        <td className="py-4 border-b border-white/5 group-hover:border-transparent">
                          <span className={cn(
                            "flex items-center gap-1.5 text-xs font-medium",
                            ticket.priority === 'High' ? "text-red-400" :
                            ticket.priority === 'Medium' ? "text-amber-400" : "text-emerald-400"
                          )}>
                            <div className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              ticket.priority === 'High' ? "bg-red-400" :
                              ticket.priority === 'Medium' ? "bg-amber-400" : "bg-emerald-400"
                            )} />
                            {ticket.priority}
                          </span>
                        </td>
                        <td className="py-4 pr-4 rounded-r-2xl border-b border-white/5 group-hover:border-transparent text-right">
                          <span className="text-xs text-white/50">{ticket.date}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Quick Reply / Chat Interface */}
        <div className="lg:col-span-1 space-y-6">
          <ScrollReveal delay={0.6} direction="right" className="h-full">
            <div className="glass-card rounded-3xl p-0 h-full flex flex-col border border-white/10 overflow-hidden">
              
              {/* Header */}
              <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7A1111]/40 to-[#550000]/40 flex items-center justify-center border border-[#7A1111]/20 font-bold text-white/80 text-xs">
                    AH
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Ahmed Hasan</h3>
                    <p className="text-[10px] text-white/50 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Online
                    </p>
                  </div>
                </div>
                <button className="text-white/40 hover:text-white transition-colors">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>

              {/* Chat Body */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar max-h-[350px]">
                {/* Customer Message */}
                <div className="flex flex-col items-start max-w-[85%]">
                  <span className="text-[10px] text-white/30 mb-1 ml-1">10 mins ago</span>
                  <div className="p-3 rounded-2xl rounded-tl-sm bg-white/5 border border-white/5 text-sm text-white/80">
                    Hello, I ordered a headphone (Order #7829) 3 days ago but haven't received it yet. Can you check the status?
                  </div>
                </div>

                {/* System Message */}
                <div className="flex flex-col items-center justify-center my-4">
                  <span className="text-[10px] font-medium text-white/30 bg-white/5 px-2 py-1 rounded-full">
                    Order #7829 is marked as "Shipped"
                  </span>
                </div>

                {/* Admin Reply Mock */}
                <div className="flex flex-col items-end max-w-[85%] self-end ml-auto">
                  <span className="text-[10px] text-white/30 mb-1 mr-1">Just now</span>
                  <div className="p-3 rounded-2xl rounded-tr-sm bg-[#550000]/40 border border-[#C52A35]/30 text-sm text-white">
                    Hi Ahmed, apologize for the delay. Let me check with the Steadfast courier team right away.
                  </div>
                </div>
              </div>

              {/* Input Area */}
              <div className="p-3 border-t border-white/10 bg-white/5">
                <div className="flex items-center gap-2 p-2 rounded-xl bg-[#0a0202] border border-white/10">
                  <button className="p-2 text-white/40 hover:text-white transition-colors">
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <input 
                    type="text" 
                    placeholder="Type your reply..." 
                    className="flex-1 bg-transparent text-sm text-white focus:outline-none placeholder:text-white/30"
                  />
                  <button className="p-2 bg-[#C52A35] text-white rounded-lg hover:bg-red-600 transition-colors">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          </ScrollReveal>
        </div>
      </div>
    </div>
  )
}
