"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Save, Loader2, Megaphone, Gauge, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface MarqueeItem {
  id: string | number;
  text: string;
}

const API = "/api/storefront/marquee";

export default function MarqueePage() {
  const [items, setItems] = useState<MarqueeItem[]>([]);
  const [speed, setSpeed] = useState<number>(16);
  const [enabled, setEnabled] = useState<boolean>(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(API + "?t=" + Date.now())
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data === "object") {
          if (Array.isArray(data.items)) {
            setItems(data.items);
          } else if (Array.isArray(data)) {
            setItems(data);
          }
          if (typeof data.speed === "number") setSpeed(data.speed);
          if (typeof data.enabled === "boolean") setEnabled(data.enabled);
        }
      })
      .catch(() => toast.error("Failed to load announcement bar settings"))
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        enabled,
        speed: Number(speed) || 16,
        items: items.filter((it) => it.text.trim() !== ""),
      };

      const res = await fetch(API, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error();

      try {
        localStorage.setItem("rimal_marquee_cache", JSON.stringify(payload));
      } catch (e) {}

      // Emit live update for preview if open
      const iframe = document.getElementById("storefront-preview") as HTMLIFrameElement;
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage(
          { type: "STOREFRONT_PREVIEW_UPDATE", component: "marquee", data: payload },
          "*"
        );
      }

      toast.success("Announcement bar saved successfully!");
    } catch {
      toast.error("Failed to save announcement bar");
    } finally {
      setSaving(false);
    }
  };

  const updateText = (i: number, val: string) => {
    const updated = [...items];
    updated[i] = { ...updated[i], text: val };
    setItems(updated);
  };

  const addItem = () => {
    const newItem: MarqueeItem = {
      id: Date.now().toString(),
      text: "NEW ANNOUNCEMENT TEXT",
    };
    setItems([...items, newItem]);
  };

  const removeItem = (i: number) => {
    const updated = [...items];
    updated.splice(i, 1);
    setItems(updated);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-[#C52A35] animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full h-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-[#C52A35]" />
            Announcement Bar
          </h1>
          <p className="text-white/50 text-sm mt-1">
            Edit, add, or delete scrolling announcement texts and adjust scroll speed
          </p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#7A1111] to-[#550000] text-white font-semibold text-sm hover:shadow-[0_0_20px_rgba(197,42,53,0.4)] transition-all cursor-pointer disabled:opacity-50 shrink-0"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* Main Settings Card */}
      <div className="glass-card rounded-2xl p-5 md:p-6 space-y-6 border border-white/10">
        {/* Speed & Visibility Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-white/10">
          <div>
            <label className="text-white/70 text-xs font-medium flex items-center gap-1.5 mb-1.5">
              <Gauge className="w-4 h-4 text-gold" />
              Scroll Speed (Seconds per cycle)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="8"
                max="35"
                step="2"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="flex-1 accent-gold cursor-pointer"
              />
              <span className="text-xs font-mono text-gold bg-black/40 border border-white/10 px-2.5 py-1 rounded-md min-w-[50px] text-center">
                {speed}s {speed <= 12 ? "(Fast)" : speed <= 18 ? "(Normal)" : "(Slow)"}
              </span>
            </div>
            <p className="text-[11px] text-white/40 mt-1">
              Lower number = faster scrolling animation. Recommended: 14s – 18s.
            </p>
          </div>

          <div className="flex sm:justify-end items-center">
            <label className="flex items-center gap-2 cursor-pointer p-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all select-none">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="rounded accent-emerald-500 w-4 h-4 cursor-pointer"
              />
              <div>
                <span className="text-xs font-semibold text-white block">
                  Announcement Bar Visibility
                </span>
                <span className="text-[11px] text-white/50 block">
                  {enabled ? "Visible on top of website" : "Hidden from website"}
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Announcement List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">
              Announcements ({items.length})
            </h3>
            <button
              type="button"
              onClick={addItem}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold/10 border border-gold/30 text-gold text-xs font-medium hover:bg-gold/20 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Announcement
            </button>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-10 bg-black/20 rounded-xl border border-dashed border-white/10">
              <p className="text-white/40 text-xs">No announcements active.</p>
              <button
                type="button"
                onClick={addItem}
                className="mt-2 text-xs text-gold hover:underline"
              >
                + Add your first announcement
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {items.map((item, i) => (
                <div
                  key={item.id || i}
                  className="flex items-center gap-3 bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 hover:border-white/20 transition-all group"
                >
                  <span className="text-[11px] font-mono text-gold/60 w-5 text-center">
                    {i + 1}
                  </span>

                  <input
                    type="text"
                    value={item.text}
                    onChange={(e) => updateText(i, e.target.value)}
                    placeholder="Enter announcement text..."
                    className="flex-1 bg-transparent text-sm text-white focus:outline-none placeholder:text-white/25"
                  />

                  <button
                    type="button"
                    onClick={() => removeItem(i)}
                    title="Delete announcement"
                    className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
