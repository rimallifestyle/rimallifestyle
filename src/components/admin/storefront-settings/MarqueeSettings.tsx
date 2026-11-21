"use client"

import React, { useState, useEffect } from 'react'
import { Plus, Trash2, Save, Loader2, GripVertical } from 'lucide-react'
import { toast } from 'sonner'

const API = '/api/storefront/marquee'

export default function MarqueePage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch(API)
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setItems(data) })
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch(API, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(items)
      })
      if (!res.ok) throw new Error()
      toast.success('Announcement bar saved!')
    } catch { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  const update = (i: number, val: string) => {
    const n = [...items]; n[i].text = val; setItems(n)
  }

  const add = () => setItems([...items, { id: Date.now(), text: 'New Announcement' }])

  const remove = (i: number) => {
    const n = [...items]; n.splice(i, 1); setItems(n)
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-[#C52A35] animate-spin" /></div>

  return (
    <div className="w-full w-full h-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Announcement Bar</h1>
          <p className="text-white/50 text-sm mt-1">Scrolling text shown at the top of the storefront</p>
        </div>
        <button onClick={save} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#7A1111] to-[#550000] text-white font-semibold text-sm hover:shadow-[0_0_20px_rgba(197,42,53,0.4)] transition-all disabled:opacity-50">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="glass-card rounded-2xl p-6 space-y-3">
        <div className="flex items-center justify-between mb-2">
          <p className="text-white/60 text-sm">Drag to reorder • Click text to edit</p>
          <button onClick={add} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/70 text-xs hover:bg-white/10 hover:text-white transition-colors">
            <Plus className="w-3 h-3" /> Add Item
          </button>
        </div>

        {items.length === 0 && (
          <div className="text-center py-8 text-white/30 text-sm">No announcements yet. Click "Add Item" to start.</div>
        )}

        {items.map((item, i) => (
          <div key={item.id || i} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3 group">
            <GripVertical className="w-4 h-4 text-white/20 shrink-0" />
            <input
              type="text"
              value={item.text}
              onChange={e => update(i, e.target.value)}
              className="flex-1 bg-transparent text-sm text-white focus:outline-none placeholder:text-white/30"
              placeholder="Announcement text..."
            />
            <button onClick={() => remove(i)} className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400 transition-all shrink-0">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

