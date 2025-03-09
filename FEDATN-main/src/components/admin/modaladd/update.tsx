import React, { useEffect, useState } from "react";
import { Form, Input, Select, notification, Button, Space } from "antd";
import { getProductByID, updateProduct } from "../../../service/products";
import { Icategory } from "../../../interface/category";
import { getAllCategories } from "../../../service/category";
import { upload } from "../../../service/upload";
import LoadingComponent from "../../Loading";
import { getAllMaterials } from "../../../service/material";
import { Iproduct, IVariant } from "../../../interface/products";
import { useNavigate, useParams } from "react-router-dom";

const ProductUpdate = () => {
  const { id } = useParams<{ id: string }>();
  const [category, setCategory] = useState<Icategory[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const [product, setProduct] = useState<Iproduct | null>(null);
  const [variants, setVariants] = useState<IVariant[]>([]); // State for variants
  const navigate = useNavigate();
  const [totalPrice, setTotalPrice] = useState<number>(0);
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

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getAllCategories();
        setCategory(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
        showNotification(
          "error",
          "Lỗi",
          "Không thể tải danh mục, vui lòng thử lại!"
        );
      }
    };

    

    const fetchProduct = async () => {
      try {
        const productData = await getProductByID(id);
        setProduct(productData);
        setExistingImages(productData.img || []);
        setVariants(productData.variants || []); // Set existing variants
        form.setFieldsValue({
          masp: productData.masp,
          name: productData.name,
          soLuong: productData.soLuong,
          price: productData.price,
          moTa: productData.moTa,
          category: productData.category._id,
        });
      } catch (error) {
        console.error("Error fetching product:", error);
        showNotification(
          "error",
          "Lỗi",
          "Không thể tải sản phẩm, vui lòng thử lại!"
        );
      }
    };

    fetchCategories();
    fetchProduct();
  }, [id]);

  const activeCategories = category.filter((cat) => cat.status === "active");

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

  const addVariant = () => {
    setVariants((prev) => [...prev, { size: "",color: "", quantity: 0, basePrice: 0 }]);
  };

  const removeVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };
  const calculateTotalPrice = () => {
    const total = variants.reduce((acc, variant) => {
      const discountAmount = variant.discount || 0;
      const effectivePrice = variant.basePrice - discountAmount;
      return acc + (effectivePrice > 0 ? effectivePrice : 0) * variant.quantity;
    }, 0);
    setTotalPrice(total);
  };

  const handleVariantChange = (
    index: number,
    key: keyof IVariant,
    value: string | number | undefined // Chấp nhận các loại có thể
  ) => {
    const newVariants: IVariant[] = [...variants];

    // Cập nhật biến thể
    if (key === "size" && typeof value === "string") {
      newVariants[index][key] = value as IVariant["size"];

      // Kiểm tra kích thước trùng lặp
      const sizes = newVariants.map((variant) => variant.size);
      if (sizes.filter((size) => size === value).length > 1) {
        showNotification(
          "error",
          "Lỗi",
          "Kích thước này đã tồn tại trong các biến thể khác!"
        );
        return; //Thoát nếu trùng lặp
      }
    } else if (key === "quantity" && typeof value === "number") {
      newVariants[index][key] = value as IVariant["quantity"];
    } else if (key === "basePrice" && typeof value === "number") {
      newVariants[index][key] = value as IVariant["basePrice"];
    } else if (
      key === "discount" &&
      (typeof value === "number" || value === undefined)
    ) {
      newVariants[index][key] = value as IVariant["discount"];
    }

    setVariants(newVariants);
    calculateTotalPrice(); // Tính tổng bất cứ khi nào một biến thể thay đổi
  };

  const onFinish = async (values: any) => {
    setLoading(true);

    // Check for duplicate sizes before proceeding
    const sizes = variants.map((variant) => variant.size);
    const hasDuplicates = sizes.length !== new Set(sizes).size;
    if (hasDuplicates) {
      showNotification(
        "error",
        "Lỗi",
        "Có kích thước trùng lặp trong các biến thể!"
      );
      setLoading(false);
      return; // Exit if duplicate
    }

    try {
      const newImageUrls = await uploadImages(files);
      const updatedImages = [...existingImages, ...newImageUrls];

      const payload = {
        ...values,
        moTa: values.moTa,
        soLuong: values.soLuong,
        img: updatedImages,
        categoryID: values.category,
        materialID: values.material,
        status: true,
        variants,
      };

      await updateProduct(id, payload);
      showNotification(
        "success",
        "Thành công",
        "Cập nhật sản phẩm thành công!"
      );
      setFiles([]);
      navigate("/admin/dashboard", { state: { shouldRefetch: true } });
    } catch (error) {
      console.error("Error updating product:", error);
      showNotification(
        "error",
        "Lỗi",
        "Không thể cập nhật sản phẩm, vui lòng thử lại!"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading || !product) {
    return <LoadingComponent />;
  }
  return (
    <>
      {loading && <LoadingComponent />}
      <div className="max-w-6xl mx-auto p-8 bg-white shadow-xl rounded-xl">
        <Form form={form} onFinish={onFinish} layout="vertical">
          <div className="flex flex-wrap md:flex-nowrap gap-8">
            {/* Cột Bên Trái */}
            <div className="flex-1 space-y-6">

              {/* Mã sản phẩm */}
              <div>
                <label className="text-lg font-semibold text-gray-800">
                  Mã sản phẩm
                </label>
                <Form.Item
                  name="masp"
                  rules={[
                    { required: true, message: "Bắt buộc nhập tên sản phẩm!" },
                  ]}
                >
                  <Input
                    placeholder="Nhập mã sản phẩm"
                    className="text-gray-700 p-4 rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </Form.Item>
              </div>

              {/* Tên sản phẩm */}
              <div>
                <label className="text-lg font-semibold text-gray-800">
                  Tên sản phẩm
                </label>
                <Form.Item
                  name="name"
                  rules={[
                    { required: true, message: "Bắt buộc nhập tên sản phẩm!" },
                  ]}
                >
                  <Input
                    placeholder="Nhập tên sản phẩm"
                    className="text-gray-700 p-4 rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </Form.Item>
              </div>

              {/* Mô tả sản phẩm */}
              <div>
                <label className="text-lg font-semibold text-gray-800">
                  Mô tả sản phẩm
                </label>
                <Form.Item
                  name="moTa"
                  rules={[
                    {
                      required: true,
                      message: "Bắt buộc nhập mô tả sản phẩm!",
                    },
                  ]}
                >
                  <Input.TextArea
                    placeholder="Nhập mô tả sản phẩm"
                    className="text-gray-700 p-4 rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-blue-600 outline-none"
                    rows={5}
                  />
                </Form.Item>
              </div>
            </div>

            {/* Cột Bên Phải */}
            <div className="flex-1 space-y-6">
              {/* Ảnh sản phẩm */}
              <div>
                <label className="text-lg font-semibold text-gray-800">
                  Ảnh sản phẩm
                </label>
                <div className="flex flex-wrap gap-4">
                  {existingImages.map((preview, index) => (
                    <div key={index} className="relative w-28 h-28">
                      <img
                        src={preview}
                        alt={`Preview ${index}`}
                        className="w-full h-full object-cover rounded-lg shadow-md"
                      />
                      <button
                        onClick={() => handleRemoveImage(preview)} // Use the url from the map
                        className="absolute top-0 right-0 bg-red-600 text-white text-xs p-2 rounded-full shadow-md"
                      >
                        x
                      </button>
                    </div>
                  ))}
                </div>
                <Input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="p-4 rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>

              {/* Danh mục */}
              <div>
                <label className="text-lg font-semibold text-gray-800">
                  Danh mục
                </label>
                <Form.Item
                  name="category"
                  rules={[
                    { required: true, message: "Vui lòng chọn danh mục!" },
                  ]}
                >
                  <Select
                    className="w-full rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-blue-600"
                    placeholder="Chọn danh mục"
                  >
                    {activeCategories.map((categoryID: Icategory) => (
                      <Select.Option
                        key={categoryID._id}
                        value={categoryID._id}
                      >
                        {categoryID.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>

              {/* Chất liệu */}
              
            </div>
          </div>

          {/* Biến thể sản phẩm */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-800">
              Biến thể sản phẩm
            </h3>
            {variants.map((variant, index) => (
              <div key={index} className="flex gap-4 mb-4">
                <Input
                  placeholder="Kích thước"
                  value={variant.size}
                  onChange={(e) =>
                    handleVariantChange(index, "size", e.target.value)
                  }
                  className="w-1/4 p-4 rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-blue-600"
                />
                <Input
                  type="number"
                  placeholder="Số lượng"
                  value={variant.quantity}
                  onChange={(e) =>
                    handleVariantChange(
                      index,
                      "quantity",
                      Number(e.target.value)
                    )
                  }
                  className="w-1/4 p-4 rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-blue-600"
                />
                <Input
                  type="number"
                  placeholder="Giá"
                  value={variant.basePrice}
                  onChange={(e) =>
                    handleVariantChange(index, "basePrice", Number(e.target.value))
                  }
                  className="w-1/4 p-4 rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-blue-600"
                />
                <Input
                  type="number"
                  placeholder="Giảm giá (nếu có)"
                  value={variant.discount}
                  onChange={(e) =>
                    handleVariantChange(
                      index,
                      "discount",
                      Number(e.target.value)
                    )
                  }
                  className="w-1/4 p-4 rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-blue-600"
                />
                <button
                  type="button"
                  onClick={() => removeVariant(index)}
                  className="bg-red-600 text-white rounded-lg px-4"
                >
                  Xóa
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addVariant}
              className="bg-blue-600 text-white rounded-lg px-4"
            >
              Thêm biến thể
            </button>
          </div>

          {/* Nút Submit */}
          <div className="mt-8 text-center">
            <button
              type="submit"
              className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 transition duration-300 ease-in-out"
            >
             Cập nhật sản phẩm
            </button>
          </div>
        </Form>
      </div>
    </>
  );
};

export default ProductUpdate;
