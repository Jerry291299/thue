import React, { useEffect, useState } from "react";
import { notification, Button } from "antd";
import { getProductByID } from "../../../service/products";
import { Iproduct } from "../../../interface/products";
import { useParams, Link } from "react-router-dom";
import LoadingComponent from "../../Loading";
import { getCategoryByID } from "../../../service/category";

const ProductView = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Iproduct | null>(null);
  const [categoryName, setCategoryName] = useState<string>("Không xác định");
  const [loading, setLoading] = useState<boolean>(true);

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
    const fetchProduct = async () => {
      try {
        const productData = await getProductByID(id);
        setProduct(productData);
        console.log("Product data:", productData);

        if (productData.category && typeof productData.category === "string") {
          try {
            const categoryData = await getCategoryByID(productData.category);
            setCategoryName(categoryData.name || "Không xác định");
          } catch (error) {
            console.error("Error fetching category:", error);
            setCategoryName("Không xác định");
          }
        } else if (productData.category && (productData.category as any).name) {
          setCategoryName((productData.category as any).name);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        showNotification(
          "error",
          "Lỗi",
          "Không thể tải sản phẩm, vui lòng thử lại!"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return <LoadingComponent />;
  }

  if (!product) {
    return <div className="text-center text-red-500 text-lg mt-10">Không tìm thấy sản phẩm.</div>;
  }

  const totalPrice = (product.variants || []).reduce((total, variant) => {
    const variantTotal = variant.subVariants.reduce((subTotal, subVariant) => {
      const priceAfterDiscount = variant.basePrice + subVariant.additionalPrice - (variant.discount || 0);
      return subTotal + priceAfterDiscount * subVariant.quantity;
    }, 0);
    return total + variantTotal;
  }, 0);

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 rounded-lg shadow-lg">
      {/* Header */}
      <h2 className="text-3xl font-bold text-gray-800 mb-4">
        <span className="text-gray-600">Tên sản phẩm:</span> {product.name}
      </h2>
      <p className="text-lg text-gray-700 mb-6">
        <span className="font-semibold">Danh mục:</span> {categoryName}
      </p>

      {/* Variants Section */}
      <div className="mb-8">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Biến thể sản phẩm</h3>
        {product.variants && product.variants.length > 0 ? (
          <div className="space-y-4">
            {product.variants.map((variant, index) => (
              <div
                key={index}
                className="bg-white p-4 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200"
              >
                <p className="text-gray-700">
                  <span className="font-semibold">Màu sắc:</span>{" "}
                  {variant.color || "Không xác định"}
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">Giá cơ bản:</span>{" "}
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(variant.basePrice)}
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">Giảm giá:</span>{" "}
                  {variant.discount
                    ? new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(variant.discount)
                    : "Sản phẩm không được giảm giá"}
                </p>

                {/* Sub-Variants */}
                <div className="mt-4">
                  <h4 className="text-lg font-medium text-gray-800 mb-2">Biến thể con:</h4>
                  {variant.subVariants && variant.subVariants.length > 0 ? (
                    <div className="space-y-3">
                      {variant.subVariants.map((subVariant, subIndex) => {
                        const priceAfterDiscount =
                          variant.basePrice + subVariant.additionalPrice - (variant.discount || 0);
                        return (
                          <div
                            key={subIndex}
                            className="bg-gray-100 p-3 rounded-md border border-gray-200"
                          >
                            <p className="text-gray-700">
                              <span className="font-semibold">Thông số:</span> {subVariant.specification}
                            </p>
                            <p className="text-gray-700">
                              <span className="font-semibold">Giá trị:</span> {subVariant.value}
                            </p>
                            <p className="text-gray-700">
                              <span className="font-semibold">Giá thêm:</span>{" "}
                              {new Intl.NumberFormat("vi-VN", {
                                style: "currency",
                                currency: "VND",
                              }).format(subVariant.additionalPrice)}
                            </p>
                            <p className="text-gray-700">
                              <span className="font-semibold">Số lượng:</span> {subVariant.quantity}
                            </p>
                            <p className="text-gray-700">
                              <span className="font-semibold">Giá sau giảm:</span>{" "}
                              {new Intl.NumberFormat("vi-VN", {
                                style: "currency",
                                currency: "VND",
                              }).format(priceAfterDiscount)}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-600 ml-4">Không có biến thể con.</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">Không có biến thể nào.</p>
        )}
      </div>

      {/* Total Price */}
      <div className="mb-6 text-xl font-semibold text-gray-800 bg-white p-4 rounded-lg shadow-md">
        <span className="text-gray-600">Tổng giá (tất cả biến thể):</span>{" "}
        <span className="text-green-600">
          {new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(totalPrice)}
        </span>
      </div>

      {/* Images */}
      <div className="mb-6">
        <p className="text-lg font-semibold text-gray-800 mb-2">Ảnh:</p>
        <div className="flex flex-wrap gap-4">
          {product.img.map((imgUrl, index) => (
            <div
              key={index}
              className="w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200"
            >
              <img
                src={imgUrl}
                alt={`Product Image ${index}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Additional Info */}
      <div className="mb-6 space-y-2">
        <p className="text-lg text-gray-700">
          <span className="font-semibold">Trạng thái:</span>{" "}
          <span
            className={`inline-block px-2 py-1 rounded-full text-sm ${
              product.status ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
          >
            {product.status ? "Hoạt động" : "Vô hiệu hóa"}
          </span>
        </p>
        <p className="text-lg text-gray-700">
          <span className="font-semibold">Mô tả:</span> {product.moTa}
        </p>
      </div>

      {/* Buttons */}
      <div className="flex gap-4">
        <Link to={`/admin/dashboard/update/${id}`}>
          <Button
            type="primary"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Chỉnh sửa sản phẩm
          </Button>
        </Link>
        <Link to="/admin/dashboard">
          <Button
            type="default"
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Quay lại
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default ProductView;