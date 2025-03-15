import React, { useEffect, useState } from "react";
import { Form, Input, Select, notification, Button } from "antd";
import { getProductByID, updateProduct } from "../../../service/products";
import { Icategory } from "../../../interface/category";
import { getAllCategories } from "../../../service/category";
import { upload } from "../../../service/upload";
import LoadingComponent from "../../Loading";
import { useNavigate, useParams } from "react-router-dom";
import { IProductLite, ISubVariant, IVariant } from "../../../interface/products";

const ProductUpdate = () => {
  const { id } = useParams<{ id: string }>();
  const [category, setCategory] = useState<Icategory[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const [product, setProduct] = useState<IProductLite | null>(null);
  const [variants, setVariants] = useState<IVariant[]>([]);
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

    const fetchProduct = async () => {
      try {
        const productData = await getProductByID(id);
        setProduct(productData);
        setExistingImages(productData.img || []);
        setVariants(productData.variants || []);
        form.setFieldsValue({
          masp: productData.masp,
          name: productData.name,
          moTa: productData.moTa,
          brand: productData.brand,
          category: typeof productData.category === "string" ? productData.category : productData.category._id,
        });
        console.log("Product data:", productData); // Debug log
      } catch (error) {
        console.error("Error fetching product:", error);
        showNotification("error", "Lỗi", "Không thể tải sản phẩm, vui lòng thử lại!");
      }
    };

    fetchCategories();
    fetchProduct();
  }, [id, form]);

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
        urls.push(response.payload[0].url);
      } catch (error) {
        console.error("Error uploading image:", error);
        showNotification("error", "Lỗi tải ảnh", "Không thể tải ảnh lên, vui lòng thử lại!");
      }
    }
    return urls;
  };

  const addVariant = () => {
    setVariants((prev) => [
      ...prev,
      { color: "", basePrice: 0, discount: undefined, subVariants: [{ specification: "", value: "", additionalPrice: 0, quantity: 0 }] },
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

  const handleVariantChange = (index: number, key: keyof IVariant, value: string | number | undefined) => {
    const newVariants = [...variants];
    if (key === "color") {
      newVariants[index][key] = value as string;
      const colors = newVariants.map((v) => v.color);
      if (colors.filter((c) => c === value).length > 1) {
        showNotification("error", "Lỗi", "Màu sắc này đã tồn tại trong các biến thể khác!");
        return;
      }
    } else if (key === "basePrice") {
      newVariants[index][key] = value === "" || value === undefined ? 0 : Number(value);
    } else if (key === "discount") {
      newVariants[index][key] = value === "" || value === undefined ? undefined : Number(value);
    }
    setVariants(newVariants);
  };

  const handleSubVariantChange = (
    variantIndex: number,
    subIndex: number,
    key: keyof ISubVariant,
    value: string | number
  ) => {
    const updatedVariants = [...variants];
    const subVariants = [...updatedVariants[variantIndex].subVariants];
    if (key === "specification" || key === "value") {
      subVariants[subIndex][key] = value as string;
    } else if (key === "additionalPrice" || key === "quantity") {
      subVariants[subIndex][key] = value === "" || value === undefined ? 0 : Number(value);
    }
    updatedVariants[variantIndex].subVariants = subVariants;
    setVariants(updatedVariants);
  };

  const onFinish = async (values: any) => {
    setLoading(true);

    // Check for duplicate colors
    const colors = variants.map((variant) => variant.color);
    const hasDuplicates = colors.length !== new Set(colors).size;
    if (hasDuplicates) {
      showNotification("error", "Lỗi", "Có màu sắc trùng lặp trong các biến thể!");
      setLoading(false);
      return;
    }

    // Validate subVariants
    for (const variant of variants) {
      if (variant.subVariants.length === 0) {
        showNotification("error", "Lỗi", `Biến thể ${variant.color} phải có ít nhất một sub-variant!`);
        setLoading(false);
        return;
      }
      const subVariantKeys = variant.subVariants.map((sv) => `${sv.specification}-${sv.value}`);
      if (subVariantKeys.length !== new Set(subVariantKeys).size) {
        showNotification("error", "Lỗi", `Có sub-variant trùng lặp trong biến thể ${variant.color}!`);
        setLoading(false);
        return;
      }
    }

    try {
      const newImageUrls = await uploadImages(files);
      const updatedImages = [...existingImages, ...newImageUrls];

      const selectedCategory = category.find((cat) => cat._id === values.category);
      if (!selectedCategory) {
        throw new Error("Selected category not found");
      }

      const payload: IProductLite = {
        _id: id!,
        masp: values.masp,
        name: values.name,
        img: updatedImages,
        moTa: values.moTa,
        brand: values.brand,
        category: selectedCategory, // Use the full Icategory object
        status: true,
        variants,
        discountCode: product?.discountCode,
        createdAt: product?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      console.log("Payload being sent:", JSON.stringify(payload, null, 2));

      await updateProduct(id, payload);
      showNotification("success", "Thành công", "Cập nhật sản phẩm thành công!");
      setFiles([]);
      navigate("/admin/dashboard", { state: { shouldRefetch: true } });
    } catch (error) {
      console.error("Error updating product:", error);
      showNotification("error", "Lỗi", "Không thể cập nhật sản phẩm, vui lòng thử lại!");
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
                  {existingImages.map((preview, index) => (
                    <div key={index} className="relative w-28 h-28">
                      <img src={preview} alt={`Preview ${index}`} className="w-full h-full object-cover rounded-lg shadow-md" />
                      <button onClick={() => handleRemoveImage(preview)} className="absolute top-0 right-0 bg-red-600 text-white text-xs p-2 rounded-full shadow-md">x</button>
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
                <label className="text-lg font-semibold text-gray-800">Thương hiệu</label>
                <Form.Item name="brand" rules={[{ required: true, message: "Bắt buộc nhập thương hiệu!" }]}>
                  <Input placeholder="Nhập thương hiệu" className="text-gray-700 p-4 rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-blue-600 outline-none" />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* Variants Section */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-800">Biến thể sản phẩm</h3>
            {variants.map((variant, variantIndex) => (
              <div key={variantIndex} className="mb-6 border p-4 rounded-lg">
                <div className="grid grid-cols-4 gap-4 mb-4 items-center">
                  <Select
                    placeholder="Chọn màu"
                    value={variant.color}
                    onChange={(value) => handleVariantChange(variantIndex, "color", value)}
                    className="w-full h-12 rounded-lg border-2 border-gray-300"
                    options={[
                      { value: "Red", label: "🔴 Đỏ" },
                      { value: "Blue", label: "🔵 Xanh" },
                      { value: "Green", label: "🟢 Lục" },
                      { value: "Black", label: "⚫ Đen" },
                      { value: "White", label: "⚪ Trắng" },
                    ]}
                  />
                  <Input
                    type="number"
                    placeholder="Giá cơ bản"
                    value={variant.basePrice}
                    onChange={(e) => handleVariantChange(variantIndex, "basePrice", e.target.value)}
                    className="p-3 h-12 rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-blue-600"
                  />
                  <Input
                    type="number"
                    placeholder="Giảm giá (VND)"
                    value={variant.discount}
                    onChange={(e) => handleVariantChange(variantIndex, "discount", e.target.value)}
                    className="p-3 h-12 rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-blue-600"
                  />
                  <Button type="default" danger onClick={() => removeVariant(variantIndex)}>
                    Xóa biến thể
                  </Button>
                </div>

                {/* Sub-Variants */}
                <div className="ml-4">
                  <h4 className="text-md font-medium text-gray-700">Biến thể con:</h4>
                  {variant.subVariants.map((subVariant, subIndex) => (
                    <div key={subIndex} className="grid grid-cols-5 gap-4 mb-2 items-center">
                      <Input
                        placeholder="Thông số (e.g., Storage)"
                        value={subVariant.specification}
                        onChange={(e) => handleSubVariantChange(variantIndex, subIndex, "specification", e.target.value)}
                        className="p-3 h-12 rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-blue-600"
                      />
                      <Input
                        placeholder="Giá trị (e.g., 128GB)"
                        value={subVariant.value}
                        onChange={(e) => handleSubVariantChange(variantIndex, subIndex, "value", e.target.value)}
                        className="p-3 h-12 rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-blue-600"
                      />
                      <Input
                        type="number"
                        placeholder="Giá thêm (VND)"
                        value={subVariant.additionalPrice}
                        onChange={(e) => handleSubVariantChange(variantIndex, subIndex, "additionalPrice", e.target.value)}
                        className="p-3 h-12 rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-blue-600"
                      />
                      <Input
                        type="number"
                        placeholder="Số lượng"
                        value={subVariant.quantity}
                        onChange={(e) => handleSubVariantChange(variantIndex, subIndex, "quantity", e.target.value)}
                        className="p-3 h-12 rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-blue-600"
                      />
                      <Button type="default" danger onClick={() => removeSubVariant(variantIndex, subIndex)}>
                        Xóa
                      </Button>
                    </div>
                  ))}
                  <Button type="dashed" onClick={() => addSubVariant(variantIndex)} className="mt-2">
                    Thêm Sub-Variant
                  </Button>
                </div>
              </div>
            ))}
            <Button type="dashed" onClick={addVariant} className="mt-4">
              Thêm biến thể
            </Button>
          </div>

          {/* Submit Button */}
          <div className="mt-8 text-center">
            <Button type="primary" htmlType="submit" className="w-full h-12">
              Cập nhật sản phẩm
            </Button>
          </div>
        </Form>
      </div>
    </>
  );
};

export default ProductUpdate;