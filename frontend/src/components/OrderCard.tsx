interface OrderItem {
  product: number;
  quantity: number;
  price: number;
  productSnapshot: {
    name: string;
    category: string;
    price: number;
  };
}

interface Order {
  _id: string;
  customerName: string;
  total: number;
  status: string;
  items: OrderItem[];
}

interface OrderCardProps {
  order: Order;
  isStaff?: boolean;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}

const OrderCard = ({ order, isStaff, onApprove, onReject }: OrderCardProps) => {
  return (
    <div className="bg-white/70 backdrop-blur-lg shadow-md p-4 rounded-2xl w-full max-w-xl mx-auto mb-6">
      <h2 className="text-lg font-semibold mb-2">{order.customerName}</h2>
      <p className="text-sm mb-2">
        Status: <b>{order.status}</b>
      </p>
      <p className="text-sm mb-2">Total: ₹{order.total}</p>

      <ul className="mb-3 text-sm">
        {order.items.map((item, i) => (
          <li key={i}>
            {item.productSnapshot?.name || "Unknown"} × {item.quantity} — ₹
            {item.price}
          </li>
        ))}
      </ul>

      {isStaff && (
        <div className="flex gap-3">
          <button
            onClick={() => onApprove?.(order._id)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md">
            Approve
          </button>
          <button
            onClick={() => onReject?.(order._id)}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md ml-3">
            Reject
          </button>{" "}
        </div>
      )}
    </div>
  );
};

export default OrderCard;
