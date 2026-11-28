"use client"

import React, { useState, useEffect } from "react";
import { Bell, Sparkles, X, Check } from "lucide-react";

export function PushNotificationModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPrompting, setIsPrompting] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.pathname.startsWith("/admin")) return;

    // Check if browser supports notifications
    if (!("Notification" in window)) return;

    // If permission was already granted or permanently blocked, don't show
    if (Notification.permission === "granted" || Notification.permission === "denied") {
      return;
    }

    // Check if dismissed within the last 5 days
    const dismissedAt = localStorage.getItem("rimal_push_prompt_dismissed");
    if (dismissedAt) {
      const daysSinceDismiss = (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismiss < 5) return;
    }

    // Check if OneSignal is enabled in settings before showing prompt
    fetch("/api/storefront/settings?key=onesignal_settings")
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (!data?.enabled || !data?.appId) return;

        // Display the custom prompt after 4 seconds
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 4000);

        return () => clearTimeout(timer);
      })
      .catch(() => {});
  }, []);

  const handleAllow = async () => {
    setIsPrompting(true);
    localStorage.setItem("rimal_push_prompt_dismissed", Date.now().toString());

    try {
      if (window.OneSignalDeferred) {
        window.OneSignalDeferred.push(async function (OneSignal: any) {
          try {
            if (OneSignal?.Notifications?.requestPermission) {
              await OneSignal.Notifications.requestPermission();
            } else if (OneSignal?.Slidedown?.promptPush) {
              await OneSignal.Slidedown.promptPush();
            }
          } catch (e) {
            console.error("OneSignal requestPermission error:", e);
          }
        });
      } else if ("Notification" in window) {
        await Notification.requestPermission();
      }
    } catch (e) {
      console.error("Notification permission error:", e);
    } finally {
      setIsPrompting(false);
      setIsOpen(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem("rimal_push_prompt_dismissed", Date.now().toString());
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-[calc(100vw-2.5rem)] animate-in fade-in slide-in-from-bottom-6 duration-300">
      <div className="relative rounded-3xl p-5 bg-[#120404]/95 border border-[#550000]/50 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl text-white">
        
        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-1 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content */}
        <div className="flex items-start gap-3.5 pr-6">
          <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-[#7A1111] to-[#550000] border border-amber-400/30 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(122,17,17,0.5)]">
            <Bell className="w-5 h-5 text-amber-300" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-black" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-400/90 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> Special Updates
              </span>
            </div>
            <h4 className="text-sm font-bold text-white leading-tight">
              Turn On Notifications
            </h4>
            <p className="text-xs text-white/60 mt-1 leading-relaxed">
              Get immediate alerts for exclusive discounts, new luxury arrivals, and order updates.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/10">
          <button
            onClick={handleDismiss}
            className="flex-1 py-2 rounded-xl text-xs font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            Later
          </button>
          <button
            onClick={handleAllow}
            disabled={isPrompting}
            className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-[#7A1111] to-[#550000] text-xs font-semibold text-white hover:shadow-[0_0_20px_rgba(122,17,17,0.6)] hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isPrompting ? (
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Check className="w-3.5 h-3.5 text-amber-300" />
            )}
            Allow Notifications
          </button>
        </div>

      </div>
    </div>
  );
}
