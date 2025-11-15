import { useEffect, useState } from "react";
import OrderCard from "../components/OrderCard";
import { toast } from "react-toastify";
import axiosInstance from "../services/axios";

const StaffOrders = () => {
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    const res = await axiosInstance.get(
      import.meta.env.VITE_BACKEND_URL + "/auth/orders"
    );
    setOrders(res.data.orders);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleApprove = async (orderId: string) => {
    await axiosInstance.patch(
      `${import.meta.env.VITE_BACKEND_URL}/auth/processorder/${orderId}`,
      { action: "approve" }
    );
    toast.success("Order approved");
    fetchOrders();
  };

  const handleReject = async (orderId: string) => {
    await axiosInstance.patch(
      `${import.meta.env.VITE_BACKEND_URL}/auth/processorder/${orderId}`,
      { action: "reject" }
    );
    toast.success("Order rejected");
    fetchOrders();
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6 dark:text-white">
        Pending Orders
      </h1>
      {orders.length > 0 ? (
        orders.map((order: any) => (
          <OrderCard
            key={order._id}
            order={order}
            isStaff
            onApprove={() => handleApprove(order._id)}
            onReject={() => handleReject(order._id)}
          />
        ))
      ) : (
        <p className="dark:text-white">No orders found.</p>
      )}
    </div>
  );
};

export default StaffOrders;
