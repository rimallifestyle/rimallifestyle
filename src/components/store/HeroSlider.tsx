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
      className="relative overflow-hidden bg-background"
      onClick={handleSliderClick}
    >
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {sliders.map((slide, i) => (
            <div key={i} className="relative min-w-0 flex-[0_0_100%]">
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
                  className="w-full h-auto block select-none"
                />
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
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
    </section>
  );
}


