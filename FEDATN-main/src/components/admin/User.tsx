import React, { useEffect, useState } from "react";
import { Popconfirm, message, Pagination, Input, Modal, Select, Table, Button } from "antd";
import { getAllusersAccount, activateUser, deactivateUser, getDeactivationHistory } from "../../service/user";
import { IUser } from "../../interface/user";
import LoadingComponent from "../Loading";
import { useNavigate } from "react-router-dom";
import UpdateUser from "./modaladd/updateuser";

type Props = {};

const Users = (props: Props) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<IUser[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [deactivationHistory, setDeactivationHistory] = useState<any[]>([]);
  const [reason, setReason] = useState<string>("");
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const navigate = useNavigate();
  const { TextArea } = Input;
  const { Option } = Select;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    const userData = sessionStorage.getItem("user");
    if (userData) {
      const { id } = JSON.parse(userData);
      if (id) {
        setUserId(id);
      }
    }
  }, []);

  const showModal = (userId: string) => {
    setSelectedUserId(userId);
    setIsModalOpen(true);
  };

  const handleCancel = async () => {
    setIsModalOpen(false);
    setSelectedUserId(null);
    await fetchUsers();
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllusersAccount();
      setUsers(data.reverse());
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchDeactivationHistory = async () => {
      try {
        const data = await getDeactivationHistory();
        setDeactivationHistory(data);
      } catch (error) {
        console.error("Error fetching deactivation history:", error);
      }
    };
    fetchUsers();
    fetchDeactivationHistory();
  }, []);

  const deactivateUserById = async (id: string) => {
    let selectedReasonLocal = "";
    let tempReason = "";

    Modal.confirm({
      title: "Vô hiệu hóa người dùng",
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">Vui lòng chọn lý do hoặc nhập lý do mới:</p>
          <Select
            className="w-full"
            placeholder="Chọn lý do"
            onChange={(value: string) => (selectedReasonLocal = value)}
            allowClear
          >
            <Option value="Vi phạm chính sách">Vi phạm chính sách</Option>
            <Option value="Yêu cầu từ người dùng">Yêu cầu từ người dùng</Option>
            <Option value="Hoạt động bất thường">Hoạt động bất thường</Option>
          </Select>
          <TextArea
            rows={4}
            placeholder="Hoặc nhập lý do tùy chỉnh"
            onChange={(e) => (tempReason = e.target.value)}
            className="border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>
      ),
      onOk: async () => {
        const finalReason = selectedReasonLocal || tempReason.trim();
        if (!finalReason) {
          message.error("Vui lòng chọn hoặc nhập lý do.");
          return Promise.reject();
        }
        try {
          const _id = "admin"; // Assuming admin ID
          await deactivateUser(id, finalReason);
          message.success(`Người dùng với ID ${id} đã được vô hiệu hóa.`);

          setUsers((prevUsers) =>
            prevUsers.map((user) =>
              user._id === id ? { ...user, active: false, reason: finalReason } : user
            )
          );
          setDeactivationHistory((prevHistory) => [
            ...prevHistory,
            { userId: id, reason: finalReason, date: new Date().toLocaleString(), adminId: _id },
          ]);

          sessionStorage.removeItem("userToken");
          sessionStorage.removeItem("userData");
        } catch (error) {
          console.error("Error deactivating user:", error);
          message.error("Có lỗi xảy ra khi vô hiệu hóa người dùng.");
        }
      },
      okText: "Xác nhận",
      cancelText: "Hủy",
      className: "rounded-lg",
    });
  };

  const activateUserById = async (_id: string) => {
    try {
      await activateUser(_id);
      message.success(`Người dùng với ID ${_id} đã được kích hoạt lại.`);
      setUsers((prevUsers) =>
        prevUsers.map((user) => (user._id === _id ? { ...user, active: true } : user))
      );
    } catch (error) {
      console.error("Error activating user:", error);
      message.error("Có lỗi xảy ra khi kích hoạt lại người dùng.");
    }
  };

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedUsers = filteredUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handlePageChange = (page: number, pageSize?: number) => {
    setCurrentPage(page);
    if (pageSize) setPageSize(pageSize);
  };

  const historyColumns = [
    { title: "ID Người Dùng", dataIndex: "userId", key: "userId" },
    { title: "Lý Do", dataIndex: "reason", key: "reason" },
    { title: "Ngày", dataIndex: "date", key: "date" },
    { title: "Người thực hiện", dataIndex: "adminId", key: "adminId" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {loading && <LoadingComponent />}
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-lg p-6">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-gray-200 pb-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Quản lý người dùng</h1>
            <p className="text-sm text-gray-600">Danh sách và trạng thái người dùng</p>
          </div>
          <Button
            type="primary"
            onClick={() => setShowHistory(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Lịch Sử Vô Hiệu Hóa
          </Button>
        </header>

        {/* Search Bar */}
        <Input
          placeholder="🔍 Tìm kiếm người dùng theo Họ và Tên"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-6"
        />

        {/* Users Table */}
        <div className="overflow-x-auto rounded-lg shadow-md">
          <table className="w-full border-collapse bg-white rounded-lg">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Stt</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Họ và Tên</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Vai trò</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Trạng thái</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Lý do vô hiệu hóa</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.length > 0 ? (
                paginatedUsers.map((user: IUser, index: number) => (
                  <tr
                    key={user._id}
                    className="border-b hover:bg-gray-50 transition-colors duration-200"
                  >
                    <td className="px-6 py-4 text-gray-700">
                      {index + 1 + (currentPage - 1) * pageSize}
                    </td>
                    <td className="px-6 py-4 text-gray-700">{user.name}</td>
                    <td className="px-6 py-4 text-gray-700">{user.email}</td>
                    <td className="px-6 py-4 text-gray-700">{user.role}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                          user.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}
                      >
                        {user.active ? "Hoạt động" : "Vô hiệu hóa"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {user.reason && !user.active ? user.reason : "Không có"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Button
                          onClick={() => showModal(user._id)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-1 px-3 rounded-lg transition-colors duration-200"
                        >
                          Edit
                        </Button>
                        {user.active ? (
                          <Popconfirm
                            title="Vô hiệu hóa người dùng"
                            description="Bạn có chắc chắn muốn vô hiệu hóa người dùng này không?"
                            onConfirm={() => deactivateUserById(user._id)}
                            okText="Có"
                            cancelText="Không"
                          >
                            <button
                              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-1 px-3 rounded-lg transition-colors duration-200"
                            >
                              Deactivate
                            </button>
                          </Popconfirm>
                        ) : (
                          <Popconfirm
                            title="Kích hoạt lại người dùng"
                            description="Bạn có chắc chắn muốn kích hoạt lại người dùng này không?"
                            onConfirm={() => activateUserById(user._id)}
                            okText="Có"
                            cancelText="Không"
                          >
                            <button
                              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-1 px-3 rounded-lg transition-colors duration-200"
                            >
                              Activate
                            </button>
                          </Popconfirm>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center text-gray-500 py-4">
                    Không tìm thấy người dùng nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={filteredUsers.length}
          onChange={handlePageChange}
          showSizeChanger={false}
          className="mt-6 flex justify-center"
        />

        {/* Update User Modal */}
        <Modal
          title="Cập nhật vai trò người dùng"
          open={isModalOpen}
          onCancel={handleCancel}
          footer={null}
          className="rounded-lg"
        >
          {selectedUserId && (
            <UpdateUser
              userId={selectedUserId}
              onClose={async () => {
                setIsModalOpen(false);
                await fetchUsers();
              }}
            />
          )}
        </Modal>

        {/* Deactivation History Modal */}
        <Modal
          title="Lịch Sử Vô Hiệu Hóa"
          visible={showHistory}
          onCancel={() => setShowHistory(false)}
          footer={null}
          width={800}
          className="rounded-lg"
        >
          <Table
            columns={historyColumns}
            dataSource={deactivationHistory}
            rowKey="userId"
            className="rounded-lg"
          />
        </Modal>
      </div>
    </div>
  );
};

export default Users;