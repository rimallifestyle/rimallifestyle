"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

export function FooterForm({ onClose }: { onClose?: () => void }) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('http://localhost/rimal_Store/backend/api/storefront/settings.php?key=footer_settings')
      .then(res => res.json())
      .then(json => {
        const defaultData = {
          description: "Rimal Store crafts refined menswear inspired by heritage tailoring and modern design. Made to last a lifetime.",
          socialLinks: { instagram: "#", facebook: "#", twitter: "#", youtube: "#" },
          columns: [
            { title: "Shop", links: [{label: "New Arrivals", url: "#"}] },
            { title: "About", links: [{label: "Our Story", url: "#"}] },
            { title: "Help", links: [{label: "Contact", url: "#"}] }
          ],
          bottomLinks: [{label: "Privacy", url: "#"}]
        };
        
        if (!json || json.error || json.message || Object.keys(json).length === 0) {
          setData(defaultData)
        } else {
          setData({
             description: json.description || defaultData.description,
             socialLinks: json.socialLinks || defaultData.socialLinks,
             columns: json.columns || defaultData.columns,
             bottomLinks: json.bottomLinks || defaultData.bottomLinks
          })
        }
        setLoading(false)
      })
      .catch(() => {
        // Fallback to default data if fetch fails completely
        const defaultData = {
          description: "Rimal Store crafts refined menswear inspired by heritage tailoring and modern design. Made to last a lifetime.",
          socialLinks: { instagram: "#", facebook: "#", twitter: "#", youtube: "#" },
          columns: [
            { title: "Shop", links: [{label: "New Arrivals", url: "#"}] },
            { title: "About", links: [{label: "Our Story", url: "#"}] },
            { title: "Help", links: [{label: "Contact", url: "#"}] }
          ],
          bottomLinks: [{label: "Privacy", url: "#"}]
        };
        setData(defaultData)
        toast.error('Failed to load footer settings, using defaults')
        setLoading(false)
      })

    const handleSaveStart = () => handleSave()
    window.addEventListener('storefront-save-start', handleSaveStart)
    return () => window.removeEventListener('storefront-save-start', handleSaveStart)
  }, [])

  useEffect(() => {
    // Also rebind handleSave manually if dependencies change, or just use the current data in the event listener if we used a ref.
    // For simplicity, we just trigger the preview update here:
    if (!loading && data) {
      const iframe = document.getElementById('storefront-preview') as HTMLIFrameElement
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({ type: 'STOREFRONT_PREVIEW_UPDATE', component: 'footer', data: data }, '*')
      }
    }
  }, [data, loading])

  const handleSave = async () => {
    if (!data) return;
    window.dispatchEvent(new CustomEvent('storefront-save-start'))
    try {
      setSaving(true)
      const res = await fetch('http://localhost/rimal_Store/backend/api/storefront/settings.php?key=footer_settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!res.ok) throw new Error('Save failed')
      window.dispatchEvent(new CustomEvent('storefront-save-success'))
      toast.success('Footer settings saved successfully')
    } catch (err) {
      window.dispatchEvent(new CustomEvent('storefront-save-error'))
      toast.error('Failed to save footer settings')
    } finally {
      setSaving(false)
    }
  }

  const handleSocialChange = (network: string, url: string) => {
    setData({
      ...data,
      socialLinks: {
        ...data.socialLinks,
        [network]: url
      }
    })
  }

  const handleColumnTitleChange = (colIndex: number, title: string) => {
    const newCols = [...data.columns]
    newCols[colIndex].title = title
    setData({ ...data, columns: newCols })
  }

  const handleLinkChange = (colIndex: number, linkIndex: number, field: 'label'|'url', value: string) => {
    const newCols = [...data.columns]
    newCols[colIndex].links[linkIndex][field] = value
    setData({ ...data, columns: newCols })
  }

  const addLink = (colIndex: number) => {
    const newCols = [...data.columns]
    newCols[colIndex].links.push({ label: 'New Link', url: '#' })
    setData({ ...data, columns: newCols })
  }

  const removeLink = (colIndex: number, linkIndex: number) => {
    const newCols = [...data.columns]
    newCols[colIndex].links.splice(linkIndex, 1)
    setData({ ...data, columns: newCols })
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
      className="w-[380px] h-full bg-[#0a0000] border-r border-white/10 relative z-40 shadow-[10px_0_40px_rgba(0,0,0,0.5)] flex flex-col"
    >
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-semibold text-white">Footer Settings</h3>
          <div className="flex items-center gap-2">
             <button onClick={handleSave} disabled={saving} className="bg-[#C52A35] text-white px-3 py-1 text-xs rounded hover:bg-[#a1202a] disabled:opacity-50">
               {saving ? 'Saving...' : 'Save'}
             </button>
            {onClose && (
              <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/70 hover:text-white"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            )}
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-white/70">Brand Description</label>
            <textarea 
              value={data.description || ''} 
              onChange={(e) => setData({...data, description: e.target.value})}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C52A35] min-h-[80px]"
            />
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-medium text-white/70 border-b border-white/10 pb-1">Social Links</h4>
            {['instagram', 'tiktok', 'facebook', 'whatsapp', 'twitter', 'youtube'].map(network => (
              <div key={network} className="space-y-1">
                <label className="text-[10px] text-white/50 capitalize">{network}</label>
                <input 
                  type="text" 
                  value={data.socialLinks?.[network] || ''} 
                  onChange={(e) => handleSocialChange(network, e.target.value)}
                  placeholder={network === 'whatsapp' ? 'https://wa.me/8801577229347' : `https://${network}.com/...`}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#C52A35]"
                />
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-medium text-white/70 border-b border-white/10 pb-1">Navigation Columns</h4>
            
            {data.columns?.map((col: any, colIndex: number) => (
              <div key={colIndex} className="bg-black/30 border border-white/5 p-3 rounded-lg space-y-3">
                <input 
                  type="text" 
                  value={col.title} 
                  onChange={(e) => handleColumnTitleChange(colIndex, e.target.value)}
                  className="w-full bg-transparent border-b border-white/20 px-1 py-1 text-xs text-gold font-semibold uppercase tracking-wider focus:outline-none focus:border-white"
                />
                
                <div className="space-y-2">
                  {col.links.map((link: any, linkIndex: number) => (
                    <div key={linkIndex} className="flex items-center gap-2 bg-black/40 p-1.5 rounded border border-white/5">
                      <div className="flex-1 space-y-1">
                        <input 
                          type="text" 
                          value={link.label}
                          onChange={(e) => handleLinkChange(colIndex, linkIndex, 'label', e.target.value)}
                          placeholder="Label"
                          className="w-full bg-transparent text-[11px] text-white focus:outline-none"
                        />
                        <input 
                          type="text" 
                          value={link.url}
                          onChange={(e) => handleLinkChange(colIndex, linkIndex, 'url', e.target.value)}
                          placeholder="/url"
                          className="w-full bg-transparent text-[10px] text-white/50 focus:outline-none"
                        />
                      </div>
                      <button onClick={() => removeLink(colIndex, linkIndex)} className="p-1 hover:text-red-400 text-white/30">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  
                  <button onClick={() => addLink(colIndex)} className="flex items-center gap-1 text-[10px] text-white/50 hover:text-white transition">
                    <Plus className="w-3 h-3" /> Add Link
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </motion.div>
  )
}
