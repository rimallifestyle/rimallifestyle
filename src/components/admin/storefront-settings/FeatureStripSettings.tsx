"use client"

import React, { useState, useEffect } from 'react'
import {
  Truck,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Award,
  Clock,
  Phone,
  Package,
  Heart,
  Save,
  Loader2,
  Plus,
  Trash2,
  CheckCircle2
} from 'lucide-react'
import { toast } from 'sonner'

const API = '/api/storefront/settings?key=feature_strip_settings'

export interface FeatureItem {
  id?: string
  icon: string
  title: string
  sub: string
}

const DEFAULT_ITEMS: FeatureItem[] = [
  { icon: 'Truck', title: 'Free shipping', sub: 'On orders over $150' },
  { icon: 'RotateCcw', title: '30-day returns', sub: 'Hassle-free exchange' },
  { icon: 'ShieldCheck', title: 'Secure checkout', sub: 'Encrypted payments' },
  { icon: 'Sparkles', title: 'Handcrafted', sub: 'Limited production runs' },
]

const ICON_OPTIONS = [
  { name: 'Truck', label: 'Delivery / Shipping', icon: Truck },
  { name: 'RotateCcw', label: 'Returns / Exchange', icon: RotateCcw },
  { name: 'ShieldCheck', label: 'Security / Payment', icon: ShieldCheck },
  { name: 'Sparkles', label: 'Handcrafted / Luxury', icon: Sparkles },
  { name: 'Award', label: 'Quality / Guarantee', icon: Award },
  { name: 'Clock', label: 'Fast / Timely', icon: Clock },
  { name: 'Phone', label: '24/7 Support', icon: Phone },
  { name: 'Package', label: 'Packaging / Gift', icon: Package },
  { name: 'Heart', label: 'Customer Care', icon: Heart },
]

export default function FeatureStripSettings() {
  const [items, setItems] = useState<FeatureItem[]>(DEFAULT_ITEMS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch(API)
      .then(res => res.json())
      .then(json => {
        if (json && Array.isArray(json.items) && json.items.length > 0) {
          setItems(json.items)
        } else {
          setItems(DEFAULT_ITEMS)
        }
      })
      .catch(() => setItems(DEFAULT_ITEMS))
      .finally(() => setLoading(false))
  }, [])

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch(API, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items })
      })
      if (!res.ok) throw new Error()
      toast.success('Feature strip settings saved!')
    } catch {
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const updateItem = (index: number, field: keyof FeatureItem, value: string) => {
    setItems(prev => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      return next
    })
  }

  const addItem = () => {
    if (items.length >= 6) {
      toast.error('Maximum 6 feature items allowed')
      return
    }
    setItems(prev => [
      ...prev,
      { icon: 'Award', title: 'Premium Quality', sub: 'Guaranteed craftsmanship' }
    ])
  }

  const removeItem = (index: number) => {
    if (items.length <= 1) {
      toast.error('At least 1 item is required')
      return
    }
    setItems(prev => prev.filter((_, i) => i !== index))
  }

  const getIconComponent = (iconName: string) => {
    const opt = ICON_OPTIONS.find(o => o.name === iconName)
    return opt ? opt.icon : Sparkles
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 text-[#C52A35] animate-spin" />
      </div>
    )
  }

  return (
    <div className="w-full h-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-gold" />
            Feature Strip Settings
          </h1>
          <p className="text-white/50 text-sm mt-1">
            Edit the Free shipping, Returns, Secure checkout, and Handcrafted badges shown on your homepage
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={addItem}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 text-gold" />
            <span>Add Badge</span>
          </button>

          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#7A1111] to-[#550000] text-white text-xs font-semibold hover:shadow-[0_0_15px_rgba(122,17,17,0.4)] transition-all cursor-pointer disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Badges</span>
          </button>
        </div>
      </div>

      {/* Grid of editable feature items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {items.map((item, index) => {
          const IconComp = getIconComponent(item.icon)

          return (
            <div
              key={index}
              className="glass-card rounded-2xl p-5 border border-white/10 hover:border-white/20 transition-all space-y-4 relative bg-black/20"
            >
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/30 flex items-center justify-center text-gold">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">Badge #{index + 1}</h3>
                    <p className="text-[11px] text-white/40">Visible on homepage feature bar</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="p-1.5 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                  title="Remove badge"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                {/* Icon Selection */}
                <div>
                  <label className="text-white/40 text-[10px] uppercase tracking-widest block mb-1">
                    Select Icon
                  </label>
                  <select
                    value={item.icon}
                    onChange={(e) => updateItem(index, 'icon', e.target.value)}
                    className="w-full bg-[#180404] border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-gold cursor-pointer"
                  >
                    {ICON_OPTIONS.map((opt) => (
                      <option key={opt.name} value={opt.name}>
                        {opt.label} ({opt.name})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Title */}
                <div>
                  <label className="text-white/40 text-[10px] uppercase tracking-widest block mb-1">
                    Badge Title
                  </label>
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => updateItem(index, 'title', e.target.value)}
                    placeholder="e.g. Free shipping, 30-day returns"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-gold"
                  />
                </div>

                {/* Subtitle / Description */}
                <div>
                  <label className="text-white/40 text-[10px] uppercase tracking-widest block mb-1">
                    Subtitle / Detail
                  </label>
                  <input
                    type="text"
                    value={item.sub}
                    onChange={(e) => updateItem(index, 'sub', e.target.value)}
                    placeholder="e.g. On orders over ৳5000, Hassle-free exchange"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-gold"
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Live Preview Box */}
      <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
        <h4 className="text-xs uppercase tracking-widest text-gold font-bold">Storefront Live Preview</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-background border border-border/40">
          {items.map((item, idx) => {
            const IconComp = getIconComponent(item.icon)
            return (
              <div key={idx} className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold/40 text-gold bg-gold/5">
                  <IconComp className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-display text-sm text-cream font-medium">{item.title || 'Title'}</div>
                  <div className="text-[11px] text-muted-foreground">{item.sub || 'Subtitle'}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
