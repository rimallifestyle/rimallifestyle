"use client"

import React, { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { 
  ArrowLeft, Printer, ShoppingBag, Truck, CreditCard, User, MapPin, 
  Phone, Mail, Clock, CheckCircle2, Trash2, ExternalLink, Copy, Check, AlertCircle, X, ShieldCheck
} from 'lucide-react'
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
  
  // Status Modal State
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState('')
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Courier Dispatch State
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false)
  const [isDispatching, setIsDispatching] = useState(false)
  const [courierProvider, setCourierProvider] = useState<'steadfast' | 'pathao'>('steadfast')
  const [courierSettings, setCourierSettings] = useState<any>(null)
  const [dispatchForm, setDispatchForm] = useState({
    recipientName: '',
    recipientPhone: '',
    recipientAddress: '',
    codAmount: 0,
    note: ''
  })
  const [isCopied, setIsCopied] = useState(false)

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
          setDispatchForm({
            recipientName: data.customerName || '',
            recipientPhone: data.customerPhone || '',
            recipientAddress: data.customerAddress || '',
            codAmount: data.paymentStatus === 'paid' ? 0 : data.total || 0,
            note: `Order ${data.orderId} - Rimal Lifestyle`
          });
        }
      } catch (err) {
        console.error("Failed to fetch order", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchOrder();

    // Fetch courier settings to know if Steadfast/Pathao are configured
    async function fetchCouriers() {
      try {
        const res = await fetch('/api/admin/courier/settings', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setCourierSettings(data.settings);
        }
      } catch (err) {
        console.error("Failed to fetch courier settings", err);
      }
    }
    fetchCouriers();
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

  const handleDeleteOrder = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast.success("Order deleted successfully!");
        router.push('/admin/orders');
      } else {
        toast.error("Failed to delete order.");
      }
    } catch (err) {
      console.error("Error deleting order:", err);
      toast.error("An error occurred while deleting the order.");
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  const handleDispatchOrder = async () => {
    setIsDispatching(true);
    try {
      const res = await fetch('/api/admin/courier/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order._id || order.orderId,
          courierProvider,
          recipientName: dispatchForm.recipientName,
          recipientPhone: dispatchForm.recipientPhone,
          recipientAddress: dispatchForm.recipientAddress,
          codAmount: Number(dispatchForm.codAmount),
          note: dispatchForm.note,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(data.message || `Dispatched to ${courierProvider === 'steadfast' ? 'Steadfast' : 'Pathao'} successfully!`);
        if (data.order) {
          setOrder(data.order);
        } else {
          setOrder({
            ...order,
            status: 'shipped',
            courier: {
              provider: courierProvider,
              trackingCode: data.trackingCode || `TRK-${order.orderId}`,
              consignmentId: data.consignmentId,
              dispatchedAt: new Date(),
              status: 'in_transit'
            }
          });
        }
        setIsDispatchModalOpen(false);
      } else {
        toast.error(data.message || 'Courier dispatch failed.');
      }
    } catch (err: any) {
      console.error("Dispatch error:", err);
      toast.error(err.message || 'Network error during dispatch.');
    } finally {
      setIsDispatching(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    toast.success("Tracking code copied to clipboard!");
    setTimeout(() => setIsCopied(false), 2000);
  };

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

  const isDispatched = Boolean(order.courier?.trackingCode || order.courier?.consignmentId);
  const isSteadfastConfigured = courierSettings?.steadfast?.isConfigured && courierSettings?.steadfast?.isActive;
  const isPathaoConfigured = courierSettings?.pathao?.isConfigured && courierSettings?.pathao?.isActive;

  return (
    <div className="flex flex-col gap-6 pt-4 pb-6 font-sans w-full">
      
      {/* Header */}
      <ScrollReveal>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div className="space-y-3">
            <button 
              onClick={() => router.push('/admin/orders')}
              className="flex items-center gap-2 text-sm font-medium text-white/50 hover:text-white transition-colors group cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Orders
            </button>
            <div className="flex items-center gap-3 flex-wrap">
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

              {isDispatched && (
                <span className="px-3 py-1 text-xs font-bold rounded-full border border-emerald-400/30 bg-emerald-500/10 text-emerald-400 flex items-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Dispatched via {order.courier.provider === 'steadfast' ? 'Steadfast' : 'Pathao'}
                </span>
              )}
            </div>
            <p className="text-sm text-white/50 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Placed on {format(new Date(order.createdAt), 'PPP at p')}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Courier Dispatch Action */}
            {isDispatched ? (
              <a 
                href={order.courier.provider === 'steadfast' 
                  ? `https://steadfast.com.bd/t/${order.courier.trackingCode}` 
                  : 'https://pathao.com/courier-tracking/'
                }
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 h-10 px-5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-sm font-semibold transition-all cursor-pointer"
              >
                <Truck className="w-4 h-4" />
                <span>Track Parcel ({order.courier.provider})</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ) : (
              <button 
                onClick={() => setIsDispatchModalOpen(true)}
                className="flex items-center justify-center gap-2 h-10 px-5 rounded-full bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 hover:opacity-95 text-sm font-bold text-white shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all cursor-pointer"
              >
                <Truck className="w-4 h-4" />
                <span>Dispatch to Courier</span>
              </button>
            )}

            <button className="flex items-center justify-center gap-2 h-10 px-5 rounded-full bg-white/5 text-sm font-medium text-white hover:bg-white/10 border border-white/10 transition-all cursor-pointer">
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print Invoice</span>
            </button>
            
            <button 
              onClick={() => setIsStatusModalOpen(true)}
              className="flex items-center justify-center gap-2 h-10 px-6 rounded-full bg-gradient-to-r from-[#7A1111] to-[#550000] text-sm font-medium text-white hover:shadow-[0_0_20px_rgba(122,17,17,0.4)] transition-all cursor-pointer"
            >
              Update Status
            </button>

            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(true)}
              className="flex items-center justify-center gap-2 h-10 px-4 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/30 text-sm font-medium transition-all cursor-pointer"
              title="Delete Order"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Delete Order</span>
            </button>
          </div>
        </div>
      </ScrollReveal>

      {/* Courier Dispatch Modal */}
      {isDispatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass-card bg-[#0e0303]/95 border border-white/15 rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto custom-scrollbar">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Direct Courier Dispatch</h3>
                  <p className="text-xs text-white/50">Send parcel consignment directly to courier API</p>
                </div>
              </div>
              <button 
                onClick={() => setIsDispatchModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Courier Selection Tabs */}
            <div className="space-y-4 mb-6">
              <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">
                Select Courier Partner
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setCourierProvider('steadfast')}
                  className={cn(
                    "p-4 rounded-2xl border text-left transition-all cursor-pointer relative",
                    courierProvider === 'steadfast'
                      ? "bg-emerald-500/10 border-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                      : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm">Steadfast</span>
                    {isSteadfastConfigured ? (
                      <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/20 px-2 py-0.5 rounded-full">Ready</span>
                    ) : (
                      <span className="text-[10px] text-amber-400 font-bold bg-amber-500/20 px-2 py-0.5 rounded-full">Not Set</span>
                    )}
                  </div>
                  <p className="text-xs text-white/50">Steadfast Courier API</p>
                </button>

                <button
                  type="button"
                  onClick={() => setCourierProvider('pathao')}
                  className={cn(
                    "p-4 rounded-2xl border text-left transition-all cursor-pointer relative",
                    courierProvider === 'pathao'
                      ? "bg-rose-500/10 border-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.2)]"
                      : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm">Pathao</span>
                    {isPathaoConfigured ? (
                      <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/20 px-2 py-0.5 rounded-full">Ready</span>
                    ) : (
                      <span className="text-[10px] text-amber-400 font-bold bg-amber-500/20 px-2 py-0.5 rounded-full">Not Set</span>
                    )}
                  </div>
                  <p className="text-xs text-white/50">Pathao Logistics API</p>
                </button>
              </div>

              {((courierProvider === 'steadfast' && !isSteadfastConfigured) || 
                (courierProvider === 'pathao' && !isPathaoConfigured)) && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2.5 text-xs text-amber-300">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>
                    {courierProvider === 'steadfast' ? 'Steadfast' : 'Pathao'} is not configured. Configure credentials in <a href="/admin/couriers" className="underline font-bold text-amber-200">Admin &gt; Couriers</a>.
                  </span>
                </div>
              )}
            </div>

            {/* Form Inputs */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-1">
                    Invoice / Order ID
                  </label>
                  <input 
                    type="text" 
                    readOnly 
                    value={order.orderId}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gold font-mono font-bold text-sm focus:outline-none cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-1">
                    COD Amount (৳) *
                  </label>
                  <input 
                    type="number" 
                    value={dispatchForm.codAmount}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, codAmount: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-1">
                    Recipient Name *
                  </label>
                  <input 
                    type="text" 
                    value={dispatchForm.recipientName}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, recipientName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-1">
                    Recipient Phone *
                  </label>
                  <input 
                    type="text" 
                    value={dispatchForm.recipientPhone}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, recipientPhone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-1">
                  Delivery Address *
                </label>
                <textarea 
                  rows={2}
                  value={dispatchForm.recipientAddress}
                  onChange={(e) => setDispatchForm({ ...dispatchForm, recipientAddress: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500 custom-scrollbar"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-1">
                  Parcel Special Note
                </label>
                <input 
                  type="text" 
                  value={dispatchForm.note}
                  onChange={(e) => setDispatchForm({ ...dispatchForm, note: e.target.value })}
                  placeholder="e.g. Fragile / Handle with care"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-3 pt-6 mt-6 border-t border-white/10">
              <button 
                type="button"
                onClick={() => setIsDispatchModalOpen(false)}
                disabled={isDispatching}
                className="flex-1 py-3 rounded-full border border-white/10 text-white/70 hover:text-white hover:bg-white/5 transition-all text-sm font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleDispatchOrder}
                disabled={isDispatching}
                className="flex-1 py-3 rounded-full bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 hover:opacity-95 text-white shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all text-sm font-bold disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                {isDispatching ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Dispatching...</span>
                  </>
                ) : (
                  <>
                    <Truck className="w-4 h-4" />
                    <span>Confirm &amp; Dispatch</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass-card bg-[#0e0303]/95 border border-red-500/30 rounded-3xl w-full max-w-sm p-6 shadow-2xl relative animate-in zoom-in-95 duration-300">
            <div className="w-12 h-12 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 mb-4 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white text-center mb-2">Delete Order?</h3>
            <p className="text-sm text-white/60 text-center mb-6">
              Are you sure you want to permanently delete order <span className="text-white font-mono font-semibold">{order.orderId}</span>? This action cannot be undone.
            </p>
            
            <div className="flex gap-3 pt-2">
              <button 
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isDeleting}
                className="flex-1 py-3 rounded-full border border-white/10 text-white/70 hover:text-white hover:bg-white/5 transition-all text-sm font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleDeleteOrder}
                disabled={isDeleting}
                className="flex-1 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all text-sm font-medium disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

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
                className="flex-1 py-3 rounded-full border border-white/10 text-white/70 hover:text-white hover:bg-white/5 transition-all text-sm font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleUpdateStatus}
                disabled={isUpdatingStatus || selectedStatus === order.status}
                className="flex-1 py-3 rounded-full bg-gradient-to-r from-[#7A1111] to-[#550000] text-white hover:shadow-[0_0_20px_rgba(122,17,17,0.4)] transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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

                {/* Dispatched to Courier (if present) */}
                {isDispatched && (
                  <div className="relative">
                    <div className="absolute -left-[31px] top-1 w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    </div>
                    <p className="text-sm font-semibold text-emerald-400">
                      Dispatched to {order.courier.provider === 'steadfast' ? 'Steadfast Courier' : 'Pathao Courier'}
                    </p>
                    <p className="text-xs text-white/60 mt-1">
                      Tracking Code: <span className="font-mono text-white">{order.courier.trackingCode}</span>
                    </p>
                    <p className="text-[10px] text-white/40 mt-1">
                      {order.courier.dispatchedAt ? format(new Date(order.courier.dispatchedAt), 'PPP at p') : 'Recently dispatched'}
                    </p>
                  </div>
                )}

                <div className="relative">
                  <div className="absolute -left-[31px] top-1 w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                  </div>
                  <p className="text-sm font-medium text-white">Order Processing</p>
                  <p className="text-xs text-white/50 mt-1">Order verified by warehouse team.</p>
                  <p className="text-[10px] text-white/30 mt-1">{format(new Date(order.createdAt), 'PPP at p')}</p>
                </div>

                <div className="relative">
                  <div className="absolute -left-[31px] top-1 w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  </div>
                  <p className="text-sm font-medium text-white">Order Placed</p>
                  <p className="text-xs text-white/50 mt-1">Customer placed order {order.orderId}.</p>
                  <p className="text-[10px] text-white/30 mt-1">{format(new Date(order.createdAt), 'PPP at p')}</p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Right Column (Courier Status, Customer & Shipping) */}
        <div className="space-y-6">
          
          {/* Courier & Shipping Logistics Card */}
          <ScrollReveal delay={0.2} direction="right">
            <div className={cn(
              "glass-card rounded-3xl p-6 border transition-all",
              isDispatched ? "border-emerald-500/30 bg-emerald-950/10" : "border-white/10"
            )}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Truck className={cn("w-5 h-5", isDispatched ? "text-emerald-400" : "text-[#C52A35]")} />
                  Courier &amp; Logistics
                </h2>
                {isDispatched ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                    Active
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-white/50">
                    Unshipped
                  </span>
                )}
              </div>

              {isDispatched ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/50 uppercase font-semibold">Courier</span>
                      <span className="text-sm font-bold text-white capitalize flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        {order.courier.provider} Courier
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/50 uppercase font-semibold">Tracking Code</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-gold">{order.courier.trackingCode}</span>
                        <button 
                          onClick={() => copyToClipboard(order.courier.trackingCode)}
                          className="p-1 rounded bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors cursor-pointer"
                          title="Copy tracking code"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {order.courier.consignmentId && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/50 uppercase font-semibold">Consignment ID</span>
                        <span className="font-mono text-xs text-white/80">{order.courier.consignmentId}</span>
                      </div>
                    )}
                  </div>

                  <a 
                    href={order.courier.provider === 'steadfast' 
                      ? `https://steadfast.com.bd/t/${order.courier.trackingCode}` 
                      : 'https://pathao.com/courier-tracking/'
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all cursor-pointer"
                  >
                    <span>Open Live Courier Tracking</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs text-white/60 leading-relaxed">
                    This order has not been dispatched yet. You can dispatch it directly to Steadfast or Pathao with auto-generated consignment.
                  </p>
                  <button 
                    onClick={() => setIsDispatchModalOpen(true)}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white text-xs font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all cursor-pointer"
                  >
                    <Truck className="w-4 h-4" />
                    <span>Dispatch to Courier</span>
                  </button>
                </div>
              )}
            </div>
          </ScrollReveal>

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
