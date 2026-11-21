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

  // Filter products by category, using only dynamic data from the database
  const getProducts = (category: string) => {
    if (dynamicProducts && dynamicProducts.length > 0) {
      return dynamicProducts.filter((p) => p.category === category);
    }
    return [];
  };

  const dynamicShirts   = getProducts("shirt");
  const dynamicTshirts  = getProducts("tshirt");
  const dynamicPants    = getProducts("pant");
  const dynamicHats     = getProducts("hat");
  const dynamicPolos    = getProducts("polo");
  const dynamicJackets  = getProducts("jacket");
  const dynamicPanjabis = getProducts("panjabi");

  // Map section IDs to their components
  const SECTION_MAP: Record<string, React.ReactNode> = {
    hero_slider: <HeroSlider />,
    marquee: <Marquee />,
    new_arrivals: (
      <ProductSlider
        id="new"
        eyebrow="Just landed"
        title="New arrivals"
        description="Fresh drops from the atelier — hand-picked pieces to build your wardrobe."
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
        eyebrow="Shirt category"
        title="Shirts, tailored."
        description="From crisp oxfords to weekend linens — shirts made for every occasion."
        products={dynamicShirts}
        variant="default"
        isLoading={isProductsLoading}
      />
    ),
    tshirts: (
      <ProductSlider
        id="tshirts"
        eyebrow="T-Shirt category"
        title="Essential tees."
        description="Elevated basics in heavyweight cotton and premium blends."
        products={dynamicTshirts}
        variant="minimal"
        isLoading={isProductsLoading}
      />
    ),
    polos: (
      <ProductSlider
        id="polos"
        eyebrow="Polo collection"
        title="The perfect polo."
        description="Refined piqué and merino polos — a smarter alternative to the t-shirt."
        products={dynamicPolos}
        variant="default"
        isLoading={isProductsLoading}
      />
    ),
    pants: (
      <ProductSlider
        id="pants"
        eyebrow="Trouser category"
        title="Trousers & chinos."
        description="Precise cuts and considered fabrics — from tailored wool to everyday chinos."
        products={dynamicPants}
        variant="detailed"
        isLoading={isProductsLoading}
      />
    ),
    jackets: (
      <ProductSlider
        id="jackets"
        eyebrow="Outerwear"
        title="Jackets & coats."
        description="Statement outerwear designed for cold days and warm compliments."
        products={dynamicJackets}
        variant="default"
        isLoading={isProductsLoading}
      />
    ),
    hats: (
      <ProductSlider
        id="hats"
        eyebrow="Headwear"
        title="Hats & caps."
        description="Finish every look — from fedoras to flat caps, wool to leather."
        products={dynamicHats}
        variant="minimal"
        isLoading={isProductsLoading}
      />
    ),
    panjabi: (
      <ProductSlider
        id="panjabi"
        eyebrow="Traditional · Festive"
        title="The Panjabi edit."
        description="Traditional silhouettes reimagined with modern craft — for weddings, festivals, and every moment worth dressing for."
        products={dynamicPanjabis}
        variant="default"
        isLoading={isProductsLoading}
      />
    ),
    feature_strip: <FeatureStrip />,
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        {layout
          .filter(section => section.enabled)
          .map(section => {
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


