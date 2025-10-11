import { FaShoppingCart } from "react-icons/fa";
import Searchbar from "./Searchbar";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
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
      <button
        onClick={() => navigate("/login")}
        className="border rounded-lg py-1 px-2 m-2 hover:bg-gray-100 cursor-pointer">
        Login
      </button>
    </nav>
  );
};

export default Navbar;
