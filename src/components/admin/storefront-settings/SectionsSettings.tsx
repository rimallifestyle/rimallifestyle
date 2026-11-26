"use client"

import React, { useState, useEffect } from 'react'
import { Save, Loader2, CheckCircle2, Sliders } from 'lucide-react'
import { toast } from 'sonner'

const SECTIONS_CONFIG = [
  { id: 'new', label: 'New Arrivals', defaultCat: 'all' },
  { id: 'shirts', label: 'Shirts Section', defaultCat: 'shirt' },
  { id: 'tshirts', label: 'T-Shirts Section', defaultCat: 't-shirt' },
  { id: 'polos', label: 'Polos Section', defaultCat: 'polo' },
  { id: 'pants', label: 'Trousers Section', defaultCat: 'trouser' },
  { id: 'jackets', label: 'Outerwear Section', defaultCat: 'jacket' },
  { id: 'hats', label: 'Headwear Section', defaultCat: 'hat' },
  { id: 'panjabi', label: 'Panjabi Edit Section', defaultCat: 'panjabi' },
]

const API_BASE = '/api/storefront/sections'

export default function ProductSectionsPage() {
  const [sections, setSections] = useState<Record<string, any>>({})
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const [secRes, catRes] = await Promise.all([
          fetch(API_BASE).then(r => r.ok ? r.json() : ({} as Record<string, any>)),
          fetch('/api/admin/categories').then(r => r.ok ? r.json() : [])
        ])

        if (Array.isArray(catRes)) {
          setCategories(catRes)
        }

        const merged: Record<string, any> = {}
        const sectionMap: Record<string, any> = (secRes && typeof secRes === 'object') ? secRes : {}
        SECTIONS_CONFIG.forEach(({ id }) => {
          merged[id] = sectionMap[id] || { 
            id, 
            eyebrow: '', 
            title: '', 
            description: '', 
            maxProducts: 8,
            category: ''
          }
        })
        setSections(merged)
      } catch (err) {
        console.error('Failed to load sections data:', err)
        toast.error('Failed to load sections')
      } finally {
        setLoading(false)
      }
    }

    loadData()
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
      const payload = { ...section, id }
      const res = await fetch(`${API_BASE}?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error()
      toast.success(`${SECTIONS_CONFIG.find(s => s.id === id)?.label} saved!`)
    } catch {
      toast.error('Failed to save section')
    } finally {
      setSaving(null)
    }
  }

  const saveAll = async () => {
    setSaving('all')
    try {
      await Promise.all(
        SECTIONS_CONFIG.map(({ id }) => {
          const payload = { ...(sections[id] || {}), id }
          return fetch(`${API_BASE}?id=${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          })
        })
      )
      toast.success('All product sections saved successfully!')
    } catch {
      toast.error('Failed to save some sections')
    } finally {
      setSaving(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-[#C52A35] animate-spin" />
      </div>
    )
  }

  return (
    <div className="w-full h-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Sliders className="w-6 h-6 text-[#C52A35]" />
            Product Sections
          </h1>
          <p className="text-white/50 text-sm mt-1">
            Customize the title, eyebrow label, description, product limits, and category source for each homepage section
          </p>
        </div>

        <button
          onClick={saveAll}
          disabled={saving !== null}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#7A1111] to-[#550000] text-white text-xs font-semibold hover:shadow-[0_0_15px_rgba(122,17,17,0.4)] transition-all cursor-pointer disabled:opacity-50 shrink-0"
        >
          {saving === 'all' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-gold" />
          )}
          <span>Save All Sections</span>
        </button>
      </div>

      {/* Grid of Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {SECTIONS_CONFIG.map(({ id, label }) => {
          const s = sections[id] || {}
          return (
            <div key={id} className="glass-card rounded-2xl p-5 space-y-4 border border-white/10 hover:border-white/20 transition-all">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-gold" />
                  <h2 className="text-white font-semibold text-sm">{label}</h2>
                </div>
                <button
                  type="button"
                  onClick={() => save(id)}
                  disabled={saving === id || saving === 'all'}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#7A1111] text-white text-xs font-medium hover:bg-[#9A1515] transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {saving === id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                  Save
                </button>
              </div>

              <div className="space-y-3">
                {/* Eyebrow */}
                <div>
                  <label className="text-white/40 text-[10px] uppercase tracking-widest block mb-1">
                    Eyebrow (small top tag)
                  </label>
                  <input 
                    type="text" 
                    value={s.eyebrow || ''} 
                    onChange={e => update(id, 'eyebrow', e.target.value)}
                    placeholder="e.g. Just landed, Shirt category"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-gold" 
                  />
                </div>

                {/* Section Title */}
                <div>
                  <label className="text-white/40 text-[10px] uppercase tracking-widest block mb-1">
                    Section Title
                  </label>
                  <input 
                    type="text" 
                    value={s.title || ''} 
                    onChange={e => update(id, 'title', e.target.value)}
                    placeholder="e.g. Shirts, tailored."
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-gold" 
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="text-white/40 text-[10px] uppercase tracking-widest block mb-1">
                    Description
                  </label>
                  <textarea 
                    rows={2} 
                    value={s.description || ''} 
                    onChange={e => update(id, 'description', e.target.value)}
                    placeholder="Short description for this collection..."
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-gold resize-none" 
                  />
                </div>

                {/* Category Source & Max Products */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-white/40 text-[10px] uppercase tracking-widest block mb-1">
                      Category Source
                    </label>
                    <select
                      value={s.category || ''}
                      onChange={e => update(id, 'category', e.target.value)}
                      className="w-full bg-[#140202] border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-gold cursor-pointer"
                    >
                      <option value="">Auto (Smart Category Match)</option>
                      <option value="all">All Catalog Products</option>
                      {categories.map((c: any) => (
                        <option key={c._id || c.id} value={c.slug || c.name}>
                          {c.name} {c.slug ? `(${c.slug})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-white/40 text-[10px] uppercase tracking-widest block mb-1">
                      Max Products
                    </label>
                    <input 
                      type="number" 
                      min={1} 
                      max={30} 
                      value={s.maxProducts || 8} 
                      onChange={e => update(id, 'maxProducts', parseInt(e.target.value, 10) || 8)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-gold" 
                    />
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
