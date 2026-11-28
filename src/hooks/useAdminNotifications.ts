import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface AdminNotification {
  id: string;
  dbId: string;
  type: 'order' | 'stock' | 'customer' | 'system';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  link: string;
  data?: Record<string, any>;
}

interface NotificationResponse {
  notifications: AdminNotification[];
  unreadCount: number;
  summary: {
    total: number;
    unread: number;
    orders: number;
    stock: number;
    customers: number;
  };
}

export function useAdminNotifications() {
  const queryClient = useQueryClient();

  const queryKey = ["admin_notifications"];

  const { data, isLoading, isRefetching, refetch } = useQuery<NotificationResponse>({
    queryKey,
    queryFn: async () => {
      const res = await fetch("/api/admin/notifications");
      if (!res.ok) {
        throw new Error("Failed to fetch notifications");
      }
      return res.json();
    },
    refetchInterval: 30000, // Poll every 30 seconds
    staleTime: 10000,
  });

  // Dynamically update installed PWA App Badge (red bubble with count) & tab title
  useEffect(() => {
    const unread = data?.unreadCount || 0;
    
    // 1. Native W3C Web Badging API (Android PWA, iOS PWA, macOS, Windows)
    if (typeof navigator !== "undefined" && "setAppBadge" in navigator) {
      try {
        if (unread > 0) {
          (navigator as any).setAppBadge(unread).catch(() => {});
        } else {
          (navigator as any).clearAppBadge().catch(() => {});
        }
      } catch (err) {}
    }

    // 2. Dynamic document title
    if (typeof document !== "undefined" && typeof window !== "undefined" && window.location.pathname.startsWith("/admin")) {
      const baseTitle = "Rimal Admin";
      document.title = unread > 0 ? `(${unread}) ${baseTitle}` : baseTitle;
    }
  }, [data?.unreadCount]);

  // Mark single notification as read
  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch("/api/admin/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_read", id }),
      });
      if (!res.ok) throw new Error("Failed to mark notification as read");
      return res.json();
    },
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<NotificationResponse>(queryKey);

      if (previous) {
        queryClient.setQueryData<NotificationResponse>(queryKey, {
          ...previous,
          notifications: previous.notifications.map((n) =>
            n.id === id ? { ...n, isRead: true } : n
          ),
          unreadCount: Math.max(0, previous.unreadCount - 1),
        });
      }

      return { previous };
    },
    onError: (err, id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // Mark all notifications as read
  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/admin/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_all_read" }),
      });
      if (!res.ok) throw new Error("Failed to mark all as read");
      return res.json();
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<NotificationResponse>(queryKey);

      if (previous) {
        queryClient.setQueryData<NotificationResponse>(queryKey, {
          ...previous,
          notifications: previous.notifications.map((n) => ({ ...n, isRead: true })),
          unreadCount: 0,
        });
      }

      return { previous };
    },
    onSuccess: () => {
      toast.success("All notifications marked as read");
    },
    onError: (err, _, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
      toast.error("Failed to mark all as read");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // Clear all notifications
  const clearAllMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/admin/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clear_all" }),
      });
      if (!res.ok) throw new Error("Failed to clear notifications");
      return res.json();
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<NotificationResponse>(queryKey);

      if (previous) {
        queryClient.setQueryData<NotificationResponse>(queryKey, {
          notifications: [],
          unreadCount: 0,
          summary: { total: 0, unread: 0, orders: 0, stock: 0, customers: 0 },
        });
      }

      return { previous };
    },
    onSuccess: () => {
      toast.success("Notifications cleared");
    },
    onError: (err, _, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
      toast.error("Failed to clear notifications");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    notifications: data?.notifications || [],
    unreadCount: data?.unreadCount || 0,
    summary: data?.summary || { total: 0, unread: 0, orders: 0, stock: 0, customers: 0 },
    isLoading,
    isRefetching,
    refetch,
    markAsRead: (id: string) => markReadMutation.mutate(id),
    markAllAsRead: () => markAllReadMutation.mutate(),
    clearAll: () => clearAllMutation.mutate(),
  };
}
