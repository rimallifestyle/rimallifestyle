import productsImg from "@/assets/products.jpg";
import hatsImg from "@/assets/hats.jpg";
import jacketsImg from "@/assets/jackets.jpg";
import pantsImg from "@/assets/pants.jpg";
import panjabiImg from "@/assets/panjabi.jpg";

export const productImage = (productsImg as any).src || productsImg;

export type ProductCategory = string;

export type ProductAttribute = {
  name: string;
  slug: string;
  options: string[];
};

export type Product = {
  id: string;
  slug?: string;
  wp_id?: number;
  name: string;
  price: number;
  compareAt?: number;
  sku?: string;
  tag?: string;
  bgPos: string;
  bgSize?: string;
  category: ProductCategory;
  parentCategory?: string;
  subCategory?: string;
  colors?: number;
  image?: string;
  rating?: number;
  reviews?: number;
  description?: string;
  attributes?: ProductAttribute[];
  gallery?: string[];
  stockStatus?: "instock" | "outofstock";
  stockQuantity?: number;
};

const P = {
  tl: "0% 0%",
  tm: "50% 0%",
  tr: "100% 0%",
  bl: "0% 100%",
  bm: "50% 100%",
  br: "100% 100%",
};

// 4×2 grid positions (for pants.jpg and jackets.jpg — 8 tiles)
const Q = {
  a1: "0% 0%",
  a2: "33.33% 0%",
  a3: "66.66% 0%",
  a4: "100% 0%",
  b1: "0% 100%",
  b2: "33.33% 100%",
  b3: "66.66% 100%",
  b4: "100% 100%",
};
const QS = "400% 200%";

export const featured: Product[] = [
  {
    id: "f1",
    name: "Classic Oxford Shirt",
    price: 89,
    tag: "New",
    bgPos: P.tl,
    category: "shirt",
    colors: 4,
  },
  { id: "f2", name: "Essential Cotton Tee", price: 34, bgPos: P.tm, category: "tshirt", colors: 6 },
  {
    id: "f3",
    name: "Maroon Signature Polo",
    price: 72,
    tag: "Bestseller",
    bgPos: P.tr,
    category: "tshirt",
    colors: 3,
  },
  { id: "f4", name: "Sand Chino Trouser", price: 98, bgPos: P.bl, category: "pant", colors: 5 },
  {
    id: "f5",
    name: "Vintage Denim Jacket",
    price: 145,
    tag: "Limited",
    bgPos: P.bm,
    category: "shirt",
    colors: 2,
  },
  {
    id: "f6",
    name: "Navy Utility Overshirt",
    price: 128,
    bgPos: P.br,
    category: "shirt",
    colors: 3,
  },
  {
    id: "f7",
    name: "Ivory Popover Shirt",
    price: 82,
    tag: "New",
    bgPos: P.tl,
    category: "shirt",
    colors: 3,
  },
  { id: "f8", name: "Heavyweight Crew Tee", price: 42, bgPos: P.tm, category: "tshirt", colors: 5 },
];

export const discounted: Product[] = [
  {
    id: "d1",
    name: "Silk-Blend Dress Shirt",
    price: 79,
    compareAt: 129,
    tag: "-38%",
    bgPos: P.tl,
    category: "shirt",
    colors: 3,
  },
  {
    id: "d2",
    name: "Premium Crew Tee",
    price: 24,
    compareAt: 42,
    tag: "-42%",
    bgPos: P.tm,
    category: "tshirt",
    colors: 4,
  },
  {
    id: "d3",
    name: "Burgundy Piqué Polo",
    price: 48,
    compareAt: 82,
    tag: "-41%",
    bgPos: P.tr,
    category: "tshirt",
    colors: 3,
  },
  {
    id: "d4",
    name: "Tailored Wool Trouser",
    price: 118,
    compareAt: 189,
    tag: "-37%",
    bgPos: P.bl,
    category: "pant",
    colors: 4,
  },
  {
    id: "d5",
    name: "Denim Trucker Jacket",
    price: 98,
    compareAt: 165,
    tag: "-40%",
    bgPos: P.bm,
    category: "shirt",
    colors: 2,
  },
  {
    id: "d6",
    name: "Field Overshirt Navy",
    price: 84,
    compareAt: 138,
    tag: "-39%",
    bgPos: P.br,
    category: "shirt",
    colors: 3,
  },
  {
    id: "d7",
    name: "Cream Signature Polo",
    price: 44,
    compareAt: 78,
    tag: "-43%",
    bgPos: P.tr,
    category: "tshirt",
    colors: 3,
  },
  {
    id: "d8",
    name: "Slim Fit Trouser Black",
    price: 76,
    compareAt: 124,
    tag: "-38%",
    bgPos: P.bl,
    category: "pant",
    colors: 3,
  },
];

export const shirts: Product[] = [
  {
    id: "s1",
    name: "Ivory Linen Shirt",
    price: 92,
    bgPos: P.tl,
    category: "shirt",
    tag: "New",
    colors: 4,
  },
  { id: "s2", name: "Charcoal Oxford", price: 88, bgPos: P.bm, category: "shirt", colors: 3 },
  { id: "s3", name: "Denim Field Shirt", price: 124, bgPos: P.br, category: "shirt", colors: 2 },
  { id: "s4", name: "White Signature Shirt", price: 78, bgPos: P.tl, category: "shirt", colors: 3 },
  {
    id: "s5",
    name: "Herringbone Overshirt",
    price: 148,
    bgPos: P.bm,
    category: "shirt",
    tag: "Limited",
    colors: 2,
  },
  { id: "s6", name: "Poplin Business Shirt", price: 95, bgPos: P.tl, category: "shirt", colors: 5 },
  { id: "s7", name: "Chambray Weekend", price: 84, bgPos: P.br, category: "shirt", colors: 3 },
  { id: "s8", name: "Twill Utility Shirt", price: 118, bgPos: P.bm, category: "shirt", colors: 4 },
];

export const tshirts: Product[] = [
  { id: "t1", name: "Cotton Crew Tee", price: 34, bgPos: P.tm, category: "tshirt", colors: 6 },
  {
    id: "t2",
    name: "Heavyweight Tee",
    price: 42,
    bgPos: P.tm,
    category: "tshirt",
    tag: "Bestseller",
    colors: 5,
  },
  {
    id: "t3",
    name: "Pocket Tee Vintage",
    price: 38,
    bgPos: P.tm,
    category: "tshirt",
    tag: "New",
    colors: 4,
  },
  { id: "t4", name: "Long-Sleeve Henley", price: 58, bgPos: P.tm, category: "tshirt", colors: 3 },
  { id: "t5", name: "Essential V-Neck", price: 32, bgPos: P.tm, category: "tshirt", colors: 5 },
  { id: "t6", name: "Boxy Fit Tee", price: 44, bgPos: P.tm, category: "tshirt", colors: 4 },
  { id: "t7", name: "Ringer Tee", price: 38, bgPos: P.tm, category: "tshirt", colors: 3 },
  {
    id: "t8",
    name: "Striped Breton Tee",
    price: 52,
    bgPos: P.tm,
    category: "tshirt",
    tag: "New",
    colors: 2,
  },
];

export const pants: Product[] = [
  {
    id: "p1",
    name: "Sand Chino Classic",
    price: 98,
    image: (pantsImg as any).src || pantsImg,
    bgPos: Q.a1,
    bgSize: QS,
    category: "pant",
    colors: 5,
  },
  {
    id: "p2",
    name: "Charcoal Wool Trouser",
    price: 168,
    image: (pantsImg as any).src || pantsImg,
    bgPos: Q.a2,
    bgSize: QS,
    category: "pant",
    tag: "Premium",
    colors: 4,
  },
  {
    id: "p3",
    name: "Olive Ripstop Pant",
    price: 112,
    image: (pantsImg as any).src || pantsImg,
    bgPos: Q.a3,
    bgSize: QS,
    category: "pant",
    colors: 3,
  },
  {
    id: "p4",
    name: "Midnight Slim Trouser",
    price: 88,
    image: (pantsImg as any).src || pantsImg,
    bgPos: Q.a4,
    bgSize: QS,
    category: "pant",
    colors: 6,
  },
  {
    id: "p5",
    name: "Navy Everyday Chino",
    price: 108,
    image: (pantsImg as any).src || pantsImg,
    bgPos: Q.b1,
    bgSize: QS,
    category: "pant",
    colors: 3,
  },
  {
    id: "p6",
    name: "Pinstripe Dress Pant",
    price: 138,
    image: (pantsImg as any).src || pantsImg,
    bgPos: Q.b2,
    bgSize: QS,
    category: "pant",
    tag: "New",
    colors: 3,
  },
  {
    id: "p7",
    name: "Olive Tailored Chino",
    price: 124,
    image: (pantsImg as any).src || pantsImg,
    bgPos: Q.b3,
    bgSize: QS,
    category: "pant",
    colors: 4,
  },
  {
    id: "p8",
    name: "Rust Corduroy Trouser",
    price: 128,
    image: (pantsImg as any).src || pantsImg,
    bgPos: Q.b4,
    bgSize: QS,
    category: "pant",
    tag: "Limited",
    colors: 3,
  },
];

// ─── New categories ────────────────────────────────────────────

export const hats: Product[] = [
  {
    id: "h1",
    name: "Wool Felt Fedora",
    price: 78,
    image: (hatsImg as any).src || hatsImg,
    bgPos: P.tl,
    category: "hat",
    tag: "New",
    colors: 3,
  },
  {
    id: "h2",
    name: "Cotton Sport Cap",
    price: 32,
    image: (hatsImg as any).src || hatsImg,
    bgPos: P.tm,
    category: "hat",
    colors: 6,
  },
  {
    id: "h3",
    name: "Leather Trucker",
    price: 94,
    image: (hatsImg as any).src || hatsImg,
    bgPos: P.tr,
    category: "hat",
    tag: "Limited",
    colors: 2,
  },
  {
    id: "h4",
    name: "Merino Beanie",
    price: 48,
    image: (hatsImg as any).src || hatsImg,
    bgPos: P.bl,
    category: "hat",
    colors: 4,
  },
  {
    id: "h5",
    name: "Houndstooth Flat Cap",
    price: 64,
    image: (hatsImg as any).src || hatsImg,
    bgPos: P.bm,
    category: "hat",
    colors: 3,
  },
  {
    id: "h6",
    name: "Herringbone Baker Cap",
    price: 58,
    image: (hatsImg as any).src || hatsImg,
    bgPos: P.br,
    category: "hat",
    colors: 3,
  },
];

export const polos: Product[] = [
  {
    id: "po1",
    name: "Maroon Piqué Polo",
    price: 72,
    bgPos: P.tr,
    category: "polo",
    tag: "Bestseller",
    colors: 3,
    rating: 4.8,
    reviews: 128,
  },
  {
    id: "po2",
    name: "Cream Signature Polo",
    price: 68,
    bgPos: P.tr,
    category: "polo",
    colors: 4,
    rating: 4.7,
    reviews: 94,
  },
  {
    id: "po3",
    name: "Navy Cotton Polo",
    price: 64,
    bgPos: P.tr,
    category: "polo",
    colors: 5,
    rating: 4.9,
    reviews: 212,
  },
  {
    id: "po4",
    name: "Long-Sleeve Polo Black",
    price: 82,
    bgPos: P.tr,
    category: "polo",
    tag: "New",
    colors: 3,
    rating: 4.6,
    reviews: 47,
  },
  {
    id: "po5",
    name: "Striped Rugby Polo",
    price: 88,
    bgPos: P.tr,
    category: "polo",
    colors: 2,
    rating: 4.5,
    reviews: 63,
  },
  {
    id: "po6",
    name: "Merino Wool Polo",
    price: 118,
    bgPos: P.tr,
    category: "polo",
    tag: "Premium",
    colors: 3,
    rating: 4.9,
    reviews: 156,
  },
];

export const jackets: Product[] = [
  {
    id: "j1",
    name: "Camel Wool Overcoat",
    price: 348,
    image: (jacketsImg as any).src || jacketsImg,
    bgPos: Q.a1,
    bgSize: QS,
    category: "jacket",
    tag: "Signature",
    colors: 3,
    description: "Cut from Italian wool, tailored for a timeless silhouette.",
  },
  {
    id: "j2",
    name: "Navy Harrington Jacket",
    price: 218,
    image: (jacketsImg as any).src || jacketsImg,
    bgPos: Q.a2,
    bgSize: QS,
    category: "jacket",
    colors: 2,
  },
  {
    id: "j3",
    name: "Olive Field Overshirt",
    price: 198,
    image: (jacketsImg as any).src || jacketsImg,
    bgPos: Q.a3,
    bgSize: QS,
    category: "jacket",
    tag: "New",
    colors: 3,
  },
  {
    id: "j4",
    name: "Forest Chore Jacket",
    price: 228,
    image: (jacketsImg as any).src || jacketsImg,
    bgPos: Q.a4,
    bgSize: QS,
    category: "jacket",
    colors: 3,
  },
  {
    id: "j5",
    name: "Indigo Denim Trucker",
    price: 168,
    image: (jacketsImg as any).src || jacketsImg,
    bgPos: Q.b1,
    bgSize: QS,
    category: "jacket",
    colors: 2,
  },
  {
    id: "j6",
    name: "Washed Denim Jacket",
    price: 158,
    image: (jacketsImg as any).src || jacketsImg,
    bgPos: Q.b2,
    bgSize: QS,
    category: "jacket",
    colors: 2,
  },
  {
    id: "j7",
    name: "Olive Field Coat",
    price: 258,
    image: (jacketsImg as any).src || jacketsImg,
    bgPos: Q.b3,
    bgSize: QS,
    category: "jacket",
    colors: 2,
  },
  {
    id: "j8",
    name: "Rust Chore Coat",
    price: 238,
    image: (jacketsImg as any).src || jacketsImg,
    bgPos: Q.b4,
    bgSize: QS,
    category: "jacket",
    tag: "Limited",
    colors: 3,
  },
];

export const panjabis: Product[] = [
  {
    id: "pj1",
    name: "Ivory Silk Panjabi",
    price: 168,
    image: (panjabiImg as any).src || panjabiImg,
    bgPos: P.tl,
    category: "panjabi",
    tag: "Festive",
    colors: 3,
    description: "Hand-stitched ivory silk, tailored for celebrations.",
  },
  {
    id: "pj2",
    name: "Midnight Navy Panjabi",
    price: 148,
    image: (panjabiImg as any).src || panjabiImg,
    bgPos: P.tm,
    category: "panjabi",
    colors: 3,
    description: "Deep navy cotton-silk with mandarin collar.",
  },
  {
    id: "pj3",
    name: "Maroon Signature Panjabi",
    price: 178,
    image: (panjabiImg as any).src || panjabiImg,
    bgPos: P.tr,
    category: "panjabi",
    tag: "Bestseller",
    colors: 3,
    description: "Our signature maroon, in luxurious raw silk.",
  },
  {
    id: "pj4",
    name: "Crimson Traditional",
    price: 158,
    image: (panjabiImg as any).src || panjabiImg,
    bgPos: P.bl,
    category: "panjabi",
    colors: 3,
    description: "Classic crimson with subtle tone-on-tone detailing.",
  },
  {
    id: "pj5",
    name: "Charcoal Modern Panjabi",
    price: 138,
    image: (panjabiImg as any).src || panjabiImg,
    bgPos: P.bm,
    category: "panjabi",
    colors: 3,
    description: "Contemporary cut in refined charcoal cotton.",
  },
  {
    id: "pj6",
    name: "Emerald Embroidered",
    price: 228,
    image: (panjabiImg as any).src || panjabiImg,
    bgPos: P.br,
    category: "panjabi",
    tag: "Limited",
    colors: 2,
    description: "Deep emerald silk with hand-embroidered gold motifs.",
  },
];

export const allProducts: Product[] = [
  ...featured,
  ...shirts,
  ...tshirts,
  ...pants,
  ...hats,
  ...polos,
  ...jackets,
  ...panjabis,
];

export function getProductById(id: string): Product | undefined {
  const p = allProducts.find((p) => p.id === id || p.slug === id);
  if (!p) return undefined;
  return {
    ...p,
    stockQuantity: p.stockQuantity ?? (p.stockStatus === "outofstock" ? 0 : 24),
    stockStatus: p.stockStatus ?? "instock",
  };
}
