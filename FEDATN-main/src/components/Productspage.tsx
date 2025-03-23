import React, { useEffect, useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { Iproduct } from "../interface/products";
import { Icategory } from "../interface/category";
import { getAllproducts } from "../service/products";
import { getAllCategories } from "../service/category";
import LoadingComponent from "./Loading";
import { Pagination } from "antd";

type Props = {};

const Productspage = (props: Props) => {
  const [products, setProducts] = useState<Iproduct[]>([]);
  const [categories, setCategories] = useState<Icategory[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<string>("");
  const { categoryName } = useParams();
  const [loading, setLoading] = useState<boolean>(false);
  const [pageConfig, setPageConfig] = useState<any>();
  const [page, setPage] = useState({ limit: 6, currentPage: 1 });

  const fetchProducts = async (currentPage: number) => {
    setLoading(true);
    try {
      const data = await getAllproducts({
        limit: page.limit,
        page: currentPage,
        category: selectedCategories.length > 0 ? selectedCategories[0] : undefined,
        admin: "true",
      });
      setProducts(data?.docs || []);
      setPageConfig(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const categoryData = await getAllCategories();
      setCategories(categoryData);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts(page.currentPage);
  }, [selectedCategories, page.currentPage]);

  const handlePageChange = (currentPage: number) => {
    setPage((prev) => ({ ...prev, currentPage }));
    fetchProducts(currentPage);
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const truncateText = (text: string, maxLength: number): string => {
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
  };

  const filterProduct = products.filter(
    (product) =>
      (selectedCategories.length === 0 ||
        selectedCategories.includes(product.category._id)) &&
      product.status
  );

  const sortedProducts = [...filterProduct].sort((a, b) => {
    const aPrices = a.variants?.map((variant) => variant.basePrice) || [];
    const bPrices = b.variants?.map((variant) => variant.basePrice) || [];

    const aMaxPrice = aPrices.length > 0 ? Math.max(...aPrices) : -Infinity;
    const bMaxPrice = bPrices.length > 0 ? Math.max(...bPrices) : -Infinity;

    const aMinPrice = aPrices.length > 0 ? Math.min(...aPrices) : Infinity;
    const bMinPrice = bPrices.length > 0 ? Math.min(...bPrices) : Infinity;

    if (sortOption === "asc") {
      return aMinPrice - bMinPrice;
    } else if (sortOption === "desc") {
      return bMaxPrice - aMaxPrice;
    } else {
      return 0;
    }
  });

  return (
    <>
      {loading && <LoadingComponent />}
      <Header />
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-8">
        {/* Filter Sidebar */}
        <aside className="w-full lg:w-1/4">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Lọc sản phẩm</h2>

          {/* Filter by Category */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Danh mục</h3>
            {categories.length === 0 ? (
              <p className="text-gray-500">Sản phẩm chưa được cập nhật</p>
            ) : (
              <div className="space-y-3">
                {categories.map((category) => (
                  <label key={category._id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category._id)}
                      onChange={() => toggleCategory(category._id)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-gray-700">{category.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Filter by Price */}
          <div>
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Giá</h3>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700"
            >
              <option value="">Tất cả giá</option>
              <option value="desc">Giá cao đến thấp</option>
              <option value="asc">Giá thấp đến cao</option>
            </select>
          </div>
        </aside>

        {/* Product List */}
        <section className="w-full lg:w-3/4">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Sản phẩm của chúng tôi</h1>

          {/* Display Selected Categories */}
          {selectedCategories.length > 0 && (
            <p className="text-lg text-gray-600 mb-4">
              Đang lọc theo:{" "}
              <span className="font-semibold">
                {categories
                  .filter((c) => selectedCategories.includes(c._id))
                  .map((c) => c.name)
                  .join(", ") || "Tất cả"}
              </span>
            </p>
          )}

          {sortedProducts.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Không tìm thấy sản phẩm
              </h2>
              <p className="text-gray-500">
                Xin lỗi, không có sản phẩm phù hợp với yêu cầu của bạn.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedProducts.map((product) => (
                <article
                  key={product._id}
                  className="bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex flex-col"
                >
                  <NavLink to={`/product/${product._id}`} className="block">
                    <img
                      src={product.img[0]}
                      alt={product.name}
                      className="h-64 w-full object-cover rounded-t-lg hover:opacity-95 transition-opacity duration-200"
                    />
                  </NavLink>
                  <div className="p-4 flex flex-col flex-grow">
                    <h2 className="text-lg font-semibold text-gray-800 truncate">
                      {product.name}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {product.category.name}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {truncateText(product.moTa, 50)}
                    </p>
                    <p className="text-xl font-bold text-red-600 mt-2">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(
                        product.variants && product.variants.length > 0
                          ? product.variants[0].basePrice
                          : 0
                      )}
                    </p>
                    <NavLink
                      to={`/product/${product._id}`}
                      className="mt-4 inline-flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-800 font-semibold rounded-lg hover:bg-gray-200 transition-colors duration-200"
                    >
                      Xem chi tiết
                    </NavLink>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Pagination */}
          <div className="flex justify-center mt-10">
            <Pagination
              onChange={handlePageChange}
              pageSize={pageConfig?.limit}
              total={pageConfig?.totalDocs || 0}
              current={page.currentPage}
              showSizeChanger={false}
              className="pagination-custom"
            />
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default Productspage;