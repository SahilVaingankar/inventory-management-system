import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { addToCart } from "../utils/cart";
import { useStore } from "../stores/store";
import { toast } from "react-toastify";
import QuantityDropdown from "../components/QuantityDropdown";
import BackArrow from "../components/BackArrow";
import Img from "../assets/Untitled.png";

interface Product {
  id: number;
  name: string;
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
        .get(import.meta.env.VITE_BACKEND_URL + `/user/getProduct/${id}`)
        .then((response) => {
          setProduct(response.data?.products);
          // console.log(response?.data?.products.name);
        })
        .catch((error) => {
          console.error("Error fetching product data: ", error);
        });
    }
  }, [id]);

  if (!product) return <div>Loading...</div>;

  console.log(product);

  return (
    <>
      <div className="pt-15 p-2 bg-gradient-to-tr from-blue-600 via-purple-500 to-black">
        {" "}
        <BackArrow left={25} />{" "}
        <div className="w-full flex justify-center">
          <div className="bg-black/50 h-80 w-full shadow-2xl flex items-center justify-center">
            <img src={Img} alt="" className="block object-cover h-auto w-fit" />
            {/* <div className="bg-gray-400 h-79 w-80 flex justify-center items-center">
              Img/Loader here
            </div> */}
          </div>
        </div>
        <h1 className="text-2xl font-bold w-full text-center">
          {product.name}
        </h1>
        <div className="mt-10 space-y-10">
          <div className="border p-2 space-y-2">
            <div className="space-y-2">
              {/* <p className="text-lg font-bold text-green-700">
                In Stock: {product.inStock}
              </p> */}
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
