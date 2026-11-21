 "use client";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { Header } from "@/components/store/Header";
import { Footer } from "@/components/store/Footer";
import { ProductSlider } from "@/components/store/ProductSlider";
import { allProducts } from "@/components/store/products";
import { useProduct } from "@/hooks/useProduct";
import { useProducts } from "@/hooks/useProducts";
import {
  Star,
  Heart,
  ShoppingBag,
  ChevronRight,
  ChevronLeft,
  Truck,
  RefreshCcw,
  ShieldCheck,
  Search,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Info,
  Ruler,
  Play,
  X,
  Loader2,
  Image as ImageIcon,
  Video,
  Package,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useUserSync } from "@/context/UserSync";
import { useReviews, useSubmitReview } from "@/hooks/useReviews";



export default function ProductPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const { userProfile, isLoggedIn, setShowAuthModal, addToCart, setIsCartOpen } = useUserSync();
  const { data: product, isLoading } = useProduct(id);
  const { data: allDynamicProducts, isLoading: isProductsLoading } = useProducts();

  const stockQty = typeof product?.stockQuantity === 'number'
    ? product.stockQuantity
    : (product?.stockStatus === 'outofstock' ? 0 : 25);
  const isOutOfStock = product?.stockStatus === 'outofstock' || stockQty <= 0;
  const isLowStock = !isOutOfStock && stockQty <= 5;

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [id]);

  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  useEffect(() => {
    if (product?.image) {
      setSelectedImage(product.image);
    } else {
      setSelectedImage(null);
    }
  }, [product?.image]);

  const allImages = product ? [product.image, ...(product.gallery || [])].filter(Boolean) as string[] : [];

  // Cursor Hover Zoom on Main Image
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  // Lightbox Modal state (Smooth animated open & close)
  const [isLightboxMounted, setIsLightboxMounted] = useState(false);
  const [isLightboxVisible, setIsLightboxVisible] = useState(false);
  const [lightboxActiveIndex, setLightboxActiveIndex] = useState(0);
  const [modalZoomScale, setModalZoomScale] = useState(1);

  const openLightbox = (imageIndex?: number) => {
    if (typeof imageIndex === "number") {
      setLightboxActiveIndex(imageIndex);
    } else {
      const idx = allImages.findIndex((img) => img === selectedImage);
      setLightboxActiveIndex(idx >= 0 ? idx : 0);
    }
    setModalZoomScale(1);
    setIsLightboxMounted(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsLightboxVisible(true);
      });
    });
  };

  const closeLightbox = () => {
    setIsLightboxVisible(false);
    setTimeout(() => {
      setIsLightboxMounted(false);
      setModalZoomScale(1);
      if (allImages[lightboxActiveIndex]) {
        setSelectedImage(allImages[lightboxActiveIndex]);
      }
    }, 320);
  };

  useEffect(() => {
    if (!isLightboxMounted) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeLightbox();
      } else if (e.key === "ArrowLeft" && allImages.length > 1) {
        setLightboxActiveIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
        setModalZoomScale(1);
      } else if (e.key === "ArrowRight" && allImages.length > 1) {
        setLightboxActiveIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
        setModalZoomScale(1);
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isLightboxMounted, allImages.length, lightboxActiveIndex]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setMousePos({ x, y });
  };
  
  useEffect(() => {
    if (product?.attributes) {
      const defaults: Record<string, string> = {};
      product.attributes.forEach(attr => {
        if (attr.options && attr.options.length > 0) {
          defaults[attr.slug] = attr.options[0];
        }
      });
      setSelectedOptions(defaults);
    }
  }, [product]);

  const [activeTab, setActiveTab] = useState("details");
  const [isAdding, setIsAdding] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [drawerAction, setDrawerAction] = useState<"cart" | "buy">("cart");
  
  // Reviews state
  const { data: reviews = [], isLoading: isLoadingReviews } = useReviews(product?.wp_id);
  const submitReview = useSubmitReview();
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState<{rating: number, comment: string, media: File | null}>({ rating: 5, comment: "", media: null });
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : "5.0";
  const reviewCount = reviews.length;
  
  // Calculate star distribution
  const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach(r => {
    if (r.rating >= 1 && r.rating <= 5) ratingCounts[r.rating as keyof typeof ratingCounts]++;
  });

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitSuccess(false);

    if (!product?.wp_id) return;

    submitReview.mutate({
      product_id: product.wp_id,
      rating: reviewForm.rating,
      author_name: userProfile.name || "Customer",
      author_email: userProfile.email || "customer@example.com",
      comment: reviewForm.comment,
      media: reviewForm.media || undefined,
    }, {
      onSuccess: () => {
        setSubmitSuccess(true);
        setReviewForm({ rating: 5, comment: "", media: null });
        setMediaPreview(null);
        setTimeout(() => setIsReviewModalOpen(false), 3000);
      },
      onError: (err: any) => {
        setSubmitError(err.message || "Something went wrong.");
      }
    });
  };

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReviewForm({ ...reviewForm, media: file });
      const url = URL.createObjectURL(file);
      setMediaPreview(url);
    }
  };

  const handleAddToCart = () => {
    if (!product || isOutOfStock) return;
    setIsAdding(true);
    setTimeout(() => {
      const variationString = Object.values(selectedOptions).join(' / ');
      addToCart(product, variationString || undefined, 1);
      setIsAdding(false);
      setIsCartOpen(true);
    }, 600);
  };

  const handleBuyNow = () => {
    if (!product || isOutOfStock) return;
    const variationString = Object.values(selectedOptions).join(' / ');
    addToCart(product, variationString || undefined, 1);
    router.push("/checkout");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-gold/30 selection:text-cream">
        <Header />
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10 animate-pulse">
          <div className="h-4 w-48 bg-secondary/50 rounded mb-8"></div>
          
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 mb-20 items-start">
            {/* Left: Gallery Skeleton */}
            <div className="w-full lg:w-[46%] xl:w-[44%] flex flex-col-reverse md:flex-row gap-4">
              <div className="flex md:flex-col gap-3 md:w-20 lg:w-24 shrink-0">
                <div className="w-20 h-20 md:w-full bg-secondary/50 rounded-xl"></div>
                <div className="w-20 h-20 md:w-full bg-secondary/50 rounded-xl"></div>
                <div className="w-20 h-20 md:w-full bg-secondary/50 rounded-xl hidden sm:block"></div>
              </div>
              <div className="flex-1 aspect-[4/5] bg-secondary/50 rounded-2xl"></div>
            </div>
            
            {/* Right: Info Skeleton */}
            <div className="w-full lg:w-[54%] xl:w-[56%] flex flex-col pt-2 lg:pt-0">
              <div className="h-6 w-24 bg-secondary/50 rounded-full mb-4"></div>
              <div className="h-12 w-3/4 bg-secondary/50 rounded mb-4"></div>
              <div className="h-5 w-32 bg-secondary/50 rounded mb-6"></div>
              <div className="h-10 w-40 bg-secondary/50 rounded mb-8"></div>
              
              <div className="space-y-3 mb-8">
                <div className="h-4 w-full bg-secondary/50 rounded"></div>
                <div className="h-4 w-full bg-secondary/50 rounded"></div>
                <div className="h-4 w-2/3 bg-secondary/50 rounded"></div>
              </div>
              
              <div className="h-px w-full bg-border mb-8" />
              
              <div className="mb-8">
                <div className="h-5 w-20 bg-secondary/50 rounded mb-3"></div>
                <div className="flex gap-2">
                  <div className="h-10 w-16 bg-secondary/50 rounded"></div>
                  <div className="h-10 w-16 bg-secondary/50 rounded"></div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="flex-1 h-12 bg-secondary/50 rounded-lg"></div>
                <div className="flex-1 h-12 bg-secondary/50 rounded-lg"></div>
                <div className="h-12 w-12 bg-secondary/50 rounded-lg shrink-0"></div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-serif text-cream mb-4">Product Not Found</h1>
            <Link href="/" className="text-gold underline">
              Return to Shop
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const relatedSource = allDynamicProducts || [];
  
  const related = (isProductsLoading ? Array.from({ length: 4 }) : relatedSource
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 10)) as any[];
  const tabs = [
    { id: "details", label: "Details" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-gold/30 selection:text-cream">
      <Header />

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10 animate-in fade-in duration-700">
        {/* Breadcrumb */}
        <nav className="flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-widest mb-8">
          <Link href="/" className="hover:text-gold transition">
            Home
          </Link>
          <ChevronRight className="h-3 w-3 shrink-0" />
          <Link href="/shop" className="hover:text-gold transition">
            Shop
          </Link>
          {product.parentCategory && (
            <>
              <ChevronRight className="h-3 w-3 shrink-0" />
              <Link
                href={`/shop?category=${encodeURIComponent(product.parentCategory)}`}
                className="hover:text-gold transition"
              >
                {product.parentCategory}
              </Link>
            </>
          )}
          {(product.subCategory || product.category) && (product.subCategory || product.category) !== product.parentCategory && (
            <>
              <ChevronRight className="h-3 w-3 shrink-0" />
              <Link
                href={`/shop?category=${encodeURIComponent(product.parentCategory || '')}&subCategory=${encodeURIComponent(product.subCategory || product.category)}`}
                className="text-gold/90 hover:text-gold transition font-semibold"
              >
                {product.subCategory || product.category}
              </Link>
            </>
          )}
          <ChevronRight className="h-3 w-3 shrink-0" />
          <span className="text-cream truncate max-w-[200px] sm:max-w-xs">{product.name}</span>
        </nav>

        {/* Top Section: Gallery + Info */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 mb-20 items-start">
          {/* Left: Gallery */}
          <div className="w-full lg:w-[46%] xl:w-[44%] flex flex-col-reverse md:flex-row gap-4 lg:sticky lg:top-24">
            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto no-scrollbar md:w-20 lg:w-24 shrink-0">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`relative w-20 md:w-full aspect-square rounded-xl overflow-hidden shrink-0 transition-all ${
                      selectedImage === img ? 'ring-2 ring-gold border-transparent' : 'border border-border hover:border-gold/50 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Main Image with Interactive Cursor Hover Zoom & Lightbox Trigger */}
            <div
              className="relative flex-1 aspect-[4/5] rounded-2xl overflow-hidden bg-card/60 border border-border/40 select-none cursor-zoom-in group shadow-md"
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
              onClick={() => openLightbox()}
            >
              <div
                className="absolute inset-0 w-full h-full bg-center bg-contain bg-no-repeat pointer-events-none will-change-transform"
                style={{
                  backgroundImage: `url(${selectedImage})`,
                  backgroundSize: product.bgSize || "contain",
                  backgroundPosition: product.bgPos || "center",
                  transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
                  transform: isZoomed ? "scale(2.2)" : "scale(1)",
                  transition: isZoomed
                    ? "transform 0.1s cubic-bezier(0.2, 0, 0.2, 1)"
                    : "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform-origin 0.4s ease-out",
                }}
              />

              {/* Subtle hover zoom hint badge */}
              <div
                className={`absolute top-4 left-4 z-10 transition-opacity duration-300 pointer-events-none ${
                  isZoomed ? "opacity-0" : "opacity-100"
                }`}
              >
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-md text-[11px] font-medium text-cream border border-border/70 shadow-sm">
                  <Search className="h-3.5 w-3.5 text-gold" />
                  <span>Hover to zoom</span>
                </span>
              </div>

              {/* Zoom Icon Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openLightbox();
                }}
                aria-label="Expand image"
                title="Click to view full screen"
                className="absolute bottom-5 right-5 sm:bottom-6 sm:right-6 h-11 w-11 sm:h-12 sm:w-12 bg-background/85 hover:bg-gold hover:text-background backdrop-blur-md rounded-full flex items-center justify-center text-foreground transition-all duration-300 shadow-luxe hover:scale-110 active:scale-95 z-20 group/btn"
              >
                <Search className="h-5 w-5 transition-transform duration-300 group-hover/btn:scale-110" />
              </button>
            </div>
          </div>

          {/* Right: Info */}
          <div className="w-full lg:w-[54%] xl:w-[56%] flex flex-col pt-2 lg:pt-0">
            {/* Stock & Tag & Category Badges */}
            <div className="flex flex-wrap items-center gap-2.5 mb-4">
              {(product.parentCategory || product.subCategory) && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/10 text-[11px] font-bold uppercase tracking-[0.1em] text-gold border border-gold/30">
                  {product.parentCategory && <span>{product.parentCategory}</span>}
                  {product.parentCategory && product.subCategory && product.parentCategory.toLowerCase() !== product.subCategory.toLowerCase() && (
                    <>
                      <span className="opacity-40">›</span>
                      <span className="text-cream">{product.subCategory}</span>
                    </>
                  )}
                  {!product.parentCategory && product.subCategory && <span>{product.subCategory}</span>}
                </div>
              )}

              {product.tag && (
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-secondary text-[11px] font-bold uppercase tracking-[0.1em] text-foreground border border-border">
                  {product.tag}
                </span>
              )}
              
              {isOutOfStock ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-red-500/10 text-[11px] font-bold uppercase tracking-[0.1em] text-red-500 border border-red-500/20">
                  Out of Stock
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-500/10 text-[11px] font-bold uppercase tracking-[0.1em] text-emerald-500 border border-emerald-500/20">
                  In Stock
                </span>
              )}
            </div>

            <h1 className="text-4xl sm:text-5xl font-serif font-medium text-cream leading-[1.15] mb-3">
              {product.name}
            </h1>
            {product.sku && (
              <div className="text-sm text-muted-foreground mb-4">
                SKU: <span className="text-cream">{product.sku}</span>
              </div>
            )}

            <div className="flex items-center gap-2 mb-5">
              <div className="flex text-gold">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < Math.floor(Number(avgRating)) ? "fill-current" : ""}`}
                  />
                ))}
              </div>
              <span className="text-sm text-cream font-medium ml-1">{avgRating}</span>
              <span className="text-sm text-muted-foreground">
                ({reviewCount} reviews)
              </span>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <div className="text-3xl font-bold text-cream">৳{(product.price ?? 0).toLocaleString()}</div>
              {product.compareAt && (
                <div className="text-lg text-muted-foreground line-through decoration-muted-foreground/50">
                  ৳{product.compareAt.toLocaleString()}
                </div>
              )}
              {product.compareAt && (
                <span className="ml-2 px-2 py-0.5 rounded text-[10px] font-bold bg-maroon-deep text-gold tracking-wider">
                  {Math.round(((product.compareAt - product.price) / product.compareAt) * 100)}% OFF
                </span>
              )}
            </div>

            {product.description ? (
              <div 
                className="text-sm text-foreground/80 leading-relaxed mb-8 pr-4 prose prose-invert prose-p:text-foreground/80 prose-a:text-gold max-w-none"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            ) : (
              <p className="text-sm text-foreground/80 leading-relaxed mb-8 pr-4">
                No description available for this product.
              </p>
            )}

            <div className="h-px w-full bg-border mb-8" />

            {/* Dynamic Attributes */}
            {product.attributes?.map((attr) => (
              <div key={attr.slug} className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{attr.name}:</span>
                    {selectedOptions[attr.slug] && (
                      <span className="text-sm text-muted-foreground">{selectedOptions[attr.slug]}</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {attr.options?.map((opt: string) => {
                    const termData = (attr as any).allTerms?.find((t: any) => t.name === opt) || (attr as any).termsData?.find((t: any) => t.name === opt);
                    const colorValue = termData?.value || termData?.meta_value;
                    const isColor = (attr as any).type === 'color' && colorValue;
                    const isSelected = selectedOptions[attr.slug] === opt;
                    
                    return (
                      <div key={opt} className="relative group">
                        <button
                          onClick={() => setSelectedOptions({ ...selectedOptions, [attr.slug]: opt })}
                          className={`transition-colors flex items-center justify-center font-medium ${
                            isColor 
                              ? `h-9 w-9 rounded-full shadow-sm ring-offset-background ring-offset-2 ${isSelected ? 'ring-2 ring-gold' : 'ring-1 ring-border hover:ring-gold/60'}`
                              : `h-11 min-w-[3rem] px-4 rounded-lg border text-sm ${isSelected ? "border-gold bg-gold text-background" : "border-border bg-card hover:border-gold/60 text-foreground"}`
                          }`}
                          style={isColor ? { backgroundColor: colorValue } : {}}
                        >
                          {!isColor && opt}
                        </button>
                        {isColor && (
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/90 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                            {opt}
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-[3px] border-transparent border-t-black/90" />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}

            {/* Stock Display */}
            <div className="mb-5 inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-lg bg-card/70 border border-border/80 backdrop-blur-sm w-fit">
              <span className={`h-2 w-2 rounded-full ${
                isOutOfStock ? "bg-red-500" : isLowStock ? "bg-amber-400 animate-pulse" : "bg-emerald-500 animate-pulse"
              }`} />
              <span className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
                Stock:
              </span>
              <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded-md border ${
                isOutOfStock 
                  ? "bg-red-500/10 text-red-400 border-red-500/20" 
                  : isLowStock 
                  ? "bg-amber-500/10 text-amber-400 border-amber-500/20" 
                  : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              }`}>
                {isOutOfStock ? "0" : stockQty}
              </span>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 mb-8">
              <div className="flex gap-2 sm:gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={isAdding || isOutOfStock}
                  className="flex-1 h-12 px-2 sm:px-4 rounded-lg bg-white text-black flex items-center justify-center gap-1.5 sm:gap-2 font-semibold text-xs sm:text-sm transition-transform active:scale-[0.98] hover:bg-white/90 shadow-luxe whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAdding ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ShoppingBag className="h-4 w-4 shrink-0" />
                  )}
                  {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                  className="flex-1 h-12 px-2 sm:px-4 rounded-lg bg-gold text-background flex items-center justify-center gap-1.5 sm:gap-2 font-semibold text-xs sm:text-sm transition-transform active:scale-[0.98] hover:opacity-90 shadow-luxe whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Buy It Now
                </button>
                <button className="h-12 w-12 rounded-lg border border-border bg-card flex items-center justify-center text-foreground hover:text-gold hover:border-gold/50 transition shrink-0">
                  <Heart className="h-5 w-5 shrink-0" />
                </button>
              </div>
            </div>

            {/* Features (Shipping, Returns, Secure) */}
            <div className="grid grid-cols-3 gap-2 pt-6 border-t border-border">
              <div className="flex flex-col items-center sm:flex-row sm:items-start gap-2 sm:gap-3 text-center sm:text-left">
                <Truck className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs font-semibold text-cream">Free Shipping</p>
                  <p className="text-[10px] text-muted-foreground">On orders over ৳5000</p>
                </div>
              </div>
              <div className="flex flex-col items-center sm:flex-row sm:items-start gap-2 sm:gap-3 text-center sm:text-left">
                <RefreshCcw className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs font-semibold text-cream">Easy Returns</p>
                  <p className="text-[10px] text-muted-foreground">14-day return policy</p>
                </div>
              </div>
              <div className="flex flex-col items-center sm:flex-row sm:items-start gap-2 sm:gap-3 text-center sm:text-left">
                <ShieldCheck className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs font-semibold text-cream">Secure Payment</p>
                  <p className="text-[10px] text-muted-foreground">100% secure checkout</p>
                </div>
              </div>
            </div>
          </div>
        </div>



        {/* Reviews Section */}
        <div className="mb-12 pt-16 border-t border-border relative">
          <div className="flex flex-col lg:flex-row gap-10 xl:gap-16 items-start">
            {/* Reviews Summary */}
            <div className="w-full lg:w-1/3">
              <h2 className="text-3xl font-serif text-cream mb-4">Customer Reviews</h2>
              <div className="flex items-center gap-4 mb-6">
                <div className="text-5xl font-bold text-cream">{avgRating}</div>
                <div className="flex flex-col">
                  <div className="flex text-gold mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < Math.floor(Number(avgRating)) ? "fill-current" : ""}`} />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">Based on {reviewCount} reviews</span>
                </div>
              </div>

              {/* Rating Bars */}
              <div className="space-y-3 mb-8">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = ratingCounts[rating as keyof typeof ratingCounts] || 0;
                  const percent = reviewCount > 0 ? (count / reviewCount) * 100 : 0;
                  return (
                    <div key={rating} className="flex items-center gap-3">
                      <span className="text-sm font-medium w-2 text-foreground/80">{rating}</span>
                      <Star className="h-3 w-3 text-gold fill-current" />
                      <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                        <div
                          className="h-full bg-gold transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-6 text-right">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
              <button 
                onClick={() => {
                  if (!isLoggedIn) {
                    setShowAuthModal(true);
                  } else {
                    setIsReviewModalOpen(true);
                  }
                }}
                className="w-full h-12 rounded-lg border border-gold text-gold flex items-center justify-center font-semibold hover:bg-gold hover:text-background transition"
              >
                Write a Review
              </button>
            </div>

            {/* Review List */}
            <div className="w-full lg:w-2/3 flex flex-col gap-8">
              {isLoadingReviews ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-gold" />
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-12 border border-border rounded-xl">
                  <p className="text-muted-foreground mb-4">No reviews yet. Be the first to review this product!</p>
                  <button 
                    onClick={() => {
                      if (!isLoggedIn) {
                        setShowAuthModal(true);
                      } else {
                        setIsReviewModalOpen(true);
                      }
                    }}
                    className="px-6 py-2 rounded-lg bg-secondary text-foreground text-sm font-medium hover:bg-white/10 transition"
                  >
                    Write a Review
                  </button>
                </div>
              ) : (
                reviews.map((review: any) => (
                  <div key={review.id} className="border-b border-border pb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-secondary overflow-hidden flex items-center justify-center">
                          {review.author_avatar_url ? (
                            <img src={review.author_avatar_url} alt={review.author_name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="font-serif text-lg text-cream">{review.author_name.charAt(0)}</span>
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold text-cream text-sm">{review.author_name}</h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <div className="flex text-gold">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`h-3 w-3 ${i < review.rating ? "fill-current" : ""}`} />
                              ))}
                            </div>
                            <span className="text-xs text-muted-foreground">{review.date}</span>
                          </div>
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-secondary rounded text-[10px] uppercase tracking-wider font-semibold flex items-center gap-1 self-start sm:self-auto text-foreground/80">
                        <ShieldCheck className="h-3 w-3" /> Verified Buyer
                      </span>
                    </div>
                    <p className="text-sm text-foreground/80 leading-relaxed mb-4">
                      {review.content}
                    </p>
                    {review.media_url && (
                      <div className="mt-2 max-w-[200px] sm:max-w-[300px] rounded-lg overflow-hidden border border-border">
                        {review.media_url.match(/\.(mp4|webm|ogg)$/i) ? (
                          <video src={review.media_url} controls className="w-full h-auto object-cover max-h-[300px]" />
                        ) : (
                          <img src={review.media_url} alt="Review Media" className="w-full h-auto object-cover max-h-[300px] cursor-zoom-in" onClick={() => window.open(review.media_url, '_blank')} />
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
          
          {/* Write Review Modal */}
          {isReviewModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsReviewModalOpen(false)} />
              <div className="relative bg-card border border-border rounded-2xl w-full max-w-lg p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
                <button 
                  onClick={() => setIsReviewModalOpen(false)}
                  className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition"
                >
                  <X className="h-5 w-5" />
                </button>
                <h3 className="text-2xl font-serif text-cream mb-6">Write a Review</h3>
                
                {submitSuccess ? (
                  <div className="text-center py-8">
                    <div className="h-16 w-16 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ShieldCheck className="h-8 w-8" />
                    </div>
                    <h4 className="text-xl text-cream font-medium mb-2">Thank You!</h4>
                    <p className="text-muted-foreground">Your review has been submitted successfully.</p>
                  </div>
                ) : (
                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground/80 mb-2">Rating</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                            className="p-1 focus:outline-none"
                          >
                            <Star className={`h-8 w-8 ${star <= reviewForm.rating ? "fill-gold text-gold" : "text-muted-foreground hover:text-gold/50"} transition-colors`} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground/80 mb-1">Review</label>
                      <textarea 
                        required
                        value={reviewForm.comment}
                        onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                        className="w-full min-h-[120px] bg-secondary border border-border rounded-lg p-4 text-sm text-foreground focus:outline-none focus:border-gold/50 transition-colors resize-y"
                        placeholder="What did you like or dislike?"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground/80 mb-1">Add a Photo or Video (Optional)</label>
                      <div className="flex items-center gap-4 mt-2">
                        <label className="flex items-center justify-center gap-2 px-4 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground cursor-pointer hover:border-gold/50 transition-colors">
                          <ImageIcon className="h-4 w-4" />
                          <span>Upload Media</span>
                          <input 
                            type="file" 
                            accept="image/*,video/*" 
                            className="hidden" 
                            onChange={handleMediaChange}
                          />
                        </label>
                        {mediaPreview && (
                          <div className="relative h-12 w-12 rounded-md overflow-hidden border border-border">
                            {reviewForm.media?.type.startsWith('video/') ? (
                              <video src={mediaPreview} className="w-full h-full object-cover" />
                            ) : (
                              <img src={mediaPreview} alt="Preview" className="w-full h-full object-cover" />
                            )}
                            <button 
                              type="button"
                              onClick={() => {
                                setReviewForm({ ...reviewForm, media: null });
                                setMediaPreview(null);
                              }}
                              className="absolute top-0 right-0 h-4 w-4 bg-black/60 rounded-bl flex items-center justify-center hover:bg-red-500 transition"
                            >
                              <X className="h-3 w-3 text-white" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    {submitError && <div className="text-red-400 text-sm mt-2">{submitError}</div>}
                    <button 
                      type="submit" 
                      disabled={submitReview.isPending}
                      className="w-full h-12 bg-gold text-background rounded-lg font-semibold flex items-center justify-center disabled:opacity-70 mt-6"
                    >
                      {submitReview.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Submit Review"}
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Related Products */}
        {(related.length > 0 || isProductsLoading) && (
          <div className="-mx-4 sm:mx-0">
            <ProductSlider title="You May Also Like" products={related} isLoading={isProductsLoading} />
          </div>
        )}
      </main>

      <Footer />

      {/* Mobile Sticky Action Bar */}
      <div className="fixed bottom-2 left-3 right-3 z-50 p-2 bg-background/85 backdrop-blur-xl border border-border md:hidden shadow-[0_8px_30px_rgba(0,0,0,0.4)] rounded-2xl pb-safe">
        <div className="flex items-center justify-between px-2 pb-1.5 text-[11px]">
          <span className="text-muted-foreground font-medium">Stock:</span>
          <span className={`font-semibold font-mono ${isOutOfStock ? "text-red-400" : isLowStock ? "text-amber-400" : "text-emerald-400"}`}>
            {isOutOfStock ? "0" : stockQty}
          </span>
        </div>
        <div className="flex gap-2.5">
          <button
            onClick={() => {
              if (isOutOfStock) return;
              setDrawerAction("cart");
              setIsMobileDrawerOpen(true);
            }}
            disabled={isOutOfStock}
            className="flex-1 h-10 rounded-lg bg-white text-black flex items-center justify-center gap-1.5 font-semibold text-xs transition-transform active:scale-[0.98] shadow-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingBag className="h-3.5 w-3.5 shrink-0" />
            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          </button>
          <button
            onClick={() => {
              if (isOutOfStock) return;
              setDrawerAction("buy");
              setIsMobileDrawerOpen(true);
            }}
            disabled={isOutOfStock}
            className="flex-1 h-10 rounded-lg bg-gold text-background flex items-center justify-center gap-1.5 font-semibold text-xs transition-transform active:scale-[0.98] shadow-sm whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Buy It Now
          </button>
        </div>
      </div>

      {/* Mobile Variations Drawer Overlay */}
      {isMobileDrawerOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm md:hidden animate-in fade-in duration-200"
          onClick={() => setIsMobileDrawerOpen(false)}
        />
      )}

      {/* Mobile Variations Drawer Content */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-[70] bg-card rounded-t-3xl border-t border-border md:hidden transition-transform duration-300 transform ${isMobileDrawerOpen ? "translate-y-0" : "translate-y-full"}`}
      >
        <div className="p-5 pb-safe">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-serif text-lg text-cream">Select Variations</h3>
            <button
              onClick={() => setIsMobileDrawerOpen(false)}
              className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-foreground hover:bg-white/10 transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex gap-4 mb-6">
            <div className="h-20 w-16 rounded-lg bg-secondary overflow-hidden shrink-0">
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt="Product"
                  className="w-full h-full object-cover opacity-80"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                  <ImageIcon className="h-6 w-6" />
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-cream line-clamp-1">{product.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-gold font-semibold">৳{(product.price ?? 0).toLocaleString()}</p>
                <span className="text-muted-foreground text-xs">•</span>
                <p className={`text-xs font-semibold ${isOutOfStock ? 'text-red-400' : isLowStock ? 'text-amber-400' : 'text-emerald-400'}`}>
                  Stock: {isOutOfStock ? "0" : stockQty}
                </p>
              </div>
            </div>
          </div>

          <div className="max-h-[50vh] overflow-y-auto no-scrollbar pb-6">
            {/* Dynamic Attributes */}
            {product.attributes?.map((attr) => (
              <div key={attr.slug} className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{attr.name}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {attr.options?.map((opt: string) => {
                    const termData = (attr as any).termsData?.find((t: any) => t.name === opt);
                    const isColor = (attr as any).type === 'color' && termData?.meta_value;
                    const isSelected = selectedOptions[attr.slug] === opt;
                    
                    return (
                      <div key={opt} className="relative group">
                        <button
                          onClick={() => setSelectedOptions({ ...selectedOptions, [attr.slug]: opt })}
                          className={`transition-colors flex items-center justify-center font-medium ${
                            isColor 
                              ? `h-8 w-8 rounded-full shadow-sm ring-offset-card ring-offset-2 ${isSelected ? 'ring-2 ring-gold' : 'ring-1 ring-border hover:ring-gold/60'}`
                              : `h-10 min-w-[2.5rem] px-3 rounded-lg border text-xs ${isSelected ? "border-gold bg-gold text-background" : "border-border bg-secondary text-foreground"}`
                          }`}
                          style={isColor ? { backgroundColor: termData.meta_value } : {}}
                        >
                          {!isColor && opt}
                        </button>
                        {isColor && (
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/90 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                            {opt}
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-[3px] border-transparent border-t-black/90" />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 mt-2">
            <button
              onClick={() => {
                if (drawerAction === "cart") {
                  handleAddToCart();
                } else {
                  setIsMobileDrawerOpen(false);
                  handleBuyNow();
                }
              }}
              disabled={(isAdding && drawerAction === "cart") || isOutOfStock}
              className="flex-1 h-12 rounded-lg bg-gold text-background flex items-center justify-center gap-2 font-semibold text-sm transition-transform active:scale-[0.98] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {drawerAction === "cart" ? (
                <>
                  {isAdding ? (
                    <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                  ) : (
                    <ShoppingBag className="h-4 w-4 shrink-0" />
                  )}
                  {isOutOfStock ? 'Out of Stock' : `Add to Cart - ৳${(product.price ?? 0).toLocaleString()}`}
                </>
              ) : (
                <>{isOutOfStock ? 'Out of Stock' : `Buy It Now - ৳${(product.price ?? 0).toLocaleString()}`}</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Lightbox Modal with smooth open/close animation */}
      {isLightboxMounted && (
        <div
          className={`fixed inset-0 z-50 flex flex-col items-center justify-between p-4 sm:p-6 transition-all duration-300 ease-out ${
            isLightboxVisible
              ? "bg-black/95 backdrop-blur-xl opacity-100"
              : "bg-black/0 backdrop-blur-none opacity-0 pointer-events-none"
          }`}
          onClick={closeLightbox}
        >
          {/* Top Bar */}
          <div
            className="w-full max-w-6xl flex items-center justify-between z-20 pt-2 transition-transform duration-300"
            style={{
              transform: isLightboxVisible ? "translateY(0)" : "translateY(-20px)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <span className="font-serif text-base sm:text-lg text-cream font-medium line-clamp-1">
                {product.name}
              </span>
              {allImages.length > 1 && (
                <span className="text-xs text-muted-foreground font-mono px-2.5 py-1 rounded-full bg-white/10 border border-white/10">
                  {lightboxActiveIndex + 1} / {allImages.length}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setModalZoomScale((prev) => (prev > 1 ? 1 : 1.7))}
                className="h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all duration-200 border border-white/15 hover:scale-105 active:scale-95 shadow-xl"
                title={modalZoomScale > 1 ? "Zoom Out" : "Zoom In"}
              >
                {modalZoomScale > 1 ? (
                  <ZoomOut className="h-5 w-5" />
                ) : (
                  <ZoomIn className="h-5 w-5" />
                )}
              </button>
              <button
                onClick={closeLightbox}
                className="h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-white/10 hover:bg-gold hover:text-background text-white flex items-center justify-center transition-all duration-200 border border-white/15 hover:scale-105 active:scale-95 shadow-xl"
                title="Close (Esc)"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Center Stage Image */}
          <div
            className="relative flex-1 w-full max-w-5xl flex items-center justify-center my-auto transition-all duration-300 ease-out overflow-hidden"
            style={{
              transform: isLightboxVisible ? "scale(1)" : "scale(0.92)",
              opacity: isLightboxVisible ? 1 : 0,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {product.bgSize && allImages.length <= 1 ? (
              <div
                onClick={() => setModalZoomScale((prev) => (prev > 1 ? 1 : 1.7))}
                className={`w-full max-w-[580px] aspect-[4/5] rounded-2xl bg-secondary bg-no-repeat shadow-2xl transition-transform duration-300 select-none ${
                  modalZoomScale > 1 ? "cursor-zoom-out" : "cursor-zoom-in"
                }`}
                style={{
                  backgroundImage: `url(${allImages[lightboxActiveIndex] || selectedImage})`,
                  backgroundSize: product.bgSize,
                  backgroundPosition: product.bgPos,
                  transform: `scale(${modalZoomScale})`,
                }}
              />
            ) : (
              <img
                onClick={() => setModalZoomScale((prev) => (prev > 1 ? 1 : 1.7))}
                src={allImages[lightboxActiveIndex] || selectedImage || ""}
                alt={product.name}
                className={`max-h-[70vh] sm:max-h-[76vh] max-w-[92vw] sm:max-w-[85vw] object-contain rounded-2xl shadow-2xl transition-transform duration-300 select-none ${
                  modalZoomScale > 1 ? "cursor-zoom-out" : "cursor-zoom-in"
                }`}
                style={{
                  transform: `scale(${modalZoomScale})`,
                }}
              />
            )}

            {/* Navigation Arrows */}
            {allImages.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxActiveIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
                    setModalZoomScale(1);
                  }}
                  className="absolute left-1 sm:left-4 top-1/2 -translate-y-1/2 h-11 w-11 sm:h-12 sm:w-12 rounded-full bg-black/60 hover:bg-gold text-white hover:text-background border border-white/15 backdrop-blur-md flex items-center justify-center transition-all duration-200 shadow-2xl hover:scale-110 active:scale-95 z-20"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxActiveIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
                    setModalZoomScale(1);
                  }}
                  className="absolute right-1 sm:right-4 top-1/2 -translate-y-1/2 h-11 w-11 sm:h-12 sm:w-12 rounded-full bg-black/60 hover:bg-gold text-white hover:text-background border border-white/15 backdrop-blur-md flex items-center justify-center transition-all duration-200 shadow-2xl hover:scale-110 active:scale-95 z-20"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
          </div>

          {/* Bottom Thumbnail Strip */}
          {allImages.length > 1 && (
            <div
              className="w-full max-w-xl flex items-center justify-center gap-2.5 overflow-x-auto py-2 z-20 transition-transform duration-300"
              style={{
                transform: isLightboxVisible ? "translateY(0)" : "translateY(20px)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setLightboxActiveIndex(idx);
                    setModalZoomScale(1);
                  }}
                  className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden shrink-0 transition-all duration-200 ${
                    lightboxActiveIndex === idx
                      ? "ring-2 ring-gold scale-105 opacity-100 shadow-lg"
                      : "opacity-50 hover:opacity-100 border border-white/20"
                  }`}
                >
                  <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

