import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BiArrowBack } from "react-icons/bi";
import { addToCart } from "../utils/cart";
import { useStore } from "../stores/store";
import { toast } from "react-toastify";
import QuantityDropdown from "../components/QuantityDropdown";

interface Product {
  name: string;
  rating: number;
  stock: number;
  price: number;
}

const ProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const { cartPageQuantity, setCartPageQuantity } = useStore();

  useEffect(() => {
    if (id) {
      axios
        .get<Product>(
          import.meta.env.VITE_BACKEND_URL + `/user/getproduct/${id}`
        )
        .then((response) => {
          setProduct(response.data);
        })
        .catch((error) => {
          console.error("Error fetching product data: ", error);
        });
    }
  }, [id]);

  if (!product) return <div>Loading...</div>;

  return (
    <>
      <div className="pt-15 p-2 dark:bg-[#201E1E] dark:text-white">
        {" "}
        <BiArrowBack
          className="hidden sm:block absolute top-14 left-1 h-8 w-8 rounded-full bg-gray-100 dark:text-black cursor-pointer hover:bg-gray-200"
          onClick={() => navigate(-1)}
        />
        <img src="" alt="" className="block object-cover h-80 w-80" />
        <h1 className="text-xl font-bold">{product.name}</h1>
        <div className="mt-10 space-y-10">
          <div className="border p-2 space-y-2">
            <div className="space-y-2">
              <p className="text-lg font-bold text-green-700">
                In Stock: {product.stock}
              </p>
              <QuantityDropdown price={product.price} />
              <button
                className="w-full text-black bg-amber-400 hover:bg-amber-300 py-1 rounded-lg active:bg-amber-400 cursor-pointer"
                onClick={() => {
                  addToCart(product, cartPageQuantity), setCartPageQuantity(1);
                  toast.success(`${product.name} is added to the cart`);
                }}>
                Add to cart
              </button>
              <button className="w-full text-white bg-black hover:bg-black/60 active:bg-black py-1 rounded-lg cursor-pointer">
                Place Order
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductPage;
