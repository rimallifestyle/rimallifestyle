"use client"

import React, { useState, useEffect } from 'react'
import { Plus, Trash2, Save, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

const API = '/api/storefront/settings?key=footer_settings'

const DEFAULT_DATA = {
  description: "Rimal Store crafts refined menswear inspired by heritage tailoring and modern design. Made to last a lifetime.",
  socialLinks: { instagram: "#", facebook: "#", twitter: "#", youtube: "#" },
  columns: [
    { title: "Shop", links: [{ label: "New Arrivals", url: "#" }, { label: "Shirts", url: "#" }, { label: "T-Shirts", url: "#" }] },
    { title: "About", links: [{ label: "Our Story", url: "#" }, { label: "Craftsmanship", url: "#" }] },
    { title: "Help", links: [{ label: "Contact", url: "#" }, { label: "Shipping", url: "#" }, { label: "Returns", url: "#" }] }
  ],
  bottomLinks: [{ label: "Privacy", url: "#" }, { label: "Terms", url: "#" }, { label: "Cookies", url: "#" }]
}

export default function FooterSettingsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch(API)
      .then(res => res.json())
      .then(json => {
        if (json && !json.error && !json.message && Object.keys(json).length > 0) {
          setData({
            description: json.description || DEFAULT_DATA.description,
            socialLinks: json.socialLinks || DEFAULT_DATA.socialLinks,
            columns: json.columns || DEFAULT_DATA.columns,
            bottomLinks: json.bottomLinks || DEFAULT_DATA.bottomLinks,
          })
        } else {
          setData(DEFAULT_DATA)
        }
      })
      .catch(() => setData(DEFAULT_DATA))
      .finally(() => setLoading(false))
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
      toast.success('Footer settings saved!')
    } catch {
      toast.error('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const updateSocial = (key: string, val: string) =>
    setData({ ...data, socialLinks: { ...data.socialLinks, [key]: val } })

  const updateColumnTitle = (ci: number, title: string) => {
    const cols = [...data.columns]
    cols[ci] = { ...cols[ci], title }
    setData({ ...data, columns: cols })
  }

  const updateLink = (ci: number, li: number, field: 'label' | 'url', val: string) => {
    const cols = [...data.columns]
    cols[ci].links[li][field] = val
    setData({ ...data, columns: cols })
  }

  const addLink = (ci: number) => {
    const cols = [...data.columns]
    cols[ci].links.push({ label: 'New Link', url: '#' })
    setData({ ...data, columns: cols })
  }

  const removeLink = (ci: number, li: number) => {
    const cols = [...data.columns]
    cols[ci].links.splice(li, 1)
    setData({ ...data, columns: cols })
  }

  const addColumn = () => {
    if (data.columns.length >= 4) return toast.error('Maximum 4 columns allowed')
    setData({ ...data, columns: [...data.columns, { title: 'New Column', links: [{ label: 'Link', url: '#' }] }] })
  }

  const removeColumn = (ci: number) => {
    const cols = [...data.columns]
    cols.splice(ci, 1)
    setData({ ...data, columns: cols })
  }

  const updateBottomLink = (i: number, field: 'label' | 'url', val: string) => {
    const links = [...data.bottomLinks]
    links[i][field] = val
    setData({ ...data, bottomLinks: links })
  }

  const addBottomLink = () => {
    setData({ ...data, bottomLinks: [...data.bottomLinks, { label: 'New Link', url: '#' }] })
  }

  const removeBottomLink = (i: number) => {
    const links = [...data.bottomLinks]
    links.splice(i, 1)
    setData({ ...data, bottomLinks: links })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-[#C52A35] animate-spin" />
      </div>
    )
  }

  return (
    <div className="w-full w-full h-full space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Footer Settings</h1>
          <p className="text-white/50 text-sm mt-1">Edit footer description, links, and social media</p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#7A1111] to-[#550000] text-white font-semibold text-sm hover:shadow-[0_0_20px_rgba(197,42,53,0.4)] transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Brand Description */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-white font-semibold mb-4">Brand Description</h2>
        <textarea
          value={data.description}
          onChange={e => setData({ ...data, description: e.target.value })}
          rows={3}
          placeholder="Write a short description about your store..."
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm resize-none focus:outline-none focus:border-[#C52A35] transition-colors"
        />
      </div>

      {/* Social Links */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-white font-semibold mb-4">Social Media Links</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(['instagram', 'facebook', 'twitter', 'youtube'] as const).map(network => (
            <div key={network}>
              <label className="text-white/50 text-xs uppercase tracking-widest block mb-1.5 capitalize">{network}</label>
              <input
                type="url"
                value={data.socialLinks?.[network] || ''}
                onChange={e => updateSocial(network, e.target.value)}
                placeholder={`https://${network}.com/yourpage`}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C52A35] transition-colors"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Columns */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-semibold">Navigation Columns</h2>
          <button
            onClick={addColumn}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/70 text-xs hover:bg-white/10 hover:text-white transition-colors"
          >
            <Plus className="w-3 h-3" /> Add Column
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.columns?.map((col: any, ci: number) => (
            <div key={ci} className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={col.title}
                  onChange={e => updateColumnTitle(ci, e.target.value)}
                  className="flex-1 bg-transparent border-b border-white/20 py-1 text-sm font-semibold text-[#C52A35] uppercase tracking-widest focus:outline-none focus:border-white"
                />
                <button onClick={() => removeColumn(ci)} className="text-white/20 hover:text-red-400 transition-colors shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                {col.links?.map((link: any, li: number) => (
                  <div key={li} className="flex items-center gap-2 group">
                    <div className="flex-1 space-y-0.5">
                      <input
                        type="text"
                        value={link.label}
                        onChange={e => updateLink(ci, li, 'label', e.target.value)}
                        placeholder="Link label"
                        className="w-full bg-transparent text-xs text-white focus:outline-none border-b border-transparent focus:border-white/30 py-0.5"
                      />
                      <input
                        type="text"
                        value={link.url}
                        onChange={e => updateLink(ci, li, 'url', e.target.value)}
                        placeholder="/url or https://..."
                        className="w-full bg-transparent text-[10px] text-white/40 focus:outline-none border-b border-transparent focus:border-white/20 py-0.5"
                      />
                    </div>
                    <button
                      onClick={() => removeLink(ci, li)}
                      className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400 transition-all shrink-0"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={() => addLink(ci)}
                className="flex items-center gap-1 text-xs text-white/30 hover:text-white transition-colors"
              >
                <Plus className="w-3 h-3" /> Add link
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Links */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold">Bottom Bar Links</h2>
          <button
            onClick={addBottomLink}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/70 text-xs hover:bg-white/10 hover:text-white transition-colors"
          >
            <Plus className="w-3 h-3" /> Add Link
          </button>
        </div>
        <div className="space-y-3">
          {data.bottomLinks?.map((link: any, i: number) => (
            <div key={i} className="flex items-center gap-3 group">
              <input
                type="text"
                value={link.label}
                onChange={e => updateBottomLink(i, 'label', e.target.value)}
                placeholder="Label (e.g. Privacy)"
                className="w-36 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#C52A35]"
              />
              <input
                type="text"
                value={link.url}
                onChange={e => updateBottomLink(i, 'url', e.target.value)}
                placeholder="/privacy or https://..."
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#C52A35]"
              />
              <button
                onClick={() => removeBottomLink(i)}
                className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>


    </div>
  )
}

