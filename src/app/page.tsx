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

// Default section order (shown if no layout saved yet)
const DEFAULT_LAYOUT = [
  { id: "hero_slider",   enabled: true },
  { id: "marquee",       enabled: true },
  { id: "new_arrivals",  enabled: true },
  { id: "discount",      enabled: true },
  { id: "categories",    enabled: true },
  { id: "shirts",        enabled: true },
  { id: "tshirts",       enabled: true },
  { id: "polos",         enabled: true },
  { id: "pants",         enabled: true },
  { id: "jackets",       enabled: true },
  { id: "hats",          enabled: true },
  { id: "panjabi",       enabled: true },
  { id: "feature_strip", enabled: true },
];

export default function Home() {
  const { data: dynamicProducts, isLoading: isProductsLoading } = useProducts();
  const [layout, setLayout] = useState(DEFAULT_LAYOUT);
  const [sectionsConfig, setSectionsConfig] = useState<Record<string, any>>({});

  // Load homepage layout config from backend
  useEffect(() => {
    fetch(`${API_ROOT}storefront/settings?key=homepage_layout&t=` + Date.now())
      .then(res => res.ok ? res.json() : null)
      .then(json => {
        if (json && Array.isArray(json.sections) && json.sections.length > 0) {
          setLayout(json.sections);
        }
      })
      .catch(() => {}); // fallback to DEFAULT_LAYOUT
  }, []);

  // Load section configs (titles, descriptions, categories) from backend
  useEffect(() => {
    fetch(`${API_ROOT}storefront/sections?t=` + Date.now())
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && typeof data === 'object') {
          setSectionsConfig(data);
        }
      })
      .catch(() => {});
  }, []);

  // Intelligent category matcher: handles custom storefront assignments & smart built-in detection
  const matchCategory = (p: Product, sectionKey: string): boolean => {
    // 1. If storefront section config has an explicit category assigned:
    const customCat = sectionsConfig[sectionKey]?.category;
    if (customCat && customCat !== '') {
      if (customCat === 'all') return true;
      const target = customCat.toLowerCase().trim();
      const pCat = (p.category || '').toLowerCase().trim();
      const pSlug = (p.categorySlug || '').toLowerCase().trim();
      const pId = (p.categoryId || '').toString().trim();
      const pSub = (p.subCategory || '').toLowerCase().trim();
      const pParent = (p.parentCategory || '').toLowerCase().trim();
      if (
        pCat === target || 
        pSlug === target || 
        pId === target || 
        pSub === target || 
        pParent === target ||
        (pCat && target && (pCat.includes(target) || target.includes(pCat))) ||
        (pSlug && target && (pSlug.includes(target) || target.includes(pSlug)))
      ) {
        return true;
      }
    }

    // 2. Built-in smart matching for standard section keys:
    const nameLower = (p.name || '').toLowerCase();
    const catLower = (p.category || '').toLowerCase().trim();
    const slugLower = (p.categorySlug || '').toLowerCase().trim();
    const subLower = (p.subCategory || '').toLowerCase().trim();
    const allCatTexts = `${catLower} ${slugLower} ${subLower}`;

    switch (sectionKey) {
      case 'shirts':
        // Must match shirt/shirts but exclude t-shirt / tshirt
        if (
          nameLower.includes('t-shirt') || 
          nameLower.includes('tshirt') || 
          allCatTexts.includes('t-shirt') || 
          allCatTexts.includes('tshirt')
        ) {
          return false;
        }
        return (
          allCatTexts.includes('shirt') ||
          nameLower.includes('shirt')
        );

      case 'tshirts':
        return (
          allCatTexts.includes('t-shirt') ||
          allCatTexts.includes('tshirt') ||
          allCatTexts.includes('tee') ||
          nameLower.includes('t-shirt') ||
          nameLower.includes('tshirt')
        );

      case 'polos':
        return (
          allCatTexts.includes('polo') ||
          nameLower.includes('polo')
        );

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
            // For category product sliders, if loading has finished and there are no products, omit the empty section
            if (!isProductsLoading && dynamicProducts && dynamicProducts.length > 0) {
              const categorySectionKeys = ['shirts', 'tshirts', 'polos', 'pants', 'jackets', 'hats', 'panjabi'];
              if (categorySectionKeys.includes(section.id)) {
                const prods = getProductsForSection(section.id);
                if (prods.length === 0) return null;
              }
            }

            const component = SECTION_MAP[section.id];
            if (!component) return null;
            return (
              <div key={section.id}>
                {component}
              </div>
            );
          })}
      </main>
      <Footer />
    </div>
  );
}
