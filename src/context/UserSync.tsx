import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Product } from "@/components/store/products";
import { useSession } from "next-auth/react";

export interface CartItem {
  id: string; // combination of productId and size
  product: Product;
  quantity: number;
  size: string;
}

interface UserProfile {
  size: string | null;
  address: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  avatar?: string | null;
  role?: string | null;
}

interface UserContextType {
  hasSeenOnboarding: boolean;
  setHasSeenOnboarding: (val: boolean) => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (val: boolean) => void;
  authStatus: string;
  userProfile: UserProfile;
  setUserProfile: (profile: UserProfile) => void;
  showAuthModal: boolean;
  setShowAuthModal: (val: boolean) => void;
  isCartOpen: boolean;
  setIsCartOpen: (val: boolean) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (val: boolean) => void;
  cart: CartItem[];
  addToCart: (product: Product, size?: string, quantity?: number) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  wishlist: number[];
  toggleWishlist: (productId: number) => Promise<void>;
}

const UserSyncContext = createContext<UserContextType | undefined>(undefined);

export function UserSyncProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(true); // default true to avoid flash, update in effect
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({ size: null, address: null, name: null, email: null, phone: null, avatar: null, role: null });
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<number[]>([]);

  // Sync NextAuth session with local state
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      setIsLoggedIn(true);
      setUserProfile((prev) => ({
        ...prev,
        name: session.user?.name || null,
        email: session.user?.email || null,
        avatar: (session.user as any)?.avatar || prev.avatar || null,
        role: (session.user as any)?.role || prev.role || null,
      }));
      if (typeof window !== "undefined" && (session as any).apiToken) {
        localStorage.setItem("rimal_token", (session as any).apiToken);
      }
    } else if (status === "unauthenticated") {
      setIsLoggedIn(false);
      if (typeof window !== "undefined") {
        localStorage.removeItem("rimal_token");
      }
    }
  }, [session, status]);

  // Initialize offline settings from localStorage
  useEffect(() => {
    try {
      setHasSeenOnboarding(true);

      const storedProfile = localStorage.getItem("rimal_userProfile");
      if (storedProfile) {
        setUserProfile(JSON.parse(storedProfile));
      }

      const storedCart = localStorage.getItem("rimal_cart");
      if (storedCart) {
        setCart(JSON.parse(storedCart));
      }

    } catch (e) {
      console.error("Failed to read from localStorage", e);
    }
  }, []);

  // Sync to localStorage
  const handleSetHasSeenOnboarding = (val: boolean) => {
    setHasSeenOnboarding(val);
    localStorage.setItem("rimal_hasSeenOnboarding", String(val));
  };

  const handleSetIsLoggedIn = (val: boolean) => {
    setIsLoggedIn(val);
    localStorage.setItem("rimal_isLoggedIn", String(val));
  };

  const handleSetUserProfile = (profile: UserProfile) => {
    setUserProfile(profile);
    localStorage.setItem("rimal_userProfile", JSON.stringify(profile));
  };

  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem("rimal_cart", JSON.stringify(newCart));
  };

  const addToCart = (product: Product, size: string = "M", quantity: number = 1) => {
    const cartItemId = `${product.id}-${size}`;
    const newCart = [...cart];
    const existingIndex = newCart.findIndex((item) => item.id === cartItemId);

    if (existingIndex >= 0) {
      newCart[existingIndex].quantity += quantity;
    } else {
      newCart.push({ id: cartItemId, product, size, quantity });
    }
    saveCart(newCart);
  };

  const removeFromCart = (id: string) => {
    saveCart(cart.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    saveCart(cart.map((item) => (item.id === id ? { ...item, quantity } : item)));
  };

  const toggleWishlist = async (productId: number) => {
    if (!isLoggedIn) {
      setShowAuthModal(true);
      return;
    }
    const isWished = wishlist.includes(productId);
    const endpoint = "storefront/wishlist";
    const method   = isWished ? "DELETE" : "POST";
    
    // Optimistic UI update
    setWishlist(prev => 
      isWished ? prev.filter(id => id !== productId) : [...prev, productId]
    );

    try {
      const { wpFetch } = await import("@/lib/api");
      const res = await wpFetch(endpoint, {
        method: method,
        body: JSON.stringify({ product_id: productId })
      });
      const data = await res.json();
      if (!data.success) {
        // Revert on failure
        setWishlist(prev => 
          isWished ? [...prev, productId] : prev.filter(id => id !== productId)
        );
      }
    } catch (e) {
      // Revert on error
      setWishlist(prev => 
        isWished ? [...prev, productId] : prev.filter(id => id !== productId)
      );
    }
  };

  return (
    <UserSyncContext.Provider
      value={{
        hasSeenOnboarding,
        setHasSeenOnboarding: handleSetHasSeenOnboarding,
        isLoggedIn,
        setIsLoggedIn: handleSetIsLoggedIn,
        authStatus: status,
        userProfile,
        setUserProfile: handleSetUserProfile,
        showAuthModal,
        setShowAuthModal,
        isCartOpen,
        setIsCartOpen,
        isSearchOpen,
        setIsSearchOpen,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        wishlist,
        toggleWishlist,
      }}
    >
      {children}
    </UserSyncContext.Provider>
  );
}

export function useUserSync() {
  const context = useContext(UserSyncContext);
  if (context === undefined) {
    throw new Error("useUserSync must be used within a UserSyncProvider");
  }
  return context;
}
