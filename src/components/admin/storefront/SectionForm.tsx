"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function SectionForm({ sectionId, onClose }: { sectionId: string; onClose?: () => void }) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [allProducts, setAllProducts] = useState<any[]>([])

  // Remove the 'section_' prefix passed from the builder
  const id = sectionId.startsWith('section_') ? sectionId.replace('section_', '') : sectionId

  useEffect(() => {
    // If it's the discount section, fetch products for selection
    if (id === 'discount') {
      fetch('http://localhost/rimal/wp-json/wp/v2/rimal_product?_embed=1&per_page=100')
        .then(res => res.json())
        .then(json => {
          if (Array.isArray(json)) setAllProducts(json)
        })
        .catch(console.error)
    }

    fetch(`http://localhost/rimal_Store/backend/api/storefront/sections.php?id=${id}`)
      .then(res => res.json())
      .then(json => {
        if (json && !json.error) {
          setData(json)
        } else {
          // fallback default data if it doesn't exist in DB
          setData({
            id: id,
            eyebrow: 'Category',
            title: 'Section Title',
            description: 'Section description goes here.',
            maxProducts: 8
          })
        }
        setLoading(false)
      })
      .catch(() => {
        toast.error('Failed to load section data')
        setLoading(false)
      })

    const handleSaveStart = () => handleSave()
    window.addEventListener('storefront-save-start', handleSaveStart)
    return () => window.removeEventListener('storefront-save-start', handleSaveStart)
  }, [id, data]) // re-bind handleSave with latest data

  useEffect(() => {
    if (!loading && data) {
      const iframe = document.getElementById('storefront-preview') as HTMLIFrameElement
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({ type: 'STOREFRONT_PREVIEW_UPDATE', component: 'section', id: id, data: data }, '*')
      }
    }
  }, [data, loading, id])

  const handleSave = async () => {
    window.dispatchEvent(new CustomEvent('storefront-save-start'))
    try {
      setSaving(true)
      const res = await fetch('http://localhost/rimal_Store/backend/api/storefront/sections.php', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!res.ok) throw new Error('Save failed')
      window.dispatchEvent(new CustomEvent('storefront-save-success'))
      toast.success('Section saved successfully')
    } catch (err) {
      window.dispatchEvent(new CustomEvent('storefront-save-error'))
      toast.error('Failed to save section')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field: string, value: any) => {
    setData({ ...data, [field]: value })
  }

  const handleProductToggle = (productId: string) => {
    let selected = []
    if (data.selectedProducts) {
      selected = data.selectedProducts.split(',').filter(Boolean)
    }
    if (selected.includes(productId)) {
      selected = selected.filter((id: string) => id !== productId)
    } else {
      selected.push(productId)
    }
    handleChange('selectedProducts', selected.join(','))
  }

  const handleCategoryToggle = (categorySlug: string) => {
    let selected = []
    if (data.selectedCategories) {
      selected = data.selectedCategories.split(',').filter(Boolean)
    }
    if (selected.includes(categorySlug)) {
      selected = selected.filter((c: string) => c !== categorySlug)
    } else {
      selected.push(categorySlug)
    }
    handleChange('selectedCategories', selected.join(','))
  }

  if (loading || !data) {
    return (
      <div className="w-80 h-full bg-[#0a0000] border-r border-white/10 flex items-center justify-center relative z-40 shadow-2xl">
        <Loader2 className="w-6 h-6 text-[#C52A35] animate-spin" />
      </div>
    )
  }

  return (
    <motion.div 
      initial={{ x: -320 }}
      animate={{ x: 0 }}
      exit={{ x: -320 }}
      transition={{ type: "spring", bounce: 0, duration: 0.4 }}
      className="w-[340px] h-full bg-[#0a0000] border-r border-white/10 relative z-40 shadow-[10px_0_40px_rgba(0,0,0,0.5)] flex flex-col"
    >
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-semibold text-white capitalize">{id} Section Content</h3>
          {onClose && (
            <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/70 hover:text-white"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          )}
        </div>
        
        <div className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/70">Eyebrow (Small Text above Title)</label>
            <input 
              type="text" 
              value={data.eyebrow || ''} 
              onChange={(e) => handleChange('eyebrow', e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C52A35]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/70">Section Title</label>
            <input 
              type="text" 
              value={data.title || ''} 
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C52A35]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/70">Description</label>
            <textarea 
              value={data.description || ''} 
              onChange={(e) => handleChange('description', e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C52A35] min-h-[80px]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/70">
              {id === 'category_showcase' ? 'Number of Categories to Show' : 'Number of Products to Show'}
            </label>
            <div className="flex items-center gap-3 bg-black/40 border border-white/10 rounded-lg px-3 py-2">
              <input 
                type="range" 
                min="4" 
                max="24" 
                step="4"
                value={data.maxProducts || 8} 
                onChange={(e) => handleChange('maxProducts', parseInt(e.target.value))}
                className="flex-1 accent-[#C52A35]"
              />
              <span className="text-xs text-white font-mono w-4 text-center">{data.maxProducts || 8}</span>
            </div>
          </div>

          {id === 'discount' && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/70">Target Date & Time (Countdown)</label>
                <input 
                  type="datetime-local" 
                  value={data.targetDate ? data.targetDate.slice(0, 16) : ''} 
                  onChange={(e) => handleChange('targetDate', e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C52A35]"
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/70">Selected Products</label>
                <div className="bg-black/40 border border-white/10 rounded-lg p-3 max-h-[200px] overflow-y-auto custom-scrollbar space-y-2">
                  {allProducts.length === 0 ? (
                    <span className="text-xs text-white/50">Loading products...</span>
                  ) : (
                    allProducts.map(p => {
                      const pId = p.slug || `wp-${p.id}`;
                      const isSelected = (data.selectedProducts || '').split(',').includes(pId);
                      return (
                        <label key={pId} className="flex items-center gap-2 cursor-pointer group">
                          <input 
                            type="checkbox" 
                            checked={isSelected}
                            onChange={() => handleProductToggle(pId)}
                            className="accent-[#C52A35] w-3.5 h-3.5 bg-black/50 border-white/20"
                          />
                          <span className="text-xs text-white/80 group-hover:text-white transition-colors truncate">
                            {p.title?.rendered || 'Unnamed Product'}
                          </span>
                        </label>
                      )
                    })
                  )}
                </div>
              </div>
            </>
          )}

          {id === 'category_showcase' && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/70">Sort Categories By</label>
                <select 
                  value={data.sortBy || 'manual'} 
                  onChange={(e) => handleChange('sortBy', e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C52A35]"
                >
                  <option value="manual">Manual Selection Order</option>
                  <option value="sales">Top Selling (Most Sales)</option>
                </select>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/70">Select Categories to Show</label>
                <div className="bg-black/40 border border-white/10 rounded-lg p-3 max-h-[200px] overflow-y-auto custom-scrollbar space-y-2">
                  {[
                    { id: 'shirt', name: 'Shirts' },
                    { id: 'tshirt', name: 'T-Shirts' },
                    { id: 'pant', name: 'Trousers & Pants' },
                    { id: 'hat', name: 'Hats' },
                    { id: 'polo', name: 'Polo Shirts' },
                    { id: 'jacket', name: 'Jackets' },
                    { id: 'panjabi', name: 'Panjabis' }
                  ].map(cat => {
                    const isSelected = (data.selectedCategories || '').split(',').includes(cat.id);
                    return (
                      <label key={cat.id} className="flex items-center gap-2 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={isSelected}
                          onChange={() => handleCategoryToggle(cat.id)}
                          className="accent-[#C52A35] w-3.5 h-3.5 bg-black/50 border-white/20"
                        />
                        <span className="text-xs text-white/80 group-hover:text-white transition-colors">
                          {cat.name}
                        </span>
                      </label>
                    )
                  })}
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </motion.div>
  )
}
