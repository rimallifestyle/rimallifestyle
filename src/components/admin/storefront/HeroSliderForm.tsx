"use client"

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Save, Loader2, Image as ImageIcon, Link as LinkIcon, Type, X } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function HeroSliderForm({ onClose }: { onClose: () => void }) {
  const [sliders, setSliders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState(0)
  const [uploadingImage, setUploadingImage] = useState(false)

  useEffect(() => {
    fetch('http://localhost/rimal_Store/backend/api/storefront/sliders.php')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setSliders(data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        toast.error('Failed to load sliders')
        setLoading(false)
      })
  }, [])

  // Send updates to iframe immediately whenever sliders change
  useEffect(() => {
    if (!loading && sliders.length > 0) {
      const iframe = document.getElementById('storefront-preview') as HTMLIFrameElement
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({ type: 'STOREFRONT_PREVIEW_UPDATE', component: 'hero_slider', data: sliders }, '*')
      }
    }
  }, [sliders, loading])

  // Sync active tab with iframe
  useEffect(() => {
    const iframe = document.getElementById('storefront-preview') as HTMLIFrameElement
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({ type: 'STOREFRONT_ACTIVE_TAB', tab: activeTab }, '*')
    }
  }, [activeTab])

  const handleSave = async () => {
    window.dispatchEvent(new CustomEvent('storefront-save-start'))
    try {
      const res = await fetch('http://localhost/rimal_Store/backend/api/storefront/sliders.php', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(sliders)
      })
      if (res.ok) {
        toast.success('Hero Sliders updated successfully!')
      } else {
        throw new Error('Failed to save')
      }
    } catch (e) {
      toast.error('Failed to save sliders')
    } finally {
      window.dispatchEvent(new CustomEvent('storefront-save-end'))
    }
  }

  useEffect(() => {
    const onSave = () => handleSave()
    window.addEventListener('storefront-save', onSave)
    return () => window.removeEventListener('storefront-save', onSave)
  }, [sliders])

  const handleChange = (index: number, field: string, value: string) => {
    const newSliders = [...sliders]
    newSliders[index][field] = value
    setSliders(newSliders)
  }

  const handleImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    const formData = new FormData()
    formData.append('image', file)

    try {
      const res = await fetch('http://localhost/rimal_Store/backend/api/upload.php', {
        method: 'POST',
        body: formData
      })
      const data = await res.json()
      if (res.ok && data.url) {
        handleChange(index, 'image', data.url)
        toast.success('Image uploaded successfully')
      } else {
        throw new Error(data.message || 'Upload failed')
      }
    } catch (err) {
      toast.error('Failed to upload image')
    } finally {
      setUploadingImage(false)
      // clear the input
      e.target.value = ''
    }
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
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -300, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="w-80 h-full bg-[#0a0000] border-r border-white/10 flex flex-col relative z-40 shadow-2xl overflow-hidden"
    >
      <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/20">
        <h3 className="font-bold text-white text-sm">Hero Slider Settings</h3>
        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex p-2 gap-1 bg-black/40 border-b border-white/10">
        {sliders.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(i)}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === i ? 'bg-white/10 text-white' : 'text-white/50 hover:bg-white/5 hover:text-white'
            }`}
          >
            Slide {i + 1}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-5">
        {sliders[activeTab] && (
          <div key={activeTab} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/70 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5" /> Image
                </span>
                <label className="text-[10px] bg-white/10 hover:bg-white/20 text-white px-2 py-1 rounded cursor-pointer transition-colors flex items-center gap-1">
                  {uploadingImage ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Upload'}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(activeTab, e)} disabled={uploadingImage} />
                </label>
              </label>
              {sliders[activeTab].image && (
                <div className="w-full h-24 rounded-lg bg-black/50 overflow-hidden border border-white/10 relative mt-2">
                  <img src={sliders[activeTab].image} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/70 flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5" /> Kicker
              </label>
              <input 
                type="text" 
                value={sliders[activeTab].kicker} 
                onChange={(e) => handleChange(activeTab, 'kicker', e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C52A35]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/70 flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5" /> Main Title
              </label>
              <input 
                type="text" 
                value={sliders[activeTab].title} 
                onChange={(e) => handleChange(activeTab, 'title', e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C52A35]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/70 flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5" /> Subtitle
              </label>
              <textarea 
                rows={3}
                value={sliders[activeTab].sub} 
                onChange={(e) => handleChange(activeTab, 'sub', e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C52A35] custom-scrollbar resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/70 flex items-center gap-1.5">
                Button Text
              </label>
              <input 
                type="text" 
                value={sliders[activeTab].cta} 
                onChange={(e) => handleChange(activeTab, 'cta', e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C52A35]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/70 flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5" /> Button Link
              </label>
              <input 
                type="text" 
                value={sliders[activeTab].ctaLink} 
                onChange={(e) => handleChange(activeTab, 'ctaLink', e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C52A35]"
              />
            </div>
            
            <div className="flex gap-4">
              <div className="space-y-1.5 flex-1">
                <label className="text-xs font-medium text-white/70">Secondary Button Text</label>
                <input 
                  type="text" 
                  value={sliders[activeTab].secondaryCta || ''} 
                  onChange={(e) => handleChange(activeTab, 'secondaryCta', e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C52A35]"
                />
              </div>
              <div className="space-y-1.5 flex-1">
                <label className="text-xs font-medium text-white/70">Secondary Button Link</label>
                <input 
                  type="text" 
                  value={sliders[activeTab].secondaryCtaLink || ''} 
                  onChange={(e) => handleChange(activeTab, 'secondaryCtaLink', e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C52A35]"
                />
              </div>
            </div>

          </div>
        )}
      </div>
    </motion.div>
  )
}
