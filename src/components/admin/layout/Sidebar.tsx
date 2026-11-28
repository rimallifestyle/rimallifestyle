"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  Users,
  User,
  Package,
  ListTree,
  Tags,
  Tag,
  ShoppingCart,
  Ticket,
  Star,
  LineChart,
  BarChart,
  Megaphone,
  Palette,
  Settings,
  Blocks,
  LifeBuoy,
  Store,
  ChevronDown,
  ExternalLink,
  MoreVertical,
  Truck,
  ShieldAlert,
  CreditCard,
  LogOut,
  Navigation,
  Globe,
  FileText,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

const navItems1 = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
  { icon: Users, label: 'Visitors', href: '/admin/visitors' },
  { icon: User, label: 'Users', href: '/admin/users' },
  { 
    icon: Package, 
    label: 'Products', 
    href: '/admin/products', 
    hasChildren: true,
    subItems: [
      { label: 'All Products', href: '/admin/products' },
      { label: 'Add Product', href: '/admin/products/add' }
    ]
  },
  { icon: ListTree, label: 'Categories', href: '/admin/categories' },
  { icon: Tags, label: 'Attributes', href: '/admin/attributes' },
  { icon: Tag, label: 'Tags', href: '/admin/tags' },
  { icon: ShoppingCart, label: 'Orders', href: '/admin/orders', badge: '12' },
  { icon: ShieldAlert, label: 'Fraud Check', href: '/admin/fraud-check' },
  { icon: Ticket, label: 'Coupons', href: '/admin/coupons' },
  { icon: Star, label: 'Reviews', href: '/admin/reviews' },
  {
    icon: FileText,
    label: 'Pages',
    href: '/admin/pages',
    hasChildren: true,
    subItems: [
      { label: 'All Pages', href: '/admin/pages' },
      { label: 'Add New Page', href: '/admin/pages?action=add' }
    ]
  },
]

const navItems2 = [
  { icon: Truck, label: 'Couriers', href: '/admin/couriers' },
  { icon: CreditCard, label: 'Payment Methods', href: '/admin/payments' },
  { icon: LineChart, label: 'Finance', href: '/admin/finance', hasChildren: true },
  { icon: BarChart, label: 'Reports', href: '/admin/reports' },
  { icon: Megaphone, label: 'Marketing', href: '/admin/marketing', hasChildren: true },
  { icon: Palette, label: 'Appearance', href: '/admin/appearance', hasChildren: true },
  { icon: Globe, label: 'SEO & Social', href: '/admin/seo' },
  {
    icon: Store,
    label: 'Storefront',
    href: '/admin/storefront',
  },
  { icon: Navigation, label: 'Menu Builder', href: '/admin/navigation' },
  { icon: Settings, label: 'Settings', href: '/admin/settings', hasChildren: true },
  { icon: Blocks, label: 'Integrations', href: '/admin/integrations' },
  { icon: LifeBuoy, label: 'Support', href: '/admin/support' },
]

const getTrimmedLogoUrl = (url?: string) => {
  if (!url) return '';
  if (url.includes('cloudinary.com') && !url.includes('/e_trim/')) {
    return url.replace('/image/upload/', '/image/upload/e_trim/');
  }
  return url;
};

const DEFAULT_LOGO_URL = "https://res.cloudinary.com/nbbawtsd/image/upload/e_trim/v1793198654/rimal_store/appearance/c6s136efreimz7gkl5ap.webp";

export function Sidebar({ onClose, onSwitchStorefront }: { onClose?: () => void, onSwitchStorefront?: () => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const [unseenCount, setUnseenCount] = useState<number>(0)
  const [logoUrl, setLogoUrl] = useState<string>(DEFAULT_LOGO_URL)

  // Fetch site identity logo from cache and backend
  useEffect(() => {
    const saved = localStorage.getItem('rimal_site_identity');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed?.logoUrl) setLogoUrl(getTrimmedLogoUrl(parsed.logoUrl));
      } catch (e) {}
    }

    fetch('/api/storefront/settings?key=site_identity')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.logoUrl) {
          const trimmed = getTrimmedLogoUrl(data.logoUrl);
          setLogoUrl(trimmed);
          try {
            const existing = JSON.parse(localStorage.getItem('rimal_site_identity') || '{}');
            localStorage.setItem('rimal_site_identity', JSON.stringify({ ...existing, logoUrl: data.logoUrl }));
          } catch (e) {}
        }
      })
      .catch(() => {});
  }, []);

  // Fetch unseen order count
  useEffect(() => {
    const fetchUnseenCount = async () => {
      try {
        const res = await fetch('/api/admin/orders/unseen-count', {
          cache: 'no-store'
        });
        if (res.ok) {
          const data = await res.json();
          setUnseenCount(data.count);
          if (typeof navigator !== "undefined" && "setAppBadge" in navigator) {
            try {
              if (data.count > 0) {
                (navigator as any).setAppBadge(data.count).catch(() => {});
              } else {
                (navigator as any).clearAppBadge().catch(() => {});
              }
            } catch (e) {}
          }
        }
      } catch (err) {
        console.error('Failed to fetch unseen orders count:', err);
      }
    };
    
    // Fetch immediately
    fetchUnseenCount();
    
    // Poll every 15 seconds
    const interval = setInterval(fetchUnseenCount, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    // Attempt to hit WP logout API to clear auth cookie
    try {
      await fetch('http://localhost/rimal_Store/backend/api/auth/logout.php', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('rimal_token')}`
        }
      })
    } catch (e) {
      console.error('Logout error:', e)
    }
    
    // Clear local storage completely
    localStorage.removeItem('rimal_token')
    localStorage.removeItem('rimal_user')
    
    // Reload to show login screen
    window.location.reload()
  }

  return (
    <aside className="w-[260px] h-screen flex flex-col border-r border-white/10 bg-black/20 backdrop-blur-3xl z-40 relative">
      {/* Logo Area */}
      <div className="h-20 flex items-center justify-between px-6">
        <Link href="/admin" className="flex items-center gap-2.5 group">
          {logoUrl ? (
            <img 
              src={logoUrl} 
              alt="Rimal" 
              className="h-9 max-h-11 w-auto object-contain transition-transform duration-300 group-hover:scale-105" 
            />
          ) : (
            <span className="font-display text-2xl font-bold text-gold tracking-tight">RIMAL</span>
          )}
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold/90 bg-gold/10 px-1.5 py-0.5 rounded border border-gold/20">
            Admin
          </span>
        </Link>
        
        {/* Mobile Close Button */}
        {onClose && (
          <button 
            onClick={onClose}
            className="lg:hidden p-2 text-white/50 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-6 custom-scrollbar">
        <div className="space-y-1">
          {navItems1.map((item, i) => (
            <NavItem 
              key={i} 
              {...item} 
              badge={item.label === 'Orders' && unseenCount > 0 ? unseenCount.toString() : (item.label === 'Orders' ? undefined : item.badge)}
              pathname={pathname} 
            />
          ))}
        </div>

        <div className="h-px bg-white/10 mx-4" />

        <div className="space-y-1">
          {navItems2.map((item, i) => (
            <NavItem 
              key={i} 
              {...item} 
              pathname={pathname} 
              onClick={item.label === 'Storefront' ? onSwitchStorefront : undefined}
            />
          ))}
        </div>
        
        {/* Profile Area (Moved inside scroll container to remove sticky bottom) */}
        <div className="pt-6 mt-4 border-t border-white/10">
          <a 
            href="/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full flex items-center justify-between px-4 py-2.5 mb-3 rounded-xl glass-button text-sm font-medium text-white transition-all hover:bg-white/10"
          >
            View Store
            <ExternalLink className="w-4 h-4 opacity-70" />
          </a>

          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-red-500/20 bg-red-500/10 text-sm font-medium text-red-400 transition-all hover:bg-red-500/20 hover:text-red-300"
          >
            Logout
            <LogOut className="w-4 h-4 opacity-70" />
          </button>
        </div>
      </div>
    </aside>
  )
}

function NavItem({ icon: Icon, label, href, badge, hasChildren, subItems, pathname, onClick }: any) {
  const isActive = href === '/admin' ? pathname === '/admin' : (pathname === href || pathname?.startsWith(href + '/'))
  const [isOpen, setIsOpen] = useState(isActive)

  const toggleOpen = (e: any) => {
    if (onClick) {
      e.preventDefault();
      onClick();
      return;
    }
    if (subItems) {
      e.preventDefault()
      setIsOpen(!isOpen)
    }
  }

  return (
    <div className="flex flex-col">
      <Link href={href} className="block w-full" onClick={onClick || subItems ? toggleOpen : undefined}>
        <div
          className={cn(
            "flex items-center justify-between px-4 py-2.5 rounded-xl cursor-pointer transition-all duration-300 group relative overflow-hidden",
            isActive && !subItems
              ? "bg-gradient-to-r from-[#7A1111] to-[#550000] text-white shadow-[0_0_20px_rgba(122,17,17,0.4)] border border-white/10"
              : isActive && subItems
              ? "bg-white/10 text-white"
              : "text-white/70 hover:bg-white/5 hover:text-white"
          )}
        >
          <div className="flex items-center gap-3">
            <Icon className={cn("w-5 h-5", isActive ? "text-white" : "text-white/50 group-hover:text-white/80")} />
            <span className="text-sm font-medium">{label}</span>
          </div>
          
          <div className="flex items-center gap-2">
            {badge && (
              <span className="bg-[#C52A35] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(197,42,53,0.5)]">
                {badge}
              </span>
            )}
            {hasChildren && (
              <ChevronDown className={cn("w-4 h-4 opacity-50 transition-transform", isOpen ? "rotate-180" : "")} />
            )}
          </div>
        </div>
      </Link>
      
      {subItems && isOpen && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="flex flex-col gap-1 pl-11 pr-4 py-2 mt-1 space-y-1 relative"
        >
          <div className="absolute left-6 top-0 bottom-4 w-px bg-white/10" />
          {subItems.map((sub: any, idx: number) => {
            const isSubActive = pathname === sub.href
            return (
              <Link key={idx} href={sub.href}>
                <div className={cn(
                  "relative text-sm px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center",
                  isSubActive 
                    ? "text-white bg-white/10 font-medium" 
                    : "text-white/50 hover:text-white hover:bg-white/5"
                )}>
                  {isSubActive && <div className="absolute left-[-21px] w-2 h-2 rounded-full bg-[#C52A35]" />}
                  {sub.label}
                </div>
              </Link>
            )
          })}
        </motion.div>
      )}
    </div>
  )
}
