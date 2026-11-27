"use client";

import { usePathname } from "next/navigation";
import { WhatsAppIcon } from "./SocialIcons";

export function FloatingWhatsApp() {
  const pathname = usePathname();

  // Hide on admin routes
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const phoneNumber = "8801577229347";
  const message = encodeURIComponent("Hello Rimal Lifestyle, I have an inquiry.");
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <aside aria-label="Customer Support" className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp (+880 1577-229347)"
        title="Chat on WhatsApp"
        className="group relative flex h-13 w-13 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_4px_20px_rgba(37,211,102,0.45)] hover:shadow-[0_6px_28px_rgba(37,211,102,0.65)] hover:scale-108 active:scale-95 transition-all duration-300 cursor-pointer"
      >
        {/* Subtle pulse wave */}
        <span className="absolute -inset-1 rounded-full bg-[#25D366]/30 animate-ping pointer-events-none" />

        {/* WhatsApp Real Icon */}
        <WhatsAppIcon className="h-7 w-7 text-white fill-white relative z-10 transition-transform duration-300 group-hover:scale-110" />

        {/* Floating Tooltip Pill */}
        <span className="absolute right-full mr-3 hidden sm:group-hover:flex items-center px-3 py-1.5 rounded-xl bg-black/90 text-white text-xs font-medium shadow-lg backdrop-blur-md whitespace-nowrap pointer-events-none border border-white/10 transition-opacity animate-in fade-in zoom-in-95 duration-200">
          Chat with us on WhatsApp
        </span>
      </a>
    </aside>
  );
}
