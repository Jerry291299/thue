import React, { useEffect, useState } from "react";
import { Form, Input, message } from "antd";
import { useNavigate } from "react-router-dom";
import { addCategory, getAllCategories } from "../../../service/category";
import { Icategory } from "../../../interface/category";

type Props = {};

const Addcategory = (props: Props) => {
  const [name, setName] = useState<string>("");
  const [messageApi] = message.useMessage();
  const [categorys, setCategorys] = useState<Icategory[]>([]);

  const Navigate = useNavigate();
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const info = () => {
    messageApi.open({
      type: "success",
      content: "Thêm danh mục thành công",
    });
  };

  // get all category
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAllCategories();

        setCategorys(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  const onFinish = async (values: any) => {
    try {
      const payload = { ...values };

      // same name category
      const isExist = categorys.find(
        (category) => category.name === payload.name.trim()
      );
      if (isExist) {
        message.error("Tên danh mục đã tồn tại");
        return;
      }
      
      const category = await addCategory(payload);

      if (category) {
        setName("");
        info();
        message.success("Thêm Danh Mục thành công!");

        form.resetFields();
        navigate("/admin/Listcategory"); // Quay lại trang danh sách danh mục
      } else {
        message.error("Không thể thêm danh mục");
      }
    } catch (error) {
      console.error("Lỗi khi thêm danh mục:", error);
      message.error("Lỗi máy chủ: Không thể thêm danh mục.");
    }
  };

  return (
    <>
      <div className="flex items-center justify-between px-6 h-[96px] bg-white-600 text-white"></div>
      <div className="max-w-6xl mx-auto p-8 bg-white shadow-xl rounded-xl">
        <Form form={form} onFinish={onFinish}>
          <div>
            <label className="mb-2 text-2xl text-black block">
              Tên danh mục:
            </label>
            <Form.Item
              name="name"
              rules={[
                { required: true, message: "Vui lòng nhập tên danh mục!" },
              ]}
            >
              <Input
                className="text-gray-700 p-4 rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-blue-600 outline-none"
                placeholder="Nhập tên danh mục"
              />
            </Form.Item>
          </div>

          <button
            type="submit"
            className="!mt-8 w-full px-4 py-2.5 mx-auto block text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Thêm mới Danh Mục
          </button>
        </Form>
      </div>
    </>
  );
};

export default Addcategory;
