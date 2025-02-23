import React, { useEffect, useState } from "react";
import { Form, Input, InputNumber, DatePicker, Switch, Button, message } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { IVoucher } from "../../../interface/voucher";
import { updateVoucher } from "../../../service/voucher";
import { axiosservice } from "../../../config/API";
import dayjs from "dayjs"; // Import dayjs for date handling

const EditVoucher = () => {
  const [form] = Form.useForm();
  const { id } = useParams();
  const navigate = useNavigate();

  const [voucher, setVoucher] = useState<IVoucher | null>(null);

  useEffect(() => {
    if (id) {
      fetchVoucher(id);
    }
  }, [id]);

  const fetchVoucher = async (voucherId: string) => {
    try {
      const response = await axiosservice.get(`/vouchers/${voucherId}`);
      const fetchedVoucher = response.data;
      
      // Ensure the expirationDate is valid and formatted
      if (fetchedVoucher.expirationDate) {
        fetchedVoucher.expirationDate = dayjs(fetchedVoucher.expirationDate); // Format it to dayjs object
      }

      setVoucher(fetchedVoucher);
      form.setFieldsValue(fetchedVoucher); // Populate the form with the existing data
    } catch (error) {
      console.error("Error fetching voucher:", error);
      message.error("Failed to fetch voucher details.");
    }
  };

  const onFinish = async (values: IVoucher) => {
    if (id) {
      try {
        // Call the update voucher service
        const updatedVoucher = await updateVoucher(id, values);
        message.success("Voucher updated successfully!");
        navigate("/admin/Vouchers");
      } catch (error) {
        message.error("Failed to update voucher.");
      }
    }
  };

  return (
    <>
    <div className="max-w-6xl mx-auto p-8 bg-white shadow-xl rounded-xl">
  <h1 className="text-2xl font-bold mb-6">Edit Voucher</h1>
  {voucher && (
    <Form
      form={form}
      onFinish={onFinish}
      initialValues={voucher}
      labelCol={{ span: 6 }}
      wrapperCol={{ span: 18 }}
    >
      <div>
        <label className="mb-2 text-2xl text-black block">Voucher Code:</label>
        <Form.Item
          name="code"
          rules={[{ required: true, message: "Please enter the voucher code!" }]}
        >
          <Input
            className="text-gray-700 p-4 w-full rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-blue-600 outline-none"
            placeholder="Enter voucher code"
          />
        </Form.Item>
      </div>

      <div>
        <label className="mb-2 text-2xl text-black block">Discount Amount:</label>
        <Form.Item
          name="discountAmount"
          rules={[{ required: true, message: "Please enter the discount amount!" }]}
        >
          <InputNumber
            className="text-gray-700 w-full py-3 text-lg px-6 rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-blue-600 outline-none"
            placeholder="Enter discount amount"
            min={0}
          />
        </Form.Item>
      </div>

      <div>
        <label className="mb-2 text-2xl text-black block">Expiration Date:</label>
        <Form.Item
          name="expirationDate"
          rules={[{ required: true, message: "Please select an expiration date!" }]}
        >
          <DatePicker
            className="w-full text-gray-700 p-4 rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-blue-600 outline-none"
            placeholder="Select expiration date"
            value={voucher.expirationDate} // Make sure this is passed as a valid dayjs object
          />
        </Form.Item>
      </div>

      <div>
        <label className="mb-2 text-2xl text-black block">Quantity:</label>
        <Form.Item
          name="quantity"
          rules={[{ required: true, message: "Please enter the quantity!" }]}
        >
          <InputNumber
            className="text-gray-700 w-full py-3 text-lg px-6 rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-blue-600 outline-none"
            placeholder="Enter quantity"
            min={1}
          />
        </Form.Item>
      </div>

      <div>
        <label className="mb-2 text-2xl text-black block">Active Status:</label>
        <Form.Item name="isActive" valuePropName="checked" initialValue={voucher.isActive}>
          <Switch />
        </Form.Item>
      </div>

      <button
        type="submit"
        className="!mt-8 w-full px-4 py-2.5 mx-auto block text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Update Voucher
      </button>
    </Form>
  )}
</div>

    </>
  );
};

export default EditVoucher;
