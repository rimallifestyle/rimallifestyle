import { useEffect, useState } from "react";
import { API_ROOT } from "@/lib/api";
import {
  InstagramIcon,
  TikTokIcon,
  FacebookIcon,
  WhatsAppIcon,
  TwitterIcon,
  YouTubeIcon,
} from "./SocialIcons";

interface Link {
  label: string;
  url: string;
}

interface FooterData {
  description: string;
  socialLinks: {
    instagram?: string;
    tiktok?: string;
    facebook?: string;
    whatsapp?: string;
    twitter?: string;
    youtube?: string;
  };
  columns: { title: string; links: Link[] }[];
  bottomLinks: Link[];
}

const initialFooterData: FooterData = {
  description: "Rimal Store crafts refined menswear inspired by heritage tailoring and modern design. Made to last a lifetime.",
  socialLinks: {
    instagram: "https://www.instagram.com/rimallifestyle/",
    tiktok: "https://www.tiktok.com/@rimal.lifestyle",
    facebook: "https://www.facebook.com/rimallifestyle",
    whatsapp: "https://wa.me/8801577229347",
    twitter: "",
    youtube: ""
  },
  columns: [
    { title: "Shop", links: [{label: "New Arrivals", url: "/shop?category=new"}] },
    { title: "About", links: [{label: "Our Story", url: "/about"}] },
    { title: "Help", links: [{label: "Contact", url: "/contact"}] }
  ],
  bottomLinks: [{label: "Privacy Policy", url: "/privacy-policy"}, {label: "Terms & Conditions", url: "/terms-conditions"}, {label: "Refund Policy", url: "/refund-policy"}]
};

export function Footer() {
  const [data, setData] = useState<FooterData>(initialFooterData);

  useEffect(() => {
    fetch(`${API_ROOT}storefront/settings?key=footer_settings`)
      .then(res => res.ok ? res.json() : null)
      .then(json => {
        if (!json || json.error || json.message || Object.keys(json).length === 0) {
          setData(initialFooterData);
        } else {
          setData({
             description: json.description || initialFooterData.description,
             socialLinks: json.socialLinks || initialFooterData.socialLinks,
             columns: json.columns || initialFooterData.columns,
             bottomLinks: json.bottomLinks || initialFooterData.bottomLinks
          });
        }
      })
      .catch(() => {
        setData(initialFooterData);
      });

    // Listen for live updates from builder
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'STOREFRONT_PREVIEW_UPDATE' && e.data?.component === 'footer') {
        setData(e.data.data);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleFooterClick = () => {};

  if (!data) return null; // or a skeleton

  return (
    <footer 
      id="contact" 
      className="border-t border-border/60 bg-maroon-deep pt-20 relative"
      onClick={handleFooterClick}
    >
      
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 relative z-10">
        {/* Newsletter */}
        <div className="grid gap-12 border-b border-border/50 pb-16 md:grid-cols-2">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.35em] text-gold">
              Join the atelier
            </p>
            <h3 className="mt-3 font-display text-3xl md:text-4xl">Be the first to know.</h3>
            <p className="mt-3 max-w-md text-sm text-muted-foreground">
              Early access to drops, private sales, and stories from the workshop.
            </p>
          </div>
          <form className="flex items-end gap-3" onSubmit={(e) => { e.preventDefault(); }}>
            <div className="flex-1">
              <label className="mb-2 block text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                Email address
              </label>
              <input
                type="email"
                required
                placeholder="you@example.com"
                className="w-full border-0 border-b border-border bg-transparent px-0 py-3 text-cream placeholder:text-muted-foreground/60 focus:border-gold focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="bg-accent px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-accent-foreground transition hover:bg-gold-soft"
              onClick={(e) => {}}
            >
              Subscribe
            </button>
          </form>
        </div>

        {/* Columns */}
        <div className="grid gap-12 py-16 md:grid-cols-4">
          <div>
            <div className="font-display text-3xl text-gold">Rimal</div>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              {data.description}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3 text-muted-foreground">
              {data.socialLinks?.instagram && (
                <a
                  href={data.socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  title="Follow on Instagram"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 border border-white/10 hover:border-gold hover:text-gold hover:bg-gold/10 transition-all duration-300 hover:scale-110"
                >
                  <InstagramIcon className="h-4 w-4" />
                </a>
              )}
              {data.socialLinks?.tiktok && (
                <a
                  href={data.socialLinks.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok"
                  title="Follow on TikTok"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 border border-white/10 hover:border-gold hover:text-gold hover:bg-gold/10 transition-all duration-300 hover:scale-110"
                >
                  <TikTokIcon className="h-4 w-4" />
                </a>
              )}
              {data.socialLinks?.facebook && (
                <a
                  href={data.socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  title="Follow on Facebook"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 border border-white/10 hover:border-gold hover:text-gold hover:bg-gold/10 transition-all duration-300 hover:scale-110"
                >
                  <FacebookIcon className="h-4 w-4" />
                </a>
              )}
              {data.socialLinks?.whatsapp && (
                <a
                  href={data.socialLinks.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp (+880 1577-229347)"
                  title="Chat on WhatsApp"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 border border-white/10 hover:border-[#25D366] hover:text-[#25D366] hover:bg-[#25D366]/10 transition-all duration-300 hover:scale-110"
                >
                  <WhatsAppIcon className="h-4 w-4" />
                </a>
              )}
              {data.socialLinks?.twitter && (
                <a
                  href={data.socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter"
                  title="Follow on X / Twitter"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 border border-white/10 hover:border-gold hover:text-gold hover:bg-gold/10 transition-all duration-300 hover:scale-110"
                >
                  <TwitterIcon className="h-4 w-4" />
                </a>
              )}
              {data.socialLinks?.youtube && (
                <a
                  href={data.socialLinks.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  title="Subscribe on YouTube"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 border border-white/10 hover:border-gold hover:text-gold hover:bg-gold/10 transition-all duration-300 hover:scale-110"
                >
                  <YouTubeIcon className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
          {data.columns?.map((c: any, index: number) => (
            <div key={index}>
              <h4 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.3em] text-gold">
                {c.title}
              </h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {c.links?.map((l: any, i: number) => (
                  <li key={i}>
                    <a href={l.url} className="transition hover:text-gold" onClick={(e) => {}}>
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-border/50 py-8 text-xs text-muted-foreground md:flex-row">
          <p>© {new Date().getFullYear()} Rimal Store. All rights reserved.</p>
          <p className="flex gap-6">
            {data.bottomLinks?.map((l: any, i: number) => (
              <a key={i} href={l.url} className="hover:text-gold" onClick={(e) => {}}>
                {l.label}
              </a>
            ))}
          </p>
        </div>
      </div>
    </footer>
  );
}


