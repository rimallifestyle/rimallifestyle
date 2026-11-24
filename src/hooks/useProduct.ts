import { useQuery } from "@tanstack/react-query";
import { wpFetch } from "@/lib/api";
import type { Product } from "@/components/store/products";
import { getProductById } from "@/components/store/products";

export function useProduct(slugOrId: string) {
  return useQuery({
    queryKey: ["product", slugOrId],
    queryFn: async (): Promise<Product | undefined> => {
      // Fetch from Next.js MongoDB backend
      const response = await fetch(`/api/storefront/products/${slugOrId}`);
      
      if (response.ok) {
        const item = await response.json();
        if (item && item._id) {
          const stockQty = item.stockQuantity !== undefined && item.stockQuantity !== null
            ? Number(item.stockQuantity)
            : (item.stockStatus === "outofstock" ? 0 : 25);
          return {
            id: item._id,
            slug: item.slug || item._id,
            name: item.name || 'Untitled',
            price: item.regularPrice || 0,
            compareAt: item.salePrice || undefined,
            sku: item.sku,
            description: item.description,
            category: item.category || "Uncategorized",
            parentCategory: item.parentCategory || undefined,
            subCategory: item.subCategory || undefined,
            image: item.image || '',
            gallery: item.gallery || [],
            bgPos: "50% 50%",
            bgSize: "cover",
            attributes: item.productAttributes || [],
            stockQuantity: stockQty,
            stockStatus: stockQty > 0 ? "instock" : "outofstock",
            variantStocks: item.variantStocks || {}
          } as Product;
        }
      }
      
      // Fallback to static dummy data if not found in database
      // This is useful for development or before all products are migrated
      return getProductById(slugOrId);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Do not retry if we get a 404
  });
}
