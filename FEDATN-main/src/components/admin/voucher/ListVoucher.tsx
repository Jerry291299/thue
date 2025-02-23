import React, { useEffect, useState } from "react";
import { Table, Button, message, Switch } from "antd";
import { useNavigate } from "react-router-dom";
import { getAllVouchers, toggleVoucherStatus } from "../../../service/voucher";
import { IVoucher } from "../../../interface/voucher";

const ListVouchers = () => {
  const [vouchers, setVouchers] = useState<IVoucher[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const data = await getAllVouchers();
      setVouchers(data);
    } catch (error) {
      console.error("Failed to fetch vouchers:", error);
      message.error("Failed to load vouchers.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    if (!id) {
      message.error("Voucher ID is required.");
      return;
    }
    try {
      await toggleVoucherStatus(id);
      message.success(`Voucher ${isActive ? "deactivated" : "activated"} successfully!`);
      fetchVouchers(); // Refresh the voucher list
    } catch (error) {
      console.error("Failed to update voucher status:", error);
      message.error("Failed to update voucher status.");
    }
  };

  const columns = [
    {
      title: "Mã",
      dataIndex: "code",
      key: "code",
    },
    {
      title: "Giá giảm",
      dataIndex: "discountAmount",
      key: "discountAmount",
      render: (value: number) => `${value.toLocaleString()} VND`, // Format as VND
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Ngày hết hạn",
      dataIndex: "expirationDate",
      key: "expirationDate",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Hiệu lực",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive: boolean, record: IVoucher) => (
        <Switch
          checked={isActive}
          onChange={() => {
            if (record._id) {
              handleToggleActive(record._id, isActive);
            } else {
              message.error("Voucher ID is missing.");
            }
          }}
        />
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: IVoucher) => (
        <div className="flex gap-2">
          <Button
            type="primary"
            onClick={() => navigate(`/admin/Vouchers/${record._id}`)}
          >
            Sửa
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-6xl mx-auto p-8 bg-white shadow-xl rounded-xl">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Danh sách Voucher</h1>
        <Button type="primary" onClick={() => navigate("/admin/voucher/add")}>
          Thêm Voucher
        </Button>
      </div>
      <Table
        dataSource={vouchers}
        columns={columns}
        rowKey="_id"
        loading={loading}
      />
    </div>
  );
};

export default ListVouchers;
