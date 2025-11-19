import { useEffect, useState } from "react";
import axiosInstance from "../services/axios";
import { toast } from "react-toastify";

interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
}

interface Product {
  _id: string;
  id: number;
  name: string;
  price: number;
  category: string;
  remainingStock: number;
  inStock: boolean;
}

const AdminPanel = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<"users" | "products">("users");

  // Fetch users
  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get(
        import.meta.env.VITE_BACKEND_URL + "/auth/users"
      );
      setUsers(res.data.users);
      console.log(res.data.users);
    } catch (error) {
      toast.error("Failed to fetch users");
    }
  };

  // Fetch products
  const fetchProducts = async () => {
    try {
      const res = await axiosInstance.get(
        import.meta.env.VITE_BACKEND_URL + "/auth/getproducts"
      );
      setProducts(res.data.products || []);
    } catch (error) {
      toast.error("Failed to fetch products");
    }
  };

  useEffect(() => {
    if (activeTab === "users") fetchUsers();
    else fetchProducts();
  }, [activeTab]);

  // Delete user
  const handleDeleteUser = async (id: string) => {
    try {
      await axiosInstance.delete(
        import.meta.env.VITE_BACKEND_URL + `/auth/users/${id}`
      );
      toast.success("User deleted");
      fetchUsers();
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  // Add user
  const handleAddUser = async () => {
    const name = prompt("User name:");
    const email = prompt("Email:");
    const role = prompt("Role (admin/staff/user):");
    const password = prompt("Password:");

    if (!name || !email || !role || !password) return;

    try {
      await axiosInstance.post(
        import.meta.env.VITE_BACKEND_URL + "/auth/users",
        { name, email, role, password }
      );
      toast.success("User added");
      fetchUsers();
    } catch (error) {
      toast.error("Failed to add user");
    }
  };

  // Add product
  const handleAddProduct = async () => {
    const name = prompt("Product name:");
    const price = Number(prompt("Price:"));
    const category = prompt("Category:");
    const remainingStock = Number(prompt("Remaining stock:"));

    if (!name || !price || !category || isNaN(remainingStock)) return;

    try {
      await axiosInstance.post(
        import.meta.env.VITE_BACKEND_URL + "/auth/products",
        {
          name,
          price,
          category,
          remainingStock,
          inStock: remainingStock > 0,
          id: Date.now(),
        }
      );
      toast.success("Product added");
      fetchProducts();
    } catch (error) {
      toast.error("Failed to add product");
    }
  };

  // Update product
  const handleUpdateProduct = async (product: Product) => {
    const name = prompt("Product name:", product.name);
    const price = Number(prompt("Price:", product.price.toString()));
    const category = prompt("Category:", product.category);
    const remainingStock = Number(
      prompt("Remaining stock:", product.remainingStock.toString())
    );

    if (!name || !price || !category || isNaN(remainingStock)) return;

    try {
      await axiosInstance.patch(
        import.meta.env.VITE_BACKEND_URL + `/auth/products/${product._id}`,
        {
          name,
          price,
          category,
          remainingStock,
          inStock: remainingStock > 0,
        }
      );
      toast.success("Product updated");
      fetchProducts();
    } catch (error) {
      toast.error("Failed to update product");
    }
  };

  // Delete product
  const handleDeleteProduct = async (id: string) => {
    try {
      await axiosInstance.delete(
        import.meta.env.VITE_BACKEND_URL + `/auth/products/${id}`
      );
      toast.success("Product deleted");
      fetchProducts();
    } catch (error) {
      toast.error("Failed to delete product");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6 dark:text-white">
        Admin Panel
      </h1>

      <div className="flex gap-4 mb-6">
        <button
          className={`px-4 py-2 rounded ${
            activeTab === "users" ? "bg-indigo-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => setActiveTab("users")}>
          Users
        </button>
        <button
          className={`px-4 py-2 rounded ${
            activeTab === "products"
              ? "bg-indigo-600 text-white"
              : "bg-gray-200"
          }`}
          onClick={() => setActiveTab("products")}>
          Products
        </button>
      </div>

      {activeTab === "users" ? (
        <div>
          <button
            className="bg-green-500 text-white px-4 py-2 rounded mb-4"
            onClick={handleAddUser}>
            Add User
          </button>

          {users.length > 0 ? (
            <table className="w-full border dark:bg-white">
              <thead>
                <tr className="border-b">
                  <th className="p-2 text-left">Name</th>
                  <th className="p-2 text-left">Email</th>
                  <th className="p-2 text-left">Role</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="border-b">
                    <td className="p-2">{user.username}</td>
                    <td className="p-2">{user.email}</td>
                    <td className="p-2">{user.role}</td>
                    <td className="p-2 text-center">
                      <button
                        className="bg-red-500 text-white px-2 py-1 rounded"
                        onClick={() => handleDeleteUser(user._id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No users found.</p>
          )}
        </div>
      ) : (
        <div>
          <button
            className="bg-green-500 text-white px-4 py-2 rounded mb-4"
            onClick={handleAddProduct}>
            Add Product
          </button>

          {products.length > 0 ? (
            <table className="w-full border dark:bg-white">
              <thead>
                <tr className="border-b">
                  <th className="p-2 text-left">Name</th>
                  <th className="p-2 text-left">Category</th>
                  <th className="p-2 text-left">Price</th>
                  <th className="p-2 text-left">Stock</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id} className="border-b">
                    <td className="p-2">{product.name}</td>
                    <td className="p-2">{product.category}</td>
                    <td className="p-2">₹{product.price}</td>
                    <td className="p-2">{product.remainingStock}</td>
                    <td className="p-2 flex gap-2 items-center justify-center">
                      <button
                        className="bg-blue-500 text-white px-2 py-1 rounded"
                        onClick={() => handleUpdateProduct(product)}>
                        Update
                      </button>
                      <button
                        className="bg-red-500 text-white px-2 py-1 rounded"
                        onClick={() => handleDeleteProduct(product._id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No products found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
