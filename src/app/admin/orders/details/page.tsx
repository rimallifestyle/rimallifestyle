"use client"

import React, { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { ArrowLeft, Printer, ShoppingBag, Truck, CreditCard, User, MapPin, Phone, Mail, Clock, CheckCircle2 } from 'lucide-react'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { toast } from 'sonner'

function OrderDetailsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const id = searchParams.get('id')
  
  const [isLoading, setIsLoading] = useState(true)
  const [order, setOrder] = useState<any>(null)
  
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState('')
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

  useEffect(() => {
    async function fetchOrder() {
      if (!id) return;
      try {
        const res = await fetch(`/api/admin/orders/${id}`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setOrder(data);
          setSelectedStatus(data.status);
        }
      } catch (err) {
        console.error("Failed to fetch order", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchOrder();
  }, [id])

  const handleUpdateStatus = async () => {
    if (!selectedStatus || selectedStatus === order.status) {
      setIsStatusModalOpen(false);
      return;
    }
    setIsUpdatingStatus(true);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: selectedStatus })
      });
      if (res.ok) {
        setOrder({ ...order, status: selectedStatus });
        setIsStatusModalOpen(false);
        toast.success(`Order status updated to ${selectedStatus}!`);
      } else {
        toast.error('Failed to update status.');
      }
    } catch (err) {
      console.error("Failed to update status", err);
      toast.error('Error updating status.');
    } finally {
      setIsUpdatingStatus(false);
    }
  }

  if (isLoading || !order) {
    return (
      <div className="flex flex-col gap-6 pt-4 pb-6">
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <div className="h-6 w-24 bg-white/10 animate-pulse rounded" />
            <div className="h-8 w-64 bg-white/10 animate-pulse rounded" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-white/5 animate-pulse rounded-3xl" />
          <div className="h-96 bg-white/5 animate-pulse rounded-3xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 pt-4 pb-6 font-sans max-w-6xl mx-auto">
      
      {/* Header */}
      <ScrollReveal>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div className="space-y-3">
            <button 
              onClick={() => router.push('/admin/orders')}
              className="flex items-center gap-2 text-sm font-medium text-white/50 hover:text-white transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Orders
            </button>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-display font-bold text-white tracking-tight">
                Order {order.orderId}
              </h1>
              <span className={cn(
                "px-3 py-1 text-xs font-semibold rounded-full border uppercase tracking-wider",
                order.status === 'delivered' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                order.status === 'shipped' ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                order.status === 'cancelled' ? "bg-red-500/10 text-red-500 border-red-500/20" :
                order.status === 'processing' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                "bg-white/10 text-white border-white/20"
              )}>
                {order.status}
              </span>
            </div>
            <p className="text-sm text-white/50 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Placed on {format(new Date(order.createdAt), 'PPP at p')}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center justify-center gap-2 h-10 px-6 rounded-full bg-white/5 text-sm font-medium text-white hover:bg-white/10 border border-white/10 transition-all">
              <Printer className="w-4 h-4" />
              Print Invoice
            </button>
            <button 
              onClick={() => setIsStatusModalOpen(true)}
              className="flex items-center justify-center gap-2 h-10 px-6 rounded-full bg-gradient-to-r from-[#7A1111] to-[#550000] text-sm font-medium text-white hover:shadow-[0_0_20px_rgba(122,17,17,0.4)] transition-all"
            >
              Update Status
            </button>
          </div>
        </div>
      </ScrollReveal>

      {/* Status Update Modal */}
      {isStatusModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass-card bg-[#0a0a0a]/95 border border-white/10 rounded-3xl w-full max-w-sm p-6 shadow-2xl relative animate-in zoom-in-95 duration-300">
            <h3 className="text-xl font-bold text-white mb-2">Update Order Status</h3>
            <p className="text-sm text-white/50 mb-6">Select the new status for order {order.orderId}</p>
            
            <div className="space-y-3 mb-6">
              {statuses.map(s => (
                <label key={s} className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${selectedStatus === s ? 'bg-gradient-to-r from-[#7A1111]/20 to-[#550000]/20 border-[#C52A35]/50 text-white shadow-[0_0_15px_rgba(197,42,53,0.1)]' : 'bg-white/5 border-white/5 text-white/70 hover:bg-white/10 hover:border-white/10'}`}>
                  <input 
                    type="radio" 
                    name="status" 
                    value={s} 
                    checked={selectedStatus === s} 
                    onChange={() => setSelectedStatus(s)}
                    className="w-5 h-5 accent-[#C52A35]"
                  />
                  <span className="capitalize font-medium text-base">{s}</span>
                </label>
              ))}
            </div>

            <div className="flex gap-3 pt-2 border-t border-white/5">
              <button 
                onClick={() => { setIsStatusModalOpen(false); setSelectedStatus(order.status); }}
                className="flex-1 py-3 rounded-full border border-white/10 text-white/70 hover:text-white hover:bg-white/5 transition-all text-sm font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={handleUpdateStatus}
                disabled={isUpdatingStatus || selectedStatus === order.status}
                className="flex-1 py-3 rounded-full bg-gradient-to-r from-[#7A1111] to-[#550000] text-white hover:shadow-[0_0_20px_rgba(122,17,17,0.4)] transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdatingStatus ? 'Updating...' : 'Confirm Update'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Items & Timeline) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Order Items */}
          <ScrollReveal delay={0.2} direction="up">
            <div className="glass-card rounded-3xl p-6">
              <h2 className="text-lg font-medium text-white mb-6 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#C52A35]" />
                Order Items ({order.cart?.length || 0})
              </h2>

              <div className="w-full overflow-x-auto custom-scrollbar">
                <table className="w-full text-left min-w-[500px]">
                  <thead>
                    <tr>
                      <th className="pb-3 text-sm font-medium text-white/50 border-b border-white/10">Product</th>
                      <th className="pb-3 text-sm font-medium text-white/50 border-b border-white/10 text-center">Price</th>
                      <th className="pb-3 text-sm font-medium text-white/50 border-b border-white/10 text-center">Qty</th>
                      <th className="pb-3 text-sm font-medium text-white/50 border-b border-white/10 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {order.cart?.map((item: any, idx: number) => (
                      <tr key={idx}>
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 overflow-hidden">
                              <img src={item.product?.image || item.product?.images?.[0] || "https://via.placeholder.com/100"} alt={item.product?.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white">{item.product?.name}</p>
                              <p className="text-xs text-white/50">{item.size ? `Size: ${item.size}` : "Default"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 text-sm text-white/70 text-center">৳ {item.product?.price?.toLocaleString()}</td>
                        <td className="py-4 text-sm text-white/70 text-center">{item.quantity}</td>
                        <td className="py-4 text-sm font-medium text-white text-right">৳ {((item.product?.price || 0) * item.quantity)?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Order Summary Calculation */}
              <div className="mt-6 pt-6 border-t border-white/10 flex justify-end">
                <div className="w-full sm:w-64 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/60">Subtotal</span>
                    <span className="text-white">৳ {order.subTotal?.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/60">Shipping</span>
                    <span className="text-white">৳ {order.shippingFee?.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-white/5 text-base font-bold">
                    <span className="text-white">Total</span>
                    <span className="text-[#C52A35]">৳ {order.total?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Order Timeline */}
          <ScrollReveal delay={0.3} direction="up">
            <div className="glass-card rounded-3xl p-6">
              <h2 className="text-lg font-medium text-white mb-6 flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#C52A35]" />
                Order Timeline
              </h2>

              <div className="relative pl-6 space-y-6">
                {/* Vertical Line */}
                <div className="absolute left-[11px] top-2 bottom-2 w-px bg-white/10" />

                <div className="relative">
                  <div className="absolute -left-[31px] top-1 w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                  </div>
                  <p className="text-sm font-medium text-white">Order Processing</p>
                  <p className="text-xs text-white/50 mt-1">Payment verified. Preparing for shipment.</p>
                  <p className="text-[10px] text-white/30 mt-1">Today, 11:30 AM</p>
                </div>

                <div className="relative">
                  <div className="absolute -left-[31px] top-1 w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  </div>
                  <p className="text-sm font-medium text-white">Order Placed</p>
                  <p className="text-xs text-white/50 mt-1">Order has been placed by the customer.</p>
                  <p className="text-[10px] text-white/30 mt-1">Today, 10:45 AM</p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Right Column (Customer & Shipping) */}
        <div className="space-y-6">
          
          {/* Customer Details */}
          <ScrollReveal delay={0.25} direction="right">
            <div className="glass-card rounded-3xl p-6">
              <h2 className="text-lg font-medium text-white mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-[#C52A35]" />
                Customer
              </h2>

              <div className="flex items-center gap-4 mb-6">
                <Avatar className="w-12 h-12 border border-white/20 bg-white/5">
                  {order.customerAvatar && <AvatarImage src={order.customerAvatar} alt={order.userProfileName || order.customerName} />}
                  <AvatarFallback className="bg-transparent text-white/70">{(order.userProfileName || order.customerName)?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-white">{order.userProfileName || order.customerName}</p>
                  <p className="text-xs text-white/50">{order.isGuest === false ? 'Registered Customer' : 'Guest Checkout'}</p>
                </div>
              </div>

              <div className="space-y-3">
                {order.userEmail && (
                  <div className="flex items-center gap-3 text-sm text-white/70">
                    <Mail className="w-4 h-4 text-white/40" />
                    <a href={`mailto:${order.userEmail}`} className="hover:text-white transition-colors">{order.userEmail}</a>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm text-white/70">
                  <Phone className="w-4 h-4 text-white/40" />
                  <a href={`tel:${order.customerPhone}`} className="hover:text-white transition-colors">{order.customerPhone}</a>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Shipping Details */}
          <ScrollReveal delay={0.35} direction="right">
            <div className="glass-card rounded-3xl p-6">
              <h2 className="text-lg font-medium text-white mb-6 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#C52A35]" />
                Shipping Details
              </h2>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                  <p className="text-sm font-medium text-white">Delivery Address</p>
                  <p className="text-sm text-white/60 leading-relaxed">
                    {order.customerAddress}
                  </p>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                  <div>
                    <p className="text-sm font-medium text-white">Shipping Method</p>
                    <p className="text-xs text-white/50">Standard Delivery</p>
                  </div>
                  <span className="text-sm font-bold text-[#C52A35]">৳ {order.shippingFee}</span>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Payment Method */}
          <ScrollReveal delay={0.45} direction="right">
            <div className="glass-card rounded-3xl p-6">
              <h2 className="text-lg font-medium text-white mb-6 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#C52A35]" />
                Payment Info
              </h2>
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#550000]/20 flex items-center justify-center border border-[#C52A35]/30">
                    <span className="text-[#C52A35] font-bold text-xs">COD</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{order.paymentMethod}</p>
                    <p className="text-xs text-white/50">Payment on delivery</p>
                  </div>
                </div>
                <span className={cn(
                  "px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider",
                  order.paymentStatus === 'paid' ? "bg-emerald-500/10 text-emerald-500" :
                  order.paymentStatus === 'pending' ? "bg-amber-500/10 text-amber-500" :
                  "bg-red-500/10 text-red-500"
                )}>
                  {order.paymentStatus}
                </span>
              </div>
            </div>
          </ScrollReveal>
        </div>

      </div>
    </div>
  )
}

export default function OrderDetailsPage() {
  return (
    <React.Suspense fallback={
      <div className="flex flex-col gap-6 pt-4 pb-6">
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <div className="h-6 w-24 bg-white/10 animate-pulse rounded" />
            <div className="h-8 w-64 bg-white/10 animate-pulse rounded" />
          </div>
        </div>
      </div>
    }>
      <OrderDetailsContent />
    </React.Suspense>
  )
}
