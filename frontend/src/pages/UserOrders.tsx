import { useEffect, useState } from "react";
import OrderCard from "../components/OrderCard";
import axiosInstance from "../services/axios";

const UserOrders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      const res = await axiosInstance.get(
        import.meta.env.VITE_BACKEND_URL + "/auth/orders"
      );
      console.log(res);

      setOrders(res.data.orders);
    };
    fetchOrders();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6 dark:text-white">My Orders</h1>
      {orders.length > 0 ? (
        orders.map((order: any) => <OrderCard key={order._id} order={order} />)
      ) : (
        <p className="dark:text-white">No orders yet.</p>
      )}
    </div>
  );
};

export default UserOrders;
