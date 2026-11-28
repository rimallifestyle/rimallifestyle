"use client"

import { useEffect } from "react";
import { PushNotificationModal } from "./PushNotificationModal";

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

  return <PushNotificationModal />;
}
