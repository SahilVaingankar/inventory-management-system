import { FaShoppingCart } from "react-icons/fa";
import Searchbar from "./Searchbar";
import { Link, useNavigate } from "react-router-dom";
import { useStore } from "../stores/store";
import axios from "axios";
import { useState } from "react";
import { toast } from "react-toastify";
import PopOver from "./PopOver";

const Navbar = () => {
  const { setLogin, darkMode, toggleMode, login, userData, setUserData } =
    useStore();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const navigate = useNavigate();

  const logout = async () => {
    try {
      axios.defaults.withCredentials = true;
      const response = await axios.post(backendUrl + "/auth/logout");
      response.data.success && setUserData(false);
      response.data.success && setLogin(false);

      navigate("/");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.success(error.response?.data || "Login failed");
      } else {
        toast.error("Unexpected login error");
      }
    }
  };

  return (
    <nav className="fixed top-0 left-0 z-10 w-full py-2 border-b bg-white shadow-md flex justify-between px-1 sm:px-2 lg:px-4 items-center gap-0.5">
      <Link to="/">
        <h1 className="font-black text-sm sm:text-lg md:xl lg:2xl xl:3xl">
          STORE
        </h1>
      </Link>
      <Searchbar />
      <FaShoppingCart
        className="min-h-[30px] min-w-[30px]"
        onClick={() => navigate("/cartpage")}
      />
      {userData ? (
        <div
          className="w-6 h-6 flex justify-center items-center rounded-full bg-black text-white relative group cursor-pointer"
          tabIndex={0}
          onClick={() => {
            setIsProfileOpen(true);
          }}
          onBlur={() => {
            setIsProfileOpen(false);
          }}>
          {userData.name[0].toUpperCase()}
          <div
            className={`absolute ${
              isProfileOpen ? "block" : "hidden"
            } group-hover:block top-0 right-0 text-black rounded pt-10 -z-10`}>
            <ul className="list-none m-0 p-2 bg-gray-100 text-sm dark:bg-gray-900 dark:text-white">
              {/* {!userData.isAccountVerified && (
                <PopOver
                  message="Depreciated require real email to receive OTP"
                  url="https://github.com/SahilVaingankar/E-CommerceWebsite/blob/main/backend/src/routes/authRoutes.ts#L26-L27"
                  right={110}
                  top={0}>
                  <li
                    onClick={sendVerificationOtp}
                    className="py-1 px-2 dark:hover:bg-gray-700 hover:bg-gray-200 cursor-pointer group">
                    <p>Verify Email</p>
                  </li>
                </PopOver>
              )} */}
              <li
                onClick={logout}
                className="py-1 px-2 dark:hover:bg-gray-700 hover:bg-gray-200 cursor-pointer pr-10">
                Logout
              </li>
              <li
                className="px-2 dark:hover:bg-gray-700 gap-2 flex justify-between items-center hover:bg-gray-200 cursor-pointer"
                onClick={() => toggleMode()}>
                <p>Mode</p>
                {/* <input
                  type="checkbox"
                  className="appearance-none relative w-6 h-3 bg-gray-300 rounded-full
               checked:bg-blue-600 cursor-pointer transition-colors
               before:content-[''] before:absolute before:-top-0.5 before:-left-0.5 
               before:w-4 before:h-4 before:bg-black before:rounded-full before:shadow-md
               before:transition-transform checked:before:translate-x-4"
                />{" "} */}

                <div className="relative inline-block w-12 h-6 cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={darkMode}
                    readOnly
                  />
                  <span className="block w-12 h-6 bg-gray-300 rounded-full peer-checked:bg-blue-600 transition-colors" />
                  <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow transform transition-transform peer-checked:translate-x-6 pointer-events-none" />
                </div>
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <Link to="/login">
          <button className="h-[28px] w-[55px] border-1 rounded-[25px] text-sm cursor-pointer">
            Login
          </button>
        </Link>
      )}
    </nav>
  );
};

export default Navbar;
