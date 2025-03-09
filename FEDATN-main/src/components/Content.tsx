import React, { useState, useEffect } from "react";
import banner1 from "./img/banner mini1.png";
import banner2 from "./img/bannermini2.png";
import banner3 from "./img/banner3.png";
import { NavLink } from "react-router-dom";
import { Iproduct } from "../interface/products"; // Giả sử bạn đã định nghĩa interface Iproduct
import { getAllproducts } from "../service/products"; // Hàm gọi API để lấy danh sách sản phẩm

type Props = {};

const Content = (props: Props) => {
  const [products, setProducts] = useState<Iproduct[]>([]); // Dữ liệu sản phẩm
  const [loading, setLoading] = useState<boolean>(true); // Trạng thái loading

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const sanpham = await getAllproducts({ limit: 12, page: 1 });
        setProducts(sanpham.docs || []);
        console.log(sanpham.docs, "day");
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const truncateText = (text: string, maxLength: number): string => {
    if (text.length > maxLength) {
      return text.slice(0, maxLength) + "...";
    }
    return text;
  };

  return (
    <>
      <h2 className="font-bold text-[35px] text-center pt-[25px]">
        Sản phẩm mới
      </h2>

      <div className="pb-[30px] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6 mt-8 px-4 md:px-8 lg:px-16">
        {products
          .filter((product: Iproduct) => product.status) // Lọc sản phẩm active
          .slice(0, 12) // Hiển thị tối đa 8 sản phẩm
          .map((product: Iproduct) => (
            <article
              key={product._id}
              className="relative flex flex-col overflow-hidden rounded-lg shadow-md transition-transform transform hover:scale-105 hover:shadow-xl bg-white border border-gray-200"
            >
              {/* Hình ảnh sản phẩm */}
              <NavLink to={`/product/${product._id}`} className="block">
                <img
                  src={product.img[0]}
                  alt={product.name}
                  className="h-60 w-full object-cover transition-opacity duration-300 hover:opacity-90 border border-gray-300 rounded-lg"
                />
              </NavLink>

              {/* Thông tin sản phẩm */}
              <div className="flex flex-col p-4">
                <h2 className="text-lg font-semibold text-gray-800 truncate">
                  {product.name}
                </h2>
                <p className="text-sm text-gray-500">
                  {truncateText(product.moTa, 40)}
                </p>

                <p className="text-xl font-bold text-red-600">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(
                    product.variants && product.variants.length > 0
                      ? product.variants[0].basePrice
                      : 0
                  )}
                </p>

                {/* Nút chi tiết */}
                <NavLink
                  to={`/product/${product._id}`}
                  className="mt-4 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-yellow-500 rounded hover:bg-green-600"
                >
                  Xem chi tiết
                </NavLink>
              </div>
            </article>
          ))}
      </div>

      <div className="bannermini flex gap-2">
  <div className="banner1 flex-1">
    <img src={banner1} alt="" className="w-full h-full object-cover" />
  </div>
  <div className="banner2 flex-1">
    <img src={banner2} alt="" className="w-full h-full object-cover" />
  </div>
</div>

<div className="bannerbot pt-[20px]">
<div className="banner1 flex-1">
    <img src={banner3} alt="" className="w-full h-full " />
  </div>
</div>
    </>
  );
};

export default Content;