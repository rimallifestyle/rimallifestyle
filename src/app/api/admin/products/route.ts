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
  const user = await User.findOne({ email: session.user.email });
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
      name, description, regularPrice, salePrice, sku, stockQuantity, 
      category, parentCategory, subCategory, image, gallery, globalAttributes, productAttributes, variantStocks, status 
    } = body;

    if (!name || regularPrice === undefined) {
      return NextResponse.json({ message: "Name and regular price are required." }, { status: 400 });
    }

    let slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    let slugExists = await Product.findOne({ slug });
    if (slugExists) {
      slug = `${slug}-${Date.now()}`;
    }

    const newProduct = new Product({
      name,
      slug,
      description,
      regularPrice: Number(regularPrice),
      salePrice: salePrice ? Number(salePrice) : undefined,
      sku,
      stockQuantity: stockQuantity ? Number(stockQuantity) : 0,
      category: category || subCategory || parentCategory,
      parentCategory,
      subCategory,
      image,
      gallery,
      globalAttributes,
      productAttributes,
      variantStocks: variantStocks || {},
      status: status || 'published'
    });

    await newProduct.save();

    return NextResponse.json({ success: true, product: newProduct }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating product:", error);
    return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
  }
}
