import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  DeactivateProduct,
  ActivateProduct,
  getAllproducts,
  calculateTotalQuantity,
} from "../../service/products";
import { Iproduct } from "../../interface/products";
import { Pagination, Popconfirm } from "antd";
import LoadingComponent from "../Loading";
import { CSVLink } from "react-csv";

type Props = {};

const Dashboard = (props: Props) => {
  const [products, setProduct] = useState<Iproduct[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [filterMaterial, setFilterMaterial] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterName, setFilterName] = useState<string>("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [pageConfig, setPageConfig] = useState<any>();
  const [page, setPage] = useState<any>({
    limit: 5,
    currentPage: 1,
  });
  const [isReversed, setIsReversed] = useState(true);

  // const [modalVisible, setModalVisible] = useState<boolean>(false);
  // const [selectedProduct, setSelectedProduct] = useState<Iproduct | null>(null);
  const [priceFilterOption, setPriceFilterOption] = useState<string>(""); // Thêm trạng thái cho tùy chọn giá

  const filterByName = (products: Iproduct[], name: string): Iproduct[] => {
    return name.trim() === ""
      ? products
      : products.filter((product) =>
          product.name.toLowerCase().includes(name.toLowerCase())
        );
  };
  const fetchData = async (currentPage: number) => {
    try {
      setLoading(true);
      const data = await getAllproducts({
        limit: 1000,
        page: currentPage,
      });
      setProduct(data?.docs);
      setPageConfig(data);
      console.log(data?.docs, "data");
      console.log(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData(1);
  }, []);

  const updateProduct = (id: string) => {
    navigate(`update/${id}`);
  };

  const handlePageChange = (currentPage: number) => {
    setPage((prev: any) => {
      return { ...prev, currentPage: currentPage };
    });
    fetchData(currentPage || 0);
  };

  const toggleProductStatus = async (id: string, status: boolean) => {
    try {
      if (status) {
        await DeactivateProduct(id);
      } else {
        await ActivateProduct(id);
      }

      const updatedProducts = products.map((product) =>
        product._id === id
          ? {
              ...product,
              status: !status,
            }
          : product
      );

      setProduct(updatedProducts);
    } catch (error) {
      console.error("Error toggling product status:", error);
    }
  };


  const handleView = (id: string) => {
    navigate(`view/${id}`);
  };

  const filterByCategory = (
    products: Iproduct[],
    category: string
  ): Iproduct[] => {
    return category === ""
      ? products
      : products.filter(
          (product) =>
            product.category?.name?.toLowerCase() === category.toLowerCase()
        );
  };
  const getFilteredProducts = () => {
    let filtered = [...products];

    // Filter by material
    

    // Filter by category
    filtered = filterByCategory(filtered, selectedCategory);

    // Filter by name
    filtered = filterByName(filtered, filterName);

    // Sort by price
    if (priceFilterOption === "asc") {
      filtered.sort((a, b) => {
        const aPrice = a.variants?.[0]?.basePrice || 0;
        const bPrice = b.variants?.[0]?.basePrice || 0;
        return aPrice - bPrice;
      });
    } else if (priceFilterOption === "desc") {
      filtered.sort((a, b) => {
        const aPrice = a.variants?.[0]?.basePrice || 0;
        const bPrice = b.variants?.[0]?.basePrice || 0;
        return bPrice - aPrice;
      });
    } else if (priceFilterOption === "newest") {
      filtered.sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
        const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();
        return dateB - dateA;
      });
    }

    // Reverse the list if isReversed is true
    if (isReversed) {
      filtered.reverse();
    }

    return filtered;
  };

  const filteredProducts = Array.isArray(products)
    ? products.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const uniqueCategories = Array.from(
    new Set(products.map((product) => product.category.name))
  );
  const csvData = filteredProducts.map((products) => ({
    ID: products._id,
    "Mã sản phẩm": products.masp,
    "Tên sản phẩm": products.name,
    "Gía sản phẩm":
      products.variants && products.variants.length > 0
        ? products.variants[0].basePrice
        : 0, // Truy cập giá từ biến thể đầu tiên
    "Tên danh mục": products.category.name,
    "Số lượng sản phẩm": calculateTotalQuantity(products.variants),
    "Mô tả sản phẩm": products.moTa,
    "Anh sản phẩm": products.img,
    "Trạng thái": products.status ? "Hoạt động" : "Vô hiệu hóa",
  }));

  return (
    <>
      {loading && <LoadingComponent />}
      <div className="flex items-center justify-between px-6 h-[96px] bg-white-600 text-white"></div>
      <NavLink to={"/admin/add"}>
        <button className="focus:outline-none text-white bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-6 py-3 me-2 mb-4 transition duration-300 ease-in-out transform hover:scale-105">
          Thêm mới
        </button>
      </NavLink>
      <CSVLink
        data={csvData}
        filename={"products.csv"}
        className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-green-400"
        target="_blank"
      >
        Xuất file sản phẩm
      </CSVLink>

      <div className="mb-4 flex flex-col sm:flex-row gap-4 items-center">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="p-3 border border-gray-300 rounded-md shadow-md w-full sm:w-auto focus:ring-2 focus:ring-blue-500 transition-all"
        >
          <option value="">Danh mục</option>
          {uniqueCategories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        

        <select
          value={priceFilterOption}
          onChange={(e) => setPriceFilterOption(e.target.value)}
          className="p-3 border border-gray-300 rounded-md shadow-md w-full sm:w-auto focus:ring-2 focus:ring-blue-500 transition-all"
        >
          <option value="">Lọc theo giá</option>
          <option value="asc">Giá từ thấp đến cao</option>
          <option value="desc">Giá từ cao xuống thấp</option>
          <option value="newest">Giá mới nhất</option>
        </select>

        <input
          type="text"
          placeholder="Tìm kiếm theo tên sản phẩm"
          value={filterName}
          onChange={(e) => setFilterName(e.target.value)}
          className="p-3 border border-gray-300 rounded-md shadow-md w-full sm:w-[200px] focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="mb-8 flex flex-col w-full">
        <div className="overflow-x-auto">
          <div className="py-2 inline-block w-full">
            <div className="overflow-hidden">
              <table className="min-w-full table-auto">
                <thead className="bg-blue-500 text-white shadow-lg">
                  <tr>
                    <th className="px-6 py-4 text-sm font-semibold text-left">
                      Stt
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold text-left">
                      Mã sản phẩm
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold text-left">
                      Tên Sản Phẩm
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold text-left">
                      Giá
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold text-left">
                      Danh mục
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold text-left">
                      Số lượng
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold text-left">
                      Ảnh
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold text-left">
                      Trạng Thái
                    </th>
                    <th className="center">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredProducts().map(
                    (product: Iproduct, index: number) => (
                      <tr
                        className="bg-white border-b hover:bg-gray-50 transition-all"
                        key={product._id}
                      >
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 text-sm font-light text-gray-900">
                          {product.masp}
                        </td>
                        <td className="px-6 py-4 text-sm font-light text-gray-900">
                          {product.name}
                        </td>
                        <td className="px-6 py-4 text-sm font-light text-gray-900">
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(
                            product.variants && product.variants.length > 0
                              ? product.variants[0].basePrice
                              : 0
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm font-light text-gray-900">
                          {product?.category?.name}
                        </td>
                        
                        <td className="px-6 py-4 text-sm font-light text-gray-900">
                          {calculateTotalQuantity(product.variants)}
                        </td>
                        <td className="px-6 py-4 text-sm font-light text-gray-900">
                          <img
                            className="w-20 h-20 object-cover rounded-md shadow-md"
                            src={product?.img[0]}
                            alt=""
                          />
                        </td>
                        <td
                          className={`px-6 py-4 text-sm font-light ${
                            product.status ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {product.status ? "Hoạt động" : "Vô hiệu hóa"}
                        </td>
                        <td className="px-6 py-4 text-sm font-light text-gray-900">
                          <button
                            onClick={() => updateProduct(product._id)}
                            className="text-white bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-500 hover:to-sky-600 focus:ring-4 focus:ring-sky-300 font-medium rounded-lg text-sm px-6 py-2 me-2 mb-2 transition duration-300 ease-in-out"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleView(product._id)}
                            className="text-white bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-6 py-2 me-2 mb-2 transition duration-300 ease-in-out"
                          >
                            View
                          </button>
                          <Popconfirm
                            title="Are you sure?"
                            onConfirm={() =>
                              toggleProductStatus(product._id, product.status)
                            }
                            okText="Yes"
                            cancelText="No"
                          >
                            <button
                              className={`text-white px-6 py-2 rounded-lg text-sm font-medium transition duration-300 ease-in-out ${
                                product.status
                                  ? "bg-red-600 hover:bg-red-700"
                                  : "bg-green-600 hover:bg-green-700"
                              }`}
                            >
                              {product.status ? "Deactive" : "Active"}
                            </button>
                          </Popconfirm>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <Pagination
        align="end"
        onChange={handlePageChange}
        pageSize={pageConfig?.limit}
        total={pageConfig?.totalDocs || 0}
        current={page.currentPage}
      />
    </>
  );
};

export default Dashboard;
