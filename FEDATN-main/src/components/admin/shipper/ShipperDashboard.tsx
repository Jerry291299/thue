import React, { useEffect, useState } from "react";
import axios from "axios";
import { IOrder } from "../../../service/order";

type Props = {};

const ShipperDashboard = (props: Props) => {
  const [orders, setOrders] = useState<IOrder[]>([]); 
  const [filter, setFilter] = useState<string>("all"); 
  const [isLoading, setIsLoading] = useState<boolean>(false); 
  const [error, setError] = useState<string | null>(null); 

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const endpoint = `http://localhost:28017/orders-list${
          filter !== "all" ? `?status=${filter}` : ""
        }`;
        const response = await axios.get<IOrder[]>(endpoint);
        setOrders(response.data); 
      } catch (err) {
        console.error("Error fetching orders:", err); 
        setError("Failed to fetch orders. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [filter]);

  const pendingOrders = orders.filter((order) => order.status === "pending").length;
  const deliveredOrders = orders.filter((order) => order.status === "delivered").length;
  const cancelledOrders = orders.filter((order) => order.status === "failed").length; 
  const totalOrders = orders.length;

  const handleFilterChange = (status: string) => {
    setFilter(status); 
  };

  return (
    <div
      className="container mx-auto p-6 relative"
      style={{
        backgroundImage: "url('https://th.bing.com/th/id/R.5fb55164d2f9a8d47e9f359a6617f317?rik=A2BTruMekfC%2bWQ&pid=ImgRaw&r=0')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: "100vh",
      }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      <div className="relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <div className="bg-blue-500 text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h2 className="text-xl font-semibold">Tổng đơn hàng</h2>
            <p className="text-3xl font-bold mt-2">{totalOrders}</p>
          </div>
          <div className="bg-yellow-500 text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h2 className="text-xl font-semibold">Đang xử lý đơn hàng</h2>
            <p className="text-3xl font-bold mt-2">{pendingOrders}</p>
          </div>
          <div className="bg-green-500 text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h2 className="text-xl font-semibold">Đơn hàng đã giao</h2>
            <p className="text-3xl font-bold mt-2">{deliveredOrders}</p>
          </div>
          <div className="bg-red-500 text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h2 className="text-xl font-semibold">Đơn hàng thất bại</h2>
            <p className="text-3xl font-bold mt-2">{cancelledOrders}</p>
          </div>
        </div>

        <div className="text-center mt-6">
          {isLoading && <p className="text-lg text-white">Loading orders...</p>}
          {error && <p className="text-red-500">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default ShipperDashboard;
