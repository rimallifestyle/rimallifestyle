"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Globe, 
  Share2, 
  Image as ImageIcon, 
  Upload, 
  Save, 
  CheckCircle2, 
  Eye, 
  Sparkles, 
  ExternalLink, 
  AlertCircle, 
  X, 
  Loader2,
  Search,
  MessageCircle,
  Twitter,
  Link as LinkIcon,
  HelpCircle,
  Copy,
  Check,
  FileCode,
  ArrowUpRight,
  ShieldCheck,
  Zap
} from "lucide-react";
import { toast } from "sonner";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

interface SeoFormState {
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  siteUrl: string;
  twitterCard: "summary_large_image" | "summary";
  googleVerification: string;
  allowIndexing: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Authentic Official Brand SVGs (Google 4-Color, Google Wordmark, Meta, X)
// ─────────────────────────────────────────────────────────────────────────────
function GoogleGIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

function GoogleWordmark({ className = "h-5 w-auto" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 272 92" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M115.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18C71.25 34.32 81.24 25 93.5 25s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44s-12.51 5.46-12.51 13.44c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z" fill="#EA4335"/>
      <path d="M163.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18c0-12.85 9.99-22.18 22.25-22.18s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44s-12.51 5.46-12.51 13.44c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z" fill="#FBBC05"/>
      <path d="M209.75 26.34v39.82c0 16.38-9.66 23.07-21.08 23.07-10.75 0-17.22-7.19-19.66-13.07l8.48-3.53c1.51 3.61 5.21 7.87 11.17 7.87 7.31 0 11.84-4.51 11.84-13v-3.19h-.34c-2.18 2.69-6.38 5.04-11.68 5.04-11.09 0-21.25-9.66-21.25-22.09 0-12.52 10.16-22.26 21.25-22.26 5.29 0 9.49 2.35 11.68 4.96h.34v-3.61h9.25zm-8.56 20.92c0-7.81-5.21-13.52-11.84-13.52-6.72 0-12.35 5.71-12.35 13.52 0 7.73 5.63 13.36 12.35 13.36 6.63 0 11.84-5.63 11.84-13.36z" fill="#4285F4"/>
      <path d="M225 3v65h-9.5V3h9.5z" fill="#34A853"/>
      <path d="M262.02 54.48l7.56 5.04c-2.44 3.61-8.32 9.83-18.48 9.83-12.6 0-22.01-9.74-22.01-22.18 0-13.19 9.49-22.18 20.92-22.18 11.51 0 17.14 9.16 18.98 14.11l1.01 2.52-29.65 12.28c2.27 4.45 5.8 6.72 10.75 6.72 4.96 0 8.4-2.44 10.92-6.14zm-23.27-7.98l19.82-8.23c-1.09-2.77-4.37-4.7-8.23-4.7-4.95 0-11.84 4.37-11.59 12.93z" fill="#EA4335"/>
      <path d="M35.37 41.65V32.4h33.84c.34 1.77.5 3.62.5 5.72 0 7.06-1.93 15.79-8.15 22.01-6.05 6.3-13.78 9.66-24.02 9.66C17.32 69.79 2 54.43 2 35.89 2 17.36 17.32 2 37.54 2c11.17 0 19.24 4.37 25.2 10.08l-7.06 7.06c-4.37-4.12-10.25-7.39-18.14-7.39-14.78 0-26.63 11.93-26.63 26.71 0 14.78 11.84 26.71 26.63 26.71 9.58 0 15.04-3.86 18.57-7.39 2.94-2.94 4.87-7.14 5.54-12.85H35.37v-2.68z" fill="#4285F4"/>
    </svg>
  );
}

function FacebookIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2"/>
      <path d="M16.671 15.463l.532-3.47h-3.328v-2.25c0-.949.465-1.874 1.956-1.874h1.533V4.916s-1.374-.235-2.686-.235c-2.741 0-4.533 1.662-4.533 4.669v2.673H7.078v3.47h3.067v8.385a12.09 12.09 0 003.731 0v-8.385h2.795z" fill="#ffffff"/>
    </svg>
  );
}

function XIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}

export default function SeoSettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewTab, setPreviewTab] = useState<"facebook" | "twitter" | "google">("facebook");
  const [copiedSitemap, setCopiedSitemap] = useState(false);
  const [copiedRobots, setCopiedRobots] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<SeoFormState>({
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    ogTitle: "",
    ogDescription: "",
    ogImage: "",
    siteUrl: "https://rimallifestyle.com",
    twitterCard: "summary_large_image",
    googleVerification: "",
    allowIndexing: true,
  });

  const API_ENDPOINT = "/api/admin/settings?key=seo_settings";

  useEffect(() => {
    async function loadSeoSettings() {
      try {
        const res = await fetch(API_ENDPOINT);
        if (res.ok) {
          const json = await res.json();
          if (json && json.data) {
            setFormData((prev) => ({
              ...prev,
              ...json.data,
            }));
          }
        }
      } catch (err) {
        console.error("Failed to load SEO settings", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadSeoSettings();
  }, []);

  const handleInputChange = (field: keyof SeoFormState, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size is too large. Max 10MB.");
      if (e.target) e.target.value = "";
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading("Uploading social share banner...");

    try {
      const data = new FormData();
      data.append("file", file);
      data.append("folder", "rimal_store/seo");

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: data,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload failed");

      setFormData((prev) => ({
        ...prev,
        ogImage: json.url,
      }));

      toast.success("Social sharing banner uploaded!", { id: toastId });
    } catch (err: any) {
      toast.error(err.message || "Failed to upload image", { id: toastId });
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = "";
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "seo_settings",
          value: formData,
        }),
      });

      if (!res.ok) throw new Error("Failed to save settings");
      toast.success("SEO & Social Sharing settings saved successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopy = async (text: string, type: 'sitemap' | 'robots') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'sitemap') {
        setCopiedSitemap(true);
        setTimeout(() => setCopiedSitemap(false), 2000);
        toast.success("Sitemap URL copied to clipboard!");
      } else {
        setCopiedRobots(true);
        setTimeout(() => setCopiedRobots(false), 2000);
        toast.success("robots.txt URL copied to clipboard!");
      }
    } catch {
      toast.error("Failed to copy URL");
    }
  };

  const displayTitle = formData.ogTitle || formData.metaTitle || "Rimal Lifestyle — Modern Luxury Clothing";
  const displayDesc = formData.ogDescription || formData.metaDescription || "Your destination for modern luxury clothing, premium fabrics, handcrafted shirts and timeless menswear.";
  const displayDomain = formData.siteUrl ? formData.siteUrl.replace(/^https?:\/\//, "").replace(/\/$/, "") : "rimallifestyle.com";

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 pt-4 pb-6">
        <div className="h-8 w-56 rounded-md bg-white/10 animate-pulse" />
        <div className="h-4 w-96 rounded-md bg-white/10 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
          <div className="lg:col-span-2 h-96 rounded-3xl bg-white/5 animate-pulse" />
          <div className="h-96 rounded-3xl bg-white/5 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-6 pt-4 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-white">SEO & Social Sharing</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#C52A35]/20 text-[#C52A35] border border-[#C52A35]/30">
              Live OG Meta
            </span>
          </div>
          <p className="text-sm text-white/60 mt-1">
            Configure social share banners, OpenGraph tags, and search engine optimization for Rimal.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-4 h-10 rounded-xl glass-button text-sm font-medium text-white/80 hover:text-white transition-all"
          >
            <span>View Site</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-60" />
          </a>

          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-5 h-10 rounded-xl bg-[#C52A35] hover:bg-[#a8222c] text-white text-sm font-semibold shadow-[0_0_20px_rgba(197,42,53,0.4)] transition-all disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{isSaving ? "Saving..." : "Save Changes"}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form Settings (7 cols) */}
        <div className="xl:col-span-7 flex flex-col gap-6">

          {/* Social Share Banner (Open Graph Image) */}
          <div className="glass-card rounded-3xl p-6 relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#C52A35]/15 text-[#C52A35] border border-[#C52A35]/30">
                  <Share2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Social Sharing Banner (OG Image)</h2>
                  <p className="text-xs text-white/50">Shown when links are shared on Facebook, WhatsApp, Twitter, and iMessage.</p>
                </div>
              </div>
              <span className="text-[11px] font-mono text-white/40 bg-white/5 px-2 py-1 rounded-md border border-white/10 hidden sm:inline-block">
                1200 × 630 px
              </span>
            </div>

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />

            {/* Banner Preview & Upload Area */}
            {formData.ogImage ? (
              <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-black/40 group aspect-[1200/630] max-h-[260px] w-full flex items-center justify-center">
                <img
                  src={formData.ogImage}
                  alt="Social share banner"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="px-4 py-2 rounded-xl bg-white text-black font-semibold text-xs shadow-lg hover:bg-white/90 transition-all flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Change Image</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInputChange("ogImage", "")}
                    className="px-3 py-2 rounded-xl bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30 font-semibold text-xs transition-all flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-[1200/630] max-h-[220px] rounded-2xl border-2 border-dashed border-white/20 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/40 transition-all flex flex-col items-center justify-center gap-2.5 cursor-pointer p-6 text-center group"
              >
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform text-white/60 group-hover:text-white">
                  {isUploading ? (
                    <Loader2 className="w-6 h-6 animate-spin text-[#C52A35]" />
                  ) : (
                    <Upload className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Click to upload social sharing banner</p>
                  <p className="text-xs text-white/40 mt-0.5">PNG, JPG, or WEBP up to 10MB (Recommended: 1200×630)</p>
                </div>
              </div>
            )}

            {/* Direct URL Input */}
            <div className="mt-4">
              <label className="block text-xs font-medium text-white/60 mb-1.5">Or paste image URL directly:</label>
              <div className="relative">
                <LinkIcon className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  value={formData.ogImage}
                  onChange={(e) => handleInputChange("ogImage", e.target.value)}
                  placeholder="https://example.com/social-banner.jpg"
                  className="w-full h-10 pl-9 pr-4 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#C52A35]"
                />
              </div>
            </div>
          </div>

          {/* Social Share Meta (OpenGraph) Details */}
          <div className="glass-card rounded-3xl p-6 space-y-4">
            <h2 className="text-base font-bold text-white mb-1">Social Sharing Content</h2>
            <p className="text-xs text-white/50 -mt-2">Customize the title and description specifically shown on Facebook, WhatsApp, and Twitter.</p>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-white/80">Social Share Title (og:title)</label>
                <span className="text-[10px] text-white/40">{formData.ogTitle.length} chars</span>
              </div>
              <input
                type="text"
                value={formData.ogTitle}
                onChange={(e) => handleInputChange("ogTitle", e.target.value)}
                placeholder={formData.metaTitle || "e.g., Rimal Lifestyle — Modern Luxury Clothing"}
                className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#C52A35]"
              />
              <p className="text-[11px] text-white/40 mt-1">Leave empty to use the standard Meta Title.</p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-white/80">Social Share Description (og:description)</label>
                <span className="text-[10px] text-white/40">{formData.ogDescription.length} chars</span>
              </div>
              <textarea
                rows={3}
                value={formData.ogDescription}
                onChange={(e) => handleInputChange("ogDescription", e.target.value)}
                placeholder={formData.metaDescription || "e.g., Explore handcrafted luxury menswear, shirts, panjabis, and accessories."}
                className="w-full p-3.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#C52A35] resize-y"
              />
              <p className="text-[11px] text-white/40 mt-1">Leave empty to use the standard Meta Description.</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-white/80 mb-1.5">Twitter / X Card Type</label>
              <select
                value={formData.twitterCard}
                onChange={(e) => handleInputChange("twitterCard", e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-[#C52A35]"
              >
                <option value="summary_large_image" className="bg-[#120000]">Summary with Large Image Banner (Recommended)</option>
                <option value="summary" className="bg-[#120000]">Standard Summary (Small Thumbnail)</option>
              </select>
            </div>
          </div>

          {/* Search Engine Optimization (SEO) */}
          <div className="glass-card rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-2.5 mb-1">
              <div className="p-2 rounded-xl bg-sky-500/15 text-sky-400 border border-sky-500/30">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Search Engine Optimization (SEO)</h2>
                <p className="text-xs text-white/50">Primary metadata parsed by Google, Bing, and other search crawlers.</p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-white/80">Site Meta Title <span className="text-[#C52A35]">*</span></label>
                <span className={`text-[10px] ${formData.metaTitle.length > 60 ? "text-amber-400 font-bold" : "text-white/40"}`}>
                  {formData.metaTitle.length} / 60 chars
                </span>
              </div>
              <input
                type="text"
                required
                value={formData.metaTitle}
                onChange={(e) => handleInputChange("metaTitle", e.target.value)}
                placeholder="Rimal Lifestyle — Modern Luxury Clothing"
                className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#C52A35]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-white/80">Meta Description</label>
                <span className={`text-[10px] ${formData.metaDescription.length > 160 ? "text-amber-400 font-bold" : "text-white/40"}`}>
                  {formData.metaDescription.length} / 160 chars
                </span>
              </div>
              <textarea
                rows={3}
                value={formData.metaDescription}
                onChange={(e) => handleInputChange("metaDescription", e.target.value)}
                placeholder="Rimal Lifestyle - Your destination for modern luxury clothing, timeless panjabis, formal shirts, and premium fabrics in Bangladesh."
                className="w-full p-3.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#C52A35] resize-y"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/80 mb-1.5">Meta Keywords (comma-separated)</label>
              <input
                type="text"
                value={formData.metaKeywords}
                onChange={(e) => handleInputChange("metaKeywords", e.target.value)}
                placeholder="luxury menswear, formal shirts, panjabi, rimal, dhaka fashion, premium clothing"
                className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#C52A35]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-medium text-white/80 mb-1.5">Canonical / Website URL</label>
                <input
                  type="url"
                  value={formData.siteUrl}
                  onChange={(e) => handleInputChange("siteUrl", e.target.value)}
                  placeholder="https://rimallifestyle.com"
                  className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#C52A35]"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-white/80 mb-1.5 flex items-center gap-1.5">
                  <GoogleGIcon className="w-3.5 h-3.5 shrink-0" />
                  <span>Google Search Console Verification</span>
                </label>
                <input
                  type="text"
                  value={formData.googleVerification}
                  onChange={(e) => handleInputChange("googleVerification", e.target.value)}
                  placeholder="e.g. google-site-verification=abc..."
                  className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#C52A35]"
                />
              </div>
            </div>

            {/* Indexing Toggle */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold text-white">Search Engine Indexing</span>
                <p className="text-xs text-white/50">Allow Google and other search engines to crawl and index your store.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.allowIndexing}
                  onChange={(e) => handleInputChange("allowIndexing", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C52A35]"></div>
              </label>
            </div>
          </div>

          {/* Google Indexing & Search Console */}
          <div className="glass-card rounded-3xl p-6 space-y-5 border border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-white/10 border border-white/15 shadow-sm">
                  <GoogleGIcon className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    Google Search Console & Quick Indexing
                    <span className="px-2 py-0.5 rounded-md text-[10px] bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
                      Live Googlebot
                    </span>
                  </h2>
                  <p className="text-xs text-white/50">Submit your dynamic sitemap and get your pages crawled by Google immediately.</p>
                </div>
              </div>

              <a
                href="https://search.google.com/search-console"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white hover:bg-white/90 text-slate-900 text-xs font-semibold shadow-md transition-all"
              >
                <GoogleGIcon className="w-3.5 h-3.5 shrink-0" />
                <span>Search Console</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
              </a>
            </div>

            {/* Sitemap URL row */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-medium text-white/80">Dynamic XML Sitemap</label>
                <a
                  href="/sitemap.xml"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-[#C52A35] hover:underline flex items-center gap-1"
                >
                  <span>View live XML</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={`${(formData.siteUrl || "https://rimallifestyle.com").replace(/\/$/, "")}/sitemap.xml`}
                  className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-white/90 select-all focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleCopy(`${(formData.siteUrl || "https://rimallifestyle.com").replace(/\/$/, "")}/sitemap.xml`, 'sitemap')}
                  className="h-10 px-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0"
                >
                  {copiedSitemap ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSitemap ? "Copied" : "Copy"}</span>
                </button>
              </div>
              <p className="text-[11px] text-white/40">
                Auto-generates clean URLs for all static pages, categories, and published products every hour.
              </p>
            </div>

            {/* Robots.txt row */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-medium text-white/80">Crawling Rules (robots.txt)</label>
                <a
                  href="/robots.txt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-[#C52A35] hover:underline flex items-center gap-1"
                >
                  <span>View robots.txt</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={`${(formData.siteUrl || "https://rimallifestyle.com").replace(/\/$/, "")}/robots.txt`}
                  className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-white/90 select-all focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleCopy(`${(formData.siteUrl || "https://rimallifestyle.com").replace(/\/$/, "")}/robots.txt`, 'robots')}
                  className="h-10 px-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0"
                >
                  {copiedRobots ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedRobots ? "Copied" : "Copy"}</span>
                </button>
              </div>
              <p className="text-[11px] text-white/40">
                Protects /admin and user accounts from crawling while instructing search bots to index the storefront and sitemap.
              </p>
            </div>

            {/* Structured Data & Schema.org Status */}
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-white">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Google Rich Snippets (Schema.org JSON-LD)</span>
                </span>
                <a
                  href="https://search.google.com/test/rich-results"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-[#C52A35] hover:underline flex items-center gap-1"
                >
                  <span>Test Rich Results</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-white/70 pt-1">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>ClothingStore & Store Info</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Product Prices & In-Stock Status</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>SearchAction Sitelink Search Box</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Product Ratings & Reviews</span>
                </div>
              </div>
            </div>

            {/* Quick 3-Step Guide */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-2 text-white/80">
              <span className="font-bold text-amber-300 block flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                How to index your website on Google in 3 steps:
              </span>
              <ol className="list-decimal list-inside space-y-1.5 text-white/70 leading-relaxed text-[11px]">
                <li>
                  <strong className="text-white">Verify Ownership:</strong> Open{" "}
                  <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-amber-300 underline font-semibold">
                    <GoogleGIcon className="w-3 h-3 shrink-0" />
                    <span>Google Search Console</span>
                  </a>
                  , copy the HTML tag code or verification code into the <em>Google Search Console Verification</em> field above, and click <em>Save Changes</em>.
                </li>
                <li>
                  <strong className="text-white">Submit Sitemap:</strong> In Google Search Console, go to <strong>Sitemaps</strong>, enter <code className="text-amber-200 bg-black/40 px-1 py-0.5 rounded font-mono">sitemap.xml</code> and click <strong>Submit</strong>. Google will automatically crawl all published products and pages.
                </li>
                <li>
                  <strong className="text-white">Request Fast Indexing:</strong> In Search Console, paste your homepage or any product URL in the top <strong>URL Inspection</strong> bar and click <strong>&quot;Request Indexing&quot;</strong>.
                </li>
              </ol>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Live Social Share Preview (5 cols) */}
        <div className="xl:col-span-5 sticky top-6 flex flex-col gap-5">
          <div className="glass-card rounded-3xl p-6 border border-white/15">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#C52A35]" />
                <h3 className="text-sm font-bold text-white">Live Share Preview</h3>
              </div>
              
              {/* Platform Switcher */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/40 border border-white/10 text-xs">
                <button
                  type="button"
                  onClick={() => setPreviewTab("facebook")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                    previewTab === "facebook" ? "bg-[#C52A35] text-white font-medium shadow-sm" : "text-white/60 hover:text-white"
                  }`}
                >
                  <FacebookIcon className="w-3.5 h-3.5 shrink-0" />
                  <span>Facebook</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab("twitter")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                    previewTab === "twitter" ? "bg-[#C52A35] text-white font-medium shadow-sm" : "text-white/60 hover:text-white"
                  }`}
                >
                  <XIcon className="w-3 h-3 shrink-0" />
                  <span>X (Twitter)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab("google")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                    previewTab === "google" ? "bg-[#C52A35] text-white font-medium shadow-sm" : "text-white/60 hover:text-white"
                  }`}
                >
                  <GoogleGIcon className="w-3.5 h-3.5 shrink-0" />
                  <span>Google</span>
                </button>
              </div>
            </div>

            <p className="text-xs text-white/40 mb-4">
              This is how your link will appear when shared by customers or in chats.
            </p>

            {/* 1. Facebook / WhatsApp Preview Card */}
            {previewTab === "facebook" && (
              <div className="rounded-2xl overflow-hidden border border-white/10 bg-[#18191a] shadow-xl text-left">
                {/* Image Banner */}
                <div className="aspect-[1200/630] w-full bg-[#242526] relative overflow-hidden flex items-center justify-center">
                  {formData.ogImage ? (
                    <img
                      src={formData.ogImage}
                      alt="Banner preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-white/30 p-4 text-center">
                      <ImageIcon className="w-8 h-8" />
                      <span className="text-xs">No banner uploaded yet</span>
                    </div>
                  )}
                </div>

                {/* Content info */}
                <div className="p-3.5 bg-[#242526]">
                  <p className="text-[11px] uppercase tracking-wider text-white/50 truncate font-mono">
                    {displayDomain}
                  </p>
                  <h4 className="text-sm font-bold text-white/95 line-clamp-2 mt-0.5 leading-snug">
                    {displayTitle}
                  </h4>
                  <p className="text-xs text-white/60 line-clamp-2 mt-1 leading-relaxed">
                    {displayDesc}
                  </p>
                </div>
              </div>
            )}

            {/* 2. Twitter / X Card Preview */}
            {previewTab === "twitter" && (
              <div className="rounded-2xl overflow-hidden border border-white/15 bg-black shadow-xl text-left">
                {/* Image Banner */}
                <div className="aspect-[1200/630] w-full bg-[#16181c] relative overflow-hidden flex items-center justify-center">
                  {formData.ogImage ? (
                    <img
                      src={formData.ogImage}
                      alt="Twitter banner preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-white/30 p-4 text-center">
                      <Twitter className="w-8 h-8" />
                      <span className="text-xs">No banner uploaded</span>
                    </div>
                  )}
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 text-[10px] text-white/80 font-mono">
                    {displayDomain}
                  </span>
                </div>

                {/* Content */}
                <div className="p-3 bg-[#16181c]">
                  <h4 className="text-xs font-bold text-white/95 line-clamp-1">
                    {displayTitle}
                  </h4>
                  <p className="text-[11px] text-white/50 line-clamp-2 mt-0.5">
                    {displayDesc}
                  </p>
                </div>
              </div>
            )}

            {/* 3. Authentic Official Google Search SERP Preview */}
            {previewTab === "google" && (
              <div className="rounded-2xl p-4 bg-white text-left text-slate-800 shadow-xl border border-slate-200 space-y-3">
                {/* Official Google Search Header Bar */}
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <GoogleWordmark className="h-5 w-auto" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-50 border border-slate-200 text-[11px] text-slate-500">
                      <Search className="w-3 h-3 text-slate-400" />
                      <span className="truncate max-w-[130px]">{displayDomain}</span>
                    </div>
                    <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                      Google Preview
                    </span>
                  </div>
                </div>

                {/* Google Search Snippet */}
                <div className="space-y-1">
                  {/* Site identity line */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-slate-50 border border-slate-200/80 flex items-center justify-center shadow-xs">
                        <GoogleGIcon className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col leading-tight">
                        <span className="text-[13px] font-medium text-[#202124]">
                          Rimal Lifestyle
                        </span>
                        <span className="text-[11px] text-[#4d5156] truncate max-w-[280px]">
                          https://{displayDomain} › shop
                        </span>
                      </div>
                    </div>
                    <span className="text-slate-400 text-sm font-bold select-none cursor-pointer hover:text-slate-600 px-1">
                      ⋮
                    </span>
                  </div>

                  {/* Authentic Google Blue Title Link */}
                  <h4 className="text-[17px] font-medium text-[#1a0dab] hover:underline cursor-pointer line-clamp-1 pt-1 leading-snug">
                    {displayTitle}
                  </h4>

                  {/* Description snippet */}
                  <p className="text-[12px] text-[#4d5156] line-clamp-2 leading-relaxed pt-0.5">
                    {displayDesc}
                  </p>

                  {/* Rich Snippets / Merchant attributes preview */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 text-[11px] font-medium text-slate-600">
                    <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      ✓ In stock
                    </span>
                    <span className="text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      ৳ 2,790 BDT
                    </span>
                    <span className="text-amber-600 flex items-center gap-0.5">
                      ★ 5.0 (24 reviews)
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Helpful checklist box */}
            <div className="mt-5 p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2 text-xs text-white/60">
              <span className="font-semibold text-white/80 block">Social Sharing Best Practices:</span>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Dimensions: 1200 × 630 pixels (1.91:1 ratio)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Keep text in the center to prevent cropping</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Format: WebP or PNG for crisp high-resolution display</span>
              </div>
            </div>

            {/* Save CTA */}
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="w-full mt-4 h-11 rounded-xl bg-[#C52A35] hover:bg-[#a8222c] text-white text-sm font-semibold shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{isSaving ? "Saving..." : "Save SEO & Social Settings"}</span>
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
