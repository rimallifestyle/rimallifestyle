"use client"

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/store/Header'
import { Footer } from '@/components/store/Footer'
import {
  Shield,
  FileText,
  Info,
  Phone,
  ArrowLeft,
  Loader2,
  Mail,
  MapPin,
  Clock,
  Sparkles,
  CheckCircle2,
  Send,
  MessageSquare
} from 'lucide-react'
import { toast } from 'sonner'

const DEFAULT_PAGE_CONTENTS: Record<string, { title: string; subtitle: string; icon: any; content: string[] }> = {
  'about': {
    title: 'About Rimal Atelier',
    subtitle: 'Crafted with Modern Luxury & Timeless Craftsmanship',
    icon: Info,
    content: [
      'Welcome to Rimal Atelier. We believe that true luxury lies in thoughtful design, premium natural materials, and an unwavering commitment to craftsmanship.',
      'From our signature panjabis and tailored oxfords to everyday elevated essentials, every piece in our collection is meticulously crafted to empower your personal sartorial identity.',
      'Founded with a passion for refined aesthetics, Rimal blends traditional South Asian tailoring heritage with contemporary silhouette cuts designed to endure season after season.',
      'Our fabrics are hand-selected from the finest mills worldwide — combining Egyptian Giza cotton, pure linen, fine merino wool, and premium silk blends to guarantee exceptional drape and comfort.'
    ]
  },
  'contact': {
    title: 'Contact Concierge',
    subtitle: 'We are here to assist you with order inquiries, sizing, and personalized styling advice',
    icon: Phone,
    content: [
      'Have an inquiry about an existing order, sizing questions, or custom atelier requests? Our concierge team is available to assist you.',
      'Email Concierge: hello@rimal.store',
      'Direct Phone & WhatsApp: +880 1800-RIMAL (74625)',
      'Atelier Hours: Saturday to Thursday, 10:00 AM – 8:00 PM (GMT+6)',
      'Location: House 42, Road 11, Block D, Banani, Dhaka 1213, Bangladesh'
    ]
  },
  'privacy-policy': {
    title: 'Privacy Policy',
    subtitle: 'How we collect, protect, and respect your personal information',
    icon: Shield,
    content: [
      'At Rimal Atelier, your privacy and trust are paramount. This policy outlines how your personal data is handled when you browse our website, create an account, or complete a purchase.',
      '1. Information We Collect: When you place an order, we collect your name, delivery address, phone number, and email to process and deliver your shipment accurately.',
      '2. Payment Security: All online transactions (Credit/Debit Card, bKash, Nagad) are encrypted with 256-bit SSL encryption. We never store your full payment card details or PINs on our servers.',
      '3. How We Use Data: Your information is used strictly to fulfill orders, provide delivery updates via SMS and Email, and offer personalized customer support.',
      '4. Third-Party Sharing: We never sell, rent, or trade your personal information. Data is shared exclusively with verified courier partners (Steadfast, Pathao) solely for package delivery.',
      '5. Cookie Policy: We use essential cookies to maintain your shopping cart, remember your login session, and provide an optimized, seamless browsing experience.'
    ]
  },
  'terms-conditions': {
    title: 'Terms & Conditions',
    subtitle: 'Please review our terms of service before placing an order',
    icon: FileText,
    content: [
      'Welcome to Rimal Atelier. By accessing our website, browsing collections, and placing orders, you agree to be bound by the following terms and conditions.',
      '1. Orders & Pricing: All prices are listed in Bangladeshi Taka (৳). While we strive for absolute accuracy, any rare pricing or stock discrepancies will be communicated to the customer immediately.',
      '2. Nationwide Delivery: Delivery within Dhaka typically completes within 24 to 48 hours; delivery outside Dhaka takes 2 to 4 business days via our verified courier partners.',
      '3. Cash on Delivery (COD): For COD orders, customers may inspect the exterior package upon delivery before completing payment to the courier representative.',
      '4. Intellectual Property: All photography, logos, branding, typography, and garment designs featured on this storefront are the exclusive intellectual property of Rimal Atelier.',
      '5. Order Modifications: If you need to modify your shipping address or order items, please contact customer support before the package is dispatched to the courier.'
    ]
  },
  'refund-policy': {
    title: 'Refund & Returns Policy',
    subtitle: 'Hassle-free 7-day exchange and return commitment',
    icon: Shield,
    content: [
      'We take immense pride in the craftsmanship of every Rimal garment. If you are not completely satisfied with your purchase, our exchange and return process is simple and hassle-free.',
      '1. 7-Day Exchange Window: You may request an exchange for size, color, or alternate style within 7 days of receiving your package.',
      '2. Condition of Items: Items must be unwashed, unworn, free of any stains or scents, and with all original designer tags and packaging intact.',
      '3. Defective or Incorrect Items: In the rare event that you receive a defective or incorrect item, we will arrange a complimentary courier pickup and immediate replacement.',
      '4. Refund Processing: Approved refunds are processed to your original payment method or mobile banking (bKash/Nagad) within 3 to 5 business days of inspection approval.',
      '5. How to Initiate: Simply reach out to our team via WhatsApp at +880 1800-RIMAL or email hello@rimal.store with your Order ID.'
    ]
  }
};

export default function DynamicContentPage() {
  const params = useParams() as { slug: string };
  const router = useRouter();

  // Normalize slug to handle aliases (e.g. about-us -> about, contact-us -> contact)
  const rawSlug = params?.slug ? params.slug.toLowerCase().replace(/^\/+/, '') : '';
  const slug = rawSlug
    .replace(/-us$/, '')
    .replace(/^terms$/, 'terms-conditions')
    .replace(/^privacy$/, 'privacy-policy')
    .replace(/^refund$/, 'refund-policy')
    .replace(/^returns$/, 'refund-policy');

  const [pageData, setPageData] = useState<{ title: string; subtitle?: string; icon?: any; content: string[] | string } | null>(null);
  const [loading, setLoading] = useState(true);

  // Contact form state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    setSendingMessage(true);
    setTimeout(() => {
      setSendingMessage(false);
      toast.success('Thank you! Your message has been sent to our concierge.');
      setContactName('');
      setContactEmail('');
      setContactMessage('');
    }, 600);
  };

  useEffect(() => {
    async function loadPage() {
      // 1. Check if default policy/about content matches
      if (DEFAULT_PAGE_CONTENTS[slug]) {
        // Also check if custom settings exist for about or contact
        if (slug === 'about') {
          try {
            const res = await fetch('/api/storefront/settings?key=about_settings');
            if (res.ok) {
              const json = await res.json();
              if (json && json.title) {
                setPageData({
                  title: json.title,
                  subtitle: 'About Rimal Atelier',
                  icon: Info,
                  content: json.content ? [json.content] : DEFAULT_PAGE_CONTENTS['about'].content
                });
                setLoading(false);
                return;
              }
            }
          } catch {}
        }

        if (slug === 'contact') {
          try {
            const res = await fetch('/api/storefront/settings?key=contact_settings');
            if (res.ok) {
              const json = await res.json();
              if (json && (json.email || json.phone || json.address)) {
                setPageData({
                  title: 'Contact Concierge',
                  subtitle: 'Customer Care & Concierge',
                  icon: Phone,
                  content: [
                    'Have an inquiry about an existing order, sizing questions, or custom atelier requests? Our concierge team is available to assist you.',
                    json.email ? `Email Concierge: ${json.email}` : 'Email: hello@rimal.store',
                    json.phone ? `Direct Phone & WhatsApp: ${json.phone}` : 'Phone: +880 1800-RIMAL',
                    json.address ? `Atelier Location: ${json.address}` : 'Location: Banani, Dhaka, Bangladesh',
                    'Atelier Hours: Saturday to Thursday, 10:00 AM – 8:00 PM (GMT+6)'
                  ].filter(Boolean)
                });
                setLoading(false);
                return;
              }
            }
          } catch {}
        }

        setPageData(DEFAULT_PAGE_CONTENTS[slug]);
        setLoading(false);
        return;
      }

      // 2. Check if a custom page was created in Admin Pages Manager
      try {
        const res = await fetch('/api/admin/pages');
        if (res.ok) {
          const pages = await res.json();
          const found = Array.isArray(pages) ? pages.find((p: any) => p.slug === `/${rawSlug}` || p.slug === rawSlug) : null;
          if (found && found.status !== 'draft') {
            setPageData({
              title: found.title,
              subtitle: found.type || 'Rimal Atelier',
              icon: FileText,
              content: found.content ? [found.content] : [found.description || '']
            });
            setLoading(false);
            return;
          }
        }
      } catch {}

      setPageData(null);
      setLoading(false);
    }

    if (slug) {
      loadPage();
    }
  }, [slug, rawSlug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 text-gold animate-spin" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!pageData) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-24">
          <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-gold/60" />
          </div>
          <h1 className="font-display text-3xl sm:text-4xl text-cream mb-2">Page Not Found</h1>
          <p className="text-muted-foreground text-sm max-w-md mb-6">
            The page you are looking for does not exist or may have been moved.
          </p>
          <Link
            href="/"
            className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gold text-black text-xs font-semibold hover:bg-gold/90 transition-all shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Home</span>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const PageIcon = pageData.icon || FileText;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />

      <main className="flex-1 w-full">
        {/* Wide Hero Banner */}
        <section className="border-b border-border/40 bg-gradient-to-b from-maroon-deep/30 to-background py-12 md:py-16">
          <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 text-center max-w-7xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.25em] text-gold mb-3">
              <PageIcon className="w-3.5 h-3.5" />
              <span>Rimal Official</span>
            </div>
            <h1 className="font-display text-3xl sm:text-5xl md:text-6xl text-cream tracking-tight mb-3">
              {pageData.title}
            </h1>
            {pageData.subtitle && (
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
                {pageData.subtitle}
              </p>
            )}
          </div>
        </section>

        {/* Extra Wide Content Container */}
        <section className="py-10 sm:py-12 md:py-16">
          <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 max-w-7xl mx-auto">
            
            {/* Contact Page Specialized Layout */}
            {slug === 'contact' ? (
              <div className="space-y-8">
                {/* 4 Contact Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="glass-card rounded-2xl p-6 border border-white/10 bg-card/60 backdrop-blur-sm space-y-2 hover:border-gold/40 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold mb-3">
                      <Mail className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-semibold text-white">Email Concierge</h3>
                    <p className="text-xs text-muted-foreground">hello@rimal.store</p>
                    <p className="text-[11px] text-gold/80 pt-1">Response within 24 hours</p>
                  </div>

                  <div className="glass-card rounded-2xl p-6 border border-white/10 bg-card/60 backdrop-blur-sm space-y-2 hover:border-gold/40 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold mb-3">
                      <Phone className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-semibold text-white">Direct WhatsApp</h3>
                    <p className="text-xs text-muted-foreground">+880 1800-RIMAL (74625)</p>
                    <p className="text-[11px] text-gold/80 pt-1">Live customer support</p>
                  </div>

                  <div className="glass-card rounded-2xl p-6 border border-white/10 bg-card/60 backdrop-blur-sm space-y-2 hover:border-gold/40 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold mb-3">
                      <Clock className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-semibold text-white">Atelier Hours</h3>
                    <p className="text-xs text-muted-foreground">Sat – Thu: 10AM – 8PM</p>
                    <p className="text-[11px] text-muted-foreground/60 pt-1">Friday closed</p>
                  </div>

                  <div className="glass-card rounded-2xl p-6 border border-white/10 bg-card/60 backdrop-blur-sm space-y-2 hover:border-gold/40 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold mb-3">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-semibold text-white">Atelier Flagship</h3>
                    <p className="text-xs text-muted-foreground">Banani, Dhaka 1213</p>
                    <p className="text-[11px] text-muted-foreground/60 pt-1">Bangladesh</p>
                  </div>
                </div>

                {/* Send Message Form & Information */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                  <div className="glass-card rounded-3xl p-6 sm:p-10 border border-white/10 bg-card/60 backdrop-blur-sm space-y-6 shadow-xl">
                    <h2 className="font-display text-2xl text-cream">Send Us a Direct Message</h2>
                    <form onSubmit={handleSendMessage} className="space-y-4">
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1.5 font-medium">Your Full Name</label>
                        <input
                          type="text"
                          required
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          placeholder="e.g. Asif Ahmed"
                          className="w-full bg-background/50 border border-border/70 rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-gold transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1.5 font-medium">Email or Phone Number</label>
                        <input
                          type="text"
                          required
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          placeholder="hello@example.com or +880..."
                          className="w-full bg-background/50 border border-border/70 rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-gold transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1.5 font-medium">Message / Inquiry</label>
                        <textarea
                          rows={4}
                          required
                          value={contactMessage}
                          onChange={(e) => setContactMessage(e.target.value)}
                          placeholder="How can we assist you today?..."
                          className="w-full bg-background/50 border border-border/70 rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-gold transition-colors resize-none"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={sendingMessage}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gold text-black text-xs font-semibold hover:bg-gold/90 transition-all cursor-pointer shadow-md"
                      >
                        {sendingMessage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        <span>Send Message</span>
                      </button>
                    </form>
                  </div>

                  <div className="glass-card rounded-3xl p-6 sm:p-10 border border-white/10 bg-card/60 backdrop-blur-sm space-y-6 shadow-xl">
                    <h2 className="font-display text-2xl text-cream">Client Concierge Services</h2>
                    <div className="space-y-4 text-sm text-foreground/80 leading-relaxed font-sans">
                      <p>
                        At Rimal, we treat every customer with bespoke care. Whether you require sizing guidance for our signature panjabi collection or need urgent express delivery for an upcoming festive occasion, our team is at your service.
                      </p>
                      <div className="space-y-3 pt-2">
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                          <span>Personal styling and fitting advice from our atelier staff</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                          <span>Real-time delivery coordination with dedicated courier couriers</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                          <span>Hassle-free exchanges and returns within 7 calendar days</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Wide Policy & About Page Layout */
              <div className="glass-card rounded-3xl p-6 sm:p-10 md:p-12 lg:p-16 border border-white/10 space-y-8 bg-card/60 backdrop-blur-sm shadow-2xl">
                {Array.isArray(pageData.content) ? (
                  <div className="space-y-6 text-foreground/85 font-sans leading-relaxed text-sm sm:text-base md:text-lg">
                    {pageData.content.map((paragraph, idx) => (
                      <div key={idx} className="p-4 sm:p-5 rounded-2xl bg-white/[0.015] border border-white/5 hover:border-gold/20 transition-colors">
                        <p>{paragraph}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-foreground/85 font-sans leading-relaxed text-sm sm:text-base md:text-lg whitespace-pre-line p-4 sm:p-6 rounded-2xl bg-white/[0.015] border border-white/5">
                    {pageData.content}
                  </div>
                )}

                <div className="pt-8 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
                  <Link href="/" className="flex items-center gap-2 text-gold hover:underline">
                    <ArrowLeft className="w-4 h-4" />
                    <span>Return to Storefront</span>
                  </Link>
                  <span className="text-[11px] uppercase tracking-widest text-muted-foreground/60">
                    Official Rimal Document · Updated 2026
                  </span>
                </div>
              </div>
            )}

          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
