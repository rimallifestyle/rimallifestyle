import { useEffect, useState } from "react";
import { API_ROOT } from "@/lib/api";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import banner1 from "@/assets/banner-1.jpg";
import banner2 from "@/assets/banner-2.jpg";
import banner3 from "@/assets/banner-3.jpg";

// Initial fallback slides while loading
const initialSlides = [
  {
    image: (banner1 as any).src || banner1,
    kicker: "Autumn / Winter Collection",
    title: "Crafted for the modern gentleman",
    sub: "Discover our signature maroon silk shirt — hand-finished in limited numbers.",
    cta: "Shop the collection",
    ctaLink: "#new"
  },
  {
    image: (banner2 as any).src || banner2,
    kicker: "Premium Fabrics",
    title: "Luxury in every thread",
    sub: "Experience the unmatched comfort of our new cotton-linen blends.",
    cta: "Explore Fabrics",
    ctaLink: "#premium"
  },
  {
    image: (banner3 as any).src || banner3,
    kicker: "The Heritage Edit",
    title: "Timeless Style",
    sub: "Classic silhouettes tailored for contemporary life.",
    cta: "View Heritage",
    ctaLink: "#heritage"
  }
];

export function HeroSlider() {
  const [sliders, setSliders] = useState<any[]>(initialSlides);
  const [emblaRef, embla] = useEmblaCarousel({ loop: true });
  const [selected, setSelected] = useState(0);
  useEffect(() => {
    // Initial fetch
    fetch(`${API_ROOT}storefront/sliders`)
      .then(res => res.ok ? res.json() : null)
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          // Fix relative /src/assets/... paths for default images
          const fixed = data.map((s: any) => {
            let imgUrl = s.image;
            if (imgUrl === '/src/assets/banner-1.jpg') imgUrl = (banner1 as any).src || banner1;
            else if (imgUrl === '/src/assets/banner-2.jpg') imgUrl = (banner2 as any).src || banner2;
            else if (imgUrl === '/src/assets/banner-3.jpg') imgUrl = (banner3 as any).src || banner3;
            else if (imgUrl?.startsWith('/src/')) {
              // fallback if any other src assets are used, but typically won't work in Vite
              imgUrl = `http://localhost:5173/rimal_Store${imgUrl}`;
            }
            return { ...s, image: imgUrl };
          });
          setSliders(fixed);
        }
      })
      .catch(console.error);

    // Listen for live updates from the builder
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'STOREFRONT_PREVIEW_UPDATE' && e.data?.component === 'hero_slider') {
        setSliders(e.data.data);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleSliderClick = () => {};

  useEffect(() => {
    if (!embla) return;
    const onSelect = () => setSelected(embla.selectedScrollSnap());
    embla.on("select", onSelect);
    onSelect();
    
    const handleActiveTab = (e: MessageEvent) => {
      if (e.data?.type === 'STOREFRONT_ACTIVE_TAB') {
        embla.scrollTo(e.data.tab);
      }
    };
    window.addEventListener('message', handleActiveTab);
    
    // Only auto-play if NOT in builder mode
    let id: any;
    if (window === window.parent) {
      id = setInterval(() => embla.scrollNext(), 6000);
    }
    
    return () => {
      if (id) clearInterval(id);
      embla.off("select", onSelect);
      window.removeEventListener('message', handleActiveTab);
    };
  }, [embla]);

  return (
    <section 
      className="relative overflow-hidden bg-maroon-deep"
      onClick={handleSliderClick}
    >
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {sliders.map((slide, i) => (
            <div key={i} className="relative min-w-0 flex-[0_0_100%]">
              <div className="relative h-[70vh] min-h-[520px] w-full md:h-[85vh]">
                <img
                  src={slide.image}
                  alt=""
                  width={1920}
                  height={900}
                  loading={i === 0 ? "eager" : "lazy"}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 gradient-hero" />
                <div className="absolute inset-0 flex items-end md:items-center">
                  <div className="w-full px-6 pb-16 md:px-12 lg:px-16 xl:px-20 md:pb-0">
                    <div className="max-w-xl">
                      <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.35em] text-gold">
                        {slide.kicker}
                      </p>
                      <h1 className="font-display text-4xl leading-[1.05] text-cream md:text-6xl lg:text-7xl">
                        {slide.title}
                      </h1>
                      <p className="mt-5 max-w-md text-base text-cream/80 md:text-lg">
                        {slide.sub}
                      </p>
                      <div className="mt-8 flex flex-wrap gap-3">
                        <a
                          href={slide.ctaLink || "#"}
                          className="group inline-flex items-center gap-2 bg-accent px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.2em] text-accent-foreground transition hover:bg-gold-soft"
                        >
                          {slide.cta || "Shop Now"}
                          <ChevronRight className="h-4 w-4 transition group-hover:translate-x-1" />
                        </a>
                        <a
                          href={slide.secondaryCtaLink || "#lookbook"}
                          className="inline-flex items-center gap-2 border border-cream/40 px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.2em] text-cream transition hover:border-gold hover:text-gold"
                        >
                          {slide.secondaryCta || "View lookbook"}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <button
        onClick={() => embla?.scrollPrev()}
        aria-label="Previous"
        className="absolute left-4 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-cream/30 bg-maroon-deep/40 p-3 text-cream backdrop-blur-sm transition hover:border-gold hover:text-gold md:inline-flex"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={() => embla?.scrollNext()}
        aria-label="Next"
        className="absolute right-4 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-cream/30 bg-maroon-deep/40 p-3 text-cream backdrop-blur-sm transition hover:border-gold hover:text-gold md:inline-flex"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {sliders.map((_, i) => (
          <button
            key={i}
            onClick={() => embla?.scrollTo(i)}
            aria-label={`Slide ${i + 1}`}
            className={`h-[3px] transition-all ${
              selected === i ? "w-10 bg-gold" : "w-5 bg-cream/40"
            }`}
          />
        ))}
      </div>
    </section>
  );
}


