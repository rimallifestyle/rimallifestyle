import { useQuery } from "@tanstack/react-query";
import type { Product, ProductCategory } from "@/components/store/products";

export function useProducts() {
  return useQuery({
    queryKey: ["products", "recent"],
    queryFn: async () => {
      const response = await fetch("/api/storefront/products");
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      const data = await response.json();
      
      // Map MongoDB response to frontend Product interface
      return data.map((item: any) => {
        const stockQty = item.stockQuantity !== undefined && item.stockQuantity !== null
          ? Number(item.stockQuantity)
          : (item.stockStatus === "outofstock" ? 0 : 25);
        // Proper discount pricing logic:
        // If product has a valid salePrice lower than regularPrice:
        // - `price` is the discounted selling price (salePrice)
        // - `compareAt` is the higher regular price (regularPrice) to strike through
        const regPrice = Number(item.regularPrice) || 0;
        const sPrice = item.salePrice !== undefined && item.salePrice !== null && item.salePrice !== ""
          ? Number(item.salePrice)
          : undefined;
        const hasDiscount = sPrice !== undefined && sPrice > 0 && sPrice < regPrice;

        return {
          id: item._id,
          slug: item.slug || item._id,
          name: item.name || 'Untitled',
          price: hasDiscount ? (sPrice as number) : regPrice,
          compareAt: hasDiscount ? regPrice : undefined,
          sku: item.sku,
          description: item.description,
          category: item.category || "Uncategorized",
          categorySlug: item.categorySlug || (typeof item.category === 'string' ? item.category.toLowerCase().replace(/\s+/g, '-') : ''),
          categoryId: item.categoryId || (typeof item.category === 'string' ? item.category : ''),
          parentCategory: item.parentCategory || undefined,
          subCategory: item.subCategory || undefined,
          image: item.image || '',
          gallery: item.gallery || [],
          rating: 0,
          reviews: 0,
          bgPos: "50% 50%",
          bgSize: "cover",
          stockQuantity: stockQty,
          stockStatus: stockQty > 0 ? "instock" : "outofstock",
          variantStocks: item.variantStocks || {},
          attributes: item.productAttributes || []
        };
      }) as Product[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
