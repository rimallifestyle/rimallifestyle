"use client"

import React, { useState, useEffect } from 'react'
import { 
  Save, Loader2, Plus, Trash2, GripVertical, Link2, 
  FileText, Tag, ArrowUp, ArrowDown, Sparkles, ExternalLink, 
  Eye, RefreshCw, FolderPlus, Layout, ChevronRight, X, Check
} from 'lucide-react'
import { toast } from 'sonner'

const API = '/api/storefront/settings?key=navigation_links'

export type LinkType = 'page' | 'category' | 'custom'

export interface NavLink {
  id: string
  label: string
  type: LinkType
  value: string
  badge?: string
  openNewTab?: boolean
}

const DEFAULT_LINKS: NavLink[] = [
  { id: '1', label: "Shop All", type: "page", value: "/shop" },
  { id: '2', label: "New Arrivals", type: "page", value: "/shop?category=new", badge: "New" },
  { id: '3', label: "Shirts", type: "category", value: "shirts" },
  { id: '4', label: "T-Shirts", type: "category", value: "t-shirts" },
  { id: '5', label: "Polos", type: "category", value: "polos" },
  { id: '6', label: "Hats", type: "category", value: "hats" },
  { id: '7', label: "Jackets", type: "category", value: "jackets" },
  { id: '8', label: "Trousers", type: "category", value: "trousers" },
  { id: '9', label: "Panjabi", type: "category", value: "panjabi" },
  { id: '10', label: "Sale & Offers", type: "page", value: "/shop?sale=true", badge: "Sale" },
]

const STORE_PAGES = [
  { label: 'Home Page', value: '/' },
  { label: 'Shop All Products', value: '/shop' },
  { label: 'New Arrivals', value: '/shop?category=new', badge: 'New' },
  { label: 'Offers / Sale', value: '/shop?sale=true', badge: 'Sale' },
  { label: 'Shopping Cart', value: '/cart' },
  { label: 'Checkout Page', value: '/checkout' },
  { label: 'Customer Account', value: '/account' },
  { label: 'Order History', value: '/account?tab=orders' },
  { label: 'Contact Us', value: '/#contact' },
  { label: 'Our Story (About)', value: '/#about' },
]

const FALLBACK_CATEGORIES = [
  { name: 'Shirts', slug: 'shirts' },
  { name: 'T-Shirts', slug: 't-shirts' },
  { name: 'Polos', slug: 'polos' },
  { name: 'Hats', slug: 'hats' },
  { name: 'Jackets', slug: 'jackets' },
  { name: 'Trousers', slug: 'trousers' },
  { name: 'Panjabi', slug: 'panjabi' },
]

export default function NavigationSettings() {
  const [data, setData] = useState<{ links: NavLink[] } | null>(null)
  const [categories, setCategories] = useState<{ name: string, slug: string, isSub?: boolean, parentName?: string, fullValue?: string }[]>(FALLBACK_CATEGORIES)
  const [categoryTree, setCategoryTree] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [draggedItem, setDraggedItem] = useState<number | null>(null)

  // Quick Add Modals/States
  const [activeModal, setActiveModal] = useState<'category' | 'page' | 'custom' | null>(null)
  const [customForm, setCustomForm] = useState({ label: '', url: '', badge: '' })

  useEffect(() => {
    // 1. Fetch saved navigation links
    fetch(API)
      .then(res => res.json())
      .then(json => {
        if (json && Array.isArray(json.links) && json.links.length > 0) {
          setData(json)
        } else {
          setData({ links: DEFAULT_LINKS })
        }
      })
      .catch(() => setData({ links: DEFAULT_LINKS }))
      .finally(() => setLoading(false))

    // 2. Fetch live store categories from database
    fetch('/api/storefront/categories')
      .then(res => res.ok ? res.json() : null)
      .then(json => {
        if (Array.isArray(json) && json.length > 0) {
          setCategoryTree(json);
          const flatList: { name: string, slug: string, isSub?: boolean, parentName?: string, fullValue?: string }[] = [];
          
          json.forEach((cat: any) => {
            flatList.push({
              name: cat.name,
              slug: cat.slug,
              fullValue: cat.slug
            });
            if (Array.isArray(cat.subcategories)) {
              cat.subcategories.forEach((sub: any) => {
                flatList.push({
                  name: sub.name,
                  slug: sub.slug,
                  isSub: true,
                  parentName: cat.name,
                  fullValue: `/shop?category=${encodeURIComponent(cat.name)}&subCategory=${encodeURIComponent(sub.name)}`
                });
              });
            }
          });

          // Ensure common fallback ones exist
          FALLBACK_CATEGORIES.forEach(fc => {
            if (!flatList.find(m => m.slug === fc.slug)) {
              flatList.push(fc);
            }
          });
          setCategories(flatList);
        }
      })
      .catch(() => {});
  }, [])

  const save = async () => {
    if (!data) return
    setSaving(true)
    try {
      const res = await fetch(API, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!res.ok) throw new Error()
      
      // Update local storage and broadcast to open tabs
      if (typeof window !== 'undefined') {
        localStorage.setItem('rimal_navigation_links', JSON.stringify(data));
        window.postMessage({ type: 'STOREFRONT_NAV_UPDATE', data }, '*');
      }

      toast.success('Sidebar navigation menu saved successfully!')
    } catch { 
      toast.error('Failed to save navigation') 
    } finally { 
      setSaving(false) 
    }
  }

  const update = (i: number, field: keyof NavLink, val: any) => {
    if (!data) return
    const links = [...data.links]
    links[i] = { ...links[i], [field]: val }
    
    // Auto-set default values when changing types
    if (field === 'type') {
      if (val === 'page') links[i].value = STORE_PAGES[0].value
      if (val === 'category') links[i].value = categories[0]?.slug || 'shirts'
      if (val === 'custom') links[i].value = 'https://'
    }
    
    setData({ ...data, links })
  }

  const remove = (i: number) => {
    if (!data) return
    const links = [...data.links]
    links.splice(i, 1)
    setData({ ...data, links })
    toast.info('Item removed from menu')
  }

  const move = (i: number, direction: 'up' | 'down') => {
    if (!data) return
    const newIndex = direction === 'up' ? i - 1 : i + 1
    if (newIndex < 0 || newIndex >= data.links.length) return
    const links = [...data.links]
    const item = links[i]
    links.splice(i, 1)
    links.splice(newIndex, 0, item)
    setData({ ...data, links })
  }

  const addCategoryItem = (cat: { name: string, slug: string, isSub?: boolean, parentName?: string, fullValue?: string }) => {
    if (!data) return
    const targetVal = cat.fullValue || cat.slug
    // Check if already in list
    const exists = data.links.find(l => l.type === 'category' && (l.value === targetVal || l.value === cat.slug))
    if (exists) {
      toast.info(`"${cat.name}" is already in your menu`)
      return
    }

    const newItem: NavLink = {
      id: Math.random().toString(36).substr(2, 9),
      label: cat.name,
      type: 'category',
      value: targetVal,
    }
    setData({ ...data, links: [...data.links, newItem] })
    toast.success(`Added "${cat.name}" to menu`)
    setActiveModal(null)
  }

  const addPageItem = (page: { label: string, value: string, badge?: string }) => {
    if (!data) return
    const newItem: NavLink = {
      id: Math.random().toString(36).substr(2, 9),
      label: page.label,
      type: 'page',
      value: page.value,
      badge: page.badge,
    }
    setData({ ...data, links: [...data.links, newItem] })
    toast.success(`Added "${page.label}" to menu`)
    setActiveModal(null)
  }

  const addCustomItem = (e: React.FormEvent) => {
    e.preventDefault()
    if (!data || !customForm.label || !customForm.url) {
      toast.error('Please enter both Title and URL')
      return
    }

    const newItem: NavLink = {
      id: Math.random().toString(36).substr(2, 9),
      label: customForm.label,
      type: 'custom',
      value: customForm.url,
      badge: customForm.badge || undefined,
    }
    setData({ ...data, links: [...data.links, newItem] })
    setCustomForm({ label: '', url: '', badge: '' })
    setActiveModal(null)
    toast.success(`Added custom link "${newItem.label}"`)
  }

  const resetToDefault = () => {
    if (confirm('Reset navigation menu to default store links?')) {
      setData({ links: DEFAULT_LINKS })
      toast.success('Reset to default menu items')
    }
  }

  // Drag and drop handlers
  const onDragStart = (e: React.DragEvent, index: number) => {
    setDraggedItem(index)
    e.dataTransfer.effectAllowed = 'move'
    const el = e.target as HTMLElement
    el.style.opacity = '0.5'
  }

  const onDragEnd = (e: React.DragEvent) => {
    setDraggedItem(null)
    const el = e.target as HTMLElement
    el.style.opacity = '1'
  }

  const onDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedItem === null || !data || draggedItem === index) return

    const newLinks = [...data.links]
    const item = newLinks[draggedItem]
    newLinks.splice(draggedItem, 1)
    newLinks.splice(index, 0, item)
    
    setData({ ...data, links: newLinks })
    setDraggedItem(index)
  }

  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-8 h-8 text-[#C52A35] animate-spin" />
        <p className="text-white/50 text-sm">Loading navigation settings...</p>
      </div>
    )
  }

  return (
    <div className="w-full h-full space-y-6 flex flex-col">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white tracking-tight">Sidebar Menu Builder</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gold/10 text-gold border border-gold/30">
              Live Drawer Menu
            </span>
          </div>
          <p className="text-white/50 text-sm mt-1">
            Add, reorder, and configure pages and product categories shown in the website's slide-out sidebar menu.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button 
            onClick={resetToDefault} 
            title="Reset to default items"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-medium border border-white/10 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset
          </button>
          
          <button 
            onClick={save} 
            disabled={saving} 
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#7A1111] to-[#550000] text-white font-semibold text-sm hover:shadow-[0_0_20px_rgba(197,42,53,0.4)] transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Main Container: Editor + Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-[550px]">
        
        {/* Left Side: Builder & Actions (8 cols on lg) */}
        <div className="lg:col-span-8 flex flex-col bg-white/[0.02] border border-white/5 rounded-2xl p-4 md:p-6 overflow-hidden">
          
          {/* Quick Add Toolbar */}
          <div className="mb-6 pb-5 border-b border-white/10 shrink-0">
            <p className="text-white/60 text-xs uppercase tracking-wider font-semibold mb-3">
              Add Items to Menu
            </p>
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => setActiveModal('category')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 font-medium text-xs transition-all shadow-sm"
              >
                <Tag className="w-4 h-4" />
                + Add Product Category
              </button>

              <button
                onClick={() => setActiveModal('page')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 font-medium text-xs transition-all shadow-sm"
              >
                <FileText className="w-4 h-4" />
                + Add Website Page
              </button>

              <button
                onClick={() => setActiveModal('custom')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 font-medium text-xs transition-all shadow-sm"
              >
                <Link2 className="w-4 h-4" />
                + Custom URL Link
              </button>
            </div>
          </div>

          {/* Category Picker Modal */}
          {activeModal === 'category' && (
            <div className="mb-6 p-4 rounded-xl bg-[#0a0000] border border-emerald-500/30 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                  <Tag className="w-4 h-4" /> Select Category or Subcategory to Add
                </div>
                <button onClick={() => setActiveModal(null)} className="text-white/50 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-white/50 text-xs mb-3">
                Click any category or subcategory below to instantly add it to your sidebar menu:
              </p>
              
              <div className="flex flex-col gap-2.5 max-h-64 overflow-y-auto pr-1">
                {categoryTree.length > 0 ? (
                  categoryTree.map((parentCat) => {
                    const isParentAdded = data.links.some(l => l.type === 'category' && (l.value === parentCat.slug || l.value === parentCat.name));
                    const hasSubs = parentCat.subcategories && parentCat.subcategories.length > 0;

                    return (
                      <div key={parentCat.id} className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-2">
                        {/* Parent Category Button */}
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => addCategoryItem({ name: parentCat.name, slug: parentCat.slug, fullValue: parentCat.slug })}
                            disabled={isParentAdded}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                              isParentAdded 
                                ? 'bg-white/5 text-white/30 border border-white/5 cursor-not-allowed'
                                : 'bg-emerald-500/20 hover:bg-emerald-500 text-white border border-emerald-500/40 hover:scale-[1.02]'
                            }`}
                          >
                            📁 {parentCat.name}
                            {isParentAdded ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Plus className="w-3.5 h-3.5 opacity-60" />}
                          </button>
                          <span className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">
                            Parent Category
                          </span>
                        </div>

                        {/* Subcategories (Indented) */}
                        {hasSubs && (
                          <div className="pl-4 border-l-2 border-emerald-500/30 flex flex-wrap gap-2 pt-1">
                            {parentCat.subcategories.map((sub: any) => {
                              const subVal = `/shop?category=${encodeURIComponent(parentCat.name)}&subCategory=${encodeURIComponent(sub.name)}`;
                              const isSubAdded = data.links.some(l => l.type === 'category' && (l.value === subVal || l.value === sub.slug));

                              return (
                                <button
                                  key={sub.id}
                                  onClick={() => addCategoryItem({
                                    name: sub.name,
                                    slug: sub.slug,
                                    isSub: true,
                                    parentName: parentCat.name,
                                    fullValue: subVal
                                  })}
                                  disabled={isSubAdded}
                                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                                    isSubAdded
                                      ? 'bg-white/5 text-white/30 border border-white/5 cursor-not-allowed'
                                      : 'bg-gold/15 hover:bg-gold text-cream hover:text-black border border-gold/30 hover:scale-105'
                                  }`}
                                >
                                  <span className="text-gold/60 text-[10px]">↳</span>
                                  <span>{sub.name}</span>
                                  {isSubAdded ? <Check className="w-3 h-3 text-emerald-400" /> : <Plus className="w-3 h-3 opacity-60" />}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => {
                      const isAdded = data.links.some(l => l.type === 'category' && l.value === cat.slug);
                      return (
                        <button
                          key={cat.slug}
                          onClick={() => addCategoryItem(cat)}
                          disabled={isAdded}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            isAdded 
                              ? 'bg-white/5 text-white/30 border border-white/5 cursor-not-allowed'
                              : 'bg-emerald-500/20 hover:bg-emerald-500 text-white border border-emerald-500/40 hover:scale-105'
                          }`}
                        >
                          {cat.name}
                          {isAdded ? <Check className="w-3 h-3 text-emerald-400" /> : <Plus className="w-3 h-3 opacity-60" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Page Picker Modal */}
          {activeModal === 'page' && (
            <div className="mb-6 p-4 rounded-xl bg-[#0a0000] border border-blue-500/30 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm">
                  <FileText className="w-4 h-4" /> Select Website Page to Add
                </div>
                <button onClick={() => setActiveModal(null)} className="text-white/50 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-white/50 text-xs mb-3">
                Select a store page to link directly from your sidebar:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                {STORE_PAGES.map((page) => (
                  <button
                    key={page.value}
                    onClick={() => addPageItem(page)}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 hover:bg-blue-500/20 border border-white/5 hover:border-blue-500/40 text-left transition-all group"
                  >
                    <div>
                      <div className="text-xs font-semibold text-white group-hover:text-blue-300">
                        {page.label}
                      </div>
                      <div className="text-[10px] text-white/40 font-mono">
                        {page.value}
                      </div>
                    </div>
                    {page.badge ? (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-gold/20 text-gold border border-gold/30">
                        {page.badge}
                      </span>
                    ) : (
                      <Plus className="w-4 h-4 text-white/30 group-hover:text-blue-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Custom URL Form Modal */}
          {activeModal === 'custom' && (
            <form onSubmit={addCustomItem} className="mb-6 p-4 rounded-xl bg-[#0a0000] border border-purple-500/30 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-purple-400 font-semibold text-sm">
                  <Link2 className="w-4 h-4" /> Add Custom Link
                </div>
                <button type="button" onClick={() => setActiveModal(null)} className="text-white/50 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-white/50 mb-1">Menu Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. VIP Club or Instagram"
                    value={customForm.label}
                    onChange={e => setCustomForm({ ...customForm, label: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-white/50 mb-1">Target URL</label>
                  <input
                    type="text"
                    required
                    placeholder="https://... or /custom-url"
                    value={customForm.url}
                    onChange={e => setCustomForm({ ...customForm, url: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-white/50 mb-1">Badge (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. HOT, NEW"
                    value={customForm.badge}
                    onChange={e => setCustomForm({ ...customForm, badge: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-3 py-1.5 rounded-lg text-xs text-white/60 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs shadow-md transition-colors"
                >
                  Add Custom Link
                </button>
              </div>
            </form>
          )}

          {/* Links List Header */}
          <div className="flex items-center justify-between mb-3 text-xs text-white/50 px-2 shrink-0">
            <span>Menu Items ({data.links.length}) - Drag to reorder</span>
            <span>Order</span>
          </div>

          {/* Scrollable Links List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2.5 pb-10">
            {data.links.length === 0 ? (
              <div className="text-center py-16 text-white/30 border border-dashed border-white/10 rounded-2xl">
                <Layout className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-medium">No menu items configured</p>
                <p className="text-xs text-white/40 mt-1">Use the buttons above to add categories or pages.</p>
              </div>
            ) : (
              data.links.map((link, i) => (
                <div 
                  key={link.id} 
                  draggable
                  onDragStart={(e) => onDragStart(e, i)}
                  onDragEnd={onDragEnd}
                  onDragOver={(e) => onDragOver(e, i)}
                  className="group flex items-center justify-between gap-3 p-3.5 rounded-xl bg-black/40 border border-white/10 hover:border-white/25 transition-all"
                >
                  {/* Left: Drag Handle & Reorder arrows */}
                  <div className="flex items-center gap-1 shrink-0">
                    <GripVertical className="w-5 h-5 text-white/20 group-hover:text-white/50 cursor-grab active:cursor-grabbing shrink-0" />
                    <div className="flex flex-col">
                      <button
                        onClick={() => move(i, 'up')}
                        disabled={i === 0}
                        title="Move Up"
                        className="p-0.5 text-white/30 hover:text-white disabled:opacity-10 transition-colors"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => move(i, 'down')}
                        disabled={i === data.links.length - 1}
                        title="Move Down"
                        className="p-0.5 text-white/30 hover:text-white disabled:opacity-10 transition-colors"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Type Icon Badge */}
                  <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center shrink-0" title={link.type === 'page' ? 'Standard Page' : link.type === 'category' ? 'Product Category' : 'Custom Link'}>
                    {link.type === 'page' && <FileText className="w-4 h-4 text-blue-400" />}
                    {link.type === 'category' && <Tag className="w-4 h-4 text-emerald-400" />}
                    {link.type === 'custom' && <Link2 className="w-4 h-4 text-purple-400" />}
                  </div>

                  {/* Middle: Title Input & Target Configuration */}
                  <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center">
                    
                    {/* Title Input */}
                    <div className="md:col-span-5">
                      <input 
                        type="text" 
                        value={link.label} 
                        onChange={e => update(i, 'label', e.target.value)}
                        placeholder="Menu Title"
                        className="w-full bg-white/5 hover:bg-white/10 focus:bg-white/10 border border-white/10 focus:border-gold rounded-lg px-3 py-1.5 text-white font-medium text-sm transition-all focus:outline-none" 
                      />
                    </div>

                    {/* Target Selector */}
                    <div className="md:col-span-4">
                      {link.type === 'category' ? (
                        <select 
                          value={link.value} 
                          onChange={e => update(i, 'value', e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-emerald-300 text-xs focus:outline-none focus:border-emerald-500 cursor-pointer"
                        >
                          {categories.map(c => (
                            <option key={c.fullValue || c.slug} value={c.fullValue || c.slug} className="bg-[#110000] text-white">
                              {c.isSub ? `  ↳ ${c.name} (${c.parentName})` : `📁 ${c.name} (Parent)`}
                            </option>
                          ))}
                        </select>
                      ) : link.type === 'page' ? (
                        <select 
                          value={link.value} 
                          onChange={e => update(i, 'value', e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-blue-300 text-xs focus:outline-none focus:border-blue-500 cursor-pointer"
                        >
                          {STORE_PAGES.map(p => (
                            <option key={p.value} value={p.value} className="bg-[#110000] text-white">
                              📄 {p.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input 
                          type="text" 
                          value={link.value} 
                          onChange={e => update(i, 'value', e.target.value)}
                          placeholder="https://..."
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-purple-300 text-xs focus:outline-none focus:border-purple-500 font-mono" 
                        />
                      )}
                    </div>

                    {/* Badge Input */}
                    <div className="md:col-span-3">
                      <input 
                        type="text" 
                        value={link.badge || ''} 
                        onChange={e => update(i, 'badge', e.target.value)}
                        placeholder="Badge (e.g. NEW)"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-gold text-xs placeholder:text-white/20 focus:outline-none focus:border-gold" 
                      />
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button 
                    onClick={() => remove(i)} 
                    title="Delete item"
                    className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Live Frontend Drawer Preview (4 cols on lg) */}
        <div className="lg:col-span-4 flex flex-col bg-white/[0.02] border border-white/5 rounded-2xl p-4 md:p-5">
          <div className="flex items-center justify-between mb-3 shrink-0 pb-3 border-b border-white/10">
            <div className="flex items-center gap-2 text-white font-semibold text-sm">
              <Eye className="w-4 h-4 text-gold" />
              Storefront Sidebar Preview
            </div>
            <span className="text-[10px] text-white/40 uppercase tracking-widest font-mono">
              Live Mockup
            </span>
          </div>

          <p className="text-[11px] text-white/50 mb-3 shrink-0">
            This is how the drawer menu will look when visitors click "Menu" on your storefront header:
          </p>

          {/* Drawer Mockup */}
          <div className="flex-1 rounded-xl bg-gradient-to-b from-[#400000] to-[#250000] border border-gold/30 p-5 shadow-2xl flex flex-col overflow-hidden relative">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
              <span className="font-display text-xl text-gold font-bold">Rimal</span>
              <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white/60 text-xs">✕</div>
            </div>

            <div className="my-3 text-[10px] uppercase tracking-[0.25em] text-gold/70 font-semibold shrink-0">
              Explore ({data.links.length})
            </div>

            {/* Menu Items Preview */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-1">
              {data.links.map((link, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center justify-between py-2.5 border-b border-white/5 text-cream/90 hover:text-gold transition-colors text-sm font-display tracking-wide"
                >
                  <div className="flex items-center gap-2">
                    <span>{link.label || 'Untitled Link'}</span>
                    {link.badge && (
                      <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded-full bg-gold/20 text-gold border border-gold/40">
                        {link.badge}
                      </span>
                    )}
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                </div>
              ))}
            </div>

            <div className="pt-4 mt-2 border-t border-white/10 text-[10px] uppercase tracking-wider text-white/40 shrink-0">
              <p>Free shipping over $150</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
