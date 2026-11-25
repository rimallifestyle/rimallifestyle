import { useState } from "react";
import { Heart, Plus, ShoppingCart, Eye, Star, Loader2, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { productImage, type Product } from "./products";
import { useUserSync } from "@/context/UserSync";

const formatCategoryBadge = (product: Product) => {
  const parent = product.parentCategory && product.parentCategory.length !== 24 ? product.parentCategory : null;
  const sub = product.subCategory && product.subCategory.length !== 24 ? product.subCategory : (
    product.category && product.category.length !== 24 && product.category !== parent ? product.category : null
  );

  if (parent && sub && parent.toLowerCase() !== sub.toLowerCase()) {
    return (
      <span className="inline-flex items-center gap-1">
        <span>{parent}</span>
        <span className="opacity-40 text-[9px]">›</span>
        <span className="text-gold font-medium">{sub}</span>
      </span>
    );
  }
  return <span>{sub || parent || (product.category && product.category.length !== 24 ? product.category : "Category")}</span>;
};

function ProductImage({ product, className = "" }: { product: Product; className?: string }) {
  const isCustomImage = Boolean(product.image && product.image !== productImage);
  return (
    <div
      className={`transition-transform duration-[900ms] ease-out bg-center ${className}`}
      style={{
        backgroundImage: `url(${product.image ?? productImage})`,
        backgroundSize: product.bgSize ?? (isCustomImage ? "cover" : "300% 200%"),
        backgroundPosition: product.bgPos || "center",
        backgroundRepeat: "no-repeat",
      }}
      aria-label={product.name}
    />
  );
}

/* ─────────────────────────────────────────────────────────────
   Variant 1 — Bordered card (default)
   Framed, structured, e-commerce classic with a modern edge.
   ───────────────────────────────────────────────────────────── */
export function ProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const { addToCart, setIsCartOpen, wishlist, toggleWishlist } = useUserSync();
  const [isAdding, setIsAdding] = useState(false);
  const isWished = wishlist.includes(Number(product.id));

  const stockQty = typeof product.stockQuantity === 'number'
    ? product.stockQuantity
    : (product.stockStatus === 'outofstock' ? 0 : 20);
  const isOutOfStock = product.stockStatus === 'outofstock' || stockQty <= 0;
  const isLowStock = !isOutOfStock && stockQty <= 5;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    setIsAdding(true);
    setTimeout(() => {
      addToCart(product, "M", 1);
      setIsAdding(false);
      setIsCartOpen(true);
    }, 500); // simulate network/spin
  };

  const navigateToProduct = () => {
    router.push(`/product/${product.slug || product.id}`);
  };

  return (
    <article 
      onClick={navigateToProduct}
      className="group relative flex h-full flex-col rounded-xl border border-border/60 bg-card/40 p-3 transition-all duration-300 hover:border-gold/60 hover:bg-card/70 hover:shadow-luxe cursor-pointer"
    >
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-secondary to-maroon-deep/60">
        <Link  href={`/product/${product.slug || product.id}`} className="block">
          <ProductImage
            product={product}
            className="aspect-[4/5] w-full group-hover:scale-[1.06]"
          />
        </Link>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-maroon-deep/40 via-transparent to-transparent" />

        {product.tag && (
          <span className="absolute left-3 top-3 rounded-full bg-cream/95 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-maroon-deep shadow-sm z-10">
            {product.tag}
          </span>
        )}
        <button
          onClick={(e) => { e.preventDefault(); toggleWishlist(Number(product.id)); }}
          aria-label="Add to wishlist"
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-cream/90 shadow-sm transition hover:scale-110"
        >
          <Heart className={`h-4 w-4 transition-colors ${isWished ? 'fill-maroon-deep text-maroon-deep' : 'text-maroon-deep hover:fill-maroon-deep/30'}`} />
        </button>
        <button
          onClick={handleAddToCart}
          disabled={isAdding || isOutOfStock}
          aria-label="Quick add"
          className="absolute bottom-3 right-3 flex h-11 w-11 translate-y-2 items-center justify-center rounded-full bg-gold text-accent-foreground opacity-0 shadow-luxe transition-all duration-300 hover:bg-cream group-hover:translate-y-0 group-hover:opacity-100 disabled:opacity-50"
        >
          {isAdding ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
        </button>
      </div>

      <div className="flex flex-1 items-start justify-between gap-3 pt-4">
        <div className="min-w-0">
          <Link  href={`/product/${product.slug || product.id}`}>
            <h3 className="font-display text-lg leading-snug transition group-hover:text-gold">
              {product.name}
            </h3>
          </Link>
          <p className="mt-0.5 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            {formatCategoryBadge(product)}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <div className="font-display text-lg text-gold">৳{product.price.toLocaleString()}</div>
          {product.compareAt && (
            <div className="text-[11px] text-muted-foreground line-through">
              ৳{product.compareAt.toLocaleString()}
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-1.5 pt-2.5 border-t border-border/40">
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full border border-border/60 bg-[oklch(0.32_0.11_18)]" />
          <span className="h-3 w-3 rounded-full border border-border/60 bg-[oklch(0.96_0.02_80)]" />
          <span className="h-3 w-3 rounded-full border border-border/60 bg-[oklch(0.18_0.02_240)]" />
          <span className="ml-1.5 text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
            {product.colors ?? 3} colors
          </span>
        </div>
        <div className="flex items-center gap-1 text-[11px]">
          <span className="text-muted-foreground text-[10px] uppercase tracking-wider">Total Stock:</span>
          <span className={`font-semibold font-mono ${
            isOutOfStock ? 'text-red-400' : isLowStock ? 'text-amber-400' : 'text-emerald-400'
          }`}>
            {stockQty}
          </span>
        </div>
      </div>
    </article>
  );
}

/* ─────────────────────────────────────────────────────────────
   Variant 2 — Overlay card
   Editorial, image-first. Info sits on the image with gradient.
   ───────────────────────────────────────────────────────────── */
export function ProductCardOverlay({ product }: { product: Product }) {
  const router = useRouter();
  const { addToCart, setIsCartOpen, wishlist, toggleWishlist } = useUserSync();
  const [isAdding, setIsAdding] = useState(false);
  const isWished = wishlist.includes(Number(product.id));

  const stockQty = typeof product.stockQuantity === 'number'
    ? product.stockQuantity
    : (product.stockStatus === 'outofstock' ? 0 : 20);
  const isOutOfStock = product.stockStatus === 'outofstock' || stockQty <= 0;
  const isLowStock = !isOutOfStock && stockQty <= 5;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    setIsAdding(true);
    setTimeout(() => {
      addToCart(product, "M", 1);
      setIsAdding(false);
      setIsCartOpen(true);
    }, 500);
  };

  const navigateToProduct = () => {
    router.push(`/product/${product.slug || product.id}`);
  };

  return (
    <article 
      onClick={navigateToProduct}
      className="group relative overflow-hidden rounded-xl border border-border/60 shadow-luxe cursor-pointer"
    >
      <div className="relative">
        <Link  href={`/product/${product.slug || product.id}`} className="block">
          <ProductImage
            product={product}
            className="aspect-[3/4] w-full group-hover:scale-[1.08]"
          />
        </Link>
        <div className="absolute inset-0 bg-gradient-to-t from-maroon-deep via-maroon-deep/40 to-transparent opacity-95" />
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-maroon-deep/40" />

        {product.tag && (
          <span className="absolute left-4 top-4 rounded-full bg-gold px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-accent-foreground shadow-sm z-10">
            {product.tag}
          </span>
        )}

        <div className="absolute right-4 top-4 flex flex-col gap-2 opacity-0 transition group-hover:opacity-100">
          <button
            onClick={(e) => { e.preventDefault(); toggleWishlist(Number(product.id)); }}
            aria-label="Wishlist"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-cream/95 shadow-sm hover:scale-110 transition-transform"
          >
            <Heart className={`h-4 w-4 transition-colors ${isWished ? 'fill-maroon-deep text-maroon-deep' : 'text-maroon-deep hover:fill-maroon-deep/30'}`} />
          </button>
          <button
            aria-label="Quick view"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-cream/95 text-maroon-deep shadow-sm hover:bg-gold hover:text-accent-foreground"
          >
            <Eye className="h-4 w-4" />
          </button>
        </div>

        <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
          <div className="flex items-center justify-between gap-2 mb-1">
            <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-gold">
              {formatCategoryBadge(product)}
            </p>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-cream/90 bg-black/40 px-2.5 py-0.5 rounded-full border border-white/10 backdrop-blur-sm">
              Total Stock: <strong className={isOutOfStock ? "text-red-400" : isLowStock ? "text-amber-400" : "text-emerald-400"}>{stockQty}</strong>
            </span>
          </div>
          <Link  href={`/product/${product.slug || product.id}`}>
            <h3 className="mt-1 font-display text-xl leading-tight text-cream md:text-2xl hover:text-gold transition">
              {product.name}
            </h3>
          </Link>
          <div className="mt-3 flex items-end justify-between gap-3">
            <div className="flex items-end gap-2">
              <span className="font-display text-2xl text-gold">
                ৳{product.price.toLocaleString()}
              </span>
              {product.compareAt && (
                <span className="text-xs text-cream/60 line-through">
                  ৳{product.compareAt.toLocaleString()}
                </span>
              )}
            </div>
            <button
              onClick={handleAddToCart}
              disabled={isAdding || isOutOfStock}
              className="inline-flex items-center gap-2 rounded-full bg-cream px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-maroon-deep transition hover:bg-gold disabled:opacity-50"
            >
              {isAdding ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <ShoppingCart className="h-3.5 w-3.5" />
              )}{" "}
              {isOutOfStock ? 'Out of Stock' : 'Add'}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

/* ─────────────────────────────────────────────────────────────
   Variant 3 — Minimal card
   Boutique, quiet, image + tiny caption. No hover overlays.
   ───────────────────────────────────────────────────────────── */
export function ProductCardMinimal({ product }: { product: Product }) {
  const router = useRouter();
  const { wishlist, toggleWishlist } = useUserSync();
  const isWished = wishlist.includes(Number(product.id));

  const stockQty = typeof product.stockQuantity === 'number'
    ? product.stockQuantity
    : (product.stockStatus === 'outofstock' ? 0 : 20);
  const isOutOfStock = product.stockStatus === 'outofstock' || stockQty <= 0;
  const isLowStock = !isOutOfStock && stockQty <= 5;

  const navigateToProduct = () => {
    router.push(`/product/${product.slug || product.id}`);
  };

  return (
    <article onClick={navigateToProduct} className="group cursor-pointer">
      <div className="relative overflow-hidden bg-secondary">
        <Link  href={`/product/${product.slug || product.id}`} className="block">
          <ProductImage
            product={product}
            className="aspect-[3/4] w-full group-hover:scale-[1.04]"
          />
        </Link>
        {isOutOfStock ? (
          <span className="absolute left-0 top-4 bg-red-500/90 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-white">
            Out of Stock
          </span>
        ) : (
          <span className={`absolute left-0 top-4 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-white ${
            isLowStock ? 'bg-amber-600/95' : 'bg-emerald-600/90'
          }`}>
            Stock: {stockQty}
          </span>
        )}
        
        {product.tag && !isOutOfStock && (
          <span className="absolute left-0 top-12 bg-maroon-deep px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">
            {product.tag}
          </span>
        )}
        <button
          onClick={(e) => { e.preventDefault(); toggleWishlist(Number(product.id)); }}
          aria-label="Wishlist"
          className="absolute right-3 top-3 opacity-0 transition group-hover:opacity-100 hover:scale-110"
        >
          <Heart className={`h-5 w-5 drop-shadow-lg transition-colors ${isWished ? 'fill-gold text-gold' : 'text-cream hover:fill-cream/30'}`} />
        </button>
      </div>
      <div className="pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-gold">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-3 w-3 fill-current" />
            ))}
            <span className="ml-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              (48)
            </span>
          </div>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Stock: <span className={`font-semibold font-mono ${isOutOfStock ? "text-red-400" : isLowStock ? "text-amber-400" : "text-emerald-400"}`}>{stockQty}</span>
          </span>
        </div>
        <Link  href={`/product/${product.slug || product.id}`}>
          <h3 className="mt-2 font-display text-base leading-snug transition group-hover:text-gold">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-sm font-medium text-gold">৳{product.price.toLocaleString()}</span>
          {product.compareAt && (
            <span className="text-xs text-muted-foreground line-through">
              ৳{product.compareAt.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

/* ─────────────────────────────────────────────────────────────
   Variant 4 — Detailed card
   Rich e-comm card with visible Buy Now + Add to Cart CTAs.
   ───────────────────────────────────────────────────────────── */
export function ProductCardDetailed({ product }: { product: Product }) {
  const router = useRouter();
  const { addToCart, setIsCartOpen, wishlist, toggleWishlist } = useUserSync();
  const [isAdding, setIsAdding] = useState(false);
  const isWished = wishlist.includes(Number(product.id));

  const stockQty = typeof product.stockQuantity === 'number'
    ? product.stockQuantity
    : (product.stockStatus === 'outofstock' ? 0 : 20);
  const isOutOfStock = product.stockStatus === 'outofstock' || stockQty <= 0;
  const isLowStock = !isOutOfStock && stockQty <= 5;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    setIsAdding(true);
    setTimeout(() => {
      addToCart(product, "M", 1);
      setIsAdding(false);
      setIsCartOpen(true);
    }, 500);
  };

  const navigateToProduct = () => {
    router.push(`/product/${product.slug || product.id}`);
  };

  return (
    <article 
      onClick={navigateToProduct}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/50 transition-all duration-300 hover:border-gold/60 hover:shadow-luxe cursor-pointer"
    >
      <div className="relative overflow-hidden bg-gradient-to-br from-secondary to-maroon-deep/60">
        <Link  href={`/product/${product.slug || product.id}`} className="block">
          <ProductImage
            product={product}
            className="aspect-[4/5] w-full group-hover:scale-[1.05]"
          />
        </Link>

        {product.tag && (
          <span className="absolute left-3 top-3 rounded-full bg-cream/95 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-maroon-deep shadow-sm z-10">
            {product.tag}
          </span>
        )}
        <button
          onClick={(e) => { e.preventDefault(); toggleWishlist(Number(product.id)); }}
          aria-label="Add to wishlist"
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-cream/90 shadow-sm transition hover:scale-110"
        >
          <Heart className={`h-4 w-4 transition-colors ${isWished ? 'fill-maroon-deep text-maroon-deep' : 'text-maroon-deep hover:fill-maroon-deep/30'}`} />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="mb-1 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              {formatCategoryBadge(product)}
            </p>
            <Link  href={`/product/${product.slug || product.id}`}>
              <h3 className="font-display text-lg leading-snug transition group-hover:text-gold">
                {product.name}
              </h3>
            </Link>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className="font-display text-xl text-gold">৳{product.price.toLocaleString()}</div>
            {product.compareAt && (
              <div className="text-xs text-cream/60 line-through">
                ৳{product.compareAt.toLocaleString()}
              </div>
            )}
          </div>
        </div>

        <div className="mt-2.5 flex items-center justify-between text-xs py-1.5 px-3 rounded-xl bg-secondary/50 border border-border/40">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Stock</span>
          <span className={`font-semibold font-mono text-xs ${
            isOutOfStock ? 'text-red-400' : isLowStock ? 'text-amber-400' : 'text-emerald-400'
          }`}>
            {isOutOfStock ? "0" : stockQty}
          </span>
        </div>

        <div className="mt-3 flex items-center gap-1 text-gold">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="h-3 w-3 fill-current" />
          ))}
          <span className="ml-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            ({product.reviews ?? 48})
          </span>
        </div>

        <div className="mt-auto flex flex-col gap-2 pt-4">
          <button 
            onClick={navigateToProduct}
            disabled={isOutOfStock}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-gold px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-accent-foreground shadow-sm transition hover:bg-cream disabled:opacity-50"
          >
            Buy Now
          </button>
          <button
            onClick={handleAddToCart}
            disabled={isAdding || isOutOfStock}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-border/70 bg-transparent px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground transition hover:border-gold hover:bg-card hover:text-gold disabled:opacity-50"
          >
            {isAdding ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <ShoppingBag className="h-3.5 w-3.5" />
            )}{" "}
            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </article>
  );
}

/* ─────────────────────────────────────────────────────────────
   Skeleton Loaders
   ───────────────────────────────────────────────────────────── */

export function ProductCardSkeleton({ variant = "default" }: { variant?: "default" | "overlay" | "minimal" | "detailed" }) {
  if (variant === "overlay") {
    return (
      <article className="group relative overflow-hidden rounded-xl border border-border/60 shadow-luxe bg-card/40 animate-pulse">
        <div className="aspect-[3/4] w-full bg-secondary/50 rounded-lg"></div>
      </article>
    );
  }
  
  if (variant === "minimal") {
    return (
      <article className="group cursor-pointer animate-pulse">
        <div className="aspect-[3/4] w-full bg-secondary/50 rounded-lg mb-4"></div>
        <div className="h-4 w-1/3 bg-secondary/50 rounded mb-2"></div>
        <div className="h-5 w-2/3 bg-secondary/50 rounded mb-2"></div>
        <div className="h-4 w-1/2 bg-secondary/50 rounded"></div>
      </article>
    );
  }

  if (variant === "detailed") {
    return (
      <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/30 animate-pulse">
        <div className="aspect-[4/5] w-full bg-secondary/50"></div>
        <div className="p-4">
          <div className="h-3 w-1/4 bg-secondary/50 rounded mb-2"></div>
          <div className="h-5 w-3/4 bg-secondary/50 rounded mb-3"></div>
          <div className="h-6 w-1/3 bg-secondary/50 rounded mb-4"></div>
          <div className="mt-auto flex flex-col gap-2 pt-4">
            <div className="h-10 w-full bg-secondary/50 rounded-full"></div>
            <div className="h-10 w-full bg-secondary/50 rounded-full"></div>
          </div>
        </div>
      </article>
    );
  }

  // Default variant
  return (
    <article className="group relative flex h-full flex-col rounded-xl border border-border/60 bg-card/20 p-3 animate-pulse">
      <div className="aspect-[4/5] w-full rounded-lg bg-secondary/50"></div>
      <div className="flex flex-1 items-start justify-between gap-3 pt-4">
        <div className="w-2/3">
          <div className="h-5 w-full bg-secondary/50 rounded mb-2"></div>
          <div className="h-3 w-1/2 bg-secondary/50 rounded"></div>
        </div>
        <div className="w-1/3 flex justify-end">
          <div className="h-5 w-3/4 bg-secondary/50 rounded"></div>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-1.5">
        <div className="h-3 w-16 bg-secondary/50 rounded"></div>
      </div>
    </article>
  );
}


