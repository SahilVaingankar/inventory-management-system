import { Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import { toast, ToastContainer } from "react-toastify";
import Register from "./pages/Register";
import CartPage from "./pages/CartPage";
import ProductPage from "./pages/ProductPage";
import { useStore } from "./stores/store";
import { useEffect } from "react";
import axiosInstance from "./services/axios";
import axios from "axios";
import ProtectedRoutes from "./components/ProtectedRoutes";
import Unauthorized from "./pages/Unauthorized";
import StaffOrders from "./pages/StaffOrders";
import UserOrders from "./pages/UserOrders";
import AdminPanel from "./pages/AdminPanal";

const App = () => {
  const { setLogin, setUserData, darkMode, login } = useStore();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await axiosInstance.get(
          import.meta.env.VITE_BACKEND_URL + "/user/getUserData"
        );

        setLogin(true);
        setUserData(res?.data?.userData);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          toast.error(error.response?.data || "Failed to fetch user data");
        } else {
          toast.error("Unexpected login error");
        }
      }
    };
    fetchUserData();
  }, [login]);

  return (
    <div className={`${darkMode ? "dark" : ""} min-h-[100svh] min-w-[250px]`}>
      <ToastContainer
        position="top-left"
        autoClose={3000}
        toastClassName="top-12 md:top-10 bg-white text-black rounded-md shadow-md !z-50"
      />

      {/* didn't get time to fix it routes are protected on backend with role base access */}
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/product/:id" element={<ProductPage />} />

        {/* Guest-only (login/register) */}
        <Route element={<ProtectedRoutes type="login" />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Logged-in users only */}
        <Route element={<ProtectedRoutes type="guest" />}>
          <Route path="/cartpage" element={<CartPage />} />
        </Route>

        {/* Normal user */}
        {/* <Route
          element={<ProtectedRoutes type="user" allowedRoles={["user"]} />}> */}
        <Route path="/userorders" element={<UserOrders />} />
        {/* </Route> */}

        {/* Staff/admin */}
        {/* <Route
          element={
            <ProtectedRoutes
              type="staff/admin"
              allowedRoles={["staff", "admin"]}
            />
          }> */}
        <Route path="/stafforders" element={<StaffOrders />} />
        {/* </Route> */}

        {/* Unauthorized page */}
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </div>
  );
};

export default App;
