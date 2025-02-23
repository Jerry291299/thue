import React, { useEffect, useState } from "react";
import { Form, Input, message } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { IMaterial } from "../../../interface/material";
import { getAllMaterials, getMaterialByID, updateMaterial } from "../../../service/material";

type Props = {};

const UpdateMaterial = (props: Props) => {
  const [name, setName] = useState<string>("");
  const [materials, setMaterials] = useState<IMaterial[]>([]);
  const [messageApi] = message.useMessage();

  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { id } = useParams();

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


  useEffect(() => {
    const fetchMaterial = async () => {
      try {
        const response = await getMaterialByID(id);
        form.setFieldsValue({
          name: response.name,
        });
        // setMaterial(response);
        console.log(response);
      } catch (error) {
        // console.error("Error fetching material:", error);
      }
    };
    fetchMaterial();
  }, [id, form]);

  const onFinish = async (values: any) => {
    try {
      const materialData = { ...values };

      // same name material
      const isExist = materials.find((material) => material.name === materialData.name.trim());
      if (isExist) {
        message.error("Tên vật liệu đã tồn tại! Vui lòng nhập lại");
        return;
      }
      
      const updatedMaterial = await updateMaterial(id, materialData);

      if (updatedMaterial) {
        console.log("Updated Material:", updatedMaterial);
        message.success("Cập nhật vật liệu thành công");
        form.resetFields();
        navigate("/admin/Material");
      } else {
        message.error("Không thể cập nhật vật liệu");
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật vật liệu:", error);
      message.error("Lỗi máy chủ: Không thể cập nhật vật liệu.");
    }
  };

  return (
    <>
      <div className="pt-[20px] px-[30px]">
        <div className="space-y-6 font-[sans-serif] max-w-md mx-auto">
          <Form form={form} onFinish={onFinish}>
            <div>
              <label className="mb-2 text-2xl text-black block">
                Tên vật liệu:
              </label>
              <Form.Item
                name="name"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập tên vật liệu!",
                  },
                ]}
              >
                <Input
                  className="pr-4 pl-14 py-3 text-sm text-black rounded bg-white border border-gray-400 w-full outline-[#333]"
                  placeholder="Nhập tên vật liệu"
                />
              </Form.Item>
            </div>

            <button
              type="submit"
              className="!mt-8 w-full px-4 py-2.5 mx-auto block text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Cập nhật vật liệu
            </button>
          </Form>
        </div>
      </div>
    </>
  );
};

export default UpdateMaterial;