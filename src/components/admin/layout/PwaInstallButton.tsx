"use client"

import React, { useState, useEffect } from "react";
import { Smartphone, Download, Share, PlusSquare, X, Check } from "lucide-react";
import { toast } from "sonner";

export function PwaInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Detect if already installed / running in standalone mode
    const standaloneMode = 
      window.matchMedia("(display-mode: standalone)").matches || 
      (window.navigator as any).standalone === true;
    
    setIsStandalone(standaloneMode);

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    window.addEventListener("appinstalled", () => {
      setIsStandalone(true);
      setDeferredPrompt(null);
      toast.success("Rimal Admin installed successfully!");
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isStandalone) {
      toast.info("Rimal Admin is already running as a standalone app.");
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        toast.success("Installing Rimal Admin App...");
      }
      setDeferredPrompt(null);
    } else if (isIos) {
      setShowIosGuide(true);
    } else {
      // General prompt instruction for Chrome / Edge
      toast.info("To install: Tap the menu (⋮ or share icon) in your browser and select 'Install app' or 'Add to Home screen'.");
    }
  };

  if (isStandalone) {
    return null;
  }

  return (
    <>
      <button
        onClick={handleInstallClick}
        type="button"
        title="Install Rimal Admin as Standalone App (No URL Bar)"
        className="flex items-center gap-1.5 h-10 px-3.5 rounded-full glass-button text-xs font-semibold text-white/90 hover:text-white hover:bg-white/10 transition-all border border-white/10 shadow-sm cursor-pointer group"
      >
        <Smartphone className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
        <span className="hidden sm:inline">Install App</span>
      </button>

      {/* iOS Add to Home Screen Instructions Modal */}
      {showIosGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-sm bg-[#120404] border border-[#550000]/60 rounded-3xl p-6 text-white space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#550000] border border-amber-400/30 flex items-center justify-center text-amber-300 font-bold text-xs">
                  R
                </div>
                <h3 className="font-bold text-sm">Install on iPhone</h3>
              </div>
              <button
                onClick={() => setShowIosGuide(false)}
                className="p-1 rounded-xl text-white/50 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-white/70 leading-relaxed">
              To use Rimal Admin without the Safari URL bar like a native app:
            </p>

            <ol className="space-y-3 text-xs text-white/90">
              <li className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/5">
                <span className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center text-[11px] font-bold shrink-0">1</span>
                <span>Tap the <Share className="w-3.5 h-3.5 inline mx-1 text-blue-400" /> <b>Share</b> button in Safari.</span>
              </li>
              <li className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/5">
                <span className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center text-[11px] font-bold shrink-0">2</span>
                <span>Scroll down and select <PlusSquare className="w-3.5 h-3.5 inline mx-1 text-emerald-400" /> <b>Add to Home Screen</b>.</span>
              </li>
              <li className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/5">
                <span className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center text-[11px] font-bold shrink-0">3</span>
                <span>Tap <b>Add</b>. Open from your Home Screen in full-screen standalone mode!</span>
              </li>
            </ol>

            <button
              type="button"
              onClick={() => setShowIosGuide(false)}
              className="w-full py-2.5 rounded-xl bg-[#550000] hover:bg-[#7A1111] text-xs font-semibold text-white transition shadow-[0_0_15px_rgba(85,0,0,0.5)] cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
