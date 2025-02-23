import React, { useEffect, useState } from "react";
import { Form, Select, message } from "antd";
import { IUser } from "../../../interface/user";
import { getUserById, updateUser } from "../../../service/user";
import { useNavigate } from "react-router-dom";

const { Option } = Select;

type UpdateUserProps = {
  userId: string;
  onClose: () => void;
};

const UpdateUser: React.FC<UpdateUserProps> = ({ userId, onClose }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [messageApi] = message.useMessage();
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await getUserById(userId);
        if (response) {
          setUser(response);
          form.setFieldsValue({ role: response.role });
        } else {
          messageApi.error("User data not found.");
        }
      } catch (error) {
        messageApi.error("Failed to fetch user data.");
      }
    };

    fetchUser();
  }, [userId, form, messageApi]);

  const onFinish = async (values: { role: string }) => {
    try {
      const updatedUser = await updateUser(userId, values.role);
      if (updatedUser) {
        messageApi.success("User role updated successfully!");
        form.resetFields();
        onClose(); 
        
      } else {
        messageApi.error("Unable to update user.");
      }
    } catch (error) {
      messageApi.error("Error updating user role.");
    }
  };

  return (
    <div>
      {user && (
        <div>
          <h2>User Information</h2>
          <p>
            <strong>User ID:</strong> {user._id}
          </p>
          <p>
            <strong>Name:</strong> {user.name}
          </p>
          <p>
            <strong>Role:</strong> {user.role}
          </p>
        </div>
      )}
      <Form form={form} onFinish={onFinish}>
        <Form.Item
          name="role"
          rules={[{ required: true, message: "Please select the user role!" }]}
        >
          <Select placeholder="Select User Role">
            <Option value="user">User</Option>
            <Option value="shipper">Shipper</Option>
          </Select>
        </Form.Item>
        <button  type="submit" className="focus:outline-none text-white bg-green-600 hover:bg-green-700 font-medium rounded-lg text-sm px-6 py-4 mb-[10px] transition">
          Update Role
        </button>
      </Form>
    </div>
  );
};

export default UpdateUser;
