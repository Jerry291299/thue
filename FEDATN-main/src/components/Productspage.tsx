import React, { useEffect, useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { Iproduct, IVariant } from "../interface/products";
import { Icategory } from "../interface/category";
import { getAllproducts } from "../service/products";
import { getAllCategories } from "../service/category";
import LoadingComponent from "./Loading";
import { Pagination } from "antd";

type Props = {};

const Productspage = (props: Props) => {
  const [products, setProducts] = useState<Iproduct[]>([]);
  const [categories, setCategories] = useState<Icategory[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]); // Changed to array
  const [filterMaterial, setFilterMaterial] = useState<string>("");
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
        category:
          selectedCategories.length > 0 ? selectedCategories[0] : undefined, // Pass only the first selected category
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
  }, [selectedCategories, page.currentPage]); // Fetch products when selected categories change

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
      <div className="container mx-auto py-10 px-4 flex">
        <div className="w-1/4 pr-4 flex flex-col text-left">
          <label className="text-2xl font-bold mb-6">Lọc sản phẩm:</label>

          <label className="text-xl font-bold mb-4">Lọc theo danh mục:</label>
          {categories.length === 0 ? (
            <p className="text-gray-500">Sản phẩm chưa được cập nhật</p>
          ) : (
            categories.map((category) => (
              <div key={category._id} className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category._id)}
                  onChange={() => toggleCategory(category._id)}
                  className="mr-2"
                />
                <label>{category.name}</label>
              </div>
            ))
          )}

          

          <label className="text-xl font-bold mb-4">Lọc theo giá:</label>
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="p-2 border border-gray-300 rounded w-full mb-6"
          >
            <option value="">Tất cả giá</option>
            <option value="desc">Giá từ cao đến thấp</option>
            <option value="asc">Giá từ thấp xuống cao</option>
          </select>
        </div>

        <section className="w-3/4">
          <h1 className="text-2xl font-bold mb-6">Sản phẩm của chúng tôi</h1>

          {/* Display selected categories */}
          {selectedCategories.length > 0 && (
            <h2 className="text-xl font-semibold mb-4">
              Danh mục đang lọc:{" "}
              {categories
                .filter((c) => selectedCategories.includes(c._id))
                .map((c) => c.name)
                .join(", ") || "Tất cả"}
            </h2>
          )}

          {sortedProducts.length === 0 ? (
            <div className="text-center">
              <h2 className="text-xl font-bold mb-4">
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
                  className="bg-white border border-gray-200 rounded-lg shadow-lg hover:shadow-xl transition-all flex flex-col"
                >
                  <img
                    src={product.img[0]}
                    alt={product.name}
                    className="h-56 w-full object-cover rounded-t-lg"
                  />
                  <div className="p-4 flex-grow flex flex-col justify-between">
                    <div>
                      <h2 className="text-lg font-bold mb-2 text-gray-800">
                        {product.name}
                      </h2>
                      <p className="text-sm text-gray-500 mb-1">
                        {product.category.name}
                      </p>
                      <p className="text-sm text-gray-500 mb-2">
                        {truncateText(product.moTa, 50)}
                      </p>
                    </div>
                    <p className="text-xl font-bold text-red-600 mt-auto">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(
                        product.variants && product.variants.length > 0
                          ? product.variants[0].basePrice
                          : 0
                      )}
                    </p>
                  </div>
                  <NavLink to={`/product/${product._id}`}>
                    <div className="p-4">
                      <button className="w-full py-2 text-center bg-gray-100 rounded-lg hover:bg-gray-200">
                        Xem chi tiết
                      </button>
                    </div>
                  </NavLink>
                </article>
              ))}
            </div>
          )}

          <div className="flex justify-center mt-8">
            <Pagination
              onChange={handlePageChange}
              pageSize={pageConfig?.limit}
              total={pageConfig?.totalDocs || 0}
              current={page.currentPage}
              showSizeChanger={false}
            />
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
};

export default Productspage;
