"use client"

import React, { useState, useEffect } from 'react'
import { Save, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

const SECTIONS_CONFIG = [
  { id: 'new', label: 'New Arrivals' },
  { id: 'shirts', label: 'Shirts Section' },
  { id: 'tshirts', label: 'T-Shirts Section' },
  { id: 'polos', label: 'Polos Section' },
  { id: 'pants', label: 'Trousers Section' },
  { id: 'jackets', label: 'Outerwear Section' },
  { id: 'hats', label: 'Headwear Section' },
  { id: 'panjabi', label: 'Panjabi Edit Section' },
]

const API_BASE = '/api/storefront/sections'

export default function ProductSectionsPage() {
  const [sections, setSections] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    fetch(API_BASE)
      .then(res => res.json())
      .then(data => {
        if (data && typeof data === 'object') {
          // Ensure all configured sections exist in state even if not in DB yet
          const merged: Record<string, any> = {}
          SECTIONS_CONFIG.forEach(({ id }) => {
            merged[id] = data[id] || { id, eyebrow: '', title: '', description: '', maxProducts: 8 }
          })
          setSections(merged)
        }
      })
      .catch(() => toast.error('Failed to load sections'))
      .finally(() => setLoading(false))
  }, [])

  const update = (id: string, field: string, val: any) => {
    setSections(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: val }
    }))
  }

  const save = async (id: string) => {
    const section = sections[id]
    if (!section) return
    setSaving(id)
    try {
      // Always include id in the body so backend can match the row
      const payload = { ...section, id }
      // Try UPDATE first, if rowCount is 0 the backend will need to INSERT
      const res = await fetch(API_BASE, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error()
      toast.success(`${SECTIONS_CONFIG.find(s => s.id === id)?.label} saved!`)
    } catch { toast.error('Failed to save') }
    finally { setSaving(null) }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-[#C52A35] animate-spin" /></div>

  return (
    <div className="w-full w-full h-full space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Product Sections</h1>
        <p className="text-white/50 text-sm mt-1">Edit the title, eyebrow text and description for each product section on the homepage</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {SECTIONS_CONFIG.map(({ id, label }) => {
          const s = sections[id] || {}
          return (
            <div key={id} className="glass-card rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-white font-semibold text-sm">{label}</h2>
                <button
                  onClick={() => save(id)}
                  disabled={saving === id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#7A1111] text-white text-xs font-medium hover:bg-[#9A1515] transition-colors disabled:opacity-50"
                >
                  {saving === id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                  Save
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-white/40 text-[10px] uppercase tracking-widest block mb-1">Eyebrow (small top label)</label>
                  <input type="text" value={s.eyebrow || ''} onChange={e => update(id, 'eyebrow', e.target.value)}
                    placeholder="e.g. Just landed"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#C52A35]" />
                </div>
                <div>
                  <label className="text-white/40 text-[10px] uppercase tracking-widest block mb-1">Section Title</label>
                  <input type="text" value={s.title || ''} onChange={e => update(id, 'title', e.target.value)}
                    placeholder="e.g. New arrivals"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#C52A35]" />
                </div>
                <div>
                  <label className="text-white/40 text-[10px] uppercase tracking-widest block mb-1">Description</label>
                  <textarea rows={2} value={s.description || ''} onChange={e => update(id, 'description', e.target.value)}
                    placeholder="Short description..."
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#C52A35] resize-none" />
                </div>
                <div>
                  <label className="text-white/40 text-[10px] uppercase tracking-widest block mb-1">Max Products to Show</label>
                  <input type="number" min={1} max={20} value={s.maxProducts || 8} onChange={e => update(id, 'maxProducts', parseInt(e.target.value))}
                    className="w-24 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#C52A35]" />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

