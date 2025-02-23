import React, { useEffect, useState } from "react";
import { Form, Input, Upload, notification } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { UploadOutlined } from "@ant-design/icons";
import { getPostById, updatePost } from "../../../service/new";
import { upload } from "../../../service/upload";

const UpdateNews = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams<string>(); // Chỉ định kiểu `id` là `string | undefined`
  const [images, setImages] = useState<string[]>([]); // Các hình ảnh hiện có
  const [files, setFiles] = useState<File[]>([]); // Các tệp tải lên mới
  const [existingImages, setExistingImages] = useState<string[]>([]);
  // Hàm tiện ích để hiển thị thông báo
  const showNotification = (
    type: "success" | "error",
    title: string,
    description: string
  ) => {
    notification[type]({
      message: title,
      description,
      placement: "topRight",
    });
  };

  // Lấy dữ liệu bài viết khi component được gắn vào DOM
  useEffect(() => {
    if (!id) {
      showNotification("error", "Lỗi", "ID bài viết bị thiếu.");
      return;
    }
  
    const fetchPost = async () => {
      try {
        const post = await getPostById(id);
        if (post) {
          setImages(post.img || []);
          setExistingImages(post.img || []); // Đồng bộ trạng thái ảnh cũ
          form.setFieldsValue({
            title: post.title,
            descriptions: post.descriptions,
            content: post.content,
          });
        } else {
          showNotification("error", "Lỗi", "Không tìm thấy bài viết.");
        }
      } catch (error) {
        console.error("Lỗi khi lấy bài viết:", error);
        showNotification(
          "error",
          "Lỗi",
          "Không thể lấy chi tiết bài viết, vui lòng thử lại!"
        );
      }
    };
  
    fetchPost();
  }, [id, form]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const handleRemoveImage = (url: string) => {
    setExistingImages((prev) => prev.filter((img) => img !== url));
  };
  

  const uploadImages = async (files: File[]): Promise<string[]> => {
    const urls: string[] = [];
    for (const file of files) {
      const formData = new FormData();
      formData.append("images", file);

      try {
        const response = await upload(formData);
        const imageUrl = response.payload[0].url;
        urls.push(imageUrl);
      } catch (error) {
        console.error("Error uploading image:", error);
        showNotification(
          "error",
          "Lỗi tải ảnh",
          "Không thể tải ảnh lên, vui lòng thử lại!"
        );
      }
    }
    return urls;
  };

  const onFinish = async (values: any) => {
    if (!id) {
      showNotification("error", "Lỗi", "ID bài viết bị thiếu.");
      return;
    }
  
    try {
      // Upload ảnh mới
      const newImageUrls = await uploadImages(files);
  
      // Kết hợp ảnh cũ và ảnh mới
      const updatedImages = [...existingImages, ...newImageUrls];
  
      // Payload để gửi API
      const payload = {
        ...values,
        img: updatedImages, // Gửi cả ảnh cũ và ảnh mới
      };
  
      const updatedPostData = await updatePost(id, payload);
  
      if (updatedPostData) {
        showNotification("success", "Thành công", "Bài viết đã được cập nhật!");
        navigate("/admin/tintuc");
      } else {
        showNotification("error", "Lỗi", "Không thể cập nhật bài viết, vui lòng thử lại!");
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật bài viết:", error);
      showNotification("error", "Lỗi", "Không thể cập nhật bài viết, vui lòng thử lại!");
    }
  };
  
  

  // const handleUploadChange = ({ fileList: newFileList }: any) => {
  //   setFiles(newFileList);
  // };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-md rounded-md space-y-6 font-[sans-serif]">
      <h2 className="text-xl font-semibold text-center text-gray-800 mb-4">Cập nhật Tin tức</h2>
      <Form
        form={form}
        onFinish={onFinish}
        layout="vertical"
        className="space-y-4"
      >
        {/* Tiêu đề */}
        <Form.Item
          label="Tiêu đề"
          name="title"
          rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}>
          <Input placeholder="Nhập tiêu đề tin tức" className="rounded" />
        </Form.Item>

        {/* Mô tả */}
        <Form.Item
          label="Mô tả"
          name="descriptions"
          rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}>
          <Input.TextArea rows={4} placeholder="Nhập mô tả" className="rounded" />
        </Form.Item>

        {/* Nội dung */}
        <Form.Item
          label="Nội dung"
          name="content"
          rules={[{ required: true, message: "Vui lòng nhập nội dung" }]}>
          <Input.TextArea rows={6} placeholder="Nhập nội dung" className="rounded" />
        </Form.Item>

        {/* Hình ảnh */}
        <div>
          
          
          <div>
          <label className="mt-10 mb-2 text-sm text-black block">Ảnh hiện tại:</label>
          <div className="grid grid-cols-3 gap-4">
            {existingImages.map((url) => (
              <div key={url} className="relative">
                <img
                  src={url}
                  alt="Product"
                  className="w-full h-auto rounded-md border border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(url)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Upload New Images */}
        <div>
          <label className="mt-10 mb-2 text-sm text-black block">Thêm ảnh mới:</label>
          <Input type="file" multiple onChange={handleFileChange} />
        </div>

        </div>

        <Form.Item>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-md"
          >
            Cập nhật
          </button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default UpdateNews;
