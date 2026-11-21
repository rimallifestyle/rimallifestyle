 "use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useUserSync } from "@/context/UserSync";
import {
  Package, Heart, Settings, LogOut, ChevronRight, MapPin,
  Bell, CreditCard, Loader2, LayoutDashboard, X, Camera, CheckCircle2, Edit3, ArrowLeft, Phone
} from "lucide-react";
import { ProductCardMinimal } from "@/components/store/ProductCard";
import { type Product } from "@/components/store/products";
import { Header } from "@/components/store/Header";
import { Footer } from "@/components/store/Footer";
import { toast } from "sonner";



const TABS = [
  { id: "overview",      label: "Overview",    icon: LayoutDashboard },
  { id: "orders",        label: "Orders",       icon: Package },
  { id: "wishlist",      label: "Wishlist",     icon: Heart },
  { id: "payment",       label: "Payment",      icon: CreditCard },
  { id: "notifications", label: "Alerts",       icon: Bell },
  { id: "settings",      label: "Settings",     icon: Settings },
];

export default function AccountDashboard() {
  const { userProfile, isLoggedIn } = useUserSync();
  const { status } = useSession();
  const router = useRouter();
  

  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const tab = searchParams.get("tab");
      if (tab && TABS.find((t) => t.id === tab)) return tab;
      
      const hash = window.location.hash.replace("#", "");
      return TABS.find((t) => t.id === hash) ? hash : "overview";
    }
    return "overview";
  });

  const [orders, setOrders] = useState<any[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      if (!userProfile?.email && !isLoggedIn) return;
      try {
        setIsLoadingOrders(true);
        const url = new URL("/api/storefront/orders", window.location.origin);
        if (userProfile?.email) {
          url.searchParams.append("email", userProfile.email);
        }
        const res = await fetch(url.toString());
        const data = await res.json();
        if (data.success) {
          setOrders(data.orders);
        }
      } catch (err) {
        console.error("Failed to fetch orders", err);
      } finally {
        setIsLoadingOrders(false);
      }
    }
    fetchOrders();
  }, [userProfile?.email, isLoggedIn]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const tab = searchParams.get("tab");
    if (tab && TABS.find((t) => t.id === tab)) setActiveTab(tab);
    else {
      const hash = window.location.hash.replace("#", "");
      if (TABS.find((t) => t.id === hash)) setActiveTab(hash);
      else setActiveTab("overview");
    }
  }, []);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    window.history.pushState(null, "", `?tab=${tabId}`);
    // Scroll content into view on mobile
    document.getElementById("dashboard-content")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleLogout = () => {
    localStorage.removeItem("rimal_token");
    localStorage.removeItem("rimal_isLoggedIn");
    window.location.href = "/";
  };

  if (status === "loading" || (!isLoggedIn && status !== "unauthenticated")) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-gold animate-spin mb-4" />
          <p className="text-muted-foreground font-display tracking-widest text-sm uppercase">Loading Account...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!isLoggedIn) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      {/* ── Mobile Profile Header ────────────────────────────────── */}
      <div className="md:hidden border-b border-border/40 bg-secondary/20 backdrop-blur-xl px-4 py-5 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gold/30 to-gold/5 border-2 border-gold/30 flex items-center justify-center text-gold text-2xl font-display uppercase shadow-[0_0_20px_rgba(212,175,55,0.15)] shrink-0 overflow-hidden">
          {userProfile.avatar ? (
            <img src={userProfile.avatar} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            userProfile.name?.charAt(0) || "U"
          )}
        </div>
        <div className="min-w-0">
          <p className="text-base font-display text-cream truncate">{userProfile.name || "Customer"}</p>
          <p className="text-xs text-muted-foreground truncate">{userProfile.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="ml-auto shrink-0 p-2 rounded-xl text-red-400/70 hover:text-red-400 hover:bg-red-400/10 transition-colors"
          title="Sign Out"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      {/* ── Mobile Tab Bar ───────────────────────────────────────── */}
      <div className="md:hidden sticky top-0 z-20 bg-background/95 backdrop-blur-xl border-b border-border/40">
        <div
          className="flex overflow-x-auto gap-1 px-3 py-2 no-scrollbar"
          style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                  isActive
                    ? "bg-gold text-background shadow-md"
                    : "text-foreground/60 hover:text-foreground hover:bg-white/5"
                }`}
              >
                <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Main Layout ─────────────────────────────────────────── */}
      <main className="flex-1 w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-6 md:py-16 md:grid md:grid-cols-12 md:gap-12">

        {/* Desktop Sidebar */}
        <aside className="hidden md:flex md:col-span-3 flex-col gap-6">
          {/* Profile Card */}
          <div className="bg-secondary/30 border border-border/50 rounded-3xl p-6 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/30 flex items-center justify-center text-gold text-4xl font-display uppercase shadow-[0_0_30px_rgba(212,175,55,0.15)] mb-5 overflow-hidden">
              {userProfile.avatar ? (
                <img src={userProfile.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                userProfile.name?.charAt(0) || "U"
              )}
            </div>
            <h2 className="text-2xl font-display text-cream">{userProfile.name || "Customer"}</h2>
            <p className="text-sm text-muted-foreground mt-1">{userProfile.email}</p>
          </div>

          {/* Nav Menu */}
          <div className="flex flex-col gap-2">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-300 ${
                    isActive
                      ? "bg-gold text-background shadow-lg shadow-gold/20 scale-[1.02]"
                      : "text-foreground/80 hover:bg-white/5 hover:text-gold"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label === "Alerts" ? "Notifications" : tab.label}
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                </button>
              );
            })}

            <div className="h-px bg-white/10 my-4 mx-4" />

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Content Panel */}
        <div id="dashboard-content" className="md:col-span-9 scroll-mt-32">
          <div className="bg-secondary/30 border border-border/50 rounded-[2rem] md:rounded-[2.5rem] p-5 md:p-10 min-h-[400px] md:min-h-[600px] backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
            {activeTab === "overview"      && <OverviewTab onTabChange={handleTabChange} orders={orders} isLoading={isLoadingOrders} />}
            {activeTab === "orders"        && <OrdersTab orders={orders} isLoading={isLoadingOrders} />}
            {activeTab === "wishlist"      && <WishlistTab />}
            {activeTab === "payment"       && <PaymentTab />}
            {activeTab === "notifications" && <NotificationsTab />}
            {activeTab === "settings"      && <SettingsTab userProfile={userProfile} />}
          </div>
        </div>
      </main>

      {/* Extra bottom padding on mobile for the fixed nav bar */}
      <div className="h-24 md:hidden" />
      <Footer />
    </div>
  );
}

// ── Overview ─────────────────────────────────────────────────────────

function OverviewTab({ onTabChange, orders, isLoading }: { onTabChange: (id: string) => void, orders?: any[], isLoading?: boolean }) {
  const { userProfile, wishlist } = useUserSync();
  const recentOrders = orders?.slice(0, 3) || [];
  
  return (
    <div className="animate-in fade-in zoom-in-95 duration-500">
      <h3 className="font-display text-3xl md:text-4xl text-gold mb-1">
        Welcome back, {userProfile.name?.split(" ")[0] || "User"}
      </h3>
      <p className="text-muted-foreground text-sm mb-8">Here is a quick overview of your account.</p>

      <div className="grid grid-cols-3 gap-3 md:gap-6 mb-10">
        {[
          { icon: Package,  value: String(orders?.length || 0), label: "Orders",   tab: "orders" },
          { icon: Heart,    value: String(wishlist.length), label: "Wishlist", tab: "wishlist" },
          { icon: MapPin,   value: userProfile.address ? "1" : "0", label: "Address", tab: "settings" },
        ].map((stat) => (
          <button
            key={stat.label}
            onClick={() => onTabChange(stat.tab)}
            className="bg-secondary/30 border border-border/50 p-4 md:p-6 rounded-2xl md:rounded-[2rem] hover:bg-secondary/50 hover:border-gold/30 transition-all text-left group"
          >
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gold/10 flex items-center justify-center text-gold mb-3 md:mb-5 group-hover:bg-gold/20 transition-colors">
              <stat.icon className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <h4 className="text-2xl md:text-3xl font-display text-cream mb-0.5">{stat.value}</h4>
            <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-widest font-bold">{stat.label}</p>
          </button>
        ))}
      </div>

      <h4 className="font-display text-xl md:text-2xl text-cream mb-5 flex items-center gap-3">
        <Package className="w-5 h-5 md:w-6 md:h-6 text-gold" />
        Recent Orders
      </h4>
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-gold animate-spin" />
        </div>
      ) : recentOrders.length === 0 ? (
        <div className="text-center py-12 md:py-16 bg-white/5 rounded-2xl md:rounded-[2rem] border border-white/10 border-dashed">
          <Package className="w-10 h-10 md:w-12 md:h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground font-medium">You haven't placed any orders yet.</p>
          <Link
            href="/shop"
            className="mt-5 inline-block px-8 py-3 bg-gold/10 text-gold hover:bg-gold hover:text-background rounded-full text-xs font-bold uppercase tracking-widest transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {recentOrders.map((order) => (
            <div key={order._id} className="bg-secondary/20 border border-white/5 rounded-2xl p-5 flex items-center justify-between hover:bg-white/5 transition-colors">
              <div>
                <p className="text-cream font-medium mb-1">Order {order.orderId}</p>
                <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()} • {order.cart?.length || 0} Items</p>
              </div>
              <div className="text-right">
                <p className="text-gold font-bold mb-1">৳{order.total?.toLocaleString()}</p>
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  order.status === 'delivered' ? 'bg-emerald-500/20 text-emerald-400' :
                  order.status === 'shipped' ? 'bg-blue-500/20 text-blue-400' :
                  order.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                  'bg-gold/20 text-gold'
                }`}>
                  {order.status || 'Processing'}
                </span>
              </div>
            </div>
          ))}
          <button onClick={() => onTabChange("orders")} className="w-full py-4 text-center text-sm text-gold font-semibold hover:text-cream transition-colors">
            View All Orders
          </button>
        </div>
      )}
    </div>
  );
}

// ── Orders ────────────────────────────────────────────────────────────

function OrdersTab({ orders, isLoading }: { orders?: any[], isLoading?: boolean }) {
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  if (selectedOrder) {
    return (
      <div className="animate-in fade-in slide-in-from-right-4 duration-500">
        <button 
          onClick={() => setSelectedOrder(null)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-cream transition-colors mb-4 group w-fit"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Orders
        </button>
        
        <div className="flex flex-wrap gap-4 items-center justify-between mb-5 pb-5 border-b border-white/5">
          <div>
            <h3 className="font-display text-2xl md:text-3xl text-cream mb-1 tracking-wide">Order {selectedOrder.orderId}</h3>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5" /> Placed on {new Date(selectedOrder.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
            selectedOrder.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
            selectedOrder.status === 'shipped' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
            selectedOrder.status === 'cancelled' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
            'bg-gold/10 text-gold border border-gold/20'
          }`}>
            {selectedOrder.status || 'Processing'}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-4">
            <h4 className="font-display text-lg text-cream flex items-center gap-2">
              <Package className="w-4 h-4 text-gold" /> Order Items
            </h4>
            <div className="space-y-3">
              {selectedOrder.cart?.map((item: any, idx: number) => {
                const product = item.product || item;
                const image = product.image || product.images?.[0] || '';
                const name = product.name || 'Unknown Product';
                const price = product.price || 0;
                
                return (
                  <div key={idx} className="bg-secondary/10 border border-white/5 rounded-xl p-3 flex gap-4 items-center hover:bg-secondary/20 transition-colors">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-white/5 rounded-lg overflow-hidden shrink-0 border border-white/10 flex items-center justify-center">
                      {image ? (
                        <img src={image} alt={name} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-6 h-6 text-muted-foreground/30" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm md:text-base font-medium text-cream truncate mb-0.5">{name}</p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span>Qty: <span className="text-cream">{item.quantity}</span></span>
                        {item.size && <span>Size: <span className="text-cream">{item.size}</span></span>}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-muted-foreground mb-0.5">৳{price.toLocaleString()} x {item.quantity}</p>
                      <p className="text-base text-gold font-bold">৳{(price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-display text-lg text-cream flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-gold" /> Order Summary
            </h4>
            <div className="bg-secondary/10 border border-white/5 rounded-xl p-5 space-y-3">
              <div className="flex justify-between text-muted-foreground text-xs md:text-sm">
                <span>Subtotal</span>
                <span>৳{selectedOrder.subTotal?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-muted-foreground text-xs md:text-sm">
                <span>Shipping Fee</span>
                <span>৳{selectedOrder.shippingFee?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-cream font-bold pt-3 border-t border-white/10 text-base md:text-lg">
                <span>Total Amount</span>
                <span className="text-gold">৳{selectedOrder.total?.toLocaleString()}</span>
              </div>
            </div>

            <h4 className="font-display text-lg text-cream flex items-center gap-2 pt-2">
              <MapPin className="w-4 h-4 text-gold" /> Shipping Details
            </h4>
            <div className="bg-secondary/10 border border-white/5 rounded-xl p-5 space-y-3">
              <p className="text-cream font-medium text-base border-b border-white/5 pb-3">{selectedOrder.customerName}</p>
              <div className="space-y-2 text-xs md:text-sm text-muted-foreground">
                <p className="flex items-center gap-2 hover:text-cream transition-colors"><Phone className="w-3.5 h-3.5 text-gold" /> {selectedOrder.customerPhone}</p>
                <p className="flex items-start gap-2"><MapPin className="w-3.5 h-3.5 text-gold shrink-0 mt-0.5" /> <span className="break-words leading-relaxed">{selectedOrder.customerAddress}</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
      <h3 className="font-display text-2xl md:text-3xl text-cream mb-5 tracking-wide">Order History</h3>
      
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-gold animate-spin" />
        </div>
      ) : !orders || orders.length === 0 ? (
        <div className="text-center py-12 bg-secondary/10 rounded-[1.5rem] border border-white/5 border-dashed">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3">
            <Package className="w-8 h-8 text-muted-foreground/30" />
          </div>
          <p className="text-muted-foreground font-medium text-sm md:text-base">You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className="space-y-3 md:space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="relative bg-secondary/10 border border-white/5 rounded-2xl md:rounded-[1.5rem] p-4 md:p-5 hover:bg-secondary/20 hover:border-gold/20 transition-all duration-300 group overflow-hidden cursor-pointer" onClick={() => setSelectedOrder(order)}>
              {/* Subtle background glow on hover */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-2xl -mr-12 -mt-12 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              
              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="w-full md:w-auto flex-1">
                  <div className="flex items-start md:items-center gap-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gold/10 flex items-center justify-center text-gold shrink-0">
                      <Package className="w-4 h-4 md:w-5 md:h-5" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2.5 mb-1">
                        <span className="font-display text-lg md:text-xl text-cream tracking-wide group-hover:text-gold transition-colors">{order.orderId}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-widest ${
                          order.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          order.status === 'shipped' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                          order.status === 'cancelled' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                          'bg-gold/10 text-gold border border-gold/20'
                        }`}>
                          {order.status || 'Processing'}
                        </span>
                      </div>
                      <p className="text-[11px] md:text-xs text-muted-foreground flex items-center gap-1.5">
                        {new Date(order.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                        <span className="w-1 h-1 rounded-full bg-muted-foreground/30"></span>
                        {order.cart?.length || 0} {order.cart?.length === 1 ? 'Item' : 'Items'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="w-full md:w-auto flex items-center justify-between md:justify-end gap-5 md:gap-8 pt-3 md:pt-0 border-t border-white/5 md:border-none">
                  <div className="text-left md:text-right">
                    <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold mb-0.5">Total</p>
                    <p className="font-display text-xl md:text-2xl text-cream group-hover:text-gold transition-colors">৳{order.total?.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/5 text-cream group-hover:bg-gold group-hover:text-background transition-all shrink-0">
                    <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Wishlist ──────────────────────────────────────────────────────────

function WishlistTab() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    import("@/lib/api").then(({ wpFetch }) => {
      wpFetch("storefront/wishlist")
        .then(res => res.json())
        .then(data => {
          if (data.success) setProducts(data.products);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    });
  }, []);

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
      <h3 className="font-display text-2xl md:text-3xl text-cream mb-6 md:mb-8">Your Wishlist</h3>
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="w-8 h-8 text-gold animate-spin" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 md:py-16 bg-secondary/30 rounded-2xl border border-border/50 border-dashed">
          <Heart className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground font-medium">Your wishlist is empty.</p>
          <Link href="/shop" className="mt-5 inline-block px-8 py-3 bg-gold/10 text-gold hover:bg-gold hover:text-background rounded-full text-xs font-bold uppercase tracking-widest transition-colors">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCardMinimal key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Payment ───────────────────────────────────────────────────────────

function PaymentTab() {
  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
      <h3 className="font-display text-2xl md:text-3xl text-cream mb-6 md:mb-8">Payment Methods</h3>
      <div className="bg-secondary/30 border border-border/50 p-8 rounded-2xl text-center border-dashed">
        <CreditCard className="w-10 h-10 text-gold/50 mx-auto mb-3" />
        <h4 className="text-base font-bold text-cream mb-2">No Saved Payment Methods</h4>
        <p className="text-sm text-muted-foreground mb-5">Save your card details for faster checkout.</p>
        <button className="px-8 py-3 bg-gold/10 text-gold hover:bg-gold hover:text-background rounded-full text-xs font-bold uppercase tracking-widest transition-colors">
          Add New Card
        </button>
      </div>
    </div>
  );
}

// ── Notifications ─────────────────────────────────────────────────────

function NotificationsTab() {
  const items = [
    { icon: Package, color: "bg-gold/20 text-gold",       title: "Order Shipped!",       body: "Your order #ORD-0911 has been shipped and is on its way.", time: "2 hours ago" },
    { icon: Heart,   color: "bg-blue-500/20 text-blue-400", title: "Item Back in Stock",   body: "Good news! Classic Premium T-Shirt is back in stock.",      time: "1 day ago" },
  ];
  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
      <h3 className="font-display text-2xl md:text-3xl text-cream mb-6 md:mb-8">Notifications</h3>
      <div className="space-y-3 md:space-y-4">
        {items.map((n, i) => (
          <div key={i} className="bg-secondary/30 border border-border/50 p-4 md:p-5 rounded-2xl flex gap-3 md:gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${n.color}`}>
              <n.icon className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-cream">{n.title}</h4>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{n.body}</p>
              <p className="text-xs text-muted-foreground/60 mt-2">{n.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Settings ──────────────────────────────────────────────────────────

function SettingsTab({ userProfile }: { userProfile: any }) {
  const { setUserProfile } = useUserSync();
  const { update } = useSession();
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  
  // Basic Profile State
  const [formData, setFormData] = useState({
    name: userProfile.name || "",
    phone: userProfile.phone || "",
    address: userProfile.address || "",
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  // Email Change State
  const [emailChangeMode, setEmailChangeMode] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  // ---- Avatar Upload ----
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size too large. Maximum is 10MB.');
      e.target.value = '';
      return;
    }

    setUploadingAvatar(true);
    const data = new FormData();
    data.append("file", file);

    try {
      const res = await fetch('/api/auth/upload-avatar', {
        method: 'POST',
        body: data
      });
      const uploadData = await res.json();
      
      if (!res.ok) throw new Error(uploadData.error || "Upload failed");

      // Save to profile
      const saveRes = await fetch("/api/auth/update_profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar: uploadData.url }),
      });
      const saveData = await saveRes.json();
      
      if (saveData.success) {
        setUserProfile({ ...userProfile, avatar: uploadData.url });
        await update({ avatar: uploadData.url });
        toast.success("Profile picture updated!");
      } else {
        throw new Error(saveData.message || "Failed to save avatar");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to upload image.");
    } finally {
      setUploadingAvatar(false);
      e.target.value = '';
    }
  };

  // ---- Basic Profile & Password Update ----
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.new_password && formData.new_password !== formData.confirm_password) {
      toast.error("New passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/update_profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setUserProfile({ ...userProfile, name: data.user.name, phone: data.user.phone, address: data.user.address });
        await update({ name: data.user.name });
        setFormData(prev => ({ ...prev, current_password: "", new_password: "", confirm_password: "" }));
      } else {
        toast.error(data.message || "Failed to update profile.");
      }
    } catch {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ---- Email Change Flow ----
  const requestEmailChange = async () => {
    if (!newEmail || newEmail === userProfile.email) {
      toast.error("Please enter a valid new email.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/request-email-change", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newEmail }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setShowOtpModal(true);
      } else {
        toast.error(data.message || "Failed to request email change.");
      }
    } catch {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const verifyEmailChange = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP.");
      return;
    }
    setOtpLoading(true);
    try {
      const res = await fetch("/api/auth/verify-email-change", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setUserProfile({ ...userProfile, email: data.user.email });
        setShowOtpModal(false);
        setEmailChangeMode(false);
        setNewEmail("");
        setOtp("");
      } else {
        toast.error(data.message || "Invalid OTP.");
      }
    } catch {
      toast.error("An error occurred. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  const inputCls = "w-full bg-secondary/30 border border-border/50 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gold focus:bg-secondary/50 transition-all text-cream placeholder:text-muted-foreground/50";

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500 relative">
      <h3 className="font-display text-2xl md:text-3xl text-cream mb-6 md:mb-8 flex items-center justify-between">
        Profile Settings
      </h3>

      {/* Avatar Upload Section */}
      <div className="flex flex-col items-center mb-10">
        <div className="relative group cursor-pointer">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-2 border-gold/30 bg-secondary/50 overflow-hidden flex items-center justify-center text-4xl font-display text-gold mb-2 shadow-[0_0_20px_rgba(212,175,55,0.15)] relative">
            {userProfile.avatar ? (
              <img src={userProfile.avatar} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              userProfile.name?.charAt(0) || "U"
            )}
            
            {uploadingAvatar && (
              <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-gold animate-spin" />
              </div>
            )}

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-8 h-8 text-white" />
            </div>
          </div>
          <input 
            type="file" 
            accept="image/*" 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleAvatarUpload}
            disabled={uploadingAvatar}
          />
        </div>
        <p className="text-xs text-muted-foreground">Click to upload new profile picture</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 text-[10px] font-bold uppercase tracking-widest text-gold">Full Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. John Doe" className={inputCls} />
          </div>
          <div>
            <label className="block mb-2 text-[10px] font-bold uppercase tracking-widest text-gold">Phone Number</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+880 1..." className={inputCls} />
          </div>
        </div>

        {/* Email Field with Change Logic */}
        <div>
          <label className="flex items-center justify-between mb-2 text-[10px] font-bold uppercase tracking-widest text-gold">
            <span>Email Address</span>
            {!emailChangeMode && (
              <button 
                type="button" 
                onClick={() => setEmailChangeMode(true)}
                className="text-gold hover:text-white flex items-center gap-1 transition-colors"
              >
                <Edit3 className="w-3 h-3" /> Change
              </button>
            )}
          </label>
          
          {emailChangeMode ? (
            <div className="flex gap-2">
              <input 
                type="email" 
                value={newEmail} 
                onChange={(e) => setNewEmail(e.target.value)} 
                placeholder="Enter new email address" 
                className={inputCls} 
              />
              <button 
                type="button"
                onClick={requestEmailChange}
                disabled={loading}
                className="px-6 py-2.5 bg-gold/10 text-gold hover:bg-gold hover:text-background rounded-xl text-xs font-bold uppercase tracking-widest transition-colors flex items-center shrink-0"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify"}
              </button>
              <button 
                type="button"
                onClick={() => { setEmailChangeMode(false); setNewEmail(""); }}
                className="px-4 py-2.5 bg-white/5 text-muted-foreground hover:bg-white/10 rounded-xl text-xs font-bold uppercase transition-colors shrink-0"
              >
                Cancel
              </button>
            </div>
          ) : (
            <input type="email" defaultValue={userProfile.email || ""} disabled className="w-full bg-secondary/30 border border-border/50 rounded-xl px-4 py-2.5 text-sm text-muted-foreground cursor-not-allowed opacity-50" />
          )}
        </div>

        <div>
          <label className="block mb-2 text-[10px] font-bold uppercase tracking-widest text-gold">Shipping Address</label>
          <textarea rows={3} name="address" value={formData.address} onChange={handleChange} placeholder="Street, City, Postal Code..." className={`${inputCls} resize-none`} />
        </div>

        {/* Password section */}
        <div className="pt-4 border-t border-white/10">
          <h4 className="text-sm font-display text-cream mb-4 flex items-center gap-2">
            <Settings className="w-4 h-4 text-gold" /> Change Password
          </h4>
          <div className="space-y-4">
            <div>
              <label className="block mb-2 text-[10px] font-bold uppercase tracking-widest text-gold">Current Password</label>
              <input type="password" name="current_password" value={formData.current_password} onChange={handleChange} placeholder="Required if changing password" className={inputCls} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 text-[10px] font-bold uppercase tracking-widest text-gold">New Password</label>
                <input type="password" name="new_password" value={formData.new_password} onChange={handleChange} placeholder="Leave blank to keep current" className={inputCls} />
              </div>
              <div>
                <label className="block mb-2 text-[10px] font-bold uppercase tracking-widest text-gold">Confirm New Password</label>
                <input type="password" name="confirm_password" value={formData.confirm_password} onChange={handleChange} placeholder="Re-enter new password" className={inputCls} />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-8 py-3 bg-gold text-background rounded-full text-xs font-bold uppercase tracking-widest hover:bg-cream transition-colors shadow-[0_0_20px_rgba(212,175,55,0.2)] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Changes
          </button>
        </div>
      </form>

      {/* OTP Modal for Email Change */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-secondary border border-border/50 p-6 md:p-8 rounded-[2rem] w-full max-w-md shadow-2xl relative animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setShowOtpModal(false)}
              className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="w-12 h-12 bg-gold/10 text-gold rounded-full flex items-center justify-center mb-5">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            
            <h3 className="font-display text-2xl text-cream mb-2">Verify New Email</h3>
            <p className="text-sm text-muted-foreground mb-6">
              We've sent a 6-digit verification code to <strong className="text-white">{newEmail}</strong>. 
              Please enter it below to confirm the change.
            </p>

            <div className="space-y-4">
              <div>
                <input 
                  type="text" 
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000" 
                  className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 text-center text-2xl tracking-[1em] font-bold focus:outline-none focus:border-gold transition-all text-cream placeholder:text-muted-foreground/30" 
                />
              </div>
              <button
                onClick={verifyEmailChange}
                disabled={otpLoading || otp.length !== 6}
                className="w-full py-3 bg-gold text-background rounded-full text-sm font-bold uppercase tracking-widest hover:bg-cream transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {otpLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Email"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

