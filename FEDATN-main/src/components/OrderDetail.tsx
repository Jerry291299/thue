import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";  // Import useNavigate
import { getOrderById, Order } from "../service/order";
import Header from "./Header";
import Footer from "./Footer";
import LoadingComponent from "./Loading";

const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate(); // Initialize navigate
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [cancelReason, setCancelReason] = useState<string>("");

  // Payment method mapping
  const paymentMethodMapping: { [key: string]: string } = {
    credit_card: "Thẻ tín dụng",
    paypal: "PayPal",
    bank_transfer: "Chuyển khoản ngân hàng",
    cash_on_delivery: "Thanh toán khi nhận hàng",
    e_wallet: "Ví điện tử",
  };

  // Order status mapping
  const orderStatusMapping: { [key: string]: string } = {
    pending: "Chờ xử lý",
    processing: "Đang xử lý",
    shipped: "Đã giao",
    completed: "Hoàn thành",
    canceled: "Đã hủy",
  };

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const fetchedOrder = await getOrderById(id!);
        setOrder(fetchedOrder);
      } catch (error) {
        setError("Không thể tải đơn hàng. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const handleCancelOrder = async () => {
    if (!cancelReason) {
      alert("Vui lòng cung cấp lý do hủy đơn hàng.");
      return;
    }
    try {
      const response = await fetch(
        `http://localhost:28017/api/orders/${id}/cancel`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reason: cancelReason }),
        }
      );
      if (!response.ok) {
        throw new Error("Hủy đơn hàng không thành công.");
      }
      const updatedOrder = await response.json();
      setOrder(updatedOrder);
      setShowModal(false);
    } catch (error) {
      alert("Không thể hủy đơn hàng. Vui lòng thử lại sau.");
    }
  };

  const handleGoBack = () => {
    navigate(-1);  // Navigate back to the previous page
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
    return (
      <>
        <Header />
        <div className="text-red-500 text-center mt-10">{error}</div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="max-w-7xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Chi tiết đơn hàng</h2>
        <div className="overflow-x-auto">
          {order ? (
            <table className="w-full table-auto border-collapse border border-gray-200 rounded-lg shadow-sm">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="border border-gray-300 px-6 py-4 text-left font-medium text-sm">Tên thuộc tính</th>
                  <th className="border border-gray-300 px-6 py-4 text-left font-medium text-sm">Nội dung</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-6 py-4 font-semibold">Mã đơn hàng</td>
                  <td className="border border-gray-300 px-6 py-4">{order._id}</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-6 py-4 font-semibold">Ngày tạo</td>
                  <td className="border border-gray-300 px-6 py-4">{new Date(order.createdAt).toLocaleString()}</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-6 py-4 font-semibold">Tổng tiền</td>
                  <td className="border border-gray-300 px-6 py-4">
                    {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(order.amount)}
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-6 py-4 font-semibold">Phương thức thanh toán</td>
                  <td className="border border-gray-300 px-6 py-4">{paymentMethodMapping[order.paymentMethod] || order.paymentMethod}</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-6 py-4 font-semibold">Trạng thái thanh toán</td>
                  <td className="border border-gray-300 px-6 py-4">{order.paymentstatus}</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-6 py-4 font-semibold">Trạng thái đơn hàng</td>
                  <td className="border border-gray-300 px-6 py-4">{orderStatusMapping[order.status] || order.status}</td>
                </tr>
                {order.cancelReason && (
                  <>
                    <tr className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-6 py-4 font-semibold">Lý do hủy</td>
                      <td className="border border-gray-300 px-6 py-4">{order.cancelReason.reason}</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-6 py-4 font-semibold">Thời gian hủy</td>
                      <td className="border border-gray-300 px-6 py-4">{new Date(order.cancelReason.canceledAt).toLocaleString()}</td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          ) : (
            <div>Không có dữ liệu đơn hàng.</div>
          )}
        </div>

        {order && order.status === "pending" && (
          <div className="mt-4">
            <button
              onClick={() => setShowModal(true)}
              className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700"
            >
              Hủy đơn hàng
            </button>
          </div>
        )}

        {/* Add Go Back button */}
        <div className="mt-4">
          <button
            onClick={handleGoBack}
            className="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600"
          >
            Quay lại
          </button>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-lg w-96">
            <h3 className="text-xl font-semibold mb-4">Hủy đơn hàng</h3>
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

export default OrderDetail;
