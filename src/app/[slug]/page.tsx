"use client"

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/store/Header'
import { Footer } from '@/components/store/Footer'
import { Shield, FileText, Info, Phone, ArrowLeft, Loader2, Mail, MapPin, CheckCircle2 } from 'lucide-react'

const DEFAULT_PAGE_CONTENTS: Record<string, { title: string; subtitle: string; content: string[] }> = {
  'about': {
    title: 'About Rimal',
    subtitle: 'Crafted with Modern Luxury & Timeless Craftsmanship',
    content: [
      'Welcome to Rimal Atelier. We believe that true luxury lies in thoughtful design, premium natural materials, and an unwavering commitment to craftsmanship.',
      'From our signature panjabis and tailored oxfords to everyday essentials, every piece in our collection is meticulously crafted to empower your personal style.',
      'Founded with a passion for refined aesthetics, Rimal blends traditional sartorial heritage with contemporary silhouette cuts designed to last a lifetime.'
    ]
  },
  'contact': {
    title: 'Contact Us',
    subtitle: 'We are here to assist you with any questions or order inquiries',
    content: [
      'Have an inquiry about your order, sizing, or styling advice? Our concierge team is ready to help.',
      'Email: hello@rimal.store',
      'Phone / WhatsApp: +880 1800-RIMAL (74625)',
      'Atelier Hours: Saturday to Thursday, 10:00 AM – 8:00 PM (GMT+6)',
      'Location: House 42, Road 11, Banani, Dhaka, Bangladesh'
    ]
  },
  'privacy-policy': {
    title: 'Privacy Policy',
    subtitle: 'How we collect, protect, and respect your personal information',
    content: [
      'At Rimal, your privacy and trust are paramount. This policy outlines how we handle your personal data when you visit our website or make a purchase.',
      '1. Information We Collect: We collect your name, shipping address, contact phone number, and email when you place an order or register an account.',
      '2. Payment Security: All online payments (Credit Card, bKash, Nagad) are processed through encrypted, bank-grade payment gateways. We never store your full payment card details or PINs.',
      '3. How We Use Data: We use your information solely to fulfill orders, provide delivery updates via SMS/Email, and enhance your shopping experience.',
      '4. Third-Party Sharing: We never sell or rent your personal information to third parties. Data is only shared with verified delivery partners (e.g., Steadfast, Pathao) to ensure accurate delivery.'
    ]
  },
  'terms-conditions': {
    title: 'Terms & Conditions',
    subtitle: 'Please review our terms of service before placing an order',
    content: [
      'Welcome to Rimal. By browsing our website and placing orders, you agree to comply with and be bound by the following terms and conditions.',
      '1. Orders & Pricing: All prices are listed in Bangladeshi Taka (৳). While we strive for accuracy, errors in pricing or availability may occasionally occur and will be corrected promptly.',
      '2. Nationwide Delivery: Delivery within Dhaka typically takes 24–48 hours; delivery outside Dhaka takes 2–4 business days via verified courier partners.',
      '3. Cash on Delivery (COD): For Cash on Delivery orders, customers are requested to verify the outer parcel condition upon delivery.',
      '4. Intellectual Property: All photography, logos, branding, and product designs featured on this website are the exclusive property of Rimal Atelier.'
    ]
  },
  'refund-policy': {
    title: 'Refund & Returns Policy',
    subtitle: 'Hassle-free 7-day exchange and return commitment',
    content: [
      'We stand behind the quality and craftsmanship of every Rimal piece. If you are not completely satisfied with your purchase, we offer a straightforward exchange and return process.',
      '1. 7-Day Exchange Window: You may request an exchange for size or color within 7 days of receiving your package.',
      '2. Condition of Items: Items must be unwashed, unworn, in their original condition with all tags and designer packaging intact.',
      '3. Damaged or Incorrect Items: In the rare event that you receive a defective or incorrect item, we will arrange a complimentary pickup and replacement.',
      '4. Refund Processing: Approved refunds will be processed to the original payment method or via mobile banking (bKash/Nagad) within 3–5 business days.'
    ]
  }
};

export default function DynamicContentPage() {
  const params = useParams() as { slug: string };
  const router = useRouter();
  const slug = params?.slug ? params.slug.toLowerCase().replace(/^\/+/, '') : '';

  const [pageData, setPageData] = useState<{ title: string; subtitle?: string; content: string[] | string } | null>(null);
  const [loading, setLoading] = useState(true);

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
                  title: 'Contact Us',
                  subtitle: 'Customer Care & Concierge',
                  content: [
                    json.email ? `Email: ${json.email}` : '',
                    json.phone ? `Phone: ${json.phone}` : '',
                    json.address ? `Address: ${json.address}` : '',
                    'Atelier Hours: Saturday to Thursday, 10:00 AM – 8:00 PM'
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
          const found = Array.isArray(pages) ? pages.find((p: any) => p.slug === `/${slug}` || p.slug === slug) : null;
          if (found && found.status !== 'draft') {
            setPageData({
              title: found.title,
              subtitle: found.type || 'Rimal Atelier',
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
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
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
        <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-16">
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

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />

      <main className="flex-1 w-full">
        {/* Hero Banner */}
        <section className="border-b border-border/40 bg-gradient-to-b from-maroon-deep/30 to-background py-12 md:py-16">
          <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 text-center max-w-4xl mx-auto">
            <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.3em] text-gold mb-2 block">
              Rimal Atelier
            </span>
            <h1 className="font-display text-3xl sm:text-5xl text-cream tracking-tight mb-3">
              {pageData.title}
            </h1>
            {pageData.subtitle && (
              <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
                {pageData.subtitle}
              </p>
            )}
          </div>
        </section>

        {/* Content Body */}
        <section className="py-12 md:py-16">
          <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 max-w-3xl mx-auto">
            <div className="glass-card rounded-3xl p-6 sm:p-10 border border-white/10 space-y-6 bg-card/60 backdrop-blur-sm shadow-xl">
              {Array.isArray(pageData.content) ? (
                pageData.content.map((paragraph, idx) => (
                  <p key={idx} className="text-sm sm:text-base text-foreground/85 leading-relaxed font-sans">
                    {paragraph}
                  </p>
                ))
              ) : (
                <p className="text-sm sm:text-base text-foreground/85 leading-relaxed font-sans whitespace-pre-line">
                  {pageData.content}
                </p>
              )}

              <div className="pt-6 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                <Link href="/" className="flex items-center gap-1.5 text-gold hover:underline">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Store</span>
                </Link>
                <span>Rimal Official Document</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
