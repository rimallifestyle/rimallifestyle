import { useState, useEffect, useRef } from "react";
import { Search, X, Package, CornerDownLeft } from "lucide-react";
import { useUserSync } from "@/context/UserSync";
import { allProducts, Product } from "@/components/store/products";
import { useRouter } from "next/navigation";

export function SearchOverlay() {
  const { isSearchOpen, setIsSearchOpen } = useUserSync();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useRouter();

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
      setSelectedIndex(0);
    }
  }, [isSearchOpen]);

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
      } else if (e.key === "Enter" && results.length > 0) {
        e.preventDefault();
        handleProductClick(results[selectedIndex]);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen, results, selectedIndex]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSelectedIndex(0);
      return;
    }

    const searchTerm = query.toLowerCase().trim();
    const filtered = allProducts.filter((product) => {
      return (
        product.name.toLowerCase().includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm) ||
        (product.tag && product.tag.toLowerCase().includes(searchTerm))
      );
    });

    setResults(filtered.slice(0, 8)); // Limit to 8 results for the command palette
    setSelectedIndex(0);
  }, [query]);

  if (!isSearchOpen) return null;

  const handleProductClick = (product: Product) => {
    setIsSearchOpen(false);
    navigate.push(`/product/${product.slug || product.id}`);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4 bg-background/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Click outside to close */}
      <div className="absolute inset-0 z-0" onClick={() => setIsSearchOpen(false)} />

      {/* Command Palette Modal */}
      <div className="relative z-10 w-full max-w-2xl bg-card border border-border/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-top-4 duration-300">
        {/* Search Input Header */}
        <div className="flex items-center px-4 py-4 border-b border-border/40">
          <Search className="h-5 w-5 text-gold mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for products, categories..."
            className="flex-1 bg-transparent text-lg text-foreground placeholder-muted-foreground focus:outline-none border-none ring-0 p-0"
          />
          {query && (
            <button
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="p-1 text-muted-foreground hover:text-foreground transition-colors shrink-0 ml-2 bg-secondary rounded-md"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
          {!query.trim() ? (
            <div className="px-4 py-12 text-center">
              <p className="text-sm text-muted-foreground">Type to search across the store...</p>
            </div>
          ) : results.length > 0 ? (
            <div className="py-2">
              <div className="flex items-center justify-between px-3 mb-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  <Package className="w-3.5 h-3.5" />
                  <span>Products</span>
                </div>
                <span className="text-[10px] bg-secondary px-2 py-0.5 rounded-full font-bold text-foreground">
                  {results.length}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                {results.map((product, index) => (
                  <button
                    key={product.id}
                    onClick={() => handleProductClick(product)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`flex items-center gap-4 px-3 py-2 rounded-xl transition-all text-left ${
                      selectedIndex === index
                        ? "bg-secondary border-l-2 border-gold"
                        : "bg-transparent border-l-2 border-transparent hover:bg-secondary/50"
                    }`}
                  >
                    {/* Circular Image */}
                    <div className="w-10 h-10 rounded-full bg-background border border-border/40 shrink-0 overflow-hidden relative shadow-sm">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          style={{ objectPosition: product.bgPos }}
                        />
                      ) : (
                        <div className="w-full h-full bg-muted" />
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex flex-col flex-1 min-w-0">
                      <span
                        className={`font-medium truncate ${selectedIndex === index ? "text-gold" : "text-foreground"}`}
                      >
                        {product.name}
                      </span>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>৳{product.price}</span>
                        <span>·</span>
                        <span className="capitalize">{product.category}</span>
                      </div>
                    </div>

                    {/* Action Icon (Enter) */}
                    {selectedIndex === index && (
                      <CornerDownLeft className="w-4 h-4 text-gold shrink-0 opacity-70" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="px-4 py-12 text-center">
              <p className="text-sm text-muted-foreground">No results found for "{query}"</p>
            </div>
          )}
        </div>

        {/* Footer Instructions */}
        <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border-t border-border/40 text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
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


