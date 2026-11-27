import { useEffect, useState } from "react";
import { API_ROOT } from "@/lib/api";
import { ProductCard } from "./ProductCard";
import { useProducts } from "@/hooks/useProducts";
import type { Product } from "./products";

function useCountdown(target: number) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, target - now);
  const s = Math.floor(diff / 1000);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    mins: Math.floor((s % 3600) / 60),
    secs: s % 60,
  };
}

function Cell({ v, label }: { v: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-gold/40 bg-maroon-deep/60 font-display text-2xl text-gold md:h-20 md:w-20 md:text-3xl">
        {String(v).padStart(2, "0")}
      </div>
      <span className="mt-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

export function DiscountSection() {
  const [targetTime, setTargetTime] = useState<number | null>(null);
  const [eyebrow, setEyebrow] = useState("Limited time offer");
  const [title, setTitle] = useState("The Autumn Sale");
  const [description, setDescription] = useState("Up to 43% off signature pieces. Ends soon — once they're gone, they're gone.");
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  
  const { data: allProducts } = useProducts();

  useEffect(() => {
    // Initial fetch
    fetch(`${API_ROOT}storefront/sections?id=discount`)
      .then(res => res.ok ? res.json() : null)
      .then((data) => {
        if (data && !data.error) {
          setEyebrow(data.eyebrow || "Limited time offer");
          setTitle(data.title || "The Autumn Sale");
          setDescription(data.description || "");
          if (data.targetDate) {
            setTargetTime(new Date(data.targetDate).getTime());
          }
          if (data.selectedProducts) {
            setSelectedProductIds(data.selectedProducts.split(",").filter(Boolean));
          }
        }
      })
      .catch(console.error);

    // Listen for live updates
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'STOREFRONT_PREVIEW_UPDATE' && e.data?.component === 'section' && e.data?.id === 'discount') {
        const data = e.data.data;
        setEyebrow(data.eyebrow);
        setTitle(data.title);
        setDescription(data.description);
        if (data.targetDate) {
          setTargetTime(new Date(data.targetDate).getTime());
        }
        if (data.selectedProducts) {
          setSelectedProductIds(data.selectedProducts.split(",").filter(Boolean));
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const t = useCountdown(targetTime ?? Date.now() + 3 * 24 * 60 * 60 * 1000);

  const handleDiscountClick = () => {};

  // Determine which products to show
  let displayedProducts: Product[] = [];
  if (selectedProductIds.length > 0 && allProducts) {
    displayedProducts = allProducts.filter(p => selectedProductIds.includes(p.id));
  }

  return (
    <section
      id="discount"
      className="relative overflow-hidden border-y border-gold/20 bg-gradient-to-br from-maroon-deep via-background to-maroon-deep py-6 sm:py-8 md:py-10"
      onClick={handleDiscountClick}
    >
      <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-accent/10 blur-3xl" />
      <div className="relative w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        <div className="mb-6 sm:mb-8 flex flex-col items-center gap-4 text-center">
          {eyebrow && (
            <p className="text-[11px] font-medium uppercase tracking-[0.35em] text-gold">
              {eyebrow}
            </p>
          )}
          <h2 className="font-display text-4xl md:text-6xl" dangerouslySetInnerHTML={{ __html: title }} />
          {description && (
            <p className="max-w-lg text-sm text-muted-foreground md:text-base">
              {description}
            </p>
          )}
          
          {targetTime && (
            <div className="flex items-center gap-3 md:gap-4">
              <Cell v={t.days} label="Days" />
              <span className="font-display text-2xl text-gold/60">:</span>
              <Cell v={t.hours} label="Hours" />
              <span className="font-display text-2xl text-gold/60">:</span>
              <Cell v={t.mins} label="Mins" />
              <span className="font-display text-2xl text-gold/60">:</span>
              <Cell v={t.secs} label="Secs" />
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {displayedProducts.map((p) => (
            <div key={p.id} onClick={(e) => {}}>
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


