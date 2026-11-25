import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IOrder extends Document {
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  isGuest: boolean;
  userEmail?: string;
  userId?: string;
  userProfileName?: string;
  customerAvatar?: string;
  isSeen?: boolean;
  cart: any[];
  subTotal: number;
  shippingFee: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
  courier?: {
    provider?: string;
    trackingCode?: string;
    consignmentId?: string | number;
    dispatchedAt?: Date;
    status?: string;
    courierResponse?: any;
  };
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema: Schema = new Schema(
  {
    orderId: { type: String, required: true, unique: true },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    customerAddress: { type: String, required: true },
    isGuest: { type: Boolean, default: true },
    userEmail: { type: String },
    userId: { type: String },
    userProfileName: { type: String },
    customerAvatar: { type: String },
    isSeen: { type: Boolean, default: false },
    cart: [{ type: Schema.Types.Mixed, required: true }],
    subTotal: { type: Number, required: true },
    shippingFee: { type: Number, required: true },
    total: { type: Number, required: true },
    status: { 
      type: String, 
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], 
      default: 'pending' 
    },
    paymentMethod: { type: String, default: 'Cash on Delivery' },
    paymentStatus: { 
      type: String, 
      enum: ['pending', 'paid', 'failed'], 
      default: 'pending' 
    },
    courier: {
      provider: { type: String },
      trackingCode: { type: String },
      consignmentId: { type: Schema.Types.Mixed },
      dispatchedAt: { type: Date },
      status: { type: String },
      courierResponse: { type: Schema.Types.Mixed }
    }
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
