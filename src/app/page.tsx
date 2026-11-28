"use client";

import { Header } from "@/components/store/Header";
import { HeroSlider } from "@/components/store/HeroSlider";
import { Marquee } from "@/components/store/Marquee";
import { ProductSlider } from "@/components/store/ProductSlider";
import { DiscountSection } from "@/components/store/DiscountSection";
import { CategoryShowcase } from "@/components/store/CategoryShowcase";
import { FeatureStrip } from "@/components/store/FeatureStrip";
import { Footer } from "@/components/store/Footer";
import { useProducts } from "@/hooks/useProducts";
import { useEffect, useState } from "react";
import { API_ROOT } from "@/lib/api";
import type { Product } from "@/components/store/products";

// Cache keys for instant load on reload without content flash
const LAYOUT_CACHE_KEY = "rimal_homepage_layout_cache";
const SECTIONS_CACHE_KEY = "rimal_sections_config_cache";

// Default section order (clean active defaults matching actual catalog)
const DEFAULT_LAYOUT = [
  { id: "hero_slider",   enabled: true },
  { id: "marquee",       enabled: true },
  { id: "categories",    enabled: true },
  { id: "shirts",        enabled: true },
  { id: "tshirts",       enabled: true },
  { id: "pants",         enabled: true },
];

export default function Home() {
  const { data: dynamicProducts, isLoading: isProductsLoading } = useProducts();
  
  // Instant load from cached settings to eliminate reload flash
  const [layout, setLayout] = useState<any[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(LAYOUT_CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
          if (parsed && Array.isArray(parsed.sections) && parsed.sections.length > 0) return parsed.sections;
        }
      } catch (e) {}
    }
    return DEFAULT_LAYOUT;
  });

  const [sectionsConfig, setSectionsConfig] = useState<Record<string, any>>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(SECTIONS_CACHE_KEY);
        if (cached) return JSON.parse(cached);
      } catch (e) {}
    }
    return {};
  });

  // Load homepage layout config from backend
  useEffect(() => {
    fetch(`${API_ROOT}storefront/settings?key=homepage_layout&t=` + Date.now())
      .then(res => res.ok ? res.json() : null)
      .then(json => {
        if (json && Array.isArray(json.sections) && json.sections.length > 0) {
          setLayout(json.sections);
          try {
            localStorage.setItem(LAYOUT_CACHE_KEY, JSON.stringify(json.sections));
          } catch (e) {}
        }
      })
      .catch(() => {});
  }, []);

  // Load section configs (titles, descriptions, categories) from backend
  useEffect(() => {
    fetch(`${API_ROOT}storefront/sections?t=` + Date.now())
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && typeof data === 'object') {
          setSectionsConfig(data);
          try {
            localStorage.setItem(SECTIONS_CACHE_KEY, JSON.stringify(data));
          } catch (e) {}
        }
      })
      .catch(() => {});
  }, []);

  // Strict helpers to separate T-Shirts, regular Shirts, and Polos
  const isTShirt = (p: Product): boolean => {
    const name = (p.name || '').toLowerCase();
    const cat = (p.category || '').toLowerCase().trim();
    const slug = (p.categorySlug || '').toLowerCase().trim();
    const sub = (p.subCategory || '').toLowerCase().trim();
    const id = (p.categoryId || '').toString().trim();

    if (id === '6b08013b8e40cffba6385778') return true;
    if (['t-shirt', 't-shirts', 'tshirt', 'tshirts', 'tee', 'tees'].includes(slug)) return true;
    if (['t-shirt', 't-shirts', 'tshirt', 'tshirts', 'tee', 'tees'].includes(cat)) return true;
    if (['t-shirt', 't-shirts', 'tshirt', 'tshirts', 'tee', 'tees'].includes(sub)) return true;
    if (/\b(t-shirt|t-shirts|tshirt|tshirts|tee|tees)\b/i.test(name)) return true;
    if (/\b(t-shirt|t-shirts|tshirt|tshirts)\b/i.test(`${cat} ${slug} ${sub}`)) return true;

    return false;
  };

  const isPolo = (p: Product): boolean => {
    const name = (p.name || '').toLowerCase();
    const cat = (p.category || '').toLowerCase().trim();
    const slug = (p.categorySlug || '').toLowerCase().trim();
    const sub = (p.subCategory || '').toLowerCase().trim();

    if (slug.includes('polo') || cat.includes('polo') || sub.includes('polo')) return true;
    if (/\bpolo\b/i.test(name)) return true;
    return false;
  };

  const isShirt = (p: Product): boolean => {
    if (isTShirt(p) || isPolo(p)) return false;

    const name = (p.name || '').toLowerCase();
    const cat = (p.category || '').toLowerCase().trim();
    const slug = (p.categorySlug || '').toLowerCase().trim();
    const sub = (p.subCategory || '').toLowerCase().trim();
    const id = (p.categoryId || '').toString().trim();

    if (id === '6ad4f6136c1a1b58e4bcdc82') return true;
    if (['shirt', 'shirts'].includes(slug)) return true;
    if (['shirt', 'shirts'].includes(cat)) return true;
    if (['shirt', 'shirts'].includes(sub)) return true;
    if (/\b(shirt|shirts)\b/i.test(name)) return true;
    if (/\b(shirt|shirts)\b/i.test(`${cat} ${slug} ${sub}`)) return true;

    return false;
  };

  // Intelligent category matcher: handles custom storefront assignments & smart built-in detection
  const matchCategory = (p: Product, sectionKey: string): boolean => {
    // 1. Strict handling for standard apparel sections:
    if (sectionKey === 'shirts') {
      if (isTShirt(p) || isPolo(p)) return false;
      const customCat = sectionsConfig[sectionKey]?.category;
      if (customCat && customCat !== '' && customCat !== 'all') {
        const target = customCat.toLowerCase().trim();
        const pCat = (p.category || '').toLowerCase().trim();
        const pSlug = (p.categorySlug || '').toLowerCase().trim();
        const pId = (p.categoryId || '').toString().trim();
        const pSub = (p.subCategory || '').toLowerCase().trim();
        if (pCat === target || pSlug === target || pId === target || pSub === target) return true;
      }
      return isShirt(p);
    }

    if (sectionKey === 'tshirts') {
      if (isShirt(p) || isPolo(p)) return false;
      const customCat = sectionsConfig[sectionKey]?.category;
      if (customCat && customCat !== '' && customCat !== 'all') {
        const target = customCat.toLowerCase().trim();
        const pCat = (p.category || '').toLowerCase().trim();
        const pSlug = (p.categorySlug || '').toLowerCase().trim();
        const pId = (p.categoryId || '').toString().trim();
        const pSub = (p.subCategory || '').toLowerCase().trim();
        if (pCat === target || pSlug === target || pId === target || pSub === target) return true;
      }
      return isTShirt(p);
    }

    if (sectionKey === 'polos') {
      if (isShirt(p) || isTShirt(p)) return false;
      return isPolo(p);
    }

    // 2. Custom category assignment from Storefront Admin for other sections:
    const customCat = sectionsConfig[sectionKey]?.category;
    if (customCat && customCat !== '') {
      if (customCat === 'all') return true;
      const target = customCat.toLowerCase().trim();
      const pCat = (p.category || '').toLowerCase().trim();
      const pSlug = (p.categorySlug || '').toLowerCase().trim();
      const pId = (p.categoryId || '').toString().trim();
      const pSub = (p.subCategory || '').toLowerCase().trim();
      const pParent = (p.parentCategory || '').toLowerCase().trim();

      // Enforce strict separation if target is shirt or t-shirt
      if (['shirt', 'shirts'].includes(target)) {
        if (isTShirt(p) || isPolo(p)) return false;
        return isShirt(p);
      }
      if (['t-shirt', 't-shirts', 'tshirt', 'tshirts', 'tee'].includes(target)) {
        if (isShirt(p) || isPolo(p)) return false;
        return isTShirt(p);
      }

      if (
        pCat === target || 
        pSlug === target || 
        pId === target || 
        pSub === target || 
        pParent === target
      ) {
        return true;
      }

      // Partial match for non-shirt categories (e.g. trousers, denim, etc.)
      if (
        !target.includes('shirt') &&
        ((pCat && (pCat.includes(target) || target.includes(pCat))) ||
         (pSlug && (pSlug.includes(target) || target.includes(pSlug))))
      ) {
        return true;
      }
    }

    // 3. Built-in smart matching for standard section keys:
    const nameLower = (p.name || '').toLowerCase();
    const catLower = (p.category || '').toLowerCase().trim();
    const slugLower = (p.categorySlug || '').toLowerCase().trim();
    const subLower = (p.subCategory || '').toLowerCase().trim();
    const allCatTexts = `${catLower} ${slugLower} ${subLower}`;

    switch (sectionKey) {
      case 'shirts':
        return isShirt(p);

      case 'tshirts':
        return isTShirt(p);

      case 'polos':
        return isPolo(p);

      case 'pants':
        return (
          allCatTexts.includes('pant') ||
          allCatTexts.includes('trouser') ||
          allCatTexts.includes('denim') ||
          allCatTexts.includes('jeans') ||
          allCatTexts.includes('chino') ||
          nameLower.includes('pant') ||
          nameLower.includes('trouser') ||
          nameLower.includes('denim') ||
          nameLower.includes('jeans')
        );

      case 'jackets':
        return (
          allCatTexts.includes('jacket') ||
          allCatTexts.includes('coat') ||
          allCatTexts.includes('blazer') ||
          allCatTexts.includes('outerwear') ||
          nameLower.includes('jacket') ||
          nameLower.includes('coat')
        );

      case 'hats':
        return (
          allCatTexts.includes('hat') ||
          allCatTexts.includes('cap') ||
          nameLower.includes('hat') ||
          nameLower.includes('cap')
        );

      case 'panjabi':
        return (
          allCatTexts.includes('panjabi') ||
          allCatTexts.includes('punjabi') ||
          allCatTexts.includes('kurta') ||
          nameLower.includes('panjabi') ||
          nameLower.includes('punjabi') ||
          nameLower.includes('kurta')
        );

      default:
        return allCatTexts.includes(sectionKey.toLowerCase());
    }
  };

  const getProductsForSection = (sectionKey: string): Product[] => {
    if (!dynamicProducts || dynamicProducts.length === 0) return [];
    const max = sectionsConfig[sectionKey]?.maxProducts || 12;
    return dynamicProducts.filter((p) => matchCategory(p, sectionKey)).slice(0, max);
  };

  const dynamicShirts   = getProductsForSection("shirts");
  const dynamicTshirts  = getProductsForSection("tshirts");
  const dynamicPants    = getProductsForSection("pants");
  const dynamicHats     = getProductsForSection("hats");
  const dynamicPolos    = getProductsForSection("polos");
  const dynamicJackets  = getProductsForSection("jackets");
  const dynamicPanjabis = getProductsForSection("panjabi");

  // Map section IDs to their components with dynamic section customization
  const SECTION_MAP: Record<string, React.ReactNode> = {
    hero_slider: <HeroSlider />,
    marquee: <Marquee />,
    new_arrivals: (
      <ProductSlider
        id="new"
        eyebrow={sectionsConfig['new']?.eyebrow || "Just landed"}
        title={sectionsConfig['new']?.title || "New arrivals"}
        description={sectionsConfig['new']?.description || "Fresh drops from the atelier — hand-picked pieces to build your wardrobe."}
        products={dynamicProducts || []}
        variant="default"
        isLoading={isProductsLoading}
      />
    ),
    discount: <DiscountSection />,
    categories: <CategoryShowcase />,
    shirts: (
      <ProductSlider
        id="shirts"
        products={dynamicShirts}
        variant="default"
        isLoading={isProductsLoading}
        hideHeader
      />
    ),
    tshirts: (
      <ProductSlider
        id="tshirts"
        products={dynamicTshirts}
        variant="minimal"
        isLoading={isProductsLoading}
        hideHeader
      />
    ),
    polos: (
      <ProductSlider
        id="polos"
        products={dynamicPolos}
        variant="default"
        isLoading={isProductsLoading}
        hideHeader
      />
    ),
    pants: (
      <ProductSlider
        id="pants"
        products={dynamicPants}
        variant="detailed"
        isLoading={isProductsLoading}
        hideHeader
      />
    ),
    jackets: (
      <ProductSlider
        id="jackets"
        products={dynamicJackets}
        variant="default"
        isLoading={isProductsLoading}
        hideHeader
      />
    ),
    hats: (
      <ProductSlider
        id="hats"
        products={dynamicHats}
        variant="minimal"
        isLoading={isProductsLoading}
        hideHeader
      />
    ),
    panjabi: (
      <ProductSlider
        id="panjabi"
        products={dynamicPanjabis}
        variant="default"
        isLoading={isProductsLoading}
        hideHeader
      />
    ),
    feature_strip: <FeatureStrip />,
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        {layout
          .filter(section => {
            if (sectionsConfig[section.id]?.enabled === false) return false;
            if (sectionsConfig[section.id]?.enabled === true) return true;
            return section.enabled;
          })
          .map(section => {
            // For category product sliders, omit empty sections to avoid flashing on reload
            const categorySectionKeys = ['shirts', 'tshirts', 'polos', 'pants', 'jackets', 'hats', 'panjabi'];
            if (categorySectionKeys.includes(section.id)) {
              const prods = getProductsForSection(section.id);
              if (prods.length === 0) return null;
            }

            const component = SECTION_MAP[section.id];
            if (component) {
              return (
                <div key={section.id}>
                  {component}
                </div>
              );
            }

            // Dynamic Custom Product Section added from Storefront Admin
            const prods = getProductsForSection(section.id);
            if (prods.length === 0) return null;

            return (
              <div key={section.id}>
                <ProductSlider
                  id={section.id}
                  products={prods}
                  variant="default"
                  isLoading={isProductsLoading}
                  hideHeader
                />
              </div>
            );
          })}
      </main>
      <Footer />
    </div>
  );
}
