"use client";

import React from "react";
import { useUserSync } from "@/context/UserSync";
import { AuthModal } from "@/components/store/AuthModal";
import { CartSidebar } from "@/components/store/CartSidebar";
import { SearchOverlay } from "@/components/store/SearchOverlay";
import { MobileNav } from "@/components/store/MobileNav";

export function GlobalModals() {
  const {
    isLoggedIn,
    setIsLoggedIn,
    setUserProfile,
    showAuthModal,
    setShowAuthModal,
  } = useUserSync();

  const handleAuthComplete = (authData: { name: string; email: string }) => {
    setIsLoggedIn(true);
    setUserProfile({
      name: authData.name,
      email: authData.email,
    } as any);
    setShowAuthModal(false);
  };

  return (
    <>
      {showAuthModal && !isLoggedIn && (
        <AuthModal onComplete={handleAuthComplete} onCancel={() => setShowAuthModal(false)} />
      )}
      <CartSidebar />
      <SearchOverlay />
      <MobileNav />
    </>
  );
}
