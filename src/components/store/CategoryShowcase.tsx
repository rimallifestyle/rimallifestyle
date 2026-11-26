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

const FALLBACK_CATEGORIES: CategoryItem[] = [
  { id: "shirt", name: "Shirts", slug: "shirt", count: 24, tag: "Refined", thumbnail: (shirtImg as any).src || shirtImg },
  { id: "panjabi", name: "Panjabis", slug: "panjabi", count: 18, tag: "Traditional", thumbnail: (shirtImg as any).src || shirtImg },
  { id: "tshirt", name: "T-Shirts", slug: "t-shirt", count: 20, tag: "Everyday", thumbnail: (tshirtImg as any).src || tshirtImg },
  { id: "pant", name: "Trousers", slug: "trouser", count: 16, tag: "Tailored", thumbnail: (pantsImg as any).src || pantsImg },
  { id: "polo", name: "Polo Shirts", slug: "polo", count: 12, tag: "Casual", thumbnail: (tshirtImg as any).src || tshirtImg },
  { id: "jacket", name: "Jackets", slug: "jacket", count: 8, tag: "Outerwear", thumbnail: (pantsImg as any).src || pantsImg },
  { id: "hat", name: "Hats & Caps", slug: "hat", count: 6, tag: "Accessories", thumbnail: (shirtImg as any).src || shirtImg },
];

export function CategoryShowcase() {
  const router = useRouter();
  const [eyebrow, setEyebrow] = useState("Curated Selections");
  const [title, setTitle] = useState("The Rimal wardrobe, considered.");
  const [description, setDescription] = useState("");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [maxProducts, setMaxProducts] = useState(8);
  const [allCategories, setAllCategories] = useState<CategoryItem[]>([]);
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
        }
      })
      .catch(console.error);

    // 2. Fetch live categories from backend
    fetch(`${API_ROOT}storefront/categories?t=` + Date.now())
      .then(res => res.ok ? res.json() : null)
      .then((cats) => {
        if (Array.isArray(cats) && cats.length > 0) {
          const formatted: CategoryItem[] = cats.map((c: any) => ({
            id: c.id || c._id || c.slug,
            name: c.name || "Category",
            slug: c.slug || c.name?.toLowerCase().replace(/\s+/g, '-') || "shop",
            thumbnail: c.thumbnail || "",
            count: typeof c.count === 'number' ? c.count : 0,
            description: c.description || "",
          }));
          setAllCategories(formatted);
        } else {
          setAllCategories(FALLBACK_CATEGORIES);
        }
      })
      .catch(() => {
        setAllCategories(FALLBACK_CATEGORIES);
      })
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
  const baseList = allCategories.length > 0 ? allCategories : FALLBACK_CATEGORIES;
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

  if (!loading && displayCategories.length === 0) {
    return null;
  }

  return (
    <section 
      id="categories"
      className="border-t border-border/40 bg-background py-16 md:py-24 relative overflow-hidden select-none"
    >
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        {/* Header with Title and Slider Navigation Buttons */}
        <div className="mb-8 md:mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            {eyebrow && (
              <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.35em] text-gold">
                {eyebrow}
              </p>
            )}
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-cream tracking-tight">
              {title}
            </h2>
            {description && (
              <p className="mt-2 text-sm text-muted-foreground max-w-xl">
                {description}
              </p>
            )}
          </div>

          {/* Desktop & Mobile Navigation Buttons */}
          <div className="flex items-center gap-2 self-start md:self-end shrink-0">
            <button
              type="button"
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              aria-label="Previous categories"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-border/70 bg-card/60 text-cream backdrop-blur-sm transition-all hover:border-gold hover:text-gold active:scale-95 disabled:opacity-30 disabled:pointer-events-none cursor-pointer shadow-sm"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              aria-label="Next categories"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-border/70 bg-card/60 text-cream backdrop-blur-sm transition-all hover:border-gold hover:text-gold active:scale-95 disabled:opacity-30 disabled:pointer-events-none cursor-pointer shadow-sm"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Touch & Mouse Drag Slider Track */}
        <div
          ref={sliderRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className={`flex gap-4 sm:gap-5 md:gap-6 overflow-x-auto scrollbar-none snap-x snap-mandatory pb-4 pt-1 transition-colors ${
            isDragging ? "cursor-grabbing select-none" : "cursor-grab"
          }`}
          style={{ scrollBehavior: isDragging ? 'auto' : 'smooth' }}
        >
          {displayCategories.map((c, idx) => {
            const imgSrc = getCategoryImage(c);
            const tag = getCategoryTag(c, idx);
            const countText = c.count && c.count > 0 ? `${c.count} pieces` : "Explore Collection";

            return (
              <div
                key={c.id || c.slug || idx}
                onClick={(e) => handleCardClick(e, c.slug)}
                className="group relative block overflow-hidden rounded-2xl bg-secondary shadow-luxe transition-transform duration-300 hover:-translate-y-1 min-w-0 flex-[0_0_80%] sm:flex-[0_0_46%] md:flex-[0_0_31%] lg:flex-[0_0_27%] xl:flex-[0_0_23%] snap-start shrink-0 cursor-pointer"
              >
                {/* Image Container */}
                <div className="aspect-[3/4] w-full overflow-hidden bg-muted">
                  <img
                    src={imgSrc}
                    alt={c.name}
                    loading="lazy"
                    draggable={false}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 pointer-events-none select-none"
                  />
                </div>

                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-maroon-deep/95 via-maroon-deep/30 to-transparent pointer-events-none" />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors pointer-events-none" />

                {/* Card Bottom Details */}
                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 md:p-7">
                  <span className="inline-block text-[10px] font-semibold uppercase tracking-[0.25em] text-gold mb-1">
                    {tag}
                  </span>
                  <div className="mt-1 flex items-end justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-display text-2xl sm:text-3xl md:text-3xl text-cream tracking-tight truncate group-hover:text-gold transition-colors">
                        {c.name}
                      </h3>
                      <p className="mt-1 text-xs text-cream/70 font-sans">
                        {countText}
                      </p>
                    </div>
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-cream/30 text-cream transition-all duration-300 group-hover:border-gold group-hover:bg-gold group-hover:text-black group-hover:scale-105 shadow-sm">
                      <ArrowUpRight className="h-5 w-5" />
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
