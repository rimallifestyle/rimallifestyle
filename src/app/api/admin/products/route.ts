import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import Product from "@/models/Product";

export const dynamic = 'force-dynamic';

// Protect route to admin only
async function checkAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) return false;
  await connectToDatabase();
  const cleanEmail = session.user.email.trim();
  const user = await User.findOne({
    email: { $regex: new RegExp(`^${cleanEmail.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")}$`, "i") }
  });
  return user?.role?.toLowerCase() === "admin";
}

export async function GET(req: Request) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    // In a production app you'd want to populate the category or fetch it, 
    // but since we store it as a string for now, we'll just fetch products
    const products = await Product.find().sort({ createdAt: -1 });
    
    // Convert to regular objects so frontend can easily map
    return NextResponse.json(products);
  } catch (error: any) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { 
      name, shortDescription, description, customTabs, regularPrice, salePrice, sku, stockQuantity, 
      category, parentCategory, subCategory, image, gallery, globalAttributes, productAttributes, variantStocks, status 
    } = body;

    if (!name || regularPrice === undefined || regularPrice === null || String(regularPrice).trim() === '') {
      return NextResponse.json({ message: "Product Name and Regular Price are required." }, { status: 400 });
    }

    let slug = (name || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\u0980-\u09FF]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    if (!slug || slug.trim() === '') {
      slug = `product-${Date.now()}`;
    }
    let slugExists = await Product.findOne({ slug });
    if (slugExists) {
      slug = `${slug}-${Date.now()}`;
    }

    let productSku = sku ? String(sku).trim() : '';
    if (!productSku) {
      const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      let code = '';
      for (let i = 0; i < 5; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      productSku = `RL${code}`;
    }

    const newProduct = new Product({
      name: String(name).trim(),
      slug,
      shortDescription: shortDescription || '',
      description: description || '',
      customTabs: Array.isArray(customTabs) ? customTabs : [],
      regularPrice: Number(regularPrice),
      salePrice: salePrice && Number(salePrice) > 0 ? Number(salePrice) : undefined,
      sku: productSku,
      stockQuantity: stockQuantity !== undefined && stockQuantity !== null && stockQuantity !== '' ? Number(stockQuantity) : 0,
      category: category || subCategory || parentCategory || "Uncategorized",
      parentCategory: parentCategory || undefined,
      subCategory: subCategory || undefined,
      image: image || undefined,
      gallery: Array.isArray(gallery) ? gallery : [],
      globalAttributes: Array.isArray(globalAttributes) ? globalAttributes : [],
      productAttributes: Array.isArray(productAttributes) ? productAttributes : [],
      variantStocks: variantStocks || {},
      status: status === 'draft' ? 'draft' : 'published'
    });

    await newProduct.save();

    return NextResponse.json({ success: true, product: newProduct }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating product:", error);
    return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
  }
}
