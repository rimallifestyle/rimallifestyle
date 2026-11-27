import { useEffect, useState } from "react";
import { API_ROOT } from "@/lib/api";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  ProductCard,
  ProductCardOverlay,
  ProductCardMinimal,
  ProductCardDetailed,
  ProductCardSkeleton,
} from "./ProductCard";
import type { Product } from "./products";

type Variant = "default" | "overlay" | "minimal" | "detailed";

function renderCard(product: Product, variant: Variant) {
  if (variant === "overlay") return <ProductCardOverlay product={product} />;
  if (variant === "minimal") return <ProductCardMinimal product={product} />;
  if (variant === "detailed") return <ProductCardDetailed product={product} />;
  return <ProductCard product={product} />;
}

export function ProductSlider({
  eyebrow: initialEyebrow,
  title: initialTitle = "",
  description: initialDescription,
  products,
  id,
  variant = "default",
  isLoading = false,
  hideHeader = false,
}: {
  eyebrow?: string;
  title?: string;
  description?: string;
  products: Product[];
  id?: string;
  variant?: Variant;
  isLoading?: boolean;
  hideHeader?: boolean;
}) {
  const [emblaRef, embla] = useEmblaCarousel({ align: "start", loop: false });
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  // Dynamic Content State
  const [eyebrow, setEyebrow] = useState(initialEyebrow);
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [maxProducts, setMaxProducts] = useState(8);

  useEffect(() => {
    if (id) {
      // Fetch dynamic settings from DB
      fetch(`${API_ROOT}storefront/sections?id=${id}`)
        .then(res => res.ok ? res.json() : null)
        .then((data) => {
          if (data && !data.error) {
            setEyebrow(data.eyebrow || initialEyebrow);
            setTitle(data.title || initialTitle);
            setDescription(data.description || initialDescription);
            setMaxProducts(data.maxProducts || 8);
          }
        })
        .catch(console.error);

      // Listen for live updates from builder
      const handleMessage = (e: MessageEvent) => {
        if (e.data?.type === 'STOREFRONT_PREVIEW_UPDATE' && e.data?.component === 'section' && e.data?.id === id) {
          const data = e.data.data;
          setEyebrow(data.eyebrow);
          setTitle(data.title);
          setDescription(data.description);
          setMaxProducts(data.maxProducts || 8);
        }
      };
      window.addEventListener('message', handleMessage);
      return () => window.removeEventListener('message', handleMessage);
    }
  }, [id, initialEyebrow, initialTitle, initialDescription]);

  useEffect(() => {
    if (!embla) return;
    const update = () => {
      setCanPrev(embla.canScrollPrev());
      setCanNext(embla.canScrollNext());
    };
    embla.on("select", update);
    embla.on("reInit", update);
    update();
  }, [embla]);

  const displayedProducts = products.slice(0, maxProducts);

  return (
    <section 
      id={id} 
      className="border-t border-border/40 bg-background py-3 sm:py-4 md:py-6 relative select-none"
    >
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 relative group/slider">
        {!hideHeader && (
          <div className="mb-4 sm:mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              {eyebrow && (
                <p className="mb-1.5 text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.35em] text-gold">
                  {eyebrow}
                </p>
              )}
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl">{title}</h2>
              {description && (
                <p className="mt-1.5 max-w-lg text-xs sm:text-sm text-muted-foreground">
                  {description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex gap-2 relative z-10">
                <button
                  onClick={(e) => { e.stopPropagation(); embla?.scrollPrev(); }}
                  disabled={!canPrev}
                  aria-label="Previous"
                  className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-border/60 text-foreground transition hover:border-gold hover:text-gold disabled:opacity-30 cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); embla?.scrollNext(); }}
                  disabled={!canNext}
                  aria-label="Next"
                  className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-border/60 text-foreground transition hover:border-gold hover:text-gold disabled:opacity-30 cursor-pointer"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Floating Controls for desktop when header is hidden */}
        {hideHeader && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); embla?.scrollPrev(); }}
              disabled={!canPrev}
              aria-label="Previous"
              className="absolute -left-2 sm:left-1 md:left-2 top-1/2 -translate-y-1/2 z-20 hidden md:flex h-10 w-10 items-center justify-center rounded-full border border-border/70 bg-card/90 text-foreground backdrop-blur-md shadow-lg transition-all hover:border-gold hover:text-gold hover:scale-105 active:scale-95 disabled:opacity-0 disabled:pointer-events-none cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); embla?.scrollNext(); }}
              disabled={!canNext}
              aria-label="Next"
              className="absolute -right-2 sm:right-1 md:right-2 top-1/2 -translate-y-1/2 z-20 hidden md:flex h-10 w-10 items-center justify-center rounded-full border border-border/70 bg-card/90 text-foreground backdrop-blur-md shadow-lg transition-all hover:border-gold hover:text-gold hover:scale-105 active:scale-95 disabled:opacity-0 disabled:pointer-events-none cursor-pointer"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </>
        )}

        <div ref={emblaRef} className="-mx-2 sm:-mx-3 overflow-hidden px-2 sm:px-3 py-1">
          <div className="flex gap-3 sm:gap-4 md:gap-5">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="min-w-0 flex-[0_0_75%] sm:flex-[0_0_45%] md:flex-[0_0_30%] lg:flex-[0_0_23%] xl:flex-[0_0_19%] relative z-10"
                  >
                    <ProductCardSkeleton variant={variant} />
                  </div>
                ))
              : displayedProducts.map((p) => (
                  <div
                    key={p.id}
                    className="min-w-0 flex-[0_0_75%] sm:flex-[0_0_45%] md:flex-[0_0_30%] lg:flex-[0_0_23%] xl:flex-[0_0_19%] relative z-10 animate-in fade-in zoom-in-95 duration-500"
                    onClick={(e) => {
                      if (false) e.preventDefault();
                    }}
                  >
                    {renderCard(p, variant)}
                  </div>
                ))}
          </div>
        </div>
      </div>
    </section>
  );
}


