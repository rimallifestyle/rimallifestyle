"use client";

import { useEffect, useState } from "react";
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

  const [emblaRef, embla] = useEmblaCarousel({ loop: true });
  const [selected, setSelected] = useState(0);

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

  // If no sliders loaded yet, show a sleek pulse banner placeholder (never old demo banners!)
  if (sliders.length === 0) {
    return (
      <section className="relative overflow-hidden bg-background">
        <div className="w-full aspect-[16/9] sm:aspect-[21/9] md:aspect-[21/9] bg-secondary/30 animate-pulse" />
      </section>
    );
  }

  return (
    <section 
      className="relative overflow-hidden bg-background"
      onClick={handleSliderClick}
    >
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
                  src={slide.image}
                  alt={slide.title || "Banner"}
                  width={1920}
                  height={900}
                  loading={i === 0 ? "eager" : "lazy"}
                  draggable={false}
                  className="w-full h-auto max-h-[360px] sm:max-h-[420px] md:max-h-[450px] lg:max-h-[480px] xl:max-h-[500px] object-cover object-center block select-none"
                />
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      {sliders.length > 1 && (
        <>
          <button
            onClick={() => embla?.scrollPrev()}
            aria-label="Previous"
            className="absolute left-4 sm:left-6 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-cream/30 bg-black/40 p-3 text-cream backdrop-blur-sm transition hover:border-gold hover:text-gold md:inline-flex cursor-pointer shadow-lg hover:scale-105 active:scale-95"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => embla?.scrollNext()}
            aria-label="Next"
            className="absolute right-4 sm:right-6 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-cream/30 bg-black/40 p-3 text-cream backdrop-blur-sm transition hover:border-gold hover:text-gold md:inline-flex cursor-pointer shadow-lg hover:scale-105 active:scale-95"
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
