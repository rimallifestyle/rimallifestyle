"use client";

import { useEffect, useState, useRef } from "react";
import { API_ROOT } from "@/lib/api";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const CACHE_KEY = "rimal_hero_sliders_cache";

export function HeroSlider() {
  const [sliders, setSliders] = useState<any[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (e) {}
    }
    return [];
  });

  const [imageLoaded, setImageLoaded] = useState(false);
  const firstImgRef = useRef<HTMLImageElement>(null);
  const [emblaRef, embla] = useEmblaCarousel({ loop: true });
  const [selected, setSelected] = useState(0);

  // Check if first image is already cached/complete
  useEffect(() => {
    if (firstImgRef.current && firstImgRef.current.complete) {
      setImageLoaded(true);
    }
  }, [sliders]);

  useEffect(() => {
    // Fetch live sliders from database
    fetch(`${API_ROOT}storefront/sliders?t=` + Date.now())
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setSliders(data);
          try {
            localStorage.setItem(CACHE_KEY, JSON.stringify(data));
          } catch (e) {}
        }
      })
      .catch(console.error);

    // Listen for live updates from the storefront builder/admin
    const handleMessage = (e: MessageEvent) => {
      if (
        e.data?.type === "STOREFRONT_PREVIEW_UPDATE" &&
        e.data?.component === "hero_slider" &&
        Array.isArray(e.data?.data)
      ) {
        setSliders(e.data.data);
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(e.data.data));
        } catch (e) {}
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const handleSliderClick = () => {};

  useEffect(() => {
    if (!embla) return;
    const onSelect = () => setSelected(embla.selectedScrollSnap());
    embla.on("select", onSelect);
    onSelect();

    const handleActiveTab = (e: MessageEvent) => {
      if (e.data?.type === "STOREFRONT_ACTIVE_TAB") {
        embla.scrollTo(e.data.tab);
      }
    };
    window.addEventListener("message", handleActiveTab);

    // Auto-play if NOT in builder mode and more than 1 slide
    let id: any;
    if (window === window.parent && sliders.length > 1) {
      id = setInterval(() => embla.scrollNext(), 6000);
    }

    return () => {
      if (id) clearInterval(id);
      embla.off("select", onSelect);
      window.removeEventListener("message", handleActiveTab);
    };
  }, [embla, sliders.length]);

  return (
    <section 
      className="relative overflow-hidden bg-background select-none min-h-[180px] sm:min-h-[260px] md:min-h-[380px]"
      onClick={handleSliderClick}
    >
      {/* Luxury Skeleton Loader - Shown while hero image is downloading */}
      {(!imageLoaded || sliders.length === 0) && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-gradient-to-br from-card/80 via-secondary/50 to-card/90">
          <div className="flex flex-col items-center gap-2.5">
            <div className="h-8 w-8 rounded-full border-2 border-gold/25 border-t-gold animate-spin" />
            <span className="text-[10px] uppercase tracking-[0.3em] text-gold/60 font-medium font-sans">
              Loading...
            </span>
          </div>
        </div>
      )}

      {sliders.length > 0 && (
        <div ref={emblaRef} className="overflow-hidden">
          <div className="flex">
            {sliders.map((slide, i) => (
              <div key={slide.id || i} className="relative min-w-0 flex-[0_0_100%]">
                <a
                  href={slide.ctaLink || "#"}
                  className="block w-full cursor-pointer select-none"
                  draggable={false}
                >
                  <img
                    ref={i === 0 ? firstImgRef : undefined}
                    src={slide.image}
                    alt={slide.title || "Banner"}
                    width={1920}
                    height={900}
                    loading={i === 0 ? "eager" : "lazy"}
                    decoding="async"
                    fetchPriority={i === 0 ? "high" : "auto"}
                    onLoad={() => {
                      if (i === 0) setImageLoaded(true);
                    }}
                    draggable={false}
                    className={`w-full h-auto max-h-[560px] sm:max-h-[620px] md:max-h-[680px] lg:max-h-[720px] xl:max-h-[760px] object-cover object-center block select-none transition-opacity duration-500 ${
                      imageLoaded ? "opacity-100" : "opacity-0"
                    }`}
                  />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Controls */}
      {sliders.length > 1 && (
        <>
          <button
            onClick={() => embla?.scrollPrev()}
            aria-label="Previous"
            className="absolute left-3 sm:left-5 md:left-6 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-cream/30 bg-black/40 p-3 text-cream backdrop-blur-sm transition hover:border-gold hover:text-gold md:inline-flex cursor-pointer shadow-lg hover:scale-105 active:scale-95"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => embla?.scrollNext()}
            aria-label="Next"
            className="absolute right-3 sm:right-5 md:right-6 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-cream/30 bg-black/40 p-3 text-cream backdrop-blur-sm transition hover:border-gold hover:text-gold md:inline-flex cursor-pointer shadow-lg hover:scale-105 active:scale-95"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-3 sm:bottom-4 md:bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-1.5 md:gap-2">
            {sliders.map((_, i) => (
              <button
                key={i}
                onClick={() => embla?.scrollTo(i)}
                aria-label={`Slide ${i + 1}`}
                className={`h-[2px] md:h-[3px] transition-all rounded-full cursor-pointer shadow-sm ${
                  selected === i ? "w-6 md:w-10 bg-gold" : "w-3 md:w-5 bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
