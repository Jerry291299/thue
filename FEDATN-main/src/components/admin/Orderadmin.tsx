import React, { useEffect, useState } from "react";
import { axiosservice } from "../../config/API";
import { IOrder } from "../../interface/order";
import { Pagination, Modal, Input, notification } from "antd";
import { NavLink } from "react-router-dom";
import { CheckCircleOutlined, CloseCircleOutlined, EyeOutlined } from "@ant-design/icons";
import axios from "axios";

interface Props {}

const Order = (props: Props) => {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [cancelReason, setCancelReason] = useState<string>("");
  const [orderIdToCancel, setOrderIdToCancel] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const itemsPerPage = 5;

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
    packaging: "Đóng gói",
    "confirm-receive": "Hoàn thành",
  };

  const formatCurrency = (value: any) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axiosservice.get("/orders");
      const sortedOrders = response.data.sort((a: IOrder, b: IOrder) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      setOrders(sortedOrders);
      setFilteredOrders(sortedOrders);
      setLoading(false);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách đơn hàng:", error);
      setError("Không thể tải dữ liệu");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => {
      fetchOrders();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const openNotification = (type: "success" | "error", description: string) => {
    notification[type]({
      message: type === "success" ? "Xác nhận đơn hàng thành công!" : "Có lỗi xảy ra!",
      description,
      placement: "topRight",
      duration: 2,
    });
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = event.target.value;
    setSearchTerm(searchValue);
    if (searchValue) {
      const filtered = orders.filter((order) =>
        order._id.toLowerCase().includes(searchValue.toLowerCase())
      );
      setFilteredOrders(filtered);
    } else {
      setFilteredOrders(orders);
    }
    setCurrentPage(1);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

  const handleCancelOrder = (orderId: string) => {
    if (!orderId) {
      alert("Không tìm thấy mã đơn hàng để hủy.");
      return;
    }
    setOrderIdToCancel(orderId);
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    if (!cancelReason) {
      alert("Bạn cần nhập lý do hủy đơn hàng.");
      return;
    }
    try {
      const response = await axiosservice.post(
        `http://localhost:28017/api/orders/${orderIdToCancel}/cancel`,
        { reason: cancelReason }
      );
      if (response.status !== 200) {
        throw new Error("Không thể hủy đơn hàng. Vui lòng thử lại sau.");
      }
      const updatedOrder = response.data;
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === updatedOrder._id
            ? {
                ...order,
                status: updatedOrder.status,
                cancelReason: {
                  reason: updatedOrder.cancelReason.reason,
                  canceledAt: updatedOrder.cancelReason.canceledAt,
                  canceledBy: updatedOrder.cancelReason.canceledBy,
                },
              }
            : order
        )
      );
      setIsModalVisible(false);
    } catch (error) {
      console.error("Error cancelling order:", error);
      alert("Rất tiếc, không thể hủy đơn hàng. Vui lòng thử lại sau hoặc liên hệ bộ phận hỗ trợ khách hàng.");
    }
  };

  useEffect(() => {
    const userData = sessionStorage.getItem("user");
    if (userData) {
      const { id } = JSON.parse(userData);
      if (id) {
        setUserId(id);
      }
    }
  }, []);

  const handleConfirmOrder = async (orderId: string) => {
    Modal.confirm({
      title: "Xác nhận đơn hàng",
      content: "Bạn có chắc chắn muốn xác nhận đơn hàng này?",
      okText: "Có",
      okType: "primary",
      cancelText: "Không",
      onOk: async () => {
        setLoading(true);
        try {
          const response = await axiosservice.post(`http://localhost:28017/api/orders/${orderId}/confirm`, {
            confirmedBy: userId,
          });
          if (response.status !== 200) {
            throw new Error("Không thể xác nhận đơn hàng. Vui lòng thử lại sau.");
          }
          const updatedOrder = response.data.order;
          setOrders((prevOrders) =>
            prevOrders.map((order) =>
              order._id === updatedOrder._id ? { ...order, status: "confirmed" } : order
            )
          );
          await axios.put(`http://localhost:28017/orders-list/${orderId}`, { status: "packaging" });
          openNotification("success", "Đơn hàng đã được xác nhận thành công!");
          window.location.reload();
        } catch (error) {
          console.error("Error confirming order:", error);
          openNotification("error", "Rất tiếc, không thể xác nhận đơn hàng. Vui lòng thử lại sau hoặc liên hệ bộ phận hỗ trợ khách hàng.");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setCancelReason("");
    setOrderIdToCancel(null);
  };

  const closeModal = () => {
    setSelectedOrder(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-lg p-6">
        {/* Header */}
        <header className="border-b border-gray-200 pb-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Quản lý đơn hàng</h1>
          <p className="text-sm text-gray-600">Theo dõi và quản lý các đơn hàng</p>
        </header>

        {/* Search Bar */}
        <div className="mb-6">
          <Input
            placeholder="🔍 Tìm kiếm theo mã đơn"
            value={searchTerm}
            onChange={handleSearch}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Orders Table */}
        <div>
          {loading ? (
            <p className="text-center text-gray-600">Đang tải dữ liệu...</p>
          ) : filteredOrders.length === 0 ? (
            <p className="text-center text-gray-600">Không có đơn hàng nào</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse bg-white rounded-lg shadow-md">
                  <thead className="bg-gray-50 text-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold border-b">STT</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold border-b">Mã đơn</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold border-b">Ngày đặt</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold border-b">Thanh toán</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold border-b">Tổng tiền</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold border-b">Trạng thái</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold border-b">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedOrders.map((order, index) => (
                      <tr key={order._id} className="hover:bg-gray-50 transition-colors duration-200">
                        <td className="px-4 py-3 border-b text-gray-700">
                          {(currentPage - 1) * itemsPerPage + index + 1}
                        </td>
                        <td className="px-4 py-3 border-b text-gray-700">{order._id}</td>
                        <td className="px-4 py-3 border-b text-gray-700">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 border-b text-gray-700">
                          {statusMapping[order.paymentstatus] || order.paymentstatus}
                        </td>
                        <td className="px-4 py-3 border-b text-gray-700">
                          {formatCurrency(order.amount)}
                        </td>
                        <td className="px-4 py-3 border-b">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-sm text-white font-medium ${
                              order.status === "pending"
                                ? "bg-yellow-500"
                                : order.status === "confirmed"
                                ? "bg-orange-500"
                                : order.status === "delivered"
                                ? "bg-green-500"
                                : order.status === "confirm-receive"
                                ? "bg-green-700"
                                : order.status === "cancelled"
                                ? "bg-red-500"
                                : order.status === "packaging"
                                ? "bg-purple-500"
                                : "bg-gray-400"
                            }`}
                          >
                            {statusMapping[order.status]}
                          </span>
                        </td>
                        <td className="px-4 py-3 border-b">
                          <div className="flex gap-2">
                            {order.status === "pending" && (
                              <>
                                <button
                                  onClick={() => handleCancelOrder(order._id)}
                                  className="flex items-center px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                                >
                                  <CloseCircleOutlined className="mr-1" />
                                  Hủy
                                </button>
                                <button
                                  onClick={() => handleConfirmOrder(order._id)}
                                  className="flex items-center px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                                >
                                  <CheckCircleOutlined className="mr-1" />
                                  Xác nhận
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                            >
                              <EyeOutlined className="mr-1" />
                              Xem
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination
                className="mt-6 flex justify-center"
                current={currentPage}
                total={filteredOrders.length}
                pageSize={itemsPerPage}
                onChange={setCurrentPage}
              />
            </>
          )}
        </div>
      </div>

      {/* Cancellation Modal */}
      <Modal
        title="Nhập lý do hủy đơn hàng"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Xác nhận"
        cancelText="Hủy"
        className="rounded-lg"
      >
        <Input.TextArea
          rows={4}
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
          placeholder="Nhập lý do hủy đơn hàng"
          className="border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
        />
      </Modal>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Chi tiết đơn hàng</h2>
            <div className="space-y-3 text-gray-700">
              <p><span className="font-semibold">Mã đơn:</span> {selectedOrder._id}</p>
              <p><span className="font-semibold">Ngày đặt:</span> {new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
              <p><span className="font-semibold">Thanh toán:</span> {statusMapping[selectedOrder.paymentstatus]}</p>
              <p>
                <span className="font-semibold">Trạng thái:</span>{" "}
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm text-white ${
                    selectedOrder.status === "pending"
                      ? "bg-yellow-500"
                      : selectedOrder.status === "confirmed"
                      ? "bg-orange-500"
                      : selectedOrder.status === "delivered"
                      ? "bg-green-500"
                      : selectedOrder.status === "confirm-receive"
                      ? "bg-green-700"
                      : selectedOrder.status === "cancelled"
                      ? "bg-red-500"
                      : selectedOrder.status === "packaging"
                      ? "bg-purple-500"
                      : "bg-gray-400"
                  }`}
                >
                  {statusMapping[selectedOrder.status]}
                </span>
              </p>

              {selectedOrder.status === "cancelled" && (
                <div className="mt-4">
                  <p className="font-semibold text-red-600">Lý do hủy:</p>
                  <p>{selectedOrder.cancelReason?.reason || "Không có lý do"}</p>
                </div>
              )}

              <p className="font-semibold">Sản phẩm:</p>
              <ul className="list-disc pl-5">
                {selectedOrder.items.map((item, idx) => (
                  <li key={idx} className="text-gray-700">
                    {item.name} ({item.quantity}) - {formatCurrency(item.price)}
                  </li>
                ))}
              </ul>

              <p><span className="font-semibold">Tổng tiền:</span> {formatCurrency(selectedOrder.amount)}</p>
            </div>

            <div className="mt-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Thông tin khách hàng</h2>
              <div className="space-y-2 text-gray-700">
                <p><span className="font-semibold">Khách hàng:</span> {selectedOrder.customerDetails.name}</p>
                <p><span className="font-semibold">Điện thoại:</span> {selectedOrder.customerDetails.phone}</p>
                <p><span className="font-semibold">Email:</span> {selectedOrder.customerDetails.email}</p>
                <p><span className="font-semibold">Địa chỉ:</span> {selectedOrder.customerDetails.address}</p>
                {selectedOrder.customerDetails.notes && (
                  <p><span className="font-semibold">Ghi chú:</span> {selectedOrder.customerDetails.notes}</p>
                )}
              </div>
            </div>

            <button
              onClick={closeModal}
              className="mt-6 w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Order;