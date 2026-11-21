import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";
import Category from "@/models/Category";

export const dynamic = "force-dynamic";

export interface CategoryTreeItem {
  id: string;
  name: string;
  slug: string;
  parent: string;
  parentName?: string;
  parentSlug?: string;
  subcategories: CategoryTreeItem[];
}

export async function GET() {
  try {
    await connectToDatabase();
    
    // 1. Fetch all categories from Category collection
    const categoriesFromDb = await Category.find().sort({ name: 1 }).lean();
    
    const catMap = new Map<string, CategoryTreeItem>();
    
    categoriesFromDb.forEach((c: any) => {
      const idStr = c._id.toString();
      catMap.set(idStr, {
        id: idStr,
        name: c.name,
        slug: c.slug || c.name.toLowerCase().replace(/\s+/g, '-'),
        parent: c.parent ? c.parent.toString() : '0',
        subcategories: []
      });
    });

    const rootCategories: CategoryTreeItem[] = [];

    // Also look up parent by name/slug fallback if parent is not an ObjectId
    const findParent = (parentVal: string): CategoryTreeItem | undefined => {
      if (catMap.has(parentVal)) return catMap.get(parentVal);
      for (const item of Array.from(catMap.values())) {
        if (item.name.toLowerCase() === parentVal.toLowerCase() || item.slug.toLowerCase() === parentVal.toLowerCase()) {
          return item;
        }
      }
      return undefined;
    };

    catMap.forEach((item) => {
      if (!item.parent || item.parent === '0' || item.parent === 'none') {
        rootCategories.push(item);
      } else {
        const parent = findParent(item.parent);
        if (parent) {
          item.parentName = parent.name;
          item.parentSlug = parent.slug;
          parent.subcategories.push(item);
        } else {
          // If parent not found, treat as root
          rootCategories.push(item);
        }
      }
    });

    // 2. Fetch distinct product categories to ensure no category is missed
    const productCategories = await Product.distinct("category");
    if (Array.isArray(productCategories)) {
      productCategories.forEach((catName: string) => {
        if (!catName || typeof catName !== 'string') return;
        const trimmed = catName.trim();
        const slug = trimmed.toLowerCase().replace(/\s+/g, '-');
        
        // Check if already in tree (root or subcategory)
        let exists = false;
        for (const root of rootCategories) {
          if (root.name.toLowerCase() === trimmed.toLowerCase() || root.slug === slug) {
            exists = true;
            break;
          }
          if (root.subcategories.some(sub => sub.name.toLowerCase() === trimmed.toLowerCase() || sub.slug === slug)) {
            exists = true;
            break;
          }
        }

        if (!exists) {
          rootCategories.push({
            id: slug,
            name: trimmed.charAt(0).toUpperCase() + trimmed.slice(1),
            slug: slug,
            parent: '0',
            subcategories: []
          });
        }
      });
    }

    // Default fallback if database has no categories
    if (rootCategories.length === 0) {
      return NextResponse.json([
        { id: "shirts", name: "Shirts", slug: "shirts", parent: "0", subcategories: [] },
        { id: "t-shirts", name: "T-Shirts", slug: "t-shirts", parent: "0", subcategories: [] },
        { id: "polos", name: "Polos", slug: "polos", parent: "0", subcategories: [] },
        { id: "hats", name: "Hats", slug: "hats", parent: "0", subcategories: [] },
        { id: "jackets", name: "Jackets", slug: "jackets", parent: "0", subcategories: [] },
        { id: "trousers", name: "Trousers", slug: "trousers", parent: "0", subcategories: [] },
        { id: "panjabi", name: "Panjabi", slug: "panjabi", parent: "0", subcategories: [] }
      ]);
    }

    return NextResponse.json(rootCategories);
  } catch (error: any) {
    console.error("GET Categories Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

