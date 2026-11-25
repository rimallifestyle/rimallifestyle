"use client"

import React, { useState, useEffect } from 'react'
import { 
  Truck, Settings, Link as LinkIcon, Unlink, ExternalLink, Key, 
  CheckCircle2, AlertCircle, RefreshCw, X, Eye, EyeOff, ShieldCheck, Zap
} from 'lucide-react'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface CourierConfigState {
  steadfast: {
    apiKey: string;
    secretKey: string;
    baseUrl: string;
    isActive: boolean;
    isConfigured: boolean;
    stats?: { deliveries: number; successRate: string };
  };
  pathao: {
    clientId: string;
    clientSecret: string;
    username: string;
    password: string;
    storeId: string;
    baseUrl: string;
    isActive: boolean;
    isConfigured: boolean;
    stats?: { deliveries: number; successRate: string };
  };
}

const defaultState: CourierConfigState = {
  steadfast: {
    apiKey: '',
    secretKey: '',
    baseUrl: 'https://portal.steadfast.com.bd/api/v1',
    isActive: false,
    isConfigured: false,
    stats: { deliveries: 0, successRate: '98%' },
  },
  pathao: {
    clientId: '',
    clientSecret: '',
    username: '',
    password: '',
    storeId: '',
    baseUrl: 'https://api-hermes.pathao.com/aladdin/api/v1',
    isActive: false,
    isConfigured: false,
    stats: { deliveries: 0, successRate: '96%' },
  },
};

export default function CouriersPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [couriers, setCouriers] = useState<CourierConfigState>(defaultState);
  
  // Modal state
  const [activeModal, setActiveModal] = useState<'steadfast' | 'pathao' | null>(null);
  const [modalForm, setModalForm] = useState<any>({});
  const [showSecret, setShowSecret] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/courier/settings', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          setCouriers(data.settings);
        }
      }
    } catch (err) {
      console.error('Failed to load courier settings', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const openConfigModal = (provider: 'steadfast' | 'pathao') => {
    setActiveModal(provider);
    setShowSecret(false);
    setTestResult(null);
    if (provider === 'steadfast') {
      setModalForm({
        apiKey: couriers.steadfast.apiKey || '',
        secretKey: couriers.steadfast.secretKey || '',
        baseUrl: couriers.steadfast.baseUrl || 'https://portal.steadfast.com.bd/api/v1',
        isActive: couriers.steadfast.isActive ?? true,
      });
    } else {
      setModalForm({
        clientId: couriers.pathao.clientId || '',
        clientSecret: couriers.pathao.clientSecret || '',
        username: couriers.pathao.username || '',
        password: couriers.pathao.password || '',
        storeId: couriers.pathao.storeId || '',
        baseUrl: couriers.pathao.baseUrl || 'https://api-hermes.pathao.com/aladdin/api/v1',
        isActive: couriers.pathao.isActive ?? true,
      });
    }
  };

  const handleTestConnection = async () => {
    if (!activeModal) return;
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/admin/courier/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: activeModal,
          credentials: modalForm,
        }),
      });
      const data = await res.json();
      setTestResult({
        success: data.success,
        message: data.message || (data.success ? 'Connected successfully!' : 'Connection failed.'),
      });
      if (data.success) {
        toast.success(data.message || 'Connection verified successfully!');
      } else {
        toast.error(data.message || 'Connection test failed.');
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Failed to connect to courier server.',
      });
      toast.error('Network error during test.');
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!activeModal) return;
    setIsSaving(true);
    try {
      const payload: any = {};
      payload[activeModal] = modalForm;

      const res = await fetch('/api/admin/courier/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`${activeModal === 'steadfast' ? 'Steadfast' : 'Pathao'} settings saved!`);
        await fetchSettings();
        setActiveModal(null);
      } else {
        toast.error(data.message || 'Failed to save settings.');
      }
    } catch (err: any) {
      toast.error('Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDisconnect = async (provider: 'steadfast' | 'pathao') => {
    if (!confirm(`Are you sure you want to disconnect ${provider === 'steadfast' ? 'Steadfast' : 'Pathao'} Courier?`)) {
      return;
    }
    try {
      const payload: any = {};
      if (provider === 'steadfast') {
        payload.steadfast = { apiKey: '', secretKey: '', isActive: false };
      } else {
        payload.pathao = { clientId: '', clientSecret: '', username: '', password: '', isActive: false };
      }

      const res = await fetch('/api/admin/courier/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(`${provider === 'steadfast' ? 'Steadfast' : 'Pathao'} Courier disconnected.`);
        await fetchSettings();
        if (activeModal) setActiveModal(null);
      } else {
        toast.error('Failed to disconnect.');
      }
    } catch (err) {
      toast.error('Error disconnecting courier.');
    }
  };

  const couriersList = [
    {
      id: 'steadfast',
      name: 'Steadfast Courier',
      description: 'Reliable, nationwide door-to-door eCommerce parcel delivery partner across all 64 districts in Bangladesh.',
      status: couriers.steadfast.isConfigured && couriers.steadfast.isActive ? 'Connected' : 'Disconnected',
      isConfigured: couriers.steadfast.isConfigured,
      isActive: couriers.steadfast.isActive,
      color: 'from-emerald-500/20 to-teal-500/20',
      iconColor: 'text-emerald-500',
      border: 'border-emerald-500/20',
      stats: couriers.steadfast.stats || { deliveries: 0, successRate: '98%' },
    },
    {
      id: 'pathao',
      name: 'Pathao Courier',
      description: 'Fastest on-demand courier logistics network with high coverage, automated parcel creation, and tracking.',
      status: couriers.pathao.isConfigured && couriers.pathao.isActive ? 'Connected' : 'Disconnected',
      isConfigured: couriers.pathao.isConfigured,
      isActive: couriers.pathao.isActive,
      color: 'from-red-500/20 to-rose-500/20',
      iconColor: 'text-rose-500',
      border: 'border-rose-500/20',
      stats: couriers.pathao.stats || { deliveries: 0, successRate: '96%' },
    },
    {
      id: 'redx',
      name: 'RedX Delivery',
      description: 'Tech-first logistics provider for convenient parcel pickup and delivery across Bangladesh.',
      status: 'Disconnected',
      isConfigured: false,
      isActive: false,
      color: 'from-amber-600/20 to-red-700/20',
      iconColor: 'text-amber-500',
      border: 'border-amber-500/20',
      comingSoon: true,
    },
    {
      id: 'ecourier',
      name: 'eCourier',
      description: 'Advanced 360-degree smart logistics support with real-time OTP security and parcel tracking.',
      status: 'Disconnected',
      isConfigured: false,
      isActive: false,
      color: 'from-blue-500/20 to-cyan-500/20',
      iconColor: 'text-blue-500',
      border: 'border-blue-500/20',
      comingSoon: true,
    },
    {
      id: 'paperfly',
      name: 'Paperfly',
      description: 'High-volume doorstep delivery network covering union and sub-district levels across BD.',
      status: 'Disconnected',
      isConfigured: false,
      isActive: false,
      color: 'from-amber-500/20 to-yellow-500/20',
      iconColor: 'text-amber-500',
      border: 'border-amber-500/20',
      comingSoon: true,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 pt-4 pb-6">
        <div className="mb-2 space-y-2">
          <div className="h-8 w-48 rounded-md bg-white/10 animate-pulse" />
          <div className="h-4 w-96 rounded-md bg-white/10 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="glass-card rounded-3xl p-6 h-[250px] animate-pulse bg-white/5" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pt-4 pb-6 font-sans">
      {/* Page Header */}
      <ScrollReveal delay={0.1}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Couriers & API Integrations</h1>
            <p className="text-white/60 text-sm">
              Connect Steadfast and Pathao APIs for direct one-click parcel dispatch and live tracking.
            </p>
          </div>
          
          <button 
            onClick={fetchSettings}
            className="flex items-center gap-2 h-10 px-5 rounded-full bg-white/5 text-sm font-medium text-white hover:bg-white/10 border border-white/10 transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Status
          </button>
        </div>
      </ScrollReveal>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-2">
        {couriersList.map((courier, index) => {
          const isConnected = courier.status === 'Connected';

          return (
            <ScrollReveal key={courier.id} delay={0.15 + (index * 0.1)}>
              <div className={cn(
                "glass-card rounded-3xl p-6 relative overflow-hidden group hover:border-white/20 transition-all flex flex-col justify-between h-full min-h-[300px]",
                isConnected ? "border-emerald-500/30" : "border-white/10"
              )}>
                {/* Background gradient blur */}
                <div className={cn(
                  "absolute top-0 right-0 w-36 h-36 bg-gradient-to-br rounded-full blur-[50px] opacity-20 group-hover:opacity-40 transition-opacity pointer-events-none",
                  courier.color
                )} />

                <div className="relative z-10 flex flex-col flex-1">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center border bg-white/5",
                      courier.border
                    )}>
                      <Truck className={cn("w-6 h-6", courier.iconColor)} />
                    </div>
                    
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[11px] uppercase font-bold tracking-wider border flex items-center gap-1.5 shadow-sm",
                      isConnected 
                        ? "text-emerald-400 border-emerald-400/30 bg-emerald-500/10 shadow-[0_0_12px_rgba(16,185,129,0.2)]" 
                        : "text-white/50 border-white/10 bg-white/5"
                    )}>
                      {isConnected ? (
                        <>
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <LinkIcon className="w-3 h-3" />
                          Connected
                        </>
                      ) : (
                        <>
                          <Unlink className="w-3 h-3" />
                          Disconnected
                        </>
                      )}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-white mb-1.5 flex items-center gap-2">
                      {courier.name}
                      {isConnected && (
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      )}
                    </h3>
                    <p className="text-sm text-white/60 line-clamp-2 leading-relaxed">
                      {courier.description}
                    </p>
                  </div>

                  {/* Connected Stats */}
                  {isConnected && courier.stats && (
                    <div className="grid grid-cols-2 gap-2 mb-6 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                      <div>
                        <p className="text-[11px] text-white/50 font-medium">Total Dispatched</p>
                        <p className="text-base font-bold text-white mt-0.5">{courier.stats.deliveries} Orders</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-white/50 font-medium">Delivery Rate</p>
                        <p className="text-base font-bold text-emerald-400 mt-0.5">{courier.stats.successRate}</p>
                      </div>
                    </div>
                  )}

                  {!isConnected && !courier.comingSoon && (
                    <div className="mb-6 p-3 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-xs text-amber-300/80 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                      <span>API keys not configured. Click below to connect.</span>
                    </div>
                  )}

                  {courier.comingSoon && (
                    <div className="mb-6 p-3 rounded-2xl bg-white/5 border border-white/10 text-xs text-white/40 flex items-center gap-2">
                      <Zap className="w-4 h-4 shrink-0 text-white/30" />
                      <span>Integration module in development.</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2.5 mt-auto pt-2">
                    {courier.id === 'steadfast' || courier.id === 'pathao' ? (
                      isConnected ? (
                        <>
                          <button 
                            onClick={() => openConfigModal(courier.id as any)}
                            className="flex-1 flex items-center justify-center gap-2 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-semibold text-white transition-all cursor-pointer"
                          >
                            <Settings className="w-4 h-4" />
                            Configure
                          </button>
                          <button 
                            onClick={() => handleDisconnect(courier.id as any)}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors cursor-pointer" 
                            title="Disconnect API"
                          >
                            <Unlink className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <button 
                          onClick={() => openConfigModal(courier.id as any)}
                          className="w-full flex items-center justify-center gap-2 h-10 rounded-xl bg-gradient-to-r from-[#7A1111] to-[#550000] text-sm font-semibold text-white hover:shadow-[0_0_20px_rgba(122,17,17,0.4)] transition-all cursor-pointer"
                        >
                          <Key className="w-4 h-4" />
                          Connect API
                        </button>
                      )
                    ) : (
                      <button 
                        disabled 
                        className="w-full flex items-center justify-center gap-2 h-10 rounded-xl bg-white/5 border border-white/5 text-sm font-medium text-white/30 cursor-not-allowed"
                      >
                        Coming Soon
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </ScrollReveal>
          );
        })}

        {/* Documentation Helper Card */}
        <ScrollReveal delay={0.65}>
          <div className="glass-card rounded-3xl p-6 border-dashed border-white/20 hover:border-white/40 transition-colors flex flex-col items-center justify-center text-center h-full min-h-[300px] group">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <ExternalLink className="w-5 h-5 text-white/50 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">How to get API Keys?</h3>
            <p className="text-xs text-white/50 max-w-[240px] leading-relaxed mb-4">
              Log in to your Steadfast Courier portal, navigate to Settings &gt; API Credentials, and copy your API Key &amp; Secret Key.
            </p>
            <a 
              href="https://steadfast.com.bd/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-gold hover:underline flex items-center gap-1 font-semibold"
            >
              Open Steadfast Portal &rarr;
            </a>
          </div>
        </ScrollReveal>
      </div>

      {/* Configuration & Connection Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass-card bg-[#0e0303]/95 border border-white/10 rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto custom-scrollbar">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#550000]/30 border border-[#C52A35]/30 flex items-center justify-center text-gold">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {activeModal === 'steadfast' ? 'Steadfast Courier' : 'Pathao Courier'} Configuration
                  </h3>
                  <p className="text-xs text-white/50">Manage API credentials &amp; webhook settings</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Test Connection Banner */}
            {testResult && (
              <div className={cn(
                "p-4 rounded-2xl mb-6 text-sm flex items-start gap-3 border",
                testResult.success 
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                  : "bg-red-500/10 border-red-500/30 text-red-300"
              )}>
                {testResult.success ? (
                  <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 shrink-0 text-red-400 mt-0.5" />
                )}
                <div>
                  <p className="font-semibold text-xs uppercase tracking-wider mb-0.5">
                    {testResult.success ? 'Connection Verified' : 'Connection Failed'}
                  </p>
                  <p className="text-xs opacity-90 leading-relaxed">{testResult.message}</p>
                </div>
              </div>
            )}

            {/* Form Fields for Steadfast */}
            {activeModal === 'steadfast' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-1.5">
                    API Key *
                  </label>
                  <input 
                    type="text" 
                    value={modalForm.apiKey || ''} 
                    onChange={(e) => setModalForm({ ...modalForm, apiKey: e.target.value })}
                    placeholder="e.g. stf_live_xxxxxx"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#C52A35]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>Secret Key *</span>
                    <button 
                      type="button" 
                      onClick={() => setShowSecret(!showSecret)}
                      className="text-[11px] text-white/40 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      {showSecret ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      {showSecret ? 'Hide' : 'Show'}
                    </button>
                  </label>
                  <input 
                    type={showSecret ? "text" : "password"} 
                    value={modalForm.secretKey || ''} 
                    onChange={(e) => setModalForm({ ...modalForm, secretKey: e.target.value })}
                    placeholder="Enter Steadfast secret key"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#C52A35]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-1.5">
                    Base API URL
                  </label>
                  <input 
                    type="text" 
                    value={modalForm.baseUrl || 'https://portal.steadfast.com.bd/api/v1'} 
                    onChange={(e) => setModalForm({ ...modalForm, baseUrl: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#C52A35]"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/10">
                  <div>
                    <p className="text-sm font-semibold text-white">Enable Courier Integration</p>
                    <p className="text-xs text-white/50">Allow direct order dispatch from Order Details</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={modalForm.isActive ?? true}
                    onChange={(e) => setModalForm({ ...modalForm, isActive: e.target.checked })}
                    className="w-5 h-5 accent-[#C52A35] rounded cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* Form Fields for Pathao */}
            {activeModal === 'pathao' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-1.5">
                      Client ID *
                    </label>
                    <input 
                      type="text" 
                      value={modalForm.clientId || ''} 
                      onChange={(e) => setModalForm({ ...modalForm, clientId: e.target.value })}
                      placeholder="Pathao client ID"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#C52A35]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-1.5">
                      Client Secret *
                    </label>
                    <input 
                      type={showSecret ? "text" : "password"} 
                      value={modalForm.clientSecret || ''} 
                      onChange={(e) => setModalForm({ ...modalForm, clientSecret: e.target.value })}
                      placeholder="Pathao client secret"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#C52A35]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-1.5">
                      Username / Email *
                    </label>
                    <input 
                      type="text" 
                      value={modalForm.username || ''} 
                      onChange={(e) => setModalForm({ ...modalForm, username: e.target.value })}
                      placeholder="Pathao merchant username"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#C52A35]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-1.5">
                      Password *
                    </label>
                    <input 
                      type="password" 
                      value={modalForm.password || ''} 
                      onChange={(e) => setModalForm({ ...modalForm, password: e.target.value })}
                      placeholder="Merchant password"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#C52A35]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-1.5">
                    Store ID (Optional)
                  </label>
                  <input 
                    type="text" 
                    value={modalForm.storeId || ''} 
                    onChange={(e) => setModalForm({ ...modalForm, storeId: e.target.value })}
                    placeholder="e.g. 12345"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#C52A35]"
                  />
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/10">
                  <div>
                    <p className="text-sm font-semibold text-white">Enable Pathao Integration</p>
                    <p className="text-xs text-white/50">Allow one-click parcel dispatch to Pathao</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={modalForm.isActive ?? true}
                    onChange={(e) => setModalForm({ ...modalForm, isActive: e.target.checked })}
                    className="w-5 h-5 accent-[#C52A35] rounded cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-6 mt-6 border-t border-white/10">
              <button 
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-white/20 text-white hover:bg-white/5 text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isTesting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 text-amber-400" />}
                {isTesting ? 'Testing...' : 'Test Connection'}
              </button>

              <div className="flex-1 w-full flex items-center gap-2 justify-end">
                <button 
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-5 py-2.5 rounded-xl border border-white/10 text-white/60 hover:text-white hover:bg-white/5 text-sm font-medium transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#7A1111] to-[#550000] text-white text-sm font-semibold hover:shadow-[0_0_20px_rgba(122,17,17,0.4)] transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
