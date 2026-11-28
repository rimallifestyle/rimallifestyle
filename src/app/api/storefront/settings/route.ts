import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Setting from "@/models/Setting";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");

    if (!key) {
      return NextResponse.json({ error: "Missing key parameter" }, { status: 400 });
    }

    await connectToDatabase();
    const setting = await Setting.findOne({ key });

    // Provide default fallbacks if not found
    if (!setting) {
      if (key === "site_identity") {
        return NextResponse.json({
          storeName: "Rimal Store",
          logoUrl: ""
        });
      }

      if (key === "navigation_links") {
        return NextResponse.json({
          links: [
            { id: "1", label: "Shop All", type: "page", value: "/shop" },
            { id: "2", label: "New Arrivals", type: "page", value: "/shop?category=new", badge: "New" },
            { id: "3", label: "Shirts", type: "category", value: "shirts" },
            { id: "4", label: "T-Shirts", type: "category", value: "t-shirts" },
            { id: "5", label: "Polos", type: "category", value: "polos" },
            { id: "6", label: "Hats", type: "category", value: "hats" },
            { id: "7", label: "Jackets", type: "category", value: "jackets" },
            { id: "8", label: "Trousers", type: "category", value: "trousers" },
            { id: "9", label: "Panjabi", type: "category", value: "panjabi" },
            { id: "10", label: "Sale", type: "page", value: "/shop?sale=true", badge: "Sale" },
          ]
        });
      }

      if (key === "homepage_layout") {
        return NextResponse.json({
          sections: [
            { id: "hero_slider", enabled: true },
            { id: "marquee", enabled: true },
            { id: "new_arrivals", enabled: true },
            { id: "discount", enabled: true },
            { id: "categories", enabled: true },
            { id: "shirts", enabled: true },
            { id: "tshirts", enabled: true },
            { id: "polos", enabled: true },
            { id: "pants", enabled: true },
            { id: "jackets", enabled: true },
            { id: "hats", enabled: true },
            { id: "panjabi", enabled: true },
            { id: "feature_strip", enabled: true },
          ]
        });
      }

      if (key === "feature_strip_settings") {
        return NextResponse.json({
          items: [
            { icon: "Truck", title: "Free shipping", sub: "On orders over $150" },
            { icon: "RotateCcw", title: "30-day returns", sub: "Hassle-free exchange" },
            { icon: "ShieldCheck", title: "Secure checkout", sub: "Encrypted payments" },
            { icon: "Sparkles", title: "Handcrafted", sub: "Limited production runs" },
          ]
        });
      }

      if (key === "footer_settings") {
        return NextResponse.json({
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
            { title: "Shop", links: [{ label: "New Arrivals", url: "#" }] },
            { title: "About", links: [{ label: "Our Story", url: "#" }] },
            { title: "Help", links: [{ label: "Contact", url: "#" }] }
          ],
          bottomLinks: [{ label: "Privacy", url: "#" }]
        });
      }

      if (key === "onesignal_settings") {
        return NextResponse.json({ enabled: false, appId: "" });
      }

      return NextResponse.json({});
    }

    if (key === "onesignal_settings") {
      const val = setting.value || {};
      return NextResponse.json({
        enabled: Boolean(val.enabled),
        appId: val.appId || "",
        safariWebId: val.safariWebId || "",
        autoPrompt: val.autoPrompt !== false
      });
    }

    return NextResponse.json(setting.value);
  } catch (error: any) {
    console.error("GET Storefront Setting Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");

    if (!key) {
      return NextResponse.json({ error: "Missing key parameter" }, { status: 400 });
    }

    const value = await req.json();

    await connectToDatabase();
    
    await Setting.findOneAndUpdate(
      { key },
      { key, value },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, value });
  } catch (error: any) {
    console.error("PUT Storefront Setting Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
