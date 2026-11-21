"use client"

import React, { useState, useEffect } from 'react'
import { Save, Loader2, Image as ImageIcon } from 'lucide-react'
import { toast } from 'sonner'

export default function AboutSettings() {
  const [saving, setSaving] = useState(false)
  const [title, setTitle] = useState('About Us')
  const [content, setContent] = useState('Welcome to our store. We believe in quality and customer satisfaction.')

  useEffect(() => {
    fetch('/api/storefront/settings?key=about_settings')
      .then(res => res.json())
      .then(json => {
        if (json && Object.keys(json).length > 0) {
          if (json.title) setTitle(json.title);
          if (json.content) setContent(json.content);
        }
      })
      .catch(() => {});
  }, []);

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/storefront/settings?key=about_settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content })
      });
      if (res.ok) {
        toast.success('About page settings saved!');
      } else {
        throw new Error();
      }
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="w-full w-full h-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">About Page Settings</h1>
          <p className="text-white/50 text-sm mt-1">Manage the content for your About Us page.</p>
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

      <div className="glass-card rounded-2xl p-6 space-y-6">
        <div>
          <label className="text-white/60 text-xs uppercase tracking-widest block mb-2">Page Title</label>
          <input 
            type="text" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#C52A35]" 
          />
        </div>
        <div>
          <label className="text-white/60 text-xs uppercase tracking-widest block mb-2">Story / Content</label>
          <textarea 
            rows={8}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#C52A35] resize-none" 
          />
        </div>
      </div>
    </div>
  )
}

