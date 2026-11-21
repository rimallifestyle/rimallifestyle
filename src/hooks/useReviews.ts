import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { wpFetch } from "@/lib/api";

export type Review = {
  id: number;
  author_name: string;
  author_avatar_url: string;
  date: string;
  content: string;
  rating: number;
  status: string;
  media_url?: string;
};

export function useReviews(productId?: number) {
  return useQuery({
    queryKey: ["reviews", productId],
    queryFn: async () => {
      if (!productId) return [];
      
      const response = await wpFetch(`storefront/reviews?product_id=${productId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch reviews");
      }
      const data = await response.json();
      return data as Review[];
    },
    enabled: !!productId,
    staleTime: 5 * 60 * 1000,
  });
}

export type SubmitReviewParams = {
  product_id: number;
  rating: number;
  comment: string;
  author_name: string;
  author_email: string;
  media?: File;
};

export function useSubmitReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: SubmitReviewParams) => {
      const formData = new FormData();
      formData.append("product_id", params.product_id.toString());
      formData.append("rating", params.rating.toString());
      formData.append("comment", params.comment);
      formData.append("author_name", params.author_name);
      formData.append("author_email", params.author_email);
      if (params.media) {
        formData.append("media", params.media);
      }

      const response = await wpFetch("storefront/reviews", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || "Failed to submit review");
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      // Invalidate the reviews query for this product
      queryClient.invalidateQueries({ queryKey: ["reviews", variables.product_id] });
    },
  });
}
