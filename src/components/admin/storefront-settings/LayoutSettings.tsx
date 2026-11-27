"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Save, Loader2, GripVertical, Eye, EyeOff, LayoutGrid } from 'lucide-react'
import { toast } from 'sonner'

const API = '/api/storefront/settings?key=homepage_layout'

const ALL_SECTIONS = [
  { id: 'hero_slider',   label: 'Hero Slider',       emoji: '🖼',  locked: true,  desc: 'Top banner with images & CTAs' },
  { id: 'marquee',       label: 'Announcement Bar',  emoji: '📢', locked: false, desc: 'Scrolling text banner' },
  { id: 'new_arrivals',  label: 'New Arrivals',       emoji: '✨', locked: false, desc: 'Latest products section' },
  { id: 'discount',      label: 'Discount / Sale',    emoji: '🏷', locked: false, desc: 'Promotional sale section' },
  { id: 'categories',    label: 'Category Showcase',  emoji: '🗂', locked: false, desc: 'Browse by category grid' },
  { id: 'shirts',        label: 'Shirts',             emoji: '👔', locked: false, desc: 'Shirts product slider' },
  { id: 'tshirts',       label: 'T-Shirts',           emoji: '👕', locked: false, desc: 'T-shirts product slider' },
  { id: 'polos',         label: 'Polos',              emoji: '🎽', locked: false, desc: 'Polo shirts slider' },
  { id: 'pants',         label: 'Trousers',           emoji: '👖', locked: false, desc: 'Trousers & chinos slider' },
  { id: 'jackets',       label: 'Jackets & Coats',    emoji: '🧥', locked: false, desc: 'Outerwear slider' },
  { id: 'hats',          label: 'Hats & Caps',        emoji: '🎩', locked: false, desc: 'Headwear slider' },
  { id: 'panjabi',       label: 'Panjabi Edit',       emoji: '🧣', locked: false, desc: 'Traditional festive section' },
  { id: 'feature_strip', label: 'Feature Strip',      emoji: '⭐', locked: false, desc: 'Free shipping & features bar' },
]

const DEFAULT_LAYOUT = ALL_SECTIONS.map(s => ({ id: s.id, enabled: true }))

export default function PageLayoutPage() {
  const [layout, setLayout] = useState(DEFAULT_LAYOUT)
  const [customSections, setCustomSections] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const dragIndex = useRef<number | null>(null)

  useEffect(() => {
    Promise.all([
      fetch(API).then(res => res.json()).catch(() => null),
      fetch('/api/storefront/sections').then(res => res.json()).catch(() => ({}))
    ]).then(([json, secData]) => {
      if (secData && typeof secData === 'object') {
        setCustomSections(secData)
      }

      if (json && Array.isArray(json.sections) && json.sections.length > 0) {
        const saved = json.sections
        // Merge in any default sections not yet in saved layout
        ALL_SECTIONS.forEach(s => {
          if (!saved.find((l: any) => l.id === s.id)) {
            saved.push({ id: s.id, enabled: true })
          }
        })

        // Merge in any custom sections from DB
        if (secData && typeof secData === 'object') {
          Object.keys(secData).forEach(secKey => {
            const layoutKey = secKey === 'category_showcase' ? 'categories' : secKey
            if (!saved.find((l: any) => l.id === layoutKey)) {
              saved.push({ id: layoutKey, enabled: secData[secKey]?.enabled !== false })
            }
          })
        }

        setLayout(saved)
      }
    }).finally(() => setLoading(false))
  }, [])

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch(API, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sections: layout })
      })
      if (!res.ok) throw new Error()
      toast.success('Page layout saved! Refresh the storefront to see changes.')
    } catch {
      toast.error('Failed to save layout')
    } finally {
      setSaving(false)
    }
  }

  const toggleSection = (id: string) => {
    const meta = ALL_SECTIONS.find(s => s.id === id)
    if (meta?.locked) return
    setLayout(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s))
  }

  const onDragStart = (i: number) => { dragIndex.current = i }

  const onDrop = (dropI: number) => {
    const from = dragIndex.current
    if (from === null || from === dropI) return
    const updated = [...layout]
    const [moved] = updated.splice(from, 1)
    updated.splice(dropI, 0, moved)
    setLayout(updated)
    dragIndex.current = null
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 text-[#C52A35] animate-spin" />
    </div>
  )

  const enabledCount = layout.filter(s => s.enabled).length

  return (
    <div className="w-full w-full h-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Page Layout</h1>
          <p className="text-white/50 text-sm mt-1">
            Drag sections to reorder • Toggle to show or hide • {enabledCount} of {layout.length} sections visible
          </p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#7A1111] to-[#550000] text-white font-semibold text-sm hover:shadow-[0_0_20px_rgba(197,42,53,0.4)] transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save Layout'}
        </button>
      </div>

      {/* Tip */}
      <div className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-xl p-4">
        <LayoutGrid className="w-5 h-5 text-[#C52A35] shrink-0 mt-0.5" />
        <div>
          <p className="text-white text-sm font-medium">How to use</p>
          <p className="text-white/50 text-xs mt-1">
            Grab the <span className="text-white/70">⠿</span> handle and drag a section up or down to reorder it.
            Click the eye icon to hide or show a section. Hero Slider is always first and cannot be moved.
          </p>
        </div>
      </div>

      {/* Section list */}
      <div className="space-y-2">
        {layout.map((item, i) => {
          const meta = ALL_SECTIONS.find(s => s.id === item.id) || {
            id: item.id,
            label: customSections[item.id]?.title || customSections[item.id]?.label || item.id.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
            emoji: '📦',
            locked: false,
            desc: `Product Section (${customSections[item.id]?.category || 'Auto'})`
          }
          return (
            <div
              key={item.id}
              draggable={!meta.locked}
              onDragStart={() => onDragStart(i)}
              onDragOver={e => e.preventDefault()}
              onDrop={() => onDrop(i)}
              className={`
                flex items-center gap-4 px-4 py-3.5 rounded-2xl border transition-all group
                ${item.enabled
                  ? 'bg-white/[0.04] border-white/10 hover:border-white/20'
                  : 'bg-transparent border-white/5 opacity-50'}
                ${!meta.locked ? 'cursor-grab active:cursor-grabbing' : ''}
              `}
            >
              {/* Drag handle */}
              <div className={`shrink-0 ${meta.locked ? 'opacity-0 pointer-events-none' : 'text-white/20 group-hover:text-white/40 transition-colors'}`}>
                <GripVertical className="w-5 h-5" />
              </div>

              {/* Emoji + label */}
              <div className="text-2xl shrink-0 select-none">{meta.emoji}</div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${item.enabled ? 'text-white' : 'text-white/40'}`}>
                  {meta.label}
                  {meta.locked && (
                    <span className="ml-2 text-[10px] font-normal text-white/20 border border-white/10 px-1.5 py-0.5 rounded-md">Fixed</span>
                  )}
                </p>
                <p className="text-white/40 text-xs mt-0.5">{meta.desc}</p>
              </div>

              {/* Position badge */}
              <span className="text-[11px] text-white/20 font-mono shrink-0">#{i + 1}</span>

              {/* Toggle */}
              <button
                onClick={() => toggleSection(item.id)}
                disabled={meta.locked}
                title={item.enabled ? 'Hide section' : 'Show section'}
                className={`
                  shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                  ${meta.locked ? 'opacity-0 pointer-events-none' : ''}
                  ${item.enabled
                    ? 'bg-[#C52A35]/10 text-[#ff8a93] hover:bg-[#C52A35]/20'
                    : 'bg-white/5 text-white/30 hover:bg-white/10 hover:text-white/60'}
                `}
              >
                {item.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                {item.enabled ? 'Visible' : 'Hidden'}
              </button>
            </div>
          )
        })}
      </div>


    </div>
  )
}

