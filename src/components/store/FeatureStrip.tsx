"use client"

import { useEffect, useState } from "react";
import {
  Truck,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Award,
  Clock,
  Phone,
  Package,
  Heart,
  LucideIcon
} from "lucide-react";
import { API_ROOT } from "@/lib/api";

interface FeatureItem {
  icon: string;
  title: string;
  sub: string;
}

const DEFAULT_ITEMS: FeatureItem[] = [
  { icon: "Truck", title: "Free shipping", sub: "On orders over $150" },
  { icon: "RotateCcw", title: "30-day returns", sub: "Hassle-free exchange" },
  { icon: "ShieldCheck", title: "Secure checkout", sub: "Encrypted payments" },
  { icon: "Sparkles", title: "Handcrafted", sub: "Limited production runs" },
];

const ICON_MAP: Record<string, LucideIcon> = {
  Truck,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Award,
  Clock,
  Phone,
  Package,
  Heart
};

export function FeatureStrip() {
  const [items, setItems] = useState<FeatureItem[]>(DEFAULT_ITEMS);

  useEffect(() => {
    fetch(`${API_ROOT}storefront/settings?key=feature_strip_settings&t=` + Date.now())
      .then(res => res.ok ? res.json() : null)
      .then(json => {
        if (json && Array.isArray(json.items) && json.items.length > 0) {
          setItems(json.items);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section className="border-t border-border/40 bg-background py-6 sm:py-8">
      <div className={`grid w-full gap-5 sm:gap-6 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 ${
        items.length <= 2 
          ? "grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto" 
          : items.length === 3 
          ? "grid-cols-1 sm:grid-cols-3" 
          : "grid-cols-2 md:grid-cols-4"
      }`}>
        {items.map((f, idx) => {
          const IconComponent = ICON_MAP[f.icon] || Sparkles;

          return (
            <div key={idx} className="flex items-start gap-3.5 sm:gap-4 p-2 sm:p-0">
              <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full border border-gold/40 text-gold bg-gold/5 shadow-xs">
                <IconComponent className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="font-display text-base sm:text-lg text-cream tracking-tight truncate font-medium">
                  {f.title}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                  {f.sub}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
