import React, { useEffect, useState } from "react";
import Footer from "./Footer";
import Header from "./Header";
import { getOrdersByUserId, Order } from "../service/order";
import { NavLink } from "react-router-dom";
import LoadingComponent from "./Loading";

const Orderlisthistory = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [cancelReason, setCancelReason] = useState<string>(""); // State cho lý do hủy
  const itemsPerPage = 5; // Số đơn hàng hiển thị trên mỗi trang

  const statusMapping: { [key: string]: string } = {
    pending: "Chờ xử lý",
    completed: "Hoàn thành",
    cancelled: "Đã hủy",
    processing: "Đang xử lý",
    in_progress: "Đang giao hàng",
    delivered: "Đã giao",
    deleted: "Đã hủy",
    failed: "Đã hủy",
    confirmed: "Đã xác nhận", 
   "confirm-receive": "Hoàn thành", 
  };

  const paymentMethodMapping: { [key: string]: string } = {
    credit_card: "Thẻ tín dụng",
    paypal: "PayPal",
    bank_transfer: "Chuyển khoản ngân hàng",
    cash_on_delivery: "Thanh toán khi nhận hàng",
    e_wallet: "Ví điện tử",
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const userData = sessionStorage.getItem("user");
        if (!userData) {
          setError("Bạn chưa đăng nhập. Vui lòng đăng nhập để xem lịch sử đơn hàng.");
          setLoading(false);
          return;
        }

        const { id } = JSON.parse(userData);
        const fetchedOrders = await getOrdersByUserId(id);
        setOrders(fetchedOrders);
      } catch (error) {
        setError("Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.");
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const indexOfLastOrder = currentPage * itemsPerPage;
  const indexOfFirstOrder = indexOfLastOrder - itemsPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(orders.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const confirmCancelOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
    setShowModal(true);
  };

  const handleCancelOrder = async () => {
    if (!selectedOrderId || !cancelReason) {
      alert("Vui lòng chọn lý do hủy đơn hàng.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:28017/api/orders/${selectedOrderId}/cancel`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reason: cancelReason }) // Gửi lý do hủy
        }
      );

      if (!response.ok) {
        throw new Error("Không thể hủy đơn hàng. Vui lòng thử lại sau.");
      }

      const updatedOrder = await response.json();
      setOrders((prevOrders) =>
        prevOrders
          .map((order) =>
            order._id === updatedOrder._id
              ? { ...order, status: updatedOrder.status, cancelReason: updatedOrder.cancelReason } // Lưu lý do hủy
              : order
          )
          .filter((order) => order.status !== "deleted")
      );
      window.location.reload();
    } catch (error) {
      console.error("Error cancelling order:", error);
      alert("Rất tiếc, không thể hủy đơn hàng. Vui lòng thử lại sau hoặc liên hệ bộ phận hỗ trợ khách hàng.");
    } finally {
      setShowModal(false);
      setSelectedOrderId(null);
    }
  };
  const handleUserConfirmReceipt = async (orderId: string) => {
    try {
        const response = await fetch(`http://localhost:28017/api/orders/${orderId}/confirm-receive`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: "Thành công" }),
        });

        if (!response.ok) {
            throw new Error("Xác nhận nhận hàng không thành công.");
        }

       
        await fetch(`http://localhost:28017/orders-list/${orderId}/received`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: "confirm-receive" }), 
        });

        const updatedOrder = await response.json();
        setOrders((prevOrders) =>
            prevOrders.map((order) =>
                order._id === orderId
                    ? { ...order, status: "Thành công" }
                    : order
            )
        );
        
    } catch (error) {
        alert("Không thể xác nhận nhận hàng. Vui lòng thử lại sau.");
    }
};
  if (loading) {
    return (
      <>
        <Header />
        <LoadingComponent />
        <Footer />
      </>
    );
  }

  if (error) {
    return <p className="text-red-500 text-center mt-10">{error}</p>;
  }

  if (orders.length === 0) {
    return (
      <>
        <Header />
        <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            Không có đơn hàng nào
          </h2>
          <p className="text-gray-500 text-center max-w-md">
            Có vẻ như bạn chưa đặt bất kỳ đơn hàng nào. Hãy khám phá sản phẩm
            của chúng tôi và đặt hàng ngay hôm nay!
          </p>
          <NavLink
            to="/products"
            className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700 transition-all"
          >
            Khám phá sản phẩm
          </NavLink>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="max-w-7xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4">DANH SÁCH ĐƠN HÀNG MỚI NHẤT</h2>
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-left">Mã đơn hàng</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Ngày đặt</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Thành tiền</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Phương thức thanh toán</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Trạng thái thanh toán</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Tình trạng đơn hàng</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Hành động</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Lý do hủy</th>
              </tr>
            </thead>
            <tbody>
              {currentOrders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">{order._id}</td>
                  <td className="border border-gray-300 px-4 py-2">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(order.amount)}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {paymentMethodMapping[order.paymentMethod] || order.paymentMethod}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {statusMapping[order.paymentstatus] || order.paymentstatus}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {statusMapping[order.status] || order.status}
                  </td>

                  <td className="border border-gray-300 px-4 py-2">
                    <div className="flex space-x-2">
                      {order.status === "pending" && (
                        <button
                        onClick={() => confirmCancelOrder(order._id)}
                        className="bg-red-600 text-white py-1 px-4 rounded-lg hover:bg-red-700 whitespace-nowrap"
                      >
                        Hủy đơn
                      </button>
                      )}
                      
  <td key={order._id} className="hover:bg-gray-50">
    {/* Other cells */}
    
      {/* Existing buttons */}
      {order.status === "delivered" && (
        <button
          onClick={() => handleUserConfirmReceipt(order._id)}
          className="bg-green-500 text-white px-6 py-2 rounded-lg transition-all duration-300 hover:bg-green-600"
        >
          Đã nhận hàng
        </button>
      )}
    </td>
  

                      <NavLink to={`/orders/${order._id}`}>
                        <button
                          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all"
                        >
                          Xem
                        </button>
                      </NavLink>
                    </div>
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {order.cancelReason ? (
                      <div>
                        <p>Lý do hủy: {order.cancelReason.reason}</p>
                        <p>Thời điểm hủy: {new Date(order.cancelReason.canceledAt).toLocaleString()}</p>

                      </div>
                    ) : (
                      ""
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-between items-center mt-4">
          <button
            className="px-4 py-2 bg-gray-300 rounded-lg"
            disabled={currentPage === 1}
            onClick={() => paginate(currentPage - 1)}
          >
            Trang trước
          </button>
          <div className="flex space-x-2">
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index}
                onClick={() => paginate(index + 1)}
                className={`px-4 py-2 rounded-lg ${currentPage === index + 1 ? "bg-blue-600 text-white" : "bg-gray-200"
                  }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
          <button
            className="px-4 py-2 bg-gray-300 rounded-lg"
            disabled={currentPage === totalPages}
            onClick={() => paginate(currentPage + 1)}
          >
            Trang sau
          </button>
        </div>
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-lg w-96">
            <h3 className="text-xl font-semibold mb-4">Lý do hủy đơn hàng</h3>
            <textarea
              className="w-full p-2 border border-gray-300 rounded-lg mb-4"
              rows={4}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Nhập lý do hủy đơn hàng"
            />
            <div className="flex justify-end">
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded-lg mr-2"
                onClick={handleCancelOrder}
              >
                Xác nhận hủy
              </button>
              <button
                className="bg-gray-300 text-black px-4 py-2 rounded-lg"
                onClick={() => setShowModal(false)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </>
  );
};

export default Orderlisthistory;
