import { useState, useEffect } from "react";
import { Menu, Search, ShoppingCart, Heart, User, X, ChevronRight, ChevronDown } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { useUserSync } from "@/context/UserSync";
import Link from "next/link";
import { signOut } from "next-auth/react";

const DEFAULT_NAV = [
  { label: "Shop All", href: "/shop" },
  { label: "New Arrivals", href: "/shop?category=new" },
  { label: "Shirts", href: "/shop?category=shirts" },
  { label: "T-Shirts", href: "/shop?category=t-shirts" },
  { label: "Polos", href: "/shop?category=polos" },
  { label: "Hats", href: "/shop?category=hats" },
  { label: "Jackets", href: "/shop?category=jackets" },
  { label: "Trousers", href: "/shop?category=trousers" },
  { label: "Panjabi", href: "/shop?category=panjabi" },
  { label: "Sale", href: "/shop?sale=true" },
];

import { API_ROOT } from "@/lib/api";

const getTrimmedLogoUrl = (url?: string) => {
  if (!url) return '';
  if (url.includes('cloudinary.com') && !url.includes('/e_trim/')) {
    return url.replace('/image/upload/', '/image/upload/e_trim/');
  }
  return url;
};

interface NavItemType {
  label: string;
  href: string;
  badge?: string;
}

const formatNavLinks = (links: any[]): NavItemType[] => {
  return links.map(link => {
    let href = link.value || '/';
    if (link.type === 'category') {
      href = href.startsWith('/shop') ? href : `/shop?category=${encodeURIComponent(href)}`;
    }
    return {
      label: link.label || 'Link',
      href,
      badge: link.badge || undefined
    };
  });
};

export function Header() {
  const [open, setOpen] = useState(false);
  const { setShowAuthModal, isLoggedIn, setIsCartOpen, setIsSearchOpen, cart, userProfile, authStatus } = useUserSync();
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [navItems, setNavItems] = useState<NavItemType[]>(DEFAULT_NAV);
  const [siteIdentity, setSiteIdentity] = useState<{ logoUrl?: string, storeName?: string }>({});
  const [categoryTree, setCategoryTree] = useState<any[]>([]);
  const [expandedNavKeys, setExpandedNavKeys] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Initial cached load
    const savedIdentity = localStorage.getItem('rimal_site_identity');
    if (savedIdentity) {
      try { setSiteIdentity(JSON.parse(savedIdentity)); } catch (e) {}
    }

    const savedNav = localStorage.getItem('rimal_navigation_links');
    if (savedNav) {
      try {
        const parsed = JSON.parse(savedNav);
        if (parsed && Array.isArray(parsed.links) && parsed.links.length > 0) {
          setNavItems(formatNavLinks(parsed.links));
        }
      } catch (e) {}
    }
  }, []);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    // Fetch live categories tree for subcategories
    fetch('/api/storefront/categories')
      .then(res => res.ok ? res.json() : [])
      .then((tree: any[]) => {
        if (Array.isArray(tree) && tree.length > 0) {
          setCategoryTree(tree);
        }
      })
      .catch(console.error);

    // Fetch dynamic navigation links from Admin Settings
    fetch(`${API_ROOT}storefront/settings?key=navigation_links`)
      .then(res => res.ok ? res.json() : null)
      .then(json => {
        if (json && Array.isArray(json.links) && json.links.length > 0) {
          const formatted = formatNavLinks(json.links);
          setNavItems(formatted);
          if (typeof window !== 'undefined') {
            localStorage.setItem('rimal_navigation_links', JSON.stringify(json));
          }
        }
      })
      .catch(console.error);

    // Live update listener
    const handleNavMessage = (e: MessageEvent) => {
      if (e.data?.type === 'STOREFRONT_NAV_UPDATE' && Array.isArray(e.data?.data?.links)) {
        setNavItems(formatNavLinks(e.data.data.links));
      }
    };
    window.addEventListener('message', handleNavMessage);

    // Fetch site identity
    fetch(`${API_ROOT}storefront/settings?key=site_identity`)
      .then(res => res.ok ? res.json() : null)
      .then(json => {
        if (json && Object.keys(json).length > 0) {
          setSiteIdentity(json);
          if (typeof window !== 'undefined') {
            localStorage.setItem('rimal_site_identity', JSON.stringify(json));
          }
        }
      })
      .catch(console.error);

    return () => {
      window.removeEventListener('message', handleNavMessage);
    };
  }, []);

  // Helper to find subcategories for a given menu item
  const getSubcategoriesForItem = (item: NavItemType) => {
    const labelLower = item.label.toLowerCase().trim();
    const matched = categoryTree.find(cat => {
      if (cat.name.toLowerCase().trim() === labelLower) return true;
      if (cat.slug.toLowerCase().trim() === labelLower) return true;
      if (item.href.includes(`category=${encodeURIComponent(cat.slug)}`)) return true;
      if (item.href.includes(`category=${encodeURIComponent(cat.name)}`)) return true;
      return false;
    });

    if (matched && Array.isArray(matched.subcategories) && matched.subcategories.length > 0) {
      return {
        parentName: matched.name,
        subs: matched.subcategories
      };
    }
    return null;
  };

  const toggleNavExpand = (key: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedNavKeys(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-maroon-deep/85 backdrop-blur-md">
      <div className="flex h-16 w-full items-center justify-between px-4 sm:px-6 md:h-20 md:px-8 lg:px-12 xl:px-16">
        {/* Left: menu trigger */}
        <div className="flex items-center gap-3">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                aria-label="Open menu"
                className="group inline-flex items-center gap-2 text-foreground/90 transition hover:text-gold"
              >
                <Menu className="h-5 w-5" />
                <span className="hidden text-xs font-medium uppercase tracking-[0.2em] md:inline">
                  Menu
                </span>
              </button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-full max-w-sm border-r border-border/60 bg-maroon-deep p-0 text-foreground [&>button]:hidden"
            >
              <SheetTitle className="sr-only">Rimal Store menu</SheetTitle>
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
                  {siteIdentity.logoUrl ? (
                    <img src={getTrimmedLogoUrl(siteIdentity.logoUrl)} alt={siteIdentity.storeName || "Rimal"} className="h-12 w-auto object-contain" />
                  ) : (
                    <span className="font-display text-2xl text-gold">{siteIdentity.storeName?.split(' ')[0] || "Rimal"}</span>
                  )}
                  <button
                    onClick={() => setOpen(false)}
                    aria-label="Close menu"
                    className="text-foreground/70 hover:text-gold"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <nav className="flex-1 overflow-y-auto px-6 py-8">
                  <p className="mb-4 text-[10px] font-medium uppercase tracking-[0.25em] text-gold/70">
                    Explore
                  </p>
                  <ul className="space-y-1">
                    {navItems.map((item, index) => {
                      const isExternal = item.href.startsWith('http');
                      const subInfo = getSubcategoriesForItem(item);
                      const isExpanded = !!expandedNavKeys[item.label];
                      
                      return (
                        <li key={index} className="border-b border-border/40 py-1">
                          <div className="flex items-center justify-between py-2.5">
                            {isExternal ? (
                              <a
                                href={item.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => setOpen(false)}
                                className="group flex items-center gap-2.5 font-display text-2xl transition hover:text-gold flex-1 min-w-0"
                              >
                                <span className="truncate">{item.label}</span>
                                {item.badge && (
                                  <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded-full bg-gold/20 text-gold border border-gold/40 shrink-0">
                                    {item.badge}
                                  </span>
                                )}
                              </a>
                            ) : (
                              <Link
                                href={item.href}
                                onClick={() => setOpen(false)}
                                className="group flex items-center gap-2.5 font-display text-2xl transition hover:text-gold flex-1 min-w-0"
                              >
                                <span className="truncate">{item.label}</span>
                                {item.badge && (
                                  <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded-full bg-gold/20 text-gold border border-gold/40 shrink-0">
                                    {item.badge}
                                  </span>
                                )}
                              </Link>
                            )}

                            {subInfo ? (
                              <button
                                type="button"
                                onClick={(e) => toggleNavExpand(item.label, e)}
                                title={isExpanded ? "Hide subcategories" : "Show subcategories"}
                                className="p-2 text-gold/80 hover:text-gold hover:bg-white/5 rounded-lg transition-colors ml-2 shrink-0"
                              >
                                <ChevronDown
                                  className={`h-5 w-5 transition-transform duration-200 ${
                                    isExpanded ? "rotate-180" : ""
                                  }`}
                                />
                              </button>
                            ) : (
                              <ChevronRight className="h-4 w-4 opacity-40 shrink-0 ml-2" />
                            )}
                          </div>

                          {/* Nested Subcategories */}
                          {subInfo && isExpanded && (
                            <div className="pl-4 pr-1 pb-3 pt-1 border-l-2 border-gold/40 ml-2 space-y-1.5 flex flex-col animate-in fade-in slide-in-from-top-1 duration-150">
                              {subInfo.subs.map((sub: any) => (
                                <Link
                                  key={sub.id}
                                  href={`/shop?category=${encodeURIComponent(subInfo.parentName)}&subCategory=${encodeURIComponent(sub.name)}`}
                                  onClick={() => setOpen(false)}
                                  className="group flex items-center justify-between py-1.5 text-base font-medium text-foreground/80 hover:text-gold transition-colors"
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="text-gold/50 text-xs font-mono">↳</span>
                                    <span>{sub.name}</span>
                                  </div>
                                  <ChevronRight className="h-3.5 w-3.5 opacity-0 -translate-x-1 transition group-hover:opacity-100 group-hover:translate-x-0 text-gold" />
                                </Link>
                              ))}
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </nav>

                <div className="border-t border-border/60 px-6 py-6 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  <p>Free shipping over $150</p>
                  <p className="mt-2">Support: hello@rimal.store</p>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Center: logo - shifted further right on mobile for user preference */}
        <Link 
          href="/" 
          className="group flex flex-col items-center justify-center h-full py-0.5 translate-x-7 sm:translate-x-8 md:translate-x-0 transition-transform"
        >
          {siteIdentity.logoUrl ? (
            <img 
              src={getTrimmedLogoUrl(siteIdentity.logoUrl)} 
              alt={siteIdentity.storeName || "Rimal"} 
              className="h-[52px] md:h-[68px] w-auto max-h-[90%] object-contain transition-transform duration-300 group-hover:scale-105" 
            />
          ) : (
            <>
              <span className="font-display text-2xl leading-none text-gold md:text-3xl tracking-tight transition-colors duration-300 group-hover:text-gold/90">
                {siteIdentity.storeName?.split(' ')[0] || "Rimal"}
              </span>
              <span className="mt-0.5 text-[8px] md:text-[9px] font-medium uppercase tracking-[0.35em] text-muted-foreground">
                {siteIdentity.storeName?.split(' ').slice(1).join(' ') || "Store · Est. 2025"}
              </span>
            </>
          )}
        </Link>

        {/* Right: actions */}
        <div className="flex items-center gap-4 text-foreground/85">
          {authStatus === "loading" ? (
            <div className="hidden md:block w-8 h-8 rounded-full bg-white/5 animate-pulse" />
          ) : isLoggedIn ? (
            <div className="relative hidden md:block">
              <button 
                onClick={() => setIsAccountOpen(!isAccountOpen)}
                className="flex items-center justify-center w-8 h-8 bg-secondary/30 rounded-full border border-border/50 hover:border-gold transition-colors overflow-hidden focus:outline-none"
              >
                <div className="w-full h-full bg-gold flex items-center justify-center text-background text-sm font-bold uppercase overflow-hidden">
                  {userProfile?.avatar ? (
                    <img src={userProfile.avatar} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    userProfile?.name?.charAt(0) || 'U'
                  )}
                </div>
              </button>
              
              {isAccountOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsAccountOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border shadow-xl rounded-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-2 flex flex-col relative z-50">
                      <Link href="/account" onClick={() => setIsAccountOpen(false)} className="px-3 py-2 text-sm text-foreground/80 hover:text-gold hover:bg-secondary rounded-lg transition-colors text-left">Dashboard</Link>
                      <Link href="/account?tab=orders" onClick={() => setIsAccountOpen(false)} className="px-3 py-2 text-sm text-foreground/80 hover:text-gold hover:bg-secondary rounded-lg transition-colors text-left">My Orders</Link>
                      <button 
                        onClick={() => {
                          setIsAccountOpen(false);
                          signOut({ callbackUrl: "/" });
                        }}
                        className="px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors text-left mt-1"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-full bg-gold/10 text-gold border border-gold/30 hover:bg-gold hover:text-background transition-all font-bold text-xs tracking-widest uppercase shadow-sm"
            >
              <User className="w-4 h-4" />
              Sign In
            </button>
          )}
          <button aria-label="Wishlist" className="hidden hover:text-gold md:inline-flex">
            <Heart className="h-5 w-5" />
          </button>
          <button
            aria-label="Search"
            onClick={() => setIsSearchOpen(true)}
            className="hover:text-gold"
          >
            <Search className="h-5 w-5" />
          </button>
          <button
            onClick={() => setIsCartOpen(true)}
            aria-label="Cart"
            className="group relative p-2 text-foreground/90 transition hover:text-gold"
          >
            <ShoppingCart strokeWidth={2} className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-background">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}



