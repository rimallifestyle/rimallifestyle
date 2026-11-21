"use client"

import React, { useState, useEffect } from 'react'
import { Save, Loader2, Image as ImageIcon } from 'lucide-react'
import { toast } from 'sonner'

const API = '/api/storefront/settings?key=site_identity'

export default function SiteIdentitySettings() {
  const [data, setData] = useState<{ logoUrl: string, storeName: string }>({ logoUrl: '', storeName: 'Rimal Store' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetch(API)
      .then(res => res.json())
      .then(json => {
        if (json && Object.keys(json).length > 0) {
          setData(prev => ({ ...prev, ...json }))
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch(API, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!res.ok) throw new Error()
      toast.success('Site identity saved!')
    } catch {
      toast.error('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const uploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; 
    if (!file) return
    setUploading(true)
    const form = new FormData(); 
    form.append('image', file)
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: form })
      const json = await res.json()
      if (res.ok && json.url) { 
        setData(prev => ({ ...prev, logoUrl: json.url }))
        toast.success('Logo uploaded!') 
      }
      else throw new Error()
    } catch { 
      toast.error('Upload failed') 
    }
    finally { 
      setUploading(false); 
      e.target.value = '' 
    }
  }

  if (loading) return <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 text-[#C52A35] animate-spin" /></div>

  return (
    <div className="w-full h-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Site Identity</h1>
          <p className="text-white/50 text-sm mt-1">Manage your store logo and name</p>
        </div>
        <button onClick={save} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#7A1111] to-[#550000] text-white font-semibold text-sm hover:shadow-[0_0_20px_rgba(197,42,53,0.4)] transition-all disabled:opacity-50">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="glass-card rounded-2xl p-6 space-y-6">
        <div>
          <label className="text-white/60 text-xs uppercase tracking-widest block mb-3">Store Logo</label>
          {data.logoUrl && (
            <div className="w-48 h-auto bg-white/5 rounded-xl p-4 flex items-center justify-center mb-3 border border-white/10">
              <img src={data.logoUrl} alt="Store Logo" className="max-w-full h-auto max-h-20 object-contain" />
            </div>
          )}
          <label className="flex items-center gap-2 w-fit px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors cursor-pointer">
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
            {uploading ? 'Uploading...' : 'Upload Logo'}
            <input type="file" accept="image/*" className="hidden" onChange={uploadImage} disabled={uploading} />
          </label>
          <p className="text-white/40 text-xs mt-2">Recommended size: 200x60px. PNG or SVG with transparent background.</p>
        </div>

        <div>
          <label className="text-white/60 text-xs uppercase tracking-widest block mb-1.5">Store Name (Fallback)</label>
          <input 
            type="text" 
            value={data.storeName} 
            onChange={e => setData({ ...data, storeName: e.target.value })}
            placeholder="Rimal Store"
            className="w-full max-w-md bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C52A35]" 
          />
          <p className="text-white/40 text-xs mt-2">This is used if the logo image fails to load or is not uploaded.</p>
        </div>
      </div>
    </div>
  )
}
