"use client"

import React, { useState, useEffect } from 'react'
import { Save, Loader2, CheckCircle2, Sliders, Plus, Trash2, X, FolderTree } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface SectionMeta {
  id: string
  label: string
  defaultCat?: string
  isShowcase?: boolean
  isCustom?: boolean
}

const DEFAULT_SECTIONS_CONFIG: SectionMeta[] = [
  { id: 'new', label: 'New Arrivals', defaultCat: 'all' },
  { id: 'category_showcase', label: 'Categories Showcase (Slider)', defaultCat: '', isShowcase: true },
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
  const [sectionList, setSectionList] = useState<SectionMeta[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  // New section modal state
  const [showAddModal, setShowAddModal] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [newEyebrow, setNewEyebrow] = useState('')
  const [newMaxProducts, setNewMaxProducts] = useState(8)
  const [creating, setCreating] = useState(false)

  // Build parent lookup map for subcategories
  const parentLookup = new Map<string, string>()
  categories.forEach(c => {
    const id = (c._id || c.id || '').toString()
    if (id) parentLookup.set(id, c.name)
  })

  const isSubcategory = (c: any) => Boolean(c.parent && c.parent !== '0' && c.parent !== 'none')

  useEffect(() => {
    async function loadData() {
      try {
        const [secRes, catRes, layoutRes] = await Promise.all([
          fetch(API_BASE).then(r => r.ok ? r.json() : ({} as Record<string, any>)),
          fetch('/api/admin/categories').then(r => r.ok ? r.json() : []),
          fetch('/api/storefront/settings?key=homepage_layout').then(r => r.ok ? r.json() : null)
        ])

        if (Array.isArray(catRes)) {
          setCategories(catRes)
        }

        const layoutSections = Array.isArray(layoutRes?.sections) ? layoutRes.sections : []
        const sectionMap: Record<string, any> = (secRes && typeof secRes === 'object') ? secRes : {}

        const merged: Record<string, any> = {}
        const dynamicList: SectionMeta[] = []

        // 1. Process default sections that exist in secRes or haven't been deleted
        DEFAULT_SECTIONS_CONFIG.forEach(cfg => {
          if (sectionMap[cfg.id] !== undefined || cfg.isShowcase || cfg.id === 'new') {
            dynamicList.push(cfg)
            const layoutId = cfg.id === 'category_showcase' ? 'categories' : cfg.id
            const foundLayout = layoutSections.find((s: any) => s.id === layoutId)
            const isEnabled = sectionMap[cfg.id]?.enabled !== undefined
              ? sectionMap[cfg.id].enabled
              : (foundLayout ? foundLayout.enabled : true)

            merged[cfg.id] = {
              id: cfg.id,
              eyebrow: '',
              title: cfg.label,
              description: '',
              maxProducts: 8,
              category: cfg.defaultCat || '',
              selectedCategories: '',
              displayMode: 'all',
              ...sectionMap[cfg.id],
              enabled: isEnabled !== false
            }
          }
        })

        // 2. Process custom sections created by user
        Object.keys(sectionMap).forEach(key => {
          if (!dynamicList.some(s => s.id === key)) {
            const sec = sectionMap[key]
            dynamicList.push({
              id: key,
              label: sec?.title || sec?.label || key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
              defaultCat: sec?.category || '',
              isCustom: true
            })
            const foundLayout = layoutSections.find((s: any) => s.id === key)
            const isEnabled = sec?.enabled !== undefined
              ? sec.enabled
              : (foundLayout ? foundLayout.enabled : true)

            merged[key] = {
              id: key,
              eyebrow: '',
              title: key.replace(/_/g, ' '),
              description: '',
              maxProducts: 8,
              category: '',
              ...sec,
              enabled: isEnabled !== false
            }
          }
        })

        setSectionList(dynamicList)
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

      // Also sync layout enabled state
      if (typeof section.enabled === 'boolean') {
        const layoutRes = await fetch('/api/storefront/settings?key=homepage_layout')
        if (layoutRes.ok) {
          const layoutData = await layoutRes.json()
          if (Array.isArray(layoutData?.sections)) {
            const layoutId = id === 'category_showcase' ? 'categories' : id
            const updatedSections = layoutData.sections.map((item: any) =>
              item.id === layoutId ? { ...item, enabled: section.enabled } : item
            )
            await fetch('/api/storefront/settings?key=homepage_layout', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ sections: updatedSections })
            })
          }
        }
      }

      const label = sectionList.find(s => s.id === id)?.label || section.title || id
      toast.success(`${label} saved!`)
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
        sectionList.map(({ id }) => {
          const payload = { ...(sections[id] || {}), id }
          return fetch(`${API_BASE}?id=${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          })
        })
      )

      // Sync layout
      const layoutRes = await fetch('/api/storefront/settings?key=homepage_layout')
      if (layoutRes.ok) {
        const layoutData = await layoutRes.json()
        if (Array.isArray(layoutData?.sections)) {
          const updatedSections = layoutData.sections.map((item: any) => {
            const secKey = item.id === 'categories' ? 'category_showcase' : item.id
            if (sections[secKey]?.enabled !== undefined) {
              return { ...item, enabled: sections[secKey].enabled }
            }
            return item
          })
          await fetch('/api/storefront/settings?key=homepage_layout', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sections: updatedSections })
          })
        }
      }

      toast.success('All product sections saved successfully!')
    } catch {
      toast.error('Failed to save some sections')
    } finally {
      setSaving(null)
    }
  }

  // Create new product section
  const handleCreateSection = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) {
      toast.error('Please enter a section title')
      return
    }

    setCreating(true)
    try {
      const slug = newTitle.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')
      const id = `sec_${slug}_${Date.now().toString().slice(-4)}`

      const payload = {
        id,
        title: newTitle.trim(),
        eyebrow: newEyebrow.trim(),
        description: '',
        category: newCategory,
        maxProducts: Number(newMaxProducts) || 8,
        enabled: true,
      }

      const res = await fetch(`${API_BASE}?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) throw new Error()

      // Add to state
      setSectionList(prev => [...prev, { id, label: newTitle.trim(), isCustom: true }])
      setSections(prev => ({ ...prev, [id]: payload }))

      toast.success(`Section "${newTitle}" created and added to home page!`)
      setShowAddModal(false)
      setNewTitle('')
      setNewCategory('')
      setNewEyebrow('')
      setNewMaxProducts(8)
    } catch {
      toast.error('Failed to create section')
    } finally {
      setCreating(false)
    }
  }

  // Delete section
  const handleDeleteSection = async (id: string, label: string) => {
    if (!confirm(`Are you sure you want to delete the "${label}" section from your storefront?`)) {
      return
    }

    setDeleting(id)
    try {
      const res = await fetch(`${API_BASE}?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()

      setSectionList(prev => prev.filter(s => s.id !== id))
      setSections(prev => {
        const next = { ...prev }
        delete next[id]
        return next
      })

      toast.success(`Section "${label}" deleted successfully!`)
    } catch {
      toast.error('Failed to delete section')
    } finally {
      setDeleting(null)
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
            Add, delete, and customize product showcase sections on your homepage
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gold/15 border border-gold/40 text-gold text-xs font-semibold hover:bg-gold/25 transition-all cursor-pointer shadow-sm hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Section</span>
          </button>

          <button
            type="button"
            onClick={saveAll}
            disabled={saving !== null}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#7A1111] to-[#550000] text-white text-xs font-semibold hover:shadow-[0_0_15px_rgba(122,17,17,0.4)] transition-all cursor-pointer disabled:opacity-50"
          >
            {saving === 'all' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-gold" />
            )}
            <span>Save All</span>
          </button>
        </div>
      </div>

      {/* Grid of Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {sectionList.map(({ id, label, isShowcase }) => {
          const s = sections[id] || {}
          return (
            <div key={id} className="glass-card rounded-2xl p-5 space-y-4 border border-white/10 hover:border-white/20 transition-all relative">
              <div className="flex items-center justify-between pb-2 border-b border-white/5 gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={cn("w-2 h-2 rounded-full shrink-0", s.enabled !== false ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" : "bg-white/30")} />
                  <h2 className="text-white font-semibold text-sm truncate">{label}</h2>
                </div>
                
                <div className="flex items-center gap-2.5 shrink-0">
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs select-none">
                    <input
                      type="checkbox"
                      checked={s.enabled !== false}
                      onChange={e => update(id, 'enabled', e.target.checked)}
                      className="rounded accent-emerald-500 w-3.5 h-3.5 cursor-pointer"
                    />
                    <span className={cn("text-xs font-medium", s.enabled !== false ? "text-emerald-400" : "text-white/40")}>
                      {s.enabled !== false ? "Active" : "Hidden"}
                    </span>
                  </label>

                  <button
                    type="button"
                    onClick={() => save(id)}
                    disabled={saving === id || saving === 'all'}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#7A1111] text-white text-xs font-medium hover:bg-[#9A1515] transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {saving === id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                    Save
                  </button>

                  {!isShowcase && (
                    <button
                      type="button"
                      onClick={() => handleDeleteSection(id, label)}
                      disabled={deleting === id}
                      title="Delete section"
                      aria-label="Delete section"
                      className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer border border-transparent hover:border-red-500/20"
                    >
                      {deleting === id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                {/* Section Title */}
                <div>
                  <label className="text-white/40 text-[10px] uppercase tracking-widest block mb-1">
                    Section Title
                  </label>
                  <input 
                    type="text" 
                    value={s.title || ''} 
                    onChange={e => update(id, 'title', e.target.value)}
                    placeholder="e.g. Trousers & chinos."
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-gold" 
                  />
                </div>

                {/* For Category Showcase: Dynamic vs Specific Categories (including subcategories) */}
                {id === 'category_showcase' ? (
                  <div className="space-y-3 pt-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-white/40 text-[10px] uppercase tracking-widest block mb-1">
                          Showcase Mode
                        </label>
                        <select
                          value={s.displayMode || (s.selectedCategories ? 'specific' : 'all')}
                          onChange={e => {
                            const mode = e.target.value
                            update(id, 'displayMode', mode)
                            if (mode === 'all') {
                              update(id, 'selectedCategories', '')
                            }
                          }}
                          className="w-full bg-[#140202] border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-gold cursor-pointer"
                        >
                          <option value="all">Dynamic (All Catalog Categories)</option>
                          <option value="specific">Pick Specific Categories / Subcategories</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-white/40 text-[10px] uppercase tracking-widest block mb-1">
                          Max Categories to Display
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

                    {(s.displayMode === 'specific' || Boolean(s.selectedCategories)) && (
                      <div className="space-y-2 p-3 rounded-xl bg-white/5 border border-white/10">
                        <div className="flex items-center justify-between">
                          <label className="text-white/60 text-xs font-medium flex items-center gap-1.5">
                            <FolderTree className="w-3.5 h-3.5 text-gold" />
                            Select Categories & Subcategories:
                          </label>
                          <span className="text-[11px] text-gold font-mono">
                            {(s.selectedCategories ? s.selectedCategories.split(',').filter(Boolean).length : 0)} selected
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto custom-scrollbar pt-1">
                          {categories.map((c: any) => {
                            const cVal = c.slug || c.name.toLowerCase().replace(/\s+/g, '-')
                            const selectedList = (s.selectedCategories || '').split(',').filter(Boolean)
                            const isSelected = selectedList.includes(cVal) || selectedList.includes(c.name.toLowerCase()) || selectedList.includes((c._id || c.id || '').toString())
                            const isSub = isSubcategory(c)
                            const parentName = isSub ? parentLookup.get(c.parent) : null

                            return (
                              <button
                                key={c._id || c.id}
                                type="button"
                                onClick={() => {
                                  let next: string[]
                                  if (isSelected) {
                                    next = selectedList.filter((x: string) => x !== cVal && x !== c.name.toLowerCase() && x !== (c._id || c.id || '').toString())
                                  } else {
                                    next = [...selectedList, cVal]
                                  }
                                  update(id, 'selectedCategories', next.join(','))
                                }}
                                className={cn(
                                  "px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer border",
                                  isSelected 
                                    ? "bg-gold text-black border-gold font-semibold shadow-[0_0_10px_rgba(212,175,55,0.3)]" 
                                    : "bg-black/40 text-white/70 border-white/10 hover:border-white/30 hover:text-white"
                                )}
                              >
                                <span>{c.name}</span>
                                {isSub && parentName && (
                                  <span className={cn("text-[9px] px-1 py-0.2 rounded font-sans", isSelected ? "bg-black/20 text-black/80" : "bg-white/10 text-gold/80")}>
                                    sub of {parentName}
                                  </span>
                                )}
                                {isSelected ? <span>✓</span> : <span className="opacity-40">+</span>}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Standard Product Section Category Source & Max Products */
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
                        
                        {/* Main Categories Group */}
                        <optgroup label="Main Categories">
                          {categories
                            .filter(c => !isSubcategory(c))
                            .map((c: any) => (
                              <option key={c._id || c.id} value={c.slug || c.name}>
                                {c.name}
                              </option>
                            ))}
                        </optgroup>

                        {/* Subcategories Group */}
                        <optgroup label="Subcategories">
                          {categories
                            .filter(c => isSubcategory(c))
                            .map((c: any) => {
                              const pName = parentLookup.get(c.parent) || 'Parent'
                              return (
                                <option key={c._id || c.id} value={c.slug || c.name}>
                                  {c.name} (Sub of {pName})
                                </option>
                              )
                            })}
                        </optgroup>
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
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Add New Section Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#100303] border border-white/15 rounded-2xl p-6 w-full max-w-md shadow-2xl relative space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-gold" />
                Add New Product Section
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSection} className="space-y-4">
              <div>
                <label className="text-white/70 text-xs font-medium block mb-1.5">
                  Section Title / Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Formal Suits, Hoodies, Winter Sale"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="text-white/70 text-xs font-medium block mb-1.5">
                  Category Source
                </label>
                <select
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  className="w-full bg-[#180404] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-gold cursor-pointer"
                >
                  <option value="">Auto (Match products by section name)</option>
                  <option value="all">All Products</option>
                  <optgroup label="Main Categories">
                    {categories.filter(c => !isSubcategory(c)).map((c: any) => (
                      <option key={c._id || c.id} value={c.slug || c.name}>
                        {c.name}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Subcategories">
                    {categories.filter(c => isSubcategory(c)).map((c: any) => {
                      const pName = parentLookup.get(c.parent) || 'Parent'
                      return (
                        <option key={c._id || c.id} value={c.slug || c.name}>
                          {c.name} (Sub of {pName})
                        </option>
                      )
                    })}
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="text-white/70 text-xs font-medium block mb-1.5">
                  Max Products to Display
                </label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={newMaxProducts}
                  onChange={e => setNewMaxProducts(parseInt(e.target.value, 10) || 8)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-gold"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg text-white/70 text-xs hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !newTitle.trim()}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-gold text-black text-xs font-semibold hover:bg-gold/90 transition-all disabled:opacity-50 cursor-pointer shadow-md"
                >
                  {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Create Section
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
