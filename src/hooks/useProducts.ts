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
          rating: 0,
          reviews: 0,
          bgPos: "50% 50%",
          bgSize: "cover",
          stockQuantity: stockQty,
          stockStatus: stockQty > 0 ? "instock" : "outofstock",
          attributes: item.productAttributes || []
        };
      }) as Product[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
