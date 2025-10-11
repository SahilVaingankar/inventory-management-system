import { number } from "joi";
import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    remainingStock: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true } // automatically adds createdAt and updatedAt
);

const ProductModel =
  mongoose.models.Product || mongoose.model("Product", productSchema);
export default ProductModel;
