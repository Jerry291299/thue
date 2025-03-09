import React, { useEffect, useState } from "react";
import { notification, Button } from "antd";
import { getProductByID } from "../../../service/products"; // Assuming you have this service
import { Iproduct } from "../../../interface/products"; // Import Iproduct interface
import { useParams, Link } from "react-router-dom";
import LoadingComponent from "../../Loading";

const ProductView = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Iproduct | null>(null);
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

  // Calculate total price after discount
  const totalPrice = (product.variants || []).reduce((total, variant) => {
    const priceAfterDiscount = variant.basePrice - (variant.discount || 0);
    return total + priceAfterDiscount;
  }, 0);

  return (
    <div className="space-y-6 font-sans w-11/12 mx-auto p-4">
      <h2 className="text-2xl text-black mt-8">
        <strong>Tên sản phẩm :</strong> {product.name}
      </h2>
      <p>
        <strong>Danh mục:</strong> {product.category?.name}
      </p>
      

      <div>
        <h3 className="text-xl font-semibold">Biến thể sản phẩm</h3>
        {product.variants && product.variants.length > 0 ? (
          product.variants.map((variant, index) => {
            // Calculate price after discount for the current variant
            const priceAfterDiscount = variant.basePrice - (variant.discount || 0);
            return (
              <div key={index} className="border p-4 mb-2 rounded">
                <p>
                  <strong>Kích thước:</strong> {variant.size}
                </p>
                <p>
                  <strong>Số lượng:</strong> {variant.quantity}
                </p>
                <p>
                  <strong>Giá:</strong>
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(variant.basePrice)}
                </p>
                {variant.discount ? (
                  <p>
                    <strong>Giảm giá:</strong>{" "}
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(variant.discount)}{" "}
                    {/* Format discount as currency */}
                  </p>
                ) : (
                  <p>
                    <strong>Giảm giá:</strong> Sản phẩm không được giảm giá
                  </p>
                )}
                <div className="mt-6 text-lg font-semibold text-gray-800">
                  <strong>Tổng giá:</strong>
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(priceAfterDiscount)}{" "}
                  
                </div>
              </div>
            );
          })
        ) : (
          <p>Không có biến thể nào.</p>
        )}
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
        <strong>Trạng thái:</strong>{" "}
        {product.status ? "Hoạt động" : "Vô hiệu hóa"}
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
