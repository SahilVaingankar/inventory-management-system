import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import BackArrow from "../components/BackArrow";
import axios from "axios";
import { useStore } from "../stores/store";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setLogin } = useStore();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || !password) toast.error("Please fill in all fields");
    if (password.length >= 5 && password.length <= 20) {
      try {
        await axios.post(
          import.meta.env.VITE_BACKEND_URL + "/auth/login",
          { email, password },
          {
            withCredentials: true,
          }
        );
        setLogin(true);
        toast.success("login successful");
        navigate("/");
      } catch (error) {
        if (axios.isAxiosError(error)) {
          toast.error(
            error.response?.data?.error?.details?.[0]?.message ||
              error.response?.data.message ||
              "login failed"
          );
        } else {
          toast.error("Unexpected login error");
        }
      }
    } else {
      if (password.length < 5) {
        toast.error("Password must be atleast 5 charectors long");
      } else {
        toast.error("Password must not be grater then 20 charectors");
      }
    }
  };

  return (
    <div className="w-full h-[100svh] bg-gradient-to-tr from-blue-600 via-purple-500 to-black flex items-center justify-center ">
      <BackArrow left={10} />
      <form
        onSubmit={handleLogin}
        className="flex flex-col bg-white p-8 rounded shadow-md gap-4 w-full mx-5 max-w-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

        <div>
          <label className="block mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full p-2 border rounded mb-4 outline-none cursor-pointer"
            required
          />
        </div>
        <div>
          <label className="block mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full p-2 border rounded mb-4 outline-none cursor-pointer"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 cursor-pointer">
          Login
        </button>
        <p className="text-blue-500">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="underline cursor-pointer hover:text-blue-700">
            Register here
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
