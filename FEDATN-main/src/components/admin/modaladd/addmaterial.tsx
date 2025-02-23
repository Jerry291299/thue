import React, { useEffect, useState } from "react";
import { Form, Input, message } from "antd";
import { useNavigate } from "react-router-dom";
import { addMaterial, getAllMaterials } from "../../../service/material";
import { IMaterial } from "../../../interface/material";

const AddMaterial = () => {
  const [messageApi, contextHolder] = message.useMessage(); // useMessage Hook
  const [materials, setMaterials] = useState<IMaterial[]>([]);

  const navigate = useNavigate();
  const [form] = Form.useForm();

  // Get material
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAllMaterials();
        
        setMaterials(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  const info = () => {
    messageApi.open({
      type: "success",
      content: "Material added successfully",
    });
  };

  const onFinish = async (values: any) => {
    try {
      const payload = { ...values };

       // same name material
       const isExist = materials.find((material) => material.name === payload.name.trim());
       if (isExist) {
         messageApi.error("Tên chất liệu đã tồn tạo! Vui lòng nhập tên khác");
         return;
       }

      const material = await addMaterial(payload);

      if (material) {
        console.log("Added Material:", material);
        info(); // Call success message
        message.success("Thêm Chất Liệu thành công!");
        form.resetFields();
        navigate("/admin/Material"); // Điều hướng người dùng đến trang ListMaterial sau khi thêm thành công
      } else {
        messageApi.error("Failed to add material");
      }
    } catch (error) {
      console.error("Error adding material:", error);
      messageApi.error("Server Error: Could not add material.");
    }
  };

  return (
    <>
      {contextHolder} {/* Render context for messages */}
      <div className="flex items-center justify-between px-6 h-[96px] bg-white-600 text-white"></div>
      <div className="max-w-6xl mx-auto p-8 bg-white shadow-xl rounded-xl">
        <Form form={form} initialValues={{ material: "1" }} onFinish={onFinish}>
          <div>
            <label className="mb-2 text-2xl text-black block">
              Material name:
            </label>
            <Form.Item
              name="name"
              rules={[
                { required: true, message: "Please input the material name!" },
              ]}
            >
              <Input
                className="text-gray-700 p-4 rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-blue-600 outline-none"
                placeholder="Nhập tên chất liệu"
              />
            </Form.Item>
          </div>

          <button
            type="submit"
            className="!mt-8 w-full px-4 py-2.5 mx-auto block text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add New Material
          </button>
        </Form>
      </div>
    </>
  );
};

export default AddMaterial;
