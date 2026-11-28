"use client"

import { useEffect } from "react";

declare global {
  interface Window {
    OneSignalDeferred?: any[];
    OneSignal?: any;
  }
}

export function OneSignalInit() {
  useEffect(() => {
    // Only run on client side and not inside admin routes
    if (typeof window === "undefined") return;
    if (window.location.pathname.startsWith("/admin")) return;

    let isMounted = true;

    async function initOneSignal() {
      try {
        const res = await fetch("/api/storefront/settings?key=onesignal_settings");
        if (!res.ok) return;

        const data = await res.json();
        if (!isMounted || !data?.enabled || !data?.appId) return;

        // Ensure script is loaded
        const SCRIPT_ID = "onesignal-sdk-script";
        if (!document.getElementById(SCRIPT_ID)) {
          const script = document.createElement("script");
          script.id = SCRIPT_ID;
          script.src = "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js";
          script.defer = true;
          document.head.appendChild(script);
        }

        window.OneSignalDeferred = window.OneSignalDeferred || [];
        window.OneSignalDeferred.push(async function (OneSignal: any) {
          try {
            await OneSignal.init({
              appId: data.appId,
              safari_web_id: data.safariWebId || undefined,
              allowLocalhostAsSecureOrigin: true,
              notifyButton: {
                enable: false,
              },
            });

            if (data.autoPrompt) {
              setTimeout(() => {
                try {
                  if (OneSignal?.Slidedown?.promptPush) {
                    OneSignal.Slidedown.promptPush();
                  }
                } catch (err) {
                  // Ignore slidedown errors if already opted in or dismissed
                }
              }, 4000);
            }
          } catch (err) {
            console.error("OneSignal initialization error:", err);
          }
        });
      } catch (err) {
        console.error("Failed to load OneSignal config:", err);
      }
    }

    initOneSignal();

    return () => {
      isMounted = false;
    };
  }, []);

  return null;
}
