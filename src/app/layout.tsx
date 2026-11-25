import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import "../styles.css";
import { Providers } from "./Providers";
import { GlobalModals } from "./GlobalModals";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
});

import connectToDatabase from "@/lib/mongodb";
import Setting from "@/models/Setting";

export async function generateMetadata(): Promise<Metadata> {
  let faviconUrl = "/favicon.ico";
  let storeName = "Rimal Store";
  let metaTitle = "";
  let metaDescription = "";
  let metaKeywords = "";
  let ogTitle = "";
  let ogDescription = "";
  let ogImage = "";
  let siteUrl = "https://rimallifestyle.com";
  let twitterCard: "summary" | "summary_large_image" = "summary_large_image";
  let googleVerification = "";
  let allowIndexing = true;
  
  try {
    await connectToDatabase();
    const siteSetting = await Setting.findOne({ key: "site_identity" });
    if (siteSetting && siteSetting.value) {
      if (siteSetting.value.faviconUrl) faviconUrl = siteSetting.value.faviconUrl;
      if (siteSetting.value.storeName) storeName = siteSetting.value.storeName;
    }

    const seoSetting = await Setting.findOne({ key: "seo_settings" });
    if (seoSetting && seoSetting.value) {
      const v = seoSetting.value;
      if (v.metaTitle) metaTitle = v.metaTitle;
      if (v.metaDescription) metaDescription = v.metaDescription;
      if (v.metaKeywords) metaKeywords = v.metaKeywords;
      if (v.ogTitle) ogTitle = v.ogTitle;
      if (v.ogDescription) ogDescription = v.ogDescription;
      if (v.ogImage) ogImage = v.ogImage;
      if (v.siteUrl) siteUrl = v.siteUrl;
      if (v.twitterCard) twitterCard = v.twitterCard;
      if (v.googleVerification) googleVerification = v.googleVerification;
      if (typeof v.allowIndexing === "boolean") allowIndexing = v.allowIndexing;
    }
  } catch (e) {
    console.error("Error fetching site metadata:", e);
  }

  const title = metaTitle || `${storeName} — Modern Luxury Clothing`;
  const description = metaDescription || `${storeName} - Your destination for modern luxury clothing`;
  const socialTitle = ogTitle || title;
  const socialDescription = ogDescription || description;

  const metadata: Metadata = {
    title,
    description,
    ...(metaKeywords && { keywords: metaKeywords.split(",").map((k: string) => k.trim()) }),
    icons: {
      icon: faviconUrl,
      shortcut: faviconUrl,
      apple: faviconUrl,
    },
    robots: {
      index: allowIndexing,
      follow: allowIndexing,
    },
    openGraph: {
      title: socialTitle,
      description: socialDescription,
      url: siteUrl,
      siteName: storeName,
      type: "website",
      locale: "en_US",
      ...(ogImage && {
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: socialTitle,
          },
        ],
      }),
    },
    twitter: {
      card: twitterCard,
      title: socialTitle,
      description: socialDescription,
      ...(ogImage && { images: [ogImage] }),
    },
    ...(googleVerification && {
      verification: {
        google: googleVerification,
      },
    }),
  };

  try {
    metadata.metadataBase = new URL(siteUrl);
  } catch {}

  return metadata;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${cormorant.variable} antialiased`} suppressHydrationWarning>
        <Providers>
          {children}
          <GlobalModals />
          <Toaster theme="dark" richColors position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
