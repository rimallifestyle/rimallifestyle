"use client"

import React, { useState, useEffect } from 'react'
import { Palette, Layout, Type, Image as ImageIcon, Monitor, Smartphone, Upload, CheckCircle2, Sliders, Eye } from 'lucide-react'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { cn } from '@/lib/utils'

import { toast } from 'sonner'

export default function AppearancePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<{ logoUrl: string, faviconUrl: string, storeName: string }>({ logoUrl: '', faviconUrl: '', storeName: 'Rimal Store' })
  const [saving, setSaving] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingFavicon, setUploadingFavicon] = useState(false)

  const API = '/api/admin/settings?key=site_identity'

  useEffect(() => {
    fetch(API)
      .then(res => res.json())
      .then(json => {
        if (json && json.data) {
          setData(prev => ({ ...prev, ...json.data }))
        } else if (json && !json.data && Object.keys(json).length > 0 && !json.message) {
          // fallback if it returned flat data directly
          setData(prev => ({ ...prev, ...json }))
        }
      })
      .catch(() => {})
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'site_identity', value: data })
      })
      if (!res.ok) throw new Error()
      toast.success('Appearance settings saved!')
    } catch {
      toast.error('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const uploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; 
    if (!file) return
    
    // Cloudinary limit is usually 10MB
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size too large. Maximum is 10MB.')
      if (e.target) e.target.value = ''
      return
    }
    
    setUploadingLogo(true)
    
    const formData = new FormData()
    formData.append("file", file)
    
    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData
      })
      const uploadData = await res.json()
      
      if (res.ok && uploadData.url) { 
        setData(prev => ({ ...prev, logoUrl: uploadData.url }))
        toast.success('Logo uploaded! Click Save Changes to apply.') 
      }
      else throw new Error(uploadData.error || 'Upload failed')
    } catch { 
      toast.error('Upload failed') 
    } finally {
      setUploadingLogo(false)
      if (e.target) e.target.value = ''
    }
  }

  const uploadFavicon = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; 
    if (!file) return
    
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size too large. Maximum is 10MB.')
      if (e.target) e.target.value = ''
      return
    }

    setUploadingFavicon(true)
    
    const formData = new FormData()
    formData.append("file", file)
    
    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData
      })
      const uploadData = await res.json()
      
      if (res.ok && uploadData.url) { 
        setData(prev => ({ ...prev, faviconUrl: uploadData.url }))
        toast.success('Favicon uploaded! Click Save Changes to apply.') 
      }
      else throw new Error(uploadData.error || 'Upload failed')
    } catch { 
      toast.error('Upload failed') 
    } finally {
      setUploadingFavicon(false)
      if (e.target) e.target.value = ''
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 pt-4 pb-6">
        <div className="mb-2 space-y-2">
          <div className="h-8 w-48 rounded-md bg-white/10 animate-pulse" />
          <div className="h-4 w-96 rounded-md bg-white/10 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-4">
          <div className="xl:col-span-2 glass-card rounded-3xl p-6 h-[500px] animate-pulse bg-white/5" />
          <div className="xl:col-span-1 space-y-6">
            <div className="glass-card rounded-3xl p-6 h-[240px] animate-pulse bg-white/5" />
            <div className="glass-card rounded-3xl p-6 h-[240px] animate-pulse bg-white/5" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 pt-4 pb-6">
      {/* Page Header */}
      <ScrollReveal delay={0.1}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Appearance & Branding</h1>
            <p className="text-white/60 text-sm">Customize the look and feel of your storefront.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 h-10 px-4 rounded-xl bg-white/5 border border-white/10 text-sm font-medium text-white hover:bg-white/10 transition-colors">
              <Eye className="w-4 h-4" />
              Live Preview
            </button>
            <button 
              onClick={save} 
              disabled={saving}
              className="flex items-center gap-2 h-10 px-6 rounded-xl bg-gradient-to-r from-[#7A1111] to-[#550000] text-sm font-medium text-white hover:shadow-[0_0_20px_rgba(122,17,17,0.4)] transition-all disabled:opacity-50"
            >
              {saving ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : null}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </ScrollReveal>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Column: Active Theme & Branding */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Active Theme Preview */}
          <ScrollReveal delay={0.2} direction="up">
            <div className="glass-card rounded-3xl p-6 relative overflow-hidden group">
              <h2 className="text-lg font-medium text-white mb-6 flex items-center gap-2">
                <Layout className="w-5 h-5 text-[#C52A35]" />
                Active Theme
              </h2>
              
              <div className="rounded-2xl border border-white/10 bg-[#0a0202] overflow-hidden mb-6 relative">
                {/* CSS Website Mockup */}
                <div className="h-8 border-b border-white/5 flex items-center px-4 gap-2 bg-white/5">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
                  </div>
                  <div className="mx-auto w-48 h-4 rounded bg-white/5" />
                </div>
                
                <div className="h-[250px] relative p-6 flex flex-col items-center justify-center text-center">
                  <div className="absolute inset-0 bg-gradient-to-b from-[#C52A35]/20 to-transparent opacity-20 pointer-events-none" />
                  <div className="w-16 h-16 rounded-full bg-[#C52A35]/20 mb-4 flex items-center justify-center">
                    <Monitor className="w-8 h-8 text-[#C52A35]" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 tracking-wide uppercase">Rimal Storefront</h3>
                  <p className="text-sm text-white/50 max-w-sm">
                    A premium, highly-optimized e-commerce theme with glassmorphism UI.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-white font-medium">Rimal Premium Theme <span className="text-xs bg-white/10 text-white/50 px-2 py-0.5 rounded ml-2">v2.1.0</span></h3>
                  <p className="text-sm text-white/50 mt-1">By Rimal Team</p>
                </div>
                <button className="w-full sm:w-auto h-10 px-6 rounded-xl bg-white/5 border border-white/10 text-sm font-medium text-white hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
                  <Sliders className="w-4 h-4" />
                  Customize Theme
                </button>
              </div>
            </div>
          </ScrollReveal>

          {/* Branding / Identity */}
          <ScrollReveal delay={0.3} direction="up">
            <div className="glass-card rounded-3xl p-6">
              <h2 className="text-lg font-medium text-white mb-6 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-blue-400" />
                Store Identity
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Logo Upload */}
                <div>
                  <p className="text-sm font-medium text-white mb-3">Main Logo</p>
                  <label className="relative h-[120px] rounded-2xl border-2 border-dashed border-white/10 hover:border-white/30 transition-colors flex flex-col items-center justify-center bg-white/5 group cursor-pointer overflow-hidden">
                    {data.logoUrl ? (
                      <div className="absolute inset-0 p-4 flex items-center justify-center bg-black/40">
                        <img src={data.logoUrl} alt="Logo preview" className="max-w-full max-h-full object-contain" />
                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Upload className="w-5 h-5 text-white mb-1" />
                          <span className="text-xs text-white">Change Logo</span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                          {uploadingLogo ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Upload className="w-4 h-4 text-white/50 group-hover:text-white transition-colors" />}
                        </div>
                        <p className="text-xs text-white/50">{uploadingLogo ? 'Uploading...' : 'PNG, SVG up to 2MB'}</p>
                      </>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={uploadLogo} disabled={uploadingLogo} />
                  </label>
                  <div className="mt-4">
                    <p className="text-xs font-medium text-white/60 mb-1">Store Name (Fallback Text)</p>
                    <input 
                      type="text" 
                      value={data.storeName}
                      onChange={(e) => setData({ ...data, storeName: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#C52A35]"
                    />
                  </div>
                </div>

                {/* Favicon Upload */}
                <div>
                  <p className="text-sm font-medium text-white mb-3">Favicon</p>
                  <label className={cn(
                    "h-[120px] rounded-2xl border-2 border-dashed transition-colors flex flex-col items-center justify-center group cursor-pointer relative overflow-hidden",
                    uploadingFavicon ? "border-white/20 bg-white/5 opacity-50" : "border-white/10 hover:border-white/30 bg-white/5"
                  )}>
                    {data.faviconUrl && !uploadingFavicon ? (
                      <div className="absolute inset-0 p-4 flex items-center justify-center bg-white/5">
                        <img src={data.faviconUrl} alt="Favicon" className="w-12 h-12 object-contain drop-shadow-xl" />
                      </div>
                    ) : (
                      <>
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                          <Upload className="w-4 h-4 text-white/50 group-hover:text-white transition-colors" />
                        </div>
                        <p className="text-xs text-white/50">{uploadingFavicon ? 'Uploading...' : '512x512 PNG'}</p>
                      </>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={uploadFavicon} disabled={uploadingFavicon} />
                  </label>
                </div>

              </div>
            </div>
          </ScrollReveal>

        </div>

        {/* Right Column: Colors & Typography */}
        <div className="xl:col-span-1 space-y-6">
          
          <ScrollReveal delay={0.4} direction="right">
            <div className="glass-card rounded-3xl p-6">
              <h2 className="text-lg font-medium text-white mb-6 flex items-center gap-2">
                <Palette className="w-5 h-5 text-purple-400" />
                Color Palette
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">Primary Color</p>
                    <p className="text-xs text-white/50">Brand main color</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-[#550000] border border-white/20 flex items-center justify-center shadow-[0_0_15px_rgba(85,0,0,0.5)] cursor-pointer">
                    <CheckCircle2 className="w-4 h-4 text-white/80" />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">Accent Color</p>
                    <p className="text-xs text-white/50">Buttons & links</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-[#C52A35] border border-white/20 cursor-pointer hover:scale-105 transition-transform" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">Background</p>
                    <p className="text-xs text-white/50">Store background</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-[#050000] border border-white/20 cursor-pointer hover:scale-105 transition-transform" />
                </div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.5} direction="right">
            <div className="glass-card rounded-3xl p-6">
              <h2 className="text-lg font-medium text-white mb-6 flex items-center gap-2">
                <Type className="w-5 h-5 text-emerald-400" />
                Typography
              </h2>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-white mb-2">Heading Font</p>
                  <select className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:bg-white/10 cursor-pointer appearance-none">
                    <option className="bg-[#1a0505]">Inter (Default)</option>
                    <option className="bg-[#1a0505]">Outfit</option>
                    <option className="bg-[#1a0505]">Playfair Display</option>
                  </select>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-white mb-2">Body Font</p>
                  <select className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:bg-white/10 cursor-pointer appearance-none">
                    <option className="bg-[#1a0505]">Inter (Default)</option>
                    <option className="bg-[#1a0505]">Roboto</option>
                    <option className="bg-[#1a0505]">Open Sans</option>
                  </select>
                </div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.6} direction="right">
            <div className="glass-card rounded-3xl p-6">
              <h2 className="text-lg font-medium text-white mb-4">Quick Toggles</h2>
              
              <div className="space-y-4">
                {[
                  { label: 'Sticky Header', desc: 'Header stays at top on scroll', active: true },
                  { label: 'Dark Mode Only', desc: 'Force dark theme on store', active: true },
                  { label: 'Announcement Bar', desc: 'Show top banner text', active: false },
                ].map((toggle, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">{toggle.label}</p>
                      <p className="text-[10px] text-white/50">{toggle.desc}</p>
                    </div>
                    <div className={cn(
                      "w-10 h-6 rounded-full p-1 cursor-pointer transition-colors",
                      toggle.active ? "bg-emerald-500" : "bg-white/10"
                    )}>
                      <div className={cn(
                        "w-4 h-4 rounded-full bg-white transition-transform",
                        toggle.active ? "translate-x-4 shadow-sm" : "translate-x-0"
                      )} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

        </div>
      </div>
    </div>
  )
}
