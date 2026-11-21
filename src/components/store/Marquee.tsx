import { useEffect, useState } from "react";
import { API_ROOT } from "@/lib/api";

export function Marquee() {
  const [items, setItems] = useState<string[]>([
    "Free shipping over ৳5000",
    "New Summer Collection Out Now",
    "Handmade in limited numbers",
    "30-day returns",
    "Members get early access",
  ]);
  const [marqueeText, setMarqueeText] = useState("FREE SHIPPING ON ALL ORDERS OVER $150 · EASY RETURNS · PREMIUM QUALITY");

  useEffect(() => {

    // Initial fetch
    fetch(`${API_ROOT}storefront/marquee`)
      .then(res => res.ok ? res.json() : null)
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setItems(data.map((item: any) => item.text));
        }
      })
      .catch(console.error);

    // Listen for live updates from builder
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'STOREFRONT_PREVIEW_UPDATE' && e.data?.component === 'marquee') {
        if (Array.isArray(e.data.data)) {
          setItems(e.data.data.map((item: any) => item.text));
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleMarqueeClick = () => {};

  const line = [...items, ...items, ...items];
  return (
    <div 
      className="overflow-hidden border-y border-gold/20 bg-maroon-deep py-3 relative"
      onClick={handleMarqueeClick}
    >
      <div className="flex animate-[marquee_40s_linear_infinite] gap-12 whitespace-nowrap text-[11px] font-medium uppercase tracking-[0.3em] text-gold">
        {line.map((t, i) => (
          <span key={i} className="flex items-center gap-12">
            {t}
            <span className="text-gold/40">◆</span>
          </span>
        ))}
      </div>
      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-33.333%); }
        }
      `}</style>
    </div>
  );
}


