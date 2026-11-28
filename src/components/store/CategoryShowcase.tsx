"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { API_ROOT } from "@/lib/api";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import shirtImg from "@/assets/cat-shirt.jpg";
import tshirtImg from "@/assets/cat-tshirt.jpg";
import pantsImg from "@/assets/cat-pants.jpg";

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  thumbnail?: string;
  count?: number;
  description?: string;
  tag?: string;
  sales?: number;
}

const CAT_CACHE_KEY = "rimal_categories_showcase_cache";
const SETTINGS_CACHE_KEY = "rimal_category_showcase_settings";

export function CategoryShowcase() {
  const router = useRouter();
  const [eyebrow, setEyebrow] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(SETTINGS_CACHE_KEY);
        if (cached) return JSON.parse(cached).eyebrow || "";
      } catch (e) {}
    }
    return "";
  });
  const [title, setTitle] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(SETTINGS_CACHE_KEY);
        if (cached) return JSON.parse(cached).title || "";
      } catch (e) {}
    }
    return "";
  });
  const [description, setDescription] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(SETTINGS_CACHE_KEY);
        if (cached) return JSON.parse(cached).description || "";
      } catch (e) {}
    }
    return "";
  });
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(SETTINGS_CACHE_KEY);
        if (cached) {
          const list = JSON.parse(cached).selectedCategories;
          if (Array.isArray(list)) return list;
          if (typeof list === "string") return list.split(",").map((s: string) => s.trim().toLowerCase()).filter(Boolean);
        }
      } catch (e) {}
    }
    return [];
  });
  const [maxProducts, setMaxProducts] = useState(8);
  const [allCategories, setAllCategories] = useState<CategoryItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(CAT_CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {}
    }
    return [];
  });
  const [loading, setLoading] = useState(true);

  // Carousel & mouse drag state
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [dragDistance, setDragDistance] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollability = useCallback(() => {
    if (!sliderRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  }, []);

  useEffect(() => {
    // 1. Fetch section settings
    fetch(`${API_ROOT}storefront/sections?id=category_showcase&t=` + Date.now())
      .then(res => res.ok ? res.json() : null)
      .then((data) => {
        if (data && !data.error) {
          if (data.eyebrow) setEyebrow(data.eyebrow);
          if (data.title) setTitle(data.title);
          if (data.description) setDescription(data.description);
          if (data.selectedCategories) {
            const list = data.selectedCategories.split(",").map((s: string) => s.trim().toLowerCase()).filter(Boolean);
            setSelectedCategoryIds(list);
          } else {
            setSelectedCategoryIds([]);
          }
          if (data.maxProducts) setMaxProducts(Number(data.maxProducts));
          try {
            localStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify(data));
          } catch (e) {}
        }
      })
      .catch(console.error);

    // 2. Fetch live categories from backend (including subcategories)
    fetch(`${API_ROOT}storefront/categories?t=` + Date.now())
      .then(res => res.ok ? res.json() : null)
      .then((cats) => {
        if (Array.isArray(cats) && cats.length > 0) {
          const formatted: CategoryItem[] = [];
          cats.forEach((c: any) => {
            formatted.push({
              id: (c.id || c._id || c.slug).toString(),
              name: c.name || "Category",
              slug: c.slug || c.name?.toLowerCase().replace(/\s+/g, '-') || "shop",
              thumbnail: c.thumbnail || "",
              count: typeof c.count === 'number' ? c.count : 0,
              description: c.description || "",
            });
            if (Array.isArray(c.subcategories)) {
              c.subcategories.forEach((sub: any) => {
                formatted.push({
                  id: (sub.id || sub._id || sub.slug).toString(),
                  name: sub.name || "Subcategory",
                  slug: sub.slug || sub.name?.toLowerCase().replace(/\s+/g, '-') || "shop",
                  thumbnail: sub.thumbnail || c.thumbnail || "",
                  count: typeof sub.count === 'number' ? sub.count : 0,
                  description: sub.description || "",
                });
              });
            }
          });
          setAllCategories(formatted);
          try {
            localStorage.setItem(CAT_CACHE_KEY, JSON.stringify(formatted));
          } catch (e) {}
        }
      })
      .catch(console.error)
      .finally(() => {
        setLoading(false);
      });

    // Listen for live updates from admin preview
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'STOREFRONT_PREVIEW_UPDATE' && e.data?.component === 'section' && e.data?.id === 'category_showcase') {
        const data = e.data.data;
        if (data.eyebrow) setEyebrow(data.eyebrow);
        if (data.title) setTitle(data.title);
        if (data.description !== undefined) setDescription(data.description);
        if (data.selectedCategories) {
          setSelectedCategoryIds(data.selectedCategories.split(",").map((s: string) => s.trim().toLowerCase()).filter(Boolean));
        } else {
          setSelectedCategoryIds([]);
        }
        if (data.maxProducts) setMaxProducts(Number(data.maxProducts));
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    checkScrollability();
    const slider = sliderRef.current;
    if (slider) {
      slider.addEventListener('scroll', checkScrollability, { passive: true });
      window.addEventListener('resize', checkScrollability);
      return () => {
        slider.removeEventListener('scroll', checkScrollability);
        window.removeEventListener('resize', checkScrollability);
      };
    }
  }, [allCategories, selectedCategoryIds, checkScrollability]);

  // Helper to resolve an image for a category
  const getCategoryImage = (cat: CategoryItem) => {
    if (cat.thumbnail && cat.thumbnail.trim()) return cat.thumbnail;
    const text = `${cat.slug} ${cat.name}`.toLowerCase();
    if (text.includes("pant") || text.includes("trouser") || text.includes("denim") || text.includes("jeans")) {
      return (pantsImg as any).src || pantsImg;
    }
    if (text.includes("t-shirt") || text.includes("tshirt") || text.includes("tee") || text.includes("polo")) {
      return (tshirtImg as any).src || tshirtImg;
    }
    return (shirtImg as any).src || shirtImg;
  };

  // Helper for luxury tag label
  const getCategoryTag = (cat: CategoryItem, idx: number) => {
    if (cat.tag) return cat.tag;
    const tags = ["Signature", "Refined", "Essential", "Tailored", "Traditional", "Modern", "Curated", "Seasonal"];
    const text = `${cat.slug} ${cat.name}`.toLowerCase();
    if (text.includes("panjabi")) return "Traditional";
    if (text.includes("shirt")) return "Refined";
    if (text.includes("pant") || text.includes("trouser")) return "Tailored";
    if (text.includes("t-shirt") || text.includes("tee")) return "Everyday";
    if (text.includes("polo")) return "Casual";
    if (text.includes("jacket")) return "Outerwear";
    return tags[idx % tags.length];
  };

  // Filter categories based on admin selection or dynamic mode
  const baseList = allCategories;
  let displayCategories: CategoryItem[] = [];

  if (selectedCategoryIds.length > 0) {
    // Specific categories mode
    displayCategories = baseList.filter(c => {
      const slugLower = (c.slug || '').toLowerCase();
      const nameLower = (c.name || '').toLowerCase();
      const idLower = (c.id || '').toLowerCase();
      return selectedCategoryIds.some(sel => sel === slugLower || sel === nameLower || sel === idLower);
    });
    // If none matched, fallback to all
    if (displayCategories.length === 0) {
      displayCategories = baseList;
    }
  } else {
    // Dynamic (All categories) mode
    displayCategories = baseList;
  }

  // Slice to max categories limit
  displayCategories = displayCategories.slice(0, maxProducts || 8);

  // Mouse drag handlers for desktop smooth cursor dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!sliderRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - sliderRef.current.offsetLeft);
    setScrollLeft(sliderRef.current.scrollLeft);
    setDragDistance(0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !sliderRef.current) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    sliderRef.current.scrollLeft = scrollLeft - walk;
    setDragDistance(Math.abs(x - startX));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleCardClick = (e: React.MouseEvent, slug: string) => {
    if (dragDistance > 6) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    router.push(`/shop?category=${encodeURIComponent(slug)}`);
  };

  const scroll = (direction: 'left' | 'right') => {
    if (!sliderRef.current) return;
    const containerWidth = sliderRef.current.clientWidth;
    const scrollAmount = containerWidth > 768 ? containerWidth * 0.7 : containerWidth * 0.85;
    sliderRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  if (loading && allCategories.length === 0) {
    return (
      <section 
        id="categories"
        className="border-t border-border/40 bg-background py-3 sm:py-4 md:py-6 relative overflow-hidden select-none"
      >
        <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
          <div className="flex gap-3 sm:gap-4 md:gap-5 overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <div 
                key={i} 
                className="aspect-[4/5] min-w-0 flex-[0_0_46%] sm:flex-[0_0_45%] md:flex-[0_0_30%] lg:flex-[0_0_23%] xl:flex-[0_0_19%] rounded-xl sm:rounded-2xl bg-card/40 border border-border/30 animate-pulse" 
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!loading && displayCategories.length === 0) {
    return null;
  }

  return (
    <section 
      id="categories"
      className="border-t border-border/40 bg-background py-3 sm:py-4 md:py-6 relative overflow-hidden select-none"
    >
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 relative group/cat-slider">
        {/* Desktop Navigation Floating Buttons */}
        <button
          type="button"
          onClick={() => scroll('left')}
          disabled={!canScrollLeft}
          aria-label="Previous categories"
          className="absolute -left-2 sm:left-1 md:left-2 top-1/2 -translate-y-1/2 z-20 hidden md:flex h-10 w-10 items-center justify-center rounded-full border border-border/70 bg-card/90 text-cream backdrop-blur-md transition-all hover:border-gold hover:text-gold hover:scale-105 active:scale-95 disabled:opacity-0 disabled:pointer-events-none cursor-pointer shadow-lg"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => scroll('right')}
          disabled={!canScrollRight}
          aria-label="Next categories"
          className="absolute -right-2 sm:right-1 md:right-2 top-1/2 -translate-y-1/2 z-20 hidden md:flex h-10 w-10 items-center justify-center rounded-full border border-border/70 bg-card/90 text-cream backdrop-blur-md transition-all hover:border-gold hover:text-gold hover:scale-105 active:scale-95 disabled:opacity-0 disabled:pointer-events-none cursor-pointer shadow-lg"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Touch & Mouse Drag Slider Track (2 items per screen view on mobile) */}
        <div
          ref={sliderRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className={`flex gap-3 sm:gap-4 md:gap-5 lg:gap-6 overflow-x-auto scrollbar-none snap-x snap-mandatory pb-2 pt-1 touch-pan-x transition-colors transform-gpu ${
            isDragging ? "cursor-grabbing select-none" : "cursor-grab"
          }`}
          style={{ scrollBehavior: isDragging ? 'auto' : 'smooth', WebkitOverflowScrolling: 'touch', willChange: 'scroll-position' }}
        >
          {displayCategories.map((c, idx) => {
            const imgSrc = getCategoryImage(c);
            const tag = getCategoryTag(c, idx);
            const countText = c.count && c.count > 0 ? `${c.count} pieces` : "Explore";

            return (
              <div
                key={c.id || c.slug || idx}
                onClick={(e) => handleCardClick(e, c.slug)}
                className="group relative block overflow-hidden rounded-xl sm:rounded-2xl aspect-[4/5] shadow-luxe transition-transform duration-300 hover:-translate-y-1 min-w-0 flex-[0_0_46%] sm:flex-[0_0_45%] md:flex-[0_0_30%] lg:flex-[0_0_23%] xl:flex-[0_0_19%] snap-start shrink-0 cursor-pointer bg-card/60 border border-border/40 transform-gpu"
              >
                {/* Ambient Background Blur: matches image colors without letterbox voids */}
                <img
                  src={imgSrc}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover blur-lg scale-110 opacity-30 pointer-events-none select-none transform-gpu"
                />

                {/* Full Category Image: fully contained so no part of the image is cropped or cut */}
                <div className="relative h-full w-full flex items-center justify-center p-1 sm:p-2 z-10">
                  <img
                    src={imgSrc}
                    alt={c.name}
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                    className="max-h-full max-w-full w-auto h-auto object-contain transition-transform duration-700 group-hover:scale-105 pointer-events-none select-none drop-shadow-md transform-gpu"
                  />
                </div>

                {/* Card Bottom Details */}
                <div className="absolute inset-x-0 bottom-0 p-2.5 sm:p-3.5 md:p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-20">
                  <span className="inline-block text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.2em] text-gold mb-0.5 drop-shadow-sm">
                    {tag}
                  </span>
                  <div className="mt-0.5 flex items-end justify-between gap-1.5 sm:gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display text-sm sm:text-base md:text-xl text-cream tracking-tight truncate group-hover:text-gold transition-colors drop-shadow-md">
                        {c.name}
                      </h3>
                      <p className="mt-0.5 text-[10px] sm:text-xs text-cream/80 font-sans truncate drop-shadow-sm">
                        {countText}
                      </p>
                    </div>
                    <div className="flex h-6 w-6 sm:h-7 sm:w-7 md:h-9 md:w-9 shrink-0 items-center justify-center rounded-full border border-cream/30 text-cream transition-all duration-300 group-hover:border-gold group-hover:bg-gold group-hover:text-black group-hover:scale-105 shadow-sm">
                      <ArrowUpRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
