import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import BackArrow from "../components/BackArrow";
import axios from "axios";
import { useStore } from "../stores/store";
import axiosInstance from "../services/axios";

const Register = () => {
  const { setLogin } = useStore();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || !password || !username)
      toast.error("Please fill in all fields");
    if (password.length >= 5 && password.length <= 20) {
      try {
        await axiosInstance.post(
          import.meta.env.VITE_BACKEND_URL + "/auth/register",
          { email, password, username }
        );
        setLogin(true);

        toast.success("register successful");
        navigate("/");
      } catch (error) {
        if (axios.isAxiosError(error)) {
          toast.error(
            error.response?.data?.error?.details?.[0]?.message ||
              error.response?.data.message ||
              "Register failed"
          );
        } else {
          toast.error("Unexpected register error");
        }
      }
    }
  };

  return (
    <div className="w-full h-[100svh] bg-gradient-to-tr from-blue-600 via-purple-500 to-black flex items-center justify-center ">
      <BackArrow left={10} />
      <form
        onSubmit={handleRegister}
        className="flex flex-col bg-white p-8 rounded shadow-md gap-4 w-full mx-5 max-w-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>

        <div>
          <label className="block mb-2">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="w-full p-2 border rounded mb-4 outline-none "
            required
          />
        </div>
        <div>
          <label className="block mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full p-2 border rounded mb-4 outline-none"
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
            className="w-full p-2 border rounded mb-4 outline-none"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
          Register
        </button>
        <p className="text-blue-500">
          Already have an account?{" "}
          <Link
            to="/login"
            className="underline cursor-pointer hover:text-blue-700">
            Login here
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
