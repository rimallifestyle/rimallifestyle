import mongoose, { Document, Schema } from 'mongoose';

export interface IAttributeTerm {
  _id?: string;
  name: string;
  slug: string;
  value?: string;
}

export interface IAttribute extends Document {
  name: string;
  slug: string;
  type: string;
  orderBy: string;
  terms: IAttributeTerm[];
}

const AttributeTermSchema = new Schema<IAttributeTerm>({
  name: { type: String, required: true },
  slug: { type: String, required: true },
  value: { type: String }
});

const AttributeSchema = new Schema<IAttribute>({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  type: { type: String, default: 'text' },
  orderBy: { type: String, default: 'custom' },
  terms: [AttributeTermSchema]
}, { timestamps: true });

export default mongoose.models.Attribute || mongoose.model<IAttribute>('Attribute', AttributeSchema);
