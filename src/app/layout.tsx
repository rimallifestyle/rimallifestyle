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
  
  try {
    await connectToDatabase();
    const siteSetting = await Setting.findOne({ key: "site_identity" });
    if (siteSetting && siteSetting.value) {
      if (siteSetting.value.faviconUrl) faviconUrl = siteSetting.value.faviconUrl;
      if (siteSetting.value.storeName) storeName = siteSetting.value.storeName;
    }
  } catch (e) {
    console.error("Error fetching site metadata:", e);
  }

  return {
    title: `${storeName} — Modern Luxury Clothing`,
    description: `${storeName} - Your destination for modern luxury clothing`,
    icons: {
      icon: faviconUrl,
    },
  };
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
