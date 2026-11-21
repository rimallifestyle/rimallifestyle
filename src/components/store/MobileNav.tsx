import { useState, useEffect } from "react";
import { Home, Store, Tag, Heart, User } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useUserSync } from "@/context/UserSync";

const NAV_ITEMS = [
  { id: "home",     icon: Home,  label: "Home",   path: "/" },
  { id: "offers",   icon: Tag,   label: "Offers", path: "/shop" },
  { id: "shop",     icon: Store, label: "Shop",   path: "/shop" },
  { id: "wishlist", icon: Heart, label: "Saved",  path: "/account#wishlist" },
  { id: "profile",  icon: User,  label: "Profile" },
];

export function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { setShowAuthModal, isLoggedIn, isCartOpen, cart, userProfile } = useUserSync();

  // Derive active tab from current path
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const path = pathname;
    if (path === "/")              setActiveIndex(0);
    else if (path === "/shop")     setActiveIndex(2);
    else if (path === "/account")  setActiveIndex(4);
  }, [pathname]);

  // Hide on product pages or when cart is open
  const isProductPage = pathname.startsWith("/product/");
  if (isProductPage || isCartOpen) return null;

  const handleItemClick = (index: number, id: string) => {
    setActiveIndex(index);

    switch (id) {
      case "home":
        router.push("/");
        break;
      case "offers":
      case "shop":
        router.push("/shop");
        break;
      case "wishlist":
        if (isLoggedIn) {
          router.push("/account");
          // slight delay so route renders before hash
          setTimeout(() => { window.location.hash = "wishlist"; }, 50);
        } else {
          setShowAuthModal(true);
        }
        break;
      case "profile":
        if (isLoggedIn) {
          router.push("/account");
        } else {
          setShowAuthModal(true);
        }
        break;
    }
  };

  const initial = (userProfile?.name || userProfile?.email || "U").charAt(0).toUpperCase();

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[60] md:hidden">
      <div className="flex items-center justify-between bg-card/90 backdrop-blur-xl border border-border shadow-[0_10px_30px_rgba(0,0,0,0.5)] rounded-full px-2 py-2 h-16 w-full">
        {NAV_ITEMS.map((item, index) => {
          const isActive = activeIndex === index;

          return (
            <div
              key={item.id}
              onClick={() => handleItemClick(index, item.id)}
              className={`relative flex items-center justify-center h-12 cursor-pointer transition-all duration-500 ease-in-out ${
                isActive
                  ? "bg-gold text-background rounded-full px-5 flex-shrink-0 shadow-md"
                  : "w-12 text-muted-foreground hover:text-foreground flex-shrink-0"
              }`}
            >
              <div className="flex items-center gap-2">
                {/* Profile icon: show avatar initial if logged in */}
                {item.id === "profile" ? (
                  isLoggedIn ? (
                    <div
                      className={`flex items-center justify-center rounded-full font-bold uppercase text-sm transition-all duration-300 ${
                        isActive
                          ? "w-5 h-5 bg-background/30 text-background"
                          : "w-7 h-7 bg-gold text-background border-2 border-gold/40"
                      }`}
                    >
                      {initial}
                    </div>
                  ) : (
                    <item.icon
                      strokeWidth={isActive ? 2.5 : 2}
                      className={`transition-all duration-500 ${isActive ? "h-5 w-5" : "h-6 w-6"}`}
                    />
                  )
                ) : (
                  <div className="relative">
                    <item.icon
                      strokeWidth={isActive ? 2.5 : 2}
                      className={`transition-all duration-500 ${isActive ? "h-5 w-5" : "h-6 w-6"}`}
                    />
                    {/* Wishlist heart dot if items saved */}
                    {item.id === "wishlist" && isLoggedIn && cart.length === 0 && null}
                  </div>
                )}

                {isActive && (
                  <span className="font-semibold text-sm tracking-wide overflow-hidden whitespace-nowrap animate-in fade-in zoom-in duration-500">
                    {item.id === "profile" && isLoggedIn ? (userProfile?.name?.split(" ")[0] || "Account") : item.label}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


