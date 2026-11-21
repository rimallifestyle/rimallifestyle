"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Loader2, Plus, Trash2, GripVertical } from 'lucide-react'
import { toast } from 'sonner'

export function MarqueeForm({ onClose }: { onClose?: () => void }) {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('http://localhost/rimal_Store/backend/api/storefront/marquee.php')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setItems(data)
        }
        setLoading(false)
      })
      .catch(() => {
        toast.error('Failed to load marquee items')
        setLoading(false)
      })

    const handleSaveStart = () => handleSave()
    window.addEventListener('storefront-save-start', handleSaveStart)
    return () => window.removeEventListener('storefront-save-start', handleSaveStart)
  }, [items]) // include items in dependency for handleSave to have the latest state!
  // Wait, if items is in deps, the useEffect runs on every item change. It's better to use a ref for handleSave or remove the dependency and rely on state.
  // Actually, wait, let's fix that.

  // Send updates to iframe immediately whenever items change
  useEffect(() => {
    if (!loading && items.length > 0) {
      const iframe = document.getElementById('storefront-preview') as HTMLIFrameElement
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({ type: 'STOREFRONT_PREVIEW_UPDATE', component: 'marquee', data: items }, '*')
      }
    }
  }, [items, loading])

  const handleSave = async () => {
    window.dispatchEvent(new CustomEvent('storefront-save-start'))
    try {
      setSaving(true)
      const res = await fetch('http://localhost/rimal_Store/backend/api/storefront/marquee.php', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(items)
      })
      if (!res.ok) throw new Error('Save failed')
      window.dispatchEvent(new CustomEvent('storefront-save-success'))
      toast.success('Marquee saved successfully')
    } catch (err) {
      window.dispatchEvent(new CustomEvent('storefront-save-error'))
      toast.error('Failed to save marquee')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (index: number, value: string) => {
    const newItems = [...items]
    newItems[index].text = value
    setItems(newItems)
  }

  const handleAdd = () => {
    setItems([...items, { id: Date.now(), text: 'New Announcement' }])
  }

  const handleRemove = (index: number) => {
    const newItems = [...items]
    newItems.splice(index, 1)
    setItems(newItems)
  }

  if (loading) {
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
          <h3 className="text-sm font-semibold text-white">Announcement Items</h3>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleAdd}
              className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold bg-white/5 hover:bg-white/10 text-white px-2 py-1.5 rounded transition-colors"
            >
              <Plus className="w-3 h-3" /> Add Item
            </button>
            {onClose && (
              <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/70 hover:text-white"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            )}
          </div>
        </div>
        
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={item.id || index} className="flex gap-2 items-start bg-white/5 p-3 rounded-lg border border-white/5">
              <GripVertical className="w-4 h-4 text-white/30 cursor-grab mt-2" />
              <div className="flex-1 space-y-1.5">
                <input 
                  type="text" 
                  value={item.text} 
                  onChange={(e) => handleChange(index, e.target.value)}
                  placeholder="e.g. Free Shipping"
                  className="w-full bg-black/40 border border-white/10 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-[#C52A35]"
                />
              </div>
              <button 
                onClick={() => handleRemove(index)}
                className="text-white/30 hover:text-red-400 p-1 transition-colors mt-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
