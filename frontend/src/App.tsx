import { Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import { toast, ToastContainer } from "react-toastify";
// import Navbar from "./components/Navbar";
import Register from "./pages/Register";
import CartPage from "./pages/CartPage";
import ProductPage from "./pages/ProductPage";
// import axiosInstance from "./service/axios";
import { useStore } from "./stores/store";
import { useEffect } from "react";
import axiosInstance from "./services/axios";
import axios from "axios";
import ProtectedRoutes from "./components/ProtectedRoutes";

const App = () => {
  const { setLogin, setUserData } = useStore();
  const darkMode = useStore((state) => state.darkMode);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await axiosInstance.get(
          import.meta.env.VITE_BACKEND_URL + "/user/getUserData",
          {
            withCredentials: true,
          }
        );

        setLogin(true);
        setUserData(res?.data?.userData);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          toast.error(error.response?.data || "failed to fetch UserData");
        } else {
          toast.error("Unexpected login error");
        }
      }
    };
    fetchUserData();
  }, []);

  return (
    <div className="min-w-[250px]">
      {/* <Navbar /> */}
      <ToastContainer
        position="top-left"
        autoClose={3000}
        toastClassName="top-12 md:top-10 bg-white text-black rounded-md shadow-md !z-50"
        className=""
      />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route element={<ProtectedRoutes type={"guest"} />}>
          <Route path="/cartpage" element={<CartPage />} />
        </Route>

        <Route element={<ProtectedRoutes type={"login"} />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
      </Routes>
    </div>
  );
};

export default App;
