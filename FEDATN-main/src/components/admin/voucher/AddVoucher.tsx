import React, { useEffect, useState } from "react";
import { Form, Input, message, InputNumber, DatePicker, Switch } from "antd";
import { useNavigate } from "react-router-dom";
import { IVoucher } from "../../../interface/voucher";
import { addVoucher, getAllVouchers } from "../../../service/voucher";


type Props = {};

const AddVoucher = (props: Props) => {
  const [vouchers, setVouchers] = useState<IVoucher[]>([]);
  const [messageApi] = message.useMessage();
  const [form] = Form.useForm();
  const navigate = useNavigate();

  // Fetch all vouchers
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAllVouchers();
        setVouchers(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  // Success message
  const successMessage = () => {
    messageApi.open({
      type: "success",
      content: "Voucher added successfully",
    });
  };

  // Handle form submission
  const onFinish = async (values: any) => {
    try {
      const payload = {
        ...values,
        expirationDate: values.expirationDate.toISOString(), // Format date for API
      };

      // Check for duplicate voucher codes
      const isExist = vouchers.find(
        (voucher) => voucher.code === payload.code.trim()
      );
      if (isExist) {
        message.error("Voucher code already exists");
        return;
      }

      const voucher = await addVoucher(payload);

      if (voucher) {
        successMessage();
        message.success("Voucher added successfully!");
        form.resetFields();
        navigate("/admin/Vouchers"); // Navigate to voucher list
      } else {
        message.error("Unable to add voucher");
      }
    } catch (error) {
      console.error("Error adding voucher:", error);
      message.error("Server error: Unable to add voucher.");
    }
  };

  return (
    <>
      <div className="max-w-6xl mx-auto p-8 bg-white shadow-xl rounded-xl">
  <Form form={form} onFinish={onFinish}>
    <div>
      <label className="mb-2 text-2xl text-black block">Mã Voucher:</label>
      <Form.Item
        name="code"
        rules={[{ required: true, message: "Vui lòng nhập mã code!" }]}
      >
        <Input
          className="text-gray-700 p-4 w-full rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-blue-600 outline-none"
          placeholder="Vui lòng nhập mã code!"
        />
      </Form.Item>
    </div>

    <div>
      <label className="mb-2 text-2xl text-black block">Giá giảm:</label>
      <Form.Item
        name="discountAmount"
        rules={[{ required: true, message: "Vui lòng nhập giá giảm!" }]}
      >
        <InputNumber
          className="text-gray-700 w-full py-3 text-lg px-6 rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-blue-600 outline-none"
          placeholder="Vui lòng nhập giá giảm!"
          min={0}
          formatter={(value) => ` ${value}`} // Optional: Format value as currency
        />
      </Form.Item>
    </div>

    <div>
      <label className="mb-2 text-2xl text-black block">Ngày hết hạn:</label>
      <Form.Item
        name="expirationDate"
        rules={[{ required: true, message: "Ngày hết hạn!" }]}
      >
        <DatePicker
          className="w-full text-gray-700 p-4 rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-blue-600 outline-none"
          placeholder="Ngày hết hạn!"
          format="YYYY-MM-DD" // Optional: Specify date format
        />
      </Form.Item>
    </div>

    <div>
      <label className="mb-2 text-2xl text-black block">Số lượng:</label>
      <Form.Item
        name="quantity"
        rules={[{ required: true, message: "Vui lòng nhập số lượng!" }]}
      >
        <InputNumber
          className="text-gray-700 w-full py-3 text-lg px-6 rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-blue-600 outline-none"
          placeholder="Vui lòng nhập số lượng!"
          min={1}
        />
      </Form.Item>
    </div>

    <div>
      <label className="mb-2 text-2xl text-black block">Hiệu lực:</label>
      <Form.Item name="isActive" valuePropName="checked" initialValue={true}>
        <Switch />
      </Form.Item>
    </div>

    <button
      type="submit"
      className="!mt-8 w-full px-4 py-2.5 mx-auto block text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
    >
      Thêm mới voucher
    </button>
  </Form>
</div>


    </>
  );
};

export default AddVoucher;
