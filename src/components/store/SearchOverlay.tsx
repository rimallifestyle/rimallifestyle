"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Search, X, Package, CornerDownLeft, ArrowRight, Loader2, Tag } from "lucide-react";
import { useUserSync } from "@/context/UserSync";
import { useProducts } from "@/hooks/useProducts";
import type { Product } from "@/components/store/products";
import { useRouter } from "next/navigation";

const POPULAR_SUGGESTIONS = ["Shirts", "Panjabi", "T-Shirts", "Trousers", "Polos", "Jackets"];

export function SearchOverlay() {
  const { isSearchOpen, setIsSearchOpen } = useUserSync();
  const { data: dynamicProducts, isLoading } = useProducts();
  const allProductsList = useMemo(() => dynamicProducts || [], [dynamicProducts]);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [totalMatches, setTotalMatches] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useRouter();

  // Reset or focus on open/close
  useEffect(() => {
    if (isSearchOpen) {
      document.body.style.overflow = "hidden";
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      document.body.style.overflow = "auto";
      setQuery("");
      setResults([]);
      setTotalMatches(0);
      setSelectedIndex(0);
    }
  }, [isSearchOpen]);

  // Dynamic live search filtering
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setTotalMatches(0);
      setSelectedIndex(0);
      return;
    }

    const searchTerm = query.toLowerCase().trim();
    const searchTerms = searchTerm.split(/\s+/).filter(Boolean);

    const filtered = allProductsList.filter((product) => {
      const name = (product.name || "").toLowerCase();
      const cat = (product.category || "").toLowerCase();
      const sub = (product.subCategory || "").toLowerCase();
      const parent = (product.parentCategory || "").toLowerCase();
      const sku = (product.sku || "").toLowerCase();
      const desc = (product.description || "").toLowerCase();

      // All words in search query must match at least one product field
      return searchTerms.every(
        (term) =>
          name.includes(term) ||
          cat.includes(term) ||
          sub.includes(term) ||
          parent.includes(term) ||
          sku.includes(term) ||
          desc.includes(term)
      );
    });

    setTotalMatches(filtered.length);
    setResults(filtered.slice(0, 8)); // Top 8 results for quick palette
    setSelectedIndex(0);
  }, [query, allProductsList]);

  const handleProductClick = (product: Product) => {
    setIsSearchOpen(false);
    navigate.push(`/product/${product.slug || product.id}`);
  };

  const handleViewAllInShop = (q?: string) => {
    const targetQuery = q !== undefined ? q : query;
    setIsSearchOpen(false);
    if (targetQuery.trim()) {
      navigate.push(`/shop?search=${encodeURIComponent(targetQuery.trim())}`);
    } else {
      navigate.push(`/shop`);
    }
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    // If an item in the search list is selected by keyboard arrows
    if (results.length > 0 && selectedIndex >= 0 && selectedIndex < results.length) {
      handleProductClick(results[selectedIndex]);
      return;
    }

    // Otherwise navigate to /shop with search query
    handleViewAllInShop();
  };

  // Keyboard navigation (Arrow keys, Escape, Enter)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isSearchOpen) return;

      if (e.key === "Escape") {
        setIsSearchOpen(false);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        handleSearchSubmit();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSearchOpen, results, selectedIndex, query]);

  if (!isSearchOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[8vh] sm:pt-[12vh] px-3 sm:px-4 bg-background/70 backdrop-blur-md animate-in fade-in duration-200">
      {/* Click outside backdrop to close */}
      <div className="absolute inset-0 z-0" onClick={() => setIsSearchOpen(false)} />

      {/* Command Palette Modal */}
      <div className="relative z-10 w-full max-w-2xl bg-card border border-border/70 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-top-4 duration-300">
        {/* Search Input Header */}
        <form onSubmit={handleSearchSubmit} className="flex items-center px-4 py-3.5 sm:py-4 border-b border-border/50 bg-secondary/20">
          <Search className="h-5 w-5 text-gold mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for live products, categories, styles..."
            className="flex-1 bg-transparent text-base sm:text-lg text-foreground placeholder-muted-foreground focus:outline-none border-none ring-0 p-0"
          />
          {isLoading && (
            <Loader2 className="w-4 h-4 text-gold animate-spin mr-2 shrink-0" />
          )}
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="p-1 text-muted-foreground hover:text-foreground transition-colors shrink-0 ml-1 bg-secondary rounded-md cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </form>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
          {!query.trim() ? (
            <div className="px-4 py-8 text-center space-y-4">
              <p className="text-sm text-muted-foreground">Type to search across our dynamic catalog...</p>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                <span className="text-[11px] text-muted-foreground uppercase tracking-wider mr-1">Trending:</span>
                {POPULAR_SUGGESTIONS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      setQuery(tag);
                      inputRef.current?.focus();
                    }}
                    className="flex items-center gap-1 px-3 py-1 rounded-full bg-secondary/80 hover:bg-secondary text-xs text-foreground/80 hover:text-gold border border-border/50 transition-all cursor-pointer"
                  >
                    <Tag className="w-3 h-3 text-gold/70" />
                    <span>{tag}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : results.length > 0 ? (
            <div className="py-2">
              <div className="flex items-center justify-between px-3 mb-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  <Package className="w-3.5 h-3.5 text-gold" />
                  <span>Matching Products</span>
                </div>
                <span className="text-[10px] bg-secondary px-2 py-0.5 rounded-full font-bold text-foreground">
                  {totalMatches} found
                </span>
              </div>

              <div className="flex flex-col gap-1">
                {results.map((product, index) => {
                  const isOutOfStock = product.stockStatus === "outofstock" || product.stockQuantity === 0;

                  return (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => handleProductClick(product)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`flex items-center gap-3 sm:gap-4 px-3 py-2.5 rounded-xl transition-all text-left cursor-pointer ${
                        selectedIndex === index
                          ? "bg-secondary border-l-2 border-gold"
                          : "bg-transparent border-l-2 border-transparent hover:bg-secondary/50"
                      }`}
                    >
                      {/* Circular Image */}
                      <div className="w-11 h-11 rounded-lg bg-background border border-border/50 shrink-0 overflow-hidden relative shadow-sm">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                            <Package className="w-5 h-5" />
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex flex-col flex-1 min-w-0">
                        <span
                          className={`font-medium text-sm truncate ${
                            selectedIndex === index ? "text-gold" : "text-foreground"
                          }`}
                        >
                          {product.name}
                        </span>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                          <span className="font-semibold text-foreground">৳{product.price}</span>
                          {product.compareAt && product.compareAt > product.price && (
                            <span className="line-through text-[11px] text-muted-foreground/60">
                              ৳{product.compareAt}
                            </span>
                          )}
                          <span>·</span>
                          <span className="capitalize truncate max-w-[120px]">
                            {product.subCategory || product.category}
                          </span>
                          {isOutOfStock && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-red-500/10 text-red-400 border border-red-500/20 font-medium">
                              Out of stock
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action Icon (Enter) */}
                      {selectedIndex === index && (
                        <CornerDownLeft className="w-4 h-4 text-gold shrink-0 opacity-80" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* View all results button */}
              {totalMatches > results.length && (
                <div className="pt-2 px-2">
                  <button
                    type="button"
                    onClick={() => handleViewAllInShop()}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gold/10 hover:bg-gold/20 text-gold text-xs font-semibold border border-gold/30 transition-all cursor-pointer"
                  >
                    <span>View all {totalMatches} results in Shop</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="px-4 py-10 text-center space-y-3">
              <p className="text-sm text-muted-foreground">
                No products found matching &ldquo;<span className="text-foreground font-medium">{query}</span>&rdquo;
              </p>
              <button
                type="button"
                onClick={() => handleViewAllInShop("")}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-secondary hover:bg-secondary/80 text-xs font-semibold text-gold border border-border transition-all cursor-pointer"
              >
                <span>Browse All Products</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Footer Instructions */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-secondary/30 border-t border-border/40 text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-5 h-5 bg-background border border-border rounded shadow-sm text-foreground">
              <CornerDownLeft className="w-3 h-3" />
            </span>
            <span>to open</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center px-1.5 h-5 bg-background border border-border rounded shadow-sm text-foreground">
              ESC
            </span>
            <span>to close</span>
          </div>
        </div>
      </div>
    </div>
  );
}
