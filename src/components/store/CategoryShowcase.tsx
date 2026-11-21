import { useEffect, useState } from "react";
import { API_ROOT } from "@/lib/api";
import { ArrowUpRight } from "lucide-react";
import shirtImg from "@/assets/cat-shirt.jpg";
import tshirtImg from "@/assets/cat-tshirt.jpg";
import pantsImg from "@/assets/cat-pants.jpg";

// Added more placeholder images or reuse existing ones for demonstration
const allCategories = [
  { id: "shirt", title: "Shirts", count: "24 pieces", sales: 120, img: (shirtImg as any).src || shirtImg, href: "#shirts", tag: "Refined" },
  { id: "tshirt", title: "T-Shirts", count: "18 pieces", sales: 240, img: (tshirtImg as any).src || tshirtImg, href: "#tshirts", tag: "Everyday" },
  { id: "pant", title: "Trousers", count: "16 pieces", sales: 90, img: (pantsImg as any).src || pantsImg, href: "#pants", tag: "Tailored" },
  { id: "hat", title: "Hats", count: "8 pieces", sales: 45, img: (shirtImg as any).src || shirtImg, href: "#hats", tag: "Accessories" }, // reused img
  { id: "polo", title: "Polo Shirts", count: "12 pieces", sales: 180, img: (tshirtImg as any).src || tshirtImg, href: "#polo", tag: "Casual" }, // reused img
  { id: "jacket", title: "Jackets", count: "5 pieces", sales: 60, img: (pantsImg as any).src || pantsImg, href: "#jackets", tag: "Outerwear" }, // reused img
  { id: "panjabi", title: "Panjabis", count: "10 pieces", sales: 210, img: (shirtImg as any).src || shirtImg, href: "#panjabis", tag: "Traditional" }, // reused img
];

export function CategoryShowcase() {
  const [eyebrow, setEyebrow] = useState("Curated Selections");
  const [title, setTitle] = useState("The Rimal wardrobe, considered.");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(["shirt", "tshirt", "pant"]);
  const [sortBy, setSortBy] = useState("manual");
  const [maxProducts, setMaxProducts] = useState(3);

  useEffect(() => {
    // Initial fetch
    fetch(`${API_ROOT}storefront/sections?id=category_showcase`)
      .then(res => res.ok ? res.json() : null)
      .then((data) => {
        if (data && !data.error) {
          setEyebrow(data.eyebrow || "Curated Selections");
          setTitle(data.title || "The Rimal wardrobe, considered.");
          if (data.selectedCategories) {
            setSelectedCategoryIds(data.selectedCategories.split(",").filter(Boolean));
          }
          if (data.sortBy) setSortBy(data.sortBy);
          if (data.maxProducts) setMaxProducts(data.maxProducts);
        }
      })
      .catch(console.error);

    // Listen for live updates
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'STOREFRONT_PREVIEW_UPDATE' && e.data?.component === 'section' && e.data?.id === 'category_showcase') {
        const data = e.data.data;
        setEyebrow(data.eyebrow);
        setTitle(data.title);
        if (data.selectedCategories) {
          setSelectedCategoryIds(data.selectedCategories.split(",").filter(Boolean));
        }
        if (data.sortBy) setSortBy(data.sortBy);
        if (data.maxProducts) setMaxProducts(data.maxProducts);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleCategoryClick = () => {};

  // Filter and sort categories
  let displayCategories = selectedCategoryIds.map(id => allCategories.find(c => c.id === id)).filter(Boolean) as typeof allCategories;
  
  if (sortBy === 'sales') {
    // Sort by mocked sales data descending
    displayCategories.sort((a, b) => b.sales - a.sales);
  }

  // Apply max categories limit
  displayCategories = displayCategories.slice(0, maxProducts || 3);

  return (
    <section 
      id="categories"
      className="border-t border-border/40 bg-background py-20 md:py-28 relative"
      onClick={handleCategoryClick}
    >
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        <div className="mb-12 max-w-2xl">
          {eyebrow && (
            <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.35em] text-gold">
              {eyebrow}
            </p>
          )}
          <h2 className="font-display text-3xl md:text-5xl">{title}</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
          {displayCategories.map((c) => (
            <a
              key={c.title}
              href={c.href}
              onClick={(e) => {}}
              className="group relative block overflow-hidden bg-secondary shadow-luxe"
            >
              <div className="aspect-[3/4] w-full overflow-hidden bg-muted">
                <img
                  src={c.img}
                  alt={c.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-maroon-deep/95 via-maroon-deep/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-gold">
                  {c.tag}
                </span>
                <div className="mt-2 flex items-end justify-between">
                  <div>
                    <h3 className="font-display text-3xl text-cream md:text-4xl">{c.title}</h3>
                    <p className="mt-1 text-xs text-cream/70">{c.count}</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-cream/40 text-cream transition group-hover:border-gold group-hover:bg-gold group-hover:text-accent-foreground">
                    <ArrowUpRight className="h-5 w-5" />
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}


