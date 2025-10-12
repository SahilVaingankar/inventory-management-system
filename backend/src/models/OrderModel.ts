import mongoose, { Schema, Document } from "mongoose";

interface OrderItem {
  product: number; // numeric product ID
  productSnapshot: {
    name: string;
    category: string;
    price: number;
  };
  quantity: number;
  price: number; // transaction amount
}

export interface OrderDocument extends Document {
  customerId: mongoose.Types.ObjectId;
  customerName: string;
  items: OrderItem[];
  total: number;
  status: "placed" | "approved" | "rejected"; // match enum below
  processedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<OrderItem>({
  product: {
    type: Number,
    required: true, // numeric product ID
  },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  productSnapshot: {
    name: { type: String, default: "" },
    category: { type: String, default: "" },
    price: { type: Number, default: 0 },
  },
});

const OrderSchema = new Schema<OrderDocument>(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    customerName: { type: String, required: true },
    items: { type: [orderItemSchema], required: true },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ["placed", "approved", "rejected"], // must match the interface
      default: "placed",
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

export const OrderModel =
  mongoose.models.Order || mongoose.model<OrderDocument>("Order", OrderSchema);
