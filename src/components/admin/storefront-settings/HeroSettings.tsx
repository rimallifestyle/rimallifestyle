"use client"

import React, { useState, useEffect } from 'react'
import { Save, Loader2, Image as ImageIcon, Trash2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import banner1 from "@/assets/banner-1.jpg"
import banner2 from "@/assets/banner-2.jpg"
import banner3 from "@/assets/banner-3.jpg"

const API = '/api/storefront/sliders'

const getImageUrl = (url: string) => {
  if (!url) return '';
  if (url === '/src/assets/banner-1.jpg') return (banner1 as any).src || banner1;
  if (url === '/src/assets/banner-2.jpg') return (banner2 as any).src || banner2;
  if (url === '/src/assets/banner-3.jpg') return (banner3 as any).src || banner3;
  if (url.startsWith('/src/')) return url; // Let it break if it's a generic src path
  return url;
}

export default function HeroSliderPage() {
  const [sliders, setSliders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState(0)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetch(API)
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setSliders(data) })
      .catch(() => toast.error('Failed to load sliders'))
      .finally(() => setLoading(false))
  }, [])

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch(API, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sliders)
      })
      if (!res.ok) throw new Error()
      toast.success('Hero slider saved!')
    } catch {
      toast.error('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const update = (i: number, field: string, val: string) => {
    const s = [...sliders]; s[i][field] = val; setSliders(s)
  }

  const uploadImage = async (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    setUploading(true)
    const form = new FormData(); form.append('image', file)
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: form })
      const data = await res.json()
      if (res.ok && data.url) { update(i, 'image', data.url); toast.success('Image uploaded!') }
      else throw new Error()
    } catch { toast.error('Upload failed') }
    finally { setUploading(false); e.target.value = '' }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-[#C52A35] animate-spin" /></div>

  const s = sliders[activeTab]

  return (
    <div className="w-full w-full h-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Hero Slider</h1>
          <p className="text-white/50 text-sm mt-1">Edit banner slides shown at the top of the homepage</p>
        </div>
        <button onClick={save} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#7A1111] to-[#550000] text-white font-semibold text-sm hover:shadow-[0_0_20px_rgba(197,42,53,0.4)] transition-all disabled:opacity-50">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 items-center flex-wrap">
        {sliders.map((_, i) => (
          <button key={i} onClick={() => setActiveTab(i)}
            className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === i ? 'bg-[#C52A35] text-white' : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'}`}>
            Slide {i + 1}
          </button>
        ))}
        <button onClick={() => {
          setSliders([...sliders, { image: '', kicker: '', title: '', sub: '', cta: '', ctaLink: '' }])
          setActiveTab(sliders.length)
        }} className="p-2 rounded-xl bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-all">
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {s && (
        <div className="glass-card rounded-2xl p-6 space-y-5 relative">
          {/* Image Upload Section */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="text-white/60 text-xs uppercase tracking-widest block">Banner Image</label>
              {sliders.length > 1 && (
                <button onClick={() => {
                  const s = [...sliders]; s.splice(activeTab, 1); setSliders(s)
                  setActiveTab(Math.max(0, activeTab - 1))
                }} className="p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            
            {s.image && (
              <div className="w-full h-40 rounded-xl overflow-hidden border border-white/10">
                <img src={getImageUrl(s.image)} alt="slide" className="w-full h-full object-cover" />
              </div>
            )}
            <label className="flex items-center gap-2 w-fit px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors cursor-pointer">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
              {uploading ? 'Uploading...' : 'Upload Image'}
              <input type="file" accept="image/*" className="hidden" onChange={e => uploadImage(activeTab, e)} disabled={uploading} />
            </label>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {[
              { label: 'Kicker (small top text)', field: 'kicker', placeholder: 'e.g. Autumn / Winter Collection' },
              { label: 'Main Title', field: 'title', placeholder: 'e.g. Crafted for the modern gentleman' },
            ].map(({ label, field, placeholder }) => (
              <div key={field}>
                <label className="text-white/60 text-xs uppercase tracking-widest block mb-1.5">{label}</label>
                <input type="text" value={s[field] || ''} onChange={e => update(activeTab, field, e.target.value)}
                  placeholder={placeholder}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C52A35]" />
              </div>
            ))}
            <div>
              <label className="text-white/60 text-xs uppercase tracking-widest block mb-1.5">Subtitle</label>
              <textarea rows={2} value={s.sub || ''} onChange={e => update(activeTab, 'sub', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C52A35] resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-white/60 text-xs uppercase tracking-widest block mb-1.5">Button Text</label>
                <input type="text" value={s.cta || ''} onChange={e => update(activeTab, 'cta', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C52A35]" />
              </div>
              <div>
                <label className="text-white/60 text-xs uppercase tracking-widest block mb-1.5">Button Link</label>
                <input type="text" value={s.ctaLink || ''} onChange={e => update(activeTab, 'ctaLink', e.target.value)}
                  placeholder="#section or /page"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C52A35]" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

