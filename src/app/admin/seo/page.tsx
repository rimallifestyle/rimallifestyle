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
  HelpCircle
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

export default function SeoSettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewTab, setPreviewTab] = useState<"facebook" | "twitter" | "google">("facebook");
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
                <label className="block text-xs font-medium text-white/80 mb-1.5">Google Search Console Verification</label>
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
              <div className="flex items-center gap-1 p-1 rounded-xl bg-black/40 border border-white/10 text-xs">
                <button
                  type="button"
                  onClick={() => setPreviewTab("facebook")}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    previewTab === "facebook" ? "bg-[#C52A35] text-white font-medium" : "text-white/60 hover:text-white"
                  }`}
                >
                  Facebook / WhatsApp
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab("twitter")}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    previewTab === "twitter" ? "bg-[#C52A35] text-white font-medium" : "text-white/60 hover:text-white"
                  }`}
                >
                  X / Twitter
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab("google")}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    previewTab === "google" ? "bg-[#C52A35] text-white font-medium" : "text-white/60 hover:text-white"
                  }`}
                >
                  Google
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

            {/* 3. Google Search Preview */}
            {previewTab === "google" && (
              <div className="rounded-2xl p-4 bg-white text-left text-slate-800 shadow-xl border border-slate-200">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-[#C52A35]">
                    R
                  </div>
                  <div className="flex flex-col leading-tight">
                    <span className="text-xs text-slate-900 font-medium">Rimal Lifestyle</span>
                    <span className="text-[10px] text-slate-500 truncate max-w-[240px]">
                      {formData.siteUrl || "https://rimallifestyle.com"}
                    </span>
                  </div>
                </div>
                <h4 className="text-base font-medium text-[#1a0dab] hover:underline cursor-pointer line-clamp-1">
                  {displayTitle}
                </h4>
                <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                  {displayDesc}
                </p>
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
