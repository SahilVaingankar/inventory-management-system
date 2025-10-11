import Navbar from "../components/Navbar";
import Cards from "../components/Cards";
import { useStore } from "../stores/store.ts";
import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const Home = () => {
  const { filteredProducts, setProducts } = useStore();
  const [loading, setLoading] = useState(true);
  console.log(
    "Fetching from:",
    import.meta.env.VITE_BACKEND_URL + "/user/getProductData"
  );

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          import.meta.env.VITE_BACKEND_URL + "/user/getProductData"
        );
        setProducts(response.data.products);
        setLoading(false);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          toast.error(err.response?.data || "failed to fetch UserData");
        } else {
          toast.error("Unexpected login error");
        }
      }
    };

    fetchProducts();
  }, []);

  return (
    <>
      <Navbar />
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="flex flex-col item-center justify-center mt-25 my-10 px-5 dark:bg-black">
          <section className="grid grid-cols-2 md:grid-cols-3 gap-5 mt-4 w-full">
            {filteredProducts.map((prod: any) => (
              // <Cards
              //   key={prod.id}
              //   id={prod.id}
              //   name={prod.name}
              //   category={prod.category}
              //   price={prod.price}
              //   inStock={prod.inStock}
              // />
              <Cards key={prod.id} {...prod} />
            ))}
          </section>
        </div>
      )}
    </>
  );
};

export default Home;
