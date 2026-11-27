import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import Setting from "@/models/Setting";

export const dynamic = 'force-dynamic';

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) return false;
  await connectToDatabase();
  const user = await User.findOne({ email: session.user.email });
  return user?.role?.toLowerCase() === "admin";
}

const DEFAULT_PAGES = [
  {
    id: "page_home",
    title: "Home Page",
    slug: "/",
    type: "Front Page",
    status: "published",
    isCore: true,
    editUrl: "/admin/storefront?tab=layout",
    updatedAt: new Date().toISOString(),
    description: "Main storefront homepage with Hero Slider, Marquee, Dynamic Category Showcase & Product Sliders."
  },
  {
    id: "page_shop",
    title: "Shop & Catalog",
    slug: "/shop",
    type: "Catalog Page",
    status: "published",
    isCore: true,
    editUrl: "/admin/products",
    updatedAt: new Date().toISOString(),
    description: "Browse all products with dynamic category tree, price filters, ratings, and instant search."
  },
  {
    id: "page_cart",
    title: "Cart",
    slug: "/cart",
    type: "Commerce",
    status: "published",
    isCore: true,
    editUrl: "/admin/storefront",
    updatedAt: new Date().toISOString(),
    description: "Shopping cart drawer and dedicated cart review page."
  },
  {
    id: "page_checkout",
    title: "Checkout",
    slug: "/checkout",
    type: "Checkout",
    status: "published",
    isCore: true,
    editUrl: "/admin/payments",
    updatedAt: new Date().toISOString(),
    description: "Cash on delivery, bKash/Nagad and courier delivery checkout page."
  },
  {
    id: "page_account",
    title: "My Account",
    slug: "/account",
    type: "User Portal",
    status: "published",
    isCore: true,
    editUrl: "/admin/users",
    updatedAt: new Date().toISOString(),
    description: "Customer profile, order history, tracking, and password settings."
  },
  {
    id: "page_about",
    title: "About Us",
    slug: "/about",
    type: "Content Page",
    status: "published",
    isCore: false,
    editUrl: "/admin/storefront?tab=about",
    updatedAt: new Date().toISOString(),
    description: "Company story, atelier craftsmanship, and brand values."
  },
  {
    id: "page_contact",
    title: "Contact Us",
    slug: "/contact",
    type: "Content Page",
    status: "published",
    isCore: false,
    editUrl: "/admin/storefront?tab=contact",
    updatedAt: new Date().toISOString(),
    description: "Store location, customer support email, phone, and inquiry details."
  },
  {
    id: "page_privacy",
    title: "Privacy Policy",
    slug: "/privacy-policy",
    type: "Policy Page",
    status: "published",
    isCore: false,
    editUrl: "/admin/pages",
    updatedAt: new Date().toISOString(),
    description: "Customer data protection, cookies, and privacy compliance policy."
  },
  {
    id: "page_terms",
    title: "Terms & Conditions",
    slug: "/terms-conditions",
    type: "Policy Page",
    status: "published",
    isCore: false,
    editUrl: "/admin/pages",
    updatedAt: new Date().toISOString(),
    description: "Website terms of use, order agreements, and legal conditions."
  },
  {
    id: "page_refund",
    title: "Refund & Returns Policy",
    slug: "/refund-policy",
    type: "Policy Page",
    status: "published",
    isCore: false,
    editUrl: "/admin/pages",
    updatedAt: new Date().toISOString(),
    description: "7-day return policy, exchange procedures, and refund guidelines."
  }
];

export async function GET() {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    await connectToDatabase();
    const customPagesSetting = await Setting.findOne({ key: 'custom_pages' }).lean();
    const customPages = Array.isArray(customPagesSetting?.value?.pages) ? customPagesSetting.value.pages : [];

    // Combine default pages with custom pages
    const allPages = [...DEFAULT_PAGES, ...customPages];
    return NextResponse.json(allPages);
  } catch (error: any) {
    console.error("GET Pages Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { title, slug, content, type = "Content Page", status = "published" } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ message: "Title is required" }, { status: 400 });
    }

    const cleanSlug = (slug || title)
      .toLowerCase()
      .trim()
      .replace(/^\/+|\/+$/g, '')
      .replace(/[^a-z0-9]+/g, '-');

    const newPage = {
      id: `page_${cleanSlug}_${Date.now().toString().slice(-4)}`,
      title: title.trim(),
      slug: `/${cleanSlug}`,
      content: content || "",
      type,
      status,
      isCore: false,
      isCustom: true,
      updatedAt: new Date().toISOString(),
      description: content ? content.slice(0, 120) : "Custom storefront page"
    };

    await connectToDatabase();
    const customPagesSetting = await Setting.findOne({ key: 'custom_pages' });
    const currentPages = Array.isArray(customPagesSetting?.value?.pages) ? customPagesSetting.value.pages : [];
    
    currentPages.push(newPage);

    await Setting.findOneAndUpdate(
      { key: 'custom_pages' },
      { key: 'custom_pages', value: { pages: currentPages } },
      { upsert: true }
    );

    return NextResponse.json(newPage, { status: 201 });
  } catch (error: any) {
    console.error("POST Page Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { id, title, slug, content, status } = body;

    if (!id) {
      return NextResponse.json({ message: "ID is required" }, { status: 400 });
    }

    await connectToDatabase();
    const customPagesSetting = await Setting.findOne({ key: 'custom_pages' });
    const currentPages = Array.isArray(customPagesSetting?.value?.pages) ? customPagesSetting.value.pages : [];

    const index = currentPages.findIndex((p: any) => p.id === id);
    if (index !== -1) {
      currentPages[index] = {
        ...currentPages[index],
        title: title || currentPages[index].title,
        slug: slug || currentPages[index].slug,
        content: content !== undefined ? content : currentPages[index].content,
        status: status || currentPages[index].status,
        updatedAt: new Date().toISOString()
      };

      await Setting.findOneAndUpdate(
        { key: 'custom_pages' },
        { key: 'custom_pages', value: { pages: currentPages } }
      );

      return NextResponse.json(currentPages[index]);
    }

    return NextResponse.json({ message: "Page updated" });
  } catch (error: any) {
    console.error("PUT Page Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ message: "ID is required" }, { status: 400 });
    }

    await connectToDatabase();
    const customPagesSetting = await Setting.findOne({ key: 'custom_pages' });
    const currentPages = Array.isArray(customPagesSetting?.value?.pages) ? customPagesSetting.value.pages : [];

    const updatedPages = currentPages.filter((p: any) => p.id !== id);

    await Setting.findOneAndUpdate(
      { key: 'custom_pages' },
      { key: 'custom_pages', value: { pages: updatedPages } }
    );

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    console.error("DELETE Page Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
