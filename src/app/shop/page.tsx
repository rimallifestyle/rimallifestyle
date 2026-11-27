"use client";
import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

import { Header } from "@/components/store/Header";
import { Footer } from "@/components/store/Footer";
import { ProductCard, ProductCardSkeleton } from "@/components/store/ProductCard";
import { useProducts } from "@/hooks/useProducts";
import { Filter, ChevronDown, ChevronRight, Check, X, Star, Layers } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import bannerImg from "@/assets/banner-3.jpg";

export interface CategoryTreeItem {
  id: string;
  name: string;
  slug: string;
  parent: string;
  parentName?: string;
  parentSlug?: string;
  subcategories?: CategoryTreeItem[];
}

const sortOptions = [
  { id: "newest", label: "Newest Arrivals" },
  { id: "price_asc", label: "Price: Low to High" },
  { id: "price_desc", label: "Price: High to Low" },
  { id: "rating", label: "Top Rated" },
];

function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search") || searchParams.get("q") || "";
  const { data: allDynamicProducts, isLoading: isProductsLoading } = useProducts();
  const productsList = allDynamicProducts || [];

  const [categoryTree, setCategoryTree] = useState<CategoryTreeItem[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [expandedParents, setExpandedParents] = useState<Record<string, boolean>>({});
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500000]);
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>("newest");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(12);

  // Fetch categories tree with parent & subcategories
  useEffect(() => {
    fetch('/api/storefront/categories')
      .then(res => res.ok ? res.json() : [])
      .then((tree: CategoryTreeItem[]) => {
        if (Array.isArray(tree)) {
          setCategoryTree(tree);
          // By default expand all parents that have subcategories
          const initialExpanded: Record<string, boolean> = {};
          tree.forEach(c => {
            if (c.subcategories && c.subcategories.length > 0) {
              initialExpanded[c.id] = true;
              initialExpanded[c.name.toLowerCase()] = true;
            }
          });
          setExpandedParents(prev => ({ ...initialExpanded, ...prev }));
        }
      })
      .catch(console.error);
  }, []);

  // Sync URL search params with active category & subcategory filters
  useEffect(() => {
    const catParam = searchParams.get("category");
    const subParam = searchParams.get("subCategory") || searchParams.get("sub");

    if (subParam) {
      setSelectedCategories([subParam]);
    } else if (catParam && catParam.toLowerCase() !== "all" && catParam.toLowerCase() !== "new") {
      setSelectedCategories([catParam]);
    }
  }, [searchParams]);

  // Count products for each category/subcategory
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    productsList.forEach(p => {
      const keys = [
        p.parentCategory?.toLowerCase(),
        p.subCategory?.toLowerCase(),
        p.category?.toLowerCase()
      ].filter(Boolean) as string[];

      keys.forEach(k => {
        counts[k] = (counts[k] || 0) + 1;
      });
    });
    return counts;
  }, [productsList]);

  const toggleParentExpand = (key: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedParents(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const toggleCategory = (catNameOrSlug: string) => {
    setSelectedCategories((prev) => {
      const exists = prev.some(c => c.toLowerCase() === catNameOrSlug.toLowerCase());
      if (exists) {
        return prev.filter(c => c.toLowerCase() !== catNameOrSlug.toLowerCase());
      } else {
        return [...prev, catNameOrSlug];
      }
    });
    setVisibleCount(12);
  };

  const handleClearFilters = () => {
    setSelectedCategories([]);
    setPriceRange([0, 500000]);
    setMinRating(0);
    setVisibleCount(12);
  };

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    let filtered = [...productsList];

    // Search Query Filter from URL
    if (searchQuery.trim()) {
      const qTerms = searchQuery.toLowerCase().trim().split(/\s+/).filter(Boolean);
      filtered = filtered.filter((p) => {
        const text = `${p.name || ''} ${p.category || ''} ${p.subCategory || ''} ${p.parentCategory || ''} ${p.description || ''} ${p.sku || ''}`.toLowerCase();
        return qTerms.every(term => text.includes(term));
      });
    }

    // Category / Subcategory Filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((p) => {
        const pCat = p.category?.toLowerCase() || "";
        const pParent = p.parentCategory?.toLowerCase() || "";
        const pSub = p.subCategory?.toLowerCase() || "";

        return selectedCategories.some((selected) => {
          const s = selected.toLowerCase();

          // Direct match with product's subCategory, parentCategory, or category
          if (pSub === s || pParent === s || pCat === s) return true;

          // Check if selected is a parent category and product belongs to it
          const matchedParent = categoryTree.find(
            (c) => c.name.toLowerCase() === s || c.slug.toLowerCase() === s
          );
          if (matchedParent) {
            if (pParent === matchedParent.name.toLowerCase()) return true;
            if (matchedParent.subcategories?.some(
              (sub) => sub.name.toLowerCase() === pSub || sub.name.toLowerCase() === pCat
            )) {
              return true;
            }
          }

          // Check if selected is a subcategory and matches product
          for (const parent of categoryTree) {
            const matchedSub = parent.subcategories?.find(
              (sub) => sub.name.toLowerCase() === s || sub.slug.toLowerCase() === s
            );
            if (matchedSub) {
              if (pSub === matchedSub.name.toLowerCase() || pCat === matchedSub.name.toLowerCase()) {
                return true;
              }
            }
          }

          return false;
        });
      });
    }

    // Price Filter
    filtered = filtered.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);

    // Rating Filter
    if (minRating > 0) {
      filtered = filtered.filter((p) => (p.rating || 0) >= minRating);
    }

    // Sorting
    switch (sortBy) {
      case "price_asc":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "newest":
      default:
        filtered.sort((a, b) => {
          if (a.tag === "New" && b.tag !== "New") return -1;
          if (a.tag !== "New" && b.tag === "New") return 1;
          return 0;
        });
        break;
    }

    return filtered;
  }, [searchQuery, selectedCategories, priceRange, minRating, sortBy, productsList, categoryTree]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

  const isCatSelected = (nameOrSlug: string) => {
    return selectedCategories.some(c => c.toLowerCase() === nameOrSlug.toLowerCase());
  };

  const FilterSidebar = () => (
    <div className="flex flex-col gap-8 w-full">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-xl text-gold">Filters</h3>
        {(selectedCategories.length > 0 ||
          priceRange[0] > 0 ||
          priceRange[1] < 500000 ||
          minRating > 0) && (
          <button
            onClick={handleClearFilters}
            className="text-xs text-muted-foreground hover:text-gold uppercase tracking-widest font-bold transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Categories & Subcategories Tree */}
      <div className="border-t border-border/40 pt-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Layers className="w-4 h-4 text-gold/70" />
            Categories & Subcategories
          </h4>
        </div>

        <div className="flex flex-col gap-2.5">
          {categoryTree.map((parentCat) => {
            const hasSubs = parentCat.subcategories && parentCat.subcategories.length > 0;
            const isExpanded = !!expandedParents[parentCat.id] || !!expandedParents[parentCat.name.toLowerCase()];
            const parentSelected = isCatSelected(parentCat.name) || isCatSelected(parentCat.slug);
            const pCount = categoryCounts[parentCat.name.toLowerCase()] || 0;

            return (
              <div key={parentCat.id} className="flex flex-col rounded-xl bg-white/[0.02] border border-white/5 p-2 transition-all">
                {/* Parent Row */}
                <div className="flex items-center justify-between gap-2">
                  <label className="flex items-center gap-2.5 cursor-pointer flex-1 group min-w-0">
                    <div
                      onClick={() => toggleCategory(parentCat.name)}
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${
                        parentSelected ? "bg-gold border-gold" : "border-border/60 group-hover:border-gold"
                      }`}
                    >
                      {parentSelected && <Check className="w-3 h-3 text-background stroke-[3]" />}
                    </div>
                    <span
                      onClick={() => toggleCategory(parentCat.name)}
                      className={`text-sm truncate transition-colors font-medium ${
                        parentSelected ? "text-gold font-semibold" : "text-foreground/90 group-hover:text-gold"
                      }`}
                    >
                      {parentCat.name}
                    </span>
                    {pCount > 0 && (
                      <span className="text-[10px] font-mono text-muted-foreground/70 bg-white/5 px-1.5 py-0.5 rounded">
                        {pCount}
                      </span>
                    )}
                  </label>

                  {/* Expand/Collapse Toggle if has subcategories */}
                  {hasSubs && (
                    <button
                      type="button"
                      onClick={(e) => toggleParentExpand(parentCat.id, e)}
                      title={isExpanded ? "Collapse subcategories" : "Expand subcategories"}
                      className="p-1 rounded-md text-muted-foreground hover:text-gold hover:bg-white/5 transition-colors shrink-0"
                    >
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  )}
                </div>

                {/* Subcategories (Nested) */}
                {hasSubs && isExpanded && (
                  <div className="mt-2 pl-5 pr-1 py-1.5 border-l-2 border-gold/30 ml-2 space-y-1.5 flex flex-col animate-in fade-in slide-in-from-top-1 duration-150">
                    {parentCat.subcategories!.map((sub) => {
                      const subSelected = isCatSelected(sub.name) || isCatSelected(sub.slug);
                      const sCount = categoryCounts[sub.name.toLowerCase()] || 0;

                      return (
                        <label
                          key={sub.id}
                          className="flex items-center justify-between gap-2 cursor-pointer group py-0.5"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div
                              onClick={() => toggleCategory(sub.name)}
                              className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors shrink-0 ${
                                subSelected ? "bg-gold border-gold" : "border-border/50 group-hover:border-gold"
                              }`}
                            >
                              {subSelected && <Check className="w-2.5 h-2.5 text-background stroke-[3]" />}
                            </div>
                            <span
                              onClick={() => toggleCategory(sub.name)}
                              className={`text-xs truncate transition-colors ${
                                subSelected ? "text-gold font-semibold" : "text-foreground/75 group-hover:text-gold"
                              }`}
                            >
                              {sub.name}
                            </span>
                          </div>
                          {sCount > 0 && (
                            <span className="text-[10px] font-mono text-gold/70 bg-gold/10 px-1.5 py-0.2 rounded shrink-0">
                              {sCount}
                            </span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Price Range */}
      <div className="border-t border-border/40 pt-6">
        <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">
          Price Range
        </h4>
        <div className="flex flex-col gap-4">
          <input
            type="range"
            min="0"
            max="500000"
            step="1000"
            value={priceRange[1]}
            onChange={(e) => {
              setPriceRange([priceRange[0], parseInt(e.target.value)]);
              setVisibleCount(12);
            }}
            className="w-full accent-gold"
          />
          <div className="flex items-center justify-between text-sm">
            <span className="bg-secondary px-3 py-1.5 rounded-md border border-border/40 font-medium">
              ৳{priceRange[0]}
            </span>
            <span className="text-muted-foreground">-</span>
            <span className="bg-secondary px-3 py-1.5 rounded-md border border-border/40 font-medium">
              ৳{priceRange[1]}
            </span>
          </div>
        </div>
      </div>

      {/* Rating */}
      <div className="border-t border-border/40 pt-6">
        <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">
          Minimum Rating
        </h4>
        <div className="flex flex-col gap-3">
          {[4, 3, 2].map((rating) => (
            <label key={rating} className="flex items-center gap-3 cursor-pointer group">
              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${minRating === rating ? "border-gold" : "border-border/60 group-hover:border-gold"}`}
              >
                {minRating === rating && <div className="w-2.5 h-2.5 rounded-full bg-gold" />}
              </div>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${i < rating ? "fill-gold text-gold" : "fill-muted text-muted"}`}
                  />
                ))}
                <span className="text-xs text-muted-foreground ml-1">& Up</span>
              </div>
            </label>
          ))}
          <label className="flex items-center gap-3 cursor-pointer group">
            <div
              className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${minRating === 0 ? "border-gold" : "border-border/60 group-hover:border-gold"}`}
            >
              {minRating === 0 && <div className="w-2.5 h-2.5 rounded-full bg-gold" />}
            </div>
            <span className="text-sm text-foreground/80">Any Rating</span>
          </label>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-8 md:py-12">
        {/* Page Banner */}
        <div className="relative w-full h-[250px] md:h-[350px] rounded-3xl overflow-hidden mb-8 md:mb-12 flex items-center justify-center group shadow-[0_15px_50px_rgba(0,0,0,0.5)]">
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-[1500ms] group-hover:scale-110"
            style={{ backgroundImage: `url(${bannerImg})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/30" />
          <div className="relative z-10 text-center px-6 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl text-gold mb-4 md:mb-6 tracking-tight drop-shadow-lg">
              Shop Collection
            </h1>
            <p className="text-cream/90 text-sm md:text-lg leading-relaxed drop-shadow-md max-w-2xl mx-auto font-medium">
              Explore our complete collection of premium clothing, meticulously crafted for modern
              comfort and timeless style.
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-72 shrink-0 sticky top-28">
            <FilterSidebar />
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 w-full min-w-0">
            {/* Search Query Active Pill */}
            {searchQuery.trim() && (
              <div className="flex items-center justify-between gap-3 mb-4 p-3 rounded-xl bg-gold/10 border border-gold/30 text-xs animate-in fade-in">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-gold font-semibold">Search:</span>
                  <span className="text-foreground font-medium truncate">&ldquo;{searchQuery}&rdquo;</span>
                  <span className="text-muted-foreground shrink-0">({filteredProducts.length} found)</span>
                </div>
                <button
                  type="button"
                  onClick={() => router.push('/shop')}
                  className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-gold transition-colors shrink-0 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              </div>
            )}

            {/* Toolbar (Mobile Filter & Sort) */}
            <div className="flex items-center justify-between border-y border-border/40 py-3 mb-6 bg-background/50 backdrop-blur z-10 sticky top-16 md:top-20">
              {/* Mobile Filter Trigger */}
              <div className="lg:hidden">
                <Sheet open={isMobileFilterOpen} onOpenChange={setIsMobileFilterOpen}>
                  <SheetTrigger asChild>
                    <button className="flex items-center gap-2 text-sm font-medium hover:text-gold transition-colors">
                      <Filter className="w-4 h-4" />
                      Filter
                      {(selectedCategories.length > 0 || minRating > 0 || priceRange[1] < 500000) && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-background ml-1">
                          {selectedCategories.length +
                            (minRating > 0 ? 1 : 0) +
                            (priceRange[1] < 500000 ? 1 : 0)}
                        </span>
                      )}
                    </button>
                  </SheetTrigger>
                  <SheetContent
                    side="left"
                    className="w-[85vw] max-w-sm border-r border-border/60 bg-maroon-deep p-6 overflow-y-auto"
                  >
                    <SheetHeader className="mb-6">
                      <SheetTitle className="text-left font-display text-2xl text-gold">
                        Filters
                      </SheetTitle>
                    </SheetHeader>
                    <FilterSidebar />
                  </SheetContent>
                </Sheet>
              </div>

              <div className="text-sm text-muted-foreground hidden lg:block">
                Showing <span className="font-bold text-foreground">{visibleProducts.length}</span>{" "}
                of <span className="font-bold text-foreground">{filteredProducts.length}</span>{" "}
                results
              </div>

              {/* Sort Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsSortOpen(!isSortOpen)}
                  className="flex items-center gap-2 text-sm font-medium bg-secondary/50 px-4 py-2 rounded-lg border border-border/40 hover:border-gold transition-colors"
                >
                  <span className="text-muted-foreground">Sort by:</span>
                  <span>{sortOptions.find((o) => o.id === sortBy)?.label}</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${isSortOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isSortOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border shadow-xl rounded-xl overflow-hidden z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex flex-col py-1">
                      {sortOptions.map((option) => (
                        <button
                          key={option.id}
                          onClick={() => {
                            setSortBy(option.id);
                            setIsSortOpen(false);
                            setVisibleCount(12);
                          }}
                          className={`text-left px-4 py-2 text-sm transition-colors ${sortBy === option.id ? "bg-gold/10 text-gold font-medium" : "text-foreground/80 hover:bg-secondary hover:text-gold"}`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Active Filters Display */}
            {selectedCategories.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <span className="text-xs text-muted-foreground mr-1">Active Filter:</span>
                {selectedCategories.map((cat) => (
                  <span
                    key={cat}
                    className="flex items-center gap-1.5 bg-gold/15 text-gold border border-gold/30 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider"
                  >
                    <span>{cat}</span>
                    <button
                      onClick={() => toggleCategory(cat)}
                      className="text-gold/70 hover:text-white transition-colors ml-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
                <button
                  onClick={handleClearFilters}
                  className="text-xs text-muted-foreground hover:text-gold underline ml-2 transition-colors"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Product Grid */}
            {isProductsLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10">
                {Array.from({ length: 8 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : visibleProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10">
                {visibleProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center px-4 bg-secondary/20 rounded-2xl border border-border/30 border-dashed">
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                  <Filter className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-2">No products found</h3>
                <p className="text-muted-foreground max-w-sm mb-6">
                  We couldn't find any products matching your current filters. Try adjusting or
                  clearing them.
                </p>
                <button
                  onClick={handleClearFilters}
                  className="px-6 py-2.5 bg-gold text-background rounded-full font-bold text-sm hover:scale-105 transition-transform"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* Load More */}
            {hasMore && (
              <div className="mt-12 flex justify-center">
                <button
                  onClick={() => setVisibleCount((prev) => prev + 12)}
                  className="px-8 py-3 rounded-full border-2 border-gold text-gold font-bold text-sm tracking-wide uppercase hover:bg-gold hover:text-background transition-all duration-300"
                >
                  Load More
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-gold border-t-transparent animate-spin" />
          <p className="text-muted-foreground text-sm font-medium">Loading collection...</p>
        </div>
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}
