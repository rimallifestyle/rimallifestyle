"use client"

import React, { useState, useEffect } from 'react'
import {
  Blocks,
  Search,
  Filter,
  Plus,
  CheckCircle2,
  Settings,
  ExternalLink,
  ArrowRight,
  Zap,
  Smartphone,
  MessageCircle,
  BarChart,
  Mail,
  ShoppingBag,
  Shield,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  X,
  Send,
  AlertCircle,
  Bell
} from 'lucide-react'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface IntegrationItem {
  id: string
  name: string
  category: string
  description: string
  status: 'Connected' | 'Not Connected' | 'Update Available'
  icon: any
  color: string
  tags: string[]
}

const baseIntegrations: IntegrationItem[] = [
  {
    id: 'int-smtp',
    name: 'SMTP Mail Server',
    category: 'Security & Email',
    description: 'Configure custom SMTP (Gmail, Hostinger, cPanel) for Admin 2FA login verification, customer account registration OTP, and password resets.',
    status: 'Not Connected',
    icon: <Mail className="w-5 h-5 text-white" />,
    color: 'bg-rose-600',
    tags: ['SMTP', 'Security', '2FA', 'Email']
  },
  {
    id: 'int-onesignal',
    name: 'OneSignal Push Notifications',
    category: 'Marketing',
    description: 'Engage visitors and boost repeat orders with web push notifications, abandoned cart alerts, and instant discount announcements.',
    status: 'Not Connected',
    icon: <Bell className="w-5 h-5 text-white" />,
    color: 'bg-[#E54B4D]',
    tags: ['Push', 'Marketing', 'Alerts', 'Real-Time']
  },
  {
    id: 'int-1',
    name: 'Meta Pixel',
    category: 'Marketing',
    description: 'Track conversions, optimize ads, and build targeted audiences on Facebook & Instagram.',
    status: 'Connected',
    icon: 'M',
    color: 'bg-blue-600',
    tags: ['Ads', 'Tracking']
  },
  {
    id: 'int-2',
    name: 'Google Analytics 4',
    category: 'Analytics',
    description: 'Get deep insights into your website traffic, user behavior, and sales performance.',
    status: 'Connected',
    icon: 'G',
    color: 'bg-amber-500',
    tags: ['Traffic', 'Data']
  },
  {
    id: 'int-3',
    name: 'WhatsApp Business',
    category: 'Customer Support',
    description: 'Engage with customers, send order updates, and provide support directly via WhatsApp.',
    status: 'Connected',
    icon: <MessageCircle className="w-5 h-5 text-white" />,
    color: 'bg-emerald-500',
    tags: ['Chat', 'Updates']
  },
  {
    id: 'int-4',
    name: 'Mailchimp',
    category: 'Marketing',
    description: 'Automate email marketing, send newsletters, and recover abandoned carts.',
    status: 'Not Connected',
    icon: <Mail className="w-5 h-5 text-black" />,
    color: 'bg-yellow-400',
    tags: ['Email', 'Automation']
  },
  {
    id: 'int-5',
    name: 'Steadfast Courier',
    category: 'Shipping',
    description: 'Automate parcel booking and track deliveries in real-time inside Bangladesh.',
    status: 'Connected',
    icon: <Zap className="w-5 h-5 text-white" />,
    color: 'bg-purple-600',
    tags: ['Logistics', 'Local']
  },
  {
    id: 'int-6',
    name: 'QuickBooks',
    category: 'Accounting',
    description: 'Sync your orders, taxes, and customer data automatically for seamless accounting.',
    status: 'Not Connected',
    icon: 'QB',
    color: 'bg-green-600',
    tags: ['Finance', 'Sync']
  },
  {
    id: 'int-7',
    name: 'WooCommerce Sync',
    category: 'E-Commerce',
    description: 'Sync products, inventory, and orders between your Rimal store and WooCommerce.',
    status: 'Update Available',
    icon: <ShoppingBag className="w-5 h-5 text-white" />,
    color: 'bg-indigo-500',
    tags: ['Core', 'Migration']
  },
  {
    id: 'int-8',
    name: 'Bulk SMS BD',
    category: 'Marketing',
    description: 'Send OTPs and order confirmation SMS to customers in Bangladesh.',
    status: 'Connected',
    icon: <Smartphone className="w-5 h-5 text-white" />,
    color: 'bg-teal-500',
    tags: ['SMS', 'Local']
  }
]

const categories = ['All', 'Security & Email', 'Marketing', 'Analytics', 'Customer Support', 'Shipping', 'Accounting', 'E-Commerce']

export default function IntegrationsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  // SMTP Settings State
  const [isSmtpModalOpen, setIsSmtpModalOpen] = useState(false)
  const [isSmtpConnected, setIsSmtpConnected] = useState(false)
  const [isTestingSmtp, setIsTestingSmtp] = useState(false)
  const [isSavingSmtp, setIsSavingSmtp] = useState(false)
  const [showSmtpPass, setShowSmtpPass] = useState(false)

  const [smtpForm, setSmtpForm] = useState({
    host: 'smtp.gmail.com',
    port: '465',
    user: '',
    pass: '',
    fromName: 'Rimal Store',
    fromEmail: '',
    admin2FA: true,
  })

  // OneSignal Push Notification State
  const [isOneSignalModalOpen, setIsOneSignalModalOpen] = useState(false)
  const [oneSignalTab, setOneSignalTab] = useState<'config' | 'broadcast'>('config')
  const [isOneSignalConnected, setIsOneSignalConnected] = useState(false)
  const [isTestingOneSignal, setIsTestingOneSignal] = useState(false)
  const [isSavingOneSignal, setIsSavingOneSignal] = useState(false)
  const [isSendingBroadcast, setIsSendingBroadcast] = useState(false)
  const [showOneSignalKey, setShowOneSignalKey] = useState(false)
  const [oneSignalSubscriberCount, setOneSignalSubscriberCount] = useState<number | null>(null)

  const [oneSignalForm, setOneSignalForm] = useState({
    enabled: true,
    appId: '',
    apiKey: '',
    safariWebId: '',
    autoPrompt: true,
    welcomeNotification: true,
  })

  const [broadcastForm, setBroadcastForm] = useState({
    title: '',
    message: '',
    url: 'https://rimallifestyle.com/shop',
    imageUrl: '',
  })

  // Load existing SMTP & OneSignal settings
  useEffect(() => {
    async function loadIntegrations() {
      try {
        const [smtpRes, oneSignalRes] = await Promise.all([
          fetch('/api/admin/settings?key=smtp_settings'),
          fetch('/api/admin/onesignal')
        ])

        if (smtpRes.ok) {
          const json = await smtpRes.json()
          if (json?.data && json.data.host && json.data.user) {
            setSmtpForm({
              host: json.data.host || 'smtp.gmail.com',
              port: json.data.port?.toString() || '465',
              user: json.data.user || '',
              pass: json.data.pass || '',
              fromName: json.data.fromName || 'Rimal Store',
              fromEmail: json.data.fromEmail || json.data.user || '',
              admin2FA: json.data.admin2FA !== false,
            })
            setIsSmtpConnected(true)
          }
        }

        if (oneSignalRes.ok) {
          const json = await oneSignalRes.json()
          if (json?.data && json.data.appId) {
            setOneSignalForm({
              enabled: json.data.enabled !== false,
              appId: json.data.appId || '',
              apiKey: json.data.apiKey || '',
              safariWebId: json.data.safariWebId || '',
              autoPrompt: json.data.autoPrompt !== false,
              welcomeNotification: json.data.welcomeNotification !== false,
            })
            setIsOneSignalConnected(Boolean(json.data.enabled && json.data.appId))
          }
        }
      } catch (err) {
        console.error('Failed to load integrations', err)
      } finally {
        setIsLoading(false)
      }
    }
    loadIntegrations()
  }, [])

  const handleTestSMTP = async () => {
    if (!smtpForm.host || !smtpForm.port || !smtpForm.user || !smtpForm.pass) {
      toast.error('Please fill in Host, Port, Username, and Password to test.')
      return
    }

    setIsTestingSmtp(true)
    try {
      const res = await fetch('/api/admin/settings/test-smtp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host: smtpForm.host.trim(),
          port: smtpForm.port.trim(),
          user: smtpForm.user.trim(),
          pass: smtpForm.pass.trim(),
          fromName: smtpForm.fromName.trim(),
          fromEmail: smtpForm.fromEmail.trim() || smtpForm.user.trim(),
        }),
      })

      const data = await res.json()
      if (res.ok) {
        toast.success(data.message || 'SMTP Connection verified successfully!')
      } else {
        toast.error(data.message || 'SMTP Connection test failed.')
      }
    } catch {
      toast.error('Failed to connect to SMTP server. Check credentials and port.')
    } finally {
      setIsTestingSmtp(false)
    }
  }

  const handleSaveSMTP = async () => {
    if (!smtpForm.host || !smtpForm.user || !smtpForm.pass) {
      toast.error('Host, Username, and Password are required.')
      return
    }

    setIsSavingSmtp(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'smtp_settings',
          value: {
            host: smtpForm.host.trim(),
            port: smtpForm.port.trim(),
            user: smtpForm.user.trim(),
            pass: smtpForm.pass.trim(),
            fromName: smtpForm.fromName.trim() || 'Rimal Store',
            fromEmail: smtpForm.fromEmail.trim() || smtpForm.user.trim(),
            admin2FA: smtpForm.admin2FA,
          },
        }),
      })

      if (!res.ok) throw new Error()
      setIsSmtpConnected(true)
      toast.success('SMTP Configuration saved! Admin 2FA & Customer OTPs are now active.')
      setIsSmtpModalOpen(false)
    } catch {
      toast.error('Failed to save SMTP settings.')
    } finally {
      setIsSavingSmtp(false)
    }
  }

  const handleDisconnectSMTP = async () => {
    if (!confirm('Are you sure you want to disconnect SMTP? Email OTPs and Admin 2FA will be disabled.')) return
    try {
      await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'smtp_settings',
          value: null,
        }),
      })
      setIsSmtpConnected(false)
      setSmtpForm(prev => ({ ...prev, user: '', pass: '' }))
      toast.success('SMTP disconnected.')
    } catch {
      toast.error('Failed to disconnect.')
    }
  }

  const handleTestOneSignal = async () => {
    if (!oneSignalForm.appId.trim()) {
      toast.error('OneSignal App ID is required.')
      return
    }
    if (!oneSignalForm.apiKey.trim()) {
      toast.error('OneSignal REST API Key is required to test.')
      return
    }

    setIsTestingOneSignal(true)
    try {
      const res = await fetch('/api/admin/onesignal/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appId: oneSignalForm.appId.trim(),
          apiKey: oneSignalForm.apiKey.trim(),
        }),
      })

      const data = await res.json()
      if (res.ok) {
        toast.success(data.message || 'OneSignal connection verified!')
        if (typeof data.subscribers === 'number') {
          setOneSignalSubscriberCount(data.subscribers)
        }
      } else {
        toast.error(data.message || 'Failed to verify OneSignal credentials.')
      }
    } catch {
      toast.error('Network error testing OneSignal connection.')
    } finally {
      setIsTestingOneSignal(false)
    }
  }

  const handleSaveOneSignal = async () => {
    if (!oneSignalForm.appId.trim()) {
      toast.error('OneSignal App ID is required.')
      return
    }

    setIsSavingOneSignal(true)
    try {
      const res = await fetch('/api/admin/onesignal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(oneSignalForm),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message)

      setIsOneSignalConnected(Boolean(oneSignalForm.enabled && oneSignalForm.appId.trim()))
      toast.success(data.message || 'OneSignal configuration saved successfully!')
      setIsOneSignalModalOpen(false)
    } catch (err: any) {
      toast.error(err.message || 'Failed to save OneSignal settings.')
    } finally {
      setIsSavingOneSignal(false)
    }
  }

  const handleDisconnectOneSignal = async () => {
    if (!confirm('Are you sure you want to disconnect OneSignal? Push notifications will be paused for website visitors.')) return
    try {
      await fetch('/api/admin/onesignal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ disconnect: true }),
      })
      setIsOneSignalConnected(false)
      setOneSignalForm(prev => ({ ...prev, appId: '', apiKey: '', enabled: false }))
      setOneSignalSubscriberCount(null)
      toast.success('OneSignal disconnected.')
    } catch {
      toast.error('Failed to disconnect OneSignal.')
    }
  }

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!broadcastForm.title.trim()) {
      toast.error('Push notification Title is required.')
      return
    }
    if (!broadcastForm.message.trim()) {
      toast.error('Push notification Message is required.')
      return
    }

    setIsSendingBroadcast(true)
    try {
      const res = await fetch('/api/admin/onesignal/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appId: oneSignalForm.appId.trim(),
          apiKey: oneSignalForm.apiKey.trim(),
          title: broadcastForm.title.trim(),
          message: broadcastForm.message.trim(),
          url: broadcastForm.url.trim() || undefined,
          imageUrl: broadcastForm.imageUrl.trim() || undefined,
        }),
      })

      const data = await res.json()
      if (res.ok) {
        toast.success(data.message || 'Push notification sent to all subscribers!')
        setBroadcastForm({
          title: '',
          message: '',
          url: 'https://rimallifestyle.com/shop',
          imageUrl: '',
        })
      } else {
        toast.error(data.message || 'Failed to send broadcast.')
      }
    } catch {
      toast.error('Network error sending push notification broadcast.')
    } finally {
      setIsSendingBroadcast(false)
    }
  }

  const integrationsList = baseIntegrations.map(app => {
    if (app.id === 'int-smtp') {
      return {
        ...app,
        status: isSmtpConnected ? ('Connected' as const) : ('Not Connected' as const),
      }
    }
    if (app.id === 'int-onesignal') {
      return {
        ...app,
        status: isOneSignalConnected ? ('Connected' as const) : ('Not Connected' as const),
      }
    }
    return app
  })

  const filteredIntegrations = integrationsList.filter(app => {
    const matchesCategory = activeCategory === 'All' || app.category === activeCategory
    const matchesSearch = searchQuery === '' || 
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 pt-4 pb-6">
        <div className="mb-2 space-y-2">
          <div className="h-8 w-48 rounded-md bg-white/10 animate-pulse" />
          <div className="h-4 w-96 rounded-md bg-white/10 animate-pulse" />
        </div>
        <div className="flex gap-2 mt-4 overflow-hidden">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-8 w-24 rounded-lg bg-white/10 animate-pulse shrink-0" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="glass-card rounded-3xl p-6 h-[280px] animate-pulse bg-white/5" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 pt-4 pb-6">
      {/* Page Header */}
      <ScrollReveal delay={0.1}>
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
              <Blocks className="w-6 h-6 text-[#C52A35]" />
              App &amp; Service Integrations
            </h1>
            <p className="text-white/60 text-sm">
              Connect SMTP mail server for 2FA, OTP verification, courier booking, analytics, and messaging.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-white/40" />
              </div>
              <input 
                type="text" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search integrations..." 
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-white/30 focus:bg-white/10 transition-colors"
              />
            </div>
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-white/60 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </ScrollReveal>

      {/* Categories Bar */}
      <ScrollReveal delay={0.2}>
        <div className="flex overflow-x-auto pb-2 custom-scrollbar gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={cn(
                "px-4 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors cursor-pointer",
                activeCategory === category 
                  ? "bg-white text-black font-semibold shadow-sm" 
                  : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/5"
              )}
            >
              {category}
            </button>
          ))}
        </div>
      </ScrollReveal>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredIntegrations.map((app, index) => (
          <ScrollReveal key={app.id} delay={0.1 + (index * 0.04)}>
            <div className="glass-card rounded-3xl p-6 h-full flex flex-col group border-white/5 hover:border-white/20 transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] relative">
              
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shadow-md", app.color, typeof app.icon === 'string' ? "text-white" : "")}>
                  {app.icon}
                </div>
                
                {app.status === 'Connected' ? (
                  <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full border border-emerald-400/20">
                    <CheckCircle2 className="w-3 h-3" />
                    Connected
                  </span>
                ) : app.status === 'Update Available' ? (
                  <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20">
                    Update
                  </span>
                ) : (
                  <span className="text-[10px] uppercase tracking-wider font-bold text-white/40 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
                    Not Connected
                  </span>
                )}
              </div>
              
              {/* Info */}
              <h3 className="text-base font-bold text-white mb-1 group-hover:text-gold transition-colors flex items-center justify-between">
                {app.name}
              </h3>
              <p className="text-xs font-medium text-white/40 mb-3">{app.category}</p>
              
              <div className="flex flex-wrap gap-1.5 mb-4">
                {app.tags.map(tag => (
                  <span key={tag} className="text-[10px] font-medium bg-white/5 text-white/60 px-2 py-0.5 rounded border border-white/5">
                    {tag}
                  </span>
                ))}
              </div>
              
              <p className="text-sm text-white/60 line-clamp-3 mb-6 flex-grow leading-relaxed">
                {app.description}
              </p>
              
              {/* Actions */}
              <div className="mt-auto pt-4 border-t border-white/5">
                {app.id === 'int-smtp' ? (
                  app.status === 'Connected' ? (
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setIsSmtpModalOpen(true)}
                        className="flex-1 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-medium text-white transition-colors flex items-center justify-center gap-2 cursor-pointer hover:border-gold/40"
                      >
                        <Settings className="w-4 h-4 text-gold" />
                        Settings
                      </button>
                      <button 
                        onClick={handleDisconnectSMTP}
                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 hover:bg-red-500/10 hover:text-red-400 text-white/50 border border-white/10 transition-colors cursor-pointer" 
                        title="Disconnect SMTP"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setIsSmtpModalOpen(true)}
                      className="w-full h-9 rounded-xl bg-white text-black hover:bg-white/90 text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      Configure SMTP
                    </button>
                  )
                ) : app.id === 'int-onesignal' ? (
                  app.status === 'Connected' ? (
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => {
                          setOneSignalTab('broadcast')
                          setIsOneSignalModalOpen(true)
                        }}
                        className="flex-1 h-9 rounded-xl bg-[#E54B4D]/15 hover:bg-[#E54B4D]/25 border border-[#E54B4D]/30 text-xs font-semibold text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5 text-[#E54B4D]" />
                        Send Push
                      </button>
                      <button 
                        onClick={() => {
                          setOneSignalTab('config')
                          setIsOneSignalModalOpen(true)
                        }}
                        className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-colors flex items-center justify-center cursor-pointer"
                        title="OneSignal Settings"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={handleDisconnectOneSignal}
                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 hover:bg-red-500/10 hover:text-red-400 text-white/50 border border-white/10 transition-colors cursor-pointer" 
                        title="Disconnect OneSignal"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => {
                        setOneSignalTab('config')
                        setIsOneSignalModalOpen(true)
                      }}
                      className="w-full h-9 rounded-xl bg-[#E54B4D] hover:bg-[#d43f41] text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(229,75,77,0.3)]"
                    >
                      <Plus className="w-4 h-4" />
                      Configure OneSignal
                    </button>
                  )
                ) : app.status === 'Connected' ? (
                  <div className="flex items-center gap-2">
                    <button className="flex-1 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-medium text-white transition-colors flex items-center justify-center gap-2">
                      <Settings className="w-4 h-4" />
                      Settings
                    </button>
                    <button className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 hover:bg-red-500/10 hover:text-red-400 text-white/50 border border-white/10 transition-colors" title="Disconnect">
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button className="w-full h-9 rounded-xl bg-white text-black hover:bg-white/90 text-sm font-medium transition-colors flex items-center justify-center gap-2">
                    <Plus className="w-4 h-4" />
                    Install App
                  </button>
                )}
              </div>
              
            </div>
          </ScrollReveal>
        ))}
      </div>

      {/* SMTP Configuration Modal */}
      {isSmtpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-xl bg-[#0f0404] border border-white/15 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6 animate-in zoom-in-95">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-600 flex items-center justify-center text-white shadow-md">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    SMTP Mail Server Setup
                    {isSmtpConnected && (
                      <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20">
                        Active
                      </span>
                    )}
                  </h2>
                  <p className="text-xs text-white/50 mt-0.5">
                    Outgoing email configuration for Admin 2FA, OTPs, and password recovery.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsSmtpModalOpen(false)}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar pr-1">
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-white/70">SMTP Host</label>
                  <input
                    type="text"
                    required
                    value={smtpForm.host}
                    onChange={e => setSmtpForm({ ...smtpForm, host: e.target.value })}
                    placeholder="e.g. smtp.gmail.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-gold transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white/70">Port</label>
                  <input
                    type="text"
                    required
                    value={smtpForm.port}
                    onChange={e => setSmtpForm({ ...smtpForm, port: e.target.value })}
                    placeholder="465 (SSL) or 587"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-gold transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/70">SMTP Username / Email</label>
                <input
                  type="email"
                  required
                  value={smtpForm.user}
                  onChange={e => setSmtpForm({ ...smtpForm, user: e.target.value })}
                  placeholder="e.g. yourstore@gmail.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-gold transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/70">
                  SMTP Password / App Password
                </label>
                <div className="relative">
                  <input
                    type={showSmtpPass ? 'text' : 'password'}
                    required
                    value={smtpForm.pass}
                    onChange={e => setSmtpForm({ ...smtpForm, pass: e.target.value })}
                    placeholder="16-character App Password (Gmail) or password"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-3.5 pr-10 py-2.5 text-sm text-white focus:outline-none focus:border-gold transition-colors font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSmtpPass(!showSmtpPass)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/40 hover:text-white"
                  >
                    {showSmtpPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-white/40">
                  Tip for Gmail: Use a Google App Password (generated from your Google Account &gt; Security &gt; 2-Step Verification &gt; App Passwords).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white/70">Sender Name</label>
                  <input
                    type="text"
                    value={smtpForm.fromName}
                    onChange={e => setSmtpForm({ ...smtpForm, fromName: e.target.value })}
                    placeholder="Rimal Store"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-gold transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white/70">Sender Email (From)</label>
                  <input
                    type="email"
                    value={smtpForm.fromEmail}
                    onChange={e => setSmtpForm({ ...smtpForm, fromEmail: e.target.value })}
                    placeholder="Leave empty to use Username"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-gold transition-colors"
                  />
                </div>
              </div>

              {/* 2FA Toggle */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-3 mt-2">
                <div className="flex items-center gap-2.5">
                  <Shield className="w-5 h-5 text-gold shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-white block">
                      Admin Panel 2FA Email Login Code
                    </span>
                    <span className="text-[11px] text-white/50 block">
                      Send a 6-digit verification code to email when logging into Admin Dashboard.
                    </span>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={smtpForm.admin2FA}
                    onChange={e => setSmtpForm({ ...smtpForm, admin2FA: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={handleTestSMTP}
                disabled={isTestingSmtp || isSavingSmtp}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-white text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
              >
                {isTestingSmtp ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-gold" />
                    Testing Connection...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5 text-gold" />
                    Test Connection &amp; Email
                  </>
                )}
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setIsSmtpModalOpen(false)}
                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-xs font-medium transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveSMTP}
                  disabled={isSavingSmtp || isTestingSmtp}
                  className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#7A1111] to-[#550000] text-white text-xs font-semibold hover:shadow-[0_0_20px_rgba(122,17,17,0.5)] transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSavingSmtp ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-gold" />
                      Save Configuration
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* OneSignal Push Notification Modal */}
      {isOneSignalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-2xl bg-[#0f0404] border border-white/15 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6 animate-in zoom-in-95">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#E54B4D] flex items-center justify-center text-white shadow-md">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    OneSignal Web Push
                    {isOneSignalConnected && (
                      <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20">
                        Active
                      </span>
                    )}
                  </h2>
                  <p className="text-xs text-white/50 mt-0.5">
                    Engage store visitors with web push alerts, abandoned cart reminders, and promotions.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOneSignalModalOpen(false)}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/5">
              <button
                type="button"
                onClick={() => setOneSignalTab('config')}
                className={cn(
                  "flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer",
                  oneSignalTab === 'config'
                    ? "bg-white text-black shadow-md"
                    : "text-white/60 hover:text-white"
                )}
              >
                <Settings className="w-3.5 h-3.5" />
                Settings &amp; API Keys
              </button>
              <button
                type="button"
                onClick={() => setOneSignalTab('broadcast')}
                className={cn(
                  "flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer",
                  oneSignalTab === 'broadcast'
                    ? "bg-[#E54B4D] text-white shadow-md"
                    : "text-white/60 hover:text-white"
                )}
              >
                <Send className="w-3.5 h-3.5" />
                Send Push Broadcast
                {oneSignalSubscriberCount !== null && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/40 text-white/90">
                    {oneSignalSubscriberCount} users
                  </span>
                )}
              </button>
            </div>

            {/* TAB 1: Configuration */}
            {oneSignalTab === 'config' && (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar pr-1">
                {/* Enable toggle */}
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-white">Enable OneSignal Push on Store</p>
                    <p className="text-[11px] text-white/50">When turned on, the OneSignal SDK initializes on your storefront.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={oneSignalForm.enabled}
                      onChange={e => setOneSignalForm({ ...oneSignalForm, enabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#E54B4D]"></div>
                  </label>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-white/70">
                        OneSignal App ID <span className="text-red-400">*</span>
                      </label>
                      <a
                        href="https://dashboard.onesignal.com/"
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-[#E54B4D] hover:underline flex items-center gap-1"
                      >
                        Find in OneSignal <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                    <input
                      type="text"
                      required
                      value={oneSignalForm.appId}
                      onChange={e => setOneSignalForm({ ...oneSignalForm, appId: e.target.value })}
                      placeholder="e.g. b2f7678a-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 focus:bg-white/10 font-mono transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-white/70">
                        REST API Key (Required for sending broadcasts from admin)
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowOneSignalKey(!showOneSignalKey)}
                        className="text-[11px] text-white/40 hover:text-white flex items-center gap-1 cursor-pointer"
                      >
                        {showOneSignalKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        {showOneSignalKey ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showOneSignalKey ? 'text' : 'password'}
                        value={oneSignalForm.apiKey}
                        onChange={e => setOneSignalForm({ ...oneSignalForm, apiKey: e.target.value })}
                        placeholder="e.g. os_v2_app_xxxxxxxxxxxxxxxxxxxxxxxxxx"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 focus:bg-white/10 font-mono transition"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-white/70">
                      Safari Web ID (Optional)
                    </label>
                    <input
                      type="text"
                      value={oneSignalForm.safariWebId}
                      onChange={e => setOneSignalForm({ ...oneSignalForm, safariWebId: e.target.value })}
                      placeholder="e.g. web.onesignal.auto.xxxxxxxx-xxxx-xxxx"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 focus:bg-white/10 font-mono transition"
                    />
                  </div>
                </div>

                {/* Automation Toggles */}
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <label className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition cursor-pointer">
                    <input
                      type="checkbox"
                      checked={oneSignalForm.autoPrompt}
                      onChange={e => setOneSignalForm({ ...oneSignalForm, autoPrompt: e.target.checked })}
                      className="w-4 h-4 rounded border-white/20 text-[#E54B4D] focus:ring-[#E54B4D] bg-white/10"
                    />
                    <div>
                      <span className="text-xs font-semibold text-white block">Auto-Prompt Storefront Visitors</span>
                      <span className="text-[11px] text-white/40 block">Automatically show native slidedown permission prompt 4 seconds after page load.</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition cursor-pointer">
                    <input
                      type="checkbox"
                      checked={oneSignalForm.welcomeNotification}
                      onChange={e => setOneSignalForm({ ...oneSignalForm, welcomeNotification: e.target.checked })}
                      className="w-4 h-4 rounded border-white/20 text-[#E54B4D] focus:ring-[#E54B4D] bg-white/10"
                    />
                    <div>
                      <span className="text-xs font-semibold text-white block">Send Welcome Notification</span>
                      <span className="text-[11px] text-white/40 block">Send an immediate welcome greeting once a user subscribes to alerts.</span>
                    </div>
                  </label>
                </div>

                {/* Instructions Box */}
                <div className="p-3.5 rounded-xl bg-[#E54B4D]/10 border border-[#E54B4D]/20 text-[11px] text-white/80 space-y-1">
                  <p className="font-semibold text-white flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-[#E54B4D]" />
                    How to configure OneSignal:
                  </p>
                  <ol className="list-decimal list-inside space-y-0.5 text-white/60">
                    <li>Create an app on OneSignal dashboard and select <b>Web Push</b>.</li>
                    <li>Choose <b>Custom Code</b> and enter your site URL (e.g. <code>https://rimallifestyle.com</code>).</li>
                    <li>Copy your <b>App ID</b> and <b>REST API Key</b> from <b>Settings &gt; Keys &amp; IDs</b> into the fields above.</li>
                  </ol>
                </div>
              </div>
            )}

            {/* TAB 2: Send Broadcast Push Notification */}
            {oneSignalTab === 'broadcast' && (
              <form onSubmit={handleSendBroadcast} className="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar pr-1">
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-white/70">
                      Notification Title <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={broadcastForm.title}
                      onChange={e => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                      placeholder="e.g. Weekend Flash Sale! 🔥 20% Off Panjabis"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 focus:bg-white/10 transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-white/70">
                      Message / Body <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={broadcastForm.message}
                      onChange={e => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                      placeholder="e.g. Enjoy special discounts on our luxury collection today only. Limited stock!"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 focus:bg-white/10 resize-none transition"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-white/70">Target URL (On Click)</label>
                      <input
                        type="url"
                        value={broadcastForm.url}
                        onChange={e => setBroadcastForm({ ...broadcastForm, url: e.target.value })}
                        placeholder="https://rimallifestyle.com/shop?sale=true"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 focus:bg-white/10 transition"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-white/70">Large Banner Image URL (Optional)</label>
                      <input
                        type="url"
                        value={broadcastForm.imageUrl}
                        onChange={e => setBroadcastForm({ ...broadcastForm, imageUrl: e.target.value })}
                        placeholder="https://.../banner.jpg"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 focus:bg-white/10 transition"
                      />
                    </div>
                  </div>
                </div>

                {/* Live Device Preview */}
                <div className="space-y-1.5 pt-2">
                  <label className="text-[11px] font-semibold text-white/40 uppercase tracking-wider">
                    Push Notification Preview
                  </label>
                  <div className="p-3.5 rounded-2xl bg-[#1a1a1a] border border-white/10 shadow-lg flex gap-3 items-start">
                    <div className="w-9 h-9 rounded-xl bg-[#550000] border border-white/10 flex items-center justify-center shrink-0 text-white font-bold text-xs">
                      R
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between text-[11px] text-white/40 mb-0.5">
                        <span className="font-medium text-white/80">Rimal Store</span>
                        <span>Just now</span>
                      </div>
                      <p className="text-xs font-bold text-white truncate">
                        {broadcastForm.title || "Your Notification Title"}
                      </p>
                      <p className="text-[11px] text-white/60 line-clamp-2 mt-0.5">
                        {broadcastForm.message || "Your notification message will appear here for all subscribers..."}
                      </p>
                      {broadcastForm.imageUrl && (
                        <div className="mt-2 rounded-lg overflow-hidden max-h-28 border border-white/10">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={broadcastForm.imageUrl}
                            alt="Banner Preview"
                            className="w-full h-full object-cover"
                            onError={e => (e.currentTarget.style.display = 'none')}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between text-xs text-white/60">
                  <span>Target Audience:</span>
                  <span className="font-semibold text-white bg-white/10 px-2 py-0.5 rounded-full text-[11px]">
                    All Subscribed Users
                  </span>
                </div>

                {/* Submit broadcast */}
                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSendingBroadcast || !oneSignalForm.apiKey}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#E54B4D] text-white text-xs font-semibold hover:bg-[#d43f41] transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(229,75,77,0.4)]"
                  >
                    {isSendingBroadcast ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Broadcasting to Subscribers...
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        Broadcast Push Alert Now
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Modal Footer for Tab 1 */}
            {oneSignalTab === 'config' && (
              <div className="border-t border-white/10 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleTestOneSignal}
                  disabled={isTestingOneSignal || isSavingOneSignal}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-white text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
                >
                  {isTestingOneSignal ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#E54B4D]" />
                      Testing Credentials...
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5 text-[#E54B4D]" />
                      Test Connection
                    </>
                  )}
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setIsOneSignalModalOpen(false)}
                    className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-xs font-medium transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveOneSignal}
                    disabled={isSavingOneSignal || isTestingOneSignal}
                    className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-[#E54B4D] text-white text-xs font-semibold hover:bg-[#d43f41] transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(229,75,77,0.4)]"
                  >
                    {isSavingOneSignal ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Save Configuration
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  )
}
