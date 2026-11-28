"use client"

import React, { useState, useEffect } from 'react'
import { Bell, ArrowLeft, Save, Mail } from 'lucide-react'
import Link from 'next/link'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { toast } from 'sonner'

export default function NotificationsSettingsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [settings, setSettings] = useState({
    host: '',
    port: '465',
    user: '',
    pass: '',
    fromName: 'Rimal Store',
    fromEmail: ''
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings?key=smtp_settings')
      if (res.ok) {
        const { data } = await res.json()
        if (data) {
          setSettings(data)
        }
      }
    } catch (error) {
      console.error("Failed to load settings", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'smtp_settings',
          value: settings
        })
      })

      if (res.ok) {
        toast.success("SMTP Settings saved successfully!")
      } else {
        toast.error("Failed to save settings.")
      }
    } catch (error) {
      toast.error("An error occurred.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleTestConnection = async () => {
    setIsTesting(true)
    try {
      const res = await fetch('/api/admin/settings/test-smtp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })

      const data = await res.json()

      if (res.ok) {
        toast.success(data.message || "Connection successful!")
      } else {
        toast.error(data.message || "Failed to connect to SMTP server.")
      }
    } catch (error) {
      toast.error("An error occurred while testing.")
    } finally {
      setIsTesting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="flex flex-col gap-6 pt-4 pb-6">
      {/* Page Header */}
      <ScrollReveal delay={0.1}>
        <div className="flex items-center gap-4 mb-4">
          <Link href="/admin/settings" className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
            <ArrowLeft className="w-5 h-5 text-white/70" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
              <Bell className="w-6 h-6 text-white/70" />
              Notification Settings
            </h1>
            <p className="text-white/60 text-sm">Manage SMTP configuration for sending emails (like OTPs and order updates).</p>
          </div>
        </div>
      </ScrollReveal>

      {isLoading ? (
        <div className="glass-card rounded-3xl p-6 animate-pulse bg-white/5 h-[400px]" />
      ) : (
        <form onSubmit={handleSave} className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <ScrollReveal delay={0.2}>
              <div className="glass-card rounded-3xl p-6 lg:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">SMTP Configuration</h2>
                    <p className="text-white/50 text-sm">Configure your professional email to send out notifications.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/70">SMTP Host</label>
                    <input
                      required
                      type="text"
                      name="host"
                      value={settings.host}
                      onChange={handleChange}
                      placeholder="e.g. mail.yourdomain.com"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30 focus:bg-white/10 transition-colors"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/70">SMTP Port</label>
                    <input
                      required
                      type="text"
                      name="port"
                      value={settings.port}
                      onChange={handleChange}
                      placeholder="e.g. 465 or 587"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30 focus:bg-white/10 transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/70">SMTP Username / Email</label>
                    <input
                      required
                      type="email"
                      name="user"
                      value={settings.user}
                      onChange={handleChange}
                      placeholder="e.g. info@yourdomain.com"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30 focus:bg-white/10 transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/70">SMTP Password</label>
                    <input
                      required
                      type="password"
                      name="pass"
                      value={settings.pass}
                      onChange={handleChange}
                      placeholder="Enter your email password"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30 focus:bg-white/10 transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/70">From Name</label>
                    <input
                      required
                      type="text"
                      name="fromName"
                      value={settings.fromName}
                      onChange={handleChange}
                      placeholder="e.g. Rimal Store"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30 focus:bg-white/10 transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/70">From Email</label>
                    <input
                      required
                      type="email"
                      name="fromEmail"
                      value={settings.fromEmail}
                      onChange={handleChange}
                      placeholder="e.g. noreply@yourdomain.com"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/30 focus:bg-white/10 transition-colors"
                    />
                  </div>
                </div>

                <div className="mt-8 flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={isTesting}
                    className="h-12 px-8 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isTesting ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Mail className="w-5 h-5" />
                    )}
                    {isTesting ? "Testing..." : "Test Connection"}
                  </button>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="h-12 px-8 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    ) : (
                      <Save className="w-5 h-5" />
                    )}
                    {isSaving ? "Saving..." : "Save Settings"}
                  </button>
                </div>
              </div>
            </ScrollReveal>
          </div>

          <div className="space-y-6">
            <ScrollReveal delay={0.3}>
              <div className="glass-card rounded-3xl p-6">
                <h3 className="text-base font-bold text-white mb-2">How it works</h3>
                <p className="text-sm text-white/60 mb-4 leading-relaxed">
                  These SMTP credentials will be used to send all outgoing system emails, such as:
                </p>
                <ul className="space-y-2 text-sm text-white/70">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    OTP Verification Codes
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    Order Confirmations
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    Shipping Updates
                  </li>
                </ul>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.4}>
              <div className="glass-card rounded-3xl p-6 border border-[#E54B4D]/20 bg-gradient-to-br from-[#E54B4D]/5 to-transparent">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-[#E54B4D] flex items-center justify-center text-white shadow-md">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">OneSignal Web Push</h3>
                    <p className="text-xs text-white/50">Real-time push notifications &amp; broadcasts</p>
                  </div>
                </div>
                <p className="text-xs text-white/60 mb-4 leading-relaxed">
                  Send real-time alerts for promotions, abandoned carts, and new arrivals directly to visitors&apos; phones and browsers.
                </p>
                <Link
                  href="/admin/integrations"
                  className="w-full py-2.5 px-4 rounded-xl bg-[#E54B4D] hover:bg-[#d43f41] text-white text-xs font-semibold flex items-center justify-center gap-2 transition shadow-[0_0_15px_rgba(229,75,77,0.3)] cursor-pointer"
                >
                  Manage OneSignal Integration
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </form>
      )}
    </div>
  )
}
