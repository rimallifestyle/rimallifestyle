"use client";

import { useEffect, useState } from "react";
import { API_ROOT } from "@/lib/api";

const CACHE_KEY = "rimal_marquee_cache";

const DEFAULT_ITEMS = [
  "FREE SHIPPING ON ORDERS OVER ৳5,000",
  "NEW SUMMER COLLECTION ARRIVED",
  "10% OFF ON YOUR FIRST ORDER",
];

export function Marquee() {
  const [items, setItems] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          const raw = parsed.items || parsed;
          if (Array.isArray(raw)) {
            const list = raw
              .map((it: any) => (typeof it === "string" ? it : it.text))
              .filter(Boolean);
            if (list.length > 0) return list;
          }
        }
      } catch (e) {}
    }
    return DEFAULT_ITEMS;
  });

  const [speed, setSpeed] = useState<number>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (typeof parsed.speed === "number") return parsed.speed;
        }
      } catch (e) {}
    }
    return 16;
  });

  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    fetch(`${API_ROOT}storefront/marquee?t=` + Date.now())
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && typeof data === "object") {
          if (typeof data.enabled === "boolean") setEnabled(data.enabled);
          if (typeof data.speed === "number" && data.speed > 0) setSpeed(data.speed);

          const raw = data.items || data;
          if (Array.isArray(raw)) {
            const list = raw
              .map((it: any) => (typeof it === "string" ? it : it.text))
              .filter(Boolean);
            if (list.length > 0) {
              setItems(list);
              try {
                localStorage.setItem(
                  CACHE_KEY,
                  JSON.stringify({
                    enabled: data.enabled !== false,
                    speed: data.speed || 16,
                    items: list,
                  })
                );
              } catch (e) {}
            }
          }
        }
      })
      .catch(console.error);

    // Listen for live preview updates
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === "STOREFRONT_PREVIEW_UPDATE" && e.data?.component === "marquee") {
        const data = e.data.data;
        if (data) {
          if (typeof data.enabled === "boolean") setEnabled(data.enabled);
          if (typeof data.speed === "number") setSpeed(data.speed);
          const raw = data.items || data;
          if (Array.isArray(raw)) {
            const list = raw
              .map((it: any) => (typeof it === "string" ? it : it.text))
              .filter(Boolean);
            if (list.length > 0) setItems(list);
          }
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  if (!enabled || items.length === 0) {
    return null;
  }

  // Duplicate items 4 times to ensure seamless infinite looping on ultra-wide screens
  const line = [...items, ...items, ...items, ...items];
  const duration = Math.max(8, speed || 16);

  return (
    <div 
      className="overflow-hidden border-y border-gold/20 bg-maroon-deep py-2.5 sm:py-3 relative select-none transform-gpu"
    >
      <div 
        className="flex whitespace-nowrap text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.25em] sm:tracking-[0.3em] text-gold will-change-transform hover:[animation-play-state:paused]"
        style={{
          animation: `marquee ${duration}s linear infinite`,
          transform: "translate3d(0, 0, 0)",
        }}
      >
        {line.map((text, i) => (
          <span key={i} className="flex items-center gap-8 sm:gap-12 shrink-0 pr-8 sm:pr-12">
            <span>{text}</span>
            <span className="text-gold/40 text-[8px] sm:text-[9px]">◆</span>
          </span>
        ))}
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translate3d(0%, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
      `}</style>
    </div>
  );
}
