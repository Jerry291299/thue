import React, { useEffect, useState } from "react";
import { Form, Input, Select, notification } from "antd";
import { addProduct } from "../../../service/products";
import { Icategory } from "../../../interface/category";
import { getAllCategories } from "../../../service/category";
import { upload } from "../../../service/upload";
import LoadingComponent from "../../Loading";
import { useNavigate } from "react-router-dom";

// Define types matching your new schema
type SubVariant = {
  specification: string; // e.g., "Storage"
  value: string; // e.g., "128GB"
  additionalPrice: number;
  quantity: number;
};

type Variant = {
  size: string;
  color: string;
  basePrice: number;
  discount?: number;
  quantity: number;
  subVariants: SubVariant[];
};

const Add = () => {
  const [category, setCategory] = useState<Icategory[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const [variants, setVariants] = useState<Variant[]>([
    {
      size: "",
      color: "",
      basePrice: 0,
      discount: undefined,
      quantity: 0,
      subVariants: [{ specification: "", value: "", additionalPrice: 0, quantity: 0 }],
    },
  ]);
  const navigate = useNavigate();

  const showNotification = (type: "success" | "error", title: string, description: string) => {
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
        showNotification("error", "Lỗi", "Không thể tải danh mục, vui lòng thử lại!");
      }
    };
    fetchCategories();

    const initialProductCode = generateProductCode();
    form.setFieldsValue({ masp: initialProductCode });
  }, [form]);

  const generateProductCode = () => {
    const prefix = "SP";
    const digits = new Set();
    let suffix = "";
    while (suffix.length < 5) {
      const digit = Math.floor(Math.random() * 10).toString();
      if (!digits.has(digit)) {
        digits.add(digit);
        suffix += digit;
      }
    }
    return prefix + suffix;
  };

  const activeCategories = category.filter((cat) => cat.status === "active");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...newFiles]);
    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const uploadImages = async (files: File[]): Promise<string[]> => {
    const urls: string[] = [];
    for (const file of files) {
      const formData = new FormData();
      formData.append("images", file);
      try {
        const response = await upload(formData);
        urls.push(response.payload[0].url);
      } catch (error) {
        console.error("Error uploading image:", error);
        showNotification("error", "Lỗi tải ảnh", "Không thể tải ảnh lên, vui lòng thử lại!");
      }
    }
    return urls;
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const imageUrls = await uploadImages(files);

      // Validate variants and subVariants
      const validVariants = variants.map((variant) => ({
        ...variant,
        subVariants: variant.subVariants.filter(
          (sv) => sv.specification && sv.value && sv.quantity > 0 && sv.additionalPrice >= 0
        ),
      })).filter(
        (variant) => variant.size && variant.color && variant.basePrice > 0 && variant.quantity > 0
      );

      if (validVariants.length === 0 || validVariants.some((v) => v.subVariants.length === 0)) {
        showNotification("error", "Lỗi", "Phải có ít nhất một biến thể và sub-variant hợp lệ!");
        setLoading(false);
        return;
      }

      const payload = {
        ...values,
        moTa: values.moTa,
        brand: values.brand,
        img: imageUrls,
        categoryID: values.category,
        status: true,
        variants: validVariants,
      };

      const response = await addProduct(payload);

      if (response?.status >= 200 && response?.status < 300) {
        showNotification("success", "Thành công", "Thêm sản phẩm thành công!");
        navigate("/admin/dashboard");
      } else {
        showNotification("error", "Lỗi", "Không thể thêm sản phẩm, vui lòng thử lại!");
      }

      form.resetFields();
      setFiles([]);
      setPreviews([]);
      setVariants([{ size: "", color: "", basePrice: 0, discount: undefined, quantity: 0, subVariants: [{ specification: "", value: "", additionalPrice: 0, quantity: 0 }] }]);
    } catch (error) {
      console.error("Error adding product:", error);
      showNotification("error", "Lỗi", "Không thể thêm sản phẩm, vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  const removeImage = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleVariantChange = (index: number, field: keyof Variant, value: string | number | undefined) => {
    const updatedVariants = [...variants];
    if (field === "size" || field === "color") {
      updatedVariants[index][field] = value as string;
    } else if (field === "basePrice" || field === "quantity") {
      updatedVariants[index][field] = value as number;
    } else if (field === "discount") {
      updatedVariants[index][field] = value as number | undefined;
    }
    setVariants(updatedVariants);
  };

  const handleSubVariantChange = (
    variantIndex: number,
    subIndex: number,
    field: keyof SubVariant,
    value: string | number
  ) => {
    const updatedVariants = [...variants];
    const subVariants = [...updatedVariants[variantIndex].subVariants];
    if (field === "specification" || field === "value") {
      subVariants[subIndex][field] = value as string;
    } else if (field === "additionalPrice" || field === "quantity") {
      subVariants[subIndex][field] = value as number;
    }
    updatedVariants[variantIndex].subVariants = subVariants;
    setVariants(updatedVariants);
  };

  const addVariant = () => {
    setVariants((prev) => [
      ...prev,
      { size: "", color: "", basePrice: 0, discount: undefined, quantity: 0, subVariants: [{ specification: "", value: "", additionalPrice: 0, quantity: 0 }] },
    ]);
  };

  const removeVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const addSubVariant = (variantIndex: number) => {
    const updatedVariants = [...variants];
    updatedVariants[variantIndex].subVariants.push({ specification: "", value: "", additionalPrice: 0, quantity: 0 });
    setVariants(updatedVariants);
  };

  const removeSubVariant = (variantIndex: number, subIndex: number) => {
    const updatedVariants = [...variants];
    updatedVariants[variantIndex].subVariants = updatedVariants[variantIndex].subVariants.filter((_, i) => i !== subIndex);
    setVariants(updatedVariants);
  };

  return (
    <>
      {loading && <LoadingComponent />}
      <div className="max-w-6xl mx-auto p-8 bg-white shadow-xl rounded-xl">
        <Form form={form} onFinish={onFinish} layout="vertical">
          <div className="flex flex-wrap md:flex-nowrap gap-8">
            {/* Left Column */}
            <div className="flex-1 space-y-6">
              <div>
                <label className="text-lg font-semibold text-gray-800">Mã sản phẩm</label>
                <Form.Item name="masp" rules={[{ required: true, message: "Bắt buộc nhập mã sản phẩm!" }]}>
                  <Input placeholder="Nhập mã sản phẩm" className="text-gray-700 p-4 rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-blue-600 outline-none" />
                </Form.Item>
              </div>
              <div>
                <label className="text-lg font-semibold text-gray-800">Tên sản phẩm</label>
                <Form.Item name="name" rules={[{ required: true, message: "Bắt buộc nhập tên sản phẩm!" }]}>
                  <Input placeholder="Nhập tên sản phẩm" className="text-gray-700 p-4 rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-blue-600 outline-none" />
                </Form.Item>
              </div>
              <div>
                <label className="text-lg font-semibold text-gray-800">Mô tả sản phẩm</label>
                <Form.Item name="moTa" rules={[{ required: true, message: "Bắt buộc nhập mô tả sản phẩm!" }]}>
                  <Input.TextArea placeholder="Nhập mô tả sản phẩm" className="text-gray-700 p-4 rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-blue-600 outline-none" rows={5} />
                </Form.Item>
              </div>
            </div>

            {/* Right Column */}
            <div className="flex-1 space-y-6">
              <div>
                <label className="text-lg font-semibold text-gray-800">Ảnh sản phẩm</label>
                <div className="flex flex-wrap gap-4">
                  {previews.map((preview, index) => (
                    <div key={index} className="relative w-28 h-28">
                      <img src={preview} alt={`Preview ${index}`} className="w-full h-full object-cover rounded-lg shadow-md" />
                      <button onClick={() => removeImage(index)} className="absolute top-0 right-0 bg-red-600 text-white text-xs p-2 rounded-full shadow-md">x</button>
                    </div>
                  ))}
                </div>
                <Input type="file" multiple onChange={handleFileChange} className="p-4 rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-blue-600 outline-none" />
              </div>
              <div>
                <label className="text-lg font-semibold text-gray-800">Danh mục</label>
                <Form.Item name="category" rules={[{ required: true, message: "Vui lòng chọn danh mục!" }]}>
                  <Select className="w-full rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-blue-600" placeholder="Chọn danh mục">
                    {activeCategories.map((categoryID: Icategory) => (
                      <Select.Option key={categoryID._id} value={categoryID._id}>{categoryID.name}</Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>
              <div>
                <label className="text-lg font-semibold text-gray-800">Tên thương hiệu</label>
                <Form.Item name="brand" rules={[{ required: true, message: "Bắt buộc nhập tên thương hiệu!" }]}>
                  <Input placeholder="Nhập tên thương hiệu" className="text-gray-700 p-4 rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-blue-600 outline-none" />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* Variants Section */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-800">Biến thể sản phẩm</h3>
            {variants.map((variant, variantIndex) => (
              <div key={variantIndex} className="mb-6 border p-4 rounded-lg">
                <div className="grid grid-cols-6 gap-4 mb-4 items-center">
                  <Form.Item name={`size-${variantIndex}`} rules={[{ required: true, message: "Vui lòng nhập kích thước!" }]}>
                    <Input
                      placeholder="Kích thước"
                      value={variant.size}
                      onChange={(e) => handleVariantChange(variantIndex, "size", e.target.value)}
                      className="p-3 h-12 rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-blue-600"
                    />
                  </Form.Item>
                  <Select
                    placeholder="Chọn màu"
                    value={variant.color}
                    onChange={(value) => handleVariantChange(variantIndex, "color", value)}
                    className="w-full mb-[24px] h-12 rounded-lg border-2 border-gray-300"
                    options={[
                      { value: "Red", label: "🔴 Đỏ" },
                      { value: "Blue", label: "🔵 Xanh" },
                      { value: "Green", label: "🟢 Lục" },
                      { value: "Black", label: "⚫ Đen" },
                      { value: "White", label: "⚪ Trắng" },
                    ]}
                  />
                  <Form.Item name={`basePrice-${variantIndex}`} rules={[{ required: true, message: "Vui lòng nhập giá!" }]}>
                    <Input
                      type="number"
                      placeholder="Giá cơ bản"
                      value={variant.basePrice}
                      onChange={(e) => handleVariantChange(variantIndex, "basePrice", e.target.value === "" ? 0 : Number(e.target.value))}
                      className="p-3 h-12 rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-blue-600"
                    />
                  </Form.Item>
                  <Form.Item name={`discount-${variantIndex}`}>
                    <Input
                      type="number"
                      placeholder="Giảm giá (VND)"
                      value={variant.discount || 0}
                      onChange={(e) => handleVariantChange(variantIndex, "discount", e.target.value === "" ? 0 : Number(e.target.value))}
                      className="p-3 h-12 rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-blue-600"
                    />
                  </Form.Item>
                  <Form.Item name={`quantity-${variantIndex}`} rules={[{ required: true, message: "Vui lòng nhập số lượng!" }]}>
                    <Input
                      type="number"
                      placeholder="Tổng số lượng"
                      value={variant.quantity}
                      onChange={(e) => handleVariantChange(variantIndex, "quantity", e.target.value === "" ? 0 : Number(e.target.value))}
                      className="p-3 h-12 rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-blue-600"
                    />
                  </Form.Item>
                  <button type="button" onClick={() => removeVariant(variantIndex)} className="bg-red-600 text-white h-12 rounded-lg px-4">Xóa</button>
                </div>

                {/* Sub-Variants */}
                <div className="ml-4">
                  <h4 className="text-md font-medium text-gray-700">Sub-Variants</h4>
                  {variant.subVariants.map((subVariant, subIndex) => (
                    <div key={subIndex} className="grid grid-cols-5 gap-4 mb-2 items-center">
                      <Form.Item name={`specification-${variantIndex}-${subIndex}`} rules={[{ required: true, message: "Vui lòng nhập thông số!" }]}>
                        <Input
                          placeholder="Thông số (e.g., Storage)"
                          value={subVariant.specification}
                          onChange={(e) => handleSubVariantChange(variantIndex, subIndex, "specification", e.target.value)}
                          className="p-3 h-12 rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-blue-600"
                        />
                      </Form.Item>
                      <Form.Item name={`value-${variantIndex}-${subIndex}`} rules={[{ required: true, message: "Vui lòng nhập giá trị!" }]}>
                        <Input
                          placeholder="Giá trị (e.g., 128GB)"
                          value={subVariant.value}
                          onChange={(e) => handleSubVariantChange(variantIndex, subIndex, "value", e.target.value)}
                          className="p-3 h-12 rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-blue-600"
                        />
                      </Form.Item>
                      <Form.Item name={`additionalPrice-${variantIndex}-${subIndex}`} rules={[{ required: true, message: "Vui lòng nhập giá thêm!" }]}>
                        <Input
                          type="number"
                          placeholder="Giá thêm (VND)"
                          value={subVariant.additionalPrice}
                          onChange={(e) => handleSubVariantChange(variantIndex, subIndex, "additionalPrice", e.target.value === "" ? 0 : Number(e.target.value))}
                          className="p-3 h-12 rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-blue-600"
                        />
                      </Form.Item>
                      <Form.Item name={`subQuantity-${variantIndex}-${subIndex}`} rules={[{ required: true, message: "Vui lòng nhập số lượng!" }]}>
                        <Input
                          type="number"
                          placeholder="Số lượng"
                          value={subVariant.quantity}
                          onChange={(e) => handleSubVariantChange(variantIndex, subIndex, "quantity", e.target.value === "" ? 0 : Number(e.target.value))}
                          className="p-3 h-12 rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-blue-600"
                        />
                      </Form.Item>
                      <button type="button" onClick={() => removeSubVariant(variantIndex, subIndex)} className="bg-red-600 text-white h-12 rounded-lg px-4">Xóa</button>
                    </div>
                  ))}
                  <button type="button" onClick={() => addSubVariant(variantIndex)} className="bg-green-600 text-white rounded-lg px-4 py-2 mt-2">Thêm Sub-Variant</button>
                </div>
              </div>
            ))}
            <button type="button" onClick={addVariant} className="bg-blue-600 text-white rounded-lg px-4 py-2 mt-4">Thêm biến thể</button>
          </div>

          {/* Submit Button */}
          <div className="mt-8 text-center">
            <button type="submit" className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 transition duration-300 ease-in-out">
              Thêm mới sản phẩm
            </button>
          </div>
        </Form>
      </div>
    </>
  );
};

export default Add;