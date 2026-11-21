import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  slug: string;
  description?: string;
  regularPrice: number;
  salePrice?: number;
  sku?: string;
  stockQuantity?: number;
  category?: string;
  parentCategory?: string;
  subCategory?: string;
  image?: string;
  gallery?: string[];
  globalAttributes?: any[];
  productAttributes?: any[];
  status: 'published' | 'draft';
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, unique: true, sparse: true },
    description: { type: String },
    regularPrice: { type: Number, required: true },
    salePrice: { type: Number },
    sku: { type: String },
    stockQuantity: { type: Number, default: 0 },
    category: { type: String },
    parentCategory: { type: String },
    subCategory: { type: String },
    image: { type: String },
    gallery: [{ type: String }],
    globalAttributes: [{ type: Schema.Types.Mixed }],
    productAttributes: [{ type: Schema.Types.Mixed }],
    status: { type: String, enum: ['published', 'draft'], default: 'published' },
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
