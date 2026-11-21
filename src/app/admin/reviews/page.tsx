"use client"

import React, { useState, useEffect } from 'react'
import { Star, Search, Filter, MoreHorizontal, Check, X, MessageSquareReply, AlertTriangle, ShieldCheck, Clock, Trash2 } from 'lucide-react'
import { KpiCard } from '@/components/admin/dashboard/KpiCard'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { KpiSkeleton, TableSkeleton } from '@/components/ui/Skeleton'
import { cn } from '@/lib/utils'
import { fetchWithAuth } from '@/lib/api'

// Helper component for Star Rating
const RatingStars = ({ rating }: { rating: number }) => {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star 
          key={star} 
          className={cn(
            "w-3.5 h-3.5",
            star <= rating 
              ? "fill-amber-400 text-amber-400" 
              : "fill-white/10 text-white/20"
          )} 
        />
      ))}
    </div>
  )
}

export default function ReviewsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [reviews, setReviews] = useState<any[]>([])
  const [actionLoading, setActionLoading] = useState<number | null>(null)

  const loadReviews = async () => {
    try {
      setIsLoading(true)
      const data = await fetchWithAuth('/wp/v2/comments?_embed=1&per_page=100') // Removed status=all to ensure it works even if auth is slightly off. Pending reviews will only show if auth is fully working via WP.
      
      if (!Array.isArray(data)) {
        console.error('Failed to fetch reviews:', data);
        setReviews([]);
        setIsLoading(false);
        return;
      }

      const mapped = data.map((comment: any) => {
        let status = 'Pending'
        if (comment.status === 'approved') status = 'Approved'
        else if (comment.status === 'spam') status = 'Spam'
        else if (comment.status === 'trash') status = 'Trash'

        // Strip html
        const textContent = comment.content?.rendered?.replace(/<[^>]+>/g, '') || ''

        // Use custom product_info field
        const productTitle = comment.product_info?.title || 'Unknown Product'
        const productImgUrl = comment.product_info?.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&q=80'

        return {
          id: comment.id,
          reviewer: comment.author_name || 'Anonymous',
          avatarUrl: comment.author_avatar_urls?.['48'],
          rating: comment.rating || 5,
          comment: textContent,
          product: productTitle,
          productImg: productImgUrl,
          date: new Date(comment.date).toLocaleDateString(),
          status,
        }
      })
      setReviews(mapped)
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadReviews()
  }, [])

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      setActionLoading(id)
      await fetchWithAuth(`/wp/v2/comments/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      })
      await loadReviews()
    } catch(e) {
      console.error(e)
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      setActionLoading(id)
      await fetchWithAuth(`/wp/v2/comments/${id}?force=true`, {
        method: 'DELETE',
      })
      await loadReviews()
    } catch(e) {
      console.error(e)
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusConfig = (status: string) => {
    switch(status) {
      case 'Approved': return { color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20', icon: ShieldCheck }
      case 'Pending': return { color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20', icon: Clock }
      case 'Spam': return { color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20', icon: AlertTriangle }
      default: return { color: 'text-white/70', bg: 'bg-white/10', border: 'border-white/20', icon: Clock }
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 pt-4 pb-6">
        <div className="mb-2 space-y-2">
          <div className="h-8 w-48 rounded-md bg-white/10 animate-pulse" />
          <div className="h-4 w-96 rounded-md bg-white/10 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <KpiSkeleton />
          <KpiSkeleton />
          <KpiSkeleton />
        </div>
        <TableSkeleton />
      </div>
    )
  }

  const approvedReviews = reviews.filter(r => r.status === 'Approved')
  const avgRating = approvedReviews.length > 0 
    ? (approvedReviews.reduce((acc, r) => acc + r.rating, 0) / approvedReviews.length).toFixed(1)
    : "0"
  
  const pendingCount = reviews.filter(r => r.status === 'Pending').length
  const approvalRate = reviews.length > 0 ? Math.round((approvedReviews.length / reviews.length) * 100) : 0

  return (
    <div className="flex flex-col gap-6 pt-4 pb-6">
      {/* Page Header */}
      <ScrollReveal delay={0.1}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Reviews</h1>
            <p className="text-white/60 text-sm">Manage customer reviews and store ratings.</p>
          </div>
        </div>
      </ScrollReveal>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ScrollReveal delay={0.15}>
          <KpiCard title="Average Rating" value={avgRating} change="" isPositive={true} comparison="overall" icon={<Star className="w-5 h-5 fill-amber-400 text-amber-400" />} />
        </ScrollReveal>
        <ScrollReveal delay={0.25}>
          <KpiCard title="Total Reviews" value={reviews.length.toString()} change={`${pendingCount} new`} isPositive={true} comparison="needs approval" icon={<MessageSquareReply className="w-5 h-5" />} />
        </ScrollReveal>
        <ScrollReveal delay={0.35}>
          <KpiCard title="Approval Rate" value={`${approvalRate}%`} change="Stable" isPositive={true} comparison="overall" icon={<ShieldCheck className="w-5 h-5" />} />
        </ScrollReveal>
      </div>

      {/* Reviews Table */}
      <ScrollReveal delay={0.2}>
        <div className="glass-card rounded-3xl p-6 mt-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            <div className="flex gap-4">
              <button className="text-sm font-medium text-white border-b-2 border-[#C52A35] pb-1">All ({reviews.length})</button>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative group">
                <Search className="w-4 h-4 text-white/50 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-white transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search reviews..." 
                  className="w-full sm:w-64 h-10 pl-10 pr-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 focus:bg-white/10 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="w-full overflow-x-auto custom-scrollbar">
            <table className="w-full text-left min-w-[1000px] border-separate" style={{ borderSpacing: '0 4px' }}>
              <thead>
                <tr>
                  <th className="pb-3 text-sm font-medium text-white/50 pl-4 border-b border-white/10 w-1/4">Reviewer</th>
                  <th className="pb-3 text-sm font-medium text-white/50 border-b border-white/10 w-2/5">Review</th>
                  <th className="pb-3 text-sm font-medium text-white/50 border-b border-white/10">Product</th>
                  <th className="pb-3 text-sm font-medium text-white/50 border-b border-white/10">Status</th>
                  <th className="pb-3 text-sm font-medium text-white/50 text-right pr-4 border-b border-white/10">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((review) => {
                  const statusConfig = getStatusConfig(review.status)
                  const StatusIcon = statusConfig.icon
                  
                  return (
                    <tr key={review.id} className={`group cursor-pointer ${actionLoading === review.id ? 'opacity-50' : ''}`}>
                      {/* Reviewer */}
                      <td className="py-4 pl-4 rounded-l-2xl bg-transparent group-hover:bg-white/5 transition-colors border-b border-white/5 group-hover:border-transparent align-top pt-5">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10 border border-white/10">
                            {review.avatarUrl ? (
                              <AvatarImage src={review.avatarUrl} />
                            ) : (
                              <AvatarFallback>{review.reviewer.charAt(0)}</AvatarFallback>
                            )}
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium text-white group-hover:text-[#C52A35] transition-colors">{review.reviewer}</p>
                            <p className="text-xs text-white/40">{review.date}</p>
                          </div>
                        </div>
                      </td>

                      {/* Review Content */}
                      <td className="py-4 bg-transparent group-hover:bg-white/5 transition-colors border-b border-white/5 group-hover:border-transparent pr-4">
                        <div className="mb-2">
                          <RatingStars rating={review.rating} />
                        </div>
                        <p className={cn(
                          "text-sm leading-relaxed",
                          review.status === 'Spam' ? "text-red-300/70 italic" : "text-white/70"
                        )}>
                          "{review.comment}"
                        </p>
                      </td>

                      {/* Product */}
                      <td className="py-4 bg-transparent group-hover:bg-white/5 transition-colors border-b border-white/5 group-hover:border-transparent align-top pt-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 overflow-hidden flex-shrink-0">
                            <img src={review.productImg} alt={review.product} className="w-full h-full object-cover" />
                          </div>
                          <p className="text-xs font-medium text-white/80 leading-tight hover:text-white transition-colors cursor-pointer line-clamp-2 max-w-[120px]">
                            {review.product}
                          </p>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 bg-transparent group-hover:bg-white/5 transition-colors border-b border-white/5 group-hover:border-transparent align-top pt-6">
                        <span className={cn(
                          "px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 w-fit border",
                          statusConfig.bg, statusConfig.color, statusConfig.border
                        )}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {review.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 pr-4 rounded-r-2xl bg-transparent group-hover:bg-white/5 transition-colors border-b border-white/5 group-hover:border-transparent align-top pt-5">
                        <div className="flex items-center justify-end gap-1">
                          {review.status === 'Pending' && (
                            <button onClick={() => handleStatusChange(review.id, 'approve')} className="p-2 rounded-lg hover:bg-emerald-400/20 text-white/50 hover:text-emerald-400 transition-colors" title="Approve">
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          {review.status === 'Approved' && (
                            <button onClick={() => handleStatusChange(review.id, 'hold')} className="p-2 rounded-lg hover:bg-amber-400/20 text-white/50 hover:text-amber-400 transition-colors" title="Unapprove / Hold">
                              <X className="w-4 h-4" />
                            </button>
                          )}
                          {review.status !== 'Spam' && (
                            <button onClick={() => handleStatusChange(review.id, 'spam')} className="p-2 rounded-lg hover:bg-red-400/20 text-white/50 hover:text-red-400 transition-colors" title="Mark as Spam">
                              <AlertTriangle className="w-4 h-4" />
                            </button>
                          )}
                          <button onClick={() => handleDelete(review.id)} className="p-2 rounded-lg hover:bg-red-400/20 text-white/50 hover:text-red-400 transition-colors" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          
        </div>
      </ScrollReveal>
    </div>
  )
}
