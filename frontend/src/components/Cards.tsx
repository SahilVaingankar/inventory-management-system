// import { products } from "./products"; // import the list

import { toast } from "react-toastify";
import { addToCart } from "../utils/cart";
import { FaCartPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../services/axios";

interface CardsProps {
  id: number;
  name: string;
  category: string;
  price: number;
  inStock: boolean;
  quantity: number;
}

interface NewOrderItem {
  product: string; // productId
  quantity: number;
  price: number;
}

const Cards = ({
  name,
  category,
  price,
  inStock,
  id,
  quantity,
}: CardsProps) => {
  const navigate = useNavigate();

  // src/api/orderService.ts

  const placeOrder = async (customerName: string, items: NewOrderItem[]) => {
    // calculate total on frontend or backend (backend preferred)
    console.log("presses");

    try {
      const total = items.reduce(
        (acc, item) => acc + item.price * (item.quantity || 1),
        0
      );
      const res = await axiosInstance.post(
        import.meta.env.VITE_BACKEND_URL + "/auth/placeorder",
        {
          customerName,
          items,
          total,
        }
      );
      // toast.success(res.request?.message);
      toast.success(res.request?.message);
      console.log("waiting for res");

      console.log(res);
    } catch (error) {
      toast.success(`failed to place order`);
    }
  };

  return (
    <div className="flex flex-col border p-2 gap-1 rounded-md w-full h-full">
      {/* Skeleton image */}
      <div
        className="bg-gray-200 animate-pulse min-w-25 h-25  sm:h-40 md:h-50 rounded-md cursor-pointer"
        onClick={() => {
          navigate(`/product/${id}`);
        }}
      />

      <div className="flex flex-col space-y-1">
        <h2 className="font-semibold text-lg truncate">{name}</h2>
        <p className="text-gray-600">{category}</p>
        <p className="font-bold text-indigo-600">₹{price}</p>
      </div>

      <div className="flex justify-between">
        <p className={inStock ? "text-green-600" : "text-red-600"}>
          {inStock ? "In Stock" : "Out of Stock"}
        </p>

        <FaCartPlus
          className="h-5 w-5 sm:h-6 sm:w-6 cursor-pointer active:text-gray-500"
          onClick={() => {
            addToCart({ name, price });
            toast.success(`${name} is added to the cart`);
          }}
        />
      </div>

      <button
        className={`mt-auto py-2 rounded ${
          inStock
            ? "bg-indigo-600 text-white cursor-pointer hover:bg-indigo-700"
            : "bg-gray-400 text-gray-700 cursor-not-allowed"
        }`}
        disabled={!inStock}
        onClick={() => {
          placeOrder(
            name, // using product name as customerName for now
            [
              {
                product: id.toString(),
                quantity: quantity ?? 1,
                price,
              },
            ]
          );
          // toast.success(`order placed`);
        }}>
        Place Order
      </button>
    </div>
  );
};

export default Cards;
