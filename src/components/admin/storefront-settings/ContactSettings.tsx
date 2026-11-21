"use client"

import React, { useState, useEffect } from 'react'
import { Save, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function ContactSettings() {
  const [saving, setSaving] = useState(false)
  const [email, setEmail] = useState('support@rimal.com')
  const [phone, setPhone] = useState('+880 123 456 789')
  const [address, setAddress] = useState('123 Fashion Street, Dhaka')

  useEffect(() => {
    fetch('/api/storefront/settings?key=contact_settings')
      .then(res => res.json())
      .then(json => {
        if (json && Object.keys(json).length > 0) {
          if (json.email) setEmail(json.email);
          if (json.phone) setPhone(json.phone);
          if (json.address) setAddress(json.address);
        }
      })
      .catch(() => {});
  }, []);

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/storefront/settings?key=contact_settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, phone, address })
      });
      if (res.ok) {
        toast.success('Contact settings saved!');
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
          <h1 className="text-2xl font-bold text-white">Contact Page Settings</h1>
          <p className="text-white/50 text-sm mt-1">Manage contact information and map settings.</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-white/60 text-xs uppercase tracking-widest block mb-2">Contact Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#C52A35]" 
            />
          </div>
          <div>
            <label className="text-white/60 text-xs uppercase tracking-widest block mb-2">Phone Number</label>
            <input 
              type="text" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#C52A35]" 
            />
          </div>
        </div>
        <div>
          <label className="text-white/60 text-xs uppercase tracking-widest block mb-2">Store Address</label>
          <textarea 
            rows={3}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#C52A35] resize-none" 
          />
        </div>
      </div>
    </div>
  )
}

