"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, 
  X, 
  CheckCheck, 
  ShoppingBag, 
  AlertTriangle, 
  UserPlus, 
  ArrowRight, 
  Trash2, 
  RotateCw, 
  Settings, 
  Check, 
  Package, 
  Sparkles,
  ExternalLink
} from "lucide-react";
import { useAdminNotifications, AdminNotification } from "@/hooks/useAdminNotifications";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = "all" | "unread" | "order" | "stock" | "customer";

export function NotificationDrawer({ isOpen, onClose }: NotificationDrawerProps) {
  const router = useRouter();
  const { 
    notifications, 
    unreadCount, 
    summary, 
    isLoading, 
    isRefetching, 
    refetch, 
    markAsRead, 
    markAllAsRead, 
    clearAll 
  } = useAdminNotifications();

  const [activeTab, setActiveTab] = useState<TabType>("all");

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return !n.isRead;
    return n.type === activeTab;
  });

  const formatTimeAgo = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHours = Math.floor(diffMin / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffSec < 60) return "Just now";
      if (diffMin < 60) return `${diffMin}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch {
      return "Recent";
    }
  };

  const handleNotificationClick = (item: AdminNotification) => {
    if (!item.isRead) {
      markAsRead(item.id);
    }
    onClose();
    if (item.link) {
      router.push(item.link);
    }
  };

  const getTypeStyles = (type: AdminNotification["type"]) => {
    switch (type) {
      case "order":
        return {
          icon: ShoppingBag,
          color: "text-emerald-400",
          bgColor: "bg-emerald-500/10",
          borderColor: "border-emerald-500/20",
          badge: "ORDER",
          badgeColor: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
        };
      case "stock":
        return {
          icon: AlertTriangle,
          color: "text-amber-400",
          bgColor: "bg-amber-500/10",
          borderColor: "border-amber-500/20",
          badge: "INVENTORY",
          badgeColor: "bg-amber-500/15 text-amber-300 border-amber-500/30",
        };
      case "customer":
        return {
          icon: UserPlus,
          color: "text-sky-400",
          bgColor: "bg-sky-500/10",
          borderColor: "border-sky-500/20",
          badge: "USER",
          badgeColor: "bg-sky-500/15 text-sky-300 border-sky-500/30",
        };
      default:
        return {
          icon: Bell,
          color: "text-purple-400",
          bgColor: "bg-purple-500/10",
          borderColor: "border-purple-500/20",
          badge: "SYSTEM",
          badgeColor: "bg-purple-500/15 text-purple-300 border-purple-500/30",
        };
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm cursor-pointer"
          />

          {/* Slide-over Drawer Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 240 }}
            className="relative z-10 w-full sm:w-[440px] md:w-[480px] h-full bg-[#0a0202]/95 backdrop-blur-2xl border-l border-white/10 shadow-[0_0_60px_rgba(0,0,0,0.85)] flex flex-col text-white overflow-hidden"
          >
            {/* Top decorative gradient glow line */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C52A35] to-transparent" />

            {/* Header */}
            <div className="p-5 md:p-6 border-b border-white/10 flex items-center justify-between shrink-0 bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="relative p-2.5 rounded-2xl bg-[#C52A35]/15 border border-[#C52A35]/30 text-[#C52A35] shadow-[0_0_15px_rgba(197,42,53,0.3)]">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C52A35] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-[#C52A35]"></span>
                    </span>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold tracking-tight text-white">Notifications</h2>
                    {unreadCount > 0 ? (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#C52A35] text-white shadow-[0_0_10px_rgba(197,42,53,0.5)]">
                        {unreadCount} New
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-white/10 text-white/60">
                        Caught Up
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-white/40 mt-0.5">Real-time store activity & inventory</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => refetch()}
                  disabled={isRefetching}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-40"
                  title="Refresh notifications"
                >
                  <RotateCw className={`w-4 h-4 ${isRefetching ? "animate-spin" : ""}`} />
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                  title="Close panel"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Filter Tabs & Quick Action Bar */}
            <div className="px-5 py-3 border-b border-white/5 bg-white/[0.01] flex items-center justify-between gap-2 shrink-0">
              {/* Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                <button
                  type="button"
                  onClick={() => setActiveTab("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                    activeTab === "all"
                      ? "bg-[#C52A35] text-white shadow-[0_0_12px_rgba(197,42,53,0.4)]"
                      : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10"
                  }`}
                >
                  All ({summary.total})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("unread")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                    activeTab === "unread"
                      ? "bg-[#C52A35] text-white shadow-[0_0_12px_rgba(197,42,53,0.4)]"
                      : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10"
                  }`}
                >
                  Unread ({unreadCount})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("order")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                    activeTab === "order"
                      ? "bg-[#C52A35] text-white shadow-[0_0_12px_rgba(197,42,53,0.4)]"
                      : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10"
                  }`}
                >
                  Orders ({summary.orders})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("stock")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                    activeTab === "stock"
                      ? "bg-[#C52A35] text-white shadow-[0_0_12px_rgba(197,42,53,0.4)]"
                      : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10"
                  }`}
                >
                  Stock ({summary.stock})
                </button>
              </div>

              {/* Mark All Read Button */}
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={() => markAllAsRead()}
                  className="flex items-center gap-1.5 text-[11px] font-semibold text-[#C52A35] hover:text-[#e03a47] whitespace-nowrap px-2 py-1 rounded-md hover:bg-[#C52A35]/10 transition-colors"
                  title="Mark all notifications as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Mark read</span>
                </button>
              )}
            </div>

            {/* Notification List Body */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2.5">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-64 gap-3 text-white/40">
                  <div className="w-8 h-8 border-2 border-white/10 border-t-[#C52A35] rounded-full animate-spin" />
                  <p className="text-xs">Loading notifications...</p>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-72 text-center px-6">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/30 mb-3 shadow-[0_0_20px_rgba(255,255,255,0.02)]">
                    <Sparkles className="w-6 h-6 text-white/40" />
                  </div>
                  <h3 className="text-sm font-semibold text-white/80 mb-1">
                    {activeTab === "unread" ? "No unread notifications" : "No notifications found"}
                  </h3>
                  <p className="text-xs text-white/40 max-w-[260px]">
                    {activeTab === "unread" 
                      ? "You've caught up with all orders and store alerts!" 
                      : "When new orders arrive or stock alerts trigger, they will appear here."}
                  </p>
                </div>
              ) : (
                filteredNotifications.map((item) => {
                  const typeConfig = getTypeStyles(item.type);
                  const Icon = typeConfig.icon;

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleNotificationClick(item)}
                      className={`group relative p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        !item.isRead
                          ? "bg-white/[0.04] hover:bg-white/[0.07] border-white/15 shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
                          : "bg-white/[0.015] hover:bg-white/[0.04] border-white/5 opacity-80 hover:opacity-100"
                      }`}
                    >
                      {/* Unread Glow Accent */}
                      {!item.isRead && (
                        <div className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-[#C52A35] shadow-[0_0_8px_rgba(197,42,53,0.8)]" />
                      )}

                      <div className="flex items-start gap-3">
                        {/* Type Icon */}
                        <div className={`p-2.5 rounded-xl border shrink-0 ${typeConfig.bgColor} ${typeConfig.borderColor} ${typeConfig.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider border uppercase ${typeConfig.badgeColor}`}>
                                {typeConfig.badge}
                              </span>
                              <h4 className="text-xs font-bold text-white truncate group-hover:text-gold transition-colors">
                                {item.title}
                              </h4>
                            </div>
                            <span className="text-[10px] text-white/40 whitespace-nowrap shrink-0">
                              {formatTimeAgo(item.timestamp)}
                            </span>
                          </div>

                          <p className="text-xs text-white/70 line-clamp-2 leading-relaxed mb-2">
                            {item.message}
                          </p>

                          {/* Footer / Meta Info */}
                          <div className="flex items-center justify-between pt-1 text-[11px]">
                            <div className="flex items-center gap-1.5 text-white/40 group-hover:text-white/80 transition-colors">
                              <span>View details</span>
                              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                            </div>

                            {/* Mark single as read on hover */}
                            {!item.isRead && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(item.id);
                                }}
                                className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                                title="Mark as read"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom Footer */}
            <div className="p-4 border-t border-white/10 bg-white/[0.02] flex items-center justify-between shrink-0">
              <Link
                href="/admin/settings/notifications"
                onClick={onClose}
                className="flex items-center gap-2 text-xs text-white/50 hover:text-white transition-colors"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Notification Settings</span>
              </Link>

              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={() => clearAll()}
                  className="flex items-center gap-1.5 text-xs text-white/40 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All</span>
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
