import React, { useEffect, useState } from "react";
import { notification, Button } from "antd";
import { getProductByID} from "../../../service/products"; // Add getCategoryByID
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

        // Handle category as a string ID
        if (productData.category && typeof productData.category === "string") {
          try {
            const categoryData = await getCategoryByID(productData.category);
            setCategoryName(categoryData.name || "Không xác định");
          } catch (error) {
            console.error("Error fetching category:", error);
            setCategoryName("Không xác định");
          }
        } else if (productData.category && (productData.category as any).name) {
          // If category is somehow an object (future-proofing)
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
    return <div>Không tìm thấy sản phẩm.</div>;
  }

  // Calculate total price across all sub-variants after discount
  const totalPrice = (product.variants || []).reduce((total, variant) => {
    const variantTotal = variant.subVariants.reduce((subTotal, subVariant) => {
      const priceAfterDiscount = variant.basePrice + subVariant.additionalPrice - (variant.discount || 0);
      return subTotal + priceAfterDiscount * subVariant.quantity;
    }, 0);
    return total + variantTotal;
  }, 0);

  return (
    <div className="space-y-6 font-sans w-11/12 mx-auto p-4">
      <h2 className="text-2xl text-black mt-8">
        <strong>Tên sản phẩm:</strong> {product.name}
      </h2>
      <p>
        <strong>Danh mục:</strong> {categoryName}
      </p>

      <div>
        <h3 className="text-xl font-semibold">Biến thể sản phẩm</h3>
        {product.variants && product.variants.length > 0 ? (
          product.variants.map((variant, index) => (
            <div key={index} className="border p-4 mb-2 rounded">
              <p>
                <strong>Màu sắc:</strong> {variant.color || "Không xác định"}
              </p>
              <p>
                <strong>Giá cơ bản:</strong>{" "}
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(variant.basePrice)}
              </p>
              <p>
                <strong>Giảm giá:</strong>{" "}
                {variant.discount
                  ? new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(variant.discount)
                  : "Sản phẩm không được giảm giá"}
              </p>

              {/* Sub-Variants */}
              <div className="mt-2">
                <h4 className="text-lg font-medium">Biến thể con:</h4>
                {variant.subVariants && variant.subVariants.length > 0 ? (
                  variant.subVariants.map((subVariant, subIndex) => {
                    const priceAfterDiscount =
                      variant.basePrice + subVariant.additionalPrice - (variant.discount || 0);
                    return (
                      <div key={subIndex} className="ml-4 mt-2 border-t pt-2">
                        <p>
                          <strong>Thông số:</strong> {subVariant.specification}
                        </p>
                        <p>
                          <strong>Giá trị:</strong> {subVariant.value}
                        </p>
                        <p>
                          <strong>Giá thêm:</strong>{" "}
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(subVariant.additionalPrice)}
                        </p>
                        <p>
                          <strong>Số lượng:</strong> {subVariant.quantity}
                        </p>
                        <p>
                          <strong>Giá sau giảm:</strong>{" "}
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(priceAfterDiscount)}
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <p className="ml-4">Không có biến thể con.</p>
                )}
              </div>
            </div>
          ))
        ) : (
          <p>Không có biến thể nào.</p>
        )}
      </div>

      {/* Total Price for all variants */}
      <div className="mt-6 text-lg font-semibold text-gray-800">
        <strong>Tổng giá (tất cả biến thể):</strong>{" "}
        {new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(totalPrice)}
      </div>

      <p>
        <strong>Ảnh:</strong>
      </p>
      <div className="flex flex-wrap gap-4 mb-4">
        {product.img.map((imgUrl, index) => (
          <div key={index} className="relative w-24 h-24 md:w-32 md:h-32">
            <img
              src={imgUrl}
              alt={`Product Image ${index}`}
              className="w-full h-full object-cover rounded"
            />
          </div>
        ))}
      </div>

      <p>
        <strong>Trạng thái:</strong> {product.status ? "Hoạt động" : "Vô hiệu hóa"}
      </p>
      <p>
        <strong>Mô tả:</strong> {product.moTa}
      </p>

      <div className="space-x-2">
        <Link to={`/admin/dashboard/update/${id}`}>
          <Button type="primary" className="mb-4">
            Chỉnh sửa sản phẩm
          </Button>
        </Link>
        <Link to="/admin/dashboard">
          <Button type="default" className="mb-4">
            Quay lại
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default ProductView;