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
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
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

    // Tạo interval để tự động cập nhật mỗi 15 giây
    const interval = setInterval(() => {
      fetchOrders();
    }, 10000);

    // Dọn dẹp interval khi component bị hủy
    return () => clearInterval(interval);
  }, []);

  const openNotification = (type: 'success' | 'error', description: string) => {
    notification[type]({
      message: type === 'success' ? 'Xác nhận đơn hàng thành công!' : 'Có lỗi xảy ra!',
      description,
      placement: 'topRight',
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
  const paginatedOrders = filteredOrders.slice(
    startIndex,
    startIndex + itemsPerPage
  );

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
        {
          reason: cancelReason,
        }
      );
  
      if (response.status !== 200) {
        throw new Error("Không thể hủy đơn hàng. Vui lòng thử lại sau.");
      }
  
      const updatedOrder = response.data;

      // Cập nhật trạng thái trong danh sách đơn hàng mà không cần phải hiển thị lại modal confirm
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
      alert(
        "Rất tiếc, không thể hủy đơn hàng. Vui lòng thử lại sau hoặc liên hệ bộ phận hỗ trợ khách hàng."
      );
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
              order._id === updatedOrder._id
                ? {
                    ...order,
                    status: "confirmed",
                  }
                : order
            )
          );

          await axios.put(`http://localhost:28017/orders-list/${orderId}`, {
            status: "packaging",
          });

          openNotification('success', 'Đơn hàng đã được xác nhận thành công!');
          window.location.reload();
        } catch (error) {
          console.error("Error confirming order:", error);
          openNotification('error', 'Rất tiếc, không thể xác nhận đơn hàng. Vui lòng thử lại sau hoặc liên hệ bộ phận hỗ trợ khách hàng.');
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
    <div className="w-full h-screen bg-gray-50 p-4">
      <div className="mx-auto bg-white rounded-lg shadow-md p-6">
        <header className="border-b pb-4 mb-4">
          <h1 className="text-xl font-semibold text-gray-700">Quản lý đơn hàng</h1>
          <p className="text-sm text-gray-500">Theo dõi và quản lý các đơn hàng</p>
        </header>
        <div className="mb-4">
          <input
            type="text"
            placeholder="🔍 Tìm kiếm theo mã đơn"
            value={searchTerm}
            onChange={handleSearch}
            className="w-full p-2 border rounded-md focus:ring focus:ring-blue-300"
          />
        </div>
        <div>
          {loading ? (
            <p className="text-center text-gray-500">Đang tải dữ liệu...</p>
          ) : filteredOrders.length === 0 ? (
            <p className="text-center text-gray-500">Không có đơn hàng nào</p>
          ) : (
            <>
              <table className="w-full table-auto border-collapse border border-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-300 px-4 py-2">STT</th>
                    <th className="border border-gray-300 px-4 py-2">Mã đơn</th>
                    <th className="border border-gray-300 px-4 py-2">Ngày đặt</th>
                    <th className="border border-gray-300 px-4 py-2">Thanh toán</th>
                    <th className="border border-gray-300 px-4 py-2">Tổng tiền</th>
                    <th className="border border-gray-300 px-4 py-2">Trạng thái</th>
                    <th className="border border-gray-300 px-4 py-2">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedOrders.map((order, index) => (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {order._id}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {statusMapping[order.paymentstatus] || order.paymentstatus}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {order.amount.toLocaleString()} VND
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <span
                          className={`inline-block px-4 py-1 rounded text-white text-center whitespace-nowrap ${
                            order.status === "pending"
                              ? "bg-yellow-500"
                              : order.status === "confirmed"
                              ? "bg-orange-500"
                              : order.status === "delivered"
                              ? "bg-green-500"
                              : order.status === "confirm-receive"
                              ? "bg-green-800" // Add or verify this condition
                              : order.status === "cancelled"
                              ? "bg-red-500"
                              : "bg-gray-400"
                          }`}
                          
                          style={{ minWidth: "120px" }}
                        >
                          {statusMapping[order.status]}
                        </span>
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <div className="flex gap-2">
                          {order.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleCancelOrder(order._id)}
                                className="flex items-center px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                              >
                                <CloseCircleOutlined className="mr-1" />
                                Hủy
                              </button>
                              <button
                                onClick={() => handleConfirmOrder(order._id)}
                                className="flex items-center px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                              >
                                <CheckCircleOutlined className="mr-1" />
                                Xác nhận
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="flex items-center px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
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
              <Pagination
                className="mt-4 text-center"
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
      >
        <Input.TextArea
          rows={4}
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
          placeholder="Nhập lý do hủy đơn hàng"
        />
      </Modal>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-md w-1/2">
            <h2 className="text-2xl font-semibold mb-4">Chi tiết đơn hàng</h2>
            <p><strong>Mã đơn: </strong>{selectedOrder._id}</p>
            <p><strong>Ngày đặt: </strong>{new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
            <p><strong>Thanh toán: </strong>{statusMapping[selectedOrder.paymentstatus]}</p>
            <p><strong>Trạng thái: </strong>{statusMapping[selectedOrder.status]}</p>

            {selectedOrder.status === "cancelled" && (
              <div className="mt-4">
                <strong>Lý do hủy: </strong>
                <p>{selectedOrder.cancelReason?.reason || "Không có lý do"}</p>
              </div>
            )}

            <p><strong>Sản phẩm:</strong></p>
            <ul>
              {selectedOrder.items.map((item, idx) => (
                <li key={idx}>
                  {item.name} ({item.quantity}) - {item.price.toLocaleString()} VND
                </li>
              ))}
            </ul>

            <p><strong>Tổng tiền: </strong>{selectedOrder.amount.toLocaleString()} VND</p>

            <div className="mt-4">
              <h2 className="text-2xl font-semibold mb-4">Thông tin khách hàng</h2>
              <p><strong>Khách hàng: </strong>{selectedOrder.customerDetails.name}</p>
              <p><strong>Điện thoại: </strong>{selectedOrder.customerDetails.phone}</p>
              <p><strong>Email: </strong>{selectedOrder.customerDetails.email}</p>
              <p><strong>Địa chỉ: </strong>{selectedOrder.customerDetails.address}</p>
              {selectedOrder.customerDetails.notes && (
                <p><strong>Ghi chú: </strong>{selectedOrder.customerDetails.notes}</p>
              )}
            </div>

            <button
              onClick={closeModal}
              className="mt-4 px-4 py-2 bg-gray-500 text-white rounded"
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